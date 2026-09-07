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
import uuid
from typing import Optional, List
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.voice_service import transcribe_audio, synthesise_speech
from app.services.ai_service import generate_assistant_reply

router = APIRouter(prefix="/voice", tags=["voice"])
logger = logging.getLogger("kalatrail")

# Simple in-memory session store mapping session_id -> list of turn dicts
_voice_sessions: dict = {}


class TextChatRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    generate_audio: Optional[bool] = True


def _get_or_create_session_id(session_id: Optional[str]) -> str:
    if not session_id or session_id.strip() == "":
        return str(uuid.uuid4())
    return session_id.strip()


def _append_to_session(session_id: str, user_text: str, assistant_text: str):
    if session_id not in _voice_sessions:
        _voice_sessions[session_id] = []
    _voice_sessions[session_id].append({"role": "user", "text": user_text})
    _voice_sessions[session_id].append({"role": "assistant", "text": assistant_text})
    # Keep last 10 turns max
    if len(_voice_sessions[session_id]) > 20:
        _voice_sessions[session_id] = _voice_sessions[session_id][-20:]


@router.post("/chat")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
):
    """
    Accepts an audio file recorded in the browser (webm/mp4/wav/ogg) and optional session_id for multi-turn history.
    Returns JSON with session_id, transcript, Gemini reply text, detected language, and base64 MP3.
    """
    session_id = _get_or_create_session_id(session_id)
    history = _voice_sessions.get(session_id, [])

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

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
        ext = "webm"

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

    try:
        reply_text = generate_assistant_reply(transcript, language, history=history)
        _append_to_session(session_id, transcript, reply_text)
    except Exception as e:
        logger.exception("Gemini reply generation failed")
        raise HTTPException(status_code=500, detail=f"AI reply failed: {str(e)}")

    try:
        mp3_bytes = synthesise_speech(reply_text, language=language)
        audio_b64 = base64.b64encode(mp3_bytes).decode("utf-8")
    except Exception as e:
        logger.exception("TTS failed")
        audio_b64 = ""

    return JSONResponse(content={
        "session_id": session_id,
        "transcript": transcript,
        "reply_text": reply_text,
        "language": language,
        "audio_base64": audio_b64,
        "audio_mime": "audio/mp3",
    })


@router.post("/chat/text")
def text_chat(req: TextChatRequest):
    """
    Text-based fallback endpoint for users/judges without a microphone.
    Supports multi-turn context via session_id and optional TTS audio generation.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text query cannot be empty.")

    session_id = _get_or_create_session_id(req.session_id)
    history = _voice_sessions.get(session_id, [])
    language = req.language or "en"

    try:
        reply_text = generate_assistant_reply(req.text, language, history=history)
        _append_to_session(session_id, req.text, reply_text)
    except Exception as e:
        logger.exception("Gemini reply generation failed")
        raise HTTPException(status_code=500, detail=f"AI reply failed: {str(e)}")

    audio_b64 = ""
    if req.generate_audio:
        try:
            mp3_bytes = synthesise_speech(reply_text, language=language)
            audio_b64 = base64.b64encode(mp3_bytes).decode("utf-8")
        except Exception as e:
            logger.warning(f"TTS generation failed for text chat (non-fatal): {e}")

    return JSONResponse(content={
        "session_id": session_id,
        "query": req.text,
        "reply_text": reply_text,
        "language": language,
        "audio_base64": audio_b64,
        "audio_mime": "audio/mp3",
    })

