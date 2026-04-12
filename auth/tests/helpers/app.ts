/**
 * Test-Safe Express Application
 *
 * Mirrors the real app.ts but:
 *   - Does NOT call connectDB() (MongoMemoryServer handles the connection)
 *   - Registers routes statically (bypasses the ExpressKit filesystem loader)
 *   - Auth middleware is globally stubbed via jest.config moduleNameMapper
 *
 * Import this in integration tests instead of the real app.
 */

import express from "express";
import cors from "cors";
import { errorHandler } from "../../.expresskit/error_handling/handler";

// Static route imports — the auth middleware import inside auth/route.ts
// is intercepted by moduleNameMapper → tests/mocks/auth.ts
import healthRoute from "../../src/routes/health/route";
import authRoute from "../../src/routes/auth/route";
import docstatusRoute from "../../src/routes/docstatus/route";
import metadataRoute from "../../src/routes/metadata/route";
import userdocretrievalRoute from "../../src/routes/userdocretrieval/route";

const app = express();

// Global middleware (matches the real app)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Mount routes under the same prefix as ExpressKit
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/docstatus", docstatusRoute);
app.use("/api/metadata", metadataRoute);
app.use("/api/userdocretrieval", userdocretrievalRoute);

// Global error handler
app.use(errorHandler);

export default app;
