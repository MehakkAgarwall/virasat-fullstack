"""
Routes for reading craft data.
GET /crafts               -> all crafts
GET /crafts/{region}      -> crafts filtered by state or district (case-insensitive)
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.services.db_service import get_connection
from app.models.craft import Craft

router = APIRouter(prefix="/crafts", tags=["crafts"])


@router.get("", response_model=List[Craft])
def get_all_crafts():
    """Returns every craft in the database. Good sanity-check endpoint."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM crafts")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


@router.get("/{region}", response_model=List[Craft])
def get_crafts_by_region(region: str):
    """
    Returns crafts where state OR district matches the given region name
    (case-insensitive, partial match). E.g. /crafts/karnataka or /crafts/jaipur
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT * FROM crafts
        WHERE LOWER(state) LIKE %s OR LOWER(district) LIKE %s
    """
    like_pattern = f"%{region.lower()}%"
    cursor.execute(query, (like_pattern, like_pattern))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No crafts found for region '{region}'")

    return rows