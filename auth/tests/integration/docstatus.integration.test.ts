/**
 * Integration Tests — Document Status Endpoint
 *
 * Full request lifecycle for GET /api/docstatus/documents/:auth0Id.
 * Tests document retrieval with seeded in-memory MongoDB data.
 */

import request from "supertest";
import app from "../helpers/app";
import DocumentModel from "../../src/models/documents";

describe("GET /api/docstatus/documents/:auth0Id", () => {
  const testAuth0Id = "auth0|docstatus-test-user";

  // ─── Seed Helper ──────────────────────────────────────────

  async function seedDocuments(auth0Id: string, count: number) {
    const docs = [];
    for (let i = 0; i < count; i++) {
      docs.push({
        fileId: `file-${auth0Id}-${i}`,
        auth0Id,
        filename: `document-${i}.pdf`,
        fileUrl: `https://storage.test/docs/${auth0Id}/${i}.pdf`,
        fileSize: 1024 * (i + 1),
        mimeType: "application/pdf",
        status: i === 0 ? "ready" : "processing",
        vectorIndexed: i === 0,
      });
    }
    await DocumentModel.insertMany(docs);
  }

  // ─── Success Cases ────────────────────────────────────────

  it("should return documents for a valid auth0Id", async () => {
    await seedDocuments(testAuth0Id, 3);

    const res = await request(app).get(
      `/api/docstatus/documents/${testAuth0Id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents).toHaveLength(3);
  });

  it("should return documents sorted by createdAt descending", async () => {
    await seedDocuments(testAuth0Id, 3);

    const res = await request(app).get(
      `/api/docstatus/documents/${testAuth0Id}`,
    );

    const docs = res.body.documents;
    for (let i = 0; i < docs.length - 1; i++) {
      const current = new Date(docs[i].createdAt).getTime();
      const next = new Date(docs[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should include all expected document fields", async () => {
    await seedDocuments(testAuth0Id, 1);

    const res = await request(app).get(
      `/api/docstatus/documents/${testAuth0Id}`,
    );

    const doc = res.body.documents[0];
    expect(doc).toHaveProperty("fileId");
    expect(doc).toHaveProperty("auth0Id", testAuth0Id);
    expect(doc).toHaveProperty("filename");
    expect(doc).toHaveProperty("fileUrl");
    expect(doc).toHaveProperty("status");
    expect(doc).toHaveProperty("vectorIndexed");
  });

  // ─── Empty Results ────────────────────────────────────────

  it("should return empty array for non-existent auth0Id", async () => {
    const res = await request(app).get(
      "/api/docstatus/documents/auth0|does-not-exist",
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents).toEqual([]);
  });

  // ─── User Isolation ───────────────────────────────────────

  it("should only return documents for the requested user", async () => {
    await seedDocuments("auth0|user-A", 2);
    await seedDocuments("auth0|user-B", 3);

    const res = await request(app).get(
      "/api/docstatus/documents/auth0|user-A",
    );

    expect(res.body.documents).toHaveLength(2);
    res.body.documents.forEach((doc: any) => {
      expect(doc.auth0Id).toBe("auth0|user-A");
    });
  });
});
