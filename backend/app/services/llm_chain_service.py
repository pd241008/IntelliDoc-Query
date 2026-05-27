from typing import List
from app.rag.context_builder import build_context
from app.rag.llm import generate_answer_stream

def stream_llm(query: str, docs: List[str]):
    """
    LLM orchestration layer (Service Layer).
    
    Responsibilities:
    - TODO: Implement Query Re-writing / Prompt Optimization here before generating context.
    - Build context from raw document strings
    - Delegate text generation to the LLM core layer and yield streamed chunks.
    """
    context = build_context(docs)
    for chunk in generate_answer_stream(query, context):
        yield chunk
