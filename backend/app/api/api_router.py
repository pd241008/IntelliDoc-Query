# backend/app/api/api_router.py

from fastapi import APIRouter
# Import the routers that were exposed in the __init__.py file
from . import upload_router, health_router # Imports from __init__.py

# Define the single main router object
main_api_router = APIRouter()

# Include all individual routers
main_api_router.include_router(health_router,tags=["Health"])
main_api_router.include_router(upload_router,tags=["Upload"])