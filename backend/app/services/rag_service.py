from app.rag.context_builder import build_context
from app.rag.llm_stub import SimpleLLM


def run_rag(
    query: str,
    retrieved_documents: list[str],
) -> dict:
    """
    End-to-end RAG execution (no API here).
    """

    # 1️⃣ Context assembly
    context = build_context(retrieved_documents)

    # 2️⃣ Prompt construction
    prompt = f"""
You are an intelligent document assistant.

Answer the question using ONLY the context below.
If the answer is not present, say "I don't know".

Context:
{context}

Question:
{query}

Answer:
""".strip()

    # 3️⃣ LLM call
    llm = SimpleLLM()
    answer = llm.generate(prompt)

    return {
        "query": query,
        "answer": answer,
        "context_used": context[:500],  # debug-friendly
    }
