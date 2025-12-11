from celery import Celery
import os 
from dotenv import load_dotenv


load_dotenv()
api_key = os.getenv("REDIS_URL")
if not api_key:
    raise ValueError("REDIS_URL not set in environment variables.")



app = Celery()

app.conf.update(
    # The URL for the message queue (Broker)
    broker_url=api_key,
    
    # The URL for storing the results (Result Backend) - often the same as the broker
    result_backend=api_key,
    
    # Modules to automatically import when the worker starts
    imports=('app.middleware.celery.tasks',), 
    
    # Optional: Recommended setting for production reliability
    task_acks_late=True,
    
    # Optional: Time tasks can be invisible before being re-queued 
    # (Set this based on your longest task time + safety buffer, e.g., 300 seconds = 5 minutes)
    visibility_timeout=300, 
)

