"""
One-time enrichment script: generates a friendly AI description for every craft
that doesn't already have one, and saves it into the `ai_description` column.

Run from the project root with:
    python -m app.data.enrich_crafts

Safe to re-run - it skips crafts that already have an ai_description,
so you won't burn API calls regenerating what's already cached.
"""

import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402
from app.services.ai_service import generate_craft_description  # noqa: E402

MAX_RETRIES = 3
RETRY_DELAY = 20  # seconds, on top of the normal 13s pacing


def enrich():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM crafts WHERE ai_description IS NULL")
    crafts_to_enrich = cursor.fetchall()

    if not crafts_to_enrich:
        print("All crafts already have AI descriptions. Nothing to do.")
        cursor.close()
        conn.close()
        return

    print(f"Found {len(crafts_to_enrich)} crafts without AI descriptions. Generating...")

    update_cursor = conn.cursor()
    success_count = 0

    for craft in crafts_to_enrich:
        ai_desc = None
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                ai_desc = generate_craft_description(
                    name=craft["name"],
                    category=craft["category"],
                    state=craft["state"],
                    district=craft["district"],
                    raw_description=craft["description"],
                )
                break  # success, stop retrying
            except Exception as e:
                last_error = e
                print(f"  attempt {attempt}/{MAX_RETRIES} failed for {craft['name']}: {type(e).__name__}: {e}")
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY)

        if ai_desc is not None:
            update_cursor.execute(
                "UPDATE crafts SET ai_description = %s WHERE id = %s",
                (ai_desc, craft["id"]),
            )
            conn.commit()
            success_count += 1
            print(f"  [{success_count}/{len(crafts_to_enrich)}] {craft['name']} - done")
        else:
            print(f"  GAVE UP on {craft['name']} after {MAX_RETRIES} attempts: {last_error}")

        # Free tier allows 5 requests/minute - wait between calls to stay under that limit
        time.sleep(13)

    update_cursor.close()
    cursor.close()
    conn.close()

    print(f"Enriched {success_count}/{len(crafts_to_enrich)} crafts.")


if __name__ == "__main__":
    enrich()