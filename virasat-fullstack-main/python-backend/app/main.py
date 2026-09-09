"""
Kala Trail backend - entry point.
Run with: uvicorn app.main:app --reload --port 8000
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.db_service import get_connection, init_db
from app.routes import craft_routes, trip_routes, artisan_routes, voice_routes, i18n_routes, analytics_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kalatrail")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    init_db()
    yield


app = FastAPI(title="Kala Trail API", version="0.2.0", lifespan=lifespan)

# CORS: reads a comma-separated list from ALLOWED_ORIGINS in .env if set
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
<<<<<<< HEAD
allowed_origins = allowed_origins_env.split(",") if allowed_origins_env else ["*"]
=======
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()] if allowed_origins_env else ["*"]
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches any unhandled error so the API always returns clean JSON instead of
    a raw traceback - important during a live demo if something unexpected breaks.
    """
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our end. Please try again."},
    )


@app.get("/health")
def health_check():
    """Quick sanity check endpoint - hit this first to confirm the server is alive."""
    return {"status": "ok", "service": "kalatrail-backend"}


@app.get("/health-db")
def health_check_db():
    """Confirms the backend can actually reach MySQL, not just that the server is up."""
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "not connected", "detail": str(e)}


@app.get("/")
def root():
    return {
        "message": "Kala Trail API is running.",
        "docs": "/docs",
        "endpoints": [
            "GET /health",
            "GET /health-db",
            "GET /crafts",
            "GET /crafts/search",
            "GET /crafts/featured",
            "GET /crafts/id/{craft_id}",
            "GET /crafts/{region}",
            "GET /artisans",
            "GET /artisans/key/{artisan_key}",
            "GET /artisans/key/{artisan_key}/story",
            "POST /artisans/{artisan_key}/interest",
            "GET /artisans/{artisan_key}/interests",
            "GET /artisans/craft/{craft_id}",
            "GET /artisans/{region}",
            "POST /trip/crafts-along-route",
            "POST /voice/chat",
            "POST /voice/chat/text",
            "GET /i18n/{lang}",
            "GET /analytics/craft-coverage",
        ],
    }


app.include_router(craft_routes.router)
app.include_router(artisan_routes.router)
app.include_router(trip_routes.router)
app.include_router(voice_routes.router)
app.include_router(i18n_routes.router)
app.include_router(analytics_routes.router)