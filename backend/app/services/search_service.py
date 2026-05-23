from typing import List, Dict, Any

from app.data_access.chromadb.search_repo import query_documents


def semantic_search(
    query: str,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Semantic Search Pipeline (Service Layer)

    Responsibilities:
    - Accept raw query text
    - Delegate search to data access layer
    - Normalize results for downstream pipelines
    """

    results = query_documents(
        query=query,
        limit=limit
    )

    if not results:
        return []

    # Normalize output for RAG / APIs
    return [
        {
            "document": item.get("text"),
            "metadata": item.get("metadata"),
            "score": item.get("score"),
        }
        for item in results
    ]
