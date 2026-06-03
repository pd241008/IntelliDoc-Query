from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from app.services.rag_service import stream_rag_pipeline

router = APIRouter(prefix="/query", tags=["RAG"])

from typing import Optional
class QueryRequest(BaseModel):
    query: str
    client_id: Optional[str] = ""
    doc_id: str
    top_k: int = 3

@router.post("/")
@limiter.limit("10/minute")
async def query_documents(request: Request, payload: QueryRequest):
    return StreamingResponse(
        stream_rag_pipeline(
            query=payload.query,
            top_k=payload.top_k,
            client_id=payload.client_id,
            doc_id=payload.doc_id
        ),
        media_type="application/x-ndjson"
    )
