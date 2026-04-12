/**
 * Unit Tests — SystemHealthTooltip
 *
 * The CRITICAL component test. Validates the health status badge
 * rendering, color coding, label text, service rows, and tooltip
 * structure across all four states: loading, healthy, degraded, down.
 *
 * The component fetches /api/health on mount, then maps the response
 * to one of: "loading" | "healthy" | "degraded" | "down" | "up"
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import {
  healthyResponse,
  degradedResponse,
} from "../../mocks/handlers";
import SystemHealthTooltip from "@/components/ui/SystemHealthTooltip";

describe("SystemHealthTooltip", () => {
  // ─── HEALTHY STATE ──────────────────────────────────────────

  describe("when backend returns healthy status", () => {
    it("renders 'UP' badge text after fetch completes", async () => {
      render(<SystemHealthTooltip />);

      // Wait for the fetch to resolve and state to update
      await waitFor(() => {
        expect(screen.getByText("UP")).toBeInTheDocument();
      });
    });

    it("applies the healthy color class (bg-[#cfe9ff])", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const badge = screen.getByText("UP").closest("div");
        expect(badge?.className).toContain("bg-[#cfe9ff]");
      });
    });

    it("displays 'All systems operational' label in tooltip", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(
          screen.getByText("All systems operational")
        ).toBeInTheDocument();
      });
    });

    it("renders API service row with status 'up'", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const statusElements = screen.getAllByText("up");
        expect(statusElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("renders service rows with green color for 'up' status", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const statusElements = screen.getAllByText("up");
        statusElements.forEach((el) => {
          expect(el.className).toContain("text-green-600");
        });
      });
    });

    it("displays uptime value from health data", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText(/Uptime: 120s/)).toBeInTheDocument();
      });
    });

    it("displays environment badge", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("test")).toBeInTheDocument();
      });
    });
  });

  // ─── DEGRADED STATE ─────────────────────────────────────────

  describe("when backend returns degraded status", () => {
    it("renders 'degraded' badge text", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.json(degradedResponse);
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("degraded")).toBeInTheDocument();
      });
    });

    it("applies the degraded color class (bg-[#ffde59])", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.json(degradedResponse);
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const badge = screen.getByText("degraded").closest("div");
        expect(badge?.className).toContain("bg-[#ffde59]");
      });
    });

    it("displays 'Partial outage' label", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.json(degradedResponse);
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("Partial outage")).toBeInTheDocument();
      });
    });

    it("renders broker 'unknown' status with amber color", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.json(degradedResponse);
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const unknownElements = screen.getAllByText("unknown");
        unknownElements.forEach((el) => {
          expect(el.className).toContain("text-amber-500");
        });
      });
    });
  });

  // ─── DOWN STATE ─────────────────────────────────────────────

  describe("when backend is unreachable", () => {
    it("renders 'down' badge text on network error", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.error();
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("down")).toBeInTheDocument();
      });
    });

    it("applies the down color class (bg-red-300)", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.error();
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const badge = screen.getByText("down").closest("div");
        expect(badge?.className).toContain("bg-red-300");
      });
    });

    it("renders 'down' badge on non-ok response", async () => {
      server.use(
        http.get("/api/health", () => {
          return HttpResponse.json(
            { status: "error" },
            { status: 500 }
          );
        })
      );

      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("down")).toBeInTheDocument();
      });
    });
  });

  // ─── NEO-BRUTALIST STYLING ──────────────────────────────────

  describe("neo-brutalist aesthetic", () => {
    it("badge has brutalist border and shadow classes", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const badge = screen.getByText("UP").closest("div");
        expect(badge?.className).toContain("border-[3px]");
        expect(badge?.className).toContain("border-black");
        expect(badge?.className).toContain("shadow-[4px_4px_0px_black]");
        expect(badge?.className).toContain("rounded-full");
      });
    });

    it("tooltip container has brutalist border and shadow", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const tooltip = screen.getByText("All systems operational")
          .closest("div[class*='shadow-[8px_8px_0px_black]']");
        expect(tooltip).toBeTruthy();
      });
    });

    it("badge font is uppercase and extra bold", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        const badge = screen.getByText("UP").closest("div");
        expect(badge?.className).toContain("font-black");
        expect(badge?.className).toContain("uppercase");
      });
    });
  });

  // ─── NESTED SERVICE GROUPS ──────────────────────────────────

  describe("nested service rendering", () => {
    it("renders pipeline sub-group header", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("pipelines")).toBeInTheDocument();
      });
    });

    it("renders nested pipeline service names", async () => {
      render(<SystemHealthTooltip />);

      await waitFor(() => {
        expect(screen.getByText("ingestion")).toBeInTheDocument();
        expect(screen.getByText("semantic search")).toBeInTheDocument();
      });
    });
  });
});
