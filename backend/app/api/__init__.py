# Import the 'router' variable that was exposed in each sub-package's __init__.py
from .upload import router as upload_router
from .health import router as health_router
from .vector import router as processing_router
from .query import router as query_router
from .admin import router as admin_router

# You don't need to define an APIRouter here, but you can define a list of all routers
# that need to be aggregated.
__all__ = ["upload_router", "health_router", "processing_router", "query_router", "admin_router"]