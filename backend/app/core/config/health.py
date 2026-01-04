import time
from datetime import datetime

START_TIME = time.time()

health = {
    "api": {"status": "up"},
    "rabbitmq": {
        "provider": "cloudamqp",
        "queue": "semantic.search",
        "status": "unknown"
    },
    "pipelines": {
        "semantic_search": "unknown"
    }
}

def mark_rabbitmq(status: str):
    health["rabbitmq"]["status"] = status

def mark_pipeline(name: str, status: str):
    health["pipelines"][name] = status

def get_health():
    uptime = int(time.time() - START_TIME)

    overall = "ok"
    if health["rabbitmq"]["status"] != "connected":
        overall = "degraded"

    return {
        "status": overall,
        "service": "intellidoc-backend",
        "environment": "cloud",
        "uptime": f"{uptime}s",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": health
    }
