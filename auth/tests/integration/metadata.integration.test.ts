/**
 * Integration Tests — Metadata Endpoint
 *
 * Full request lifecycle for POST /api/metadata/.
 * Tests document metadata creation and validation.
 */

import request from "supertest";
import app from "../helpers/app";
import DocumentModel from "../../src/models/documents";

describe("POST /api/metadata", () => {
  const validPayload = {
    fileId: "file-meta-test-001",
    auth0Id: "auth0|metadata-test-user",
    filename: "test-document.pdf",
    fileUrl: "https://storage.test/docs/test-document.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
  };

  // ─── Success Cases ────────────────────────────────────────

  it("should create a document and return 200 on valid payload", async () => {
    const res = await request(app)
      .post("/api/metadata")
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document).toBeDefined();
    expect(res.body.document.fileId).toBe(validPayload.fileId);
    expect(res.body.document.auth0Id).toBe(validPayload.auth0Id);
    expect(res.body.document.filename).toBe(validPayload.filename);
  });

  it("should persist the document in MongoDB", async () => {
    await request(app).post("/api/metadata").send(validPayload);

    const doc = await DocumentModel.findOne({ fileId: validPayload.fileId });
    expect(doc).not.toBeNull();
    expect(doc!.filename).toBe(validPayload.filename);
    expect(doc!.fileUrl).toBe(validPayload.fileUrl);
  });

  it("should set default status to 'processing'", async () => {
    const res = await request(app)
      .post("/api/metadata")
      .send(validPayload);

    expect(res.body.document.status).toBe("processing");
  });

  it("should set vectorIndexed to false by default", async () => {
    const res = await request(app)
      .post("/api/metadata")
      .send(validPayload);

    expect(res.body.document.vectorIndexed).toBe(false);
  });

  it("should accept optional fileSize and mimeType", async () => {
    const minimalPayload = {
      fileId: "file-minimal-001",
      auth0Id: "auth0|minimal-user",
      filename: "minimal.pdf",
      fileUrl: "https://storage.test/minimal.pdf",
    };

    const res = await request(app)
      .post("/api/metadata")
      .send(minimalPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Validation Failures ──────────────────────────────────

  it("should return 400 when fileId is missing", async () => {
    const { fileId, ...payload } = validPayload;

    const res = await request(app)
      .post("/api/metadata")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should return 400 when auth0Id is missing", async () => {
    const { auth0Id, ...payload } = validPayload;

    const res = await request(app)
      .post("/api/metadata")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should return 400 when filename is missing", async () => {
    const { filename, ...payload } = validPayload;

    const res = await request(app)
      .post("/api/metadata")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should return 400 when fileUrl is missing", async () => {
    const { fileUrl, ...payload } = validPayload;

    const res = await request(app)
      .post("/api/metadata")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app)
      .post("/api/metadata")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });
});
