"""
Kala Trail backend - entry point.
Run with: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.db_service import get_connection
from app.routes import craft_routes, trip_routes

app = FastAPI(title="Kala Trail API", version="0.1.0")

# CORS wide open for hackathon speed. Tighten origins if you have time at the end.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {"message": "Kala Trail API is running. See /docs for endpoints."}


app.include_router(craft_routes.router)
app.include_router(trip_routes.router)
