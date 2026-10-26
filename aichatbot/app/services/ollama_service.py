from app.services.offline.ollama_service import OllamaOfflineService, ollama_offline_service

# Backward-compatible alias
OllamaService = OllamaOfflineService
ollama_service = ollama_offline_service

__all__ = ["OllamaService", "ollama_service", "OllamaOfflineService", "ollama_offline_service"]
