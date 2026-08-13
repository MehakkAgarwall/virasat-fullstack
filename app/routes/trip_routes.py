"""
Routes for trip/route planning.
POST /trip/crafts-along-route -> given start + end coordinates, returns crafts near the route
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.db_service import get_connection
from app.services.geo_service import get_route, find_crafts_near_route

router = APIRouter(prefix="/trip", tags=["trip"])


class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    buffer_km: Optional[float] = 50


@router.post("/crafts-along-route")
def crafts_along_route(req: RouteRequest):
    """
    Core feature: given a start and end point, calculates the driving route
    and returns all crafts from the DB that fall within buffer_km of that route,
    sorted nearest-first.
    """
    # 1. Get the route from OpenRouteService
    try:
        route_points = get_route(req.start_lng, req.start_lat, req.end_lng, req.end_lat)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch route: {e}")

    # 2. Pull all crafts from DB
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM crafts")
    all_crafts = cursor.fetchall()
    cursor.close()
    conn.close()

    # 3. Filter to crafts near the route
    matched_crafts = find_crafts_near_route(route_points, all_crafts, buffer_km=req.buffer_km)

    return {
        "route_point_count": len(route_points),
        "crafts_found": len(matched_crafts),
        "crafts": matched_crafts,
    }
