from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.rag_service import stream_rag_pipeline

router = APIRouter(prefix="/query", tags=["RAG"])

class QueryRequest(BaseModel):
    query: str
    client_id: str
    top_k: int = 3

@router.post("/")
async def query_documents(payload: QueryRequest):
    return StreamingResponse(
        stream_rag_pipeline(
            query=payload.query,
            top_k=payload.top_k,
            client_id=payload.client_id
        ),
        media_type="application/x-ndjson"
    )
