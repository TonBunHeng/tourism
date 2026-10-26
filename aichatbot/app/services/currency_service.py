import time
import requests
from typing import Dict, Any, Optional
from app.core.config import settings
from app.services.cache_service import cache_service

DEFAULT_USD_TO_KHR = 4100.0  # Official baseline reference rate

class CurrencyService:
    def get_exchange_rate(self) -> Dict[str, Any]:
        """
        Fetch real-time USD <-> KHR exchange rate with TTL caching and offline fallback.
        """
        cached = cache_service.get("exchange_rate_usd_khr")
        if cached:
            return cached

        # 1. Try Live Exchange Rate API
        try:
            url = "https://open.er-api.com/v6/latest/USD"
            res = requests.get(url, timeout=2)
            rate = DEFAULT_USD_TO_KHR
            is_live = False
            if res.status_code == 200:
                data = res.json()
                rates = data.get("rates", {})
                if "KHR" in rates and rates["KHR"] > 3000:
                    rate = round(float(rates["KHR"]), 0)
                    is_live = True
            timestamp_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            result = {
                "base_currency": "USD",
                "target_currency": "KHR",
                "exchange_rate": rate,
                "formatted_rate": f"1 USD = {rate:,.0f} KHR",
                "is_real_time": is_live,
                "source": "Live Exchange Rate Feed" if is_live else "National Bank of Cambodia Standard Reference Rate",
                "timestamp": timestamp_str,
                "last_updated": timestamp_str
            }
            cache_service.set("exchange_rate_usd_khr", result, ttl_seconds=settings.CACHE_TTL_CURRENCY, source="Live" if is_live else "NBC")
            return result
        except Exception as e:
            print(f"CurrencyService note: {e}")

        # 2. Offline Fallback
        timestamp_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return {
            "base_currency": "USD",
            "target_currency": "KHR",
            "exchange_rate": DEFAULT_USD_TO_KHR,
            "formatted_rate": f"1 USD = {DEFAULT_USD_TO_KHR:,.0f} KHR (Cached Baseline)",
            "is_real_time": False,
            "source": "National Bank of Cambodia Official Baseline",
            "timestamp": timestamp_str,
            "last_updated": timestamp_str
        }

    def convert(self, amount: float, from_curr: str = "USD", to_curr: str = "KHR") -> Dict[str, Any]:
        """
        Deterministic currency conversion calculation with full metadata.
        """
        rate_info = self.get_exchange_rate()
        rate = rate_info["exchange_rate"]
        timestamp_str = rate_info.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        f_curr = (from_curr or "USD").upper().strip()
        t_curr = (to_curr or "KHR").upper().strip()

        if f_curr == "USD" and t_curr in ["KHR", "RIEL"]:
            converted = amount * rate
            return {
                "from": "USD",
                "to": "KHR",
                "amount": amount,
                "rate": rate,
                "result": round(converted, 0),
                "formatted": f"${amount:,.2f} USD = {converted:,.0f} KHR",
                "source": rate_info["source"],
                "timestamp": timestamp_str
            }
        elif f_curr in ["KHR", "RIEL"] and t_curr == "USD":
            converted = amount / rate
            return {
                "from": "KHR",
                "to": "USD",
                "amount": amount,
                "rate": rate,
                "result": round(converted, 2),
                "formatted": f"{amount:,.0f} KHR = ${converted:,.2f} USD",
                "source": rate_info["source"],
                "timestamp": timestamp_str
            }
        else:
            return {
                "from": f_curr,
                "to": t_curr,
                "amount": amount,
                "rate": 1.0,
                "result": amount,
                "formatted": f"{amount} {f_curr}",
                "source": "Direct 1:1",
                "timestamp": timestamp_str
            }

    def estimate_travel_budget(self, days: int = 3, travelers: int = 1, style: str = "medium") -> Dict[str, Any]:
        """
        Deterministic calculation of realistic travel budget breakdown in Cambodia.
        """
        st = (style or "medium").lower().strip()
        if "budget" in st or "backpacker" in st:
            daily_hotel = 15.0
            daily_food = 10.0
            daily_transport = 8.0
            daily_activities = 12.0
            tier_name = "Backpacker / Budget Friendly"
            tier_km = "កម្រិតសន្សំសំចៃ"
        elif "luxury" in st or "high-end" in st or "resort" in st:
            daily_hotel = 120.0
            daily_food = 50.0
            daily_transport = 35.0
            daily_activities = 40.0
            tier_name = "Luxury / Boutique Resort"
            tier_km = "កម្រិតប្រណីត"
        else:
            daily_hotel = 40.0
            daily_food = 20.0
            daily_transport = 15.0
            daily_activities = 20.0
            tier_name = "Comfort / Standard Travel"
            tier_km = "កម្រិតមធ្យមផាសុកភាព"

        total_hotel = daily_hotel * max(days - 1, 1)
        total_food = daily_food * days * travelers
        total_transport = daily_transport * days
        total_activities = daily_activities * days * travelers
        total_usd = total_hotel + total_food + total_transport + total_activities

        rate_info = self.get_exchange_rate()
        rate = rate_info["exchange_rate"]

        return {
            "days": days,
            "travelers": travelers,
            "tier": tier_name,
            "tier_km": tier_km,
            "currency": "USD",
            "breakdown_usd": {
                "accommodation": round(total_hotel, 2),
                "food_and_dining": round(total_food, 2),
                "local_transport": round(total_transport, 2),
                "sightseeing_and_tickets": round(total_activities, 2),
                "total_estimated_usd": round(total_usd, 2)
            },
            "total_estimated_khr": round(total_usd * rate, 0),
            "formatted_total": f"${total_usd:,.2f} USD (~{total_usd * rate:,.0f} KHR)",
            "exchange_rate_used": rate_info["formatted_rate"],
            "notes_en": "USD is accepted everywhere for major payments; small change is returned in Cambodian Riel (KHR).",
            "notes_km": "ប្រាក់ដុល្លារ (USD) អាចចាយបានគ្រប់ទីកន្លែង ហើយលុយអាប់នឹងទទួលបានជាប្រាក់រៀល (KHR)។"
        }

currency_service = CurrencyService()
