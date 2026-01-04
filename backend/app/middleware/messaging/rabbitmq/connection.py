import os
import pika
from app.core.config.health import mark_rabbitmq

RABBITMQ_URL = os.getenv("RABBITMQ_URL")

def get_connection():
    if not RABBITMQ_URL:
        mark_rabbitmq("misconfigured")
        raise RuntimeError("RABBITMQ_URL not set")

    try:
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        mark_rabbitmq("connected")
        return connection
    except Exception:
        mark_rabbitmq("down")
        raise
