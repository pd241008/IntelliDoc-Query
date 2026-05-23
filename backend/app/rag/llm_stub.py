# app/services/rag/simple_llm.py

from typing import Optional


def generate_answer(
    query: str,
    context: str
) -> str:
    """
    Simple deterministic answer generator.

    - Uses only provided context
    - Avoids hallucinations
    - Replaceable with real LLM later
    """

    if not context or context.strip() == "No relevant documents found.":
        return (
            "I could not find relevant information in the uploaded documents "
            "to answer your question."
        )

    answer = f"""
Question:
{query}

Answer (based on documents):

{context}

Summary:
The above information was retrieved from your documents and assembled
to directly answer the question.
""".strip()

    return answer
