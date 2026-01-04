from fastapi import APIRouter
from app.core.config.health import get_health

router = APIRouter()

@router.get("/health")
def health():
    return get_health()
