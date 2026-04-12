/**
 * E2E Test — Upload Journey
 *
 * Critical user flow: Navigate to the Upload page → verify UI →
 * interact with the document name input → verify upload button
 * state → navigate to the Document Gallery.
 *
 * NOTE: Actual file upload triggers Auth0 session checks via
 * the /api/upload route handler. Without a valid session, the
 * upload will return 401. These tests focus on the UI interactions
 * that are testable without authentication.
 */

import { test, expect } from "@playwright/test";

test.describe("Upload Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/uploadpage");
  });

  // ─── PAGE RENDERING ─────────────────────────────────────────

  test("renders Upload page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Upload Your File Here/i })
    ).toBeVisible();
  });

  test("renders description text", async ({ page }) => {
    await expect(
      page.getByText(/Upload your document once/)
    ).toBeVisible();
  });

  test("renders UPLOAD button", async ({ page }) => {
    await expect(page.getByText("UPLOAD")).toBeVisible();
  });

  test("renders Doc Gallery button", async ({ page }) => {
    await expect(page.getByText("Doc Gallery")).toBeVisible();
  });

  // ─── DOCUMENT NAME INPUT ───────────────────────────────────

  test("document name input is visible with placeholder", async ({ page }) => {
    const input = page.getByPlaceholder(
      "Document name (e.g. Driving License)"
    );
    await expect(input).toBeVisible();
  });

  test("user can type into the document name input", async ({ page }) => {
    const input = page.getByPlaceholder(
      "Document name (e.g. Driving License)"
    );
    await input.fill("My Passport");
    await expect(input).toHaveValue("My Passport");
  });

  test("input starts empty", async ({ page }) => {
    const input = page.getByPlaceholder(
      "Document name (e.g. Driving License)"
    );
    await expect(input).toHaveValue("");
  });

  // ─── NAVIGATION ────────────────────────────────────────────

  test("Doc Gallery button navigates to /gallerypage", async ({ page }) => {
    await page.getByText("Doc Gallery").click();
    await expect(page).toHaveURL(/\/gallerypage/);
  });

  test("Gallery page shows Document Vault after navigation", async ({ page }) => {
    await page.getByText("Doc Gallery").click();
    await expect(
      page.getByRole("heading", { name: /Document Vault/i })
    ).toBeVisible();
  });

  // ─── VISUAL STRUCTURE ──────────────────────────────────────

  test("decorative lightbulb emoji is visible", async ({ page }) => {
    await expect(page.getByText("💡")).toBeVisible();
  });

  test("decorative sparkle is visible", async ({ page }) => {
    await expect(page.getByText("✷")).toBeVisible();
  });

  test("page has the neo-brutalist cream background", async ({ page }) => {
    const main = page.locator("main");
    await expect(main).toHaveCSS("background-color", "rgb(250, 249, 243)");
  });
});
