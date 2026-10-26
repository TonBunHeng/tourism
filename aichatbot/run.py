import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting AI Tourism Information Chatbot API on {settings.HOST}:{settings.PORT} (AI_MODE={settings.AI_MODE})")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
