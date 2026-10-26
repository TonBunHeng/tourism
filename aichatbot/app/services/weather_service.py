import requests
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.cache_service import cache_service

# Coordinates for Cambodian provinces and key tourist centers
CAMBODIA_COORDINATES = {
    "siem reap": {"lat": 13.3633, "lon": 103.8564, "name": "Siem Reap", "name_km": "សៀមរាប"},
    "phnom penh": {"lat": 11.5564, "lon": 104.9282, "name": "Phnom Penh", "name_km": "ភ្នំពេញ"},
    "preah sihanouk": {"lat": 10.6275, "lon": 103.5221, "name": "Preah Sihanouk", "name_km": "ព្រះសីហនុ"},
    "sihanoukville": {"lat": 10.6275, "lon": 103.5221, "name": "Preah Sihanouk", "name_km": "ព្រះសីហនុ"},
    "koh rong": {"lat": 10.7247, "lon": 103.2389, "name": "Koh Rong", "name_km": "កោះរ៉ុង"},
    "kampot": {"lat": 10.6104, "lon": 104.1818, "name": "Kampot", "name_km": "កំពត"},
    "kep": {"lat": 10.4828, "lon": 104.2944, "name": "Kep", "name_km": "កែប"},
    "battambang": {"lat": 13.0957, "lon": 103.2022, "name": "Battambang", "name_km": "បាត់ដំបង"},
    "mondulkiri": {"lat": 12.4558, "lon": 107.1881, "name": "Mondulkiri", "name_km": "មណ្ឌលគិរី"},
    "ratanakiri": {"lat": 13.7333, "lon": 106.9833, "name": "Ratanakiri", "name_km": "រតនគិរី"},
    "preah vihear": {"lat": 14.3908, "lon": 104.6800, "name": "Preah Vihear", "name_km": "ព្រះវិហារ"},
    "koh kong": {"lat": 11.6153, "lon": 102.9838, "name": "Koh Kong", "name_km": "កោះកុង"},
    "kampong thom": {"lat": 12.7111, "lon": 104.8887, "name": "Kampong Thom", "name_km": "កំពង់ធំ"},
    "kampong cham": {"lat": 11.9924, "lon": 105.4645, "name": "Kampong Cham", "name_km": "កំពង់ចាម"},
    "pursat": {"lat": 12.5388, "lon": 103.9192, "name": "Pursat", "name_km": "ពោធិ៍សាត់"},
    "kratie": {"lat": 12.4881, "lon": 106.0188, "name": "Kratie", "name_km": "ក្រចេះ"},
    "stung treng": {"lat": 13.5259, "lon": 105.9683, "name": "Stung Treng", "name_km": "ស្ទឹងត្រែង"}
}

WMO_WEATHER_CODES = {
    0: ("Clear sky", "មេឃស្រឡះល្អ"),
    1: ("Mainly clear", "មេឃស្រឡះភាគច្រើន"),
    2: ("Partly cloudy", "មានពពកខ្លះៗ"),
    3: ("Overcast", "មេឃស្រទុំ"),
    45: ("Foggy", "មានអ័ព្ទ"),
    48: ("Depositing rime fog", "មានអ័ព្ទក្រាស់"),
    51: ("Light drizzle", "មានភ្លៀងរលឹមស្រិចៗ"),
    53: ("Moderate drizzle", "មានភ្លៀងរលឹមបង្គួរ"),
    55: ("Dense drizzle", "ភ្លៀងរលឹមខ្លាំង"),
    61: ("Slight rain", "មានភ្លៀងធ្លាក់តិចៗ"),
    63: ("Moderate rain", "មានភ្លៀងធ្លាក់បង្គួរ"),
    65: ("Heavy rain", "មានភ្លៀងធ្លាក់ខ្លាំង"),
    80: ("Slight rain showers", "មានភ្លៀងមេឃរលឹមខ្លះៗ"),
    81: ("Moderate rain showers", "មានភ្លៀងធ្លាក់ខ្លាំងមួយមេ"),
    82: ("Violent rain showers", "មានភ្លៀងខ្យល់កន្ត្រាក់ខ្លាំង"),
    95: ("Thunderstorm", "មានផ្គររន្ទះ និងភ្លៀង"),
    96: ("Thunderstorm with slight hail", "មានផ្គររន្ទះ និងព្រឹលធ្លាក់តិចតួច")
}

class WeatherService:
    def get_weather(self, province: str = "Siem Reap", days: int = 3) -> Dict[str, Any]:
        """
        Fetch real-time weather and forecast for any Cambodian province.
        Uses live Open-Meteo API with cache fallback.
        """
        prov_clean = (province or "Siem Reap").lower().strip()
        loc_info = CAMBODIA_COORDINATES.get(prov_clean)
        
        if not loc_info:
            for k, v in CAMBODIA_COORDINATES.items():
                if k in prov_clean or prov_clean in k:
                    loc_info = v
                    break
        if not loc_info:
            loc_info = CAMBODIA_COORDINATES["siem reap"]

        cache_key = f"weather_{loc_info['name'].lower()}_{days}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        # 1. Try Live Open-Meteo API with timeout
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={loc_info['lat']}&longitude={loc_info['lon']}"
                f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation"
                f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
                f"&timezone=Asia%2FBangkok&forecast_days={min(max(days, 1), 7)}"
            )
            res = requests.get(url, timeout=4)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                daily = data.get("daily", {})
                
                code = current.get("weather_code", 0)
                cond_en, cond_km = WMO_WEATHER_CODES.get(code, ("Partly cloudy", "មានពពកខ្លះៗ"))
                temp_c = round(current.get("temperature_2m", 30.0), 1)
                humidity = current.get("relative_humidity_2m", 70)
                wind_spd = current.get("wind_speed_10m", 10.0)
                
                forecast = []
                dates = daily.get("time", [])
                max_temps = daily.get("temperature_2m_max", [])
                min_temps = daily.get("temperature_2m_min", [])
                rain_probs = daily.get("precipitation_probability_max", [])
                weather_codes = daily.get("weather_code", [])
                
                for i in range(len(dates)):
                    w_code = weather_codes[i] if i < len(weather_codes) else 0
                    c_en, c_km = WMO_WEATHER_CODES.get(w_code, ("Clear", "ស្រឡះ"))
                    forecast.append({
                        "date": dates[i],
                        "max_temp_c": max_temps[i] if i < len(max_temps) else temp_c,
                        "min_temp_c": min_temps[i] if i < len(min_temps) else 24.0,
                        "rain_probability": rain_probs[i] if i < len(rain_probs) else 20,
                        "condition": c_en,
                        "condition_km": c_km
                    })

                rain_today = rain_probs[0] if rain_probs else 20
                travel_suitability, advice_en, advice_km = self._evaluate_travel_conditions(temp_c, rain_today, code)

                result = {
                    "province": loc_info["name"],
                    "province_km": loc_info["name_km"],
                    "latitude": loc_info["lat"],
                    "longitude": loc_info["lon"],
                    "current": {
                        "temperature_c": temp_c,
                        "temperature_f": round(temp_c * 9/5 + 32, 1),
                        "humidity_percent": humidity,
                        "wind_speed_kmh": wind_spd,
                        "condition": cond_en,
                        "condition_km": cond_km,
                        "weather_code": code,
                        "rain_probability": rain_today
                    },
                    "forecast": forecast,
                    "travel_suitability": travel_suitability,
                    "travel_advice_en": advice_en,
                    "travel_advice_km": advice_km,
                    "is_real_time": True,
                    "source": "Open-Meteo WMO Real-Time Meteorological Service"
                }

                cache_service.set(cache_key, result, ttl_seconds=settings.CACHE_TTL_WEATHER, source="Open-Meteo")
                return result
        except Exception as e:
            print(f"WeatherService: Live API failed ({e}), checking cached records.")

        # 2. Check for any previous cached data
        fallback_cache = cache_service.get(f"weather_{loc_info['name'].lower()}_3")
        if fallback_cache:
            fallback_cache["is_real_time"] = False
            fallback_cache["source"] = "Cached Weather Data (Offline)"
            return fallback_cache

        # 3. Grounded Seasonal Baseline (Explicitly labeled as Historical Norm)
        return self._get_seasonal_norms(loc_info)

    def _evaluate_travel_conditions(self, temp_c: float, rain_prob: int, code: int) -> tuple:
        """Provide intelligent travel advisory based on temperature and rain risk."""
        if rain_prob >= 70 or code in [65, 81, 82, 95, 96]:
            return (
                "Caution (Rain / Shower Risk)",
                "High probability of rain showers. Great time for indoor museums, cafes, and spa treatments. Carry an umbrella or raincoat.",
                "មានឱកាសភ្លៀងធ្លាក់ច្រើន។ ស័ក្តិសមសម្រាប់ទស្សនាសារមន្ទីរ ហាងកាហ្វេ និងសកម្មភាពក្នុងម្លប់។ សូមត្រៀមឆត្រ ឬអាវភ្លៀង។"
            )
        elif temp_c >= 35:
            return (
                "Warm / Sunny",
                "High temperatures expected. Visit outdoor temples early morning (05:30 AM - 09:30 AM) and stay hydrated.",
                "អាកាសធាតុក្តៅខ្លាំង។ គួរទស្សនាប្រាសាទនៅពេលព្រឹកព្រលឹម និងទទួលទានទឹកឱ្យបានច្រើន។"
            )
        else:
            return (
                "Ideal for Sightseeing",
                "Pleasant sightseeing weather with excellent conditions for temple photography and outdoor exploration.",
                "អាកាសធាតុល្អប្រសើរសម្រាប់ការដើរកម្សាន្ត ថតរូប និងទស្សនាប្រាសាទបុរាណ។"
            )

    def _get_seasonal_norms(self, loc_info: Dict[str, Any]) -> Dict[str, Any]:
        """Grounded baseline seasonal norms when internet is unreachable."""
        return {
            "province": loc_info["name"],
            "province_km": loc_info["name_km"],
            "latitude": loc_info["lat"],
            "longitude": loc_info["lon"],
            "current": {
                "temperature_c": 31.0,
                "temperature_f": 87.8,
                "humidity_percent": 75,
                "wind_speed_kmh": 12.0,
                "condition": "Tropical Climate (Historical Seasonal Norm)",
                "condition_km": "អាកាសធាតុតំបន់ត្រូពិច",
                "weather_code": 2,
                "rain_probability": 30
            },
            "forecast": [
                {"date": "Day 1", "max_temp_c": 32, "min_temp_c": 24, "rain_probability": 30, "condition": "Partly cloudy", "condition_km": "មានពពកខ្លះៗ"},
                {"date": "Day 2", "max_temp_c": 31, "min_temp_c": 24, "rain_probability": 25, "condition": "Mainly clear", "condition_km": "មេឃស្រឡះភាគច្រើន"},
                {"date": "Day 3", "max_temp_c": 32, "min_temp_c": 25, "rain_probability": 35, "condition": "Warm", "condition_km": "កម្តៅបង្គួរ"}
            ],
            "travel_suitability": "Good for Travel (Seasonal Baseline)",
            "travel_advice_en": "Standard tropical climate. Bring sun protection, hats, and light breathable clothing.",
            "travel_advice_km": "អាកាសធាតុតំបន់ក្តៅសើមធម្មតា។ គួរពាក់មួកការពារកម្ដៅថ្ងៃ និងសម្លៀកបំពាក់ស្រាលៗ។",
            "is_real_time": False,
            "source": "Historical Cambodia Meteorological Norms (Offline Mode)"
        }

weather_service = WeatherService()
