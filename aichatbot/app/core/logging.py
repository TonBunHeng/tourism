import json
import logging
import sys
import time
from typing import Any, Dict, Optional
from app.core.security import security_service

# Configure standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("angkor_verse_ai")

class StructuredLogger:
    @staticmethod
    def log_request(
        request_id: str,
        session_id: Optional[str] = None,
        intent: Optional[str] = None,
        language: Optional[str] = None,
        provider: Optional[str] = None,
        mode: Optional[str] = None,
        latency_ms: Optional[float] = None,
        confidence: Optional[float] = None,
        fallback_used: bool = False,
        error: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None
    ):
        """
        Log structured audit entry for observability and diagnostics.
        Never logs API keys or raw sensitive user data.
        """
        log_payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "request_id": request_id,
            "session_id": session_id,
            "intent": intent,
            "language": language,
            "provider": provider,
            "mode": mode,
            "latency_ms": round(latency_ms, 2) if latency_ms is not None else None,
            "confidence": round(confidence, 4) if confidence is not None else None,
            "fallback_used": fallback_used
        }
        
        if error:
            log_payload["error"] = security_service.sanitize_sensitive_data(error)
        if extra:
            log_payload["extra"] = extra
            
        json_line = json.dumps(log_payload, ensure_ascii=False)
        if error:
            logger.error(f"[AI_ORCHESTRATOR] {json_line}")
        else:
            logger.info(f"[AI_ORCHESTRATOR] {json_line}")

structured_logger = StructuredLogger()
