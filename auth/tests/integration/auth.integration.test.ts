/**
 * Integration Tests — Auth Sync Endpoint
 *
 * Full request lifecycle for POST /api/auth/sync-user.
 * The checkJwt middleware is globally stubbed via moduleNameMapper
 * → tests/mocks/auth.ts (configurable mock).
 */

import request from "supertest";
import app from "../helpers/app";
import { disableMockAuth, resetMockAuth, MOCK_USER } from "../mocks/auth";

describe("POST /api/auth/sync-user", () => {
  afterEach(() => {
    resetMockAuth();
  });

  // ─── Authenticated Flows ───────────────────────────────────

  it("should return 200 with verification data on valid authenticated request", async () => {
    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({ email: "integration@intellidoc.test", name: "Integration User" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: "Step 1 verification successful",
      auth0Id: MOCK_USER.sub,
      email: "integration@intellidoc.test",
      name: "Integration User",
    });
  });

  it("should include tokenPayload in the response", async () => {
    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({ email: "test@test.com", name: "Test" });

    expect(res.status).toBe(200);
    expect(res.body.tokenPayload).toBeDefined();
    expect(res.body.tokenPayload.sub).toBe(MOCK_USER.sub);
  });

  // ─── Missing Body Fields ──────────────────────────────────

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({ name: "No Email User" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing required fields" });
  });

  it("should return 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({ email: "noemail@test.com" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing required fields" });
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing required fields" });
  });

  // ─── Unauthenticated Flow ─────────────────────────────────

  it("should return 401 when authentication is disabled", async () => {
    disableMockAuth();

    const res = await request(app)
      .post("/api/auth/sync-user")
      .send({ email: "test@test.com", name: "Test" });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      code: "invalid_token",
      message: "Unauthorized",
    });
  });
});
