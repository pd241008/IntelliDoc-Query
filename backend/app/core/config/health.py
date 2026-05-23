# app/core/config/health.py

import time
import json
from datetime import datetime, timedelta
from typing import Literal

from app.data_access.redis import redis_repo_sync

START_TIME = time.time()

HealthStatus = Literal["connected", "disconnected", "unknown"]
PipelineStatus = Literal["idle", "running", "failed", "completed", "unknown"]

DEFAULT_HEALTH = {
    "api": {"status": "up"},
    "broker": {
        "provider": "redis",
        "status": "unknown",
        "last_checked": None,
    },
    "vector_db": {
        "provider": "chroma-cloud",
        "status": "unknown",
        "last_checked": None,
    },
    "pipelines": {
        "ingestion": {
            "status": "unknown",
            "last_updated": None,
        },
        "semantic_search": {
            "status": "unknown",
            "last_updated": None,
        },
    },
}


# ----------------------------
# Redis Helpers
# ----------------------------

def _set_status(key: str, data: dict):
    """Save status to Redis."""
    client = redis_repo_sync.redis_client
    client.set(f"health:{key}", json.dumps(data))


def _get_status(key: str, default: dict) -> dict:
    """Fetch status from Redis safely."""
    client = redis_repo_sync.redis_client
    data = client.get(f"health:{key}")

    if data is None:
        return default

    # Redis returns bytes
    if isinstance(data, bytes):
        try:
            return json.loads(data.decode())
        except Exception:
            return default

    return default


# ----------------------------
# MARKERS (called by infra & Celery workers)
# ----------------------------

def mark_broker(status: HealthStatus):
    _set_status("broker", {
        "provider": "redis",
        "status": status,
        "last_checked": datetime.utcnow().isoformat() + "Z"
    })


def mark_vector_db(status: HealthStatus):
    _set_status("vector_db", {
        "provider": "chroma-cloud",
        "status": status,
        "last_checked": datetime.utcnow().isoformat() + "Z"
    })


def mark_pipeline(name: str, status: PipelineStatus):
    if name not in DEFAULT_HEALTH["pipelines"]:
        raise ValueError(f"Unknown pipeline: {name}")

    _set_status(f"pipeline:{name}", {
        "status": status,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    })


# ----------------------------
# Helper: Detect stale pipelines
# ----------------------------

def _pipeline_stale(data: dict, timeout_minutes: int = 10) -> bool:
    """Detect if a pipeline has been stuck too long."""
    last_updated = data.get("last_updated")

    if not last_updated:
        return False

    try:
        last = datetime.fromisoformat(last_updated.replace("Z", ""))
        return datetime.utcnow() - last > timedelta(minutes=timeout_minutes)
    except Exception:
        return False


# ----------------------------
# READ MODEL (API-safe)
# ----------------------------

def get_health():
    uptime = int(time.time() - START_TIME)

    broker_data = _get_status("broker", DEFAULT_HEALTH["broker"])
    vector_db_data = _get_status("vector_db", DEFAULT_HEALTH["vector_db"])
    ingestion_data = _get_status(
        "pipeline:ingestion",
        DEFAULT_HEALTH["pipelines"]["ingestion"]
    )
    search_data = _get_status(
        "pipeline:semantic_search",
        DEFAULT_HEALTH["pipelines"]["semantic_search"]
    )

    # Fix stale pipelines
    if ingestion_data["status"] == "running" and _pipeline_stale(ingestion_data):
        ingestion_data["status"] = "idle"

    if search_data["status"] == "running" and _pipeline_stale(search_data):
        search_data["status"] = "idle"

    overall = "ok"

    if broker_data["status"] != "connected":
        overall = "degraded"

    if vector_db_data["status"] != "connected":
        overall = "degraded"

    return {
        "status": overall,
        "service": "intellidoc-backend",
        "environment": "cloud",
        "uptime": f"{uptime}s",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "api": {"status": "up"},
            "broker": broker_data,
            "vector_db": vector_db_data,
            "pipelines": {
                "ingestion": ingestion_data,
                "semantic_search": search_data,
            }
        }
    }