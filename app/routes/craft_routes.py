"""
Routes for reading craft data.
GET /crafts               -> all crafts
GET /crafts/id/{craft_id} -> a single craft by its numeric id
GET /crafts/{region}      -> crafts filtered by state or district (case-insensitive)
"""

import logging
from fastapi import APIRouter, HTTPException
from typing import List
from app.services.db_service import get_connection
from app.models.craft import Craft

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/crafts", tags=["crafts"])


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