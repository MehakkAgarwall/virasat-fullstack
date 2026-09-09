"""
i18n_routes.py
Exposes two endpoints for UI language switching:

  GET /i18n/languages        → list of supported languages (code + native name)
  GET /i18n/{lang}           → full flat dict of UI strings in that language

The frontend calls /i18n/languages once on load to build the language toggle,
then calls /i18n/{lang} whenever the user switches language, and swaps every
UI label from the response dict.
"""

import logging
from fastapi import APIRouter, HTTPException
from app.services.i18n_service import get_translations, get_supported_languages

router = APIRouter(prefix="/i18n", tags=["i18n"])
logger = logging.getLogger("kalatrail")

SUPPORTED_CODES = {"en", "hi", "kn"}


@router.get("/languages")
def list_languages():
    """
    Returns the list of supported languages.

    Response:
    {
      "languages": [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "हिंदी"},
        {"code": "kn", "name": "ಕನ್ನಡ"}
      ]
    }
    """
    langs = get_supported_languages()
    return {
        "languages": [{"code": code, "name": name} for code, name in langs.items()]
    }


@router.get("/{lang}")
def get_ui_strings(lang: str):
    """
    Returns all UI strings translated into the requested language.
    Falls back to English for unknown lang codes (never crashes the frontend).

    Example: GET /i18n/hi
    Response:
    {
      "lang": "hi",
      "strings": {
        "nav_home": "होम",
        "hero_title": "भारत की जीवित विरासत खोजें",
        ...
      }
    }
    """
    # Normalise code (e.g. "HI" → "hi", "Kn" → "kn")
    lang_clean = lang.strip().lower()

    if lang_clean not in SUPPORTED_CODES:
        logger.warning(f"Unsupported lang '{lang}' requested — falling back to 'en'")
        lang_clean = "en"

    strings = get_translations(lang_clean)
    return {"lang": lang_clean, "strings": strings}
