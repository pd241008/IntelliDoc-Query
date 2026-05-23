/**
 * E2E Test — Navigation Journey
 *
 * Critical user flow: Start at the Hero page → verify branding →
 * click through to the Landing page → verify all 4 grid navigation
 * cards → click each card to verify routing.
 *
 * Uses Playwright against the live Next.js dev server.
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation Journey", () => {
  // ─── HERO PAGE (/) ──────────────────────────────────────────

  test.describe("Hero Page", () => {
    test("renders AI Powered Management badge", async ({ page }) => {
      await page.goto("/");
      const badge = page.getByText("AI Powered Management");
      await expect(badge).toBeVisible();
    });

    test("renders IntelliDoc heading", async ({ page }) => {
      await page.goto("/");
      const heading = page.getByRole("heading", { name: "IntelliDoc" });
      await expect(heading).toBeVisible();
    });

    test("renders tagline about never missing deadlines", async ({ page }) => {
      await page.goto("/");
      const tagline = page.getByText("never miss deadlines");
      await expect(tagline).toBeVisible();
    });

    test("renders GET STARTED button", async ({ page }) => {
      await page.goto("/");
      const button = page.getByText("GET STARTED");
      await expect(button).toBeVisible();
    });

    test("GET STARTED navigates to /landingpage", async ({ page }) => {
      await page.goto("/");
      await page.getByText("GET STARTED").click();
      await expect(page).toHaveURL(/\/landingpage/);
    });

    test("renders Why IntelliDoc? section", async ({ page }) => {
      await page.goto("/");
      const section = page.getByText("Why IntelliDoc?");
      await expect(section).toBeVisible();
    });

    test("renders three feature cards", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("📤 Easy Uploads")).toBeVisible();
      await expect(page.getByText("⏰ Smart Alerts")).toBeVisible();
      await expect(page.getByText("📁 Pro Dashboard")).toBeVisible();
    });

    test("renders footer branding", async ({ page }) => {
      await page.goto("/");
      const footer = page.getByText("Built with ❤️ using Smart Architecture");
      await expect(footer).toBeVisible();
    });
  });

  // ─── LANDING PAGE (/landingpage) ────────────────────────────

  test.describe("Landing Page Grid Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/landingpage");
    });

    test("renders Centralized Management badge", async ({ page }) => {
      await expect(
        page.getByText("Centralized Management")
      ).toBeVisible();
    });

    test("renders IntelliDoc title", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "IntelliDoc" })
      ).toBeVisible();
    });

    test("renders all 4 grid navigation cards", async ({ page }) => {
      await expect(page.getByText("Upload Documents")).toBeVisible();
      await expect(page.getByText("Document Gallery")).toBeVisible();
      await expect(page.getByText("Important Dates")).toBeVisible();
      await expect(page.getByText("User Dashboard")).toBeVisible();
    });

    test("Upload Documents card links to /uploadpage", async ({ page }) => {
      const link = page.getByRole("link", { name: /Upload Documents/ });
      await expect(link).toHaveAttribute("href", "/uploadpage");
    });

    test("Document Gallery card links to /gallerypage", async ({ page }) => {
      const link = page.getByRole("link", { name: /Document Gallery/ });
      await expect(link).toHaveAttribute("href", "/gallerypage");
    });

    test("Important Dates card links to /document-status", async ({ page }) => {
      const link = page.getByRole("link", { name: /Important Dates/ });
      await expect(link).toHaveAttribute("href", "/document-status");
    });

    test("User Dashboard card links to /userpage", async ({ page }) => {
      const link = page.getByRole("link", { name: /User Dashboard/ });
      await expect(link).toHaveAttribute("href", "/userpage");
    });

    test("clicking Upload Documents navigates to /uploadpage", async ({ page }) => {
      await page.getByText("Upload Documents").click();
      await expect(page).toHaveURL(/\/uploadpage/);
    });

    test("clicking Document Gallery navigates to /gallerypage", async ({ page }) => {
      await page.getByText("Document Gallery").click();
      await expect(page).toHaveURL(/\/gallerypage/);
    });

    test("renders IntelliDoc Systems footer", async ({ page }) => {
      await expect(
        page.getByText("IntelliDoc Systems")
      ).toBeVisible();
    });
  });

  // ─── NAVBAR NAVIGATION ─────────────────────────────────────

  test.describe("NavBar cross-page navigation", () => {
    test("NavBar is visible on the landing page", async ({ page }) => {
      await page.goto("/landingpage");
      await expect(page.getByText("✦")).toBeVisible();
    });

    test("Gallery nav link navigates to /gallerypage", async ({ page }) => {
      await page.goto("/landingpage");
      await page.getByRole("link", { name: "Gallery" }).click();
      await expect(page).toHaveURL(/\/gallerypage/);
    });

    test("Gallery page renders Document Vault heading", async ({ page }) => {
      await page.goto("/gallerypage");
      await expect(
        page.getByRole("heading", { name: /Document Vault/i })
      ).toBeVisible();
    });
  });
});
