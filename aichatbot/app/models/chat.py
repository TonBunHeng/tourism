from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of message sender: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")

class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Unique conversation session ID")
    message: str = Field(..., min_length=1, max_length=4000, description="User question or prompt")
    language: Optional[str] = Field(None, description="Preferred language code ('km', 'en')")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Optional list of prior conversation messages")
    attachments: Optional[List[Dict[str, Any]]] = Field(None, description="Optional list of file or image attachments")

class SearchQuery(BaseModel):
    query: str = Field(..., description="Search keyword or question")
    category: Optional[str] = Field(None, description="Filter category (e.g. 'Heritage', 'Beach', 'Food')")
    province: Optional[str] = Field(None, description="Filter province (e.g. 'Siem Reap')")
    limit: Optional[int] = Field(10, description="Number of results to return")

class SummaryRequest(BaseModel):
    topic: str = Field(..., description="Destination or topic to summarize")
    language: Optional[str] = Field("km", description="Target language ('km' or 'en')")

class RecommendationRequest(BaseModel):
    interests: Optional[List[str]] = Field(default=[], description="User travel interests (e.g. ['history', 'temples', 'beach'])")
    province: Optional[str] = Field(None, description="Target Cambodian province")
    budget_usd: Optional[float] = Field(None, description="Total budget in USD")
    duration_days: Optional[int] = Field(None, description="Travel duration in days")
    travel_style: Optional[str] = Field("culture", description="Travel style: 'budget', 'comfort', 'luxury', 'culture', 'nature'")
    limit: Optional[int] = Field(5, description="Number of recommendations to return")

class ItineraryRequest(BaseModel):
    destination: Optional[str] = Field("Siem Reap", description="Primary destination or 'Cambodia'")
    days: Optional[int] = Field(3, ge=1, le=14, description="Trip duration in days (1 to 14)")
    budget: Optional[float] = Field(None, description="Estimated total budget in USD")
    travel_style: Optional[str] = Field("culture", description="Style of travel")
    interests: Optional[List[str]] = Field(default=["culture", "history"], description="List of user interests")
    travelers: Optional[int] = Field(2, ge=1, description="Number of travelers")
    language: Optional[str] = Field("en", description="Output language ('en' or 'km')")

class CurrencyConvertRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to convert")
    from_currency: Optional[str] = Field("USD", description="Source currency ('USD' or 'KHR')")
    to_currency: Optional[str] = Field("KHR", description="Target currency ('KHR' or 'USD')")
