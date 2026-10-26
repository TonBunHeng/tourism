from typing import Dict, Any, Optional

class ConfidenceService:
    def calculate_confidence(
        self,
        intent_confidence: float = 0.85,
        rag_similarity_score: float = 0.0,
        tool_executed: bool = False,
        tool_success: bool = True,
        is_matched: bool = False,
        ai_provider_mode: str = "online",
        has_entities: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate holistic confidence score across RAG, Intent, Tools, and Provider.
        0.90 - 1.00 -> High confidence
        0.70 - 0.89 -> Medium confidence
        0.00 - 0.69 -> Low confidence
        """
        # 1. Base weights
        weights = {
            "intent": 0.25,
            "grounding": 0.35,
            "tool": 0.25,
            "provider": 0.15
        }

        # Intent score
        intent_score = max(min(intent_confidence, 1.0), 0.5)

        # Grounding / RAG score
        if is_matched and rag_similarity_score > 0:
            grounding_score = min(rag_similarity_score, 1.0)
        elif is_matched:
            grounding_score = 0.90
        elif tool_executed and tool_success:
            grounding_score = 0.95
        else:
            grounding_score = 0.70

        # Tool execution score
        if tool_executed:
            tool_score = 1.0 if tool_success else 0.40
        elif is_matched:
            tool_score = 0.90
        else:
            tool_score = 0.75

        # Provider mode score (Pure Online Mode)
        provider_score = 0.95

        overall = (
            intent_score * weights["intent"] +
            grounding_score * weights["grounding"] +
            tool_score * weights["tool"] +
            provider_score * weights["provider"]
        )

        overall_clamped = round(max(min(overall, 1.0), 0.1), 4)

        if overall_clamped >= 0.90:
            level = "high"
            action = "return_response"
        elif overall_clamped >= 0.70:
            level = "medium"
            action = "add_cautious_context"
        else:
            level = "low"
            action = "fallback_or_clarify"

        return {
            "overall_score": overall_clamped,
            "level": level,
            "action": action,
            "factors": {
                "intent_confidence": round(intent_score, 2),
                "grounding_confidence": round(grounding_score, 2),
                "tool_confidence": round(tool_score, 2),
                "provider_confidence": round(provider_score, 2)
            }
        }

confidence_service = ConfidenceService()
