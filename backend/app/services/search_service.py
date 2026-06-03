from typing import List, Dict, Any
import re
from app.data_access.chromadb.search_repo import query_documents
from app.rag.query_embedding import embed_query

def extract_keywords(query: str) -> List[str]:
    # Extract alphanumeric words and filter by length > 3
    words = re.findall(r'\b\w+\b', query.lower())
    return [w for w in set(words) if len(w) > 3]

def semantic_search(
    query: str,
    limit: int = 5,
    client_id: str = ""
) -> List[Dict[str, Any]]:
    """
    Hybrid Search Pipeline (Service Layer)
    Combines Semantic Search and Keyword Search using Reciprocal Rank Fusion.
    """
    query_embeddings = [embed_query(query)]
    
    # Semantic Search
    semantic_results = query_documents(
        query=query,
        limit=limit,
        client_id=client_id,
        query_embeddings=query_embeddings
    )

    # Keyword Search
    keyword_results = []
    keywords = extract_keywords(query)
    if keywords:
        where_document = {"$or": [{"$contains": kw} for kw in keywords]} if len(keywords) > 1 else {"$contains": keywords[0]}
        keyword_results = query_documents(
            query=query,
            limit=limit,
            client_id=client_id,
            query_embeddings=query_embeddings,
            where_document=where_document
        )

    # Combine results and deduplicate (Reciprocal Rank Fusion - RRF)
    scores = {}
    combined_docs = {}
    
    # Rank semantic
    for rank, item in enumerate(semantic_results):
        doc = item["text"]
        combined_docs[doc] = item
        scores[doc] = scores.get(doc, 0) + 1.0 / (rank + 60)
        
    # Rank keyword
    for rank, item in enumerate(keyword_results):
        doc = item["text"]
        combined_docs[doc] = item
        scores[doc] = scores.get(doc, 0) + 1.0 / (rank + 60)
        
    if not scores:
        return []
        
    # Sort by RRF score descending
    sorted_docs = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    top_docs = sorted_docs[:limit]
    
    return [
        {
            "document": doc,
            "metadata": combined_docs[doc].get("metadata"),
            "score": scores[doc],
        }
        for doc in top_docs
    ]
