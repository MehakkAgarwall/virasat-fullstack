"""
Routes for reading artisan profile data (artisan_profiles table).
GET /artisans                      -> all artisans
GET /artisans/key/{artisan_key}    -> a single artisan by their artisanKey
GET /artisans/craft/{craft_id}     -> artisans whose primaryCraftId matches a given craft
GET /artisans/{region}             -> artisans filtered by state or location (case-insensitive)
"""

import logging
from fastapi import APIRouter, HTTPException
from typing import List
from app.services.db_service import get_connection
from app.models.artisan import Artisan

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/artisans", tags=["artisans"])


@router.get("", response_model=List[Artisan])
def get_all_artisans():
    """Returns every artisan profile in the database. Good sanity-check endpoint."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM artisan_profiles")
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except Exception as e:
        logger.error(f"get_all_artisans failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisans.")
    finally:
        conn.close()


@router.get("/key/{artisan_key}", response_model=Artisan)
def get_artisan_by_key(artisan_key: str):
    """
    Returns a single artisan by their artisanKey (the same key the tRPC backend
    uses to identify an artisan - not the numeric id).
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM artisan_profiles WHERE artisanKey = %s", (artisan_key,))
        row = cursor.fetchone()
        cursor.close()
    except Exception as e:
        logger.error(f"get_artisan_by_key failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisan.")
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"No artisan found with key '{artisan_key}'")

    return row


@router.get("/craft/{craft_id}", response_model=List[Artisan])
def get_artisans_by_craft(craft_id: int):
    """
    Returns artisans whose primaryCraftId matches the given craft id.
    This is what links a craft (e.g. from /crafts or /trip/crafts-along-route)
    to a real person who makes it.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM artisan_profiles WHERE primaryCraftId = %s", (craft_id,))
        rows = cursor.fetchall()
        cursor.close()
    except Exception as e:
        logger.error(f"get_artisans_by_craft failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisans.")
    finally:
        conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No artisans found for craft id {craft_id}")

    return rows


@router.get("/{region}", response_model=List[Artisan])
def get_artisans_by_region(region: str):
    """
    Returns artisans where state OR location matches the given region name
    (case-insensitive, partial match). E.g. /artisans/karnataka or /artisans/mysuru
    Placed last so it doesn't shadow the more specific /key/ and /craft/ routes above.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT * FROM artisan_profiles
            WHERE LOWER(state) LIKE %s OR LOWER(location) LIKE %s
        """
        like_pattern = f"%{region.lower()}%"
        cursor.execute(query, (like_pattern, like_pattern))
        rows = cursor.fetchall()
        cursor.close()
    except Exception as e:
        logger.error(f"get_artisans_by_region failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisans.")
    finally:
        conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No artisans found for region '{region}'")

    return rows