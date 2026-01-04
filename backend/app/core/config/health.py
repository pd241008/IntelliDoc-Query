# app/core/config/health.py

import time
from datetime import datetime

START_TIME = time.time()

health = {
    "api": {"status": "up"},
    "broker": {
        "provider": "redis",
        "status": "unknown"
    },
    "vector_db": {
        "provider": "chroma-cloud",
        "status": "unknown"
    },
    "pipelines": {
        "ingestion": "unknown",
        "semantic_search": "unknown"
    }
}

# ----------------------------
# MARKERS (called by infra)
# ----------------------------
def mark_broker(status: str):
    health["broker"]["status"] = status

def mark_vector_db(status: str):
    health["vector_db"]["status"] = status

def mark_pipeline(name: str, status: str):
    health["pipelines"][name] = status

# ----------------------------
# READ MODEL (API-safe)
# ----------------------------
def get_health():
    uptime = int(time.time() - START_TIME)

    overall = "ok"
    for section in ["broker", "vector_db"]:
        if health[section]["status"] != "connected":
            overall = "degraded"

    return {
        "status": overall,
        "service": "intellidoc-backend",
        "environment": "cloud",
        "uptime": f"{uptime}s",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": health
    }
