from typing import List


def run_llm(query: str, docs: List[str]) -> str:
    """
    LLM orchestration layer.
    Stateless.
    """
    return f"Answer for '{query}' using {len(docs)} documents"
