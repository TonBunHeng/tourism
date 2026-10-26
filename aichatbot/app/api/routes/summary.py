from fastapi import APIRouter, HTTPException
from app.models.chat import SummaryRequest
from app.models.response import StandardResponse
from app.services.summary_service import summary_service

router = APIRouter(prefix="/summary", tags=["Summary"])

@router.post("", response_model=StandardResponse)
def summarize_tourism_topic(request: SummaryRequest):
    try:
        res = summary_service.generate_summary(
            topic=request.topic,
            target_lang=request.language or "km"
        )
        return StandardResponse(
            success=True,
            data=res
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
