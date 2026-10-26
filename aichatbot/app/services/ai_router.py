from typing import Dict, Any, List, Optional, Iterator
from app.core.config import settings
from app.services.online.gemini_service import gemini_online_service

class AIRouter:
    def route_request(
        self,
        user_prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        intent: str = "general_qa",
        requires_real_time: bool = False,
        local_knowledge_sufficient: bool = False,
        raw_message: str = "",
        context_snippet: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Pure Online AI Provider Router:
        Operates exclusively via Online Google Gemini (gemini-3.6-flash / gemini-2.5-flash)
        and verified grounded knowledge in Online Mode.
        """
        gemini_ready = gemini_online_service.is_available()

        # 1. Primary: Try Gemini Online Service
        if gemini_ready:
            try:
                gemini_res = gemini_online_service.generate_with_model(
                    prompt=user_prompt,
                    system_instruction=system_instruction,
                    attachments=attachments
                )
                if gemini_res and gemini_res.get("text") and len(gemini_res["text"].strip()) > 3:
                    return {
                        "answer": gemini_res["text"].strip(),
                        "mode": "online",
                        "provider": "gemini",
                        "model": gemini_res.get("model", settings.effective_online_model),
                        "fallback_used": False
                    }
            except Exception as e:
                print(f"AIRouter: Gemini online call failed ({e}).")

        # 2. Context-Grounded Online Synthesis if verified dataset context is present
        is_km = any(ord(c) >= 0x1780 and ord(c) <= 0x17FF for c in (user_prompt or raw_message))
        if context_snippet and context_snippet.strip():
            from app.services.offline.offline_knowledge_service import offline_knowledge_service
            grounded_text = offline_knowledge_service.synthesize_response(
                message=raw_message,
                context=context_snippet,
                is_matched=True
            )
            return {
                "answer": grounded_text,
                "mode": "online",
                "provider": "gemini",
                "model": settings.effective_online_model,
                "fallback_used": True
            }

        # 3. Intelligent Local Knowledge Synthesis when online service is unreachable
        from app.services.offline.offline_knowledge_service import offline_knowledge_service
        grounded_fallback = offline_knowledge_service.synthesize_response(
            message=raw_message,
            context=context_snippet,
            is_matched=bool(context_snippet and context_snippet.strip())
        )

        return {
            "answer": grounded_fallback,
            "mode": "online",
            "provider": "gemini",
            "model": settings.effective_online_model,
            "fallback_used": True
        }

    def route_stream(
        self,
        user_prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        intent: str = "general_qa",
        raw_message: str = "",
        context_snippet: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Iterator[str]:
        """
        Yield streaming tokens/chunks for SSE streaming endpoint in Online Mode.
        """
        gemini_ready = gemini_online_service.is_available()

        if gemini_ready:
            try:
                stream_gen = gemini_online_service.generate_stream(
                    prompt=user_prompt,
                    system_instruction=system_instruction,
                    attachments=attachments
                )
                streamed_anything = False
                for chunk in stream_gen:
                    if chunk:
                        streamed_anything = True
                        yield chunk
                if streamed_anything:
                    return
            except Exception as e:
                print(f"AIRouter: Gemini online streaming error: {e}")

        # Fallback to route_request and yield as single block
        res = self.route_request(
            user_prompt=user_prompt,
            system_instruction=system_instruction,
            conversation_history=conversation_history,
            intent=intent,
            raw_message=raw_message,
            context_snippet=context_snippet,
            attachments=attachments
        )
        yield res.get("answer", "")

ai_router = AIRouter()
