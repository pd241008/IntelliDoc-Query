# app/middleware/workers/ingestion_pipeline/celery_app.py

import os
from celery import Celery
from dotenv import load_dotenv

# Load environment variables from the parent directory where .env is located
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"))
REDIS_URL = os.getenv("REDIS_URL")

# ✅ Explicitly include the exact paths to the files containing your @shared_task definitions
celery_app = Celery(
    "docssense",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.middleware.workers.ingestion_pipeline.ingestion_pipeline",
        "app.middleware.workers.ingestion_pipeline.tasks.ingestion_tasks" # Ensure your sub-tasks are loaded too!
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,

    task_time_limit=300,
    task_soft_time_limit=240,
)
