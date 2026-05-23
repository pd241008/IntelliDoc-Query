/**
 * Integration Tests — Health Endpoint
 *
 * Full request lifecycle: Request → Route → Middleware → Controller → Service
 * Uses the test-safe Express app with Supertest.
 */

import request from "supertest";
import app from "../helpers/app";

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("should return application/json content type", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("should respond within reasonable time", async () => {
    const start = Date.now();
    await request(app).get("/api/health");
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000); // < 1 second
  });
});
