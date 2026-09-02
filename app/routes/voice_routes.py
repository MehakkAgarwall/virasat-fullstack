"""
voice_routes.py
Exposes a single POST /voice/chat endpoint.

Flow:
  1. Frontend sends a multipart audio file (webm/mp4/wav/ogg from MediaRecorder).
  2. Backend transcribes it with Whisper (auto-detects language).
  3. Gemini generates a reply in the SAME language.
  4. gTTS converts that reply to MP3.
  5. We return a JSON payload containing:
       - transcript   : what the artisan said (text)
       - reply_text   : Gemini's response (text)
       - language     : detected BCP-47 language code
       - audio_base64 : base64-encoded MP3 of the spoken reply
     The frontend can play the audio straight from the base64 string —
     no reading required on the artisan's end.
"""

import base64
import logging

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from app.services.voice_service import transcribe_audio, synthesise_speech
from app.services.ai_service import generate_assistant_reply

router = APIRouter(prefix="/voice", tags=["voice"])
logger = logging.getLogger("kalatrail")


@router.post("/chat")
async def voice_chat(audio: UploadFile = File(...)):
    """
    Accepts an audio file recorded in the browser (webm/mp4/wav/ogg).
    Returns JSON with transcript, Gemini reply text, detected language,
    and a base64-encoded MP3 of the spoken reply.

    Example frontend usage:
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        const res = await fetch("/voice/chat", { method: "POST", body: form });
        const data = await res.json();
        // Play audio:
        const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
        audio.play();
    """
    # ── 1. Read uploaded bytes ──────────────────────────────────────────────
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

    # Guess extension from content-type or filename for the temp file suffix
    content_type = audio.content_type or ""
    if "webm" in content_type or (audio.filename or "").endswith(".webm"):
        ext = "webm"
    elif "mp4" in content_type or (audio.filename or "").endswith(".mp4"):
        ext = "mp4"
    elif "ogg" in content_type or (audio.filename or "").endswith(".ogg"):
        ext = "ogg"
    elif "wav" in content_type or (audio.filename or "").endswith(".wav"):
        ext = "wav"
    else:
        ext = "webm"  # MediaRecorder default in Chrome/Firefox

    # ── 2. Speech-to-Text ───────────────────────────────────────────────────
    try:
        stt_result = transcribe_audio(audio_bytes, file_extension=ext)
        transcript = stt_result["text"]
        language = stt_result["language"]
    except Exception as e:
        logger.exception("STT failed")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    if not transcript:
        raise HTTPException(
            status_code=422,
            detail="Could not understand the audio. Please speak clearly and try again."
        )

    # ── 3. Generate Gemini reply ─────────────────────────────────────────────
    try:
        reply_text = generate_assistant_reply(transcript, language)
    except Exception as e:
        logger.exception("Gemini reply generation failed")
        raise HTTPException(status_code=500, detail=f"AI reply failed: {str(e)}")

    # ── 4. Text-to-Speech ───────────────────────────────────────────────────
    try:
        mp3_bytes = synthesise_speech(reply_text, language=language)
        audio_b64 = base64.b64encode(mp3_bytes).decode("utf-8")
    except Exception as e:
        logger.exception("TTS failed")
        # Still return text even if audio synthesis breaks — degraded but not dead
        audio_b64 = ""
        logger.warning("TTS failed, returning text-only response.")

    # ── 5. Return everything as JSON ─────────────────────────────────────────
    return JSONResponse(content={
        "transcript": transcript,
        "reply_text": reply_text,
        "language": language,
        "audio_base64": audio_b64,          # play with: new Audio("data:audio/mp3;base64," + audio_base64)
        "audio_mime": "audio/mp3",
    })
