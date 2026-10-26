import pytest
from app.services.language_service import language_service
from app.services.intent_service import intent_service
from app.services.weather_service import weather_service
from app.services.currency_service import currency_service
from app.services.events_service import events_service
from app.services.places_service import places_service
from app.services.transport_service import transport_service
from app.services.recommendation_engine import recommendation_engine
from app.services.itinerary_engine import itinerary_engine
from app.services.confidence_service import confidence_service
from app.services.response_validation_service import response_validation_service
from app.services.ai_router import ai_router
from app.services.matching_service import matching_service
from app.services.rag_service import rag_service
from app.services.memory_service import memory_service

# 1. Language Service Tests
def test_language_detection_and_validation():
    """Verify strict language detection and validation for Khmer and English."""
    assert language_service.detect_language("អង្គរវត្តនៅឯណា?") == "km"
    assert language_service.detect_language("តើទៅសៀមរាបគួរទៅណា?") == "km"
    assert language_service.detect_language("Where is Angkor Wat located?") == "en"
    assert language_service.detect_language("What is the weather in Kampot?") == "en"

    # Validation
    val_km = response_validation_service.validate_response("ប្រាសាទអង្គរវត្តស្ថិតនៅខេត្តសៀមរាប", expected_language="km")
    assert val_km["is_valid"] is True

    val_en = response_validation_service.validate_response("Angkor Wat is located in Siem Reap province.", expected_language="en")
    assert val_en["is_valid"] is True

# 2. Intent & Entity Extraction Tests
def test_intent_and_entity_extraction():
    """Verify all major intents and entities extraction."""
    # Itinerary intent with duration & budget
    res1 = intent_service.detect_intent("Plan a 3-day trip to Siem Reap under $300.")
    assert res1["intent"] == "itinerary"
    assert res1["entities"].get("duration") == 3
    assert res1["entities"].get("budget") == 300.0
    assert res1["entities"].get("destination") == "Siem Reap"

    # Weather intent
    res2 = intent_service.detect_intent("What is the weather in Phnom Penh today?")
    assert res2["intent"] == "weather"
    assert res2["entities"].get("destination") == "Phnom Penh"

    # Currency intent
    res3 = intent_service.detect_intent("Convert 50 USD to Khmer Riel")
    assert res3["intent"] == "currency"

    # Food intent
    res4 = intent_service.detect_intent("Where can I eat Fish Amok in Siem Reap?")
    assert res4["intent"] == "food"

    # Events intent
    res5 = intent_service.detect_intent("When is the Water Festival in Cambodia?")
    assert res5["intent"] == "events"

    # Conversation summary intent
    res6 = intent_service.detect_intent("What have we talked about so far?")
    assert res6["intent"] == "conversation_summary"

# 3. Weather Service Tests
def test_weather_service():
    """Verify weather service returns valid weather payload for Cambodian hubs."""
    res = weather_service.get_weather("Siem Reap", days=3)
    assert res["province"] == "Siem Reap"
    assert "temperature_c" in res["current"]
    assert "forecast" in res
    assert len(res["forecast"]) >= 1

# 4. Currency Service Tests
def test_currency_service():
    """Verify deterministic currency exchange rate and conversion."""
    rate = currency_service.get_exchange_rate()
    assert rate["exchange_rate"] > 3000
    
    conversion = currency_service.convert(100, "USD", "KHR")
    assert conversion["result"] == 410000.0 or conversion["result"] > 350000
    assert conversion["from"] == "USD"
    assert conversion["to"] == "KHR"

    budget = currency_service.estimate_travel_budget(days=3, travelers=2, style="culture")
    assert budget["breakdown_usd"]["total_estimated_usd"] > 0

# 5. Events & Festivals Service Tests
def test_events_service():
    """Verify verified Cambodian festivals can be retrieved."""
    events = events_service.get_all_events()
    assert len(events) >= 3
    
    water_fest = events_service.search_events(query="water festival")
    assert len(water_fest["events"]) >= 1

# 6. Recommendation Engine Tests
def test_recommendation_engine():
    """Verify multi-factor recommendation scoring."""
    recs = recommendation_engine.recommend(interests=["culture", "temple"], limit=3)
    assert len(recs) >= 1
    assert "match_score" in recs[0]
    assert recs[0]["match_score"] > 50

# 7. Itinerary Engine Tests (Multi-day completeness & Koh Rong 2-day)
def test_itinerary_engine_completeness():
    """Verify 2-day Koh Rong trip completeness, destination mapping, and deterministic budget."""
    itin = itinerary_engine.generate_itinerary(destination="Koh Rong", days=2, language="en")
    assert itin["duration_days"] == 2
    assert len(itin["days"]) == 2
    assert itin["primary_destination"] == "Koh Rong"
    assert "budget" in itin
    assert itin["budget"]["transportation"] > 0
    assert itin["budget"]["accommodation"] > 0
    assert itin["budget"]["food"] > 0
    assert itin["budget"]["total_usd"] > 0
    assert itin["budget"]["total_khr"] > 0
    assert len(itin["days"][0]["items"]) >= 2
    assert len(itin["days"][1]["items"]) >= 2

# 8. Verified Restaurant & Food Search Tests
def test_verified_restaurant_search():
    """Verify Fish Amok search returns authentic verified restaurants without hallucinations."""
    rests = places_service.search_restaurants(query="fish amok", province="Siem Reap", limit=3)
    assert len(rests) >= 1
    assert rests[0]["verified"] is True
    assert "amok" in str(rests[0].get("description", "")).lower() or any("amok" in d.lower() for d in rests[0].get("specialty_dishes", []))

# 9. Confidence Scoring Tests
def test_confidence_service():
    """Verify confidence calculation factors and levels."""
    high_eval = confidence_service.calculate_confidence(
        intent_confidence=0.95,
        rag_similarity_score=0.95,
        tool_executed=True,
        tool_success=True,
        is_matched=True,
        ai_provider_mode="online"
    )
    assert high_eval["level"] == "high"
    assert high_eval["overall_score"] >= 0.90

# 10. RAG Retrieval & Context Builder Tests
def test_rag_retrieval_pipeline():
    """Verify semantic retrieval and context building."""
    ctx, sources = matching_service.build_rag_context("Tell me about Angkor Wat", top_k=2)
    assert len(sources) >= 1
    assert "Angkor" in sources[0]["name"]
    assert len(ctx) > 50

# 11. Memory Service & Conversation Summary Tests
def test_memory_and_conversation_summary():
    """Verify session metadata, history, and structured conversation summary."""
    sid = "test_sess_summary_001"
    memory_service.add_message(sid, "user", "I want to visit Angkor Wat and eat Fish Amok.")
    memory_service.add_message(sid, "assistant", "Angkor Wat is magnificent, and Fish Amok is our national dish!")
    
    summary = memory_service.get_structured_conversation_summary(sid, language="en")
    assert summary["type"] == "conversation_summary"
    assert summary["message_count"] == 2
    assert len(summary["topics"]) >= 1
    assert "summary_text" in summary
    
    memory_service.delete_session(sid)

# 12. Full End-to-End Orchestrator Flow (Bilingual & Scenarios)
def test_rag_service_full_scenarios():
    """Verify master RAG orchestrator for bilingual tourism scenarios."""
    # Scenario A: English Angkor inquiry
    res_en = rag_service.process_chat_message("What is the best time to visit Angkor Wat?")
    assert res_en["success"] is True
    assert len(res_en["message"]) > 20
    assert res_en["language"] == "en"

    # Scenario B: Khmer Weather inquiry
    res_km = rag_service.process_chat_message("តើអាកាសធាតុនៅសៀមរាបយ៉ាងម៉េចដែរ?")
    assert res_km["success"] is True
    assert res_km["language"] == "km"
    assert res_km["weather"] is not None

    # Scenario C: 100 USD Currency Conversion
    res_curr = rag_service.process_chat_message("Convert 100 USD to KHR")
    assert res_curr["success"] is True
    assert res_curr["intent"] == "currency"
    assert res_curr["currency"] is not None
    assert res_curr["currency"]["result"] >= 350000

    # Scenario D: Conversation summary
    sid_test = "test_e2e_summary_sid"
    rag_service.process_chat_message("Tell me about Bayon Temple", session_id=sid_test)
    res_summary = rag_service.process_chat_message("What have we talked about so far?", session_id=sid_test)
    assert res_summary["success"] is True
    assert res_summary["intent"] == "conversation_summary"
    assert "summary_text" in res_summary["data"] or res_summary["data"]["type"] == "conversation_summary"
    memory_service.delete_session(sid_test)

# 13. Route Shadowing & Bug Fix Regression Tests
def test_route_shadowing_and_bug_fixes():
    """Verify route ordering fixes (/places/nearby not shadowed by /places/{place_id}) and embedding determinism."""
    from fastapi.testclient import TestClient
    from app.main import app
    from app.services.embedding_service import embedding_service
    
    client = TestClient(app)
    
    # 1. Nearby places MUST return 200, not 404
    resp_nearby = client.get("/api/places/nearby?lat=13.41&lon=103.86")
    assert resp_nearby.status_code == 200
    assert resp_nearby.json()["success"] is True
    assert len(resp_nearby.json()["data"]) > 0

    # 2. Direct /places/nearby must also return 200
    resp_nearby_direct = client.get("/places/nearby?lat=13.41&lon=103.86")
    assert resp_nearby_direct.status_code == 200

    # 3. /hotels and /restaurants compatibility endpoints must return 200
    resp_hotels = client.get("/api/hotels")
    assert resp_hotels.status_code == 200
    assert resp_hotels.json()["success"] is True

    resp_rests = client.get("/api/restaurants")
    assert resp_rests.status_code == 200
    assert resp_rests.json()["success"] is True

    # 4. Individual place details by ID must still work
    resp_place = client.get("/places/beach_kohrong")
    assert resp_place.status_code == 200
    assert "Koh Rong" in resp_place.json()["data"]["name"]

    # 5. Embedding determinism test
    vec1 = embedding_service.encode("Angkor Wat temple Siem Reap")
    vec2 = embedding_service.encode("Angkor Wat temple Siem Reap")
    assert (vec1 == vec2).all()

def test_online_mode_status():
    """Verify system health and status endpoints strictly report online active mode."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["active_mode"] == "online"

    status_resp = client.get("/api/system/status")
    assert status_resp.status_code == 200
    assert status_resp.json()["active_mode"] == "online"
    assert "offline_ollama" not in status_resp.json()["providers"]
    assert "online_gemini" in status_resp.json()["providers"]

