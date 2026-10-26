from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.tourism_service import tourism_service
from app.services.weather_service import weather_service

class RecommendationEngine:
    def recommend(
        self,
        interests: Optional[List[str]] = None,
        province: Optional[str] = None,
        budget_usd: Optional[float] = None,
        duration_days: Optional[int] = None,
        travel_style: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Calculate weighted recommendation score for all tourism places in database:
        Score = interest_match * 0.30 + location_match * 0.15 + budget_match * 0.15 
              + duration_match * 0.15 + weather_match * 0.10 + popularity * 0.10 + accessibility * 0.05
        """
        all_places = tourism_service.get_all_items()
        if not all_places:
            return []

        user_interests = [i.lower().strip() for i in (interests or [])]
        user_style = (travel_style or "").lower().strip()
        if user_style and user_style not in user_interests:
            user_interests.append(user_style)

        target_prov = (province or "").lower().strip()

        scored_places = []
        for place in all_places:
            # 1. Interest Match (0.0 to 1.0)
            place_tags = [t.lower() for t in place.get("tags", [])]
            place_cat = (place.get("category") or "").lower()
            place_desc = (place.get("description") or "").lower()
            
            if user_interests:
                match_count = 0
                for ui in user_interests:
                    if ui in place_tags or ui in place_cat or ui in place_desc:
                        match_count += 1
                interest_score = min(match_count / max(len(user_interests), 1), 1.0)
                # Boost if multiple tag overlaps
                if match_count >= 2:
                    interest_score = min(interest_score + 0.2, 1.0)
            else:
                interest_score = 0.80  # Baseline interest score

            # 2. Location Match (0.0 to 1.0)
            place_prov = (place.get("province") or "").lower()
            if target_prov and target_prov not in ["cambodia", "all", "nationwide"]:
                if target_prov in place_prov or place_prov in target_prov:
                    location_score = 1.0
                else:
                    location_score = 0.20
            else:
                location_score = 0.85

            # 3. Budget Match (0.0 to 1.0)
            price_raw = str(place.get("price", "0")).lower()
            if "free" in price_raw:
                place_cost = 0.0
            elif "included" in price_raw:
                place_cost = 10.0
            else:
                import re
                nums = re.findall(r'\d+', price_raw)
                place_cost = float(nums[0]) if nums else 10.0

            if budget_usd is not None and budget_usd > 0:
                if place_cost <= budget_usd * 0.25:
                    budget_score = 1.0
                elif place_cost <= budget_usd * 0.50:
                    budget_score = 0.80
                else:
                    budget_score = 0.50
            else:
                budget_score = 0.90

            # 4. Duration Match (0.0 to 1.0)
            visit_mins = place.get("estimated_visit_minutes", 120)
            if duration_days is not None:
                if duration_days >= 3:
                    duration_score = 1.0
                elif duration_days == 1 and visit_mins <= 240:
                    duration_score = 1.0
                else:
                    duration_score = 0.75
            else:
                duration_score = 0.90

            # 5. Weather Match (0.0 to 1.0)
            # Indoor museums vs outdoor beaches/temples
            is_indoor = "museum" in place_cat or "memorial" in place_cat
            weather_score = 0.90 if is_indoor else 0.85

            # 6. Popularity / UNESCO Baseline (0.0 to 1.0)
            is_unesco = "unesco" in place_tags or "angkor" in place.get("name", "").lower()
            popularity_score = 1.0 if is_unesco else 0.80

            # 7. Accessibility Score (0.0 to 1.0)
            acc = str(place.get("accessibility", "")).lower()
            if "very good" in acc or "good" in acc:
                accessibility_score = 1.0
            else:
                accessibility_score = 0.75

            # Weighted Formula
            final_score = (
                interest_score * settings.REC_WEIGHT_INTEREST +
                location_score * settings.REC_WEIGHT_LOCATION +
                budget_score * settings.REC_WEIGHT_BUDGET +
                duration_score * settings.REC_WEIGHT_DURATION +
                weather_score * settings.REC_WEIGHT_WEATHER +
                popularity_score * settings.REC_WEIGHT_POPULARITY +
                accessibility_score * settings.REC_WEIGHT_ACCESSIBILITY
            )

            # Match reasons explanation
            reasons = []
            if interest_score >= 0.7 and user_interests:
                reasons.append(f"Matches your interests in {', '.join(user_interests[:3])}")
            if location_score == 1.0 and target_prov:
                reasons.append(f"Located in {place.get('province')}")
            if is_unesco:
                reasons.append("UNESCO World Heritage / High Priority Cambodia Highlight")
            if place_cost == 0:
                reasons.append("Budget friendly (Free admission)")

            rec_item = dict(place)
            rec_item["match_score"] = round(final_score * 100, 1)
            rec_item["match_reasons"] = reasons or ["High-rated Cambodia attraction"]
            rec_item["estimated_cost_usd"] = place_cost
            rec_item["google_maps_url"] = f"https://www.google.com/maps/search/?api=1&query={place.get('latitude', '')},{place.get('longitude', '')}" if place.get("latitude") else None

            scored_places.append(rec_item)

        scored_places.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_places[:limit]

recommendation_engine = RecommendationEngine()
