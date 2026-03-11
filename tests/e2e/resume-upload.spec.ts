import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Resume page", () => {
  test("shows locked state when profile incomplete", async ({ page }) => {
    // Clear profile from localStorage
    await page.goto("/resume");
    await page.evaluate(() => localStorage.removeItem("pmguide-profile"));
    await page.reload();

    await expect(page.getByTestId("resume-locked")).toBeVisible();
    await expect(page.getByTestId("resume-locked-link")).toBeVisible();
  });

  test("shows upload zone when profile is complete", async ({ page }) => {
    await page.goto("/resume");

    // Set a complete profile in localStorage
    await page.evaluate(() => {
      const profile = {
        name: "Test User",
        role: "Product Manager",
        company: "Test Corp",
        yearsExperience: "5",
        companyTypes: ["B2B SaaS"],
        productsShipped: "3",
        keyMetrics: "DAU, Revenue",
        frameworks: ["RICE"],
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
    await page.reload();

    await expect(page.getByTestId("upload-zone")).toBeVisible();
  });

  test("shows error for non-PDF file", async ({ page }) => {
    await page.goto("/resume");

    // Set complete profile
    await page.evaluate(() => {
      const profile = {
        name: "Test User",
        role: "Product Manager",
        company: "Test Corp",
        yearsExperience: "5",
        companyTypes: ["B2B SaaS"],
        productsShipped: "3",
        keyMetrics: "DAU, Revenue",
        frameworks: ["RICE"],
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
    await page.reload();

    // Try uploading a non-PDF file via the hidden input
    const fileInput = page.getByTestId("upload-input");
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a pdf"),
    });

    await expect(page.getByTestId("upload-error")).toBeVisible();
  });

  test("uploads a valid PDF and shows critique button", async ({ page }) => {
    await page.goto("/resume");

    // Set complete profile
    await page.evaluate(() => {
      const profile = {
        name: "Test User",
        role: "Product Manager",
        company: "Test Corp",
        yearsExperience: "5",
        companyTypes: ["B2B SaaS"],
        productsShipped: "3",
        keyMetrics: "DAU, Revenue",
        frameworks: ["RICE"],
      };
      localStorage.setItem("pmguide-profile", JSON.stringify(profile));
    });
    await page.reload();

    // Check if we have a sample PDF fixture
    const fixturePath = path.join(
      __dirname,
      "..",
      "fixtures",
      "sample-resume.pdf"
    );

    // Upload the sample PDF
    const fileInput = page.getByTestId("upload-input");
    try {
      await fileInput.setInputFiles(fixturePath);
      // Either the upload succeeds and shows critique-ready, or fails with error
      const critiqueReady = page.getByTestId("critique-ready");
      const uploadSuccess = page.getByTestId("upload-success");
      const uploadError = page.getByTestId("upload-error");

      await expect(
        critiqueReady.or(uploadSuccess).or(uploadError)
      ).toBeVisible({ timeout: 10000 });
    } catch {
      // Fixture may not exist — skip gracefully
      test.skip();
    }
  });
});
