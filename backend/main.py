from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import main_api_router


app = FastAPI(title="IntelliDoc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_api_router)


@app.get("/")
def root():
    return {"message": "Welcome to IntelliDoc API Gateway for OCR and Sementic Search Gateway"}


