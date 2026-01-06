# app/api/routes/query.py

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import run_rag_pipeline

router = APIRouter(prefix="/query", tags=["RAG"])


class QueryRequest(BaseModel):
    query: str
    top_k: int = 3


@router.post("/")
async def query_documents(payload: QueryRequest):
    result = await run_rag_pipeline(
        query=payload.query,
        top_k=payload.top_k
    )
    return result
