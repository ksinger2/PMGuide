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
  industryPreferences: ["tech"],
  companyStagePreferences: null,
  workStylePreferences: null,
  learningStyle: "visual",
};

const incompleteProfile = {
  name: "Test User",
  currentRole: null,
  currentCompany: null,
  yearsExperience: null,
  companyTypes: [],
  productsShipped: [],
  keyMetrics: [],
  frameworks: [],
  skillsAssessment: null,
  goalRole: null,
  industryPreferences: null,
  companyStagePreferences: null,
  workStylePreferences: null,
  learningStyle: null,
};

// ---------------------------------------------------------------------------
// Tests: Profile Gate
// ---------------------------------------------------------------------------

test.describe("Negotiate - Profile Gate", () => {
  test("shows locked state when profile is incomplete", async ({ page }) => {
    // Seed incomplete profile
    await page.addInitScript(() => {
      const profile = {
        name: "Test User",
        currentRole: null,
        currentCompany: null,
        yearsExperience: null,
        companyTypes: [],
        productsShipped: [],
        keyMetrics: [],
        frameworks: [],
        skillsAssessment: null,
        goalRole: null,
        industryPreferences: null,
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: null,
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });

    await page.goto("/negotiate");

    // Should show the gated/locked state (use heading to be specific)
    await expect(page.getByRole("heading", { name: "Profile Required" })).toBeVisible();
    await expect(page.getByText("Complete at least 70%")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue in About Me" })).toBeVisible();

    // Negotiate page content should NOT be visible
    await expect(page.getByTestId("negotiate-home")).not.toBeVisible();
  });

  test("shows negotiate page when profile is complete", async ({ page }) => {
    // Seed complete profile
    await page.addInitScript(() => {
      const profile = {
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
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });

    await page.goto("/negotiate");

    // Should show the negotiate home screen
    await expect(page.getByTestId("negotiate-home")).toBeVisible();
    await expect(page.getByText("Profile Required")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests: Mode Selection Home Screen
// ---------------------------------------------------------------------------

test.describe("Negotiate - Mode Selection Home", () => {
  test.beforeEach(async ({ page }) => {
    // Seed complete profile to pass the gate
    await page.addInitScript(() => {
      const profile = {
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
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
  });

  test("renders home screen with all 6 mode cards", async ({ page }) => {
    await page.goto("/negotiate");

    await expect(page.getByTestId("negotiate-home")).toBeVisible();

    // All 6 mode cards should be visible
    await expect(page.getByTestId("mode-simulator")).toBeVisible();
    await expect(page.getByTestId("mode-expert")).toBeVisible();
    await expect(page.getByTestId("mode-coach")).toBeVisible();
    await expect(page.getByTestId("mode-tips")).toBeVisible();
    await expect(page.getByTestId("mode-calculator")).toBeVisible();
    await expect(page.getByTestId("mode-crafter")).toBeVisible();
  });

  test("mode cards display correct titles", async ({ page }) => {
    await page.goto("/negotiate");

    await expect(page.getByText("Negotiation Simulator")).toBeVisible();
    await expect(page.getByText("Watch the Expert")).toBeVisible();
    await expect(page.getByText("Chat with Coach")).toBeVisible();
    await expect(page.getByText("Tips & Frameworks")).toBeVisible();
    await expect(page.getByText("Offer Calculator")).toBeVisible();
    await expect(page.getByText("Response Crafter")).toBeVisible();
  });

  test("clicking Tips mode navigates to tips browser", async ({ page }) => {
    await page.goto("/negotiate");

    await page.getByTestId("mode-tips").click();
    await expect(page.getByTestId("tips-browser")).toBeVisible();
  });

  test("clicking Calculator mode navigates to offer calculator", async ({ page }) => {
    await page.goto("/negotiate");

    await page.getByTestId("mode-calculator").click();
    await expect(page.getByTestId("offer-calculator")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests: Tips Browser
// ---------------------------------------------------------------------------

test.describe("Negotiate - Tips Browser", () => {
  test.beforeEach(async ({ page }) => {
    // Seed complete profile
    await page.addInitScript(() => {
      const profile = {
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
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
  });

  test("renders tips browser with category sidebar", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    await expect(page.getByTestId("tips-browser")).toBeVisible();
    await expect(page.getByText("Tips & Frameworks")).toBeVisible();
    await expect(page.getByText("Master the tactics, frameworks, and psychology")).toBeVisible();
  });

  test("displays tip cards for default category (tactics)", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Should show tactics tips by default (first category)
    await expect(page.getByTestId("tip-mirroring")).toBeVisible();
    await expect(page.getByTestId("tip-labeling")).toBeVisible();
    await expect(page.getByTestId("tip-calibrated-questions")).toBeVisible();
    await expect(page.getByTestId("tip-ackerman")).toBeVisible();
  });

  test("category filtering works - switching to Comp Structure (desktop)", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only test - mobile uses dropdown");
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Click on Comp Structure category (desktop sidebar button)
    await page.getByRole("button", { name: /Comp Structure/i }).click();

    // Should show comp-related tips
    await expect(page.getByTestId("tip-rsu-vs-options")).toBeVisible();
    await expect(page.getByTestId("tip-vesting-schedules")).toBeVisible();
    await expect(page.getByTestId("tip-refreshers")).toBeVisible();

    // Tactics tips should no longer be visible
    await expect(page.getByTestId("tip-mirroring")).not.toBeVisible();
  });

  test("category filtering works - switching to Psychology (desktop)", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only test - mobile uses dropdown");
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Click on Psychology category (desktop sidebar button)
    await page.getByRole("button", { name: /Psychology/i }).click();

    // Should show psychology-related tips
    await expect(page.getByTestId("tip-anchoring")).toBeVisible();
    await expect(page.getByTestId("tip-power-of-no")).toBeVisible();
  });

  test("category filtering works - switching to Anti-Patterns (desktop)", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only test - mobile uses dropdown");
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Click on Anti-Patterns category (desktop sidebar button)
    await page.getByRole("button", { name: /Anti-Patterns/i }).click();

    // Should show mistakes tip
    await expect(page.getByTestId("tip-mistakes-overview")).toBeVisible();
  });

  test("tip card expands on click to show content", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    const mirroringCard = page.getByTestId("tip-mirroring");
    await expect(mirroringCard).toBeVisible();

    // Click to expand
    await mirroringCard.click();

    // Should show expanded content with examples
    await expect(page.getByText("How it works:")).toBeVisible();
    await expect(page.getByText("Quick Examples")).toBeVisible();
  });

  test("back button returns to home", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    await expect(page.getByTestId("tips-browser")).toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /Back to home/i }).click();

    // Should be back at home screen
    await expect(page.getByTestId("negotiate-home")).toBeVisible();
    await expect(page.getByTestId("tips-browser")).not.toBeVisible();
  });

  test("Try in Simulator button navigates to simulator (desktop)", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only test - button is in sidebar");
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Click "Try in Simulator" button (desktop sidebar)
    await page.getByRole("button", { name: /Try in Simulator/i }).click();

    // Should no longer be in tips browser (navigated to simulator setup)
    await expect(page.getByTestId("tips-browser")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests: Offer Calculator
// ---------------------------------------------------------------------------

test.describe("Negotiate - Offer Calculator", () => {
  test.beforeEach(async ({ page }) => {
    // Seed complete profile
    await page.addInitScript(() => {
      const profile = {
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
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
  });

  test("renders offer calculator with input fields", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    await expect(page.getByTestId("offer-calculator")).toBeVisible();
    await expect(page.getByText("Offer Calculator")).toBeVisible();
    await expect(page.getByText("Compare offers side-by-side")).toBeVisible();
  });

  test("renders with two offer columns by default", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Should have two offer input sections (Offer A and Offer B)
    await expect(page.getByPlaceholder("Offer name")).toHaveCount(2);
    await expect(page.getByPlaceholder("e.g. Google")).toHaveCount(2);
  });

  test("offer column has all required input fields", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Check for input field labels within the calculator (use more specific selectors)
    const calculator = page.getByTestId("offer-calculator");
    await expect(calculator.getByText("Base Salary")).toHaveCount(2);
    await expect(calculator.getByText("Total Equity (over vesting period)")).toHaveCount(2);
    await expect(calculator.getByText("Vesting Period (years)")).toHaveCount(2);
    await expect(calculator.getByText("Sign-on Bonus")).toHaveCount(2);
    await expect(calculator.getByText("Annual Bonus")).toHaveCount(2);
  });

  test("Add Offer button adds a new offer column", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Initially 2 offer columns
    await expect(page.getByPlaceholder("Offer name")).toHaveCount(2);

    // Click Add Offer
    await page.getByRole("button", { name: "+ Add Offer" }).click();

    // Now 3 offer columns
    await expect(page.getByPlaceholder("Offer name")).toHaveCount(3);
  });

  test("can add up to 4 offers maximum", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Add 2 more offers (starting from 2)
    await page.getByRole("button", { name: "+ Add Offer" }).click();
    await page.getByRole("button", { name: "+ Add Offer" }).click();

    // Should have 4 offer columns
    await expect(page.getByPlaceholder("Offer name")).toHaveCount(4);

    // Add Offer button should be hidden when at max
    await expect(page.getByRole("button", { name: "+ Add Offer" })).not.toBeVisible();
  });

  test("comparison table appears when offers have base salary filled", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Fill in base salary for both offers
    const baseSalaryInputs = page.getByPlaceholder("200000");
    await baseSalaryInputs.first().fill("200000");
    await baseSalaryInputs.last().fill("220000");

    // Comparison table should appear
    await expect(page.getByText("Annual TC")).toBeVisible();
    await expect(page.getByText("Year 1 TC")).toBeVisible();
    await expect(page.getByText("4-Year Total")).toBeVisible();
    await expect(page.getByText("NPV (8%)")).toBeVisible();
  });

  test("filling offer details updates comparison display", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Fill Offer A
    const offerNames = page.getByPlaceholder("Offer name");
    await offerNames.first().fill("Google");

    const companyInputs = page.getByPlaceholder("e.g. Google");
    await companyInputs.first().fill("Google");

    const baseInputs = page.getByPlaceholder("200000");
    await baseInputs.first().fill("200000");

    // Fill Offer B
    await offerNames.last().fill("Meta");
    await companyInputs.last().fill("Meta");
    await baseInputs.last().fill("220000");

    // Comparison metrics should be visible
    await expect(page.getByText("Annual TC")).toBeVisible();
    await expect(page.getByText("COL-Adjusted TC")).toBeVisible();
  });

  test("Get AI Analysis button appears when offers are filled", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Fill base salaries
    const baseSalaryInputs = page.getByPlaceholder("200000");
    await baseSalaryInputs.first().fill("200000");
    await baseSalaryInputs.last().fill("220000");

    // AI Analysis section should appear (use heading to be specific)
    await expect(page.getByRole("heading", { name: "AI Analysis" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get AI Analysis" })).toBeVisible();
  });

  test("back button returns to home", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    await expect(page.getByTestId("offer-calculator")).toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /Back to home/i }).click();

    // Should be back at home screen
    await expect(page.getByTestId("negotiate-home")).toBeVisible();
    await expect(page.getByTestId("offer-calculator")).not.toBeVisible();
  });

  test("location dropdown has options", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    // Get first location dropdown
    const locationSelect = page.locator("select").first();

    // Check it has San Francisco as default/option
    await expect(locationSelect).toHaveValue("San Francisco");
  });
});

// ---------------------------------------------------------------------------
// Tests: Mobile Responsiveness
// ---------------------------------------------------------------------------

test.describe("Negotiate - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const profile = {
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
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
  });

  test("mode cards render on mobile", async ({ page }) => {
    await page.goto("/negotiate");

    await expect(page.getByTestId("negotiate-home")).toBeVisible();
    await expect(page.getByTestId("mode-simulator")).toBeVisible();
    await expect(page.getByTestId("mode-tips")).toBeVisible();
    await expect(page.getByTestId("mode-calculator")).toBeVisible();
  });

  test("tips browser renders on mobile with category select", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    await expect(page.getByTestId("tips-browser")).toBeVisible();
    // Mobile uses a select dropdown instead of sidebar buttons
    await expect(page.locator("select")).toBeVisible();
  });

  test("mobile category filtering works via dropdown", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-tips").click();

    // Default shows tactics tips
    await expect(page.getByTestId("tip-mirroring")).toBeVisible();

    // Use dropdown to switch to comp category
    await page.locator("select").selectOption("comp");

    // Should show comp-related tips
    await expect(page.getByTestId("tip-rsu-vs-options")).toBeVisible();
    await expect(page.getByTestId("tip-vesting-schedules")).toBeVisible();

    // Tactics tips should no longer be visible
    await expect(page.getByTestId("tip-mirroring")).not.toBeVisible();
  });

  test("offer calculator renders on mobile", async ({ page }) => {
    await page.goto("/negotiate");
    await page.getByTestId("mode-calculator").click();

    await expect(page.getByTestId("offer-calculator")).toBeVisible();
    // Should still have the offer input fields
    await expect(page.getByPlaceholder("Offer name")).toHaveCount(2);
  });
});
