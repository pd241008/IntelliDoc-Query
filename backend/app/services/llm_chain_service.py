from typing import List
from app.rag.context_builder import build_context
from app.rag.llm import generate_answer_stream, llm
from langchain_core.prompts import PromptTemplate

rewrite_prompt = PromptTemplate(
    input_variables=["query"],
    template="You are an expert search assistant. Rewrite the following user query to be more precise and optimized for keyword and semantic search in a document database. Return ONLY the rewritten query without any additional text or quotes.\n\nOriginal Query: {query}\nRewritten Query:"
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
