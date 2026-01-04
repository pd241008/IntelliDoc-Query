from app.data_access.redis.redis_repo_sync import (
    update_status_sync,
    delete_ocr_cache_sync
)
from app.data_access.mongodb.search_result_repository import search_results_collection
from app.utils import ml_utils


def handle_embedding_task(message: dict):

    file_id = message.get("file_id")
    raw_text = message.get("raw_text")

    if not file_id or not raw_text:
        raise ValueError("Embedding task requires file_id and raw_text")

    try:
        update_status_sync(file_id, "START", "Embedding worker started")

        cleaned_text = ml_utils.clean_text_utility(raw_text)
        update_status_sync(file_id, "CLEANED", "Text cleaned")

        metadata = ml_utils.generate_metadata_utility(cleaned_text)
        update_status_sync(file_id, "METADATA", "Metadata generated")

        embeddings = ml_utils.create_embeddings_utility(cleaned_text)
        update_status_sync(file_id, "EMBEDDING", "Embeddings generated")

        # ✅ Persistence happens HERE, directly
        search_results_collection.insert_many(
            document_id=file_id,
            chunks=embeddings
        )

        update_status_sync(file_id, "STORED", "Embeddings stored")
        update_status_sync(file_id, "COMPLETE", "Pipeline complete", status="COMPLETE")

        delete_ocr_cache_sync(file_id)

    except Exception as e:
        update_status_sync(
            file_id,
            "FAILED",
            f"Embedding worker failed: {str(e)}",
            status="FAILED"
        )
        delete_ocr_cache_sync(file_id)
        raise
