"""
voice_service.py
Handles two sides of the voice assistant pipeline:
  1. Speech-to-Text  : audio bytes  → transcript text  (via faster-whisper)
  2. Text-to-Speech  : reply text   → MP3 bytes        (via gTTS)

Language support is automatic — Whisper auto-detects the spoken language, and gTTS
will synthesise speech in whichever language Gemini responds in (we ask Gemini to
match the artisan's language in the prompt).
"""

import io
import logging
import tempfile
import os

logger = logging.getLogger("kalatrail")

# ---------------------------------------------------------------------------
# Speech-to-Text  (faster-whisper, runs locally on CPU)
# ---------------------------------------------------------------------------
_whisper_model = None  # lazy-loaded so startup stays fast


def _get_whisper_model():
    """Load the Whisper model once and reuse it across requests."""
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel  # type: ignore
            # "small" is a good balance of accuracy vs. RAM (~500 MB).
            # Drop to "tiny" (~150 MB) if Railway OOMs.
            _whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
            logger.info("Whisper 'small' model loaded.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    return _whisper_model


def transcribe_audio(audio_bytes: bytes, file_extension: str = "webm") -> dict:
    """
    Transcribe raw audio bytes to text using Whisper.

    Parameters
    ----------
    audio_bytes    : raw audio data (webm / mp4 / wav / ogg all work)
    file_extension : hint for the temp file suffix so ffmpeg picks the right demuxer

    Returns
    -------
    {"text": str, "language": str}
    """
    model = _get_whisper_model()

    # Write to a named temp file because faster-whisper needs a path, not a stream
    suffix = f".{file_extension.lstrip('.')}"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(tmp_path, beam_size=5)
        transcript = " ".join(seg.text.strip() for seg in segments).strip()
        detected_language = info.language  # e.g. "hi", "kn", "ta", "en"
        logger.info(f"Transcribed ({detected_language}): {transcript[:80]}")
        return {"text": transcript, "language": detected_language}
    finally:
        os.unlink(tmp_path)


# ---------------------------------------------------------------------------
# Text-to-Speech  (gTTS — uses Google Translate TTS, free, no key needed)
# ---------------------------------------------------------------------------

def synthesise_speech(text: str, language: str = "hi") -> bytes:
    """
    Convert reply text to MP3 audio bytes using gTTS.

    Parameters
    ----------
    text     : the text to speak
    language : BCP-47 language tag, e.g. "hi", "kn", "ta", "en"

    Returns
    -------
    Raw MP3 bytes
    """
    try:
        from gtts import gTTS  # type: ignore
    except ImportError:
        raise RuntimeError("gTTS is not installed. Add 'gTTS' to requirements.txt.")

    lang_map = {
        "en": "en",   # English
        "hi": "hi",   # Hindi
        "kn": "kn",   # Kannada
        "ta": "ta",   # Tamil
        "te": "te",   # Telugu
        "bn": "bn",   # Bengali
        "mr": "mr",   # Marathi
    }
    gtts_lang = lang_map.get(language, "en")  # default to English if anything else detected

    tts = gTTS(text=text, lang=gtts_lang, slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf.read()
