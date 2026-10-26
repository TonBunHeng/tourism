import re
from typing import Dict, Any, Optional, Tuple
from app.services.language_service import language_service

class ResponseValidationService:
    PROVIDER_ERROR_INDICATORS = [
        "api key not valid",
        "quota exceeded",
        "resource has been exhausted",
        "internal server error",
        "an error occurred",
        "traceback (most recent call last)",
        "connection refused",
        "failed to connect",
        "500 internal server error",
        "rate limit reached",
        "google.api_core.exceptions"
    ]

    def validate_response(
        self,
        answer: str,
        expected_language: str = "en",
        intent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validate generated AI response:
        1. Language purity check (Khmer vs English)
        2. Content sanity check (empty, error traces, provider errors)
        3. Sanitization (strip stray raw JSON wrapper, raw SVG artifacts, [object Object])
        """
        if not answer or not answer.strip():
            return {
                "is_valid": False,
                "reason": "empty_response",
                "sanitized_answer": self._get_fallback_message(expected_language)
            }

        cleaned_answer = self._clean_artifacts(answer.strip())
        lowered = cleaned_answer.lower()

        # 1. Check for provider-generated error strings leaked into text
        if any(err in lowered for err in self.PROVIDER_ERROR_INDICATORS):
            return {
                "is_valid": False,
                "reason": "provider_error_leaked",
                "sanitized_answer": self._get_fallback_message(expected_language)
            }

        # 2. Check language alignment
        is_km = "km" in expected_language or language_service.is_khmer(cleaned_answer)
        
        if expected_language == "km":
            # Must have Khmer text
            if not language_service.is_khmer(cleaned_answer):
                return {
                    "is_valid": False,
                    "reason": "language_mismatch_expected_khmer",
                    "sanitized_answer": self._get_fallback_message("km")
                }
        elif expected_language == "en":
            # If user spoke English, but response is entirely Khmer without English words
            khmer_chars = len(language_service.KHMER_UNICODE_PATTERN.findall(cleaned_answer))
            english_words = len(language_service.ENGLISH_WORD_PATTERN.findall(cleaned_answer))
            if khmer_chars > 30 and english_words < 5:
                return {
                    "is_valid": False,
                    "reason": "language_mismatch_expected_english",
                    "sanitized_answer": self._get_fallback_message("en")
                }

        return {
            "is_valid": True,
            "reason": "passed",
            "sanitized_answer": cleaned_answer
        }

    def _clean_artifacts(self, text: str) -> str:
        """Strip raw formatting artifacts such as escaped svg tags or full-json code fences."""
        s = text
        # Remove [object Object]
        s = s.replace("[object Object]", "")
        # Remove raw svg tags if any
        s = re.sub(r'<svg[\s\S]*?</svg>', '', s, flags=re.IGNORECASE)
        # If wrapped entirely in ```json ... ``` with a message or answer field, unpack it
        if s.startswith("```json") and s.endswith("```"):
            inner = s[7:-3].strip()
            import json
            try:
                parsed = json.loads(inner)
                if isinstance(parsed, dict) and ("answer" in parsed or "message" in parsed):
                    return parsed.get("answer") or parsed.get("message") or inner
            except Exception:
                pass
        return s.strip()

    def _get_fallback_message(self, language: str) -> str:
        """Return clean bilingual fallback notice."""
        if language == "km":
            return (
                "សូមអភ័យទោស! ខ្ញុំមិនអាចទាញយកព័ត៌មានជាក់លាក់សម្រាប់សំណួរនេះនៅពេលនេះបានទេ។ "
                "សូមសាកសួរអំពីប្រាសាទអង្គរវត្ត គោលដៅទេសចរណ៍ ម្ហូបអាហារ អាកាសធាតុ ឬគម្រោងដើរលេងនៅកម្ពុជា។"
            )
        else:
            return (
                "I apologize, but I could not retrieve verified information for that request right now. "
                "Feel free to ask about Angkor Wat, Cambodian destinations, food, weather, or travel itineraries."
            )

response_validation_service = ResponseValidationService()
