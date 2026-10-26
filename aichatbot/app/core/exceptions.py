from typing import Optional, Any

class AngkorVerseException(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details

class AIProviderError(AngkorVerseException):
    """Exception raised when an AI provider fails or times out."""
    def __init__(self, provider: str, message: str, details: Optional[Any] = None):
        super().__init__(f"AI Provider '{provider}' Error: {message}", status_code=502, details=details)
        self.provider = provider

class ValidationException(AngkorVerseException):
    """Exception raised for invalid user input or response mismatch."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=400, details=details)

class DataNotFoundError(AngkorVerseException):
    """Exception raised when requested tourism record is not found."""
    def __init__(self, resource: str, identifier: str):
        super().__init__(f"{resource} with identifier '{identifier}' not found in Cambodia tourism database.", status_code=404)

class RateLimitExceededException(AngkorVerseException):
    """Exception raised when rate limit is exceeded."""
    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(message, status_code=429)
