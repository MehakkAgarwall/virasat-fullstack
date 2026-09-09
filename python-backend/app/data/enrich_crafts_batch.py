"""
Batch craft-enrichment script. Processes crafts in groups (default 15 per API call)
instead of one call per craft - this is the key fix for large datasets (200-300+ crafts)
hitting free-tier daily request limits.

Example: 300 crafts / 15 per batch = 20 API calls total, instead of 300.

Run from the project root with:
    python -m app.data.enrich_crafts_batch

Safe to re-run - only processes crafts still missing ai_description.
"""

import os
import sys
import time
import re

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402
from app.services.ai_service import generate_batch_craft_descriptions  # noqa: E402

BATCH_SIZE = 15
SECONDS_BETWEEN_BATCHES = 5


def chunk(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def _is_daily_quota_exhausted(error_text: str) -> bool:
    return "PerDay" in error_text or "per day" in error_text.lower()


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

    batches = list(chunk(crafts, BATCH_SIZE))
    print(f"Found {len(crafts)} crafts without descriptions -> {len(batches)} batches of up to {BATCH_SIZE}.")

    update_cursor = conn.cursor()
    total_success = 0

    for batch_num, batch in enumerate(batches, start=1):
        print(f"\nBatch {batch_num}/{len(batches)} ({len(batch)} crafts)...")

        try:
            results = generate_batch_craft_descriptions(batch)
        except Exception as e:
            error_text = str(e)
            if _is_daily_quota_exhausted(error_text):
                print(f"DAILY QUOTA EXHAUSTED at batch {batch_num}. "
                      f"Stopping - re-run this script tomorrow to continue automatically "
                      f"from where it left off (already-enriched crafts are skipped).")
                break
            print(f"  Batch {batch_num} failed entirely: {e}")
            time.sleep(SECONDS_BETWEEN_BATCHES)
            continue

        if not results:
            print(f"  Batch {batch_num} returned no usable results (parsing issue) - skipping, will retry on next run.")
            time.sleep(SECONDS_BETWEEN_BATCHES)
            continue

        for craft in batch:
            if craft["id"] in results:
                update_cursor.execute(
                    "UPDATE crafts SET ai_description = %s WHERE id = %s",
                    (results[craft["id"]], craft["id"]),
                )
                total_success += 1
            else:
                print(f"    Missing from batch response: '{craft['name']}' (id {craft['id']})")

        conn.commit()
        print(f"  Batch {batch_num}: {sum(1 for c in batch if c['id'] in results)}/{len(batch)} enriched.")

        time.sleep(SECONDS_BETWEEN_BATCHES)

    update_cursor.close()
    conn.close()
    print(f"\nDone this run. {total_success}/{len(crafts)} crafts enriched.")


if __name__ == "__main__":
    enrich()