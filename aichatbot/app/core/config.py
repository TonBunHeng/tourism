import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))

class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "Angkor Verse AI"
    APP_VERSION: str = "2.0.0"
    
    # AI Mode & Orchestration (Pure Online Mode)
    AI_MODE: str = "online"
    
    # Online AI Provider Configuration (Google Gemini)
    ONLINE_AI_PROVIDER: str = "gemini"
    ONLINE_AI_MODEL: str = "gemini-3.6-flash"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    ONLINE_API_KEY: str = ""
    ONLINE_MODEL: str = "gemini-3.6-flash"
    GEMINI_TIMEOUT_SECONDS: int = 15
    
    # Offline AI Provider Configuration (Ollama)
    OFFLINE_AI_PROVIDER: str = "ollama"
    OFFLINE_AI_MODEL: str = "Camtour-On-Mistral-Ai:latest"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "Camtour-On-Mistral-Ai:latest"
    OLLAMA_TIMEOUT_SECONDS: int = 30
    
    # External APIs
    WEATHER_API_KEY: str = ""
    MAPS_API_KEY: str = ""
    
    # RAG & Semantic Retrieval Configuration
    TOP_K: int = 4
    SIMILARITY_THRESHOLD: float = 0.75
    MAX_CONTEXT_LENGTH: int = 2500
    
    # Recommendation Scoring Weights
    REC_WEIGHT_INTEREST: float = 0.30
    REC_WEIGHT_LOCATION: float = 0.15
    REC_WEIGHT_BUDGET: float = 0.15
    REC_WEIGHT_DURATION: float = 0.15
    REC_WEIGHT_WEATHER: float = 0.10
    REC_WEIGHT_POPULARITY: float = 0.10
    REC_WEIGHT_ACCESSIBILITY: float = 0.05
    
    # Cache TTL (in seconds)
    CACHE_TTL_WEATHER: int = 3600         # 1 hour
    CACHE_TTL_CURRENCY: int = 43200       # 12 hours
    CACHE_TTL_EVENTS: int = 86400         # 24 hours
    CACHE_TTL_RECOMMENDATIONS: int = 1800 # 30 mins
    CACHE_TTL_PLACES: int = 3600          # 1 hour
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Rate Limiting & Security
    RATE_LIMIT_PER_MINUTE: int = 60
    MAX_MESSAGE_LENGTH: int = 2000
    
    # Directories & Database Paths
    BACKEND_DIR: str = DEFAULT_BACKEND_DIR
    DATA_DIR: str = os.path.join(DEFAULT_BACKEND_DIR, "storage/tourism")
    STORAGE_DIR: str = os.path.join(DEFAULT_BACKEND_DIR, "storage")
    SQLITE_DB_PATH: str = "/tmp/conversations.db" if os.environ.get("VERCEL") else os.path.join(DEFAULT_BACKEND_DIR, "storage/conversations/conversations.db")
    VECTOR_DB_DIR: str = "/tmp/vector_db" if os.environ.get("VERCEL") else os.path.join(DEFAULT_BACKEND_DIR, "storage/vector_db")
    
    MAX_HISTORY_MESSAGES: int = 10
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(DEFAULT_BACKEND_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("DATA_DIR", mode="after")
    @classmethod
    def resolve_data_dir(cls, v: str) -> str:
        # Priority 1: Primary storage directory in storage/tourism
        primary_storage = os.path.abspath(os.path.join(DEFAULT_BACKEND_DIR, "storage/tourism"))
        if os.path.exists(primary_storage):
            return primary_storage

        if not os.path.isabs(v):
            candidate = os.path.abspath(os.path.join(DEFAULT_BACKEND_DIR, v))
            if os.path.exists(candidate):
                return candidate
        elif os.path.exists(v):
            return v

        # Fallback to data/tourism if storage/tourism is absent
        alt = os.path.abspath(os.path.join(DEFAULT_BACKEND_DIR, "data/tourism"))
        if os.path.exists(alt):
            return alt
        return v

    @field_validator("SQLITE_DB_PATH", mode="after")
    @classmethod
    def resolve_sqlite_path(cls, v: str) -> str:
        if os.environ.get("VERCEL"):
            return "/tmp/conversations.db"
        if not os.path.isabs(v):
            return os.path.abspath(os.path.join(DEFAULT_BACKEND_DIR, v))
        return v

    @field_validator("VECTOR_DB_DIR", mode="after")
    @classmethod
    def resolve_vector_dir(cls, v: str) -> str:
        if os.environ.get("VERCEL"):
            return "/tmp/vector_db"
        if not os.path.isabs(v):
            return os.path.abspath(os.path.join(DEFAULT_BACKEND_DIR, v))
        return v

    @property
    def effective_gemini_api_key(self) -> str:
        return (
            self.GEMINI_API_KEY or 
            self.ONLINE_API_KEY or 
            os.environ.get("GEMINI_API_KEY", "") or 
            os.environ.get("GOOGLE_API_KEY", "")
        ).strip()

    @property
    def effective_online_model(self) -> str:
        return self.ONLINE_AI_MODEL or self.GEMINI_MODEL or "gemini-flash-latest"

    @property
    def effective_offline_model(self) -> str:
        return self.OFFLINE_AI_MODEL or self.OLLAMA_MODEL or "Camtour-On-Mistral-Ai:latest"

settings = Settings()
