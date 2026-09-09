"""
Groq-based AI service, used specifically for BULK craft description enrichment
(your live trip-summary feature stays on Gemini in ai_service.py - this is separate).

Why Groq for bulk enrichment: its free tier allows 14,400 requests/day vs Gemini's
very restrictive free-tier daily cap, which matters when enriching 200-300+ crafts.

Get a free API key (no credit card) at https://console.groq.com/keys
"""

import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("kalatrail")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"  # generous free tier: 14,400 requests/day


def _call_groq(prompt: str, temperature: float = 0.5) -> str:
    """Sends a single-turn prompt to Groq (OpenAI-compatible chat completions API)."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in .env")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }

    response = requests.post(GROQ_API_URL, json=body, headers=headers, timeout=30)
    if not response.ok:
        logger.error(f"Groq API error {response.status_code}: {response.text}")
    response.raise_for_status()
    data = response.json()

    return data["choices"][0]["message"]["content"].strip()


def generate_craft_description_groq(name: str, category: str, state: str, district: str, raw_description: str) -> str:
    """
    Same purpose as generate_craft_description() in ai_service.py, but via Groq.
    Used only by the bulk enrichment script, not by live user-facing requests.
    """
    prompt = f"""You are writing a short, engaging blurb for a tourism app about a traditional Indian handicraft.

Craft name: {name}
Category: {category}
Region: {district}, {state}
Factual description: {raw_description}

Write a warm, engaging 2-3 sentence description for a tourist discovering this craft for the first time.
Make it feel inviting and highlight what makes it special.
Do not invent facts, statistics, dates, or claims not implied by the description above.
Do not use markdown formatting. Return ONLY the description text, nothing else."""

    return _call_groq(prompt, temperature=0.5)