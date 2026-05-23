/**
 * MSW Request Handlers — IntelliDoc Frontend
 *
 * Intercepts all outbound API calls during Vitest tests.
 * Each handler returns a deterministic response matching the
 * shapes expected by the frontend components.
 */

import { http, HttpResponse } from "msw";

// ─── HEALTH RESPONSES ────────────────────────────────────────

export const healthyResponse = {
  ok: true,
  status: "up",
  service: "intellidoc-backend",
  environment: "test",
  uptime: "120s",
  timestamp: "2025-01-01T00:00:00Z",
  backend: { reachable: true, statusCode: 200 },
  services: {
    api: { status: "up", provider: "fastapi" },
    broker: { status: "up", provider: "redis" },
    vector_db: { status: "up", provider: "chroma-cloud" },
    pipelines: {
      ingestion: { status: "up" },
      semantic_search: { status: "up" },
    },
  },
};

export const degradedResponse = {
  ok: true,
  status: "degraded",
  service: "intellidoc-backend",
  environment: "test",
  uptime: "60s",
  timestamp: "2025-01-01T00:00:00Z",
  backend: { reachable: true, statusCode: 200 },
  services: {
    api: { status: "up", provider: "fastapi" },
    broker: { status: "unknown", provider: "redis" },
    vector_db: { status: "unknown", provider: "chroma-cloud" },
    pipelines: {
      ingestion: { status: "up" },
      semantic_search: { status: "up" },
    },
  },
};

export const downResponse = {
  ok: false,
  status: "down",
  backend: { reachable: false },
  error: "Backend unreachable",
  timestamp: "2025-01-01T00:00:00Z",
};

// ─── UPLOAD RESPONSE ─────────────────────────────────────────

const uploadSuccessResponse = {
  id: "mock-doc-001",
  fileUrl: "https://example.com/mock-file.pdf",
  expiryDate: "2026-06-15",
  status: "UPLOADED",
  message: "Document uploaded and processing started.",
};

// ─── DOCUMENTS RESPONSE ──────────────────────────────────────

const documentsListResponse = [
  {
    id: "1",
    name: "Driving License",
    type: "license",
    uploadDate: "2025-01-01",
    expiryDate: "2026-01-01",
    fileUrl: "https://example.com/license.pdf",
  },
  {
    id: "2",
    name: "Insurance Policy",
    type: "insurance",
    uploadDate: "2025-02-01",
    fileUrl: "https://example.com/insurance.pdf",
  },
];

// ─── DEFAULT HANDLERS ────────────────────────────────────────
// These run for every test unless overridden via server.use()

export const handlers = [
  // Health endpoint — defaults to healthy
  http.get("/api/health", () => {
    return HttpResponse.json(healthyResponse);
  }),

  // Upload endpoint — returns success
  http.post("/api/upload", () => {
    return HttpResponse.json(uploadSuccessResponse, { status: 200 });
  }),

  // Documents list endpoint
  http.get("/api/documents/list", () => {
    return HttpResponse.json(documentsListResponse);
  }),
];
