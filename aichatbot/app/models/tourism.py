from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Location(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TourismItem(BaseModel):
    id: str
    name: str
    name_km: Optional[str] = None
    province: Optional[str] = None
    province_km: Optional[str] = None
    category: Optional[str] = None
    description: str
    description_km: Optional[str] = None
    location: Optional[Location] = None
    best_time_to_visit: Optional[str] = None
    activities: Optional[List[str]] = []
    nearby_places: Optional[List[str]] = []
    estimated_duration: Optional[str] = None
    travel_tips: Optional[List[str]] = []
    tags: Optional[List[str]] = []
