import time
from typing import Optional, List, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class StandardDataPayload(BaseModel):
    type: str = "general"
    content: Optional[Any] = None
    location: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ChatResponseData(BaseModel):
    # Standard Fields
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    language: str = "en"
    mode: str = "online"
    provider: str = "gemini"
    intent: str = "general_qa"
    confidence: float = 0.95
    message: str = ""
    answer: str = ""  # Backwards compatibility alias for React frontend
    model: Optional[str] = "gemini-flash-latest"
    data: Optional[Dict[str, Any]] = None
    sources: List[Dict[str, Any]] = []
    timestamp: Optional[str] = None
    
    # React Frontend & Mobile Compatibility Fields
    data_sources: Optional[List[str]] = []
    related_places: List[Dict[str, Any]] = []
    suggestions: List[str] = []
    weather: Optional[Dict[str, Any]] = None
    currency: Optional[Dict[str, Any]] = None
    itinerary: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    is_matched: Optional[bool] = False
    similarity_score: Optional[float] = 0.0

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    mode: Optional[str] = "online"
    provider: Optional[str] = "gemini"
    intent: Optional[str] = "general_qa"
    confidence: Optional[float] = 0.95
    message: str = "Operation successful."
    data: Optional[T] = None
    sources: Optional[List[Dict[str, Any]]] = []
    timestamp: Optional[str] = None
    error: Optional[str] = None
    errors: Optional[Any] = None
