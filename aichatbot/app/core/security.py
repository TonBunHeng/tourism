import re
import html
import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from app.core.config import settings

class SecurityService:
    def __init__(self):
        # In-memory sliding window rate limiter
        self._ip_request_counts: Dict[str, list] = {}
        
    def sanitize_input(self, text: str) -> str:
        """
        Sanitize user input string:
        - Strip control chars & invisible bytes
        - Strip malicious script injection / HTML tags
        - Limit length to avoid memory denial of service
        """
        if not text:
            return ""
        
        # 1. Truncate to maximum allowed length
        trimmed = text.strip()[:settings.MAX_MESSAGE_LENGTH]
        
        # 2. Unescape then strip any dangerous HTML/Script tags
        unescaped = html.unescape(trimmed)
        no_html = re.sub(r'<[^>]+>', '', unescaped)
        
        # 3. Remove suspicious null bytes and dangerous shell characters
        clean = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', no_html)
        
        return clean.strip()

    def check_rate_limit(self, client_ip: str) -> bool:
        """
        Simple IP-based sliding window rate limiter.
        Returns True if request is allowed, False if rate limit exceeded.
        """
        now = time.time()
        window_start = now - 60.0  # 1 minute window
        
        # Prune older entries
        if client_ip in self._ip_request_counts:
            self._ip_request_counts[client_ip] = [
                t for t in self._ip_request_counts[client_ip] if t > window_start
            ]
        else:
            self._ip_request_counts[client_ip] = []
            
        if len(self._ip_request_counts[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return False
            
        self._ip_request_counts[client_ip].append(now)
        return True

    def sanitize_sensitive_data(self, data: str) -> str:
        """
        Mask API keys, passwords, and sensitive tokens from log messages or error traces.
        """
        if not isinstance(data, str):
            return str(data)
        
        # Mask Gemini / Google API keys (AIza...)
        masked = re.sub(r'AIza[0-9A-Za-z-_]{35}', 'AIza***REDACTED***', data)
        # Mask generic tokens/passwords
        masked = re.sub(r'(api[_-]?key|secret|password|token)\s*[:=]\s*["\']?([^"\'\s]+)["\']?', r'\1=***REDACTED***', masked, flags=re.IGNORECASE)
        return masked

security_service = SecurityService()
