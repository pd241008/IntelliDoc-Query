/**
 * Integration Tests — User Document Retrieval Endpoint
 *
 * Full request lifecycle for GET /api/userdocretrieval/documents/:auth0Id.
 * Tests retrieval, sorting, and multi-tenant isolation.
 */

import request from "supertest";
import app from "../helpers/app";
import DocumentModel from "../../src/models/documents";

describe("GET /api/userdocretrieval/documents/:auth0Id", () => {
  const testAuth0Id = "auth0|retrieval-test-user";

  // ─── Seed Helper ──────────────────────────────────────────

  async function seedDocuments(
    auth0Id: string,
    count: number,
    statusOverride?: string,
  ) {
    const docs = [];
    for (let i = 0; i < count; i++) {
      docs.push({
        fileId: `file-retrieval-${auth0Id}-${i}`,
        auth0Id,
        filename: `report-${i}.pdf`,
        fileUrl: `https://storage.test/retrieval/${auth0Id}/${i}.pdf`,
        fileSize: 512 * (i + 1),
        mimeType: "application/pdf",
        status: statusOverride || "ready",
        vectorIndexed: true,
      });
    }
    await DocumentModel.insertMany(docs);
  }

  // ─── Success Cases ────────────────────────────────────────

  it("should return all documents for a user", async () => {
    await seedDocuments(testAuth0Id, 5);

    const res = await request(app).get(
      `/api/userdocretrieval/documents/${testAuth0Id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents).toHaveLength(5);
  });

  it("should return documents sorted by createdAt descending", async () => {
    await seedDocuments(testAuth0Id, 4);

    const res = await request(app).get(
      `/api/userdocretrieval/documents/${testAuth0Id}`,
    );

    const docs = res.body.documents;
    for (let i = 0; i < docs.length - 1; i++) {
      const current = new Date(docs[i].createdAt).getTime();
      const next = new Date(docs[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should return documents with correct schema fields", async () => {
    await seedDocuments(testAuth0Id, 1);

    const res = await request(app).get(
      `/api/userdocretrieval/documents/${testAuth0Id}`,
    );

    const doc = res.body.documents[0];
    expect(doc).toHaveProperty("fileId");
    expect(doc).toHaveProperty("auth0Id", testAuth0Id);
    expect(doc).toHaveProperty("filename");
    expect(doc).toHaveProperty("fileUrl");
    expect(doc).toHaveProperty("status", "ready");
    expect(doc).toHaveProperty("vectorIndexed", true);
    expect(doc).toHaveProperty("createdAt");
    expect(doc).toHaveProperty("updatedAt");
  });

  // ─── Empty Results ────────────────────────────────────────

  it("should return empty array for non-existent user", async () => {
    const res = await request(app).get(
      "/api/userdocretrieval/documents/auth0|ghost-user",
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents).toEqual([]);
  });

  // ─── Multi-Tenant Isolation ───────────────────────────────

  it("should isolate documents between users", async () => {
    await seedDocuments("auth0|tenant-X", 3);
    await seedDocuments("auth0|tenant-Y", 7);

    const resX = await request(app).get(
      "/api/userdocretrieval/documents/auth0|tenant-X",
    );
    const resY = await request(app).get(
      "/api/userdocretrieval/documents/auth0|tenant-Y",
    );

    expect(resX.body.documents).toHaveLength(3);
    expect(resY.body.documents).toHaveLength(7);

    resX.body.documents.forEach((doc: any) => {
      expect(doc.auth0Id).toBe("auth0|tenant-X");
    });
    resY.body.documents.forEach((doc: any) => {
      expect(doc.auth0Id).toBe("auth0|tenant-Y");
    });
  });

  // ─── Mixed Status Documents ───────────────────────────────

  it("should return documents regardless of processing status", async () => {
    await seedDocuments(testAuth0Id, 2, "processing");
    await seedDocuments(testAuth0Id + "-ready", 1, "ready");

    const res = await request(app).get(
      `/api/userdocretrieval/documents/${testAuth0Id}`,
    );

    expect(res.body.documents).toHaveLength(2);
    res.body.documents.forEach((doc: any) => {
      expect(doc.status).toBe("processing");
    });
  });
});
