"""
Routes for trip/route planning.
POST /trip/crafts-along-route -> given start + end coordinates, returns crafts near the route
"""

import logging
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.db_service import get_connection, get_all_artisans_with_coords
from app.services.geo_service import (
    get_route,
    find_crafts_near_route,
    sample_route_points,
    artisans_near_route,
    order_along_route,
    haversine_distance,
)
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


class Waypoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    label: Optional[str] = ""


class RouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    start_lng: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    end_lat: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    end_lng: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    waypoints: Optional[List[Waypoint]] = Field(default=[], description="Optional intermediate waypoints")
    buffer_km: Optional[float] = Field(50, gt=0, le=500, description="Search radius in km, max 500")
    theme: Optional[str] = Field(None, description="Optional craft theme (e.g. textiles, metalwork, pottery, art)")
    start_label: Optional[str] = ""
    end_label: Optional[str] = ""
    include_summary: Optional[bool] = True


def _route_cache_key(req: RouteRequest) -> tuple:
    wp_tuple = tuple((round(w.lat, 2), round(w.lng, 2)) for w in (req.waypoints or []))
    return (
        round(req.start_lat, 2), round(req.start_lng, 2),
        round(req.end_lat, 2), round(req.end_lng, 2),
        wp_tuple, req.buffer_km, req.theme, req.include_summary,
    )


def _get_cached_route(key: tuple):
    hit = _route_cache.get(key)
    if hit and (time.time() - hit["at"]) < _ROUTE_CACHE_TTL_SECONDS:
        return hit["response"]
    return None


def _set_cached_route(key: tuple, response: dict):
    _route_cache[key] = {"at": time.time(), "response": response}


@router.post("/crafts-along-route")
def crafts_along_route(req: RouteRequest):
    """
    Core feature: given a start, end point, and optional waypoints and theme,
    calculates the multi-stop driving route and returns crafts within buffer_km,
    filtered by theme if specified.
    """
    cache_key = _route_cache_key(req)
    cached_response = _get_cached_route(cache_key)
    if cached_response is not None:
        return cached_response

    # 1. Build route coordinate array for multi-stop route
    coords_list = [[req.start_lng, req.start_lat]]
    if req.waypoints:
        for wp in req.waypoints:
            coords_list.append([wp.lng, wp.lat])
    coords_list.append([req.end_lng, req.end_lat])

    try:
        route_points = get_route(coordinates_list=coords_list)
    except Exception as e:
        logger.warning(f"Multi-stop ORS route failed, falling back to direct start-end route: {e}")
        try:
            route_points = get_route(req.start_lng, req.start_lat, req.end_lng, req.end_lat)
        except Exception as err:
            raise HTTPException(status_code=502, detail=f"Failed to fetch route: {err}")

    # 1b. Route-buffer artisan matching
    sampled_points = sample_route_points(route_points, interval_km=2)
    all_artisans = get_all_artisans_with_coords()
    matched_artisans = artisans_near_route(all_artisans, sampled_points, buffer_km=req.buffer_km)
    artisans_on_route = order_along_route(matched_artisans, sampled_points)

    # 2. Pull all crafts from DB
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crafts")
        all_crafts = cursor.fetchall()
        cursor.close()
    finally:
        conn.close()

    # 3. Filter crafts near route
    matched_crafts = find_crafts_near_route(route_points, all_crafts, buffer_km=req.buffer_km)

    # 3a. Filter by theme if provided (e.g. textiles, metalwork, pottery, art, handicraft)
    if req.theme and req.theme.strip():
        t = req.theme.lower().strip()
        matched_crafts = [
            c for c in matched_crafts
            if t in (c.get("category") or "").lower()
            or t in (c.get("name") or "").lower()
            or t in (c.get("description") or "").lower()
        ]

    # 3b. Attach real artisans
    if matched_crafts:
        craft_ids = [c["id"] for c in matched_crafts if c.get("id") is not None]
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            if craft_ids:
                placeholders = ",".join(["%s"] * len(craft_ids))
                cursor.execute(
                    f"SELECT * FROM artisan_profiles WHERE primaryCraftId IN ({placeholders})",
                    tuple(craft_ids),
                )
                artisan_rows = cursor.fetchall()
            else:
                artisan_rows = []
            cursor.close()
        except Exception as e:
            artisan_rows = []
            logger.warning(f"Fetching artisans for matched crafts failed (non-fatal): {e}")
        finally:
            conn.close()

        artisans_by_craft_id: dict = {}
        for artisan in artisan_rows:
            artisans_by_craft_id.setdefault(artisan["primaryCraftId"], []).append(artisan)

        for craft in matched_crafts:
            craft["artisans"] = artisans_by_craft_id.get(craft.get("id"), [])

    # 4. Generate AI trip summary
    trip_summary = None
    if req.include_summary and matched_crafts:
        try:
            trip_summary = generate_trip_summary(
                matched_crafts,
                start_label=req.start_label,
                end_label=req.end_label,
                theme=req.theme,
            )
        except Exception as e:
            trip_summary = None
            logger.warning(f"AI summary generation failed (non-fatal): {e}")

    response = {
        "route_point_count": len(route_points),
        "waypoint_count": len(req.waypoints or []),
        "theme": req.theme,
        "crafts_found": len(matched_crafts),
        "crafts": matched_crafts,
        "artisans_on_route": artisans_on_route,
        "trip_summary": trip_summary,
    }
    _set_cached_route(cache_key, response)
    return response


# ---------------------------------------------------------------------------
# POST /trip/max-artisans-route — detour-optimised route through max artisans
# ---------------------------------------------------------------------------

import os
import requests as http_requests

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"


def _ors_route_distance_km(
    start_lng: float, start_lat: float,
    end_lng: float, end_lat: float,
) -> float:
    """
    Single ORS directions call that returns the driving distance in km.
    Raises on failure so the caller can handle it.
    """
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }
    body = {
        "coordinates": [
            [start_lng, start_lat],
            [end_lng, end_lat],
        ]
    }
    resp = http_requests.post(ORS_DIRECTIONS_URL, json=body, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    # ORS returns distance in metres in properties.summary.distance
    distance_m = data["features"][0]["properties"]["summary"]["distance"]
    return distance_m / 1000.0


class MaxArtisansRouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90)
    start_lng: float = Field(..., ge=-180, le=180)
    end_lat: float = Field(..., ge=-90, le=90)
    end_lng: float = Field(..., ge=-180, le=180)
    detour_budget_km: Optional[float] = Field(40, gt=0, le=500, description="Max total detour in km")


@router.post("/max-artisans-route")
def max_artisans_route(req: MaxArtisansRouteRequest):
    """
    Finds a route from A to B passing near the MOST artisans possible
    within a detour budget, using real road distances via ORS.

    Steps:
    1. Cheap haversine prefilter (bounding box + midpoint proximity)
    2. Cap to 15 candidates
    3. ORS detour ranking (hard cap 35 total ORS calls)
    4. Greedy selection within detour_budget_km
    5. Return selected artisans + ordered waypoint list
    """
    MAX_CANDIDATES = 15
    MAX_ORS_CALLS = 35
    ors_calls_used = 0

    # --- 0. Base distance A → B (1 ORS call) ---
    try:
        base_distance_km = _ors_route_distance_km(
            req.start_lng, req.start_lat, req.end_lng, req.end_lat,
        )
        ors_calls_used += 1
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ORS base route failed: {e}")

    # --- 1. Cheap prefilter: bounding box ~1.5° margin + haversine ---
    all_artisans = get_all_artisans_with_coords()
    if not all_artisans:
        return {
            "base_distance_km": round(base_distance_km, 2),
            "detour_budget_km": req.detour_budget_km,
            "total_detour_km": 0,
            "selected_artisans": [],
            "waypoints": [
                [req.start_lat, req.start_lng],
                [req.end_lat, req.end_lng],
            ],
        }

    min_lat = min(req.start_lat, req.end_lat) - 1.5
    max_lat = max(req.start_lat, req.end_lat) + 1.5
    min_lng = min(req.start_lng, req.end_lng) - 1.5
    max_lng = max(req.start_lng, req.end_lng) + 1.5

    bbox_filtered = [
        a for a in all_artisans
        if min_lat <= float(a["lat"]) <= max_lat and min_lng <= float(a["lng"]) <= max_lng
    ]

    # --- 2. Cap to 15 closest to A-B midpoint by haversine ---
    mid_lat = (req.start_lat + req.end_lat) / 2
    mid_lng = (req.start_lng + req.end_lng) / 2

    for a in bbox_filtered:
        a["_midpoint_dist"] = haversine_distance(
            float(a["lat"]), float(a["lng"]), mid_lat, mid_lng,
        )

    bbox_filtered.sort(key=lambda a: a["_midpoint_dist"])
    candidates = bbox_filtered[:MAX_CANDIDATES]

    # --- 3. Detour ranking via ORS (2 calls per candidate, hard cap 35 total) ---
    ranked = []
    for artisan in candidates:
        if ors_calls_used + 2 > MAX_ORS_CALLS:
            logger.warning(
                f"max-artisans-route: ORS call budget exhausted at {ors_calls_used} calls, "
                f"{len(candidates) - len(ranked)} candidates left unscored"
            )
            break

        a_lat, a_lng = float(artisan["lat"]), float(artisan["lng"])
        try:
            dist_start_to_artisan = _ors_route_distance_km(
                req.start_lng, req.start_lat, a_lng, a_lat,
            )
            ors_calls_used += 1

            dist_artisan_to_end = _ors_route_distance_km(
                a_lng, a_lat, req.end_lng, req.end_lat,
            )
            ors_calls_used += 1

            detour_km = (dist_start_to_artisan + dist_artisan_to_end) - base_distance_km
            artisan_result = {
                k: v for k, v in artisan.items() if not k.startswith("_")
            }
            artisan_result["detour_km"] = round(max(detour_km, 0), 2)
            artisan_result["via_distance_km"] = round(
                dist_start_to_artisan + dist_artisan_to_end, 2
            )
            ranked.append(artisan_result)

        except Exception as e:
            logger.warning(
                f"max-artisans-route: ORS detour check failed for artisan "
                f"{artisan.get('artisanKey', artisan.get('id'))}: {e}"
            )
            continue

    ranked.sort(key=lambda a: a["detour_km"])

    # --- 4. Greedy selection within budget ---
    selected = []
    total_detour = 0.0
    for artisan in ranked:
        if total_detour + artisan["detour_km"] <= req.detour_budget_km:
            selected.append(artisan)
            total_detour += artisan["detour_km"]

    # --- 5. Order selected artisans by proximity to start (nearest-first chain) ---
    ordered_selected = []
    remaining = list(selected)
    current_lat, current_lng = req.start_lat, req.start_lng

    while remaining:
        nearest_idx = 0
        nearest_dist = float("inf")
        for i, a in enumerate(remaining):
            d = haversine_distance(current_lat, current_lng, float(a["lat"]), float(a["lng"]))
            if d < nearest_dist:
                nearest_dist = d
                nearest_idx = i
        chosen = remaining.pop(nearest_idx)
        ordered_selected.append(chosen)
        current_lat, current_lng = float(chosen["lat"]), float(chosen["lng"])

    # Build waypoint list: start -> artisans in order -> end
    waypoints = [[req.start_lat, req.start_lng]]
    for a in ordered_selected:
        waypoints.append([float(a["lat"]), float(a["lng"])])
    waypoints.append([req.end_lat, req.end_lng])

    return {
        "base_distance_km": round(base_distance_km, 2),
        "detour_budget_km": req.detour_budget_km,
        "total_detour_km": round(total_detour, 2),
        "ors_calls_used": ors_calls_used,
        "candidates_scored": len(ranked),
        "selected_artisans": ordered_selected,
        "waypoints": waypoints,
    }