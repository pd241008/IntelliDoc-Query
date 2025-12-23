# app/middleware/celery/pipeline.py

from typing import cast 
from celery import chain
from celery.canvas import Signature
from celery.app.task import Task

# 🌟 IMPORT THE APP INSTANCE: This triggers the config loading
from app.middleware.celery.celery_app import celery_app

# Import the decorated functions
from app.middleware.celery.tasks import ( 
    clean_text_task as _clean_text_task,
    generate_embeddings_task as _generate_embeddings_task,
    store_in_chroma_task as _store_in_chroma_task,
    delete_redis_cache_task as _delete_redis_cache_task,
)

# Use cast() to force Pylance to accept these as Tasks
clean_text_task = cast(Task, _clean_text_task)
generate_embeddings_task = cast(Task, _generate_embeddings_task)
store_in_chroma_task = cast(Task, _store_in_chroma_task)
delete_redis_cache_task = cast(Task, _delete_redis_cache_task)

def vector_pipeline(file_id: str, raw_ocr_text: str):
    """
    Chains:
      raw text → clean → embed (Gemini) → store in Chroma Cloud → empty Redis cache
    """
    workflow: Signature = chain(
        clean_text_task.s(file_id, raw_ocr_text),
        generate_embeddings_task.s(), # Note: payload passes automatically in chain
        store_in_chroma_task.s(),
        delete_redis_cache_task.s()
    )

    # Now this will correctly use the Redis Broker
    workflow.delay()

    return {"status": "Pipeline started", "file_id": file_id}