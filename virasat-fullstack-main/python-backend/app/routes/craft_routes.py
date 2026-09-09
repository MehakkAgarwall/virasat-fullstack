"""
Routes for reading craft data.
GET /crafts               -> all crafts
GET /crafts/id/{craft_id} -> a single craft by its numeric id
GET /crafts/{region}      -> crafts filtered by state or district (case-insensitive)
"""

import logging
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.db_service import get_connection
from app.models.craft import Craft
from app.services.geo_service import haversine_distance

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/crafts", tags=["crafts"])


@router.get("/search", response_model=List[Craft])
def search_crafts(
    q: Optional[str] = Query(None, description="Fuzzy text query for craft name, category, district, state, description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    near_lat: Optional[float] = Query(None, description="Latitude for geo proximity search"),
    near_lng: Optional[float] = Query(None, description="Longitude for geo proximity search"),
    radius_km: Optional[float] = Query(50.0, description="Max search radius in km when near_lat/lng provided"),
):
    """
    Search and recommend crafts with fuzzy text matching and optional geo-proximity sorting.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query_sql = "SELECT * FROM crafts WHERE 1=1"
        params = []

        if q:
            like_pat = f"%{q.lower()}%"
            query_sql += """
                AND (LOWER(name) LIKE %s
                     OR LOWER(category) LIKE %s
                     OR LOWER(district) LIKE %s
                     OR LOWER(state) LIKE %s
                     OR LOWER(description) LIKE %s
                     OR LOWER(COALESCE(ai_description, '')) LIKE %s)
            """
            params.extend([like_pat] * 6)

        if category:
            query_sql += " AND LOWER(category) = %s"
            params.append(category.lower())

        if state:
            query_sql += " AND LOWER(state) LIKE %s"
            params.append(f"%{state.lower()}%")

        cursor.execute(query_sql, tuple(params))
        rows = cursor.fetchall()
        cursor.close()
    except Exception as e:
        logger.error(f"search_crafts failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to search crafts.")
    finally:
        conn.close()

    # Geo proximity filtering & sorting if coordinates provided
    if near_lat is not None and near_lng is not None:
        filtered = []
        for craft in rows:
            if craft.get("lat") is not None and craft.get("lng") is not None:
                dist = haversine_distance(near_lat, near_lng, craft["lat"], craft["lng"])
                if radius_km is None or dist <= radius_km:
                    craft_copy = dict(craft)
                    craft_copy["distance_km"] = round(dist, 1)
                    filtered.append(craft_copy)
        filtered.sort(key=lambda c: c.get("distance_km", 99999))
        return filtered

    return rows


@router.get("/featured", response_model=Craft)
def get_featured_craft():
    """
    Returns a featured 'Craft of the Day', rotating deterministically each calendar day.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crafts ORDER BY id ASC")
        rows = cursor.fetchall()
        cursor.close()
    except Exception as e:
        logger.error(f"get_featured_craft failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch featured craft.")
    finally:
        conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail="No crafts found in database.")

    today_ordinal = date.today().toordinal()
    selected_index = today_ordinal % len(rows)
    featured = rows[selected_index]
    return featured


@router.get("", response_model=List[Craft])
def get_all_crafts():
    """Returns every craft in the database. Good sanity-check endpoint."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crafts")
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except Exception as e:
        logger.error(f"get_all_crafts failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch crafts.")
    finally:
        conn.close()


@router.get("/id/{craft_id}", response_model=Craft)
def get_craft_by_id(craft_id: int):
    """
    Returns a single craft by its numeric id. Useful for a frontend detail/page view.
    Placed under /crafts/id/{craft_id} (rather than /crafts/{craft_id}) so it doesn't
    collide with the /crafts/{region} route below, which expects a string.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crafts WHERE id = %s", (craft_id,))
        row = cursor.fetchone()
        cursor.close()
    except Exception as e:
        logger.error(f"get_craft_by_id failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch craft.")
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"No craft found with id {craft_id}")

    return row


@router.get("/{region}", response_model=List[Craft])
def get_crafts_by_region(region: str):
    """
    Returns crafts where state OR district matches the given region name
    (case-insensitive, partial match). E.g. /crafts/karnataka or /crafts/jaipur
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT * FROM crafts
            WHERE LOWER(state) LIKE %s OR LOWER(district) LIKE %s
        """
        like_pattern = f"%{region.lower()}%"
        cursor.execute(query, (like_pattern, like_pattern))
        rows = cursor.fetchall()
        cursor.close()
    except Exception as e:
        logger.error(f"get_crafts_by_region failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch crafts.")
    finally:
        conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No crafts found for region '{region}'")

    return rows