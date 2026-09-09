"""
Automated unit tests for Kala Trail backend.
Can be executed with:
    python -m unittest discover -s tests -p "test_*.py"
or:
    pytest
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Add python-backend root to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
import app.services.ai_service as ai_service
import app.services.db_service as db_service


class TestAppIntegrity(unittest.TestCase):
    """Verifies that the FastAPI app initializes, routes are mounted, and health endpoints respond."""

    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("service"), "kalatrail-backend")

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("docs", data)
        self.assertIn("endpoints", data)

    def test_cors_configured(self):
        response = self.client.options("/health", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        })
        self.assertIn("access-control-allow-origin", response.headers)


class TestAIService(unittest.TestCase):
    """Tests the resolved AI service functionality and fallback mechanisms."""

    def test_indian_languages_map(self):
        expected_langs = [
            "en", "hi", "kn", "ta", "te", "ml", "mr",
            "bn", "gu", "pa", "ur", "as", "or", "ne"
        ]
        for lang in expected_langs:
            self.assertIn(lang, ai_service.INDIAN_LANGUAGES, f"Missing language code: {lang}")

    def test_language_normalization(self):
        test_cases = [
            ("hi-IN", "Hindi"),
            ("kn-IN", "Kannada"),
            ("TA-LK", "Tamil"),
            ("te", "Telugu"),
            ("ml", "Malayalam"),
            ("mr", "Marathi"),
            ("bn-BD", "Bengali"),
            ("gu", "Gujarati"),
            ("pa", "Punjabi"),
            ("ur-PK", "Urdu"),
            ("as", "Assamese"),
            ("or", "Odia"),
            ("ne-NP", "Nepali"),
            ("fr-FR", "English"),  # Unsupported should fall back to English
            ("", "English"),
            (None, "English"),
        ]
        for input_code, expected_name in test_cases:
            norm = (input_code or "en").lower().split("-")[0].strip()
            resolved = ai_service.INDIAN_LANGUAGES.get(norm, "English")
            self.assertEqual(resolved, expected_name, f"Failed normalization for {input_code}")

    def test_unconfigured_ai_raises_value_error(self):
        """When neither Gemini nor OpenAI fallback is configured, _call_gemini must raise ValueError."""
        with patch.object(ai_service, "GEMINI_API_KEY", None), \
             patch.object(ai_service, "OPENAI_API_KEY", None), \
             patch.object(ai_service, "OPENAI_API_BASE", ""):
            with self.assertRaises(ValueError) as ctx:
                ai_service._call_gemini("Test prompt")
            self.assertIn("Neither GEMINI_API_KEY nor OpenAI-compatible fallback", str(ctx.exception))

    def test_openai_fallback_when_gemini_missing(self):
        """When GEMINI_API_KEY is missing but OPENAI_API_KEY & OPENAI_API_BASE are set, calls OpenAI."""
        with patch.object(ai_service, "GEMINI_API_KEY", None), \
             patch.object(ai_service, "OPENAI_API_KEY", "test-key"), \
             patch.object(ai_service, "OPENAI_API_BASE", "https://api.openai.com/v1"), \
             patch.object(ai_service, "OPENAI_MODEL", "gpt-5-mini"), \
             patch("requests.post") as mock_post:

            mock_response = MagicMock()
            mock_response.ok = True
            mock_response.json.return_value = {
                "choices": [{"message": {"content": "Hello from OpenAI fallback"}}]
            }
            mock_post.return_value = mock_response

            result = ai_service._call_gemini("Test prompt")
            self.assertEqual(result, "Hello from OpenAI fallback")
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            self.assertEqual(call_args[0][0], "https://api.openai.com/v1/chat/completions")
            self.assertEqual(call_args[1]["json"]["model"], "gpt-5-mini")

    def test_generate_artisan_story_call(self):
        """generate_artisan_story builds the prompt correctly and calls _call_gemini."""
        with patch.object(ai_service, "_call_gemini") as mock_call:
            mock_call.return_value = "Artisan narrative story"
            story = ai_service.generate_artisan_story(
                name="Ramesh",
                craft_name="Blue Pottery",
                bio="Master potter",
                experience_info="30 years of experience",
                years_of_practice=30,
                lang="hi-IN"
            )
            self.assertEqual(story, "Artisan narrative story")
            mock_call.assert_called_once()
            called_prompt = mock_call.call_args[0][0]
            self.assertIn("Ramesh", called_prompt)
            self.assertIn("Blue Pottery", called_prompt)
            self.assertIn("Hindi", called_prompt)

    def test_generate_assistant_reply_call(self):
        """generate_assistant_reply formats multi-turn context and handles language properly."""
        with patch.object(ai_service, "_call_gemini") as mock_call:
            mock_call.return_value = "Namaste, how can I help?"
            reply = ai_service.generate_assistant_reply(
                transcript="Namaste",
                detected_language="hi",
                history=[{"role": "user", "text": "Hello"}, {"role": "assistant", "text": "Hi"}]
            )
            self.assertEqual(reply, "Namaste, how can I help?")
            mock_call.assert_called_once()
            called_prompt = mock_call.call_args[0][0]
            self.assertIn("Namaste", called_prompt)
            self.assertIn("Hindi", called_prompt)
            self.assertIn("Prior conversation context", called_prompt)


class TestZeroConflictMarkers(unittest.TestCase):
    """Ensures that no unresolved Git conflict markers exist anywhere in the source code."""

    def test_no_git_conflict_markers(self):
        markers = ["<<<<<<<", ">>>>>>>"]
        source_exts = {".py", ".sql", ".txt", ".md", ".json", ".yml", ".yaml"}
        failed = []

        for root, dirs, files in os.walk(backend_dir):
            if any(d in root for d in [".git", "__pycache__", ".pytest_cache"]):
                continue
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in source_exts or f in {"Dockerfile", "Procfile"}:
                    path = os.path.join(root, f)
                    try:
                        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                            for lineno, line in enumerate(fh, 1):
                                for marker in markers:
                                    if line.startswith(marker):
                                        failed.append(f"{path}:{lineno} {line.strip()}")
                                if line.startswith("=======") and len(line.strip()) == 7:
                                    failed.append(f"{path}:{lineno} {line.strip()}")
                    except Exception as e:
                        pass

        self.assertEqual(len(failed), 0, f"Found unresolved conflict markers:\n" + "\n".join(failed))


if __name__ == "__main__":
    unittest.main()
