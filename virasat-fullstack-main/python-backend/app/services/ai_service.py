"""
<<<<<<< HEAD
AI service - generates tourist-friendly content using Google Gemini's free-tier API.
- generate_craft_description(): rewrites a dry registry description into an engaging blurb
- generate_trip_summary(): writes a short narrative summary for a matched set of crafts on a route
=======
AI service - generates tourist-friendly content using Google Gemini's free-tier API
with an OpenAI-compatible fallback for resilient voice and chat assistance.
- generate_craft_description(): rewrites a dry registry description into an engaging blurb
- generate_batch_craft_descriptions(): batch generation for multiple crafts
- generate_trip_summary(): writes a short narrative summary for a matched set of crafts on a route
- generate_artisan_story(): writes a warm narrative biography celebrating an artisan
- generate_assistant_reply(): conversational assistant reply in the artisan's language
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
"""

import os
import logging
import requests
<<<<<<< HEAD
from dotenv import load_dotenv
import json
import re
=======
import json
import re
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("kalatrail")

# --- Gemini Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
FALLBACK_MODELS = [GEMINI_MODEL, "gemini-3.6-flash", "gemini-2.5-flash"]

# --- OpenAI-compatible Fallback Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_BASE = os.getenv(
    "OPENAI_API_BASE",
    os.getenv("OPENAI_BASE_URL", "")
).rstrip("/")
OPENAI_MODEL = os.getenv(
    "VOICE_ASSISTANT_OPENAI_MODEL",
    "gpt-5-mini"
)

# Supported Indian languages mapping
INDIAN_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "as": "Assamese",
    "or": "Odia",
    "ne": "Nepali",
}


def _call_gemini(prompt: str, timeout: int = 8, temperature: float = 0.5) -> str:
    """
    Sends a prompt to Gemini with automatic OpenAI-compatible fallback.
    - If GEMINI_API_KEY is available, attempts Gemini API call.
    - If GEMINI_API_KEY is unavailable (or all Gemini models fail), falls back to OpenAI-compatible
      API ONLY when both OPENAI_API_KEY and OPENAI_API_BASE are configured.
    - Raises ValueError when neither Gemini nor OpenAI-compatible fallback is available.
    """
    gemini_error = None

    if GEMINI_API_KEY:
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}
        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "temperature": temperature
            }
        }

        # Deduplicate models to try
        models_to_try = []
        for m in [GEMINI_MODEL] + FALLBACK_MODELS:
            if m and m not in models_to_try:
                models_to_try.append(m)

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            try:
                response = requests.post(url, params=params, json=body, headers=headers, timeout=timeout)
                if response.ok:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
                        return candidates[0]["content"]["parts"][0]["text"].strip()
                else:
                    logger.warning(f"Gemini model '{model}' failed with status {response.status_code}: {response.text[:200]}")
            except Exception as e:
                logger.warning(f"Gemini request to '{model}' failed: {e}")
                gemini_error = e

    # OpenAI-compatible fallback: used ONLY when both OPENAI_API_KEY and OPENAI_API_BASE are configured
    if OPENAI_API_KEY and OPENAI_API_BASE:
        url = f"{OPENAI_API_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        body = {
            "model": OPENAI_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }
        try:
            response = requests.post(url, json=body, headers=headers, timeout=timeout)
            if response.ok:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.warning(f"OpenAI fallback failed with status {response.status_code}: {response.text[:200]}")
                response.raise_for_status()
        except Exception as e:
            logger.warning(f"OpenAI fallback request failed: {e}")
            raise e

    # If neither Gemini nor OpenAI is configured
    if not GEMINI_API_KEY and not (OPENAI_API_KEY and OPENAI_API_BASE):
        raise ValueError(
            "Neither GEMINI_API_KEY nor OpenAI-compatible fallback (OPENAI_API_KEY and OPENAI_API_BASE) is configured."
        )

    # If Gemini was configured but failed and OpenAI fallback was not configured
    if gemini_error:
        raise RuntimeError(f"Gemini API request failed: {gemini_error}")

    return "Explore India's rich cultural heritage, vibrant traditional handicrafts, and master artisans on Kala Trail."
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27


def generate_batch_craft_descriptions(crafts: list) -> dict:
    """
    Takes a list of craft dicts (each needs: id, name, category, state, district, description).
    Returns a dict mapping craft id -> generated ai_description string.
    """
    if not crafts:
        return {}

    craft_list_text = "\n".join(
        f'{{"id": {c["id"]}, "name": "{c["name"]}", "category": "{c["category"]}", '
        f'"state": "{c["state"]}", "district": "{c["district"]}", '
        f'"facts": "{c["description"]}"}}'
        for c in crafts
    )

    prompt = f"""You are writing short, engaging tourist-facing blurbs for a set of traditional Indian handicrafts.

Here is a JSON list of crafts, each with an id and factual details:
[{craft_list_text}]

For EACH craft in the list, write a warm, engaging 2-3 sentence description for a tourist
discovering it for the first time. Highlight what makes it special. Do not invent facts,
statistics, or dates not implied by the given "facts" field.

Return your answer as a single valid JSON array, with one object per craft, in this exact format:
[{{"id": <the same id>, "description": "<your generated description>"}}, ...]

Rules:
- Return ONLY the JSON array. No markdown code fences, no explanation, no extra text.
- Include EVERY craft id from the input list, in any order.
- Each description must be plain text, no markdown formatting inside it."""

    raw_response = _call_gemini(prompt, temperature=0.5)

    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_response.strip())

    try:
        parsed = json.loads(cleaned)
        return {item["id"]: item["description"] for item in parsed if "id" in item and "description" in item}
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        logger.warning(f"Failed to parse batch response as JSON: {e}. Raw response: {raw_response[:300]}")
        return {}

<<<<<<< HEAD
load_dotenv()
logger = logging.getLogger("kalatrail")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"]


def _call_gemini(prompt: str, timeout: int = 8) -> str:
    """Sends a single-turn prompt to Gemini and returns the text response."""
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set in .env")
        return "Welcome to Kala Trail! Discover traditional crafts and connect with master artisans across India."

    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    models_to_try = [PRIMARY_GEMINI_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_GEMINI_MODEL]

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        try:
            response = requests.post(url, params=params, json=body, headers=headers, timeout=timeout)
            if response.ok:
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            else:
                logger.warning(f"Gemini model '{model}' failed with status {response.status_code}: {response.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini request to '{model}' failed: {e}")

    # Graceful fallback if Gemini API is unreachable or key fails
    return "Explore India's rich cultural heritage, vibrant traditional handicrafts, and master artisans on Kala Trail."


=======
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27

def generate_craft_description(name: str, category: str, state: str, district: str, raw_description: str) -> str:
    """
    Rewrites a dry factual craft description into a warm, tourist-friendly 2-3 sentence blurb.
    """
    prompt = f"""You are writing a short, engaging blurb for a tourism app about a traditional Indian handicraft.

Craft name: {name}
Category: {category}
Region: {district}, {state}
Factual description: {raw_description}

Write a warm, engaging 2-3 sentence description for a tourist discovering this craft for the first time.
Make it feel inviting and highlight what makes it special, without inventing facts not implied by the description.
Do not use markdown formatting. Return ONLY the description text, nothing else."""

<<<<<<< HEAD
    return _call_gemini(prompt)
=======
    return _call_gemini(prompt, timeout=8)
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27


def generate_artisan_story(
    name: str,
    craft_name: str,
    bio: str = "",
    experience_info: str = "",
    years_of_practice: int = 0,
    lang: str = "en",
) -> str:
    """
    Generates a warm narrative bio for an artisan based on their bio, experience, and years of practice.
<<<<<<< HEAD
    Supports target output language (en, hi, kn, ta, te, bn, mr).
    """
    language_names = {
        "en": "English",
        "hi": "Hindi",
        "kn": "Kannada",
        "ta": "Tamil",
        "te": "Telugu",
        "bn": "Bengali",
        "mr": "Marathi",
    }
    lang_name = language_names.get(lang.lower(), "English")
=======
    Supports target output language with robust BCP-47 normalization.
    """
    normalized_lang = (lang or "en").lower().split("-")[0].strip()
    lang_name = INDIAN_LANGUAGES.get(normalized_lang, "English")
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27

    prompt = f"""You are a master storyteller for Kala Trail (Virasat), a cultural travel app promoting Indian artisans.

Artisan Name: {name or 'Master Artisan'}
Craft: {craft_name or 'Traditional Craft'}
Bio: {bio or 'Dedicated traditional craftsman'}
Experience Details: {experience_info or 'Practicing for generations'}
Years of Practice: {years_of_practice or 'many'} years

Write a warm, inspiring 3-4 sentence biographical narrative celebrating this artisan's dedication, heritage, and artistic mastery.
The story must be written ONLY in {lang_name}.
Do not use markdown formatting. Return ONLY the narrative text, nothing else."""

    return _call_gemini(prompt, timeout=12)


def generate_trip_summary(crafts: list, start_label: str = "", end_label: str = "", theme: str = None) -> str:
    """
    Given a list of matched craft dicts (each with name, category, state, district),
    generates one short narrative paragraph summarizing the "craft trail" for the trip.
    """
    if not crafts:
        return "No crafts found along this route."

    craft_lines = "\n".join(
        f"- {c['name']} ({c['category']}) in {c['district']}, {c['state']}"
        for c in crafts
    )

    route_label = f"from {start_label} to {end_label}" if start_label and end_label else "on this route"
    theme_clause = f" tailored specifically around the theme of '{theme}'" if theme else ""

    prompt = f"""You are writing a short, exciting trip summary for a tourism app.

A traveler is going {route_label}{theme_clause} and will pass near these traditional handicraft destinations:
{craft_lines}

Write ONE engaging paragraph (3-4 sentences) summarizing this as a curated "craft trail" for the trip.
Highlight how these artisans and crafts fit together. Do not use markdown formatting.
Return ONLY the paragraph text, nothing else."""

<<<<<<< HEAD
    return _call_gemini(prompt)
=======
    return _call_gemini(prompt, timeout=10)
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27


def generate_assistant_reply(transcript: str, detected_language: str, history: list = None) -> str:
    """
    Takes what the artisan said (already transcribed by Whisper or provided as text) and generates
<<<<<<< HEAD
    a helpful, conversational reply using Gemini.
=======
    a helpful, conversational reply using Gemini with OpenAI fallback.
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27

    Parameters
    ----------
    transcript        : what the artisan said, in plain text
<<<<<<< HEAD
    detected_language : BCP-47 code, e.g. "en", "hi", "kn", "ta", "te", "bn", "mr"
=======
    detected_language : BCP-47 code, e.g. "en", "hi", "kn", "ta", "te", "ml", "mr", "bn", "gu", "pa", "ur", "as", "or", "ne"
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
    history           : optional list of prior turn dicts [{"role": "user"|"assistant", "text": "..."}]

    Returns
    -------
    Reply text matching detected_language
    """
<<<<<<< HEAD
    language_names = {
        "en": "English",
        "hi": "Hindi",
        "kn": "Kannada",
        "ta": "Tamil",
        "te": "Telugu",
        "bn": "Bengali",
        "mr": "Marathi",
    }
    lang_name = language_names.get(detected_language, "English")
=======
    normalized_lang = (detected_language or "en").lower().split("-")[0].strip()
    lang_name = INDIAN_LANGUAGES.get(normalized_lang, "English")
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27

    history_text = ""
    if history:
        turns = []
        for item in history[-6:]:  # include up to last 3 exchanges (6 turns)
            role_label = "Artisan" if item.get("role") == "user" else "Assistant"
            turns.append(f"{role_label}: {item.get('text', '')}")
        history_text = "Prior conversation context:\n" + "\n".join(turns) + "\n\n"

    prompt = f"""You are a friendly voice assistant for Kala Trail, an app that helps Indian artisans
connect with tourists and sell their traditional handicrafts.

{history_text}The artisan has spoken the following message:
"{transcript}"

Their message is in {lang_name}. You MUST reply ONLY in {lang_name}.

Guidelines:
- Keep your reply short and conversational — 2 to 4 sentences maximum.
- If prior conversation context is present, maintain continuity with previous turns.
- Use simple, everyday words suitable for traditional artisans.
- Be warm, encouraging, and practical. Help them understand how to use the app,
  describe their craft, set prices, or connect with visitors.
- Do NOT use any markdown formatting (no asterisks, no bullet points, no headers).
- Return ONLY the reply text in {lang_name}. No English preamble or explanations."""

    return _call_gemini(prompt, timeout=15)