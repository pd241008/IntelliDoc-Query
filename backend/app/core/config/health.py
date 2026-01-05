# app/core/config/health.py

import time
from datetime import datetime
from typing import Literal

START_TIME = time.time()

HealthStatus = Literal["connected", "disconnected", "unknown"]
PipelineStatus = Literal["idle", "running", "failed", "completed", "unknown"]

health = {
    "api": {"status": "up"},
    "broker": {
        "provider": "redis",
        "status": "unknown",   # connected | disconnected
        "last_checked": None,
    },
    "vector_db": {
        "provider": "chroma-cloud",
        "status": "unknown",   # connected | disconnected
        "last_checked": None,
    },
    "pipelines": {
        "ingestion": {
            "status": "unknown",  # idle | running | failed | completed
            "last_updated": None,
        },
        "semantic_search": {
            "status": "unknown",
            "last_updated": None,
        },
    },
}

# ----------------------------
# MARKERS (called by infra)
# ----------------------------
def mark_broker(status: HealthStatus):
    health["broker"]["status"] = status
    health["broker"]["last_checked"] = datetime.utcnow().isoformat() + "Z"


def mark_vector_db(status: HealthStatus):
    health["vector_db"]["status"] = status
    health["vector_db"]["last_checked"] = datetime.utcnow().isoformat() + "Z"


def mark_pipeline(name: str, status: PipelineStatus):
    if name not in health["pipelines"]:
        raise ValueError(f"Unknown pipeline: {name}")

    health["pipelines"][name]["status"] = status
    health["pipelines"][name]["last_updated"] = datetime.utcnow().isoformat() + "Z"


# ----------------------------
# READ MODEL (API-safe)
# ----------------------------
def get_health():
    uptime = int(time.time() - START_TIME)

    overall = "ok"

    # Infra health affects overall status
    if health["broker"]["status"] != "connected":
        overall = "degraded"

    if health["vector_db"]["status"] != "connected":
        overall = "degraded"

    return {
        "status": overall,
        "service": "intellidoc-backend",
        "environment": "cloud",
        "uptime": f"{uptime}s",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": health,
    }
