from celery import chain
from celery.canvas import Signature
from celery import shared_task
from celery.app.task import Task
from typing import cast

from app.core.config.health import mark_pipeline

from app.middleware.workers.ingestion_pipeline.tasks.ingestion_tasks import (
    clean_text_task,
    chunk_document_task,
    generate_embeddings_task,
    store_in_chroma_task,
    delete_redis_cache_task,
)


@shared_task(name="start_ingestion_pipeline")
def start_ingestion_pipeline(file_id: str, raw_ocr_text: str):

    try:
        mark_pipeline("ingestion", "running")

        clean_task: Task = cast(Task, clean_text_task)
        chunk_task: Task = cast(Task, chunk_document_task)
        embed_task: Task = cast(Task, generate_embeddings_task)
        store_task: Task = cast(Task, store_in_chroma_task)
        delete_cache_task: Task = cast(Task, delete_redis_cache_task)

        workflow: Signature = chain(
            clean_task.s(file_id, raw_ocr_text),
            chunk_task.s(),
            embed_task.s(),
            store_task.s(),
            delete_cache_task.s(),
        )

        workflow.apply_async()

        return {
            "status": "pipeline started",
            "file_id": file_id,
        }

    except Exception as e:
        mark_pipeline("ingestion", "failed")
        raise RuntimeError(f"Ingestion pipeline failed: {e}")