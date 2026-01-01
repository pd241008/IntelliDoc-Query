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


def semantic_search(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    collection = _get_collection()

    result = collection.query(
        query_texts=[query],
        n_results=limit,
    )

    if result is None:
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
