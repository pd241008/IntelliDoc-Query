/**
 * Unit Tests — NavBar
 *
 * Tests the navigation bar rendering, active link highlighting,
 * authenticated vs unauthenticated states, and neo-brutalist styling.
 *
 * The component receives an optional `user` prop and uses
 * usePathname() to determine the active nav item.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NavBar from "@/components/ui/NavBar";

describe("NavBar", () => {
  // ─── LOGO & BRAND ──────────────────────────────────────────

  describe("branding", () => {
    it("renders the IntelliDoc logo text", () => {
      render(<NavBar />);
      expect(screen.getByText("IntelliDoc")).toBeInTheDocument();
    });

    it("logo links to root path '/'", () => {
      render(<NavBar />);
      const logoLink = screen.getByText("IntelliDoc").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("renders the star icon ✦", () => {
      render(<NavBar />);
      expect(screen.getByText("✦")).toBeInTheDocument();
    });
  });

  // ─── NAVIGATION ITEMS ──────────────────────────────────────

  describe("navigation links", () => {
    it("renders Home link", () => {
      render(<NavBar />);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders Gallery link", () => {
      render(<NavBar />);
      expect(screen.getByText("Gallery")).toBeInTheDocument();
    });

    it("renders Calendar link", () => {
      render(<NavBar />);
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    it("Home link points to /landingpage", () => {
      render(<NavBar />);
      const link = screen.getByText("Home").closest("a");
      expect(link).toHaveAttribute("href", "/landingpage");
    });

    it("Gallery link points to /gallerypage", () => {
      render(<NavBar />);
      const link = screen.getByText("Gallery").closest("a");
      expect(link).toHaveAttribute("href", "/gallerypage");
    });

    it("Calendar link points to /document-status", () => {
      render(<NavBar />);
      const link = screen.getByText("Calendar").closest("a");
      expect(link).toHaveAttribute("href", "/document-status");
    });
  });

  // ─── ACTIVE STATE ──────────────────────────────────────────
  // usePathname() is mocked to return "/landingpage" in setup.ts

  describe("active link highlighting", () => {
    it("Home link has active bg-[#ffde59] class (mocked pathname = /landingpage)", () => {
      render(<NavBar />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("bg-[#ffde59]");
    });

    it("Home link has active brutalist shadow", () => {
      render(<NavBar />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("shadow-[4px_4px_0px_black]");
    });

    it("Gallery link has inactive bg-white class", () => {
      render(<NavBar />);
      const galleryLink = screen.getByText("Gallery").closest("a");
      expect(galleryLink?.className).toContain("bg-white");
    });

    it("active link has aria-current='page'", () => {
      render(<NavBar />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveAttribute("aria-current", "page");
    });

    it("inactive link does not have aria-current", () => {
      render(<NavBar />);
      const galleryLink = screen.getByText("Gallery").closest("a");
      expect(galleryLink).not.toHaveAttribute("aria-current");
    });
  });

  // ─── AUTHENTICATION: LOGGED OUT ────────────────────────────

  describe("unauthenticated state", () => {
    it("renders 'Log In' button when no user prop", () => {
      render(<NavBar />);
      expect(screen.getByText("Log In")).toBeInTheDocument();
    });

    it("Log In button links to /auth/login with returnTo", () => {
      render(<NavBar />);
      const loginLink = screen.getByText("Log In").closest("a");
      expect(loginLink).toHaveAttribute(
        "href",
        "/auth/login?returnTo=/landingpage"
      );
    });

    it("does not render Log Out when unauthenticated", () => {
      render(<NavBar />);
      expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
    });
  });

  // ─── AUTHENTICATION: LOGGED IN ─────────────────────────────

  describe("authenticated state", () => {
    const mockUser = {
      name: "Test User",
      email: "test@intellidoc.com",
      picture: "https://example.com/avatar.jpg",
    };

    it("renders user name when authenticated", () => {
      render(<NavBar user={mockUser} />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("renders user avatar image", () => {
      render(<NavBar user={mockUser} />);
      const avatar = screen.getByAltText("User Avatar") as HTMLImageElement;
      expect(avatar).toBeInTheDocument();
      expect(avatar.src).toContain("avatar.jpg");
    });

    it("renders 'Log Out' link when authenticated", () => {
      render(<NavBar user={mockUser} />);
      const logoutLink = screen.getByText("Log Out");
      expect(logoutLink.closest("a")).toHaveAttribute(
        "href",
        "/auth/logout"
      );
    });

    it("does not render 'Log In' when authenticated", () => {
      render(<NavBar user={mockUser} />);
      expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    });

    it("falls back to email prefix when name is missing", () => {
      render(<NavBar user={{ email: "john@test.com" }} />);
      expect(screen.getByText("john")).toBeInTheDocument();
    });
  });

  // ─── NEO-BRUTALIST STYLING ──────────────────────────────────

  describe("neo-brutalist aesthetic", () => {
    it("nav container has thick black border", () => {
      render(<NavBar />);
      const container = screen.getByText("IntelliDoc")
        .closest("a")
        ?.parentElement;
      expect(container?.className).toContain("border-[3px]");
      expect(container?.className).toContain("border-black");
    });

    it("nav container has brutalist shadow", () => {
      render(<NavBar />);
      const container = screen.getByText("IntelliDoc")
        .closest("a")
        ?.parentElement;
      expect(container?.className).toContain("shadow-[8px_8px_0px_black]");
    });

    it("nav links have border-2 border-black styling", () => {
      render(<NavBar />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("border-2");
      expect(homeLink?.className).toContain("border-black");
    });

    it("nav links use uppercase text", () => {
      render(<NavBar />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("uppercase");
    });
  });
});
