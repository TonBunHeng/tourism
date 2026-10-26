import re
from typing import List

KHMER_UNICODE_PATTERN = re.compile(r'[\u1780-\u17FF\u19E0-\u19FF]')

def is_khmer_text(text: str) -> bool:
    """Check if the text contains Khmer characters."""
    return bool(KHMER_UNICODE_PATTERN.search(text))

def clean_text(text: str) -> str:
    """Normalize text by stripping whitespace and extra linebreaks."""
    if not text:
        return ""
    return " ".join(text.split())

def extract_keywords(text: str) -> List[str]:
    """Extract lowercased search tokens from string."""
    cleaned = clean_text(text.lower())
    # Separate numbers and words
    words = re.findall(r'[\w\u1780-\u17FF\u19E0-\u19FF]+', cleaned)
    return [w for w in words if len(w) > 1]
