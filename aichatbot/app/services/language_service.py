import re
from typing import Dict, Any, Optional

class LanguageService:
    KHMER_UNICODE_PATTERN = re.compile(r'[\u1780-\u17FF\u19E0-\u19FF]')
    ENGLISH_WORD_PATTERN = re.compile(r'[a-zA-Z]{2,}')

    def detect_language(self, text: str) -> str:
        """
        Strict language detection for Khmer vs English:
        - If text contains Khmer Unicode characters -> returns 'km'
        - Otherwise defaults to 'en'
        """
        if not text:
            return "en"
        
        # Count Khmer characters
        khmer_chars = len(self.KHMER_UNICODE_PATTERN.findall(text))
        english_words = len(self.ENGLISH_WORD_PATTERN.findall(text))
        
        if khmer_chars > 0:
            return "km"
        if english_words > 0:
            return "en"
        return "en"

    def is_khmer(self, text: str) -> bool:
        """Check if string has any Khmer characters."""
        if not text:
            return False
        return bool(self.KHMER_UNICODE_PATTERN.search(text))

    def normalize_language_code(self, lang_str: Optional[str]) -> str:
        """Normalize language parameter to 'km' or 'en'."""
        if not lang_str:
            return "en"
        lowered = str(lang_str).lower().strip()
        if "km" in lowered or "khmer" in lowered or "ខ្មែរ" in lowered:
            return "km"
        return "en"

    def get_system_language_mandate(self, lang: str) -> str:
        """Generate strict language instructions for AI prompt."""
        if lang == "km":
            return (
                "[MANDATORY LANGUAGE INSTRUCTION]:\n"
                "The user is asking in Khmer (ភាសាខ្មែរ).\n"
                "You MUST write your entire response 100% in natural, fluent Khmer (ភាសាខ្មែរ).\n"
                "Do NOT write in English or mix English sentences, except for standard proper names or currency acronyms (USD)."
            )
        else:
            return (
                "[MANDATORY LANGUAGE INSTRUCTION]:\n"
                "The user is asking in English.\n"
                "You MUST write your entire response 100% in clear, friendly, and professional English.\n"
                "Do NOT include random Khmer text unless explicitly explaining a Khmer word."
            )

    def validate_language_alignment(self, expected_lang: str, text: str) -> bool:
        """
        Validate whether generated response text matches expected language.
        Returns True if aligned, False if mixed/violating.
        """
        if not text:
            return True
        detected = self.detect_language(text)
        if expected_lang == "km":
            # Must have Khmer text
            return self.is_khmer(text)
        elif expected_lang == "en":
            # Should have primarily Latin text
            khmer_count = len(self.KHMER_UNICODE_PATTERN.findall(text))
            return khmer_count < 10
        return True

language_service = LanguageService()
