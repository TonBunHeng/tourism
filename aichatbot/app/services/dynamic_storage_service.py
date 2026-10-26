import os
import json
import re
import time
import hashlib
import threading
from typing import Dict, Any, List, Optional
from app.core.config import settings

class DynamicStorageService:
    """
    Manages persistent dynamic knowledge storage for Cambodia tourism:
    - Stores learned information in backend/storage/tourism/dynamic_knowledge.json
    - Strictly enforces 'link only' for pictures and websites (no binary blobs or base64)
    - Auto-stores textual descriptions so future AI queries find the data directly in storage
    - Registers items live in TourismService and SimilarityMatchingService
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._initialized = False

    @property
    def storage_filepath(self) -> str:
        """Resolve storage file path with Vercel/read-only fallback to /tmp."""
        if os.environ.get("VERCEL"):
            return "/tmp/dynamic_knowledge.json"
        
        target_dir = settings.DATA_DIR
        try:
            os.makedirs(target_dir, exist_ok=True)
            return os.path.join(target_dir, "dynamic_knowledge.json")
        except Exception:
            return "/tmp/dynamic_knowledge.json"

    def _sanitize_links_only(self, links: List[Dict[str, Any]], key_name: str) -> List[Dict[str, str]]:
        """
        Ensure pictures and website references contain links only (HTTP/HTTPS URLs).
        Rejects raw binary data, data URLs, base64 strings, or file blobs.
        """
        clean_list: List[Dict[str, str]] = []
        if not links or not isinstance(links, list):
            return clean_list

        for item in links:
            if not isinstance(item, dict):
                continue
            url = str(item.get(key_name) or "").strip()
            # Strictly validate that it is an external web link
            if url.startswith("http://") or url.startswith("https://"):
                # Reject base64 data URLs masquerading as strings
                if "data:image" in url or len(url) > 2048:
                    continue
                
                title = str(item.get("title") or item.get("caption") or "Reference").strip()
                clean_list.append({
                    "title" if key_name == "url" else "caption": title,
                    key_name: url
                })
        return clean_list

    def load_dynamic_items(self) -> List[Dict[str, Any]]:
        """Read all dynamically stored items from storage."""
        fpath = self.storage_filepath
        if not os.path.exists(fpath):
            return []
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception as e:
            print(f"[DynamicStorageService] Load error from {fpath}: {e}")
            return []

    def save_dynamic_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Store a newly learned tourism entry into storage/tourism/dynamic_knowledge.json:
        - Auto-stores textual descriptions, category, province, and tags.
        - Stores links only for pictures and websites.
        - Synchronizes with in-memory TourismService and SimilarityMatchingService.
        """
        with self._lock:
            # Generate deterministic stable ID
            raw_name = str(item.get("name") or "place").strip()
            slug = re.sub(r'[^a-zA-Z0-9_\u1780-\u17FF]', '_', raw_name.lower())[:32]
            name_hash = hashlib.md5(raw_name.encode('utf-8')).hexdigest()[:6]
            item_id = str(item.get("id") or f"dynamic_{slug}_{name_hash}")

            # Enforce links only
            website_links = self._sanitize_links_only(item.get("website_links", []), "url")
            picture_links = self._sanitize_links_only(item.get("picture_links", []), "image_url")

            cleaned_item: Dict[str, Any] = {
                "id": item_id,
                "name": raw_name,
                "name_km": item.get("name_km") or "",
                "category": item.get("category") or "Discovered Attraction",
                "province": item.get("province") or "Cambodia",
                "province_km": item.get("province_km") or "",
                "description": str(item.get("description") or "").strip(),
                "description_km": str(item.get("description_km") or "").strip(),
                "website_links": website_links,
                "picture_links": picture_links,
                "tags": item.get("tags") or [raw_name.lower()],
                "source": item.get("source") or "outside_search_discovery",
                "verified": True,
                "learned_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }

            # Optional metadata
            if item.get("opening_hours"):
                cleaned_item["opening_hours"] = item["opening_hours"]
            if item.get("price") or item.get("entrance_fee"):
                cleaned_item["price"] = item.get("price") or item.get("entrance_fee")
            if item.get("travel_tips"):
                cleaned_item["travel_tips"] = item["travel_tips"]

            # 1. Save to JSON file on disk
            fpath = self.storage_filepath
            existing_items = self.load_dynamic_items()
            updated = False
            for idx, existing in enumerate(existing_items):
                if str(existing.get("id")) == item_id or existing.get("name", "").lower() == raw_name.lower():
                    # Merge links and keep updated description
                    combined_web = existing.get("website_links", []) + website_links
                    combined_pic = existing.get("picture_links", []) + picture_links
                    seen_urls = set()
                    unique_web = []
                    for w in combined_web:
                        if w.get("url") and w["url"] not in seen_urls:
                            seen_urls.add(w["url"])
                            unique_web.append(w)
                    seen_imgs = set()
                    unique_pic = []
                    for p in combined_pic:
                        if p.get("image_url") and p["image_url"] not in seen_imgs:
                            seen_imgs.add(p["image_url"])
                            unique_pic.append(p)
                    
                    cleaned_item["website_links"] = unique_web[:6]
                    cleaned_item["picture_links"] = unique_pic[:6]
                    existing_items[idx] = cleaned_item
                    updated = True
                    break

            if not updated:
                existing_items.append(cleaned_item)

            try:
                temp_fpath = fpath + ".tmp"
                with open(temp_fpath, "w", encoding="utf-8") as f:
                    json.dump(existing_items, f, indent=2, ensure_ascii=False)
                os.replace(temp_fpath, fpath)
            except Exception as e:
                print(f"[DynamicStorageService] Warning: File write failed on {fpath}: {e}")

            # 2. Register live into in-memory services so immediate search finds it
            try:
                from app.services.tourism_service import tourism_service
                tourism_service.add_item(cleaned_item)
            except Exception as e:
                print(f"[DynamicStorageService] TourismService live registration note: {e}")

            try:
                from app.services.matching_service import matching_service
                matching_service.add_item_to_index(cleaned_item)
            except Exception as e:
                print(f"[DynamicStorageService] MatchingService live registration note: {e}")

            return cleaned_item

    def auto_learn_from_outside(
        self,
        query: str,
        search_info: Dict[str, Any],
        province: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Construct and auto-store dynamic knowledge from outside search results:
        - Stores text description in storage
        - Stores links only for pictures and websites
        - Returns the saved item
        """
        if not search_info or not search_info.get("description"):
            return None

        name = search_info.get("name") or search_info.get("title") or query.strip()
        desc = search_info.get("description", "").strip()

        # Province inference
        detected_prov = province or "Cambodia"
        from app.services.intent_service import intent_service
        extracted_entities = intent_service.extract_entities(f"{query} {desc}")
        if extracted_entities.get("destination"):
            detected_prov = extracted_entities["destination"]

        # Khmer name detection if query is in Khmer
        name_km = ""
        desc_km = ""
        from app.services.language_service import language_service
        if language_service.is_khmer(query):
            name_km = query.strip()
            desc_km = desc

        item_payload = {
            "name": name,
            "name_km": name_km,
            "category": "Discovered Attraction",
            "province": detected_prov,
            "description": desc,
            "description_km": desc_km,
            "website_links": search_info.get("website_links", []),
            "picture_links": search_info.get("picture_links", []),
            "tags": search_info.get("tags") or [name.lower(), detected_prov.lower(), "cambodia"],
            "source": "outside_search_discovery"
        }

        return self.save_dynamic_item(item_payload)

dynamic_storage_service = DynamicStorageService()
