from typing import Dict, List, AsyncGenerator
import json
from app.rag.query_embedding import embed_query
from app.services.search_service import semantic_search
from app.services.llm_chain_service import stream_llm

async def stream_rag_pipeline(query: str, top_k: int = 3, client_id: str = "") -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline orchestrator with Streaming capabilities.
    """
    # 1️⃣ Semantic Search
    results = semantic_search(query=query, limit=top_k, client_id=client_id)

    # 2️⃣ Extract documents (contract-level only)
    documents: List[str] = [
        item["document"]
        for item in results
        if isinstance(item, dict) and item.get("document")
    ]

    # Yield the sources first as NDJSON
    yield json.dumps({"type": "sources", "data": documents}) + "\n"

    # 3️⃣ & 4️⃣ Build Context & Stream Answer
    for chunk in stream_llm(query, documents):
        yield json.dumps({"type": "chunk", "data": chunk}) + "\n"
