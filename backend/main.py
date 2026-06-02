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

@app.on_event("startup")
async def startup_event():
    from app.data_access.redis.redis_repo import get_redis_client
    from app.database.chromadb.chromaconnection import ping_database
    from app.core.config.health import mark_vector_db, mark_broker
    
    print("🚀 Running API Startup Checks...")
    
    # 1. Ping Redis (this automatically sets mark_broker)
    try:
        await get_redis_client()
    except Exception as e:
        print(f"❌ Redis startup check failed: {e}")
        mark_broker("disconnected")
        
    # 2. Ping ChromaDB
    try:
        if ping_database():
            mark_vector_db("connected")
            print("✔ ChromaDB connected")
        else:
            mark_vector_db("disconnected")
    except Exception as e:
        print(f"❌ ChromaDB startup check failed: {e}")
        mark_vector_db("disconnected")
