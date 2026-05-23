# IntelliDoc-Query Engine — Test Suite Implementation Plan

## Workspace Analysis Findings

The project is a **polyglot microservices architecture** with three distinct sub-projects:

| Sub-project | Stack | Role |
|---|---|---|
| `auth/` | **Node.js, Express 5, TypeScript, Mongoose** | Auth gateway, user sync, document metadata CRUD |
| `backend/` | Python, FastAPI, Celery, ChromaDB, Redis | RAG pipeline, vector search, async ingestion |
| `frontend/` | Next.js, TypeScript, Tailwind CSS | Client UI |

> [!IMPORTANT]
> The **test suite targets the `auth/` service** — the Node.js / Express / TypeScript / Mongoose service. This is the only component that matches the prescribed tech stack (Jest, ts-jest, Supertest, mongodb-memory-server). The Python backend's RAG pipeline is **referenced in mock design** to ensure the stubs accurately model the ChromaDB/Redis/Celery interfaces that the auth service would interact with in a production integration.

---

## Discovered Components

### Controllers (`auth/src/controllers/`)
| File | Export | Purpose |
|---|---|---|
| [health_controller.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/controllers/health_controller.ts) | `health_controller` | Returns `{ status: "ok" }` from health service |
| [user_controller.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/controllers/user_controller.ts) | `syncUser` | Auth0 user sync — validates JWT sub, email, name |

### Services (`auth/src/services/`)
| File | Export | Purpose |
|---|---|---|
| [health_service.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/services/health_service.ts) | `health_service` | Pure function returning `{ status: "ok" }` |
| [user_service.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/services/user_service.ts) | `syncUserInDB` | Upserts Auth0 user into MongoDB |

### Models (`auth/src/models/`)
| File | Export | Purpose |
|---|---|---|
| [users.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/models/users.ts) | `User` (default), `IUser` | User schema: auth0Id, email, name, picture, role |
| [documents.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/models/documents.ts) | `DocumentModel` (default), `IDocument`, `DocumentStatus` | Document schema: fileId, auth0Id, filename, fileUrl, status, vectorIndexed |

### Routes (`auth/src/routes/`)
| Route Directory | Method | Path (mounted) | Auth | Purpose |
|---|---|---|---|---|
| `auth/route.ts` | POST | `/api/auth/sync-user` | `checkJwt` | Sync Auth0 user to DB |
| `health/route.ts` | GET | `/api/health/` | `health_middleware` | Health check |
| `docstatus/route.ts` | GET | `/api/docstatus/documents/:auth0Id` | None | Get user documents |
| `metadata/route.ts` | POST | `/api/metadata/` | None | Create document metadata |
| `userdocretrieval/route.ts` | GET | `/api/userdocretrieval/documents/:auth0Id` | None | Get user documents (duplicate) |

### Middleware (`auth/src/middleware/`)
| File | Export | Purpose |
|---|---|---|
| [auth_middleware.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/middleware/auth_middleware.ts) | `checkJwt` | Auth0 JWT validation via `express-oauth2-jwt-bearer` |
| [health_middleware.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/middleware/health_middleware.ts) | `health_middleware` | Passthrough middleware (calls `next()`) |

### Infrastructure
| File | Purpose |
|---|---|
| [app.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/app.ts) | Express app setup — CORS, JSON, Morgan, ExpressKit route loader, error handler |
| [server.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/server.ts) | Starts HTTP listener |
| [db.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/utils/db/db.ts) | MongoDB connection via Mongoose |
| [expresskit.bridge.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/config/expresskit.bridge.ts) | Dynamic route loading abstraction |
| [expresskit.config.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/src/config/expresskit.config.ts) | Route prefix `/api`, load from `src/routes` |

### RAG Pipeline References (Python backend — used for mock design)
| File | Purpose |
|---|---|
| `backend/app/rag/retriever.py` | ChromaDB CloudClient — `collection.query()` |
| `backend/app/rag/context_builder.py` | Builds size-limited context from document chunks |
| `backend/app/data_access/redis/redis_repo.py` | Redis caching layer |
| `backend/app/services/rag_service.py` | Full RAG pipeline orchestrator |
| `backend/app/services/search_service.py` | Semantic search via ChromaDB |

---

## Proposed Changes

### Configuration & Setup

#### [NEW] [jest.config.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/jest.config.ts)
- `ts-jest` preset with `CommonJS` module system
- `testMatch` patterns for `tests/unit/**/*.test.ts` and `tests/integration/**/*.test.ts`
- `setupFilesAfterSetup` → `tests/setup.ts`
- `moduleNameMapper` for path aliases if needed
- `testTimeout` set to 30s (mongodb-memory-server cold start)

#### [NEW] [tests/setup.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/setup.ts)
- `beforeAll`: Spin up `MongoMemoryServer`, connect Mongoose
- `afterEach`: Drop all collections (wipe between tests)
- `afterAll`: Disconnect Mongoose, stop MongoMemoryServer
- Override `connectDB` to prevent the live connection from firing

#### [MODIFY] [package.json](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/package.json)
- Add `devDependencies`: `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`, `mongodb-memory-server`
- Add script: `"test": "jest --forceExit --detectOpenHandles"`

#### [MODIFY] [tsconfig.json](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tsconfig.json)
- Add `"types": ["jest"]` to `compilerOptions`
- Ensure `tests/` is included in compilation

---

### Mock Stubs (`tests/mocks/`)

#### [NEW] [tests/mocks/redis.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/mocks/redis.ts)
Fake Redis client backed by a `Map<string, string>`:
- `get(key)` → returns stored value or `null`
- `set(key, value, options?)` → stores in map
- `del(key)` → deletes from map
- `flushAll()` → clears map
- `setEx(key, ttl, value)` → stores (TTL ignored in mock)
- Exposes `_store` for test assertions

#### [NEW] [tests/mocks/chroma.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/mocks/chroma.ts)
Fake ChromaDB client with in-memory collection store:
- `getOrCreateCollection({ name })` → returns collection with `add()`, `query()`, `get()`, `delete()`
- `query()` returns realistic RAG-shaped response: `{ documents, distances, metadatas }`
- `add()` accumulates documents/embeddings/ids in memory
- Helper `_reset()` to clear between tests

#### [NEW] [tests/mocks/celery.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/mocks/celery.ts)
Fake Celery task dispatcher:
- `sendTask(taskName, args)` → immediately resolves, optionally updates mock Redis store to simulate task completion
- `getTaskResult(taskId)` → returns `{ status: "SUCCESS", result: {...} }`

#### [NEW] [tests/mocks/auth.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/mocks/auth.ts)
Mock JWT middleware:
- Replaces `checkJwt` with a passthrough that attaches `req.auth = { payload: { sub: "auth0|test-user-123" } }`
- Configurable to simulate `401 Unauthorized` scenarios

---

### Unit Tests — Services (`tests/unit/services/`)

#### [NEW] [tests/unit/services/user_service.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/unit/services/user_service.test.ts)
Tests for `syncUserInDB`:
- **Creates new user** — verifies MongoDB document creation with correct fields
- **Updates existing user** — upsert updates email/name without creating duplicates
- **Handles missing optional fields** — email/name are optional
- **Idempotent on repeated calls** — same auth0Id returns same user
- Uses in-memory MongoDB (via `tests/setup.ts`)

#### [NEW] [tests/unit/services/health_service.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/unit/services/health_service.test.ts)
Tests for `health_service`:
- Returns `{ status: "ok" }`
- Pure function, no side effects

---

### Unit Tests — Controllers (`tests/unit/controllers/`)

#### [NEW] [tests/unit/controllers/user_controller.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/unit/controllers/user_controller.test.ts)
Tests for `syncUser` (service layer fully mocked via `jest.mock()`):
- **401** — no `req.auth.payload.sub`
- **400** — missing `email` or `name` in body
- **200** — valid request returns verification response
- **500** — service throws, controller catches and returns error JSON
- Verifies correct HTTP status codes and JSON shape

#### [NEW] [tests/unit/controllers/health_controller.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/unit/controllers/health_controller.test.ts)
Tests for `health_controller`:
- Returns JSON `{ status: "ok" }`
- Calls `health_service` exactly once

---

### Integration Tests (`tests/integration/`)

#### [NEW] [tests/integration/health.integration.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/integration/health.integration.test.ts)
Full lifecycle test via Supertest:
- `GET /api/health/` → `200` with `{ status: "ok" }`

#### [NEW] [tests/integration/auth.integration.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/integration/auth.integration.test.ts)
Full lifecycle test for user sync:
- `POST /api/auth/sync-user` with mock JWT → `200` with user data
- `POST /api/auth/sync-user` without JWT → `401`
- `POST /api/auth/sync-user` with missing body fields → `400`
- Mocks `checkJwt` via `jest.mock()` to use `tests/mocks/auth.ts`

#### [NEW] [tests/integration/docstatus.integration.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/integration/docstatus.integration.test.ts)
Full lifecycle test for document status retrieval:
- Seed documents into in-memory MongoDB
- `GET /api/docstatus/documents/:auth0Id` → returns seeded documents
- Empty auth0Id → returns empty array

#### [NEW] [tests/integration/metadata.integration.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/integration/metadata.integration.test.ts)
Full lifecycle test for document metadata creation:
- `POST /api/metadata/` with valid payload → `200` with created document
- `POST /api/metadata/` with missing required fields → `400`
- Verifies document persisted in in-memory MongoDB

#### [NEW] [tests/integration/userdocretrieval.integration.test.ts](file:///e:/03-Code/Projects/Legacy/DocsSense/auth/tests/integration/userdocretrieval.integration.test.ts)
Full lifecycle test for user document retrieval:
- Seed documents, verify sorted retrieval by `createdAt` descending
- Query for non-existent user → empty array

---

## User Review Required

> [!IMPORTANT]
> **Scope Boundary**: The test suite targets the `auth/` Node.js service only. The Python backend (`backend/`) uses a completely different tech stack (FastAPI, pytest). The ChromaDB/Redis/Celery mock stubs are created to model future cross-service integration points and to satisfy your blueprint requirements, but the current auth service does not directly import ChromaDB or Celery clients.

> [!WARNING]
> **`app.ts` side-effect**: The current `app.ts` calls `connectDB()` at import time. The test setup must mock `connectDB` **before** importing the app to prevent live DB connection attempts. This will be handled via `jest.mock("../src/utils/db/db")` in the setup file.

> [!NOTE]
> **ExpressKit Dynamic Route Loader**: The route auto-loader uses `process.cwd()` and dynamic `import()` to discover routes at runtime. The integration tests will import a **test-safe version of the Express app** that pre-registers routes statically, bypassing the filesystem-based loader to ensure deterministic test behavior.

---

## Files Summary

| Action | Path | Purpose |
|---|---|---|
| NEW | `auth/jest.config.ts` | Jest configuration |
| NEW | `auth/tests/setup.ts` | Global test setup (MongoMemoryServer) |
| NEW | `auth/tests/mocks/redis.ts` | Fake Redis client stub |
| NEW | `auth/tests/mocks/chroma.ts` | Fake ChromaDB client stub |
| NEW | `auth/tests/mocks/celery.ts` | Fake Celery dispatcher stub |
| NEW | `auth/tests/mocks/auth.ts` | Mock JWT middleware |
| NEW | `auth/tests/helpers/app.ts` | Test-safe Express app (static route registration) |
| NEW | `auth/tests/unit/services/user_service.test.ts` | User service unit tests |
| NEW | `auth/tests/unit/services/health_service.test.ts` | Health service unit tests |
| NEW | `auth/tests/unit/controllers/user_controller.test.ts` | User controller unit tests |
| NEW | `auth/tests/unit/controllers/health_controller.test.ts` | Health controller unit tests |
| NEW | `auth/tests/integration/health.integration.test.ts` | Health endpoint integration test |
| NEW | `auth/tests/integration/auth.integration.test.ts` | Auth sync endpoint integration test |
| NEW | `auth/tests/integration/docstatus.integration.test.ts` | Doc status endpoint integration test |
| NEW | `auth/tests/integration/metadata.integration.test.ts` | Metadata endpoint integration test |
| NEW | `auth/tests/integration/userdocretrieval.integration.test.ts` | User doc retrieval integration test |
| MODIFY | `auth/package.json` | Add test dependencies and script |
| MODIFY | `auth/tsconfig.json` | Include test types |

**Total: 16 new files, 2 modified files**

---

## Verification Plan

### Automated Tests
```bash
cd auth
npm install
npx jest --forceExit --detectOpenHandles --verbose
```

All tests must:
- Pass with exit code 0
- Use only in-memory MongoDB (no network calls)
- Never hit live Auth0, Redis, ChromaDB, or Celery
- Complete within 60 seconds total

### Self-Correction Checks
- Verify `mockChromaClient.getOrCreateCollection` is called and returns realistic data shapes
- Verify `mockRedisClient.get/set` interactions test both cache hit and cache miss paths
- Verify `mockCeleryClient.sendTask` simulates task completion
- Verify auth mock correctly attaches `req.auth` payload and blocks when disabled
