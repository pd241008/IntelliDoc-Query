/**
 * Unit Tests — User Service
 *
 * Tests the syncUserInDB function against the in-memory MongoDB
 * provided by tests/setup.ts (MongoMemoryServer).
 */

import { syncUserInDB } from "../../../src/services/user_service";
import User from "../../../src/models/users";

describe("UserService — syncUserInDB", () => {
  const testAuth0Id = "auth0|unit-test-user-001";
  const testEmail = "unit@intellidoc.test";
  const testName = "Unit Test User";

  // ─── Creation ────────────────────────────────────────────────

  it("should create a new user when auth0Id does not exist", async () => {
    const user = await syncUserInDB(testAuth0Id, testEmail, testName);

    expect(user).toBeDefined();
    expect(user.auth0Id).toBe(testAuth0Id);
    expect(user.email).toBe(testEmail);
    expect(user.name).toBe(testName);
    expect(user.role).toBe("user"); // default role

    // Verify persisted in DB
    const dbUser = await User.findOne({ auth0Id: testAuth0Id });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.email).toBe(testEmail);
  });

  // ─── Upsert / Update ────────────────────────────────────────

  it("should update an existing user on repeated calls (upsert)", async () => {
    // First call — create
    await syncUserInDB(testAuth0Id, testEmail, testName);

    // Second call — update name and email
    const updatedEmail = "updated@intellidoc.test";
    const updatedName = "Updated User";
    const user = await syncUserInDB(testAuth0Id, updatedEmail, updatedName);

    expect(user.email).toBe(updatedEmail);
    expect(user.name).toBe(updatedName);

    // Verify no duplicate was created
    const count = await User.countDocuments({ auth0Id: testAuth0Id });
    expect(count).toBe(1);
  });

  // ─── Optional Fields ────────────────────────────────────────

  it("should handle missing optional fields (email, name)", async () => {
    const user = await syncUserInDB(testAuth0Id);

    expect(user).toBeDefined();
    expect(user.auth0Id).toBe(testAuth0Id);
    expect(user.email).toBeUndefined();
    expect(user.name).toBeUndefined();
  });

  it("should allow partial updates (only email)", async () => {
    await syncUserInDB(testAuth0Id, testEmail, testName);

    const user = await syncUserInDB(testAuth0Id, "new@intellidoc.test");

    expect(user.email).toBe("new@intellidoc.test");
    // Mongoose ignores undefined values in findOneAndUpdate — name is retained
    expect(user.name).toBe(testName);
  });

  // ─── Idempotency ────────────────────────────────────────────

  it("should be idempotent — same input produces same output", async () => {
    const first = await syncUserInDB(testAuth0Id, testEmail, testName);
    const second = await syncUserInDB(testAuth0Id, testEmail, testName);

    expect(first._id.toString()).toBe(second._id.toString());
    expect(first.email).toBe(second.email);

    const count = await User.countDocuments({ auth0Id: testAuth0Id });
    expect(count).toBe(1);
  });

  // ─── Default Role ───────────────────────────────────────────

  it("should assign default role 'user' to new users", async () => {
    const user = await syncUserInDB(testAuth0Id, testEmail, testName);
    expect(user.role).toBe("user");
  });

  // ─── Timestamps ─────────────────────────────────────────────

  it("should set createdAt and updatedAt timestamps", async () => {
    const user = await syncUserInDB(testAuth0Id, testEmail, testName);

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
