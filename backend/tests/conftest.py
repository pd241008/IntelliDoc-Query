"""
conftest.py — Global Test Configuration for IntelliDoc Backend

=================================================================
CRITICAL IMPORT ORDER — DO NOT REARRANGE
=================================================================
This file patches external library constructors at the module level
BEFORE any application module is imported. The order is:

  1. Set environment variables  (prevents ValueError in redis_repo_sync)
  2. Import mock implementations (pure Python, no app deps)
  3. Patch redis (sync + async)  (prevents live Redis connections)
  4. Patch SentenceTransformer   (prevents 80MB model download)
  5. Patch ChromaDB              (prevents Chroma Cloud API calls)
  6. Import the FastAPI app      (triggers all app module imports — now safe)
  7. Configure Celery EAGER mode (tasks run synchronously in-process)

This ensures ZERO network calls during test collection and execution.
=================================================================
"""

# =============================================================
# STEP 1: Environment Variables — MUST be first
# =============================================================
import os

os.environ.setdefault("REDIS_URL", "redis://fakehost:6379/0")
os.environ.setdefault("CHROMA_API_KEY", "test-api-key")
os.environ.setdefault("CHROMA_TENANT", "test-tenant")
os.environ.setdefault("CHROMA_DATABASE", "test-database")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/test_intellidoc")
os.environ.setdefault("MONGO_DB", "test_intellidoc")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")


# =============================================================
# STEP 2: Import mock implementations (no app dependencies)
# =============================================================
from tests.mocks.mock_redis import FakeSyncRedis, FakeAsyncRedis
from tests.mocks.mock_embeddings import FakeEmbeddingModel
from tests.mocks.mock_vector_db import MockChromaClient


# =============================================================
# STEP 3: Patch Redis — sync and async
# =============================================================
# redis_repo_sync.py: redis_client = redis.Redis.from_url(REDIS_URL, ...)
# ingestion_tasks.py: redis_client = redis.from_url(REDIS_URL, ...)
# Both execute at MODULE LEVEL during import — must be patched first.

import redis as _redis_lib

# Shared backing store so all sync Redis instances see the same data
# (redis_repo_sync + ingestion_tasks share a common store)
_sync_redis_store: dict = {}


def _make_sync_redis(*args, **kwargs):
    """Factory that returns FakeSyncRedis backed by the shared store."""
    return FakeSyncRedis(store=_sync_redis_store)


_redis_lib.from_url = _make_sync_redis
_redis_lib.Redis.from_url = _make_sync_redis

# Async: redis_repo.py uses redis.asyncio.from_url() at RUNTIME
import redis.asyncio as _async_redis_lib

_async_redis_instance = FakeAsyncRedis()


def _make_async_redis(*args, **kwargs):
    """Factory that returns the shared FakeAsyncRedis instance."""
    return _async_redis_instance


_async_redis_lib.from_url = _make_async_redis


# =============================================================
# STEP 4: Patch SentenceTransformer
# =============================================================
# query_embedding.py: _model = SentenceTransformer("all-MiniLM-L6-v2")
# ingestion_tasks.py: embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
# Both execute at MODULE LEVEL during import.

import sentence_transformers

sentence_transformers.SentenceTransformer = (
    lambda *args, **kwargs: FakeEmbeddingModel()
)


# =============================================================
# STEP 5: Patch ChromaDB
# =============================================================
# search_repo.py: from chromadb import CloudClient  (used at runtime)
# chromaconnection.py: chromadb.CloudClient(...)     (used at runtime)
# ml_utils.py: chromadb.Client(Settings(...))        (module level)

import chromadb

_mock_chroma = MockChromaClient()

chromadb.CloudClient = lambda *args, **kwargs: _mock_chroma
chromadb.Client = lambda *args, **kwargs: _mock_chroma


# =============================================================
# STEP 6: Now safe to import the application
# =============================================================
# All side-effectful constructors have been replaced.
# Importing main.py triggers the full module import chain:
#   main → api_router → upload/health/processing/query routes
#     → redis_repo_sync (patched ✓)
#     → ingestion_tasks  (patched ✓)
#     → query_embedding  (patched ✓)
#     → search_repo      (patched ✓)
#     → ocr_service      (imports pdf2image/pytesseract — install required)

import pytest
from fastapi.testclient import TestClient
from main import app


# =============================================================
# STEP 7: Configure Celery EAGER mode
# =============================================================
# Forces Celery tasks to execute synchronously in the same thread.
# No Redis broker or Celery worker process needed.

from app.middleware.workers.ingestion_pipeline.celery_app import celery_app

celery_app.conf.update(
    task_always_eager=True,
    task_eager_propagates=True,
    broker_url="memory://",
    result_backend="cache+memory://",
)


# =============================================================
# FIXTURES
# =============================================================

@pytest.fixture(scope="session")
def client():
    """
    FastAPI TestClient — session-scoped for performance.

    The TestClient wraps the ASGI app in a synchronous interface.
    Async endpoints are handled internally by the TestClient.
    """
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _reset_stores():
    """
    Reset all fake data stores between tests.

    Ensures complete test isolation:
    - Sync Redis (health system + ingestion pipeline)
    - Async Redis (status updates + OCR cache)
    - Async Redis global client ref (forces re-creation)
    """
    _sync_redis_store.clear()
    _async_redis_instance._store.clear()

    # Reset the module-level global so get_redis_client() re-initializes
    from app.data_access.redis import redis_repo
    redis_repo.redis_client = None

    yield

    _sync_redis_store.clear()
    _async_redis_instance._store.clear()
