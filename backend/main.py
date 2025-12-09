from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.health import router as health_router 
from backend.app.api.upload import router as upload_router

app = FastAPI(title="IntelliDoc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/healtapi")
app.include_router(upload_router,prefix="/uploadapi")


@app.get("/")
def root():
    return {"message": "Welcome to IntelliDoc API"}
