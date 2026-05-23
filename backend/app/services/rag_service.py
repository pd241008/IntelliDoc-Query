from typing import Dict, List

from app.rag.query_embedding import embed_query
from app.services.search_service import semantic_search
from app.rag.context_builder import build_context
from app.rag.llm_stub import generate_answer


async def run_rag_pipeline(
    query: str,
    top_k: int = 3
) -> Dict[str, object]:
    """
    Full RAG pipeline orchestrator.

    Steps:
    1. Embed user query
    2. Perform vector similarity search
    3. Build context from retrieved documents
    4. Generate LLM answer
    """

     # 1️⃣ Semantic Search (raw query, unchanged internals)
    results = semantic_search(
        query=query,
        limit=top_k
    )

    # 2️⃣ Extract documents (contract-level only)
    documents: List[str] = [
        item["document"]
        for item in results
        if isinstance(item, dict) and item.get("document")
    ]

    # 3️⃣ Build context
    context: str = build_context(documents)

    # 4️⃣ Generate answer
    answer: str = generate_answer(query, context)

    return {
        "query": query,
        "answer": answer,
        "sources": documents
    }