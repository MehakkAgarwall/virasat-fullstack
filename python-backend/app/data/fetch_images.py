"""
Fetch craft images using a fallback chain:

1. Wikipedia  (pageimages → article image list fallback)
2. Wikimedia Commons  (full name → simplified 2-keyword retry)
3. Flickr public feed  (no API key needed)
4. Leave NULL if no suitable image is found

Run from project root:

    python -m app.data.fetch_images

Safe to re-run:
- Existing image_url values are never overwritten.
- Only crafts with image_url IS NULL are processed.
"""

import os
import sys
import time
import re
import json
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from bs4 import BeautifulSoup

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402


# ============================================================
# CONFIG
# ============================================================

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# Flickr public photo feed — no API key required.
FLICKR_FEED_URL = (
    "https://api.flickr.com/services/feeds/photos_public.gne"
)

HEADERS = {
    # Wikimedia requires a URL or email contact in the User-Agent,
    # or requests can be throttled/blocked with a 403.
    "User-Agent": (
        "KalaTrail-SIH-Project/1.0 "
        "(https://github.com/YOUR-USERNAME/kalatrail; "
        "YOUR-EMAIL@example.com)"
    )
}

# Minimum number of matching keywords required before we trust a
# search result enough to use its image.
MIN_MATCH_SCORE = 1

# Image extensions we consider valid photo files.
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff"}


def make_session():
    """A requests session with basic retry/backoff for transient
    errors and rate limiting (429)."""

    session = requests.Session()

    retries = Retry(
        total=3,
        backoff_factor=1.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )

    session.mount("https://", HTTPAdapter(max_retries=retries))
    session.mount("http://", HTTPAdapter(max_retries=retries))
    session.headers.update(HEADERS)

    return session


SESSION = make_session()


# ============================================================
# GENERIC HELPERS
# ============================================================

def clean_text(text):
    """Normalize text for comparison."""

    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def craft_keywords(craft_name):
    """
    Extract useful keywords from a craft name.

    Example:
        "Kashmiri Hand-Knotted Carpet"
    becomes roughly:
        ["kashmiri", "hand", "knotted", "carpet"]
    """

    stop_words = {
        "of",
        "the",
        "and",
        "work",
        "craft",
        "crafts",
        "india",
        "indian",
    }

    words = clean_text(craft_name).split()

    return [
        word
        for word in words
        if word not in stop_words and len(word) > 2
    ]


def image_looks_valid(url):
    """Basic sanity check for an image URL."""

    if not url:
        return False

    url_lower = url.lower()

    bad_words = [
        "logo",
        "icon",
        "favicon",
        "sprite",
        "avatar",
        "flag",
        "map",
        "seal",
        "coa",         # coat of arms
        "emblem",
        "stamp",
        "blank",
    ]

    if any(word in url_lower for word in bad_words):
        return False

    # Must end in a recognized image extension.
    # Extract just the path part (before any query string).
    path = url_lower.split("?")[0]
    _, ext = os.path.splitext(path)

    # SVG files are usually icons/diagrams — skip unless it's
    # the only option (handled higher up).
    if ext == ".svg":
        return False

    return True


# ============================================================
# 1. WIKIPEDIA
# ============================================================

def _resolve_wiki_image_url(title):
    """
    Given a File: title (e.g. "File:Narasapur_lace.jpg"),
    return its direct URL via the imageinfo API.
    Returns None if not found or not a valid image.
    """

    params = {
        "action": "query",
        "format": "json",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
        "iiurlwidth": 1200,
    }

    try:
        resp = SESSION.get(WIKIPEDIA_API, params=params, timeout=15)
        if resp.status_code != 200:
            return None

        data = resp.json()
        pages = data.get("query", {}).get("pages", {})

        for page in pages.values():
            infos = page.get("imageinfo", [])
            if not infos:
                continue

            info = infos[0]
            url = info.get("url") or info.get("thumburl")
            mime = info.get("mime", "")

            if not url:
                continue

            if not mime.startswith("image/"):
                continue

            if not image_looks_valid(url):
                continue

            return url

    except Exception:
        pass

    return None


def _fetch_wikipedia_article_images(page_id):
    """
    List all images embedded in a Wikipedia article (prop=images)
    and resolve each one to a direct URL. Returns the first valid
    non-diagram image URL, or None.
    """

    params = {
        "action": "query",
        "format": "json",
        "pageids": page_id,
        "prop": "images",
        "imlimit": 20,
    }

    try:
        resp = SESSION.get(WIKIPEDIA_API, params=params, timeout=15)
        if resp.status_code != 200:
            return None

        data = resp.json()
        pages = data.get("query", {}).get("pages", {})

        for page in pages.values():
            images = page.get("images", [])

            for img in images:
                title = img.get("title", "")

                # Skip common non-photo files.
                title_lower = title.lower()
                if any(
                    bad in title_lower
                    for bad in [
                        "logo", "icon", "map", "flag", "seal",
                        "emblem", "coa", "stamp", "blank", "commons",
                        "wikimedia", "edit", "question", "sound",
                    ]
                ):
                    continue

                url = _resolve_wiki_image_url(title)
                if url:
                    return url

    except Exception:
        pass

    return None


def fetch_wikipedia_image(craft_name):
    """
    Search Wikipedia for the craft and return a suitable image.

    Two-step approach:
    1. Use pageimages to get the article's lead image (fast).
    2. If no lead image, list all article images and resolve the
       first valid one (fallback for stub/niche articles).
    """

    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": craft_name,
        "gsrnamespace": 0,
        "gsrlimit": 8,
        "prop": "pageimages",
        "piprop": "original|thumbnail",
        "pithumbsize": 1200,
    }

    try:
        response = SESSION.get(
            WIKIPEDIA_API,
            params=params,
            timeout=15,
        )

        if response.status_code != 200:
            print(
                f"    Wikipedia returned "
                f"{response.status_code}: "
                f"{response.text[:200]}"
            )
            return None, None

        data = response.json()

        if "error" in data:
            print(f"    Wikipedia API error: {data['error']}")
            return None, None

        pages = data.get("query", {}).get("pages", {})

        keywords = craft_keywords(craft_name)

        print(
            f"    Wikipedia: {len(pages)} raw results, "
            f"keywords={keywords}"
        )

        # ----------------------------------------------------
        # Filter pages by keyword relevance
        # ----------------------------------------------------

        candidates = []

        for page in pages.values():
            title = page.get("title", "")
            normalized_title = clean_text(title)
            score = 0

            for keyword in keywords:
                if keyword in normalized_title:
                    score += 1

            search_rank = page.get("index")

            # Trust the top-ranked result even with 0 title
            # overlap — full-text matches don't always show in
            # the title. Reject lower-ranked zero-score results.
            if score < MIN_MATCH_SCORE and search_rank != 1:
                continue

            candidates.append((score, page))

        print(
            f"    Wikipedia: {len(candidates)} candidates "
            f"survived filtering"
        )

        candidates.sort(key=lambda item: item[0], reverse=True)

        # ----------------------------------------------------
        # Pass 1: lead image via pageimages
        # ----------------------------------------------------

        for score, page in candidates:
            image = (
                page.get("original", {}).get("source")
                or page.get("thumbnail", {}).get("source")
            )

            if image and image_looks_valid(image):
                return image, page.get("title")

        # ----------------------------------------------------
        # Pass 2: article image list fallback
        # ----------------------------------------------------

        print("    Wikipedia: no lead images, trying article image list...")

        for score, page in candidates:
            page_id = page.get("pageid")
            if page_id is None:
                continue

            url = _fetch_wikipedia_article_images(page_id)
            if url:
                return url, page.get("title")

    except Exception as exc:
        print(f"    Wikipedia error for '{craft_name}': {exc}")

    return None, None


# ============================================================
# 2. WIKIMEDIA COMMONS
# ============================================================

def _commons_search(query, limit=10, strict=False):
    """
    Run a single Wikimedia Commons file-namespace search and
    return a list of (score, url, title) tuples.

    strict=True: every result must have a real keyword match
                 (no search_rank==1 trust). Use this for broad
                 fallback queries to prevent false positives.
    strict=False (default): trust the top-ranked result even with
                 0 title overlap (full-text relevance).
    """

    keywords = craft_keywords(query)

    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,   # File: namespace
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|mime",
        "iiurlwidth": 1200,
    }

    try:
        response = SESSION.get(COMMONS_API, params=params, timeout=15)

        if response.status_code != 200:
            return []

        data = response.json()

        if "error" in data:
            return []

        pages = data.get("query", {}).get("pages", {})

        print(f"    Commons: {len(pages)} raw results, keywords={keywords}")

        candidates = []

        for page in pages.values():
            title = page.get("title", "")
            normalized_title = clean_text(title)

            score = 0
            for keyword in keywords:
                if keyword in normalized_title:
                    score += 1

            search_rank = page.get("index")

            # In strict mode every result must earn a real score.
            # In non-strict mode, trust the engine's top hit even
            # when our crude title check finds no overlap.
            if strict:
                if score < MIN_MATCH_SCORE:
                    continue
            else:
                if score < MIN_MATCH_SCORE and search_rank != 1:
                    continue

            image_info = page.get("imageinfo", [])
            if not image_info:
                continue

            info = image_info[0]
            url = info.get("url")
            mime = info.get("mime", "")

            if not url:
                continue

            if not mime.startswith("image/"):
                continue

            if not image_looks_valid(url):
                continue

            candidates.append((score, url, title))

        return candidates

    except Exception as exc:
        print(f"    Commons error: {exc}")
        return []


def fetch_commons_image(craft_name):
    """
    Search Wikimedia Commons for a craft image.

    Three-attempt strategy:
    1. Full craft name search.
    2. Simplified 2-keyword search (broader).
    3. First keyword alone + second keyword (even broader).
    """

    keywords = craft_keywords(craft_name)

    # Attempt 1: full craft name.
    candidates = _commons_search(craft_name, limit=10)

    if not candidates and len(keywords) >= 2:
        # Attempt 2: first two keywords only.
        short_query = " ".join(keywords[:2])
        print(f"    Commons: retrying with simplified query '{short_query}'")
        candidates = _commons_search(short_query, limit=10)

    if not candidates and len(keywords) >= 3:
        # Attempt 3: skip the first word (often a place name that
        # doesn't appear in Commons file titles) and try the rest.
        alt_query = " ".join(keywords[1:3])
        print(f"    Commons: retrying with alt query '{alt_query}'")
        candidates = _commons_search(alt_query, limit=10)

    if candidates:
        candidates.sort(key=lambda item: item[0], reverse=True)
        _, url, title = candidates[0]
        return url, title

    return None, None


# ============================================================
# 3. FLICKR PUBLIC FEED
# ============================================================

def fetch_flickr_image(craft_name):
    """
    Search Flickr's public photo feed (no API key required).

    The public feed endpoint accepts a `tags` parameter and
    returns JSONP/JSON with photo metadata including direct URLs.
    """

    keywords = craft_keywords(craft_name)

    if not keywords:
        return None, None

    # Use the two most distinctive keywords as tags.
    tags = ",".join(keywords[:3])

    params = {
        "tags": tags,
        "tagmode": "all",
        "format": "json",
        "nojsoncallback": 1,
        "lang": "en-us",
    }

    try:
        response = SESSION.get(
            FLICKR_FEED_URL,
            params=params,
            timeout=15,
        )

        if response.status_code != 200:
            print(
                f"    Flickr returned "
                f"{response.status_code}: "
                f"{response.text[:200]}"
            )
            return None, None

        data = response.json()
        items = data.get("items", [])

        print(
            f"    Flickr: {len(items)} raw results, "
            f"tags={tags}"
        )

        for item in items:
            # The `media` dict has key "m" for medium-size URL.
            media = item.get("media", {})
            url = media.get("m", "")

            if not url:
                continue

            # Upgrade to large size by replacing _m with _b.
            url = url.replace("_m.jpg", "_b.jpg")

            title = item.get("title", "")

            if not image_looks_valid(url):
                continue

            # Score this result against our keywords.
            combined = clean_text(f"{title} {item.get('tags', '')}")
            score = sum(1 for kw in keywords if kw in combined)

            if score < MIN_MATCH_SCORE:
                continue

            return url, title

    except Exception as exc:
        print(f"    Flickr error for '{craft_name}': {exc}")

    return None, None


# ============================================================
# MAIN FALLBACK PIPELINE
# ============================================================

def fetch_image(craft_name):

    # --------------------------------------------------------
    # 1. Wikipedia
    # --------------------------------------------------------

    print("    Trying Wikipedia...")

    image, source = fetch_wikipedia_image(craft_name)

    if image:
        return image, "Wikipedia", source

    time.sleep(0.5)

    # --------------------------------------------------------
    # 2. Wikimedia Commons
    # --------------------------------------------------------

    print("    Trying Wikimedia Commons...")

    image, source = fetch_commons_image(craft_name)

    if image:
        return image, "Wikimedia Commons", source

    time.sleep(0.5)

    # --------------------------------------------------------
    # 3. Flickr public feed
    # --------------------------------------------------------

    print("    Trying Flickr...")

    image, source = fetch_flickr_image(craft_name)

    if image:
        return image, "Flickr", source

    return None, None, None


# ============================================================
# DATABASE
# ============================================================

def run():

    conn = get_connection()

    try:

        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name
            FROM crafts
            WHERE image_url IS NULL
            """
        )

        crafts = cursor.fetchall()
        cursor.close()

        if not crafts:
            print(
                "All crafts already have an image_url. "
                "Nothing to do."
            )
            return

        print(f"Found {len(crafts)} crafts without an image.")
        print("Using fallback:")
        print("Wikipedia -> Wikimedia Commons -> Flickr")
        print()

        update_cursor = conn.cursor()

        success = 0

        try:

            for craft in crafts:

                craft_name = craft["name"]

                print(f"\n[{craft_name}]")

                image_url, source, matched = fetch_image(craft_name)

                if image_url:

                    update_cursor.execute(
                        """
                        UPDATE crafts
                        SET image_url = %s
                        WHERE id = %s
                        """,
                        (image_url, craft["id"])
                    )

                    conn.commit()

                    success += 1

                    print(f"    FOUND via {source}")
                    print(f"    Match: {matched}")
                    print(f"    URL: {image_url}")

                else:

                    print(f"    MISS '{craft_name}'")
                    print("    No suitable image found.")

                time.sleep(0.8)

        finally:
            update_cursor.close()

        print()
        print("=" * 60)
        print(f"Done. {success}/{len(crafts)} crafts got an image URL.")
        print("=" * 60)

    finally:
        conn.close()


if __name__ == "__main__":
    run()