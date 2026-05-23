/**
 * Unit Tests — Health Service
 *
 * Validates the pure business logic of the health check.
 */

import { health_service } from "../../../src/services/health_service";

describe("HealthService — health_service", () => {
  it("should return { status: 'ok' }", () => {
    const result = health_service();

    expect(result).toEqual({ status: "ok" });
  });

  it("should return a plain object (no side effects)", () => {
    const result = health_service();

    expect(typeof result).toBe("object");
    expect(Object.keys(result)).toEqual(["status"]);
  });

  it("should return a fresh object on each call", () => {
    const first = health_service();
    const second = health_service();

    expect(first).toEqual(second);
    expect(first).not.toBe(second); // different references
  });
});
