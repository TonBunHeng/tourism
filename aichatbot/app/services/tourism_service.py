import os
import json
import re
from typing import List, Dict, Any, Optional
from app.core.config import settings

class TourismService:
    def __init__(self, data_dir: str = settings.DATA_DIR):
        self.data_dir = data_dir
        self.datasets: Dict[str, List[Dict[str, Any]]] = {}
        self.all_items: List[Dict[str, Any]] = []
        self._items_by_id: Dict[str, Dict[str, Any]] = {}
        self.load_all_datasets()

    def load_all_datasets(self):
        """
        Recursively load all JSON datasets across all subdirectories:
        places/, temples/, beaches/, restaurants/, museums/, activities/,
        provinces/, cuisine/, culture/, festivals/, transportation/, safety/.
        """
        self.datasets = {}
        self.all_items = []
        self._items_by_id = {}
        
        if not os.path.exists(self.data_dir):
            print(f"TourismService Warning: Data directory does not exist: {self.data_dir}")
            return
            
        for root, _, files in os.walk(self.data_dir):
            for filename in files:
                if filename.endswith(".json"):
                    filepath = os.path.join(root, filename)
                    # Use directory name or file base as category key
                    rel_path = os.path.relpath(filepath, self.data_dir)
                    cat_key = os.path.dirname(rel_path) if os.path.dirname(rel_path) else filename[:-5]
                    file_stem = filename[:-5]
                    
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                # Index under directory category key
                                if cat_key not in self.datasets:
                                    self.datasets[cat_key] = []
                                self.datasets[cat_key].extend(data)
                                
                                # Also index under file stem if different
                                if file_stem != cat_key:
                                    if file_stem not in self.datasets:
                                        self.datasets[file_stem] = []
                                    self.datasets[file_stem].extend(data)

                                for item in data:
                                    if isinstance(item, dict):
                                        # Deduplicate by item ID across subdirectories
                                        item_id = str(item.get("id") or "")
                                        if item_id and item_id in self._items_by_id:
                                            continue
                                            
                                        item["_source_file"] = rel_path
                                        if not item.get("category"):
                                            item["category"] = cat_key
                                        if "verified" not in item:
                                            item["verified"] = True
                                        if "source" not in item and "verified_source" in item:
                                            item["source"] = item["verified_source"]
                                        if "last_updated" not in item and "last_verified_at" in item:
                                            item["last_updated"] = item["last_verified_at"]
                                            
                                        if item_id:
                                            self._items_by_id[item_id] = item
                                        self.all_items.append(item)
                    except Exception as e:
                        print(f"TourismService: Error loading {filepath}: {e}")

    def get_dataset(self, name: str) -> List[Dict[str, Any]]:
        """Retrieve dataset list by category/file name (e.g. 'temples', 'events', 'festivals', 'beaches')."""
        clean_name = name.lower().strip()
        if clean_name in self.datasets:
            return self.datasets[clean_name]
        # Check alias
        aliases = {
            "events": "festivals",
            "festival": "festivals",
            "food": "cuisine",
            "dishes": "cuisine",
            "places": "places",
            "destinations": "places",
            "tips": "safety",
            "travel_tips": "safety"
        }
        target_key = aliases.get(clean_name, clean_name)
        return self.datasets.get(target_key, [])

    def get_all_items(self) -> List[Dict[str, Any]]:
        return self.all_items

    def get_item_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific tourism place item by ID."""
        clean_id = str(item_id).strip()
        if clean_id in self._items_by_id:
            return self._items_by_id[clean_id]
        for item in self.all_items:
            if str(item.get("id")) == clean_id:
                return item
        return None

    def add_item(self, item: Dict[str, Any]) -> None:
        """Dynamically register or update a tourism item in memory."""
        item_id = str(item.get("id") or f"item_{len(self.all_items) + 1}")
        item["id"] = item_id

        if item_id in self._items_by_id:
            self._items_by_id[item_id].update(item)
            return

        cat_key = item.get("category", "dynamic_knowledge")
        if cat_key not in self.datasets:
            self.datasets[cat_key] = []
        self.datasets[cat_key].append(item)

        if "dynamic_knowledge" not in self.datasets:
            self.datasets["dynamic_knowledge"] = []
        self.datasets["dynamic_knowledge"].append(item)

        self._items_by_id[item_id] = item
        self.all_items.append(item)

    def get_all_provinces(self) -> List[str]:
        """Return unique list of provinces in Cambodia dataset."""
        provinces = set()
        for item in self.all_items:
            prov = item.get("province")
            if prov and prov not in ["Nationwide", "Coastal Provinces"]:
                provinces.add(prov)
        return sorted(list(provinces))

    def find_items_by_province(self, province_name: str) -> List[Dict[str, Any]]:
        """Filter tourism items by province name (English or Khmer)."""
        target = province_name.lower().strip()
        results = []
        for item in self.all_items:
            prov_en = (item.get("province") or "").lower()
            prov_km = (item.get("province_km") or "").lower()
            if target in prov_en or target in prov_km or prov_en in target:
                results.append(item)
        return results

    def find_items_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Filter items by category (e.g. 'temple', 'beach', 'museum', 'restaurant', 'activity')."""
        target = category.lower().strip()
        results = []
        for item in self.all_items:
            cat = (item.get("category") or "").lower()
            tags = [t.lower() for t in item.get("tags", [])]
            if target in cat or any(target in t for t in tags):
                results.append(item)
        return results

    STOP_WORDS = {
        "what", "is", "are", "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "with",
        "tell", "me", "about", "how", "where", "which", "who", "why", "cambodia", "country", "tourism",
        "tourist", "visit", "trip", "travel", "place", "places", "highlight", "highlights", "hi", "hello",
        "hey", "please", "can", "you", "i", "my", "we", "our", "do", "does", "did",
        "កម្ពុជា", "តើ", "អ្វី", "ជា", "នៅ", "ពី", "អំពី", "ទេសចរណ៍", "កន្លែង", "ជួយ", "សួស្តី", "ជំរាបសួរ"
    }

    def search_keyword(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Keyword matching across name, description, tags, province, and tips."""
        query_lower = query.lower().strip()
        clean_q = re.sub(r'[^\w\s\u1780-\u17FF]', '', query_lower)
        tokens = [t for t in clean_q.split() if len(t) > 1 and t not in self.STOP_WORDS]
        
        if not tokens and clean_q in self.STOP_WORDS:
            return []

        scored_items = []
        for item in self.all_items:
            score = 0
            name_en = (item.get("name") or "").lower()
            name_km = (item.get("name_km") or "").lower()
            desc_en = (item.get("description") or "").lower()
            desc_km = (item.get("description_km") or "").lower()
            prov_en = (item.get("province") or "").lower()
            prov_km = (item.get("province_km") or "").lower()
            tags = [t.lower() for t in item.get("tags", [])]
            
            # Exact or specific place name containment
            if len(clean_q) >= 4 and clean_q not in self.STOP_WORDS:
                if (name_en and (clean_q == name_en or clean_q in name_en or name_en in clean_q)) or \
                   (name_km and (clean_q == name_km or clean_q in name_km or name_km in clean_q)):
                    score += 30
                if (prov_en and (clean_q == prov_en or clean_q in prov_en)) or \
                   (prov_km and (clean_q == prov_km or clean_q in prov_km)):
                    score += 15
                
            # Token & Tag match
            for token in tokens:
                if name_en and (token == name_en or token in name_en.split()):
                    score += 15
                elif name_en and token in name_en:
                    score += 8
                if name_km and (token == name_km or token in name_km):
                    score += 15
                if prov_en and (token == prov_en or token in prov_en.split()):
                    score += 8
                if prov_km and (token == prov_km or token in prov_km):
                    score += 8
                if any(token == tag or token in tag.split() for tag in tags):
                    score += 6
                if (desc_en and f" {token} " in f" {desc_en} ") or (desc_km and token in desc_km):
                    score += 3
                    
            if score >= 6:
                scored_items.append((score, item))
                
        scored_items.sort(key=lambda x: x[0], reverse=True)
        return [item for score, item in scored_items[:limit]]

tourism_service = TourismService()
