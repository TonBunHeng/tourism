import time
import uuid
import json
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.chat import ChatRequest
from app.models.response import StandardResponse, ChatResponseData
from app.services.rag_service import rag_service
from app.services.memory_service import memory_service
from app.services.suggestion_service import suggestion_service
from app.core.security import security_service
from app.utils.validators import validate_chat_message

router = APIRouter(tags=["Chat"])

class TourismChatMessageRequest(BaseModel):
    message: Optional[str] = None
    message_text: Optional[str] = None
    language: Optional[str] = "en"
    session_id: Optional[str] = None

class TourismCreateChatRequest(BaseModel):
    category: Optional[str] = "General Inquiry"
    priority: Optional[str] = "medium"
    message: Optional[str] = ""
    message_text: Optional[str] = ""

class RenameSessionRequest(BaseModel):
    title: str

class SuggestionRequest(BaseModel):
    message: Optional[str] = ""
    answer: Optional[str] = ""
    session_id: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None
    language: Optional[str] = "en"
    refresh: Optional[bool] = False
    current_suggestions: Optional[List[str]] = []

@router.post("/chat", response_model=StandardResponse[ChatResponseData])
def handle_chat_message(request: ChatRequest, req: Request):
    client_ip = req.client.host if req.client else "127.0.0.1"
    if not security_service.check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a moment before sending another message.")

    clean_message = security_service.sanitize_input(request.message)
    validate_chat_message(clean_message)
    
    try:
        result = rag_service.process_chat_message(
            message=clean_message,
            session_id=request.session_id,
            preferred_language=request.language,
            client_history=request.history,
            attachments=request.attachments
        )
        return StandardResponse(
            success=True,
            request_id=result.get("request_id"),
            session_id=result.get("session_id"),
            language=result.get("language"),
            mode=result.get("mode"),
            provider=result.get("provider"),
            intent=result.get("intent"),
            confidence=result.get("confidence"),
            message="Message processed successfully.",
            data=ChatResponseData(**result),
            sources=result.get("sources", []),
            timestamp=result.get("timestamp")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
def stream_chat_message(request: ChatRequest, req: Request):
    """
    Streaming SSE endpoint for real-time token delivery to the chat interface.
    """
    client_ip = req.client.host if req.client else "127.0.0.1"
    if not security_service.check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")

    clean_message = security_service.sanitize_input(request.message)
    validate_chat_message(clean_message)

    def event_stream():
        try:
            for chunk in rag_service.process_chat_stream(
                message=clean_message,
                session_id=request.session_id,
                preferred_language=request.language,
                client_history=request.history,
                attachments=request.attachments
            ):
                if isinstance(chunk, dict):
                    payload = json.dumps(chunk, ensure_ascii=False)
                else:
                    payload = json.dumps({"token": chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            err_payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {err_payload}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/chat/suggestions")
@router.post("/chats/{session_id}/suggestions")
def get_chat_suggestions(payload: SuggestionRequest):
    """
    Generate 4 dynamic, context-aware follow-up suggestions based on the current
    conversation stage, latest user query, and AI response.
    """
    clean_msg = security_service.sanitize_input(payload.message) if payload.message else ""
    clean_ans = security_service.sanitize_input(payload.answer) if payload.answer else ""

    res = suggestion_service.generate_context_suggestions(
        message=clean_msg,
        answer=clean_ans,
        conversation_history=payload.history,
        language=payload.language or "en",
        exclude=payload.current_suggestions,
        refresh=bool(payload.refresh)
    )
    return {
        "success": True,
        "topic": res.get("topic", "Suggested Topics"),
        "suggestions": res.get("suggestions", [])
    }

@router.get("/chat/suggestions")
@router.get("/chats/{session_id}/suggestions")
def get_chat_suggestions_get(
    message: Optional[str] = "",
    answer: Optional[str] = "",
    session_id: Optional[str] = None,
    language: Optional[str] = "en",
    refresh: Optional[bool] = False
):
    """
    GET endpoint to retrieve 4 dynamic suggestions for quick initial fetching or refreshing.
    """
    clean_msg = security_service.sanitize_input(message) if message else ""
    clean_ans = security_service.sanitize_input(answer) if answer else ""

    res = suggestion_service.generate_context_suggestions(
        message=clean_msg,
        answer=clean_ans,
        conversation_history=None,
        language=language or "en",
        exclude=[],
        refresh=bool(refresh)
    )
    return {
        "success": True,
        "topic": res.get("topic", "Suggested Topics"),
        "suggestions": res.get("suggestions", [])
    }

@router.get("/chat/sessions")
@router.get("/chats")
@router.get("/travel/chats")
def get_chat_sessions():
    """List all active chat conversations."""
    sessions = memory_service.get_all_sessions()
    return {
        "success": True,
        "message": "Chat sessions retrieved successfully.",
        "data": sessions
    }

@router.get("/chat/sessions/search")
def search_chat_sessions(q: str = ""):
    """Search conversations by keyword."""
    if not q or not q.strip():
        results = memory_service.get_all_sessions()
    else:
        results = memory_service.search_sessions(q.strip())
    return {
        "success": True,
        "message": "Search results retrieved.",
        "data": results
    }

@router.post("/chats")
@router.post("/travel/chats")
def create_chat(payload: TourismCreateChatRequest):
    """Create new chat conversation."""
    text = payload.message or payload.message_text or "New Conversation"
    clean_text = security_service.sanitize_input(text)
    result = rag_service.process_chat_message(
        message=clean_text,
        preferred_language="en",
    )
    sid = result.get("session_id")
    return {
        "success": True,
        "message": "Support conversation started successfully.",
        "data": {
            "id": sid,
            "session_id": sid,
            "category": payload.category,
            "priority": payload.priority,
            "status": "active",
            "last_message": result.get("answer", ""),
            "answer": result.get("answer", ""),
            "language": result.get("language", "en"),
            "confidence": result.get("confidence", 0.95),
            "timestamp": result.get("timestamp")
        }
    }

@router.get("/chat/sessions/{session_id}")
@router.get("/chats/{session_id}")
@router.get("/travel/chats/{session_id}")
def get_chat_session(session_id: str):
    """Get message history for a specific session."""
    history = memory_service.get_history(session_id, limit=50)
    meta = memory_service.get_session_metadata(session_id)
    return {
        "success": True,
        "message": "Chat conversation retrieved successfully.",
        "data": {
            "id": session_id,
            "session_id": session_id,
            "messages": history,
            "metadata": meta
        }
    }

@router.patch("/chat/sessions/{session_id}")
@router.patch("/chats/{session_id}")
@router.put("/chat/sessions/{session_id}/title")
def rename_chat_session(session_id: str, payload: RenameSessionRequest):
    """Rename a specific chat conversation."""
    clean_id = session_id.strip()
    if clean_id.startswith("sessions/"):
        clean_id = clean_id.replace("sessions/", "", 1).strip()
    success = memory_service.rename_session(clean_id, payload.title)
    if not success:
        raise HTTPException(status_code=400, detail="Unable to rename session with provided title.")
    return {
        "success": True,
        "message": "Conversation renamed successfully.",
        "session_id": clean_id,
        "title": payload.title.strip()
    }

@router.post("/chats/{session_id}/messages")
@router.post("/travel/chats/{session_id}/messages")
def send_chat_message_to_session(session_id: str, payload: TourismChatMessageRequest, req: Request):
    """Send message to a specific conversation."""
    client_ip = req.client.host if req.client else "127.0.0.1"
    if not security_service.check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a moment before sending another message.")

    raw_text = payload.message or payload.message_text or ""
    clean_text = security_service.sanitize_input(raw_text)
    validate_chat_message(clean_text)
    
    try:
        result = rag_service.process_chat_message(
            message=clean_text,
            session_id=session_id,
            preferred_language=payload.language or "en",
        )
        return {
            "success": True,
            "request_id": result.get("request_id"),
            "session_id": session_id,
            "message": "Message sent successfully.",
            "data": {
                "id": session_id,
                "session_id": session_id,
                "sender_type": "ai",
                "message_text": result.get("answer", ""),
                "answer": result.get("answer", ""),
                "mode": result.get("mode", "online"),
                "provider": result.get("provider", "gemini"),
                "intent": result.get("intent", "general_qa"),
                "confidence": result.get("confidence", 0.95),
                "sources": result.get("sources", []),
                "suggestions": result.get("suggestions", []),
                "timestamp": result.get("timestamp")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/sessions")
@router.delete("/chat/sessions/all")
@router.delete("/chats")
def clear_all_sessions():
    """Clear all chat sessions."""
    memory_service.delete_all_sessions()
    return {
        "success": True,
        "message": "All chat sessions cleared successfully.",
        "data": []
    }

@router.delete("/chat/sessions/{session_id:path}")
@router.delete("/chats/{session_id:path}")
def delete_chat_session(session_id: str):
    """Delete a specific chat session."""
    clean_id = session_id.strip()
    if clean_id.startswith("sessions/"):
        clean_id = clean_id.replace("sessions/", "", 1).strip()
    deleted = memory_service.delete_session(clean_id)
    return {
        "success": True,
        "message": "Chat session deleted successfully.",
        "deleted": deleted,
        "session_id": clean_id
    }
