/**
 * Unit Tests — DocCard
 *
 * Tests the document card rendering, click behavior,
 * image display, date badge, and neo-brutalist styling.
 *
 * Props: { title, imageUrl, date, onClick }
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DocCard from "@/components/ui/DocCard";

const defaultProps = {
  title: "Driving License",
  imageUrl: "https://example.com/license.jpg",
  date: "2024-05-20",
  onClick: vi.fn(),
};

describe("DocCard", () => {
  // ─── CONTENT RENDERING ─────────────────────────────────────

  describe("content", () => {
    it("renders the document title", () => {
      render(<DocCard {...defaultProps} />);
      expect(screen.getByText("Driving License")).toBeInTheDocument();
    });

    it("renders the date badge", () => {
      render(<DocCard {...defaultProps} />);
      expect(screen.getByText("2024-05-20")).toBeInTheDocument();
    });

    it("renders the document image with correct alt text", () => {
      render(<DocCard {...defaultProps} />);
      const img = screen.getByAltText("Driving License") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain("license.jpg");
    });

    it("title text is uppercase and bold", () => {
      render(<DocCard {...defaultProps} />);
      const title = screen.getByText("Driving License").closest("h3");
      expect(title?.className).toContain("uppercase");
      expect(title?.className).toContain("font-black");
    });
  });

  // ─── CLICK BEHAVIOR ────────────────────────────────────────

  describe("interaction", () => {
    it("calls onClick when card is clicked", () => {
      const onClick = vi.fn();
      render(<DocCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByText("Driving License").closest("div[class*='border-[3px]']");
      fireEvent.click(card!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("card has cursor-pointer class", () => {
      render(<DocCard {...defaultProps} />);
      const card = screen.getByText("Driving License").closest("div[class*='border-[3px]']");
      expect(card?.className).toContain("cursor-pointer");
    });
  });

  // ─── NEO-BRUTALIST STYLING ──────────────────────────────────

  describe("neo-brutalist aesthetic", () => {
    it("card has thick black border", () => {
      render(<DocCard {...defaultProps} />);
      const card = screen.getByText("Driving License").closest("div[class*='border-[3px]']");
      expect(card?.className).toContain("border-[3px]");
      expect(card?.className).toContain("border-black");
    });

    it("card has brutalist shadow", () => {
      render(<DocCard {...defaultProps} />);
      const card = screen.getByText("Driving License").closest("div[class*='border-[3px]']");
      expect(card?.className).toContain("shadow-[8px_8px_0px_black]");
    });

    it("card has hover shadow-none transition class", () => {
      render(<DocCard {...defaultProps} />);
      const card = screen.getByText("Driving License").closest("div[class*='border-[3px]']");
      expect(card?.className).toContain("hover:shadow-none");
    });

    it("date badge has black background with white text", () => {
      render(<DocCard {...defaultProps} />);
      const dateBadge = screen.getByText("2024-05-20");
      expect(dateBadge.className).toContain("bg-black");
      expect(dateBadge.className).toContain("text-white");
    });

    it("image container has bottom border", () => {
      render(<DocCard {...defaultProps} />);
      const img = screen.getByAltText("Driving License");
      const imageContainer = img.closest("div[class*='border-b-[3px]']");
      expect(imageContainer).toBeTruthy();
    });

    it("action button has brutalist classes", () => {
      render(<DocCard {...defaultProps} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("border-2");
      expect(button.className).toContain("border-black");
      expect(button.className).toContain("shadow-[3px_3px_0px_black]");
    });
  });
});
