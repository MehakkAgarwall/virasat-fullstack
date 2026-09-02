"""
Bulk craft-enrichment script using GROQ instead of Gemini.
One request per craft (Groq's 14,400/day free limit makes this easy - no batching needed),
paced to stay under 30 requests/minute.

Run from the project root with:
    python -m app.data.enrich_crafts_groq

Safe to re-run - only processes crafts still missing ai_description.
Your live trip-summary feature is untouched - it keeps using Gemini via ai_service.py.
"""

import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402
from app.services.groq_service import generate_craft_description_groq  # noqa: E402

# 30 requests/minute limit -> stay safely under with ~2.2s between calls
SECONDS_BETWEEN_CALLS = 2.2


def enrich():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM crafts WHERE ai_description IS NULL")
    crafts = cursor.fetchall()
    cursor.close()

    if not crafts:
        print("All crafts already have AI descriptions. Nothing to do.")
        conn.close()
        return

    print(f"Found {len(crafts)} crafts without AI descriptions. Enriching via Groq...")
    update_cursor = conn.cursor()
    success = 0

    for i, craft in enumerate(crafts, start=1):
        try:
            ai_desc = generate_craft_description_groq(
                name=craft["name"],
                category=craft["category"],
                state=craft["state"],
                district=craft["district"],
                raw_description=craft["description"],
            )
            update_cursor.execute(
                "UPDATE crafts SET ai_description = %s WHERE id = %s",
                (ai_desc, craft["id"]),
            )
            conn.commit()
            success += 1
            print(f"  [{i}/{len(crafts)}] {craft['name']} - done")
        except Exception as e:
            print(f"  FAILED for '{craft['name']}': {e}")

        time.sleep(SECONDS_BETWEEN_CALLS)

    update_cursor.close()
    conn.close()
    print(f"\nDone. {success}/{len(crafts)} crafts enriched via Groq.")


if __name__ == "__main__":
    enrich()