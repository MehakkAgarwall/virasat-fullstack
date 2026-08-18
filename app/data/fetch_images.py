"""
Fetch craft images using a fallback chain:

1. Wikipedia
2. Wikimedia Commons
3. Government of India Handicrafts portal
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

# Official Government of India handicrafts portal.
GOVT_CRAFTS_URL = (
    "https://handicrafts.gov.in/crafts/All_Crafts/Landing_Page.html"
)

HEADERS = {
    # Wikimedia requires a URL or email contact in the User-Agent,
    # or requests can be throttled/blocked with a 403. Replace the
    # placeholder below with a real repo URL or contact email.
    "User-Agent": (
        "KalaTrail-SIH-Project/1.0 "
        "(https://github.com/YOUR-USERNAME/kalatrail; "
        "YOUR-EMAIL@example.com)"
    )
}

# Minimum number of matching keywords required before we trust a
# search result enough to use its image. Without this, a
# zero-overlap "top of the list" result could get attached to the
# wrong craft.
MIN_MATCH_SCORE = 1


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

# Cache for the government portal page so we don't re-download and
# re-parse it once per craft — its content is the same every time.
_GOVT_SOUP_CACHE = None

# Set once a fetch attempt fails, so we stop retrying an
# unreachable host for every remaining craft in the run.
_GOVT_FETCH_FAILED = False


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

    url = url.lower()

    bad_words = [
        "logo",
        "icon",
        "favicon",
        "sprite",
        "avatar",
        "flag",
    ]

    return not any(word in url for word in bad_words)


# ============================================================
# 1. WIKIPEDIA
# ============================================================

def fetch_wikipedia_image(craft_name):
    """
    Search Wikipedia for the craft and return a suitable image.
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
        "pithumbsize": 1000,
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

            print(
                f"    Wikipedia API error: {data['error']}"
            )

            return None, None

        pages = data.get(
            "query",
            {}
        ).get(
            "pages",
            {}
        )

        keywords = craft_keywords(craft_name)

        print(
            f"    Wikipedia: {len(pages)} raw results, "
            f"keywords={keywords}"
        )

        # ----------------------------------------------------
        # First pass: find pages whose titles resemble craft
        # ----------------------------------------------------

        candidates = []

        for page in pages.values():

            title = page.get("title", "")

            normalized_title = clean_text(title)

            score = 0

            for keyword in keywords:
                if keyword in normalized_title:
                    score += 1

            # MediaWiki's own search ranking (1 = best full-text
            # match). Trust its single top hit even if our crude
            # keyword-in-title check finds no overlap — full-text
            # relevance often doesn't show up in the title. Lower-
            # ranked zero-score results are still rejected as too
            # unreliable.
            search_rank = page.get("index")

            if score < MIN_MATCH_SCORE and search_rank != 1:
                continue

            candidates.append(
                (
                    score,
                    page
                )
            )

        print(
            f"    Wikipedia: {len(candidates)} candidates "
            f"survived filtering"
        )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True
        )

        # ----------------------------------------------------
        # Look for original images
        # ----------------------------------------------------

        for score, page in candidates:

            image = page.get(
                "original",
                {}
            ).get(
                "source"
            )

            if image and image_looks_valid(image):

                return image, page.get("title")

        # ----------------------------------------------------
        # Fall back to thumbnails
        # ----------------------------------------------------

        for score, page in candidates:

            image = page.get(
                "thumbnail",
                {}
            ).get(
                "source"
            )

            if image and image_looks_valid(image):

                return image, page.get("title")

    except Exception as exc:

        print(
            f"    Wikipedia error for "
            f"'{craft_name}': {exc}"
        )

    return None, None


# ============================================================
# 2. WIKIMEDIA COMMONS
# ============================================================

def fetch_commons_image(craft_name):
    """
    Search Wikimedia Commons directly.

    This is independent of Wikipedia articles, which is useful
    for niche crafts that don't have their own Wikipedia page.
    """

    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": craft_name,
        "gsrnamespace": 6,
        "gsrlimit": 10,
        "prop": "imageinfo",
        "iiprop": "url|mime",
        "iiurlwidth": 1200,
    }

    try:

        response = SESSION.get(
            COMMONS_API,
            params=params,
            timeout=15,
        )

        if response.status_code != 200:

            print(
                f"    Commons returned "
                f"{response.status_code}: "
                f"{response.text[:200]}"
            )

            return None, None

        data = response.json()

        if "error" in data:

            print(
                f"    Commons API error: {data['error']}"
            )

            return None, None

        pages = data.get(
            "query",
            {}
        ).get(
            "pages",
            {}
        )

        keywords = craft_keywords(craft_name)

        print(
            f"    Commons: {len(pages)} raw results, "
            f"keywords={keywords}"
        )

        candidates = []

        for page in pages.values():

            title = page.get("title", "")

            normalized_title = clean_text(title)

            score = 0

            for keyword in keywords:
                if keyword in normalized_title:
                    score += 1

            search_rank = page.get("index")

            if score < MIN_MATCH_SCORE and search_rank != 1:
                continue

            image_info = page.get(
                "imageinfo",
                []
            )

            if not image_info:
                continue

            info = image_info[0]

            url = info.get("url")

            mime = info.get(
                "mime",
                ""
            )

            if not url:
                continue

            if not mime.startswith("image/"):
                continue

            if not image_looks_valid(url):
                continue

            candidates.append(
                (
                    score,
                    url,
                    title
                )
            )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True
        )

        if candidates:

            _, url, title = candidates[0]

            return url, title

    except Exception as exc:

        print(
            f"    Wikimedia Commons error for "
            f"'{craft_name}': {exc}"
        )

    return None, None


# ============================================================
# 3. GOVERNMENT OF INDIA HANDICRAFTS PORTAL
# ============================================================

def _get_government_soup():
    """
    Fetch and parse the government handicrafts portal page once,
    then reuse the parsed soup for every craft lookup. Avoids
    re-downloading the same page N times.
    """

    global _GOVT_SOUP_CACHE, _GOVT_FETCH_FAILED

    if _GOVT_SOUP_CACHE is not None:
        return _GOVT_SOUP_CACHE

    # If we already failed to reach the portal once this run, don't
    # burn another 3x-retry/20s-timeout cycle on every remaining
    # craft — the host is unreachable, not the individual request.
    if _GOVT_FETCH_FAILED:
        return None

    try:

        response = SESSION.get(
            GOVT_CRAFTS_URL,
            timeout=10,
        )

        if response.status_code != 200:
            _GOVT_FETCH_FAILED = True
            return None

        _GOVT_SOUP_CACHE = BeautifulSoup(
            response.text,
            "html.parser"
        )

        return _GOVT_SOUP_CACHE

    except Exception as exc:

        print(
            f"    Government portal unreachable, skipping "
            f"for remaining crafts: {exc}"
        )

        _GOVT_FETCH_FAILED = True

        return None


def fetch_government_image(craft_name):
    """
    Search the official Government of India handicrafts portal.

    This is deliberately conservative. We inspect image links and
    only accept images whose surrounding/link text resembles the
    craft name.

    We do NOT blindly grab the first image from the government site.
    """

    try:

        soup = _get_government_soup()

        if soup is None:
            return None, None

        keywords = craft_keywords(craft_name)

        candidates = []

        for img in soup.find_all("img"):

            raw_src = (
                img.get("src")
                or img.get("data-src")
            )

            if not raw_src:
                continue

            # BeautifulSoup types attribute values as possibly a
            # list (for multi-valued attrs like class/srcset), so
            # coerce explicitly even though src is always a single
            # string in practice.
            src = str(raw_src)

            alt = str(
                img.get(
                    "alt",
                    ""
                )
            )

            parent_text = ""

            parent = img.parent

            if parent:
                parent_text = parent.get_text(
                    " ",
                    strip=True
                )

            combined_text = clean_text(
                f"{alt} {parent_text}"
            )

            score = 0

            for keyword in keywords:

                if keyword in combined_text:

                    score += 1

            if score < MIN_MATCH_SCORE:
                continue

            # Convert relative URLs into absolute URLs.
            if src.startswith("//"):
                src = "https:" + src

            elif src.startswith("/"):
                src = (
                    "https://handicrafts.gov.in"
                    + src
                )

            elif not src.startswith("http"):
                src = (
                    "https://handicrafts.gov.in/"
                    + src.lstrip("/")
                )

            if not image_looks_valid(src):
                continue

            candidates.append(
                (
                    score,
                    src,
                    alt
                )
            )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True
        )

        if candidates:

            _, url, description = candidates[0]

            return url, description

    except Exception as exc:

        print(
            f"    Government portal error for "
            f"'{craft_name}': {exc}"
        )

    return None, None


# ============================================================
# MAIN FALLBACK PIPELINE
# ============================================================

def fetch_image(craft_name):

    # --------------------------------------------------------
    # 1. Wikipedia
    # --------------------------------------------------------

    print(
        f"    Trying Wikipedia..."
    )

    image, source = fetch_wikipedia_image(
        craft_name
    )

    if image:

        return (
            image,
            "Wikipedia",
            source
        )

    time.sleep(0.5)

    # --------------------------------------------------------
    # 2. Wikimedia Commons
    # --------------------------------------------------------

    print(
        f"    Trying Wikimedia Commons..."
    )

    image, source = fetch_commons_image(
        craft_name
    )

    if image:

        return (
            image,
            "Wikimedia Commons",
            source
        )

    time.sleep(0.5)

    # --------------------------------------------------------
    # 3. Government of India
    # --------------------------------------------------------

    print(
        f"    Trying Government of India..."
    )

    image, source = fetch_government_image(
        craft_name
    )

    if image:

        return (
            image,
            "Government of India Handicrafts",
            source
        )

    return None, None, None


# ============================================================
# DATABASE
# ============================================================

def run():

    conn = get_connection()

    try:

        cursor = conn.cursor(
            dictionary=True
        )

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

        print(
            f"Found {len(crafts)} crafts without an image."
        )

        print(
            "Using fallback:"
        )

        print(
            "Wikipedia -> Wikimedia Commons -> "
            "Government of India"
        )

        print()

        update_cursor = conn.cursor()

        success = 0

        try:

            for craft in crafts:

                craft_name = craft["name"]

                print(
                    f"\n[{craft_name}]"
                )

                image_url, source, matched = fetch_image(
                    craft_name
                )

                if image_url:

                    update_cursor.execute(
                        """
                        UPDATE crafts
                        SET image_url = %s
                        WHERE id = %s
                        """,
                        (
                            image_url,
                            craft["id"]
                        )
                    )

                    conn.commit()

                    success += 1

                    print(
                        f"    FOUND via {source}"
                    )

                    print(
                        f"    Match: {matched}"
                    )

                    print(
                        f"    URL: {image_url}"
                    )

                else:

                    print(
                        f"    MISS '{craft_name}'"
                    )

                    print(
                        "    No suitable image found."
                    )

                time.sleep(0.8)

        finally:

            update_cursor.close()

        print()
        print(
            "=" * 60
        )

        print(
            f"Done. {success}/{len(crafts)} "
            f"crafts got an image URL."
        )

        print(
            "=" * 60
        )

    finally:

        conn.close()


if __name__ == "__main__":
    run()