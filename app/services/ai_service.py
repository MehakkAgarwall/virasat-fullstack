"""
AI service - generates tourist-friendly content using Google Gemini's free-tier API.
- generate_craft_description(): rewrites a dry registry description into an engaging blurb
- generate_trip_summary(): writes a short narrative summary for a matched set of crafts on a route
"""

import os
import logging
import requests
from dotenv import load_dotenv
import json
import re


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

load_dotenv()
logger = logging.getLogger("kalatrail")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.5-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def _call_gemini(prompt: str, timeout: int = 8) -> str:
    """Sends a single-turn prompt to Gemini and returns the text response.

    timeout defaults to 8s (was 30s). generate_trip_summary is a best-effort
    extra on top of /trip/crafts-along-route - its own caller already treats
    a failure as non-fatal and returns trip_summary: null. But at 30s, a slow
    Gemini call was blocking the *entire* route response (including the actual
    craft matches) for up to 30 extra seconds, which is what was tripping the
    frontend's timeout and forcing it to fall back to mock data. Failing fast
    here means the person always gets their crafts+route quickly, with the
    trip_summary simply absent when Gemini is slow, instead of the whole
    request stalling.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in .env")

    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(GEMINI_API_URL, params=params, json=body, headers=headers, timeout=timeout)
    if not response.ok:
        # Log the real error body so failures are debuggable instead of a bare status code
        logger.error(f"Gemini API error {response.status_code}: {response.text}")
    response.raise_for_status()
    data = response.json()

    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


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

    return _call_gemini(prompt)


def generate_trip_summary(crafts: list, start_label: str = "", end_label: str = "") -> str:
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

    prompt = f"""You are writing a short, exciting trip summary for a tourism app.

A traveler is going {route_label} and will pass near these traditional handicraft destinations:
{craft_lines}

Write ONE engaging paragraph (3-4 sentences) summarizing this as a "craft trail" for the trip.
Make it sound like an exciting cultural journey. Do not use markdown formatting.
Return ONLY the paragraph text, nothing else."""

    return _call_gemini(prompt)


def generate_assistant_reply(transcript: str, detected_language: str) -> str:
    """
    Takes what the artisan said (already transcribed by Whisper) and generates
    a helpful, conversational reply using Gemini.

    The reply is always in the SAME language the artisan spoke — no reading required
    because the caller will pass this text straight to gTTS for audio output.

    Parameters
    ----------
    transcript        : what the artisan said, in plain text
    detected_language : Whisper's 2-letter BCP-47 code, e.g. "hi", "kn", "ta"

    Returns
    -------
    Reply text (may be Hindi, Kannada, Tamil, etc. — matching detected_language)
    """
    # Human-readable language names for the prompt so Gemini knows what to output
    # Only English, Hindi, Kannada are supported
    language_names = {
        "en": "English",
        "hi": "Hindi",
        "kn": "Kannada",
    }
    lang_name = language_names.get(detected_language, "English")  # default to English

    prompt = f"""You are a friendly voice assistant for Kala Trail, an app that helps Indian artisans
connect with tourists and sell their traditional handicrafts.

The artisan has spoken the following message (already transcribed for you):
"{transcript}"

Their message is in {lang_name}. You MUST reply ONLY in {lang_name}.

Guidelines:
- Keep your reply short and conversational — 2 to 4 sentences maximum.
- Use simple, everyday words. The artisan may not be highly educated.
- Be warm, encouraging, and practical. Help them understand how to use the app,
  describe their craft, set prices, or connect with visitors.
- Do NOT use any markdown formatting (no asterisks, no bullet points, no headers).
- Return ONLY the reply text in {lang_name}. No English. No extra explanation."""

    return _call_gemini(prompt, timeout=15)