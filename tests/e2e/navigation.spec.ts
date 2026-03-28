import { test, expect } from "@playwright/test";

// Complete profile to bypass gates
const completeProfile = {
  name: "Test User",
  currentRole: "Product Manager",
  currentCompany: "Test Corp",
  yearsExperience: "5",
  companyTypes: ["B2B SaaS"],
  productsShipped: "3",
  keyMetrics: "DAU, Revenue",
  frameworks: ["RICE"],
};

async function setupWithProfile(page: import("@playwright/test").Page, route: string) {
  await page.goto(route);
  await page.evaluate((profile) => {
    localStorage.setItem("pmguide-profile", JSON.stringify(profile));
  }, completeProfile);
  await page.reload();
  await page.waitForLoadState("networkidle");
}

test.describe("Dashboard", () => {
  test("loads with all section cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("dashboard-card-about-me")).toBeVisible();
    await expect(page.getByTestId("dashboard-card-resume")).toBeVisible();
  });

  test("clicking About Me card navigates to /about-me", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("dashboard-card-about-me").click();
    await expect(page).toHaveURL(/\/about-me/);
  });

  test("clicking Resume card navigates to /resume", async ({ page }) => {
    await setupWithProfile(page, "/");
    await page.getByTestId("dashboard-card-resume").click();
    await expect(page).toHaveURL(/\/resume/);
  });
});

test.describe("Feature pages load", () => {
  test("/outreach shows outreach page", async ({ page }) => {
    await setupWithProfile(page, "/outreach");
    await expect(page.getByTestId("outreach-page")).toBeVisible();
  });

  test("/negotiate shows negotiate page", async ({ page }) => {
    await setupWithProfile(page, "/negotiate");
    await expect(page.getByTestId("negotiate-page")).toBeVisible();
  });
});

test.describe("Interview page loads", () => {
  test("/interview shows setup UI", async ({ page }) => {
    await setupWithProfile(page, "/interview");
    await expect(page.getByTestId("interview-page")).toBeVisible();
  });
});

test.describe("Sidebar navigation (desktop)", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("sidebar is visible and navigates correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("sidebar")).toBeVisible();

    // About Me is always unlocked
    await page.getByTestId("nav-about-me").click();
    await expect(page).toHaveURL(/\/about-me/);
  });

  test("resume nav is locked when profile incomplete", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("nav-resume-locked")).toBeVisible();
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile nav is visible on small viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-nav")).toBeVisible();
  });

  test("sidebar is hidden on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("sidebar")).toBeHidden();
  });
});
