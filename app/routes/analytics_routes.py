"""
analytics_routes.py
Exposes GET /analytics/craft-coverage endpoint for state/category breakdown,
regions with/without artisans, and coverage statistics for charts and dashboard UI.
"""

import logging
from fastapi import APIRouter, HTTPException
from app.services.db_service import get_connection

logger = logging.getLogger("kalatrail")
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/craft-coverage")
def get_craft_coverage():
    """
    Aggregate coverage metrics across states, categories, and registered artisans.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        # 1. Total counts
        cursor.execute("SELECT COUNT(*) AS total FROM crafts")
        total_crafts = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(DISTINCT state) AS total FROM crafts")
        total_states_covered = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(DISTINCT category) AS total FROM crafts")
        total_categories = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM artisan_profiles")
        total_artisans = cursor.fetchone()["total"]

        # 2. Crafts by State
        cursor.execute("""
            SELECT state, COUNT(*) AS craft_count
            FROM crafts
            GROUP BY state
            ORDER BY craft_count DESC
        """)
        crafts_by_state = cursor.fetchall()

        # 3. Crafts by Category
        cursor.execute("""
            SELECT category, COUNT(*) AS craft_count
            FROM crafts
            GROUP BY category
            ORDER BY craft_count DESC
        """)
        crafts_by_category = cursor.fetchall()

        # 4. Artisans by State
        cursor.execute("""
            SELECT state, COUNT(*) AS artisan_count
            FROM artisan_profiles
            GROUP BY state
            ORDER BY artisan_count DESC
        """)
        artisans_by_state = cursor.fetchall()

        # 5. Coverage breakdown (States with artisans vs without artisans)
        cursor.execute("SELECT DISTINCT state FROM artisan_profiles WHERE state IS NOT NULL")
        states_with_artisans = {r["state"].strip().lower() for r in cursor.fetchall() if r["state"]}

        cursor.execute("SELECT DISTINCT state FROM crafts WHERE state IS NOT NULL")
        all_craft_states = [r["state"].strip() for r in cursor.fetchall() if r["state"]]

        states_coverage = []
        for s in set(all_craft_states):
            states_coverage.append({
                "state": s,
                "has_registered_artisans": s.lower() in states_with_artisans
            })

        cursor.close()

        return {
            "summary": {
                "total_crafts": total_crafts,
                "total_states_covered": total_states_covered,
                "total_categories": total_categories,
                "total_artisans": total_artisans,
            },
            "crafts_by_state": crafts_by_state,
            "crafts_by_category": crafts_by_category,
            "artisans_by_state": artisans_by_state,
            "states_coverage": sorted(states_coverage, key=lambda x: x["state"]),
        }
    except Exception as e:
        logger.error(f"get_craft_coverage failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate craft coverage analytics.")
    finally:
        conn.close()
