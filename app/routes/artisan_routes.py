"""
Routes for reading artisan profile data (artisan_profiles table).
GET /artisans                      -> all artisans
GET /artisans/key/{artisan_key}    -> a single artisan by their artisanKey
GET /artisans/craft/{craft_id}     -> artisans whose primaryCraftId matches a given craft
GET /artisans/{region}             -> artisans filtered by state or location (case-insensitive)
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.db_service import get_connection
from app.models.artisan import Artisan
from app.services.ai_service import generate_artisan_story

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/artisans", tags=["artisans"])


class ArtisanInterestRequest(BaseModel):
    visitor_name: str
    visitor_email: str
    visitor_phone: Optional[str] = None
    message: Optional[str] = None
    preferred_date: Optional[str] = None



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


@router.get("/key/{artisan_key}/story")
def get_artisan_story(artisan_key: str, lang: str = "en"):
    """
    Generates a rich, narrative biography of an artisan powered by Gemini.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM artisan_profiles WHERE artisanKey = %s", (artisan_key,))
        artisan = cursor.fetchone()
        
        craft_name = "Traditional Craft"
        if artisan and artisan.get("primaryCraftId"):
            cursor.execute("SELECT name FROM crafts WHERE id = %s", (artisan["primaryCraftId"],))
            c = cursor.fetchone()
            if c:
                craft_name = c.get("name", craft_name)
        cursor.close()
    except Exception as e:
        logger.error(f"get_artisan_story failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisan profile.")
    finally:
        conn.close()

    if not artisan:
        raise HTTPException(status_code=404, detail=f"No artisan found with key '{artisan_key}'")

    try:
        artisan_display_name = artisan.get("personalName") or artisan.get("studioName") or "Master Artisan"
        story = generate_artisan_story(
            name=artisan_display_name,
            craft_name=craft_name,
            bio=artisan.get("bio", ""),
            experience_info=artisan.get("experienceInfo", ""),
            years_of_practice=artisan.get("yearsOfPractice", 0),
            lang=lang,
        )
        return {
            "artisanKey": artisan_key,
            "name": artisan_display_name,
            "craft_name": craft_name,
            "language": lang,
            "story": story,
        }
    except Exception as e:
        logger.error(f"generate_artisan_story failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate artisan story.")


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


@router.post("/{artisan_key}/interest")
def register_artisan_interest(artisan_key: str, req: ArtisanInterestRequest):
    """
    Allows a visitor or tourist to express interest or register a workshop/visit request with an artisan.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Verify artisan exists
        cursor.execute("SELECT artisanKey, personalName, studioName FROM artisan_profiles WHERE artisanKey = %s", (artisan_key,))
        artisan = cursor.fetchone()
        if not artisan:
            cursor.close()
            raise HTTPException(status_code=404, detail=f"Artisan key '{artisan_key}' not found.")

        insert_sql = """
            INSERT INTO artisan_interests (artisan_key, visitor_name, visitor_email, visitor_phone, message, preferred_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            insert_sql,
            (
                artisan_key,
                req.visitor_name,
                req.visitor_email,
                req.visitor_phone,
                req.message,
                req.preferred_date,
            ),
        )
        interest_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        artisan_display_name = artisan.get("personalName") or artisan.get("studioName") or "Artisan"
        return {
            "status": "success",
            "message": f"Interest registered successfully for artisan {artisan_display_name}.",
            "interest_id": interest_id,
            "artisan_key": artisan_key,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"register_artisan_interest failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record interest: {str(e)}")
    finally:
        conn.close()


@router.get("/{artisan_key}/interests")
def get_artisan_interests(artisan_key: str):
    """
    Retrieves registered visitor interest inquiries for a specific artisan.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM artisan_interests WHERE artisan_key = %s ORDER BY created_at DESC",
            (artisan_key,),
        )
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except Exception as e:
        logger.error(f"get_artisan_interests failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artisan interests.")
    finally:
        conn.close()


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