from typing import List, Dict, Any, Optional
from app.services.currency_service import currency_service

class ItineraryEngine:
    def generate_itinerary(
        self,
        destination: str = "Siem Reap",
        days: int = 3,
        budget_usd: Optional[float] = None,
        travel_style: str = "culture",
        interests: Optional[List[str]] = None,
        travelers: int = 2,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate complete, deterministic day-by-day travel plan with:
        - Every requested day (Day 1 through Day N) fully populated with activities, time, transit, and costs.
        - Primary and Secondary destination mapping.
        - Strict deterministic budget calculation (Transportation + Accommodation + Food + Activities + Other).
        - USD and KHR conversion using live/cached exchange rates.
        """
        dest_clean = (destination or "Siem Reap").strip()
        num_days = max(1, min(int(days or 3), 10))
        is_km = "km" in language
        
        primary_dest = dest_clean
        secondary_dests: List[str] = []

        # 1. Select and build complete Day plans for the requested duration
        if any(w in dest_clean.lower() for w in ["siem reap", "angkor", "សៀមរាប", "អង្គរ"]):
            primary_dest = "Siem Reap"
            if num_days >= 4:
                secondary_dests = ["Phnom Kulen", "Koh Ker"]
            itinerary_days = self._build_siem_reap_itinerary(num_days, is_km)
            title = f"{num_days}-Day Angkor & Siem Reap Cultural Journey" if not is_km else f"គម្រោងដំណើរកម្សាន្ត {num_days} ថ្ងៃ នៅសៀមរាប-អង្គរ"
        elif any(w in dest_clean.lower() for w in ["phnom penh", "ភ្នំពេញ", "capital"]):
            primary_dest = "Phnom Penh"
            if num_days >= 3:
                secondary_dests = ["Koh Dach (Silk Island)", "Oudong"]
            itinerary_days = self._build_phnom_penh_itinerary(num_days, is_km)
            title = f"{num_days}-Day Phnom Penh Heritage & Discovery" if not is_km else f"គម្រោងដំណើរកម្សាន្ត {num_days} ថ្ងៃ នៅរាជធានីភ្នំពេញ"
        elif any(w in dest_clean.lower() for w in ["kampot", "kep", "កំពត", "កែប", "bokor"]):
            primary_dest = "Kampot"
            secondary_dests = ["Kep", "Bokor National Park"]
            itinerary_days = self._build_coastal_itinerary(num_days, is_km)
            title = f"{num_days}-Day Kampot & Kep Coastal Escape" if not is_km else f"គម្រោងដំណើរកម្សាន្ត {num_days} ថ្ងៃ នៅកំពត និងកែប"
        elif any(w in dest_clean.lower() for w in ["koh rong", "sihanouk", "island", "beach", "កោះរ៉ុង", "ព្រះសីហនុ"]):
            primary_dest = "Koh Rong"
            if num_days >= 2:
                secondary_dests = ["Koh Rong Sanloem"]
            itinerary_days = self._build_island_itinerary(num_days, is_km)
            title = f"{num_days}-Day Tropical Island Paradise Trip" if not is_km else f"គម្រោងដំណើរកម្សាន្ត {num_days} ថ្ងៃ នៅកោះរ៉ុង"
        elif any(w in dest_clean.lower() for w in ["battambang", "បាត់ដំបង"]):
            primary_dest = "Battambang"
            itinerary_days = self._build_battambang_itinerary(num_days, is_km)
            title = f"{num_days}-Day Battambang Cultural & Heritage Trip" if not is_km else f"គម្រោងដំណើរកម្សាន្ត {num_days} ថ្ងៃ នៅបាត់ដំបង"
        else:
            primary_dest = "Cambodia"
            secondary_dests = ["Siem Reap", "Phnom Penh", "Kampot"]
            itinerary_days = self._build_grand_cambodia_itinerary(num_days, is_km)
            title = f"{num_days}-Day Grand Cambodia Discovery Itinerary" if not is_km else f"គម្រោងដំណើរកម្សាន្តធំ {num_days} ថ្ងៃ ទូទាំងប្រទេសកម្ពុជា"

        # Ensure we have EXACTLY num_days complete days (pad or trim safely)
        selected_days = itinerary_days[:num_days]
        while len(selected_days) < num_days:
            idx = len(selected_days) + 1
            selected_days.append({
                "day": idx,
                "theme": f"Day {idx}: Scenic Exploration & Local Discovery" if not is_km else f"ថ្ងៃទី {idx}: ដំណើរកម្សាន្ត និងស្វែងយល់ពីតំបន់ទេសចរណ៍ក្នុងស្រុក",
                "location": primary_dest,
                "activities": [
                    {"time": "09:00 AM - 12:00 PM", "title": "Local Artisan Markets & Heritage Walk", "description": "Explore local handicraft markets and cultural landmarks.", "transport": "Tuk-tuk", "cost": "$5 - $10", "duration": "3 hours", "duration_minutes": 180},
                    {"time": "02:00 PM - 05:00 PM", "title": "Nature & Countryside Discovery", "description": "Relaxing afternoon scenic tour around peaceful rural landscapes.", "transport": "Tuk-tuk", "cost": "$10", "duration": "3 hours", "duration_minutes": 180},
                    {"time": "06:30 PM - 08:30 PM", "title": "Authentic Khmer Dinner & Sunset View", "description": "Enjoy traditional Khmer dining with fresh coconut drinks.", "transport": "Walk", "cost": "$8 - $15", "duration": "2 hours", "duration_minutes": 120}
                ]
            })

        # 2. Deterministic Budget Breakdown Calculation (Code-driven, NEVER LLM-guessed)
        rate_info = currency_service.get_exchange_rate()
        rate = rate_info["exchange_rate"]

        # Base daily rates per person based on travel style
        style_daily_costs = {
            "budget": {"accommodation": 20.0, "food": 15.0, "transportation": 10.0, "activities": 10.0, "other": 5.0},
            "culture": {"accommodation": 45.0, "food": 25.0, "transportation": 15.0, "activities": 20.0, "other": 10.0},
            "relaxation": {"accommodation": 65.0, "food": 35.0, "transportation": 20.0, "activities": 20.0, "other": 15.0},
            "adventure": {"accommodation": 35.0, "food": 20.0, "transportation": 20.0, "activities": 25.0, "other": 10.0},
            "luxury": {"accommodation": 150.0, "food": 60.0, "transportation": 40.0, "activities": 50.0, "other": 30.0}
        }
        rates = style_daily_costs.get(travel_style.lower(), style_daily_costs["culture"])

        if budget_usd and budget_usd > 0:
            total_usd = float(budget_usd)
            trans_usd = round(total_usd * 0.20, 2)
            accom_usd = round(total_usd * 0.40, 2)
            food_usd = round(total_usd * 0.25, 2)
            act_usd = round(total_usd * 0.10, 2)
            other_usd = round(total_usd * 0.05, 2)
        else:
            trans_usd = round(rates["transportation"] * num_days * max(1, travelers * 0.7), 2)
            accom_usd = round(rates["accommodation"] * num_days, 2)
            food_usd = round(rates["food"] * num_days * travelers, 2)
            act_usd = round(rates["activities"] * num_days * travelers, 2)
            other_usd = round(rates["other"] * num_days * travelers, 2)
            total_usd = round(trans_usd + accom_usd + food_usd + act_usd + other_usd, 2)

        total_khr = int(total_usd * rate)
        formatted_budget = f"${total_usd:,.2f} USD (~{total_khr:,.0f} KHR)"

        budget_breakdown = {
            "currency": "USD",
            "transportation": trans_usd,
            "accommodation": accom_usd,
            "food": food_usd,
            "activities": act_usd,
            "other": other_usd,
            "total": total_usd,
            "total_usd": total_usd,
            "total_khr": total_khr,
            "exchange_rate": rate,
            "is_cached_rate": rate_info.get("is_cached", False)
        }

        # 3. Format structured Day items
        structured_days = []
        for d_idx, day_obj in enumerate(selected_days):
            activities = day_obj.get("activities", [])
            items = []
            for act in activities:
                items.append({
                    "time": act.get("time", "08:00 AM"),
                    "place": act.get("title", ""),
                    "activity": act.get("title", ""),
                    "description": act.get("description", ""),
                    "estimated_cost": act.get("cost", "Free"),
                    "estimated_cost_usd": act.get("cost_usd", 10.0),
                    "transportation": act.get("transport", "Tuk-tuk"),
                    "transport": act.get("transport", "Tuk-tuk"),
                    "duration": act.get("duration", "2 hours"),
                    "duration_minutes": act.get("duration_minutes", 120),
                    "location": day_obj.get("location", primary_dest)
                })
            
            structured_days.append({
                "day": d_idx + 1,
                "theme": day_obj.get("theme", f"Day {d_idx + 1}"),
                "location": day_obj.get("location", primary_dest),
                "activities": activities,
                "items": items
            })

        return {
            "title": title,
            "destination": primary_dest,
            "primary_destination": primary_dest,
            "secondary_destinations": secondary_dests,
            "duration": num_days,
            "duration_days": num_days,
            "recommended_duration_days": 3 if num_days < 3 else num_days,
            "recommendation_note": (
                f"{num_days} Days is well-paced for exploring core attractions and local culture without rushing."
                if not is_km else
                f"គម្រោង {num_days} ថ្ងៃ ត្រូវបានរៀបចំឡើងយ៉ាងស័ក្តិសមបំផុតសម្រាប់ការដើរកម្សាន្តដោយរីករាយ និងមិននឿយហត់។"
            ),
            "travelers": travelers,
            "travel_style": travel_style,
            "days": structured_days,
            "budget": budget_breakdown,
            "estimated_budget": budget_breakdown,
            "formatted_total_budget": formatted_budget,
            "currency": "USD",
            "practical_tips": [
                "Cover shoulders and knees at all sacred temple sites." if not is_km else "ត្រូវស្លៀកសម្លៀកបំពាក់បិទស្មា និងគ្របជង្គង់នៅគ្រប់ទីតាំងប្រាសាទបុរាណ។",
                "Stay hydrated and carry small US Dollar or Riel bills for local vendors." if not is_km else "សូមទទួលទានទឹកឱ្យបានគ្រប់គ្រាន់ និងត្រៀមប្រាក់រៀល ឬដុល្លាររាយសម្រាប់ទិញទំនិញតូចតាច។",
                "Use PassApp or Grab for convenient, metered local transportation." if not is_km else "ប្រើប្រាស់កម្មវិធី PassApp ឬ Grab សម្រាប់ការធ្វើដំណើរក្នុងក្រុង។"
            ]
        }

    def _build_siem_reap_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        plan = [
            {
                "day": 1,
                "theme": "Angkor Classic Small Circuit (Sunrise & Highlights)" if not is_km else "ទស្សនាថ្ងៃរះអង្គរវត្ត និងប្រាសាទសំខាន់ៗ",
                "location": "Siem Reap",
                "activities": [
                    {"time": "05:00 AM - 07:30 AM", "title": "Angkor Wat Sunrise", "description": "Witness the iconic sunrise reflecting on the lotus pond, followed by bas-relief exploration.", "transport": "Tuk-tuk", "cost": "$37 (Angkor Pass)", "cost_usd": 37.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "08:30 AM - 11:30 AM", "title": "Angkor Thom & Bayon Temple", "description": "Explore the 216 giant stone faces of Avalokiteshvara, Terrace of the Elephants, and Baphuon.", "transport": "Tuk-tuk", "cost": "Included in Pass", "cost_usd": 0.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "02:00 PM - 04:30 PM", "title": "Ta Prohm (Tomb Raider Temple)", "description": "Walk among atmospheric stone corridors intertwined with giant silk-cotton tree roots.", "transport": "Tuk-tuk", "cost": "Included in Pass", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "06:30 PM - 09:00 PM", "title": "Pub Street & Night Market", "description": "Relax with authentic street food, fruit shakes, and explore artisan souvenir shops.", "transport": "Tuk-tuk", "cost": "$5 - $12", "cost_usd": 8.0, "duration": "2.5 hours", "duration_minutes": 150}
                ]
            },
            {
                "day": 2,
                "theme": "Grand Circuit & Banteay Srei (Pink Sandstone Art)" if not is_km else "ប្រាសាទបន្ទាយស្រី និងវង់ធំ",
                "location": "Siem Reap",
                "activities": [
                    {"time": "08:00 AM - 10:30 AM", "title": "Banteay Srei (Citadel of Women)", "description": "Marvel at the world's finest 10th-century pink sandstone carvings.", "transport": "Tuk-tuk / Car", "cost": "Included in Pass", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "11:00 AM - 12:30 PM", "title": "Preah Dak Traditional Village", "description": "Taste famous handmade Nom Banh Chok noodles and palm sugar cakes in a heritage village.", "transport": "Tuk-tuk", "cost": "$2 - $4", "cost_usd": 3.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "02:00 PM - 04:30 PM", "title": "Preah Khan & Neak Pean", "description": "Explore the expansive monastic complex and peaceful island temple reservoir.", "transport": "Tuk-tuk", "cost": "Included in Pass", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "05:00 PM - 06:15 PM", "title": "Phnom Bakheng Sunset", "description": "Panoramic view of Angkor Wat and surrounding plains at golden hour dusk.", "transport": "Tuk-tuk", "cost": "Free (with Pass)", "cost_usd": 0.0, "duration": "1.25 hours", "duration_minutes": 75}
                ]
            },
            {
                "day": 3,
                "theme": "Tonle Sap Floating Village & Artisan Culture" if not is_km else "ភូមិបណ្តែតទឹកបឹងទន្លេសាប និងសិប្បកម្មអង្គរ",
                "location": "Siem Reap",
                "activities": [
                    {"time": "08:30 AM - 12:00 PM", "title": "Kampong Phluk Floating Village", "description": "Scenic boat tour through stilted houses, flooded mangrove forests, and Tonle Sap lake.", "transport": "Boat / Tuk-tuk", "cost": "$20 boat ticket", "cost_usd": 20.0, "duration": "3.5 hours", "duration_minutes": 210},
                    {"time": "02:00 PM - 04:00 PM", "title": "Artisans Angkor Workshop", "description": "Watch master craftsmen creating traditional silk, stone carving, and lacquerware.", "transport": "Tuk-tuk", "cost": "Free admission", "cost_usd": 0.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "05:00 PM - 06:30 PM", "title": "Siem Reap Old Market (Phsar Chas)", "description": "Browse local spices, Kampot pepper, and authentic Khmer handicrafts.", "transport": "Walk", "cost": "Free", "cost_usd": 0.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "07:00 PM - 08:30 PM", "title": "Phare Cambodian Circus", "description": "Electrifying performance blending acrobatics, theatre, and Khmer folklore.", "transport": "Tuk-tuk", "cost": "$18 - $25", "cost_usd": 20.0, "duration": "1.5 hours", "duration_minutes": 90}
                ]
            },
            {
                "day": 4,
                "theme": "Phnom Kulen Sacred Mountain & Waterfalls" if not is_km else "ឧទ្យានជាតិភ្នំគូលែន និងទឹកធ្លាក់ធម្មជាតិ",
                "location": "Phnom Kulen National Park",
                "activities": [
                    {"time": "08:00 AM - 11:30 AM", "title": "Phnom Kulen Waterfalls & Giant Reclining Buddha", "description": "Swim under natural cascading waterfalls and visit the 16th-century hilltop reclining Buddha.", "transport": "Taxi / Car", "cost": "$20 national park ticket", "cost_usd": 20.0, "duration": "3.5 hours", "duration_minutes": 210},
                    {"time": "12:00 PM - 01:30 PM", "title": "Kbal Spean (River of a Thousand Lingas)", "description": "Short jungle trail along a sacred stream carved with hundreds of Hindu symbols.", "transport": "Walking trail", "cost": "Included in Kulen Ticket", "cost_usd": 0.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "03:30 PM - 05:30 PM", "title": "Cambodia Landmine Museum & Relief Centre", "description": "Inspiring educational museum highlighting Cambodia's demining heroes and rural peace.", "transport": "Tuk-tuk", "cost": "$5", "cost_usd": 5.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "06:30 PM - 08:30 PM", "title": "Traditional Apsara Dance Dinner", "description": "Live classical Khmer dance performance paired with a royal buffet dinner.", "transport": "Tuk-tuk", "cost": "$15 - $25", "cost_usd": 20.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            },
            {
                "day": 5,
                "theme": "Remote Jungle Temples (Beng Mealea & Koh Ker Pyramid)" if not is_km else "ប្រាសាទកោះកេរ និងបេងមាលា",
                "location": "Koh Ker & Beng Mealea",
                "activities": [
                    {"time": "08:00 AM - 11:30 AM", "title": "Beng Mealea Jungle Temple", "description": "Unrestored overgrown temple complex evoking the thrilling atmosphere of 19th-century explorers.", "transport": "Car / Taxi", "cost": "Included in Angkor Pass", "cost_usd": 0.0, "duration": "3.5 hours", "duration_minutes": 210},
                    {"time": "01:00 PM - 04:00 PM", "title": "Koh Ker 7-Tiered Step Pyramid (Prasat Thom)", "description": "UNESCO World Heritage 10th-century step pyramid rising 36 meters above the jungle canopy.", "transport": "Car", "cost": "$15 ticket", "cost_usd": 15.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "04:30 PM - 06:00 PM", "title": "Prasat Pram (Strangler Fig Tree Temple)", "description": "Five ancient sanctuary towers wrapped dramatically in colossal tree roots.", "transport": "Car", "cost": "Included in Koh Ker Ticket", "cost_usd": 0.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "07:00 PM - 09:00 PM", "title": "Local Riverside BBQ Dinner", "description": "Relax along the Siem Reap riverbank with traditional Khmer skewers and fresh coconut.", "transport": "Walking", "cost": "$5 - $10", "cost_usd": 7.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            }
        ]
        return plan

    def _build_phnom_penh_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        plan = [
            {
                "day": 1,
                "theme": "Royal Splendor & Riverside Culture" if not is_km else "ព្រះបរមរាជវាំង សារមន្ទីរជាតិ និងមាត់ទន្លេ",
                "location": "Phnom Penh",
                "activities": [
                    {"time": "08:00 AM - 10:30 AM", "title": "Royal Palace & Silver Pagoda", "description": "Visit the Royal throne hall and Silver Pagoda floor paved with 5,000 pure silver tiles.", "transport": "Tuk-tuk / Walk", "cost": "$10", "cost_usd": 10.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "10:45 AM - 12:15 PM", "title": "National Museum of Cambodia", "description": "World's largest collection of pre-Angkorian and Angkorian bronze and stone sculptures.", "transport": "Walk", "cost": "$10", "cost_usd": 10.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "03:00 PM - 05:00 PM", "title": "Wat Phnom & Central Market (Phsar Thmey)", "description": "Founding hill of Phnom Penh followed by shopping under the Art Deco dome.", "transport": "Tuk-tuk", "cost": "$1", "cost_usd": 1.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "05:30 PM - 07:00 PM", "title": "Mekong Sunset River Cruise", "description": "Boat cruise along the confluence of the Tonle Sap and Mekong rivers.", "transport": "Boat", "cost": "$5", "cost_usd": 5.0, "duration": "1.5 hours", "duration_minutes": 90}
                ]
            },
            {
                "day": 2,
                "theme": "History, Remembrance & Russian Market" if not is_km else "សារមន្ទីរប្រវត្តិសាស្ត្រ និងផ្សាររុស្ស៊ី",
                "location": "Phnom Penh",
                "activities": [
                    {"time": "08:30 AM - 11:00 AM", "title": "Tuol Sleng Genocide Museum (S-21)", "description": "Historic memorial and documentation centre with comprehensive audio guide.", "transport": "PassApp", "cost": "$5 ($10 with audio)", "cost_usd": 10.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "11:30 AM - 01:30 PM", "title": "Choeung Ek Genocidal Center", "description": "Memorial stupa containing commemorative exhibits and peaceful orchard grounds.", "transport": "Tuk-tuk", "cost": "$6 with audio", "cost_usd": 6.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "02:30 PM - 04:30 PM", "title": "Russian Market (Phsar Toul Tom Poung)", "description": "Bustling market for silk, handicrafts, antiques, and local iced coffee.", "transport": "Tuk-tuk", "cost": "Free admission", "cost_usd": 0.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "06:00 PM - 09:00 PM", "title": "Bassac Lane Dining & Social", "description": "Trendy alleyway lined with boutique bistros, craft cocktails, and live acoustic music.", "transport": "Tuk-tuk", "cost": "$8 - $18", "cost_usd": 12.0, "duration": "3 hours", "duration_minutes": 180}
                ]
            },
            {
                "day": 3,
                "theme": "Silk Island (Koh Dach) & Wildlife Sanctuary" if not is_km else "កោះដាច់ (កោះសូត្រ) និងមជ្ឈមណ្ឌលសង្គ្រោះសត្វព្រៃភ្នំតាម៉ៅ",
                "location": "Phnom Penh Outskirts",
                "activities": [
                    {"time": "08:30 AM - 12:30 PM", "title": "Koh Dach Silk Island Half-Day Tour", "description": "Scenic ferry ride to rural island weavers producing hand-spun Cambodian raw silk scarves.", "transport": "Ferry + Tuk-tuk", "cost": "$1 ferry + $5 tuk-tuk", "cost_usd": 6.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "01:30 PM - 04:30 PM", "title": "Phnom Tamao Wildlife Rescue Centre", "description": "Protected sanctuary housing rescued Asian sun bears, elephants, and leopards.", "transport": "Taxi / Car", "cost": "$5 ticket", "cost_usd": 5.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "05:30 PM - 07:30 PM", "title": "Sunset Walk along Sisowath Quay", "description": "Vibrant river promenade with local street eats, fresh coconut, and evening breezes.", "transport": "Walk", "cost": "Free", "cost_usd": 0.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "08:00 PM - 10:00 PM", "title": "Phnom Penh Night Market (Phsar Reatrey)", "description": "Open-air market with carpet seating for street food and live Cambodian music.", "transport": "Tuk-tuk", "cost": "$3 - $6", "cost_usd": 5.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            },
            {
                "day": 4,
                "theme": "Oudong Ancient Royal Capital & Stupas" if not is_km else "ភ្នំព្រះរាជទ្រព្យ (ភ្នំឧដុង្គ) និងវត្តពុទ្ធសាសនា",
                "location": "Oudong, Kandal",
                "activities": [
                    {"time": "08:30 AM - 12:30 PM", "title": "Oudong Mountain Stupas & Royal Tombs", "description": "Climb 509 steps to the hilltop stupas housing royal remains with panoramic countryside views.", "transport": "Taxi / Tuk-tuk", "cost": "Free admission", "cost_usd": 0.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "01:00 PM - 02:30 PM", "title": "Traditional Khmer Roasted Chicken in Oudong", "description": "Famous roadside pavilions serving charcoal-roasted chicken with green mango pepper dip.", "transport": "Walk", "cost": "$6 - $12", "cost_usd": 8.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "03:30 PM - 05:30 PM", "title": "Vipassana Dhura Buddhist Meditation Centre", "description": "Spectacular modern jade stupa and peaceful Buddhist gardens.", "transport": "Tuk-tuk", "cost": "Free", "cost_usd": 0.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            }
        ]
        return plan

    def _build_coastal_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        plan = [
            {
                "day": 1,
                "theme": "Kampot River & Bokor National Park" if not is_km else "ភ្នំបូកគោ និងមាត់ព្រែកកំពត",
                "location": "Kampot",
                "activities": [
                    {"time": "08:30 AM - 01:00 PM", "title": "Bokor National Park Mountain Excursion", "description": "Drive up the scenic mountain road to see Old Catholic Church, Lok Yeay Mao, and Popokvil Waterfall.", "transport": "Scooter / Taxi", "cost": "Free admission", "cost_usd": 0.0, "duration": "4.5 hours", "duration_minutes": 270},
                    {"time": "02:30 PM - 05:00 PM", "title": "La Plantation Pepper Farm Tour", "description": "Guided tasting of world-famous black, red, and white GI Kampot peppercorns.", "transport": "Tuk-tuk", "cost": "Free tour", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "05:30 PM - 07:30 PM", "title": "Kampot River Sunset & Firefly Cruise", "description": "Relaxing boat cruise with stunning sunset views of Elephant Mountains.", "transport": "Boat", "cost": "$5", "cost_usd": 5.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "08:00 PM - 10:00 PM", "title": "Kampot Riverside Seafood Dining", "description": "Dine on grilled freshwater river prawns and Kampot black pepper squid.", "transport": "Walking", "cost": "$8 - $16", "cost_usd": 12.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            },
            {
                "day": 2,
                "theme": "Kep Crab Market & Rabbit Island (Koh Tonsay)" if not is_km else "ផ្សារក្តាមកែប និងកោះទន្សាយ",
                "location": "Kep",
                "activities": [
                    {"time": "08:30 AM - 12:30 PM", "title": "Koh Tonsay (Rabbit Island)", "description": "20-minute rustic boat ride to quiet shallow beaches and hammock lounges.", "transport": "Boat ($10 RT)", "cost": "$10", "cost_usd": 10.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "01:00 PM - 03:00 PM", "title": "Kep Crab Market (Phsar Kdam)", "description": "Feast on fresh swimming blue crab fried with fresh green Kampot pepper.", "transport": "Walk", "cost": "$8 - $15", "cost_usd": 12.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "03:30 PM - 05:30 PM", "title": "Kep National Park Jungle Trail", "description": "Scenic 8km loop walking trail through tropical rainforest.", "transport": "Foot", "cost": "$1", "cost_usd": 1.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "06:00 PM - 07:30 PM", "title": "Sailing Club Pier Sunset Drink", "description": "Watch the sunset over the Gulf of Thailand and Phu Quoc island horizon.", "transport": "Tuk-tuk", "cost": "$4 - $8", "cost_usd": 6.0, "duration": "1.5 hours", "duration_minutes": 90}
                ]
            },
            {
                "day": 3,
                "theme": "Kampong Trach Limestone Caves & Salt Fields" if not is_km else "ល្អាងភ្នំកំពង់ត្រាច និងស្រែអំបិលកំពត",
                "location": "Kampot Outskirts",
                "activities": [
                    {"time": "08:30 AM - 11:30 AM", "title": "Kampong Trach Water Cave & Mountain Shrines", "description": "Explore natural limestone karst caves with hidden swimming canyon pools.", "transport": "Tuk-tuk", "cost": "$1", "cost_usd": 1.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "01:30 PM - 04:00 PM", "title": "Kampot Salt Fields (Phsar Boeng)", "description": "See traditional sea salt harvesting pans reflecting like mirrors under the afternoon sun.", "transport": "Tuk-tuk", "cost": "Free", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "05:00 PM - 07:00 PM", "title": "Stand-Up Paddleboarding (SUP) on Green Loop", "description": "Paddle through serene mangrove waterways on the quiet Kampot river bend.", "transport": "Tuk-tuk", "cost": "$10", "cost_usd": 10.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            }
        ]
        return plan

    def _build_island_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        plan = [
            {
                "day": 1,
                "theme": "Koh Rong Long Set Beach & Plankton Glow" if not is_km else "ឆ្នេរខ្សាច់សកោះរ៉ុង និងពន្លឺផ្លុងតុងពេលយប់",
                "location": "Koh Rong Island",
                "activities": [
                    {"time": "09:00 AM - 10:30 AM", "title": "Speed Ferry to Koh Rong", "description": "High-speed modern catamaran transfer from Sihanoukville pier to Koh Rong Koh Touch.", "transport": "Speed Ferry", "cost": "$25 round-trip", "cost_usd": 25.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "11:00 AM - 04:00 PM", "title": "Long Set (4K) Beach Relaxation", "description": "Powder-soft white sand and crystal turquoise water perfect for swimming and sunbathing.", "transport": "Walking", "cost": "Free", "cost_usd": 0.0, "duration": "5 hours", "duration_minutes": 300},
                    {"time": "05:30 PM - 07:00 PM", "title": "Beachfront Sunset Cocktails", "description": "Watch twilight colors reflect across the open Gulf of Thailand.", "transport": "Walk", "cost": "$4 - $8", "cost_usd": 6.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "07:30 PM - 09:00 PM", "title": "Bioluminescent Plankton Night Swim", "description": "Night boat trip to witness glowing underwater starry plankton blooms in the sea.", "transport": "Boat", "cost": "$10", "cost_usd": 10.0, "duration": "1.5 hours", "duration_minutes": 90}
                ]
            },
            {
                "day": 2,
                "theme": "Coral Snorkeling Safari & Sok San Beach" if not is_km else "មុជទឹកមើលផ្កាថ្ម និងឆ្នេរសុខសាន្ត",
                "location": "Koh Rong Island",
                "activities": [
                    {"time": "09:00 AM - 01:00 PM", "title": "Coral Reef Snorkeling & Island Hopping", "description": "Snorkel among colorful corals and tropical fish around outer islets.", "transport": "Longtail Boat", "cost": "$15", "cost_usd": 15.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "02:00 PM - 06:00 PM", "title": "Sok San Beach Sunset Lounge", "description": "7km stretch of pristine white sand beach with panoramic sunset views.", "transport": "Water Taxi", "cost": "$5", "cost_usd": 5.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "07:00 PM - 08:30 PM", "title": "Fresh Seafood Beach BBQ", "description": "Freshly grilled red snapper, squid skewers, and coconut rice on the sand.", "transport": "Walk", "cost": "$8 - $15", "cost_usd": 12.0, "duration": "1.5 hours", "duration_minutes": 90}
                ]
            },
            {
                "day": 3,
                "theme": "Koh Rong Sanloem Day Excursion (Saracen Bay & Lazy Beach)" if not is_km else "ដំណើរកម្សាន្តកោះរ៉ុងសន្លឹម (ឆ្នេរសារ៉ាសេន និងឡាហ្ស៊ីប៊ីច)",
                "location": "Koh Rong Sanloem",
                "activities": [
                    {"time": "09:00 AM - 10:00 AM", "title": "Island Transfer Boat to Koh Rong Sanloem", "description": "Scenic 30-minute island-hopper boat transfer to tranquil Saracen Bay.", "transport": "Island Boat", "cost": "$10 RT", "cost_usd": 10.0, "duration": "1 hour", "duration_minutes": 60},
                    {"time": "10:30 AM - 02:00 PM", "title": "Saracen Bay Paddleboarding & Lagoon Swim", "description": "Calm, crystal-clear shallow lagoon ideal for paddleboarding and relaxing.", "transport": "Foot", "cost": "Free", "cost_usd": 0.0, "duration": "3.5 hours", "duration_minutes": 210},
                    {"time": "02:30 PM - 05:00 PM", "title": "Jungle Trail Walk to Lazy Beach", "description": "Peaceful 25-minute forest trek to golden-sand Lazy Beach on the western bay.", "transport": "Walking trail", "cost": "Free", "cost_usd": 0.0, "duration": "2.5 hours", "duration_minutes": 150},
                    {"time": "05:30 PM - 06:30 PM", "title": "Return Boat to Koh Rong Koh Touch", "description": "Scenic boat ride back to your main Koh Rong resort base.", "transport": "Boat", "cost": "Included in RT Ticket", "cost_usd": 0.0, "duration": "1 hour", "duration_minutes": 60}
                ]
            },
            {
                "day": 4,
                "theme": "Prek Svay Fishing Village & Mangrove Kayaking" if not is_km else "ភូមិនេសាទព្រែកស្វាយ និងជិះទូកកាយ៉ាក់ព្រៃកោងកាង",
                "location": "Northern Koh Rong",
                "activities": [
                    {"time": "09:00 AM - 01:00 PM", "title": "Prek Svay Eco-Village & Mangrove River Kayaking", "description": "Paddle along quiet freshwater mangrove estuaries and meet traditional island fishing families.", "transport": "Longtail Boat", "cost": "$15", "cost_usd": 15.0, "duration": "4 hours", "duration_minutes": 240},
                    {"time": "02:00 PM - 05:00 PM", "title": "Pagoda Beach & Coconut Grove Relaxation", "description": "Tranquil secluded bay on eastern Koh Rong surrounded by coconut palm groves.", "transport": "Motorbike taxi", "cost": "$7", "cost_usd": 7.0, "duration": "3 hours", "duration_minutes": 180}
                ]
            }
        ]
        return plan

    def _build_battambang_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        return [
            {
                "day": 1,
                "theme": "Bamboo Train, Colonial Old Town & Bat Cave Sunset" if not is_km else "រថភ្លើងឫស្សី ផ្ទះបុរាណ និងរូងប្រចៀវភ្នំសំពៅ",
                "location": "Battambang",
                "activities": [
                    {"time": "08:30 AM - 10:30 AM", "title": "Battambang Bamboo Train (Norry)", "description": "Ride the unique motorized bamboo platform zipping through scenic rice paddies.", "transport": "Tuk-tuk", "cost": "$5 per person", "cost_usd": 5.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "11:00 AM - 01:00 PM", "title": "Wat Kor Heritage Village & French Colonial Old Town", "description": "Tour 100-year-old traditional Khmer wooden houses and French colonial shophouses.", "transport": "Tuk-tuk", "cost": "Free ($2 donation)", "cost_usd": 2.0, "duration": "2 hours", "duration_minutes": 120},
                    {"time": "03:30 PM - 06:30 PM", "title": "Phnom Sampov & Millions of Bats Exodus", "description": "Visit Killing Caves memorial and watch millions of bats spiral into the dusk sky.", "transport": "Tuk-tuk", "cost": "$3", "cost_usd": 3.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "07:30 PM - 09:30 PM", "title": "Phare Ponleu Selpak Circus Performance", "description": "Home of Cambodia's acclaimed performing arts school with live circus show.", "transport": "Tuk-tuk", "cost": "$14", "cost_usd": 14.0, "duration": "2 hours", "duration_minutes": 120}
                ]
            },
            {
                "day": 2,
                "theme": "Ek Phnom & Banan Temple Countryside Tour" if not is_km else "ប្រាសាទឯកភ្នំ និងប្រាសាទបាណន់",
                "location": "Battambang",
                "activities": [
                    {"time": "08:30 AM - 11:30 AM", "title": "Prasat Banan (Mini Angkor Wat of the South)", "description": "Climb 358 stone steps to 11th-century mountain temple with panoramic valley vistas.", "transport": "Tuk-tuk", "cost": "$3", "cost_usd": 3.0, "duration": "3 hours", "duration_minutes": 180},
                    {"time": "12:00 PM - 01:30 PM", "title": "Local Winery & Rice Paper Village", "description": "Taste local Battambang grape wine and watch artisans make spring roll rice paper.", "transport": "Tuk-tuk", "cost": "$2", "cost_usd": 2.0, "duration": "1.5 hours", "duration_minutes": 90},
                    {"time": "03:00 PM - 05:30 PM", "title": "Wat Ek Phnom 11th-Century Ruins", "description": "Explore ancient atmospheric sandstone towers next to a colossal modern Buddha statue.", "transport": "Tuk-tuk", "cost": "$2", "cost_usd": 2.0, "duration": "2.5 hours", "duration_minutes": 150}
                ]
            }
        ]

    def _build_grand_cambodia_itinerary(self, days: int, is_km: bool) -> List[Dict[str, Any]]:
        sr = self._build_siem_reap_itinerary(5, is_km)
        pp = self._build_phnom_penh_itinerary(4, is_km)
        coastal = self._build_coastal_itinerary(3, is_km)
        island = self._build_island_itinerary(3, is_km)
        
        combined = []
        if days <= 3:
            combined = sr[:3]
        elif days <= 5:
            combined = sr[:3] + pp[:2]
        elif days <= 7:
            combined = sr[:3] + pp[:2] + coastal[:2]
        else:
            combined = sr[:3] + pp[:2] + coastal[:2] + island[:2]
            
        for idx, day in enumerate(combined[:days]):
            day["day"] = idx + 1
        return combined[:days]

itinerary_engine = ItineraryEngine()
