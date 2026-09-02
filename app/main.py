"""
Kala Trail backend - entry point.
Run with: uvicorn app.main:app --reload --port 8000
"""

import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.db_service import get_connection
from app.routes import craft_routes, trip_routes, artisan_routes, voice_routes, i18n_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kalatrail")

app = FastAPI(title="Kala Trail API", version="0.1.0")

# CORS: reads a comma-separated list from ALLOWED_ORIGINS in .env if set
# (e.g. "https://myfrontend.vercel.app,http://localhost:3000").
# Falls back to "*" for local/hackathon dev if not set - tighten this once
# your frontend's deployed URL is known.
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
allowed_origins = allowed_origins_env.split(",") if allowed_origins_env else ["*"]

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
            "GET /crafts/{region}",
            "GET /artisans",
            "GET /artisans/key/{artisan_key}",
            "GET /artisans/craft/{craft_id}",
            "GET /artisans/{region}",
            "POST /trip/crafts-along-route",
        ],
    }


app.include_router(craft_routes.router)
app.include_router(artisan_routes.router)
app.include_router(trip_routes.router)
app.include_router(voice_routes.router)
app.include_router(i18n_routes.router)