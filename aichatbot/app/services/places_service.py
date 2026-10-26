import math
from typing import List, Dict, Any, Optional
from app.services.tourism_service import tourism_service

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class PlacesService:
    def get_all_places(self, category: Optional[str] = None, province: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve places with coordinates and Google Maps links."""
        items = tourism_service.get_all_items()
        results = []
        for item in items:
            cat = str(item.get("category", "")).lower()
            prov = str(item.get("province", "")).lower()
            tags = [str(t).lower() for t in item.get("tags", [])]
            
            if category and category.lower() not in cat and not any(category.lower() in t for t in tags):
                continue
            if province and province.lower() not in prov and province.lower() not in str(item.get("province_km", "")).lower():
                continue
            
            enhanced = dict(item)
            lat = item.get("latitude")
            lon = item.get("longitude")
            name = item.get("name", "Cambodia")
            
            if lat and lon:
                enhanced["google_maps_url"] = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
            else:
                enhanced["google_maps_url"] = f"https://www.google.com/maps/search/?api=1&query={name.replace(' ', '+')}+Cambodia"
                
            results.append(enhanced)
        return results

    def search_restaurants(
        self,
        query: Optional[str] = None,
        province: Optional[str] = None,
        cuisine: Optional[str] = None,
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieve strictly verified Cambodian restaurants with no hallucinations.
        Matches by dish name (e.g., 'fish amok', 'lok lak', 'crab'), province, cuisine, and tags.
        """
        all_places = self.get_all_places()
        restaurants = [
            p for p in all_places
            if str(p.get("category", "")).lower() in ["restaurant", "food", "dining"]
            or any("restaurant" in str(t).lower() or "food" in str(t).lower() for t in p.get("tags", []))
        ]

        q = (query or "").lower().strip()
        prov = (province or "").lower().strip() if province and province.lower() != "cambodia" else ""
        cui = (cuisine or "").lower().strip()

        scored = []
        for r in restaurants:
            score = 10
            r_name = str(r.get("name", "")).lower()
            r_name_km = str(r.get("name_km", "")).lower()
            r_prov = str(r.get("province", "")).lower()
            r_prov_km = str(r.get("province_km", "")).lower()
            r_cuisine = str(r.get("cuisine", "")).lower()
            r_desc = str(r.get("description", "")).lower()
            r_dishes = [str(d).lower() for d in r.get("specialty_dishes", [])]
            r_tags = [str(t).lower() for t in r.get("tags", [])]

            if prov:
                if prov in r_prov or prov in r_prov_km:
                    score += 30
                else:
                    # Penalty if looking for a specific province and restaurant is elsewhere
                    score -= 20

            if q:
                if q in r_name or q in r_name_km:
                    score += 40
                if any(q in d for d in r_dishes):
                    score += 35
                if q in r_desc:
                    score += 20
                if any(q in t for t in r_tags):
                    score += 15

                # Key dish keywords
                if "amok" in q and ("amok" in r_desc or any("amok" in d for d in r_dishes)):
                    score += 30
                if "lok lak" in q and ("lok lak" in r_desc or any("lok lak" in d for d in r_dishes)):
                    score += 30
                if "crab" in q and ("crab" in r_desc or any("crab" in d for d in r_dishes)):
                    score += 35

            if cui and (cui in r_cuisine or any(cui in t for t in r_tags)):
                score += 15

            if score > 0:
                scored.append((score, r))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [r for _, r in scored[:limit]]

    def search_places_ranked(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        province: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Deterministic ranking for attractions and destinations."""
        places = self.get_all_places(category=category, province=province)
        q = (query or "").lower().strip()
        
        scored = []
        for p in places:
            score = 10
            name = str(p.get("name", "")).lower()
            name_km = str(p.get("name_km", "")).lower()
            desc = str(p.get("description", "")).lower()
            tags = [str(t).lower() for t in p.get("tags", [])]
            
            if q:
                if q in name or q in name_km:
                    score += 40
                if any(q in t for t in tags):
                    score += 20
                if q in desc:
                    score += 15
                    
            if "unesco" in tags:
                score += 20
            if "angkor" in name or "wat" in name:
                score += 15
                
            scored.append((score, p))
            
        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:limit]]

    def get_place_by_id(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get single place by ID with enriched details."""
        item = tourism_service.get_item_by_id(place_id)
        if not item:
            return None
        enhanced = dict(item)
        lat = item.get("latitude")
        lon = item.get("longitude")
        name = item.get("name", "Cambodia")
        if lat and lon:
            enhanced["google_maps_url"] = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
        else:
            enhanced["google_maps_url"] = f"https://www.google.com/maps/search/?api=1&query={name.replace(' ', '+')}+Cambodia"
            
        enhanced["related_places"] = self.get_related_places(place_id, limit=3)
        return enhanced

    def get_popular_places(self, limit: int = 6) -> List[Dict[str, Any]]:
        """Get top popular Cambodian attractions."""
        return self.search_places_ranked(limit=limit)

    def get_related_places(self, place_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get related places in the same province or category."""
        target = tourism_service.get_item_by_id(place_id)
        if not target:
            return []
            
        target_prov = (target.get("province") or "").lower()
        target_cat = (target.get("category") or "").lower()
        
        all_places = self.get_all_places()
        related = []
        
        for p in all_places:
            if str(p.get("id")) == str(place_id):
                continue
            prov = (p.get("province") or "").lower()
            cat = (p.get("category") or "").lower()
            
            score = 0
            if target_prov and target_prov in prov:
                score += 10
            if target_cat and target_cat in cat:
                score += 8
                
            if score > 0:
                related.append((score, p))
                
        related.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in related[:limit]]

    def find_nearby_places(self, lat: float, lon: float, max_distance_km: float = 25.0, limit: int = 6) -> List[Dict[str, Any]]:
        """Find places closest to specified coordinates."""
        places = self.get_all_places()
        scored = []
        for p in places:
            p_lat = p.get("latitude")
            p_lon = p.get("longitude")
            if p_lat is not None and p_lon is not None:
                dist = haversine_distance(lat, lon, p_lat, p_lon)
                if dist <= max_distance_km:
                    p_copy = dict(p)
                    p_copy["distance_km"] = dist
                    p_copy["estimated_travel_time_tuk_tuk"] = f"{int(dist * 2.5 + 5)} mins"
                    scored.append((dist, p_copy))

        scored.sort(key=lambda x: x[0])
        return [p for _, p in scored[:limit]]

places_service = PlacesService()
