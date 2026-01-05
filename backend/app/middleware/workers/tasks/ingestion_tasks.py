from celery import shared_task
import os
from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
from chromadb import CloudClient

from app.contracts.ingestion_contracts.ingestion import (
    CleanTextContract,
    EmbeddingContract,
    StorageResultContract,
)

from app.data_access.redis.redis_repo_sync import (
    update_status_sync,
    delete_ocr_cache_sync,
)

# ✅ PIPELINE HEALTH
from app.core.config.health import mark_pipeline

# ---------------------------------------------------------
# LOAD ENV
# ---------------------------------------------------------
load_dotenv()

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "docsense")

if not all([CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE]):
    raise ValueError("Chroma Cloud env vars missing!")

# ---------------------------------------------------------
# EMBEDDING MODEL
# ---------------------------------------------------------
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# ---------------------------------------------------------
# CHROMA CLOUD CLIENT
# ---------------------------------------------------------
chroma_client = CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
)

collection = chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION_NAME,
    metadata={"project": "DocSense", "space": "cosine"},
)

# ---------------------------------------------------------
# 1️⃣ CLEAN TEXT
# ---------------------------------------------------------
@shared_task
def clean_text_task(file_id: str, raw_text: str):
    cleaned_text = " ".join(raw_text.split())

    contract = CleanTextContract(
        file_id=file_id,
        cleaned_text=cleaned_text,
    )

    return contract.model_dump(mode="json")


# ---------------------------------------------------------
# 2️⃣ GENERATE EMBEDDINGS
# ---------------------------------------------------------
@shared_task(bind=True)
def generate_embeddings_task(self, payload: dict):
    contract = CleanTextContract(**payload)

    try:
        # 🟡 PIPELINE RUNNING
        mark_pipeline("ingestion", "running")

        update_status_sync(
            contract.file_id,
            "Embedding",
            "Generating local embeddings...",
        )

        embedding = embedding_model.encode(
            contract.cleaned_text,
            normalize_embeddings=True,
        ).tolist()

        result = EmbeddingContract(
            file_id=contract.file_id,
            cleaned_text=contract.cleaned_text,
            embedding=embedding,
        )

        update_status_sync(
            contract.file_id,
            "Embedding",
            "Embedding generated successfully",
            status="Completed",
        )

        return result.model_dump(mode="json")

    except Exception as e:
        update_status_sync(
            contract.file_id,
            "Embedding",
            f"Failed: {str(e)}",
            status="Error",
        )

        # 🔴 PIPELINE FAILED
        mark_pipeline("ingestion", "failed")
        raise


# ---------------------------------------------------------
# 3️⃣ STORE IN CHROMA CLOUD
# ---------------------------------------------------------
@shared_task(bind=True)
def store_in_chroma_task(self, payload: dict):
    contract = EmbeddingContract(**payload)

    try:
        update_status_sync(
            contract.file_id,
            "Vector Storage",
            "Storing document in Chroma Cloud...",
        )

        collection.add(
            ids=[contract.file_id],
            documents=[contract.cleaned_text],
            embeddings=[contract.embedding],
            metadatas=[{"file_id": contract.file_id}],
        )

        update_status_sync(
            contract.file_id,
            "Vector Storage",
            "Stored successfully",
            status="Completed",
        )

        return StorageResultContract(
            file_id=contract.file_id
        ).model_dump(mode="json")

    except Exception as e:
        update_status_sync(
            contract.file_id,
            "Vector Storage",
            f"Failed: {str(e)}",
            status="Error",
        )

        # 🔴 PIPELINE FAILED
        mark_pipeline("ingestion", "failed")
        raise


# ---------------------------------------------------------
# 4️⃣ CLEAN REDIS CACHE (FINAL STEP)
# ---------------------------------------------------------
@shared_task
def delete_redis_cache_task(payload: dict):
    file_id = payload["file_id"]

    delete_ocr_cache_sync(file_id)

    update_status_sync(
        file_id,
        "Cleanup",
        "OCR cache removed from Redis",
        status="Completed",
    )

    # 🟢 PIPELINE COMPLETED
    mark_pipeline("ingestion", "completed")

    return {
        "file_id": file_id,
        "status": "Cache Cleared",
    }
