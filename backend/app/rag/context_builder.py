# app/services/rag/context_builder.py

from typing import List

MAX_CONTEXT_CHARS = 3000  # safe for local / future LLMs


def build_context(
    documents: List[str],
    max_chars: int = MAX_CONTEXT_CHARS
) -> str:
    """
    Builds a clean, size-limited context block from retrieved documents.
    """

    if not documents:
        return "No relevant documents found."

    context_parts = []
    current_length = 0

    for idx, doc in enumerate(documents, start=1):
        cleaned = doc.strip()

        if not cleaned:
            continue

        block = f"\n[Document {idx}]\n{cleaned}\n"

        if current_length + len(block) > max_chars:
            break

        context_parts.append(block)
        current_length += len(block)

    return "\n".join(context_parts).strip()
