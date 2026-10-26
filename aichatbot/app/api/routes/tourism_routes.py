from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.tourism_service import tourism_service
from app.services.weather_service import weather_service
from app.services.currency_service import currency_service
from app.services.events_service import events_service
from app.services.places_service import places_service
from app.services.transport_service import transport_service
from app.services.recommendation_engine import recommendation_engine
from app.services.itinerary_engine import itinerary_engine
from app.core.config import settings
from app.models.chat import RecommendationRequest, ItineraryRequest, CurrencyConvertRequest

router = APIRouter(tags=["Tourism Intelligence & Data"])

# 1. Recommendation API
@router.post("/recommendations")
@router.post("/travel/recommendations")
async def get_recommendations(req: RecommendationRequest):
    """Calculate multi-factor smart recommendations for Cambodia destinations."""
    try:
        results = recommendation_engine.recommend(
            interests=req.interests,
            province=req.province,
            budget_usd=req.budget_usd,
            duration_days=req.duration_days,
            travel_style=req.travel_style,
            limit=req.limit or 5
        )
        return {
            "success": True,
            "message": f"Generated {len(results)} personalized recommendations.",
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Itinerary Planning API
@router.post("/itineraries")
@router.post("/travel/itineraries")
async def generate_itinerary(req: ItineraryRequest):
    """Generate route-optimized day-by-day travel itinerary with budget breakdown."""
    try:
        result = itinerary_engine.generate_itinerary(
            destination=req.destination or "Siem Reap",
            days=req.days or 3,
            budget_usd=req.budget,
            travel_style=req.travel_style or "culture",
            interests=req.interests,
            travelers=req.travelers or 2,
            language=req.language or "en"
        )
        return {
            "success": True,
            "message": "Itinerary generated successfully.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Places API
@router.get("/places")
@router.get("/tourist-places")
@router.get("/travel/places")
async def get_places(category: Optional[str] = None, province: Optional[str] = None):
    """List all verified tourism destinations, temples, and beaches."""
    places = places_service.get_all_places(category=category, province=province)
    return {
        "success": True,
        "message": "Places retrieved successfully.",
        "total": len(places),
        "data": places
    }

@router.get("/hotels")
async def get_hotels(province: Optional[str] = None):
    """List verified hotels and accommodations."""
    hotels = places_service.get_all_places(category="Hotel", province=province)
    return {
        "success": True,
        "message": "Hotels retrieved successfully.",
        "total": len(hotels),
        "data": hotels
    }

@router.get("/restaurants")
async def get_restaurants(province: Optional[str] = None):
    """List verified restaurants and dining places."""
    restaurants = places_service.get_all_places(category="Restaurant", province=province)
    return {
        "success": True,
        "message": "Restaurants retrieved successfully.",
        "total": len(restaurants),
        "data": restaurants
    }

# 4. Nearby Places API (must be declared BEFORE /places/{place_id} to avoid route shadowing)
@router.get("/nearby")
@router.get("/places/nearby")
async def get_nearby_places(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    max_distance_km: float = Query(25.0, description="Max search radius in km"),
    limit: int = Query(6, description="Limit results")
):
    """Find nearby attractions and activities sorted by real distance."""
    nearby = places_service.find_nearby_places(lat=lat, lon=lon, max_distance_km=max_distance_km, limit=limit)
    return {
        "success": True,
        "message": f"Found {len(nearby)} places within {max_distance_km}km.",
        "data": nearby
    }

@router.get("/places/{place_id}")
async def get_place_by_id(place_id: str):
    """Get verified details for a specific place."""
    place = places_service.get_place_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found in Cambodia tourism database.")
    return {
        "success": True,
        "message": "Place details retrieved successfully.",
        "data": place
    }

# 5. Real-Time Weather API
@router.get("/weather")
@router.get("/travel/weather")
async def get_weather(
    province: str = Query("Siem Reap", description="Cambodian province name"),
    days: int = Query(3, ge=1, le=7, description="Forecast days")
):
    """Get live weather, forecast, and travel suitability advice for any province."""
    try:
        weather_data = weather_service.get_weather(province=province, days=days)
        return {
            "success": True,
            "message": f"Weather retrieved for {weather_data['province']}.",
            "data": weather_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Verified Events API
@router.get("/events")
@router.get("/travel/events")
async def get_events(
    query: Optional[str] = None,
    province: Optional[str] = None,
    month: Optional[str] = None
):
    """Retrieve verified Cambodian festivals and events."""
    events_data = events_service.search_events(query=query, province=province, month=month)
    return {
        "success": True,
        "message": events_data["message"],
        "total": events_data["total"],
        "data": events_data.get("events", [])
    }

# 7. Currency & Budget API
@router.get("/currency")
@router.get("/travel/currency")
async def get_currency_rate():
    """Get current USD <-> KHR reference exchange rate."""
    rate_data = currency_service.get_exchange_rate()
    return {
        "success": True,
        "message": "Currency exchange rate retrieved.",
        "data": rate_data
    }

@router.post("/currency/convert")
async def convert_currency(req: CurrencyConvertRequest):
    """Convert amount between USD and KHR."""
    result = currency_service.convert(req.amount, req.from_currency or "USD", req.to_currency or "KHR")
    return {
        "success": True,
        "message": "Currency converted successfully.",
        "data": result
    }

# 8. Transportation Options API
@router.get("/transport")
@router.get("/travel/transport")
async def get_transport_options(
    origin: str = Query("Siem Reap", description="Origin city"),
    destination: str = Query("Siem Reap", description="Destination city"),
    travelers: int = Query(2, ge=1, description="Number of passengers")
):
    """Get tailored Cambodian transit options, pricing, and tips."""
    transit_data = transport_service.get_transport_recommendations(origin=origin, destination=destination, travelers=travelers)
    return {
        "success": True,
        "message": "Transport recommendations retrieved.",
        "data": transit_data
    }

# 9. System & AI Status APIs
@router.get("/system/status")
@router.get("/ai/status")
async def get_ai_system_status():
    """Check availability of AI models (Gemini Online) and data sources in pure online mode."""
    has_gemini_key = bool(settings.effective_gemini_api_key)
    
    return {
        "success": True,
        "system": "Angkor Verse AI",
        "active_mode": "online",
        "providers": {
            "online_gemini": {
                "provider": "Google Gemini",
                "model": settings.effective_online_model,
                "configured": has_gemini_key,
                "status": "ready" if has_gemini_key else "missing_api_key"
            }
        },
        "data_services": {
            "tourism_database": "ready",
            "weather_service": "ready",
            "currency_service": "ready",
            "events_service": "ready",
            "places_service": "ready",
            "transport_service": "ready"
        }
    }
