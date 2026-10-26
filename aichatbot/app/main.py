import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.security import security_service
from app.core.logging import structured_logger
from app.api.routes import health, chat, search, summary, tourism_routes

app = FastAPI(
    title="Angkor Verse AI API",
    description="Intelligent Grounded Tourism Assistant specialized in the Kingdom of Cambodia.",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers & Latency Middleware
@app.middleware("http")
async def security_and_timing_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time_ms = (time.time() - start_time) * 1000
    
    # Add standard security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
    return response

# Include API Routers under /api prefix
app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(tourism_routes.router, prefix="/api")

# Also include directly without /api prefix for maximum compatibility
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(search.router)
app.include_router(summary.router)
app.include_router(tourism_routes.router)

@app.on_event("startup")
def startup_event():
    try:
        from app.services.matching_service import matching_service
        matching_service.index_datasets()
        print("✅ Pre-indexed RAG tourism datasets successfully on server startup.")
    except Exception as e:
        print(f"Startup indexing note: {e}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    sanitized_error = security_service.sanitize_sensitive_data(str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again.",
            "error": sanitized_error if settings.DEBUG else "Internal processing error."
        }
    )

@app.get("/")
async def root():
    return {
        "message": "Angkor Verse AI API is running",
        "version": settings.APP_VERSION,
        "mode": settings.AI_MODE,
        "docs": "/docs",
        "health": "/api/health"
    }
