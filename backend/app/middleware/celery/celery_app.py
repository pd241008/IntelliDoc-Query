from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL")
if not redis_url:
    raise ValueError("REDIS_URL not set in environment variables.")

# Create Celery app
celery_app = Celery(
    "middleware",
    broker=redis_url,
    backend=redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    # This helps ensure the producer (FastAPI) doesn't hang if Redis is slow
    broker_connection_retry_on_startup=True 
)

# Auto-discover all tasks inside app/middleware/celery/
celery_app.autodiscover_tasks(["app.middleware.celery"])

# 🌟 KEY FIX: Set this as the default app for the current process.
# This tells the @shared_tasks in your FastAPI process to use 
# THIS Redis configuration instead of looking for RabbitMQ on localhost.
celery_app.set_default()