"""
One-time script: fetches a real, freely-licensed image URL for each craft from
Wikipedia's public REST API, and saves it into the `image_url` column.

Run from the project root with:
    python -m app.data.fetch_images

Safe to re-run - only updates crafts that don't already have an image_url.
Wikipedia's API requires a descriptive User-Agent header or it will reject requests.
"""

import os
import sys
import time
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402

WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"
HEADERS = {"User-Agent": "KalaTrail-SIH-Project/1.0 (educational hackathon project)"}

# Maps each craft's name in our DB to the best-matching Wikipedia article title.
# Wikipedia article titles are picky about exact spelling/capitalization -
# these are the correct titles as of writing.
# Maps each craft's name in our DB to a list of candidate Wikipedia article titles,
# tried in order until one returns an image. Wikipedia titles are picky about exact
# spelling/capitalization, so we give a few alternatives for trickier ones.
WIKIPEDIA_TITLES = {
    "Pashmina Shawl": ["Pashmina"],
    "Kashmiri Papier-Mache": ["Kashmir papier-mâché"],
    "Chikankari Embroidery": ["Chikan (embroidery)", "Chikan work", "Chikankari"],
    "Banarasi Silk Saree": ["Banarasi sari"],
    "Moradabad Brassware": ["Moradabad"],
    "Madhubani Painting": ["Madhubani art"],
    "Kanchipuram Silk Saree": ["Kanchipuram Sari", "Kanjivaram sari", "Kanchipuram silk"],
    "Thanjavur Painting": ["Thanjavur painting"],
    "Channapatna Toys": ["Channapatna toys"],
    "Bidriware": ["Bidriware"],
    "Mysore Silk Saree": ["Mysore silk"],
    "Pochampally Ikat": ["Pochampally Ikat"],
    "Kondapalli Toys": ["Kondapalli Toys", "Kondapalli Bommalu", "Kondapalli"],
    "Bastar Dhokra Art": ["Dhokra"],
    "Pattachitra Painting": ["Pattachitra"],
    "Sambalpuri Saree": ["Sambalpuri sari"],
    "Bankura Terracotta": ["Bankura horse"],
    "Kutch Embroidery": ["Kutch district"],
    "Patan Patola": ["Patan Patola", "Patola sari", "Patola"],
    "Blue Pottery": ["Jaipur Blue Pottery", "Blue pottery"],
    "Bagru Hand Block Print": ["Bagru print"],
    "Phulkari Embroidery": ["Phulkari"],
    "Warli Painting": ["Warli painting"],
    "Aranmula Kannadi": ["Aranmula Kannadi"],
    "Nagaland Bamboo Craft": ["Bamboo and cane craft", "Cane and bamboo craft", "Nagaland"],
}


def fetch_image_for(title):
    """Returns an image URL from Wikipedia's summary API, or None if unavailable."""
    url = WIKI_API.format(title.replace(" ", "_"))
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
        thumb = data.get("thumbnail", {}).get("source")
        original = data.get("originalimage", {}).get("source")
        return thumb or original
    except Exception as e:
        print(f"    error fetching '{title}': {e}")
        return None


def run():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name FROM crafts WHERE image_url IS NULL")
    crafts = cursor.fetchall()
    cursor.close()

    if not crafts:
        print("All crafts already have an image_url. Nothing to do.")
        conn.close()
        return

    print(f"Found {len(crafts)} crafts without an image. Fetching from Wikipedia...")
    update_cursor = conn.cursor()
    success = 0

    for craft in crafts:
        titles = WIKIPEDIA_TITLES.get(craft["name"])
        if not titles:
            print(f"  SKIP '{craft['name']}' - no Wikipedia title mapped")
            continue

        image_url = None
        tried = []
        for title in titles:
            tried.append(title)
            image_url = fetch_image_for(title)
            if image_url:
                break
            time.sleep(0.3)

        if image_url:
            update_cursor.execute(
                "UPDATE crafts SET image_url = %s WHERE id = %s",
                (image_url, craft["id"]),
            )
            conn.commit()
            success += 1
            print(f"  [{success}] {craft['name']} (via '{tried[-1]}') -> {image_url}")
        else:
            print(f"  MISS '{craft['name']}' (tried {tried}) - no image found, left null")

        time.sleep(0.5)  # be polite to Wikipedia's API

    update_cursor.close()
    conn.close()
    print(f"\nDone. {success}/{len(crafts)} crafts got an image URL.")
    print("Any 'MISS' entries above need a manual image URL - safe to re-run this script later.")


if __name__ == "__main__":
    run()