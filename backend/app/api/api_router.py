# backend/app/api/api_router.py

from fastapi import APIRouter
# Import the routers that were exposed in the __init__.py file
from . import upload_router, health_router, processing_router, query_router

# Define the single main router object
main_api_router = APIRouter()

# Include all individual routers
main_api_router.include_router(health_router,tags=["Health"])
main_api_router.include_router(upload_router,tags=["Upload"])
main_api_router.include_router(processing_router,tags=["Process"])
main_api_router.include_router(query_router,tags=["Query"])