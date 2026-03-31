import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const completeProfile = {
  name: "Test User",
  currentRole: "Product Manager",
  currentCompany: "Test Corp",
  yearsExperience: 5,
  companyTypes: ["B2B SaaS"],
  productsShipped: [
    { name: "Product A", description: "A product", impact: "Grew DAU 20%" },
    { name: "Product B", description: "B product", impact: "Increased revenue" },
    { name: "Product C", description: "C product", impact: "Reduced churn" },
  ],
  keyMetrics: ["DAU", "Revenue"],
  frameworks: ["RICE"],
  skillsAssessment: null,
  goalRole: "Senior PM",
  industryPreferences: null,
  companyStagePreferences: null,
  workStylePreferences: null,
  learningStyle: null,
};

const mockUploadData = {
  resumeId: "test-resume-123",
  extractedText: "Senior Product Manager with 5 years experience...",
  pageCount: 1,
  sections: [
    {
      type: "contact",
      title: "Contact",
      content: "Test User\ntest@example.com",
      startLine: 1,
      endLine: 2,
    },
    {
      type: "experience",
      title: "Experience",
      content: "Senior PM at Test Corp...",
      startLine: 3,
      endLine: 10,
    },
  ],
  metadata: {
    fileName: "resume.pdf",
    fileSize: 50000,
    uploadedAt: "2026-03-11T00:00:00Z",
  },
};

const mockCritiqueFindings = [
  {
    id: "f-001",
    severity: "high" as const,
    category: "impact_metrics",
    title: "Missing quantified outcomes",
    description: "Several bullets lack specific metrics.",
  },
];

const mockGenerateResult = {
  content: {
    sections: [
      { type: "contact", title: "Contact", content: "Test User\ntest@example.com" },
      { type: "experience", title: "Experience", content: "Led product strategy driving 40% growth..." },
    ],
    fullText: "Test User\ntest@example.com\n\nExperience\nLed product strategy driving 40% growth...",
  },
  changes: [
    {
      sectionType: "experience",
      original: "Worked on product strategy",
      improved: "Led product strategy driving 40% growth",
      reason: "Added quantified outcome",
    },
  ],
};

const mockBranch = {
  id: "branch-test-1",
  jobUrl: "https://example.com/job/1",
  jobTitle: "Senior PM - Growth",
  company: "Acme Inc",
  jobDescriptionText: "We are looking for a Senior PM to lead growth...",
  content: mockGenerateResult.content,
  suggestions: [
    {
      id: "s-1",
      sectionType: "experience",
      original: "Led product strategy driving 40% growth",
      suggested: "Spearheaded growth strategy increasing MAU 40% in 6 months",
      reason: "Aligns with JD emphasis on growth metrics",
      status: "pending" as const,
    },
    {
      id: "s-2",
      sectionType: "experience",
      original: "Managed cross-functional team",
      suggested: "Orchestrated cross-functional squad of 8 engineers and 2 designers",
      reason: "JD requires team leadership experience",
      status: "pending" as const,
    },
  ],
  chatHistory: [
    {
      id: "msg-init",
      role: "assistant" as const,
      content: "I've tailored your resume for the Senior PM - Growth position at Acme Inc.",
    },
  ],
  keywordAlignment: {
    matched: ["product strategy", "growth", "cross-functional"],
    missing: ["A/B testing", "retention"],
    added: ["MAU", "squad"],
  },
  createdAt: "2026-03-11T00:00:00Z",
  updatedAt: "2026-03-11T00:00:00Z",
};

const mockBranch2 = {
  ...mockBranch,
  id: "branch-test-2",
  jobTitle: "Staff PM - Platform",
  company: "BigTech Co",
  jobDescriptionText: "Looking for a Staff PM to own the developer platform...",
  suggestions: [],
  chatHistory: [],
  keywordAlignment: { matched: ["platform"], missing: ["API"], added: [] },
};

// ---------------------------------------------------------------------------
// Helper: inject all resume state into localStorage, reload, and wait
// ---------------------------------------------------------------------------

async function setupResumePage(
  page: import("@playwright/test").Page,
  opts?: {
    branches?: typeof mockBranch[];
    activeBranchId?: string;
    skipGenerate?: boolean;
  }
) {
  // Navigate to a blank page first to set up localStorage before the resume page loads
  await page.goto("/");
  await page.evaluate(
    ({ profile, upload, critique, generate, branches, activeBranchId, skipGenerate }) => {
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
      localStorage.setItem("pmguide-resume-upload", JSON.stringify(upload));
      localStorage.setItem("pmguide-resume-critique", JSON.stringify(critique));
      if (!skipGenerate) {
        localStorage.setItem("pmguide-resume-generate", JSON.stringify(generate));
      }
      if (branches) {
        localStorage.setItem(
          "pmguide-resume-branches",
          JSON.stringify({ branches, activeBranchId: activeBranchId ?? branches[0]?.id ?? null })
        );
      }
    },
    {
      profile: completeProfile,
      upload: mockUploadData,
      critique: mockCritiqueFindings,
      generate: mockGenerateResult,
      branches: opts?.branches,
      activeBranchId: opts?.activeBranchId,
      skipGenerate: opts?.skipGenerate,
    }
  );

  // Now navigate to resume page - localStorage is already set
  await page.goto("/resume");
  await page.waitForLoadState("networkidle");

  // Wait for the upload summary to appear - this proves localStorage data was hydrated
  // The upload summary shows the filename, which only renders when uploadData is loaded
  await page.getByText("resume.pdf").waitFor({ state: "visible", timeout: 10000 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Resume branching", () => {
  test("branch manager is visible after critique (no generate required)", async ({ page }) => {
    await setupResumePage(page, { skipGenerate: true });
    await expect(page.getByTestId("branch-manager")).toBeVisible();
  });

  test("branch URL input renders with field and button", async ({ page }) => {
    await setupResumePage(page);
    await expect(page.getByTestId("branch-url-input")).toBeVisible();
    await expect(page.getByTestId("branch-url-field")).toBeVisible();
    await expect(page.getByTestId("branch-create-btn")).toBeVisible();
  });

  test("paste fallback appears when clicked", async ({ page }) => {
    await setupResumePage(page);

    // Initially hidden
    await expect(page.getByTestId("branch-paste-field")).not.toBeVisible();

    // Click the paste fallback link
    await page.getByText("Or paste the job description").click();

    await expect(page.getByTestId("branch-paste-field")).toBeVisible();
    await expect(page.getByTestId("branch-paste-submit")).toBeVisible();
  });

  test("branch tabs render from localStorage state", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch, mockBranch2],
      activeBranchId: mockBranch.id,
    });

    await expect(page.getByTestId("branch-tabs")).toBeVisible();
    await expect(page.getByTestId(`branch-tab-${mockBranch.id}`)).toBeVisible();
    await expect(page.getByTestId(`branch-tab-${mockBranch2.id}`)).toBeVisible();
  });

  test("clicking a tab switches the active branch", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch, mockBranch2],
      activeBranchId: mockBranch.id,
    });

    // First branch panel is visible
    await expect(page.getByTestId(`branch-panel-${mockBranch.id}`)).toBeVisible();

    // Click second tab
    await page.getByTestId(`branch-tab-${mockBranch2.id}`).click();

    // Second branch panel is now visible
    await expect(page.getByTestId(`branch-panel-${mockBranch2.id}`)).toBeVisible();
  });

  test("closing a tab removes the branch", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch, mockBranch2],
      activeBranchId: mockBranch.id,
    });

    // Both tabs exist
    await expect(page.getByTestId(`branch-tab-${mockBranch.id}`)).toBeVisible();
    await expect(page.getByTestId(`branch-tab-${mockBranch2.id}`)).toBeVisible();

    // Hover the tab to reveal the close button (opacity-0 → opacity-100 on hover)
    await page.getByTestId(`branch-tab-${mockBranch.id}`).hover();
    await page.getByTestId(`branch-close-${mockBranch.id}`).click();

    // First tab gone, second still exists
    await expect(page.getByTestId(`branch-tab-${mockBranch.id}`)).not.toBeVisible();
    await expect(page.getByTestId(`branch-tab-${mockBranch2.id}`)).toBeVisible();
  });

  test("suggestion cards render with accept/reject buttons", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    await expect(page.getByTestId("suggestion-list")).toBeVisible();
    await expect(page.getByTestId("suggestion-s-1")).toBeVisible();
    await expect(page.getByTestId("suggestion-s-2")).toBeVisible();
    await expect(page.getByTestId("suggestion-accept-s-1")).toBeVisible();
    await expect(page.getByTestId("suggestion-reject-s-1")).toBeVisible();
  });

  test("accepting a suggestion changes its visual state", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    const card = page.getByTestId("suggestion-s-1");
    const acceptBtn = page.getByTestId("suggestion-accept-s-1");

    // Initially pending (neutral border)
    await expect(card).toBeVisible();

    // Accept
    await acceptBtn.click();

    // Button should now have the accepted style (green background)
    await expect(acceptBtn).toHaveClass(/bg-green-500/);
  });

  test("rejecting a suggestion changes its visual state", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    const rejectBtn = page.getByTestId("suggestion-reject-s-1");
    await rejectBtn.click();

    await expect(rejectBtn).toHaveClass(/bg-red-500/);
  });

  test("Accept All marks all suggestions as accepted", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    await page.getByTestId("suggestion-accept-all").click();

    // Both accept buttons should show accepted state
    await expect(page.getByTestId("suggestion-accept-s-1")).toHaveClass(/bg-green-500/);
    await expect(page.getByTestId("suggestion-accept-s-2")).toHaveClass(/bg-green-500/);
  });

  test("Reject All marks all suggestions as rejected", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    await page.getByTestId("suggestion-reject-all").click();

    await expect(page.getByTestId("suggestion-reject-s-1")).toHaveClass(/bg-red-500/);
    await expect(page.getByTestId("suggestion-reject-s-2")).toHaveClass(/bg-red-500/);
  });

  test("branch chat renders with input", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    await expect(page.getByTestId("branch-chat")).toBeVisible();
    await expect(page.getByTestId("chat-input-field")).toBeVisible();
  });

  test("keyword alignment badges display correctly", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    const panel = page.getByTestId(`branch-panel-${mockBranch.id}`);
    await expect(panel.getByText("3 matched")).toBeVisible();
    await expect(panel.getByText("2 missing")).toBeVisible();
    await expect(panel.getByText("2 added")).toBeVisible();
  });
});

test.describe("Resume branching — branch limit", () => {
  test("shows limit message at 5 branches", async ({ page }) => {
    const fiveBranches = Array.from({ length: 5 }, (_, i) => ({
      ...mockBranch,
      id: `branch-${i}`,
      jobTitle: `Job ${i + 1}`,
      company: `Company ${i + 1}`,
      suggestions: [],
    }));

    await setupResumePage(page, {
      branches: fiveBranches,
      activeBranchId: "branch-0",
    });

    // URL input should show limit message instead
    await expect(page.getByText(`Maximum 5 branches reached`)).toBeVisible();
  });
});

test.describe("Resume state persistence", () => {
  test("resume flow state survives page refresh", async ({ page }) => {
    await setupResumePage(page);

    // Upload summary should be visible (from persisted uploadData)
    await expect(page.getByText("resume.pdf")).toBeVisible();

    // Branch manager should be visible (from persisted generateResult)
    await expect(page.getByTestId("branch-manager")).toBeVisible();
  });
});

test.describe("Resume branching — mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("branch components render on mobile", async ({ page }) => {
    await setupResumePage(page, {
      branches: [mockBranch],
    });

    await expect(page.getByTestId("branch-manager")).toBeVisible();
    await expect(page.getByTestId("branch-tabs")).toBeVisible();
    await expect(page.getByTestId("suggestion-list")).toBeVisible();
    await expect(page.getByTestId("branch-chat")).toBeVisible();
  });
});
