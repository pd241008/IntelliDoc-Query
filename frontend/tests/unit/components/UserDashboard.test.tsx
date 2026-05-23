/**
 * Unit Tests — User Dashboard
 *
 * Tests the dashboard page rendering, storage percentage display,
 * user profile fields, logout button, and neo-brutalist styling.
 *
 * The component consumes DocumentContext to calculate storage %.
 * We wrap it in a provider with known sample documents.
 *
 * NOTE: The Doughnut chart renders to <canvas> which jsdom cannot
 * query directly. We test the percentage TEXT overlay instead.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { DocumentProvider } from "@/context/DocumentContext";
import DashboardPage from "@/app/userpage/page";

/**
 * Wrapper that provides the DocumentContext.
 * DocumentProvider initializes with sampleDocuments:
 *   - { id: "1", name: "Driving License", expiryDate: "2026-01-01" }
 *   - { id: "2", name: "Insurance Policy", expiryDate: undefined }
 * → 1 with expiry, 1 without → percent = 50%
 */
const renderWithProvider = () => {
  return render(
    <DocumentProvider>
      <DashboardPage />
    </DocumentProvider>
  );
};

describe("UserDashboard", () => {
  // ─── PAGE HEADER ────────────────────────────────────────────

  describe("page header", () => {
    it("renders 'User Dashboard' title", () => {
      renderWithProvider();
      expect(screen.getByText("User Dashboard")).toBeInTheDocument();
    });

    it("renders subtitle text", () => {
      renderWithProvider();
      expect(
        screen.getByText(/System \/\/ Account Overview/)
      ).toBeInTheDocument();
    });
  });

  // ─── STORAGE ANALYSIS ──────────────────────────────────────

  describe("storage analysis", () => {
    it("renders 'Storage Analysis' section title", () => {
      renderWithProvider();
      expect(screen.getByText("Storage Analysis")).toBeInTheDocument();
    });

    it("renders percentage text overlay", () => {
      renderWithProvider();
      // sampleDocuments has 1/2 with expiry → 50%
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("renders 'Secure Storage' label under percentage", () => {
      renderWithProvider();
      expect(screen.getByText("Secure Storage")).toBeInTheDocument();
    });

    it("renders active files count text", () => {
      renderWithProvider();
      expect(screen.getByText("2 active files")).toBeInTheDocument();
    });

    it("renders 'Live Data' indicator", () => {
      renderWithProvider();
      expect(screen.getByText("Live Data")).toBeInTheDocument();
    });
  });

  // ─── USER PROFILE ──────────────────────────────────────────

  describe("user profile", () => {
    it("renders 'User Profile' section title", () => {
      renderWithProvider();
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    it("renders Full Name label", () => {
      renderWithProvider();
      expect(screen.getByText("Full Name")).toBeInTheDocument();
    });

    it("renders Email Address label", () => {
      renderWithProvider();
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("renders username 'Prathmesh'", () => {
      renderWithProvider();
      expect(screen.getByText("Prathmesh")).toBeInTheDocument();
    });

    it("renders email 'prathmesh@email.com'", () => {
      renderWithProvider();
      expect(
        screen.getByText("prathmesh@email.com")
      ).toBeInTheDocument();
    });
  });

  // ─── LOGOUT BUTTON ─────────────────────────────────────────

  describe("logout button", () => {
    it("renders 'Logout Session' button", () => {
      renderWithProvider();
      expect(
        screen.getByText("Logout Session")
      ).toBeInTheDocument();
    });

    it("logout button has brutalist styling", () => {
      renderWithProvider();
      const button = screen.getByText("Logout Session").closest("button");
      expect(button?.className).toContain("border-[3px]");
      expect(button?.className).toContain("border-black");
      expect(button?.className).toContain("shadow-[6px_6px_0px_black]");
    });

    it("logout button has red background", () => {
      renderWithProvider();
      const button = screen.getByText("Logout Session").closest("button");
      expect(button?.className).toContain("bg-[#ff5a5a]");
    });

    it("logout button is full width", () => {
      renderWithProvider();
      const button = screen.getByText("Logout Session").closest("button");
      expect(button?.className).toContain("w-full");
    });

    it("logout button has uppercase font", () => {
      renderWithProvider();
      const button = screen.getByText("Logout Session").closest("button");
      expect(button?.className).toContain("uppercase");
      expect(button?.className).toContain("font-black");
    });
  });

  // ─── NEO-BRUTALIST STYLING ──────────────────────────────────

  describe("neo-brutalist aesthetic", () => {
    it("storage card has heavy brutalist shadow", () => {
      renderWithProvider();
      const storageCard = screen.getByText("Storage Analysis")
        .closest("div[class*='shadow-[12px_12px_0px_black]']");
      expect(storageCard).toBeTruthy();
    });

    it("user profile card has heavy brutalist shadow", () => {
      renderWithProvider();
      const profileCard = screen.getByText("User Profile")
        .closest("div[class*='shadow-[12px_12px_0px_black]']");
      expect(profileCard).toBeTruthy();
    });

    it("header has thick bottom border", () => {
      renderWithProvider();
      const header = screen.getByText("User Dashboard")
        .closest("div[class*='border-b-4']");
      expect(header).toBeTruthy();
    });

    it("profile fields have inset shadow styling", () => {
      renderWithProvider();
      const nameField = screen.getByText("Prathmesh").closest("div");
      expect(nameField?.className).toContain("border-[3px]");
      expect(nameField?.className).toContain("border-black");
    });
  });
});
