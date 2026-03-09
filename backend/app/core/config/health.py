# app/core/config/health.py

import time
import json
from datetime import datetime
from typing import Literal

# ✅ Import your centralized synchronous Redis repository
from app.data_access.redis import redis_repo_sync

START_TIME = time.time()

HealthStatus = Literal["connected", "disconnected", "unknown"]
PipelineStatus = Literal["idle", "running", "failed", "completed", "unknown"]

# Base default structure for when the app first boots up
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
    """Saves status to Redis as a JSON string using the sync repo."""
    # ✅ Access the 'redis_client' variable directly from your repo
    client = redis_repo_sync.redis_client 
    client.set(f"health:{key}", json.dumps(data))

def _get_status(key: str, default: dict) -> dict:
    """Fetches status from Redis, falling back to default if not set."""
    # ✅ Access the 'redis_client' variable directly from your repo
    client = redis_repo_sync.redis_client
    data = client.get(f"health:{key}")
    
    # Check for string to satisfy Pylance json.loads type requirements
    if isinstance(data, str):
        return json.loads(data)
        
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
# READ MODEL (API-safe)
# ----------------------------
def get_health():
    uptime = int(time.time() - START_TIME)

    # Fetch live statuses straight from Redis
    broker_data = _get_status("broker", DEFAULT_HEALTH["broker"])
    vector_db_data = _get_status("vector_db", DEFAULT_HEALTH["vector_db"])
    ingestion_data = _get_status("pipeline:ingestion", DEFAULT_HEALTH["pipelines"]["ingestion"])
    search_data = _get_status("pipeline:semantic_search", DEFAULT_HEALTH["pipelines"]["semantic_search"])

    overall = "ok"

    # Infra health affects overall status
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