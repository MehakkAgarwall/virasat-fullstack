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
    # ── Tamil ───────────────────────────────────────────────────────────────
    "ta": {
        "nav_home":          "முகப்பு",
        "nav_crafts":        "கைவினைப்பொருட்கள்",
        "nav_artisans":      "கைவினைஞர்கள்",
        "nav_trip":          "பயணத் திட்டம்",
        "nav_voice":         "குரல் உதவி",
        "hero_title":        "இந்தியாவின் வாழும் பாரம்பரியத்தைக் கண்டறியவும்",
        "hero_subtitle":     "பாரம்பரிய கைவினைகளை ஆராய்ந்து அவற்றை வாழ வைக்கும் கைவினைஞர்களைச் சந்தியுங்கள்.",
        "hero_cta":          "கைவினைகளை ஆராயுங்கள்",
        "search_placeholder": "கைவினை அல்லது பகுதிகளைத் தேடுங்கள்…",
        "filter_region":     "பகுதி வாரியாக",
        "filter_category":   "பிரிவு வாரியாக",
        "filter_state":      "மாநில வாரியாக",
        "btn_search":        "தேடு",
        "btn_reset":         "மீட்டமை",
        "label_region":      "பகுதி",
        "label_category":    "பிரிவு",
        "label_state":       "மாநிலம்",
        "label_district":    "மாவட்டம்",
        "btn_learn_more":    "மேலும் அறிய",
        "artisan_title":     "கைவினைஞர்களைச் சந்தியுங்கள்",
        "artisan_subtitle":  "ஒவ்வொரு கைவினைக்குப் பின்னாலும் ஒரு வல்லுநர் இருக்கிறார்.",
        "label_craft":       "கைவினை",
        "label_experience":  "அனுபவம்",
        "label_contact":     "தொடர்பு",
        "trip_title":        "உங்கள் கைவினைப் பாதையைத் திட்டமிடுங்கள்",
        "trip_from":         "இருந்து",
        "trip_to":           "வரை",
        "trip_btn":          "பயண வழியில் கைவினைகளைக் கண்டறியவும்",
        "trip_loading":      "உங்கள் வழியில் கைவினைகளைத் தேடுகிறது…",
        "trip_no_results":   "இந்த வழியில் கைவினைகள் எதுவும் கிடைக்கவில்லை.",
        "trip_summary_label":"பயணச் சுருக்கம்",
        "voice_title":       "குரல் உதவி",
        "voice_subtitle":    "உங்கள் மொழியில் பேசுங்கள் — படிக்க வேண்டியதில்லை.",
        "voice_btn_start":   "பேச தட்டவும்",
        "voice_btn_stop":    "பதிவை நிறுத்து",
        "voice_listening":   "கேட்கிறது…",
        "voice_processing":  "செயலாக்கப்படுகிறது…",
        "voice_you_said":    "நீங்கள் கூறியது:",
        "voice_reply":       "பதில்:",
        "voice_error":       "புரிந்து கொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        "loading":           "ஏற்றப்படுகிறது…",
        "error_generic":     "ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.",
        "no_results":        "முடிவுகள் எதுவும் கிடைக்கவில்லை.",
        "back":              "பின்செல்",
        "close":             "மூடு",
        "yes":               "ஆம்",
        "no":                "இல்லை",
        "lang_label":        "மொழி",
    },

    # ── Telugu ──────────────────────────────────────────────────────────────
    "te": {
        "nav_home":          "హోమ్",
        "nav_crafts":        "హస్తకళలు",
        "nav_artisans":      "చేతివృత్తిదారులు",
        "nav_trip":          "ప్రయాణ ప్రణాళిక",
        "nav_voice":         "వాయిస్ అసిస్టెంట్",
        "hero_title":        "భారతదేశ జీవన వారసత్వాన్ని కనుగొనండి",
        "hero_subtitle":     "సాంప్రదాయ హస్తకళలను అన్వేషించండి మరియు వాటిని సజీవంగా ఉంచే కళాకారులను కలవండి.",
        "hero_cta":          "కళలను చూడండి",
        "search_placeholder": "హస్తకళలు లేదా ప్రాంతాలను వెతకండి…",
        "filter_region":     "ప్రాంతం వారిగా",
        "filter_category":   "వర్గం వారిగా",
        "filter_state":      "రాష్ట్రం వారిగా",
        "btn_search":        "వెతుకు",
        "btn_reset":         "రీసెట్",
        "label_region":      "ప్రాంతం",
        "label_category":    "వర్గం",
        "label_state":       "రాష్ట్రం",
        "label_district":    "జిల్లా",
        "btn_learn_more":    "మరింత తెలుసుకోండి",
        "artisan_title":     "కళాకారులను కలవండి",
        "artisan_subtitle":  "ప్రతి కళ వెనుక ఒక మాస్టర్ ఉంటారు.",
        "label_craft":       "కళ",
        "label_experience":  "అనుభవం",
        "label_contact":     "సంప్రదించండి",
        "trip_title":        "మీ క్రాఫ్ట్ ట్రయిల్ ప్లాన్ చేయండి",
        "trip_from":         "నుండి",
        "trip_to":           "వరకు",
        "trip_btn":          "మార్గంలో కళలను కనుగొనండి",
        "trip_loading":      "మీ మార్గంలో కళలను వెతుకుతోంది…",
        "trip_no_results":   "ఈ మార్గంలో ఏ కళలూ లభించలేదు.",
        "trip_summary_label":"ప్రయాణ సారాంశం",
        "voice_title":       "వాయిస్ అసిస్టెంట్",
        "voice_subtitle":    "మీ భాషలో మాట్లాడండి — చదవాల్సిన అవసరం లేదు.",
        "voice_btn_start":   "మాట్లాడటానికి నొక్కండి",
        "voice_btn_stop":    "రికార్డింగ్ ఆపండి",
        "voice_listening":   "వింటోంది…",
        "voice_processing":  "ప్రాసెస్ అవుతోంది…",
        "voice_you_said":    "మీరు చెప్పింది:",
        "voice_reply":       "సమాధానం:",
        "voice_error":       "అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        "loading":           "లోడ్ అవుతోంది…",
        "error_generic":     "ఏదో పొరపాటు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
        "no_results":        "ఫలితాలు ఏవీ దొరకలేదు.",
        "back":              "వెనుకకు",
        "close":             "మూసివేయి",
        "yes":               "అవును",
        "no":                "కాదు",
        "lang_label":        "భాష",
    },

    # ── Bengali ─────────────────────────────────────────────────────────────
    "bn": {
        "nav_home":          "হোম",
        "nav_crafts":        "হস্তশিল্প",
        "nav_artisans":      "শিল্পী ও কারিগর",
        "nav_trip":          "ভ্রমণ পরিকল্পনা",
        "nav_voice":         "ভয়েস অ্যাসিস্ট্যান্ট",
        "hero_title":        "ভারতের জীবন্ত ঐতিহ্য আবিষ্কার করুন",
        "hero_subtitle":     "ঐতিহ্যবাহী হস্তশিল্প অন্বেষণ করুন এবং তাদের বাঁচিয়ে রাখা কারিগরদের সাথে দেখা করুন।",
        "hero_cta":          "শিল্পকলা দেখুন",
        "search_placeholder": "শিল্প বা অঞ্চল অনুসন্ধান করুন…",
        "filter_region":     "অঞ্চল অনুযায়ী",
        "filter_category":   "বিভাগ অনুযায়ী",
        "filter_state":      "রাজ্য অনুযায়ী",
        "btn_search":        "খুঁজুন",
        "btn_reset":         "রিসেট",
        "label_region":      "অঞ্চল",
        "label_category":    "বিভাগ",
        "label_state":       "রাজ্য",
        "label_district":    "জেলা",
        "btn_learn_more":    "আরও জানুন",
        "artisan_title":     "কারিগরদের সাথে দেখা করুন",
        "artisan_subtitle":  "প্রতিটি শিল্পের পেছনে একজন মাস্টার কারিগর আছেন।",
        "label_craft":       "শিল্প",
        "label_experience":  "অভিজ্ঞতা",
        "label_contact":     "যোগাযোগ",
        "trip_title":        "আপনার ক্রাফট ট্রেইল পরিকল্পনা করুন",
        "trip_from":         "থেকে",
        "trip_to":           "পর্যন্ত",
        "trip_btn":          "পথে শিল্পকলা খুঁজুন",
        "trip_loading":      "আপনার পথে শিল্প খোঁজা হচ্ছে…",
        "trip_no_results":   "এই পথে কোন শিল্পকলা পাওয়া যায়নি।",
        "trip_summary_label":"ভ্রমণ সারসংক্ষেপ",
        "voice_title":       "ভয়েস অ্যাসিস্ট্যান্ট",
        "voice_subtitle":    "আপনার ভাষায় কথা বলুন — পড়ার প্রয়োজন নেই।",
        "voice_btn_start":   "কথা বলতে ট্যাপ করুন",
        "voice_btn_stop":    "রেকর্ডিং বন্ধ করুন",
        "voice_listening":   "শুনছি…",
        "voice_processing":  "প্রক্রিয়াকরণ হচ্ছে…",
        "voice_you_said":    "আপনি বলেছেন:",
        "voice_reply":       "উত্তর:",
        "voice_error":       "বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        "loading":           "লোড হচ্ছে…",
        "error_generic":     "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        "no_results":        "কোন ফলাফল পাওয়া যায়নি।",
        "back":              "ফিরে যান",
        "close":             "বন্ধ করুন",
        "yes":               "হ্যাঁ",
        "no":                "না",
        "lang_label":        "ভাষা",
    },

    # ── Marathi ─────────────────────────────────────────────────────────────
    "mr": {
        "nav_home":          "मुख्यपृष्ठ",
        "nav_crafts":        "हस्तकला",
        "nav_artisans":      "काहीगीर",
        "nav_trip":          "प्रवास नियोजन",
        "nav_voice":         "व्हॉइस असिस्टंट",
        "hero_title":        "भारताचा जिवंत वारसा शोधा",
        "hero_subtitle":     "पारंपारिक हस्तकला शोधा आणि त्यांना जिवंत ठेवणाऱ्या कारागिरांना भेटा.",
        "hero_cta":          "कला शोधा",
        "search_placeholder": "कला किंवा प्रदेश शोधा…",
        "filter_region":     "प्रदेशानुसार",
        "filter_category":   "वर्गानुसार",
        "filter_state":      "राज्यानुसार",
        "btn_search":        "शोधा",
        "btn_reset":         "रिसेट",
        "label_region":      "प्रदेश",
        "label_category":    "वर्ग",
        "label_state":       "राज्य",
        "label_district":    "जिल्हा",
        "btn_learn_more":    "अधिक जाणून घ्या",
        "artisan_title":     "कारागिरांना भेटा",
        "artisan_subtitle":  "प्रत्येक कलेमागे एक उस्ताद असतो.",
        "label_craft":       "कला",
        "label_experience":  "अनुभव",
        "label_contact":     "संपर्क",
        "trip_title":        "तुमचा क्राफ्ट ट्रेल प्लॅन करा",
        "trip_from":         "पासून",
        "trip_to":           "पर्यंत",
        "trip_btn":          "मार्गावर कला शोधा",
        "trip_loading":      "तुमच्या मार्गावर कला शोधत आहे…",
        "trip_no_results":   "या मार्गावर कोणतीही कला आढळली नाही.",
        "trip_summary_label":"प्रवास सारांश",
        "voice_title":       "व्हॉइस असिस्टंट",
        "voice_subtitle":    "तुमच्या भाषेत बोला — वाचण्याची गरज नाही.",
        "voice_btn_start":   "बोलण्यासाठी टॅप करा",
        "voice_btn_stop":    "रेकॉर्डिंग थांबवा",
        "voice_listening":   "ऐकत आहे…",
        "voice_processing":  "प्रक्रिया सुरू आहे…",
        "voice_you_said":    "तुम्ही म्हणालात:",
        "voice_reply":       "उत्तर:",
        "voice_error":       "समजले नाही. कृपया पुन्हा प्रयत्न करा.",
        "loading":           "लोड होत आहे…",
        "error_generic":     "काहीतरी चुकीचे घडले. कृपया पुन्हा प्रयत्न करा.",
        "no_results":        "कोणतेही निकाल आढळले नाहीत.",
        "back":              "मागे",
        "close":             "बंद करा",
        "yes":               "होय",
        "no":                "नाही",
        "lang_label":        "भाषा",
    },
}

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "हिंदी",
    "kn": "ಕನ್ನಡ",
    "ta": "தமிழ்",
    "te": "తెలుగు",
    "bn": "বাংলা",
    "mr": "मराठी",
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
