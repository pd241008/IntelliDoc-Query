from dotenv import load_dotenv
import os

# Load environment variables from the parent directory where .env is located
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import main_api_router

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_fastapi_instrumentator import Instrumentator

# ─── DevTrace ────────────────────────────────────────────────────────────────
# DevTrace is a Rust-based distributed API observability proxy.
# It captures all request-response cycles and persists them in SQLite.
# Toggle on/off with DEVTRACE_ENABLED=true in .env
_devtrace_instance = None
if os.getenv("DEVTRACE_ENABLED", "false").lower() == "true":
    try:
        from devtrace import DevTrace
        _devtrace_instance = DevTrace(env={
            "DEVTRACE_PORT": os.getenv("DEVTRACE_PORT", "7700"),
            "DEVTRACE_TARGET": os.getenv("DEVTRACE_TARGET", "http://localhost:8000"),
        })
        _devtrace_instance.start()
        print("✔ DevTrace observability proxy started on port", os.getenv("DEVTRACE_PORT", "7700"))
    except Exception as e:
        print(f"⚠ DevTrace failed to start (non-fatal): {e}")


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="IntelliDoc API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_api_router)

# ─── Prometheus Metrics ──────────────────────────────────────────────────────
# Exposes /metrics endpoint for Prometheus to scrape.
# Tracks: request counts, latencies, in-progress requests, errors by route.
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


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
