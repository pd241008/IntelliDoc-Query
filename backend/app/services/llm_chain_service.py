from typing import List
from app.rag.context_builder import build_context
from app.rag.llm import generate_answer

def run_llm(query: str, docs: List[str]) -> str:
    """
    LLM orchestration layer (Service Layer).
    
    Responsibilities:
    - Build context from raw document strings
    - Delegate text generation to the LLM core layer
    """
    context = build_context(docs)
    return generate_answer(query, context)
