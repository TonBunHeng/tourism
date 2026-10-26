from fastapi import APIRouter, HTTPException
from app.models.chat import SearchQuery
from app.models.response import StandardResponse
from app.services.tourism_service import tourism_service

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("", response_model=StandardResponse)
def search_tourism_knowledge(query_data: SearchQuery):
    try:
        results = tourism_service.search_keyword(query_data.query, limit=query_data.limit or 5)
        
        if query_data.province:
            results = [item for item in results if (item.get("province") or "").lower() == query_data.province.lower()]
            
        if query_data.category:
            results = [item for item in results if (item.get("category") or "").lower() == query_data.category.lower()]
            
        return StandardResponse(
            success=True,
            data={
                "query": query_data.query,
                "count": len(results),
                "results": results
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
