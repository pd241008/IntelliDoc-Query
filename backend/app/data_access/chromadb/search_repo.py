import os
from typing import List, Dict, Any
from chromadb import CloudClient


def _get_collection():
    client = CloudClient(
        api_key=os.getenv("CHROMA_API_KEY"),
        tenant=os.getenv("CHROMA_TENANT"),
        database=os.getenv("CHROMA_DATABASE"),
    )
    return client.get_collection("docsense")


def query_documents(query: str, limit: int = 5, client_id: str = "", query_embeddings: list = None, where_document: dict = None) -> List[Dict[str, Any]]:
    """
    Pure data access layer.
    No pipeline knowledge.
    No messaging.
    """
    collection = _get_collection()

    kwargs = {
        "n_results": limit,
    }
    
    if query_embeddings:
        kwargs["query_embeddings"] = query_embeddings
    else:
        kwargs["query_texts"] = [query]

    if client_id:
        kwargs["where"] = {"client_id": client_id}
        
    if where_document:
        kwargs["where_document"] = where_document

    result = collection.query(**kwargs)

    if not result:
        return []

    documents = result.get("documents") or [[]]
    metadatas = result.get("metadatas") or [[]]
    distances = result.get("distances") or [[]]

    docs = documents[0]
    metas = metadatas[0]
    dists = distances[0]

    return [
        {
            "text": doc,
            "metadata": meta,
            "score": 1 - dist if dist is not None else None,
        }
        for doc, meta, dist in zip(docs, metas, dists)
    ]
