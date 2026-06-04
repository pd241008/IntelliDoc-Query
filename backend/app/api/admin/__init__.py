from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

from app.services.admin_service import fetch_dashboard_stats

router = APIRouter(prefix="/admin")

_security = HTTPBearer()
_ADMIN_SECRET = os.getenv("ADMIN_API_SECRET", "")


def _verify_admin(credentials: HTTPAuthorizationCredentials = Depends(_security)):
    """
    Simple bearer-token guard.
    The frontend sends the admin_token cookie value as a Bearer token.
    """
    if not _ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API secret not configured on the server.",
        )
    if credentials.credentials != _ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )


@router.get("/stats", dependencies=[Depends(_verify_admin)])
def get_admin_stats():
    """
    Returns real-time dashboard statistics for the admin portal.
    Protected by a bearer token matching the ADMIN_API_SECRET env var.
    """
    try:
        return fetch_dashboard_stats()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve admin stats: {str(e)}",
        )
