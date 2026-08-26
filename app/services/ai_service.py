"""
AI service - generates tourist-friendly content using Google Gemini's free-tier API.
- generate_craft_description(): rewrites a dry registry description into an engaging blurb
- generate_trip_summary(): writes a short narrative summary for a matched set of crafts on a route
"""

import os
import logging
import requests
from dotenv import load_dotenv

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