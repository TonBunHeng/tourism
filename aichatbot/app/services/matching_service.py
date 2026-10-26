import re
import difflib
import threading
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings
from app.services.tourism_service import tourism_service
from app.services.embedding_service import embedding_service
from app.services.language_service import language_service

class SimilarityMatchingService:
    def __init__(self):
        self._item_embeddings: List[Tuple[Dict[str, Any], Any, str]] = []
        self._is_indexed = False
        self._lock = threading.Lock()

    def index_datasets(self, force: bool = False):
        """Index all JSON items from tourism_service for semantic and fuzzy similarity matching."""
        with self._lock:
            if self._is_indexed and not force:
                return

            all_items = tourism_service.get_all_items()
            new_embeddings = []

            for item in all_items:
                text_profile = self._build_item_profile_text(item)
                vec = embedding_service.encode(text_profile)
                new_embeddings.append((item, vec, text_profile))

            self._item_embeddings = new_embeddings
            self._is_indexed = True

    def add_item_to_index(self, item: Dict[str, Any]) -> None:
        """Dynamically encode and append a single item into the active similarity embeddings."""
        with self._lock:
            if not self._is_indexed:
                self.index_datasets()
                return

            item_id = str(item.get("id") or "")
            self._item_embeddings = [
                e for e in self._item_embeddings if str(e[0].get("id") or "") != item_id
            ]

            text_profile = self._build_item_profile_text(item)
            vec = embedding_service.encode(text_profile)
            self._item_embeddings.append((item, vec, text_profile))

    def _build_item_profile_text(self, item: Dict[str, Any]) -> str:
        """Create rich searchable text for semantic embedding."""
        parts = []
        if item.get("name"):
            parts.append(str(item["name"]))
        if item.get("name_km"):
            parts.append(str(item["name_km"]))
        if item.get("category"):
            parts.append(f"Category: {item['category']}")
        if item.get("topic"):
            parts.append(f"Topic: {item['topic']}")
        if item.get("province"):
            parts.append(f"Province: {item['province']}")
        if item.get("province_km"):
            parts.append(f"Province: {item['province_km']}")
        if item.get("description"):
            parts.append(str(item["description"]))
        if item.get("description_km"):
            parts.append(str(item["description_km"]))
        if item.get("official_portal"):
            parts.append(f"Portal: {item['official_portal']}")
        if item.get("tags") and isinstance(item["tags"], list):
            parts.append("Tags: " + ", ".join(item["tags"]))
        if item.get("travel_tips") and isinstance(item["travel_tips"], list):
            parts.append("Tips: " + ", ".join(item["travel_tips"]))
        if item.get("specialties") and isinstance(item["specialties"], list):
            parts.append("Specialties: " + ", ".join(item["specialties"]))
        if item.get("required_documents") and isinstance(item["required_documents"], list):
            parts.append("Requirements: " + ", ".join(item["required_documents"]))

        return " | ".join(parts)

    NON_PLACE_QUERIES = {
        "hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings",
        "what is cambodia", "tell me about cambodia", "about cambodia", "cambodia", "cambodia country",
        "who are you", "what can you do", "who made you", "how are you", "how are you doing",
        "what time is it", "what time is it in cambodia", "what time is it now", "what is the time",
        "what time", "current time", "time in cambodia", "time now", "what date is today", "today date",
        "help", "thanks", "thank you", "bye", "goodbye",
        "what is cambodia ?", "tell me about cambodia ?", "about cambodia ?", "what time is it ?",
        "who are you ?", "how are you ?", "what can you do ?",
        "សួស្តី", "ជំរាបសួរ", "កម្ពុជា", "តើអ្វីទៅជាកម្ពុជា", "ប្រាប់អំពីកម្ពុជា",
        "ម៉ោងប៉ុន្មាន", "ម៉ោងប៉ុន្មានហើយ", "ម៉ោងប៉ុន្មានហើយ ?", "តើអ្នកជាអ្នកណា", "សុខសប្បាយទេ"
    }

    def compute_fuzzy_score(self, query: str, item: Dict[str, Any]) -> float:
        """Compute fuzzy similarity score (0.0 to 1.0) with exact word and token matching."""
        clean_q = re.sub(r'[^\w\s\u1780-\u17FF]', '', query.lower()).strip()
        if not clean_q or len(clean_q) < 3 or clean_q in self.NON_PLACE_QUERIES:
            return 0.0

        name_en = str(item.get("name") or "").lower().strip()
        name_km = str(item.get("name_km") or "").lower().strip()
        
        scores = []
        
        # 1. Exact or clean name match
        for name in [name_en, name_km]:
            if not name:
                continue
            if clean_q == name:
                return 1.0
            # If place name is contained in query (e.g. "tell me about Angkor Wat")
            if len(name) >= 4 and (f" {name} " in f" {clean_q} " or clean_q.startswith(name) or clean_q.endswith(name)):
                scores.append(0.95)
            # If query is contained in place name (e.g. "angkor wat" in "angkor wat temple")
            elif len(clean_q) >= 4 and (f" {clean_q} " in f" {name} " or name.startswith(clean_q)):
                len_ratio = len(clean_q) / len(name)
                scores.append(0.80 + 0.18 * len_ratio)
            else:
                ratio = difflib.SequenceMatcher(None, clean_q, name).ratio()
                if ratio >= 0.75:
                    scores.append(ratio)

        # 2. Key acronyms and high-value domain tokens
        q_tokens = set(clean_q.split())
        tags = [str(t).lower().strip() for t in item.get("tags", [])]
        topic = str(item.get("topic") or "").lower().strip()

        for kw in ["camdx", "gdi", "bacii", "khqr", "cadt", "rupp", "mpwt", "owso", "evisa", "bokator"]:
            if kw in q_tokens and (kw in name_en or kw in tags or kw in topic):
                scores.append(0.92)

        # 3. Token overlap on significant words
        for name in [name_en, name_km]:
            if not name:
                continue
            n_tokens = set(name.split())
            if n_tokens and n_tokens.issubset(q_tokens):
                scores.append(0.90)
            elif q_tokens and n_tokens and len(q_tokens & n_tokens) >= 2:
                overlap = len(q_tokens & n_tokens) / len(n_tokens)
                if overlap >= 0.5:
                    scores.append(0.70 + 0.25 * overlap)

        # 4. Multi-tag match
        matching_tags = [t for t in tags if t in q_tokens and len(t) >= 4]
        if len(matching_tags) >= 2:
            scores.append(0.85)
        elif len(matching_tags) == 1 and any(kw in matching_tags[0] for kw in ["passport", "tax", "startup"]):
            scores.append(0.80)

        return max(scores) if scores else 0.0

    def search_rag(
        self,
        query: str,
        top_k: int = settings.TOP_K,
        threshold: float = settings.SIMILARITY_THRESHOLD,
        filter_category: Optional[str] = None,
        filter_province: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Full RAG Retrieval Pipeline:
        1. Normalize Query
        2. Language Detection
        3. Embedding Computation
        4. Semantic & Fuzzy Scoring
        5. Metadata Filtering (category, province)
        6. Top-K Retrieval above threshold
        7. Context Ranking
        """
        clean_q = re.sub(r'[^\w\s\u1780-\u17FF]', '', query.lower()).strip()
        if not clean_q or len(clean_q) < 3 or clean_q in self.NON_PLACE_QUERIES:
            return []

        if not self._is_indexed:
            self.index_datasets()

        if not self._item_embeddings:
            return []

        query_vec = embedding_service.encode(query)
        scored_candidates = []

        for item, item_vec, text_profile in self._item_embeddings:
            # Metadata filtering
            if filter_category:
                item_cat = (item.get("category") or "").lower()
                if filter_category.lower() not in item_cat:
                    continue
            if filter_province:
                item_prov = (item.get("province") or "").lower()
                if filter_province.lower() not in item_prov:
                    continue

            # Compute combined score
            fuz_score = self.compute_fuzzy_score(query, item)
            sem_score = embedding_service.compute_similarity(query_vec, item_vec)
            
            # Weighted hybrid score
            if fuz_score >= 0.75:
                combined_score = max(sem_score, fuz_score)
            elif fuz_score > 0.0:
                combined_score = 0.5 * sem_score + 0.5 * fuz_score
            else:
                # Pure semantic match requires stronger confidence
                combined_score = sem_score if sem_score >= 0.68 else 0.0

            if combined_score >= threshold:
                scored_candidates.append({
                    "item": item,
                    "score": round(combined_score, 4),
                    "semantic_score": round(sem_score, 4),
                    "fuzzy_score": round(fuz_score, 4)
                })

        # Rank by score descending
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        return scored_candidates[:top_k]

    def find_best_match(
        self,
        query: str,
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Check query against local JSON files using RAG retrieval.
        Returns single best match for backwards compatibility.
        """
        effective_threshold = threshold if threshold is not None else settings.SIMILARITY_THRESHOLD
        results = self.search_rag(query=query, top_k=1, threshold=effective_threshold)
        
        if not results:
            return {
                "match_found": False,
                "similarity_score": 0.0,
                "matched_item": None,
                "formatted_snippet": ""
            }

        top_match = results[0]
        item = top_match["item"]
        score = top_match["score"]

        return {
            "match_found": True,
            "similarity_score": score,
            "matched_item": item,
            "formatted_snippet": self._format_snippet(item)
        }

    def build_rag_context(
        self,
        query: str,
        top_k: int = settings.TOP_K,
        threshold: float = settings.SIMILARITY_THRESHOLD,
        max_length: int = settings.MAX_CONTEXT_LENGTH
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Build concise, deduplicated ground-truth RAG context string for the AI prompt
        and return the structured retrieved source items.
        """
        results = self.search_rag(query=query, top_k=top_k, threshold=threshold)
        if not results:
            return "", []

        snippets = []
        sources = []
        current_len = 0

        for r in results:
            item = r["item"]
            score = r["score"]
            snippet = self._format_snippet(item)
            
            if current_len + len(snippet) > max_length:
                break

            snippets.append(f"--- [VERIFIED RECORD (Relevance: {score * 100:.0f}%)] ---\n{snippet}")
            current_len += len(snippet)

            sources.append({
                "id": item.get("id", "src"),
                "name": item.get("name") or item.get("title"),
                "name_km": item.get("name_km"),
                "category": item.get("category", "National Record"),
                "topic": item.get("topic"),
                "province": item.get("province") or item.get("location", ""),
                "description": item.get("description", ""),
                "price": item.get("price") or item.get("entrance_fee"),
                "relevance_score": score,
                "official_portal": item.get("official_portal"),
                "google_maps_url": f"https://www.google.com/maps/search/?api=1&query={item.get('latitude')},{item.get('longitude')}" if item.get("latitude") else None,
                "website_links": item.get("website_links", []),
                "picture_links": item.get("picture_links", []),
                "verified_source": item.get("source") or item.get("verified_source", "Kingdom of Cambodia Official Authority")
            })

        context_str = "\n\n".join(snippets)
        return context_str, sources

    def _format_snippet(self, item: Dict[str, Any]) -> str:
        """Format the matched JSON item into a structured clean text block for AI grounding."""
        lines = []
        name = item.get("name")
        name_km = item.get("name_km")
        title = f"{name} ({name_km})" if name_km else name
        lines.append(f"NAME: {title}")

        if item.get("category"):
            lines.append(f"CATEGORY: {item['category']}")
        if item.get("topic"):
            lines.append(f"TOPIC: {item['topic']}")
        if item.get("province"):
            prov = item.get("province")
            if item.get("province_km"):
                prov += f" ({item['province_km']})"
            lines.append(f"PROVINCE/LOCATION: {prov}")
        if item.get("official_portal"):
            lines.append(f"OFFICIAL PORTAL / URL: {item['official_portal']}")
        if item.get("description"):
            lines.append(f"DESCRIPTION (EN): {item['description']}")
        if item.get("description_km"):
            lines.append(f"DESCRIPTION (KM): {item['description_km']}")
        if item.get("required_documents") and isinstance(item["required_documents"], list):
            lines.append(f"REQUIRED DOCUMENTS: {', '.join(item['required_documents'])}")
        if item.get("specialties") and isinstance(item["specialties"], list):
            lines.append(f"SPECIALTIES / PROFILE: {', '.join(item['specialties'])}")
        if item.get("official_disclaimer"):
            lines.append(f"OFFICIAL DISCLAIMER: {item['official_disclaimer']}")
        if item.get("opening_hours"):
            lines.append(f"OPENING HOURS: {item['opening_hours']}")
        if item.get("price") or item.get("entrance_fee"):
            lines.append(f"ENTRANCE FEE / PRICE: {item.get('price') or item.get('entrance_fee')}")
        if item.get("best_time") or item.get("best_time_to_visit"):
            lines.append(f"BEST TIME TO VISIT: {item.get('best_time') or item.get('best_time_to_visit')}")
        if item.get("travel_tips"):
            tips = item["travel_tips"]
            lines.append(f"TRAVEL TIPS: {', '.join(tips) if isinstance(tips, list) else tips}")
        if item.get("source") or item.get("verified_source"):
            lines.append(f"VERIFIED SOURCE: {item.get('source') or item.get('verified_source')}")

        # Website links (links only)
        if item.get("website_links") and isinstance(item["website_links"], list):
            valid_w = [f"{w.get('title', 'Website')}: {w.get('url')}" for w in item["website_links"] if w.get("url")]
            if valid_w:
                lines.append(f"WEBSITES / REFERENCES: {', '.join(valid_w)}")

        # Picture links (image URL links only)
        if item.get("picture_links") and isinstance(item["picture_links"], list):
            valid_p = [f"{p.get('caption', 'Photo')}: {p.get('image_url')}" for p in item["picture_links"] if p.get("image_url")]
            if valid_p:
                lines.append(f"PICTURE / PHOTO LINKS: {', '.join(valid_p)}")

        return "\n".join(lines)

matching_service = SimilarityMatchingService()
