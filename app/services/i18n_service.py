"""
i18n_service.py
Static UI string translations for English, Hindi, and Kannada.

The frontend calls GET /i18n/{lang} and gets back a flat JSON dict of keys → strings.
It swaps ALL UI text based on whatever the user picks from the language toggle.

Supported lang codes: "en", "hi", "kn"
"""

TRANSLATIONS: dict = {

    # ── English ─────────────────────────────────────────────────────────────
    "en": {
        # Nav
        "nav_home":          "Home",
        "nav_crafts":        "Crafts",
        "nav_artisans":      "Artisans",
        "nav_trip":          "Plan My Trip",
        "nav_voice":         "Voice Assistant",

        # Hero / landing
        "hero_title":        "Discover India's Living Heritage",
        "hero_subtitle":     "Explore traditional handicrafts and meet the artisans who keep them alive.",
        "hero_cta":          "Explore Crafts",

        # Search & filters
        "search_placeholder": "Search crafts or regions…",
        "filter_region":     "Filter by Region",
        "filter_category":   "Filter by Category",
        "filter_state":      "Filter by State",
        "btn_search":        "Search",
        "btn_reset":         "Reset",

        # Craft card
        "label_region":      "Region",
        "label_category":    "Category",
        "label_state":       "State",
        "label_district":    "District",
        "btn_learn_more":    "Learn More",

        # Artisan section
        "artisan_title":     "Meet the Artisans",
        "artisan_subtitle":  "Every craft has a master behind it.",
        "label_craft":       "Craft",
        "label_experience":  "Experience",
        "label_contact":     "Contact",

        # Trip planner
        "trip_title":        "Plan Your Craft Trail",
        "trip_from":         "From",
        "trip_to":           "To",
        "trip_btn":          "Find Crafts Along Route",
        "trip_loading":      "Finding crafts on your route…",
        "trip_no_results":   "No crafts found along this route.",
        "trip_summary_label":"Trip Summary",

        # Voice assistant
        "voice_title":       "Voice Assistant",
        "voice_subtitle":    "Speak in your language — no reading needed.",
        "voice_btn_start":   "Tap to Speak",
        "voice_btn_stop":    "Stop Recording",
        "voice_listening":   "Listening…",
        "voice_processing":  "Processing…",
        "voice_you_said":    "You said:",
        "voice_reply":       "Reply:",
        "voice_error":       "Could not understand. Please try again.",

        # General
        "loading":           "Loading…",
        "error_generic":     "Something went wrong. Please try again.",
        "no_results":        "No results found.",
        "back":              "Back",
        "close":             "Close",
        "yes":               "Yes",
        "no":                "No",
        "lang_label":        "Language",
    },

    # ── Hindi ────────────────────────────────────────────────────────────────
    "hi": {
        # Nav
        "nav_home":          "होम",
        "nav_crafts":        "शिल्पकलाएँ",
        "nav_artisans":      "कारीगर",
        "nav_trip":          "यात्रा योजना",
        "nav_voice":         "वॉइस असिस्टेंट",

        # Hero / landing
        "hero_title":        "भारत की जीवित विरासत खोजें",
        "hero_subtitle":     "पारंपरिक हस्तशिल्प और उन्हें जीवित रखने वाले कारीगरों से मिलें।",
        "hero_cta":          "शिल्पकलाएँ देखें",

        # Search & filters
        "search_placeholder": "शिल्प या क्षेत्र खोजें…",
        "filter_region":     "क्षेत्र के अनुसार",
        "filter_category":   "श्रेणी के अनुसार",
        "filter_state":      "राज्य के अनुसार",
        "btn_search":        "खोजें",
        "btn_reset":         "रीसेट करें",

        # Craft card
        "label_region":      "क्षेत्र",
        "label_category":    "श्रेणी",
        "label_state":       "राज्य",
        "label_district":    "जिला",
        "btn_learn_more":    "अधिक जानें",

        # Artisan section
        "artisan_title":     "कारीगरों से मिलें",
        "artisan_subtitle":  "हर शिल्प के पीछे एक उस्ताद होता है।",
        "label_craft":       "शिल्प",
        "label_experience":  "अनुभव",
        "label_contact":     "संपर्क",

        # Trip planner
        "trip_title":        "अपना शिल्प मार्ग बनाएँ",
        "trip_from":         "से",
        "trip_to":           "तक",
        "trip_btn":          "रास्ते में शिल्प खोजें",
        "trip_loading":      "आपके रास्ते पर शिल्प ढूँढ रहे हैं…",
        "trip_no_results":   "इस रास्ते पर कोई शिल्प नहीं मिला।",
        "trip_summary_label":"यात्रा सारांश",

        # Voice assistant
        "voice_title":       "वॉइस असिस्टेंट",
        "voice_subtitle":    "अपनी भाषा में बोलें — पढ़ने की जरूरत नहीं।",
        "voice_btn_start":   "बोलने के लिए दबाएँ",
        "voice_btn_stop":    "रिकॉर्डिंग बंद करें",
        "voice_listening":   "सुन रहे हैं…",
        "voice_processing":  "प्रोसेस हो रहा है…",
        "voice_you_said":    "आपने कहा:",
        "voice_reply":       "जवाब:",
        "voice_error":       "समझ नहीं आया। कृपया फिर कोशिश करें।",

        # General
        "loading":           "लोड हो रहा है…",
        "error_generic":     "कुछ गलत हो गया। कृपया फिर कोशिश करें।",
        "no_results":        "कोई परिणाम नहीं मिला।",
        "back":              "वापस",
        "close":             "बंद करें",
        "yes":               "हाँ",
        "no":                "नहीं",
        "lang_label":        "भाषा",
    },

    # ── Kannada ─────────────────────────────────────────────────────────────
    "kn": {
        # Nav
        "nav_home":          "ಮುಖಪುಟ",
        "nav_crafts":        "ಕರಕುಶಲತೆ",
        "nav_artisans":      "ಕುಶಲಕರ್ಮಿಗಳು",
        "nav_trip":          "ಪ್ರವಾಸ ಯೋಜನೆ",
        "nav_voice":         "ಧ್ವನಿ ಸಹಾಯಕ",

        # Hero / landing
        "hero_title":        "ಭಾರತದ ಜೀವಂತ ಪರಂಪರೆಯನ್ನು ಅನ್ವೇಷಿಸಿ",
        "hero_subtitle":     "ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲ ವಸ್ತುಗಳನ್ನು ಮತ್ತು ಅವುಗಳನ್ನು ಜೀವಂತವಾಗಿರಿಸುವ ಕುಶಲಕರ್ಮಿಗಳನ್ನು ಭೇಟಿ ಮಾಡಿ.",
        "hero_cta":          "ಕರಕುಶಲತೆ ನೋಡಿ",

        # Search & filters
        "search_placeholder": "ಕರಕುಶಲ ಅಥವಾ ಪ್ರದೇಶ ಹುಡುಕಿ…",
        "filter_region":     "ಪ್ರದೇಶದ ಪ್ರಕಾರ",
        "filter_category":   "ವರ್ಗದ ಪ್ರಕಾರ",
        "filter_state":      "ರಾಜ್ಯದ ಪ್ರಕಾರ",
        "btn_search":        "ಹುಡುಕಿ",
        "btn_reset":         "ಮರುಹೊಂದಿಸಿ",

        # Craft card
        "label_region":      "ಪ್ರದೇಶ",
        "label_category":    "ವರ್ಗ",
        "label_state":       "ರಾಜ್ಯ",
        "label_district":    "ಜಿಲ್ಲೆ",
        "btn_learn_more":    "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",

        # Artisan section
        "artisan_title":     "ಕುಶಲಕರ್ಮಿಗಳನ್ನು ಭೇಟಿ ಮಾಡಿ",
        "artisan_subtitle":  "ಪ್ರತಿಯೊಂದು ಕರಕುಶಲದ ಹಿಂದೆ ಒಬ್ಬ ಉಸ್ತಾದ್ ಇದ್ದಾರೆ.",
        "label_craft":       "ಕರಕುಶಲ",
        "label_experience":  "ಅನುಭವ",
        "label_contact":     "ಸಂಪರ್ಕ",

        # Trip planner
        "trip_title":        "ನಿಮ್ಮ ಕರಕುಶಲ ಮಾರ್ಗ ರೂಪಿಸಿ",
        "trip_from":         "ಇಂದ",
        "trip_to":           "ವರೆಗೆ",
        "trip_btn":          "ಮಾರ್ಗದಲ್ಲಿ ಕರಕುಶಲ ಹುಡುಕಿ",
        "trip_loading":      "ನಿಮ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಕರಕುಶಲ ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
        "trip_no_results":   "ಈ ಮಾರ್ಗದಲ್ಲಿ ಯಾವುದೇ ಕರಕುಶಲ ಕಂಡುಬಂದಿಲ್ಲ.",
        "trip_summary_label":"ಪ್ರಯಾಣ ಸಾರಾಂಶ",

        # Voice assistant
        "voice_title":       "ಧ್ವನಿ ಸಹಾಯಕ",
        "voice_subtitle":    "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತಾಡಿ — ಓದುವ ಅಗತ್ಯವಿಲ್ಲ.",
        "voice_btn_start":   "ಮಾತಾಡಲು ಒತ್ತಿ",
        "voice_btn_stop":    "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
        "voice_listening":   "ಕೇಳುತ್ತಿದ್ದೇನೆ…",
        "voice_processing":  "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ…",
        "voice_you_said":    "ನೀವು ಹೇಳಿದ್ದು:",
        "voice_reply":       "ಉತ್ತರ:",
        "voice_error":       "ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",

        # General
        "loading":           "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
        "error_generic":     "ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        "no_results":        "ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ.",
        "back":              "ಹಿಂದೆ",
        "close":             "ಮುಚ್ಚಿ",
        "yes":               "ಹೌದು",
        "no":                "ಇಲ್ಲ",
        "lang_label":        "ಭಾಷೆ",
    },
}

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "हिंदी",
    "kn": "ಕನ್ನಡ",
}


def get_translations(lang: str) -> dict:
    """
    Returns the full translation dict for the requested language.
    Falls back to English if the lang code is not supported.
    """
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"])


def get_supported_languages() -> dict:
    """Returns {code: native_name} for every supported language."""
    return SUPPORTED_LANGUAGES
