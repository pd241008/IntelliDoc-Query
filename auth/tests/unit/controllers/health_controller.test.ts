/**
 * Unit Tests — Health Controller
 *
 * Isolates the controller by mocking the health_service.
 * Verifies HTTP response and service delegation.
 */

import { Request, Response } from "express";

// Mock the service layer
jest.mock("../../../src/services/health_service", () => ({
  health_service: jest.fn(() => ({ status: "ok" })),
}));

import { health_controller } from "../../../src/controllers/health_controller";
import { health_service } from "../../../src/services/health_service";

// ─── Test Helpers ──────────────────────────────────────────────

function createMockRequest(): Request {
  return {} as Request;
}

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

// ─── Tests ─────────────────────────────────────────────────────

describe("HealthController — health_controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call health_service exactly once", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    health_controller(req, res);

    expect(health_service).toHaveBeenCalledTimes(1);
  });

  it("should respond with the return value of health_service", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    health_controller(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("should call res.json exactly once", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    health_controller(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it("should forward whatever the service returns", () => {
    (health_service as jest.Mock).mockReturnValueOnce({ status: "degraded" });

    const req = createMockRequest();
    const res = createMockResponse();

    health_controller(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: "degraded" });
  });
});
