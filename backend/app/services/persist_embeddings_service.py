from data_access.mongodb.chunk_repository import ChunkRepository

def persist_embeddings_service(payload: dict):
    document_id = payload["document_id"]
    chunks = payload["chunks"]

    if not chunks:
        raise ValueError("No chunks to persist")

    ChunkRepository.insert_many(
        document_id=document_id,
        chunks=chunks
    )
