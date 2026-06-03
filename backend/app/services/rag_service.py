from typing import Dict, List, AsyncGenerator
import json
from app.services.search_service import semantic_search
from app.services.llm_chain_service import stream_llm, optimize_query

async def stream_rag_pipeline(query: str, top_k: int = 3, client_id: str = "") -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline orchestrator with Streaming capabilities.
    """
    # 1️⃣ Query Rewriting (Optimization)
    optimized_query = optimize_query(query)
    
    # 2️⃣ Semantic Search
    results = semantic_search(query=optimized_query, limit=top_k, client_id=client_id)

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
