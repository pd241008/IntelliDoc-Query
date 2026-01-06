from fastapi import APIRouter
from app.services.rag_service import run_rag

router = APIRouter(prefix="/rag", tags=["RAG"])

@router.post("/query")
def rag_query(query: str, retrieved_documents: list):
    return run_rag(query, retrieved_documents)
