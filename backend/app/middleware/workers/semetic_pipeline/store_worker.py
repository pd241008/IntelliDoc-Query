from data_access.mongodb.chunk_repository import ChunkRepository

def handle_store(message: dict):
    ChunkRepository.insert_many(
        document_id=message["document_id"],
        chunks=message["chunks"]
    )
