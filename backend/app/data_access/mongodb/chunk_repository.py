from data_access.mongodb.connections import chunks_collection
from datetime import datetime

class ChunkRepository:

    @staticmethod
    def insert_many(document_id: str, chunks: list[dict]):
        documents = []

        for chunk in chunks:
            documents.append({
                "document_id": document_id,
                "text": chunk["text"],
                "embedding": chunk["embedding"],
                "metadata": chunk.get("metadata", {}),
                "created_at": datetime.utcnow()
            })

        chunks_collection.insert_many(documents)
