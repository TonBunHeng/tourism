from fastapi import APIRouter
from app.services.online.gemini_service import gemini_online_service
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def health_check():
    gemini_ok = gemini_online_service.is_available()
    return {
        "status": "healthy",
        "service": "Angkor Verse AI API",
        "ai_mode": "online",
        "active_mode": "online",
        "gemini_available": gemini_ok
    }
