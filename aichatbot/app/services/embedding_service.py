import os
import json
import re
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from app.core.config import settings

ENGLISH_STOP_WORDS = {
    "what", "is", "it", "the", "a", "an", "to", "in", "for", "of", "and", "or",
    "you", "your", "me", "my", "we", "can", "how", "do", "does", "did", "tell",
    "about", "there", "this", "that", "i", "am", "are", "was", "were", "be", "been",
    "have", "has", "had", "which", "where", "when", "why", "who", "whom", "will", "would",
    "should", "could", "please", "just", "now", "any", "some"
}

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.model_name = "all-MiniLM-L6-v2"
        self._cache: Dict[str, np.ndarray] = {}
        self._init_model()

    def _init_model(self):
        """Try loading sentence-transformers all-MiniLM-L6-v2 model if installed."""
        try:
            # pyrefly: ignore [missing-import]
            from sentence_transformers import SentenceTransformer
            print(f"Loading sentence-transformer model: {self.model_name}...")
            self.model = SentenceTransformer(self.model_name)
            print(f"✅ sentence-transformers ({self.model_name}) loaded successfully.")
        except Exception as e:
            self.model = None
            print(f"EmbeddingService: sentence-transformers not available or memory-constrained ({e}). Using optimized semantic vector encoder.")

    def encode(self, text: str) -> np.ndarray:
        """Encode text into normalized float32 vector with in-memory caching."""
        if not text:
            return np.zeros(512, dtype=np.float32)
            
        cache_key = text.strip()[:200]
        if cache_key in self._cache:
            return self._cache[cache_key]

        if self.model is not None:
            try:
                vec = self.model.encode(text, convert_to_numpy=True)
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec = vec / norm
                self._cache[cache_key] = vec
                return vec
            except Exception as e:
                print(f"Embedding model encode error: {e}")

        # Semantic token & character n-gram pseudo-embedding fallback
        vec = self._fallback_encode(text)
        self._cache[cache_key] = vec
        return vec

    def _fallback_encode(self, text: str, dim: int = 512) -> np.ndarray:
        """
        Deterministic, robust multi-token and n-gram hash vectorizer with stop-word filtering.
        Extracts content word tokens and character 3-grams for high semantic discrimination.
        """
        vec = np.zeros(dim, dtype=np.float32)
        clean_text = re.sub(r'[^\w\s\u1780-\u17FF]', ' ', text.lower()).strip()
        words = clean_text.split()
        
        # Filter stop words unless the entire text consists only of stop words
        content_words = [w for w in words if w not in ENGLISH_STOP_WORDS and len(w) > 1]
        words_to_use = content_words if content_words else words

        # 1. Word token hashes with higher weight for content words
        import hashlib
        for w in words_to_use:
            h = int(hashlib.md5(f"word_{w}".encode("utf-8")).hexdigest()[:8], 16) % dim
            vec[h] += 3.0

        # 2. Character n-grams (3-grams) for robust morphological and fuzzy matching
        for w in words_to_use:
            if len(w) >= 3:
                for i in range(len(w) - 2):
                    gram = w[i:i+3]
                    h = int(hashlib.md5(f"gram_{gram}".encode("utf-8")).hexdigest()[:8], 16) % dim
                    vec[h] += 1.0
            
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def compute_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity between two normalized vectors."""
        if vec1 is None or vec2 is None or len(vec1) == 0 or len(vec2) == 0:
            return 0.0
        dot = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.clip(dot / (norm1 * norm2), 0.0, 1.0))

embedding_service = EmbeddingService()
