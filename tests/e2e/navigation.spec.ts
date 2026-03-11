import { test, expect } from "@playwright/test";

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
    await page.goto("/");
    await page.getByTestId("dashboard-card-resume").click();
    await expect(page).toHaveURL(/\/resume/);
  });
});

test.describe("Stub pages show Coming Soon", () => {
  const stubRoutes = ["/outreach", "/negotiate"];

  for (const route of stubRoutes) {
    test(`${route} shows Coming Soon`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByTestId("coming-soon")).toBeVisible();
    });
  }
});

test.describe("Interview page loads", () => {
  test("/interview shows setup UI", async ({ page }) => {
    await page.goto("/interview");
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
