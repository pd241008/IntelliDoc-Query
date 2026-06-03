from typing import List
from app.rag.context_builder import build_context
from app.rag.llm import generate_answer_stream, llm
from langchain_core.prompts import PromptTemplate

rewrite_prompt = PromptTemplate(
    input_variables=["query"],
    template="""You are an expert search query optimization assistant. Your task is to rewrite the user's natural language question into a highly optimized search query for a Vector Database and Keyword Hybrid Search engine.

Guidelines:
1. Strip away conversational filler (e.g., "Can you tell me", "I want to know").
2. Retain all core entities, technical terms, and critical keywords.
3. If the query implies a need for a summary, ensure words like "summary", "overview", or "key points" are included.
4. Return ONLY the rewritten query string. Do NOT include quotes, explanations, or any other text.

Original Query: {query}
Optimized Search Query:"""
)

def optimize_query(query: str) -> str:
    """
    Rewrites the user query to optimize for retrieval.
    """
    try:
        response = llm.invoke(rewrite_prompt.format(query=query))
        rewritten = response.content.strip()
        return rewritten if rewritten else query
    except Exception as e:
        print(f"Query rewriting failed: {e}")
        return query

def stream_llm(query: str, docs: List[str]):
    """
    LLM orchestration layer (Service Layer).
    
    Responsibilities:
    - Build context from raw document strings
    - Delegate text generation to the LLM core layer and yield streamed chunks.
    """
    context = build_context(docs)
    for chunk in generate_answer_stream(query, context):
        yield chunk
