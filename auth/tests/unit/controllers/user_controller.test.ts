/**
 * Unit Tests — User Controller
 *
 * Isolates the controller logic by mocking the service layer.
 * Tests HTTP status codes, error handling, and JSON response shapes.
 */

import { Request, Response } from "express";
import { syncUser } from "../../../src/controllers/user_controller";

// Mock the service layer (not used in current code, but prevents
// side effects from the import and prepares for future activation)
jest.mock("../../../src/services/user_service", () => ({
  syncUserInDB: jest.fn(),
}));

// ─── Test Helpers ──────────────────────────────────────────────

function createMockRequest(overrides: Record<string, any> = {}): Request {
  return {
    auth: { payload: { sub: "auth0|test-user-123" } },
    body: { email: "test@intellidoc.test", name: "Test User" },
    params: {},
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

// ─── Tests ─────────────────────────────────────────────────────

describe("UserController — syncUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── 401 Unauthorized ─────────────────────────────────────

  it("should return 401 when auth0Id (sub) is missing from token", async () => {
    const req = createMockRequest({
      auth: { payload: {} },
    });
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Missing Auth0 ID",
    });
  });

  it("should return 401 when auth object is undefined", async () => {
    const req = createMockRequest({ auth: undefined });
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Missing Auth0 ID",
    });
  });

  // ─── 400 Bad Request ──────────────────────────────────────

  it("should return 400 when email is missing from body", async () => {
    const req = createMockRequest({
      body: { name: "Test User" }, // no email
    });
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
    });
  });

  it("should return 400 when name is missing from body", async () => {
    const req = createMockRequest({
      body: { email: "test@intellidoc.test" }, // no name
    });
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
    });
  });

  it("should return 400 when body is empty", async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
    });
  });

  // ─── 200 Success ──────────────────────────────────────────

  it("should return 200 with verification response on valid request", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Step 1 verification successful",
        auth0Id: "auth0|test-user-123",
        email: "test@intellidoc.test",
        name: "Test User",
      }),
    );
  });

  it("should include tokenPayload in the 200 response", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await syncUser(req, res);

    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall).toHaveProperty("tokenPayload");
    expect(jsonCall.tokenPayload).toEqual({ sub: "auth0|test-user-123" });
  });

  // ─── Response Shape ───────────────────────────────────────

  it("should not call res.status more than once", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await syncUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});
