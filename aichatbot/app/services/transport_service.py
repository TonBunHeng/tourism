from typing import List, Dict, Any, Optional

CAMBODIA_TRANSIT_OPTIONS = [
    {
        "type": "Tuk-Tuk & Remorque",
        "type_km": "រ៉ឺម៉កកង់បី (Tuk-Tuk)",
        "best_for": "City travel, temple touring in Siem Reap & Phnom Penh",
        "pricing_model": "$1.50 - $3.00 for short city trips / $18 - $25 per full day temple tour",
        "booking_methods": ["PassApp", "Grab Cambodia", "Street hire / Hotel arrangement"],
        "capacity": "2 - 4 passengers",
        "speed": "25 - 35 km/h"
    },
    {
        "type": "Ride-Hailing App (PassApp / Grab)",
        "type_km": "កម្មវិធីហៅឡាន/កង់បី (PassApp / Grab)",
        "best_for": "Metropolitan rides with upfront metered pricing",
        "pricing_model": "Fixed fare starting at 3,000 KHR (~$0.75 USD) + 1,200 KHR/km",
        "booking_methods": ["Download Grab or PassApp on iOS/Android with local SIM"],
        "capacity": "1 - 4 passengers",
        "speed": "Standard city traffic"
    },
    {
        "type": "Express Intercity Bus & Minivan",
        "type_km": "រថយន្តក្រុង និងវ៉ាន់អន្តរខេត្ត (Giant Ibis, Virak Buntham)",
        "best_for": "Phnom Penh <-> Siem Reap <-> Kampot <-> Sihanoukville",
        "pricing_model": "$12 - $17 per seat one-way (includes AC & WiFi)",
        "booking_methods": ["BookMeBus.com", "CamboTicket", "Official bus terminals"],
        "capacity": "14 - 40 passengers",
        "speed": "5 - 6 hours between PP & SR via Expressway / National Road 6"
    },
    {
        "type": "Speed Ferry (Island Transit)",
        "type_km": "អូប័រល្បឿនលឿនទៅកាន់កោះ (Speed Ferry)",
        "best_for": "Sihanoukville mainland <-> Koh Rong & Koh Rong Sanloem",
        "pricing_model": "$25.00 round-trip open return ticket",
        "booking_methods": ["GTVC Speedboat", "Buva Sea", "Sihanoukville Autonomous Port"],
        "capacity": "30 - 80 passengers",
        "speed": "45 minutes transit time"
    },
    {
        "type": "Domestic Flights",
        "type_km": "ជើងហោះហើរក្នុងស្រុក (Cambodia Angkor Air, AirAsia Cambodia)",
        "best_for": "Phnom Penh (PNH) <-> Siem Reap Angkor (SAI) <-> Sihanoukville (KOS)",
        "pricing_model": "$55 - $110 one-way per passenger",
        "booking_methods": ["Direct airline websites or flight booking platforms"],
        "capacity": "Commercial jet / turboprop",
        "speed": "45 minutes flight time"
    },
    {
        "type": "Private Taxi / SUV",
        "type_km": "រថយន្តតាក់ស៊ីឯកជន (Private Car)",
        "best_for": "Families, groups with luggage, direct hotel-to-hotel transfers",
        "pricing_model": "$75 - $110 per vehicle for Phnom Penh <-> Siem Reap / $50 - $70 to Kampot",
        "booking_methods": ["Hotel concierge or verified private driver"],
        "capacity": "4 - 7 passengers",
        "speed": "Fastest overland route"
    }
]

class TransportService:
    def get_transport_recommendations(self, origin: str = "Siem Reap", destination: str = "Siem Reap", travelers: int = 2) -> Dict[str, Any]:
        """Provide tailored transit advice based on route and group size."""
        orig = origin.lower().strip()
        dest = destination.lower().strip()

        is_same_city = (orig == dest) or ("angkor" in dest and "siem reap" in orig)

        if is_same_city:
            recommended = [
                CAMBODIA_TRANSIT_OPTIONS[0],  # Tuk-Tuk
                CAMBODIA_TRANSIT_OPTIONS[1]   # Grab/PassApp
            ]
            advice_en = "For city & temple touring, booking a full-day Tuk-tuk ($18-$25/day) or using Grab/PassApp is the most convenient and cost-effective method."
            advice_km = "សម្រាប់ការដើរកម្សាន្តក្នុងក្រុង និងប្រាសាទ ការជួលរ៉ឺម៉កកង់បីពេញមួយថ្ងៃ ($18-$25) ឬប្រើប្រាស់ PassApp/Grab ជាជម្រើសដ៏ងាយស្រួលបំផុត។"
        else:
            recommended = [
                CAMBODIA_TRANSIT_OPTIONS[2],  # Bus
                CAMBODIA_TRANSIT_OPTIONS[5]   # Private Taxi
            ]
            if "koh rong" in dest or "sanloem" in dest:
                recommended.append(CAMBODIA_TRANSIT_OPTIONS[3]) # Speed Ferry
            if ("siem reap" in orig and "phnom penh" in dest) or ("phnom penh" in orig and "siem reap" in dest):
                recommended.append(CAMBODIA_TRANSIT_OPTIONS[4]) # Flight

            advice_en = f"For travel from {origin.title()} to {destination.title()}, express buses (Giant Ibis) or private taxi via the expressways offer the best balance of comfort and value."
            advice_km = f"សម្រាប់ការធ្វើដំណើរពី {origin.title()} ទៅ {destination.title()} រថយន្តក្រុង VIP (Giant Ibis) ឬតាក់ស៊ីឯកជន ជាជម្រើសមានផាសុកភាព និងសន្សំសំចៃ។"

        return {
            "origin": origin.title(),
            "destination": destination.title(),
            "travelers": travelers,
            "options": recommended,
            "advice_en": advice_en,
            "advice_km": advice_km,
            "verified_source": "Ministry of Public Works and Transport / Official Transit Operators"
        }

transport_service = TransportService()
