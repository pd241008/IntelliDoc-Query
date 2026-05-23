/**
 * Unit Tests — Upload Page
 *
 * Tests the upload page rendering, form inputs, button states,
 * uploading state transitions, and neo-brutalist styling.
 *
 * The component uses DocumentContext (addDocument) and
 * useRouter (push to /gallerypage after success).
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { DocumentProvider } from "@/context/DocumentContext";
import UploadPage from "@/app/uploadpage/page";

const renderWithProvider = () => {
  return render(
    <DocumentProvider>
      <UploadPage />
    </DocumentProvider>
  );
};

describe("UploadPage", () => {
  // ─── PAGE CONTENT ──────────────────────────────────────────

  describe("content", () => {
    it("renders 'Upload Your File Here' heading", () => {
      renderWithProvider();
      expect(
        screen.getByText("Upload Your File Here")
      ).toBeInTheDocument();
    });

    it("renders description paragraph", () => {
      renderWithProvider();
      expect(
        screen.getByText(/Upload your document once/)
      ).toBeInTheDocument();
    });

    it("renders 'UPLOAD' button", () => {
      renderWithProvider();
      expect(screen.getByText("UPLOAD")).toBeInTheDocument();
    });

    it("renders 'Doc Gallery' button", () => {
      renderWithProvider();
      expect(screen.getByText("Doc Gallery")).toBeInTheDocument();
    });
  });

  // ─── DOCUMENT NAME INPUT ───────────────────────────────────

  describe("document name input", () => {
    it("renders the document name input with correct placeholder", () => {
      renderWithProvider();
      const input = screen.getByPlaceholderText(
        "Document name (e.g. Driving License)"
      );
      expect(input).toBeInTheDocument();
    });

    it("input accepts typed text", () => {
      renderWithProvider();
      const input = screen.getByPlaceholderText(
        "Document name (e.g. Driving License)"
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "My Passport" } });
      expect(input.value).toBe("My Passport");
    });

    it("input is initially empty", () => {
      renderWithProvider();
      const input = screen.getByPlaceholderText(
        "Document name (e.g. Driving License)"
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  // ─── FILE INPUT ────────────────────────────────────────────

  describe("file input", () => {
    it("hidden file input exists in the DOM", () => {
      renderWithProvider();
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.className).toContain("hidden");
    });
  });

  // ─── NAVIGATION ────────────────────────────────────────────

  describe("navigation", () => {
    it("'Doc Gallery' button triggers router.push to /gallerypage", async () => {
      const { useRouter } = await import("next/navigation");
      renderWithProvider();

      const galleryBtn = screen.getByText("Doc Gallery");
      fireEvent.click(galleryBtn);

      const router = (useRouter as ReturnType<typeof vi.fn>)();
      expect(router.push).toHaveBeenCalledWith("/gallerypage");
    });
  });

  // ─── NEO-BRUTALIST STYLING ──────────────────────────────────

  describe("neo-brutalist aesthetic", () => {
    it("main card has thick black border", () => {
      renderWithProvider();
      const card = screen.getByText("Upload Your File Here")
        .closest("div[class*='border-[6px]']");
      expect(card).toBeTruthy();
      expect(card?.className).toContain("border-black");
    });

    it("main card has large border radius", () => {
      renderWithProvider();
      const card = screen.getByText("Upload Your File Here")
        .closest("div[class*='border-[6px]']");
      expect(card?.className).toContain("rounded-[60px]");
    });

    it("upload button has brutalist classes", () => {
      renderWithProvider();
      const uploadBtn = screen.getByText("UPLOAD").closest("button");
      expect(uploadBtn?.className).toContain("border-[3px]");
      expect(uploadBtn?.className).toContain("border-black");
      expect(uploadBtn?.className).toContain("shadow-[6px_6px_0px_black]");
    });

    it("upload button has blue accent background", () => {
      renderWithProvider();
      const uploadBtn = screen.getByText("UPLOAD").closest("button");
      expect(uploadBtn?.className).toContain("bg-[#cfe9ff]");
    });

    it("doc gallery button has matching brutalist classes", () => {
      renderWithProvider();
      const galleryBtn = screen.getByText("Doc Gallery").closest("button");
      expect(galleryBtn?.className).toContain("border-[3px]");
      expect(galleryBtn?.className).toContain("shadow-[6px_6px_0px_black]");
    });

    it("document name input has brutalist styling", () => {
      renderWithProvider();
      const input = screen.getByPlaceholderText(
        "Document name (e.g. Driving License)"
      );
      expect(input.className).toContain("border-[3px]");
      expect(input.className).toContain("border-black");
      expect(input.className).toContain("shadow-[6px_6px_0px_black]");
    });

    it("heading text is black and extra bold", () => {
      renderWithProvider();
      const heading = screen.getByText("Upload Your File Here").closest("h1");
      expect(heading?.className).toContain("font-black");
    });
  });
});
