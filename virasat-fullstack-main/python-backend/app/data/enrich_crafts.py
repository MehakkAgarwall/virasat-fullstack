"""
Robust craft-enrichment script with smart rate-limit handling.

Key improvements over a naive retry loop:
- Reads the actual `retryDelay` Gemini returns in its 429 error body and waits
  exactly that long, instead of guessing or retrying too fast.
- If Gemini reports a DAILY quota exhausted (not just per-minute), stops the
  whole run cleanly instead of burning remaining attempts on every craft.
- Safe to re-run any time - only processes crafts still missing ai_description,
  so a partial run today + finishing tomorrow works with zero duplicate effort.

Run from the project root with:
    python -m app.data.enrich_crafts
"""

import os
import sys
import time
import json
import re
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402
from app.services.ai_service import generate_craft_description  # noqa: E402

MAX_RETRIES_PER_CRAFT = 3


def _extract_retry_delay_seconds(error_text: str) -> float:
    """
    Parses Gemini's 429 error body for the real retryDelay it tells us to wait,
    e.g. {"retryDelay": "37s"}. Falls back to 15s if we can't find one.
    """
    match = re.search(r'"retryDelay":\s*"(\d+)s"', error_text)
    if match:
        return float(match.group(1)) + 1  # small buffer
    return 15.0


def _is_daily_quota_exhausted(error_text: str) -> bool:
    """Detects the specific 'per day' quota message vs a per-minute throttle."""
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

    print(f"Found {len(crafts)} crafts without AI descriptions. Enriching...")
    update_cursor = conn.cursor()
    success = 0
    skipped_daily_limit = False

    for i, craft in enumerate(crafts, start=1):
        if skipped_daily_limit:
            print(f"  SKIP '{craft['name']}' - daily quota already exhausted this run")
            continue

        attempt = 0
        while attempt < MAX_RETRIES_PER_CRAFT:
            attempt += 1
            try:
                ai_desc = generate_craft_description(
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
                break

            except requests.exceptions.HTTPError as e:
                error_text = e.response.text if e.response is not None else str(e)

                if _is_daily_quota_exhausted(error_text):
                    print(f"  DAILY QUOTA EXHAUSTED at '{craft['name']}'. "
                          f"Stopping enrichment for today - re-run this script tomorrow "
                          f"to continue exactly where it left off.")
                    skipped_daily_limit = True
                    break

                wait = _extract_retry_delay_seconds(error_text)
                print(f"    attempt {attempt}/{MAX_RETRIES_PER_CRAFT} rate-limited for "
                      f"'{craft['name']}' - waiting {wait:.0f}s (Gemini's own retry delay)")
                time.sleep(wait)

            except Exception as e:
                print(f"    attempt {attempt}/{MAX_RETRIES_PER_CRAFT} failed for "
                      f"'{craft['name']}': {e}")
                time.sleep(3)

        else:
            print(f"  GAVE UP on '{craft['name']}' after {MAX_RETRIES_PER_CRAFT} attempts")

        time.sleep(1.5)  # gentle pacing between crafts even on success

    update_cursor.close()
    conn.close()

    print(f"\nDone this run. {success}/{len(crafts)} crafts enriched.")
    if skipped_daily_limit:
        print("Daily quota was hit - simply re-run this same command tomorrow to pick up "
              "the rest. Nothing needs to change; already-enriched crafts are skipped automatically.")


if __name__ == "__main__":
    enrich()