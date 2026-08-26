"""
Routes for trip/route planning.
POST /trip/crafts-along-route -> given start + end coordinates, returns crafts near the route
"""

import logging
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.db_service import get_connection
from app.services.geo_service import get_route, find_crafts_near_route
from app.services.ai_service import generate_trip_summary

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/trip", tags=["trip"])

# In-memory cache for full route responses, keyed by rounded start/end coords + buffer_km.
# Repeated traces of the same corridor (demo rehearsal, judges re-running the same route,
# a person retrying after a slow first attempt) previously re-did the full ORS route call +
# craft match + Gemini summary every single time. Rounding to 2 decimal places (~1km) means
# near-identical clicks on the same two cities still hit the cache.
_ROUTE_CACHE_TTL_SECONDS = 3600
_route_cache: dict = {}


def _route_cache_key(req: "RouteRequest") -> tuple:
    return (
        round(req.start_lat, 2), round(req.start_lng, 2),
        round(req.end_lat, 2), round(req.end_lng, 2),
        req.buffer_km, req.include_summary,
    )


def _get_cached_route(key: tuple):
    hit = _route_cache.get(key)
    if hit and (time.time() - hit["at"]) < _ROUTE_CACHE_TTL_SECONDS:
        return hit["response"]
    return None


def _set_cached_route(key: tuple, response: dict):
    _route_cache[key] = {"at": time.time(), "response": response}


class RouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    start_lng: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    end_lat: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    end_lng: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    buffer_km: Optional[float] = Field(50, gt=0, le=500, description="Search radius in km, max 500")
    start_label: Optional[str] = ""
    end_label: Optional[str] = ""
    include_summary: Optional[bool] = True


@router.post("/crafts-along-route")
def crafts_along_route(req: RouteRequest):
    """
    Core feature: given a start and end point, calculates the driving route
    and returns all crafts from the DB that fall within buffer_km of that route,
    sorted nearest-first.
    """
    cache_key = _route_cache_key(req)
    cached_response = _get_cached_route(cache_key)
    if cached_response is not None:
        return cached_response

    # 1. Get the route from OpenRouteService
    try:
        route_points = get_route(req.start_lng, req.start_lat, req.end_lng, req.end_lat)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch route: {e}")

    # 2. Pull all crafts from DB
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crafts")
        all_crafts = cursor.fetchall()
        cursor.close()
    finally:
        conn.close()

    # 3. Filter to crafts near the route
    matched_crafts = find_crafts_near_route(route_points, all_crafts, buffer_km=req.buffer_km)

    # 4. Optionally generate an AI trip summary (skipped if no crafts matched, or if the
    #    person set include_summary=false, or if the AI call fails - never let a summary
    #    failure break the whole response, since crafts_along_route is the core feature)
    trip_summary = None
    if req.include_summary and matched_crafts:
        try:
            trip_summary = generate_trip_summary(matched_crafts, req.start_label, req.end_label)
        except Exception as e:
            trip_summary = None
            logger.warning(f"AI summary generation failed (non-fatal): {e}")

    response = {
        "route_point_count": len(route_points),
        "crafts_found": len(matched_crafts),
        "crafts": matched_crafts,
        "trip_summary": trip_summary,
    }
    _set_cached_route(cache_key, response)
    return response