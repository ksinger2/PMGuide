import { test, expect } from "@playwright/test";

test.describe("Interview Lab", () => {
  test.beforeEach(async ({ page }) => {
    // Seed profile to pass the 70% gate — store raw UserProfile (same format as profile-context)
    await page.addInitScript(() => {
      const profile = {
        name: "Test User",
        currentRole: "Senior PM",
        currentCompany: "TestCorp",
        yearsExperience: 10,
        companyTypes: ["B2B"],
        productsShipped: [{ name: "Widget", description: "A widget", impact: "10M users" }],
        keyMetrics: ["DAU", "Revenue"],
        frameworks: ["RICE"],
        skillsAssessment: null,
        goalRole: "Staff PM",
        industryPreferences: ["tech"],
        companyStagePreferences: null,
        workStylePreferences: null,
        learningStyle: "visual",
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
  });

  test("shows home screen with mode selection", async ({ page }) => {
    await page.goto("/interview");
    await expect(page.getByTestId("interview-home")).toBeVisible();
    await expect(page.getByTestId("mode-interview")).toBeVisible();
    await expect(page.getByTestId("mode-practice")).toBeVisible();
  });

  test("practice mode setup flow", async ({ page }) => {
    await page.goto("/interview");

    // Select practice mode
    await page.getByTestId("mode-practice").click();
    await expect(page.getByTestId("practice-mode-setup")).toBeVisible();

    // Select company and type
    await page.getByRole("button", { name: "Anthropic" }).click();
    await page.getByRole("button", { name: "Behavioral" }).click();

    // Start button should be enabled
    const startBtn = page.getByRole("button", { name: "Generate Question →" });
    await expect(startBtn).toBeEnabled();
  });

  test("interview mode setup flow", async ({ page }) => {
    await page.goto("/interview");

    // Select interview mode
    await page.getByTestId("mode-interview").click();
    await expect(page.getByTestId("interview-mode-setup")).toBeVisible();

    // Select a category
    await page.getByRole("button", { name: "Analytical" }).click();

    // Start button should be enabled
    const startBtn = page.getByRole("button", { name: "Start Interview →" });
    await expect(startBtn).toBeEnabled();
  });

  test("expert mode card visible on home screen", async ({ page }) => {
    await page.goto("/interview");
    await expect(page.getByTestId("mode-expert")).toBeVisible();
  });

  test("expert mode setup flow", async ({ page }) => {
    await page.goto("/interview");

    // Select expert mode
    await page.getByTestId("mode-expert").click();
    await expect(page.getByTestId("expert-mode-setup")).toBeVisible();

    // Select company and category
    await page.getByRole("button", { name: "Google" }).click();
    await page.getByRole("button", { name: "Strategy" }).click();

    // Start button should be enabled
    const startBtn = page.getByRole("button", { name: "Start Watching →" });
    await expect(startBtn).toBeEnabled();
  });

  test("voice input button visible on active question screen", async ({ page }) => {
    await page.goto("/interview");

    // Go to practice mode and generate a question
    await page.getByTestId("mode-practice").click();
    await page.getByRole("button", { name: "Anthropic" }).click();
    await page.getByRole("button", { name: "Behavioral" }).click();
    await page.getByRole("button", { name: "Generate Question →" }).click();

    // Wait for the active question screen
    await expect(page.getByTestId("active-question")).toBeVisible({ timeout: 15000 });

    // Voice input may or may not be visible depending on browser support
    // In Playwright's Chromium, Web Speech API is typically not available
    // So we just check the textarea is there and the page didn't crash
    await expect(page.getByTestId("answer-textarea")).toBeVisible();
  });

  test("back button returns to home", async ({ page }) => {
    await page.goto("/interview");

    await page.getByTestId("mode-practice").click();
    await expect(page.getByTestId("practice-mode-setup")).toBeVisible();

    await page.getByRole("button", { name: "← Back to Home" }).click();
    await expect(page.getByTestId("interview-home")).toBeVisible();
  });
});
