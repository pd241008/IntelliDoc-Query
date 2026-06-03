from typing import Dict, List, AsyncGenerator
import json
from app.services.search_service import semantic_search
from app.services.llm_chain_service import stream_llm, optimize_query

from app.core.config.health import mark_pipeline

from app.data_access.mongodb.document_repo import get_document

async def stream_rag_pipeline(query: str, top_k: int = 3, client_id: str = "", doc_id: str = "") -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline orchestrator with Streaming capabilities.
    """
    mark_pipeline("semantic_search", "running")
    try:
        # 0️⃣ Ownership Validation
        if not doc_id:
            yield json.dumps({"type": "error", "data": "Document ID is required."}) + "\n"
            return
            
        doc = get_document(doc_id)
        if not doc or doc.get("auth0Id") != client_id:
            yield json.dumps({"type": "error", "data": "Access denied or document not found."}) + "\n"
            return
            
        # 1️⃣ Query Rewriting (Optimization)
        optimized_query = optimize_query(query)
        
        # 2️⃣ Semantic Search (Scoped to doc_id)
        results = semantic_search(query=optimized_query, limit=top_k, client_id=client_id, doc_id=doc_id)

        # 3️⃣ Extract documents (contract-level only)
        documents: List[str] = [
            item["document"]
            for item in results
            if isinstance(item, dict) and item.get("document")
        ]

        # Yield the sources first as NDJSON
        yield json.dumps({"type": "sources", "data": documents}) + "\n"

        # 4️⃣ Build Context & Stream Answer (Answer based on original user query)
        for chunk in stream_llm(query, documents):
            yield json.dumps({"type": "chunk", "data": chunk}) + "\n"
    finally:
        mark_pipeline("semantic_search", "idle")
