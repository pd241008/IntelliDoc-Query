# IntelliDoc Full-Stack Testing Architecture

This document provides a comprehensive overview of the testing strategy, frameworks, and architecture implemented across the IntelliDoc platform. We have built three isolated, production-grade test suites designed to run completely offline, without relying on external network dependencies or live cloud services.

## Executive Summary
- **Total Tests:** 228+ automated tests
- **Coverage:** Auth Microservice, Python AI Backend, and Next.js Frontend
- **Core Philosophy:** 100% Mocked Infrastructure, Zero live API calls to external services, and highly deterministic execution.

---

## 1. Auth Service Suite (Node.js)
The Auth service handles user synchronization, session metadata, and basic document status tracking.

- **Frameworks:** Jest, ts-jest, Supertest
- **Test Count:** 50
- **Architectural Highlights:**
  - **In-Memory Database:** We utilize `mongodb-memory-server` to spin up an ephemeral MongoDB instance that is wiped between test blocks, ensuring isolated state.
  - **Middleware Stubbing:** Live Auth0 / OAuth middlewares are stubbed out at the import level via Jest's `moduleNameMapper`. This guarantees that internal routes can be tested without acquiring or validating real JWTs.
- **Execution:**
  ```bash
  cd auth
  npm run test
  ```

> **Note:** For a detailed breakdown of the test strategy and execution results, check the `testing_auth` (Implementation Plan) and `test_result_auth` (Walkthrough) files located in the `auth/` directory.

---

## 2. AI Backend Suite (Python)
The Backend service manages document upload, text extraction (OCR), chunking, embeddings, vector storage, and Retrieval-Augmented Generation (RAG).

- **Frameworks:** pytest, pytest-mock, pytest-asyncio, httpx (TestClient)
- **Test Count:** 84
- **Architectural Highlights:**
  - **Pre-emptive Monkey-patching:** The AI microservices (Redis, ChromaDB, SentenceTransformers) normally initialize external connections immediately upon import. We intercept these side effects inside `conftest.py` *before* the FastAPI app is loaded, replacing them with fake synchronous alternatives (e.g., dict-backed Redis, memory-backed Chroma logic).
  - **Synchronous Task Queues:** Celery background ingestion workflows are configured with `task_always_eager=True`, turning asynchronous ML pipelines into fast, synchronous, and deterministic test cases.
- **Execution:**
  ```bash
  cd backend
  pytest -v
  ```

> **Note:** For a detailed breakdown of the test strategy and execution results, check the `testing_backend` (Implementation Plan) and `test_result_backend` (Walkthrough) files located in the `backend/` directory.

---

## 3. Frontend Suite (Next.js)
The Frontend serves as the central hub featuring an aesthetic neo-brutalist design, complete with document galleries, status widgets, and user dashboards.

- **Frameworks:** Vitest, React Testing Library (RTL), Playwright, Mock Service Worker (MSW)
- **Test Count:** 94 Component Unit Tests, 31 E2E Journey Specs
- **Architectural Highlights:**
  - **API Interception:** We implemented Mock Service Worker (MSW) to intercept and spoof all outgoing `fetch` calls. The UI can seamlessly simulate various backend scenarios (Healthy, Degraded, Down) without the backend even running.
  - **Complex Layout Mocking:** Difficult Next.js internals (`next/navigation`, `next/image`) are replaced with static mocks in the Vitest global setup.
  - **Canvas Mocks:** Chart.js elements (which render into `<canvas>`) correctly mock the 2D context to avoid crashing the headless DOM environment (`jsdom`).
  - **Playwright E2E:** E2E specs validate critical "Happy Path" user journeys mapping the actual browser DOM elements, executing against the live local development server.
- **Execution:**
  ```bash
  cd frontend
  # Run Component Unit Tests
  npm run test:unit
  
  # Run Full E2E Browser Suite
  # NOTE: Run `npx playwright install` before your first E2E test!
  npm run test:e2e
  ```

> **Note:** For a detailed breakdown of the test strategy and execution results, check the `testing_frontend` (Implementation Plan) and `test_result_frontend` (Walkthrough) files located in the `frontend/` directory.

---

### Conclusion
By decoupling our tests from external databases, active ML models, Auth0, and network limits, the holistic test suite runs in mere seconds, providing immense confidence in system stability prior to integration, deployment, or Hugging Face Space publishing.
