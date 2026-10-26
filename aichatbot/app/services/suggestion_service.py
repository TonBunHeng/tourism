import re
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.intent_service import intent_service
from app.services.online.gemini_service import gemini_online_service

class SuggestionService:
    """
    Intelligent Context-Aware Suggestion Generator for AngkorVers AI.
    100% focused on Cambodia Tourism, Travel, Cultural Heritage, and Destinations:
    - Angkor Wat & Cultural Heritage (Architecture, Sunrise, Angkor Pass, Temples)
    - Siem Reap Itineraries & Trip Planning (3-day itinerary, Tonle Sap, Kulen Mountain)
    - Phnom Penh Capital & History (Royal Palace, Silver Pagoda, Sunset Mekong Cruise)
    - Coastal & Islands (Koh Rong, Koh Rong Sanloem, Kep Crab Market, Kampot Pepper, Bokor)
    - Battambang Heritage (Bamboo Train Norry, Bat Cave Sunset, French Architecture)
    - Eco-Tourism & Nature (Mondulkiri Bousra Waterfall, Elephant Sanctuary, Yeak Laom Lake)
    - Authentic Khmer Cuisine (Fish Amok, Beef Lok Lak, Nom Banh Chok, Street Food)
    - Travel Budget, Currency & Logistics (Daily costs, USD vs Riel, Seasons & Weather)
    - 25 Provinces & Cultural Discovery (General Cambodian Travel Overview)
    """

    def generate_context_suggestions(
        self,
        message: str,
        answer: str = "",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
        intent: Optional[str] = None,
        rag_sources: Optional[List[Dict[str, Any]]] = None,
        exclude: Optional[List[str]] = None,
        refresh: bool = False,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate 4 concise, actionable, non-duplicative follow-up suggestions
        tailored to the ongoing dialogue, 100% focused on Cambodia tourism and travel.
        """
        user_msg = (message or "").strip()
        ai_ans = (answer or "").strip()
        hist = conversation_history or history or []
        excl = set(exclude or [])

        # Detect effective language
        is_km = (
            language == "km" or
            bool(re.search(r'[\u1780-\u17FF]', user_msg)) or
            bool(re.search(r'[\u1780-\u17FF]', ai_ans[:100]))
        )
        lang_code = "km" if is_km else "en"

        # Detect or refine intent
        if not intent or intent == "general_qa":
            det = intent_service.detect_intent(user_msg, hist)
            intent = det.get("intent", "general_qa")

        # 1. Try Gemini Online for real-time dynamic tourism follow-ups if available
        if gemini_online_service.is_available() and len(user_msg) > 3:
            try:
                ai_suggestions = self._generate_with_gemini(
                    user_msg=user_msg,
                    ai_ans=ai_ans,
                    history=hist,
                    intent=intent,
                    lang_code=lang_code,
                    exclude=excl,
                    refresh=refresh
                )
                if ai_suggestions and len(ai_suggestions.get("suggestions", [])) == 4:
                    return ai_suggestions
            except Exception as e:
                # Graceful fallback to deterministic contextual engine
                pass

        # 2. Deterministic Context-Aware Knowledge Graph (100% focused on Cambodia Tourism)
        fallback_res = self._synthesize_contextual_suggestions(
            user_msg=user_msg,
            ai_ans=ai_ans,
            intent=intent,
            lang_code=lang_code,
            exclude=excl,
            refresh=refresh
        )
        return fallback_res

    def _generate_with_gemini(
        self,
        user_msg: str,
        ai_ans: str,
        history: List[Dict[str, str]],
        intent: str,
        lang_code: str,
        exclude: set,
        refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """Query Gemini with a strict schema to generate 4 follow-up suggestions focused 100% on Cambodia tourism."""
        prompt = (
            f"You are the Suggestion Engine for AngkorVers AI.\n"
            f"Your focus is 100% on tourism, travel, destinations, cultural heritage, itineraries, and authentic experiences in Cambodia.\n"
            f"DO NOT suggest topics about technology, programming, coding, mathematics, or software engineering.\n"
            f"Given the conversation state below, generate exactly 4 concise, context-aware follow-up question suggestions "
            f"that help the user discover Cambodia tourism, plan trips, explore temples, beaches, food, and attractions.\n\n"
            f"Rules:\n"
            f"1. Language MUST be {'Khmer' if lang_code == 'km' else 'English'}.\n"
            f"2. Each suggestion must be a direct, natural user question or prompt (5 to 12 words max).\n"
            f"3. Must be 100% focused on Cambodia tourism, travel, destinations, culture, food, transportation, hotels, or budget.\n"
            f"4. Prioritize authentic Cambodian locations, temples, islands, natural parks, or cultural experiences.\n"
            f"5. Output STRICT JSON format only: {{\"topic\": \"string\", \"suggestions\": [\"q1\", \"q2\", \"q3\", \"q4\"]}}.\n\n"
            f"User Latest Query: {user_msg}\n"
            f"AI Response Summary: {ai_ans[:300]}\n"
        )
        if refresh:
            prompt += f"Note: Generate alternative fresh follow-ups different from: {list(exclude)[:6]}.\n"

        system_instruction = (
            "Return only valid JSON with keys 'topic' and 'suggestions' (array of 4 strings). "
            "No markdown code blocks, no other text."
        )

        res = gemini_online_service.generate_with_model(
            prompt=prompt,
            system_instruction=system_instruction
        )
        if not res or not res.get("text"):
            return None

        clean_text = res["text"].strip()
        clean_text = re.sub(r'^```(json)?\s*', '', clean_text, flags=re.MULTILINE)
        clean_text = re.sub(r'\s*```$', '', clean_text, flags=re.MULTILINE).strip()

        parsed = json.loads(clean_text)
        if isinstance(parsed, dict) and "suggestions" in parsed and isinstance(parsed["suggestions"], list):
            valid = [s.strip() for s in parsed["suggestions"] if isinstance(s, str) and len(s.strip()) > 3]
            valid = [s for s in valid if s not in exclude]
            if len(valid) >= 4:
                return {
                    "topic": str(parsed.get("topic") or "Cambodia Tourism & Travel").strip(),
                    "suggestions": valid[:4]
                }
        return None

    def _synthesize_contextual_suggestions(
        self,
        user_msg: str,
        ai_ans: str,
        intent: str,
        lang_code: str,
        exclude: set,
        refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Deterministic, robust contextual state machine mapping conversation stages
        100% focused on Cambodia tourism, travel, destinations, culture, and cuisine.
        """
        combined = f"{user_msg.lower()} {ai_ans.lower()}"
        is_km = lang_code == "km"

        # -------------------------------------------------------------
        # DOMAIN 1: ANGKOR WAT & ANCIENT TEMPLES
        # -------------------------------------------------------------
        if any(k in combined for k in [
            "angkor wat", "angkor", "temple", "sunrise", "sunset", "angkor pass", "ticket",
            "bayon", "ta prohm", "banteay srei", "beng mealea", "koh ker",
            "អង្គរវត្ត", "ប្រាសាទអង្គរ", "ប្រាសាទ", "ថ្ងៃរះ", "សំបុត្រចូលទស្សនា", "បាយ័ន", "តាព្រហ្ម"
        ]):
            topic = "ប្រាសាទអង្គរវត្ត & បេតិកភណ្ឌ" if is_km else "Angkor Wat & Cultural Heritage"
            primary_en = [
                "Learn about Angkor Wat's history and architecture",
                "Discover the best time and spot for sunrise",
                "Understand temple entrance ticket options (Angkor Pass)",
                "Explore nearby temples around the Small and Grand Circuit"
            ]
            alt_en = [
                "What is the dress code for visiting ancient Khmer temples?",
                "Discover the intricate stone carvings of Banteay Srei",
                "Explore the gigantic smiling faces of the Bayon Temple",
                "Visit the jungle-entangled ruins of Ta Prohm"
            ]
            primary_km = [
                "ស្វែងយល់អំពីប្រវត្តិសាស្ត្រ និងស្ថាបត្យកម្មអង្គរវត្ត",
                "ស្វែងរកពេលវេលា និងទីតាំងល្អបំផុតសម្រាប់មើលថ្ងៃរះ",
                "ស្វែងយល់ពីជម្រើសតម្លៃសំបុត្រចូលទស្សនាប្រាសាទ (Angkor Pass)",
                "ទស្សនាប្រាសាទបុរាណជុំវិញវង់តូច និងវង់ធំ"
            ]
            alt_km = [
                "តើត្រូវស្លៀកពាក់បែបណាពេលចូលទស្សនាប្រាសាទបុរាណ?",
                "ស្វែងយល់ពីក្បាច់ចម្លាក់ថ្មដ៏ល្អប្រណីតនៅប្រាសាទបន្ទាយស្រី",
                "ទស្សនាប្រាសាទបាយ័ន និងព្រះភ័ក្ត្រញញឹមទាំង ៥៤",
                "ទស្សនាប្រាសាទតាព្រហ្មដែលមានដើមឈើដុះលើថ្មបុរាណ"
            ]

        # -------------------------------------------------------------
        # DOMAIN 2: SIEM REAP ITINERARIES & TRAVEL PLANNING
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "siem reap", "itinerary", "plan a trip", "3-day", "travel budget",
            "hotel", "tonle sap", "floating village", "phare", "kulen",
            "សៀមរាប", "គម្រោងដើរលេង", "ដំណើរកម្សាន្ត", "ទន្លេសាប", "ភ្នំគូលែន"
        ]):
            topic = "ដំណើរកម្សាន្តនៅសៀមរាប" if is_km else "Siem Reap Travel Planning"
            primary_en = [
                "Create a 3-day Siem Reap cultural itinerary",
                "Find transportation from Phnom Penh to Siem Reap",
                "Estimate hotel and food costs for your stay",
                "Explore temples around Angkor Archaeological Park"
            ]
            alt_en = [
                "Where to find authentic Khmer cuisine and night markets in Siem Reap",
                "Take a floating village boat tour on the Tonle Sap Lake",
                "Experience the famous Phare Cambodian Circus show",
                "Explore Kulen Mountain sacred waterfall and River of a Thousand Lingas"
            ]
            primary_km = [
                "រៀបចំគម្រោងដើរលេង ៣ ថ្ងៃនៅសៀមរាប",
                "របៀបធ្វើដំណើរពីភ្នំពេញទៅសៀមរាប",
                "ការប៉ាន់ស្មានការចំណាយលើសណ្ឋាគារ និងអាហារ",
                "ស្វែងយល់ពីប្រាសាទបុរាណជុំវិញឧទ្យានអង្គរ"
            ]
            alt_km = [
                "កន្លែងញ៉ាំអាហារខ្មែរឆ្ងាញ់ៗ និងផ្សាររាត្រីនៅសៀមរាប",
                "ដំណើរកម្សាន្តតាមទូកទស្សនាភូមិបណ្តែតទឹកបឹងទន្លេសាប",
                "ទស្សនាការសម្តែងសៀកហ្វារ (Phare Circus) ដ៏ល្បីល្បាញ",
                "ដើរលេងឧទ្យានជាតិភ្នំគូលែន និងស្ទឹងលិង្គមួយពាន់"
            ]

        # -------------------------------------------------------------
        # DOMAIN 3: PHNOM PENH CAPITAL & HISTORY
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "phnom penh", "royal palace", "silver pagoda", "national museum",
            "tuol sleng", "choeung ek", "mekong", "riverside", "sisowath quay",
            "ភ្នំពេញ", "ព្រះបរមរាជវាំង", "វត្តព្រះកែវមរកត", "សារមន្ទីរជាតិ", "ទួលស្លែង"
        ]):
            topic = "រាជធានីភ្នំពេញ & ប្រវត្តិសាស្ត្រ" if is_km else "Phnom Penh Capital & History"
            primary_en = [
                "Explore the Royal Palace and Silver Pagoda in Phnom Penh",
                "Take a relaxing sunset boat cruise on the Mekong River",
                "Visit the National Museum of Cambodia ancient sculptures",
                "Discover Phnom Penh street food and vibrant night markets"
            ]
            alt_en = [
                "Visit Tuol Sleng Genocide Museum and Choeung Ek Memorial",
                "Explore French colonial architecture along Sisowath Quay",
                "Shop for handicrafts and souvenirs at the Russian Market",
                "Best viewpoints and rooftop cafes overlooking the Tonle Sap river"
            ]
            primary_km = [
                "ទស្សនាព្រះបរមរាជវាំង និងវត្តព្រះកែវមរកតនៅភ្នំពេញ",
                "ជិះទូកកម្សាន្តមើលថ្ងៃលិចតាមដងទន្លេមេគង្គ",
                "ទស្សនាសារមន្ទីរជាតិកម្ពុជា និងវត្ថុបុរាណខ្មែរដ៏កម្រ",
                "ស្វែងរកអាហារតាមផ្លូវ (Street Food) និងផ្សាររាត្រីនៅភ្នំពេញ"
            ]
            alt_km = [
                "ទស្សនាសារមន្ទីរប្រល័យពូជសាសន៍ទួលស្លែង និងជើងឯក",
                "ទស្សនាស្ថាបត្យកម្មអាណានិគមបារាំងតាមបណ្តោយមាត់ទន្លេ",
                "ដើរទិញវត្ថុអនុស្សាវរីយ៍ និងសូត្រខ្មែរនៅផ្សារទួលទំពូង",
                "ហាងកាហ្វេ និងចំណុចមើលទេសភាពមាត់ទន្លេស្អាតៗនៅភ្នំពេញ"
            ]

        # -------------------------------------------------------------
        # DOMAIN 4: COASTAL, ISLANDS & BEACHES (Koh Rong, Kampot, Kep)
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "beach", "island", "koh rong", "sanloem", "sihanoukville", "kampot", "kep",
            "crab", "pepper", "bokor", "ferry", "resort", "ocean",
            "កោះរ៉ុង", "ឆ្នេរ", "សមុទ្រ", "កំពត", "កែប", "ក្តាម", "ម្រេច", "បូកគោ"
        ]):
            topic = "ឆ្នេរសមុទ្រ កោះ និងខេត្តតំបន់ឆ្នេរ" if is_km else "Coastal Cambodia & Island Beaches"
            primary_en = [
                "Find speed ferry schedules to Koh Rong and Koh Rong Sanloem",
                "Taste fresh Kep crab with Kampot green pepper at Crab Market",
                "Visit Bokor Mountain national park and historic hill station",
                "Tour an organic Kampot pepper farm and salt fields"
            ]
            alt_en = [
                "Compare Koh Rong vs Koh Rong Sanloem for a beach vacation",
                "Take a bioluminescent plankton night boat tour in Koh Rong",
                "Take a relaxing day boat trip to Rabbit Island (Koh Tonsay)",
                "Kayak along the Green Cathedral river in Kampot"
            ]
            primary_km = [
                "ស្វែងរកកាលវិភាគអូប័រល្បឿនលឿនទៅកាន់កោះរ៉ុង",
                "ភ្លក្សរសជាតិក្តាមឆាម្រេចខ្ចីដ៏ល្បីល្បាញនៅផ្សារក្តាមកែប",
                "ដើរលេងឧទ្យានជាតិភ្នំបូកគោ និងសំណង់ប្រវត្តិសាស្ត្រ",
                "ទស្សនាចម្ការម្រេចសរីរាង្គកំពត និងវាលស្រែអំបិល"
            ]
            alt_km = [
                "ប្រៀបធៀបរវាងកោះរ៉ុង និងកោះរ៉ុងសន្លឹមសម្រាប់សម្រាកលំហែ",
                "ទស្សនាពន្លឺប្លង់តុងភ្លឺចែងចាំងនាពេលយប់នៅកោះរ៉ុង",
                "ជិះទូកកម្សាន្តទៅសម្រាកលំហែនៅកោះទន្សាយ ខេត្តកែប",
                "ជិះទូកកាយ៉ាក់លេងកម្សាន្តតាមដងព្រែកកំពត"
            ]

        # -------------------------------------------------------------
        # DOMAIN 5: BATTAMBANG & COUNTRYSIDE
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "battambang", "bamboo train", "norry", "bat cave", "phnom sampeau",
            "ek phnom", "prasat banan", "បាត់ដំបង", "ឡូរី", "ប្រចៀវ", "ភ្នំសំពៅ"
        ]):
            topic = "ទេសចរណ៍ខេត្តបាត់ដំបង" if is_km else "Battambang Heritage & Countryside"
            primary_en = [
                "Experience the unique Battambang Bamboo Train (Norry)",
                "Watch the sunset million-bat flight at Phnom Sampeau",
                "Take a walking tour of French colonial heritage buildings",
                "Visit ancient Ek Phnom and Prasat Banan temples"
            ]
            alt_en = [
                "Explore local countryside life and rice paper making",
                "Visit the Phare Ponleu Selpak visual arts school",
                "Discover Battambang Provincial Museum and stone statues",
                "Best local riverside cafes and dining in Battambang"
            ]
            primary_km = [
                "ជិះឡូរី (Bamboo Train) ដ៏ប្លែកអារម្មណ៍នៅបាត់ដំបង",
                "ទស្សនាហ្វូងប្រចៀវរាប់លានហើរចេញពីរូងភ្នំសំពៅពេលថ្ងៃលិច",
                "ដើរទស្សនាអគារស្ថាបត្យកម្មសម័យអាណានិគមបារាំង",
                "ទស្សនាប្រាសាទឯកភ្នំ និងប្រាសាទបាណន់"
            ]
            alt_km = [
                "ស្វែងយល់ពីជីវភាពជនបទ និងរបៀបធ្វើនំក្រឡាន និងនំបញ្ចុក",
                "ទស្សនាសាលាហ្វារពន្លឺសិល្បៈដ៏ល្បីល្បាញនៅបាត់ដំបង",
                "ទស្សនាសារមន្ទីរខេត្តបាត់ដំបង និងបដិមាបុរាណ",
                "ហាងកាហ្វេ និងភោជនីយដ្ឋានឆ្ងាញ់ៗមាត់ស្ទឹងសង្កែ"
            ]

        # -------------------------------------------------------------
        # DOMAIN 6: ECO-TOURISM, NATURE & WATERFALLS
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "mondulkiri", "ratanakiri", "waterfall", "elephant", "bousra", "yeak laom",
            "kratie", "dolphin", "nature", "jungle", "trekking", "cardamom",
            "មណ្ឌលគិរី", "រតនគិរី", "ក្រចេះ", "ទឹកធ្លាក់", "ដំរី", "ផ្សោត", "ប៊ូស្រា", "យក្សឡោម"
        ]):
            topic = "អេកូទេសចរណ៍ និងធម្មជាតិកម្ពុជា" if is_km else "Cambodia Eco-Tourism & Nature"
            primary_en = [
                "Visit the majestic double-drop Bousra Waterfall in Mondulkiri",
                "Experience an ethical elephant sanctuary walking tour",
                "Swim in the crystal-clear volcanic lake of Yeak Laom in Ratanakiri",
                "See rare freshwater Irrawaddy dolphins along the Mekong in Kratie"
            ]
            alt_en = [
                "Learn about indigenous Bunong culture and traditional villages",
                "Ecotourism homestays and community trekking in Chi Phat",
                "Trek the lush Cardamom Mountains and Tatai waterfalls in Koh Kong",
                "Explore Preah Vihear cliff-top temple on the Dangrek Mountains"
            ]
            primary_km = [
                "ទស្សនាទឹកធ្លាក់ប៊ូស្រា ២ ជាន់ដ៏អស្ចារ្យនៅមណ្ឌលគិរី",
                "ដើរលេងជាមួយហ្វូងដំរីបែបអភិរក្សនៅជម្រកធម្មជាតិ",
                "ហែលទឹកបឹងយក្សឡោមដ៏ថ្លាឈ្វេងនៅរតនគិរី",
                "ទស្សនាសត្វផ្សោតក្បាលត្រឡោកទឹកសាបដ៏កម្រនៅខេត្តក្រចេះ"
            ]
            alt_km = [
                "ស្វែងយល់ពីវប្បធម៌ និងរបៀបរស់នៅរបស់បងប្អូនជនជាតិដើមភាគតិចព្នង",
                "ដំណើរកម្សាន្តអេកូទេសចរណ៍ និងស្នាក់នៅផ្ទះសហគមន៍ជីផាត",
                "ដើរព្រៃជួរភ្នំក្រវាញ និងទឹកធ្លាក់តាតៃ ខេត្តកោះកុង",
                "ទស្សនាប្រាសាទព្រះវិហារលើកំពូលភ្នំដងរែក"
            ]

        # -------------------------------------------------------------
        # DOMAIN 7: AUTHENTIC KHMER CUISINE & FOOD EXPERIENCES
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "food", "dish", "cuisine", "amok", "lok lak", "nom banh chok",
            "restaurant", "street food", "cooking", "eat", "curry", "breakfast",
            "ម្ហូប", "ញ៉ាំ", "អាហារ", "អាមុក", "ឡុកឡាក់", "នំបញ្ចុក", "ផ្សាររាត្រី"
        ]):
            topic = "ម្ហូបខ្មែរប្រពៃណី & ទេសចរណ៍ម្ហូបអាហារ" if is_km else "Authentic Khmer Cuisine & Food Experiences"
            primary_en = [
                "Taste authentic Fish Amok steamed in banana leaves",
                "Enjoy traditional Beef Lok Lak with Kampot lime pepper sauce",
                "Experience Nom Banh Chok Khmer noodles for breakfast",
                "Explore street food specialties at local night markets"
            ]
            alt_en = [
                "Join an authentic Khmer cooking class with a local market tour",
                "Where to taste traditional desserts like Num Ansom and Sankhya Lapov",
                "Best restaurants for modern and traditional Khmer gastronomy",
                "Discover the secret flavors of prahok and kroeung herb paste"
            ]
            primary_km = [
                "ភ្លក្សរសជាតិអាមុកត្រីខ្មែរប្រពៃណីក្នុងកញ្ចប់ស្លឹកចេក",
                "ញ៉ាំឡុកឡាក់សាច់គោជាមួយទឹកម្រេចក្រូចឆ្មាកំពត",
                "សាកល្បងញ៉ាំនំបញ្ចុកសម្លប្រហើរជាអាហារពេលព្រឹក",
                "ដើរញ៉ាំអាហារតាមផ្លូវនៅផ្សាររាត្រីក្នុងស្រុក"
            ]
            alt_km = [
                "ចូលរួមរៀនធ្វើម្ហូបខ្មែរជាមួយមេចុងភៅ និងដើរផ្សារក្នុងស្រុក",
                "កន្លែងភ្លក្សបង្អែមខ្មែរប្រពៃណី ដូចជានំអន្សម និងសង់ខ្យាល្ពៅ",
                "ភោជនីយដ្ឋានម្ហូបខ្មែរបែបប្រណីត និងបែបប្រពៃណីឆ្ងាញ់ៗ",
                "ស្វែងយល់ពីគ្រឿងផ្សំស្នូលរបស់ម្ហូបខ្មែរ (គ្រឿងបុក និងប្រហុក)"
            ]

        # -------------------------------------------------------------
        # DOMAIN 8: TRAVEL LOGISTICS, BUDGET, SEASONS & CURRENCY
        # -------------------------------------------------------------
        elif any(k in combined for k in [
            "budget", "cost", "price", "money", "usd", "riel", "currency",
            "weather", "season", "when to visit", "transport", "bus", "flight", "tuk tuk",
            "តម្លៃ", "ថ្លៃ", "លុយ", "ដុល្លារ", "រៀល", "អាកាសធាតុ", "រដូវ", "ធ្វើដំណើរ"
        ]):
            topic = "ការរៀបចំថវិកា និងការធ្វើដំណើរកម្សាន្ត" if is_km else "Cambodia Travel Budget & Logistics"
            primary_en = [
                "Estimate a daily Cambodia travel budget for your trip",
                "Currency tips: Using US Dollars vs Cambodian Riel (KHR)",
                "Discover the best months to visit Cambodia for good weather",
                "How to get around using PassApp, Grab, and tourist buses"
            ]
            alt_en = [
                "Official tourist e-Visa requirements and fees for visitors",
                "Using Bakong Tourist App for QR code digital payments",
                "Tipping etiquette and bargaining in Cambodian markets",
                "What to pack for Cambodia's tropical climate and temple visits"
            ]
            primary_km = [
                "ការប៉ាន់ស្មានកញ្ចប់ថវិកាប្រចាំថ្ងៃសម្រាប់ដំណើរកម្សាន្តនៅកម្ពុជា",
                "ការណែនាំពីការចាយលុយដុល្លារ និងប្រាក់រៀល (KHR)",
                "ស្វែងយល់ពីខែដែលល្អបំផុតសម្រាប់ដើរលេងនៅកម្ពុជា",
                "របៀបធ្វើដំណើរដោយប្រើ PassApp, Grab និងរថយន្តក្រុងទេសចរណ៍"
            ]
            alt_km = [
                "ព័ត៌មានលម្អិតអំពីការសុំទិដ្ឋាការទេសចរណ៍ e-Visa ចូលកម្ពុជា",
                "ការប្រើប្រាស់ Bakong Tourist App សម្រាប់ការទូទាត់ QR",
                "របៀបតថ្លៃទំនិញនៅផ្សារ និងការផ្តល់ប្រាក់ឧបត្ថម្ភ (Tip)",
                "របស់របរដែលគួររៀបចំសម្រាប់ដំណើរកម្សាន្តនៅតំបន់ប្រាសាទ"
            ]

        # -------------------------------------------------------------
        # DOMAIN 9: CAMBODIA 25 PROVINCES & CULTURAL DISCOVERY (DEFAULT)
        # -------------------------------------------------------------
        else:
            topic = "ទេសចរណ៍ និងវប្បធម៌កម្ពុជា" if is_km else "Cambodia Tourism & Culture"
            primary_en = [
                "Explore Cambodia's top tourist destinations",
                "Plan a trip to Siem Reap and Angkor temples",
                "Discover Angkor Wat's history and royal marvels",
                "Estimate a Cambodia travel budget and daily costs"
            ]
            alt_en = [
                "Overview of the top travel attractions across Cambodia's 25 provinces",
                "What authentic Khmer dishes are must-try for visitors?",
                "Experience traditional festivals: Khmer New Year and Water Festival",
                "Discover UNESCO cultural heritage: Royal Ballet and Kun Bokator"
            ]
            primary_km = [
                "ស្វែងយល់ពីរមណីយដ្ឋានទេសចរណ៍ល្បីៗនៅកម្ពុជា",
                "រៀបចំគម្រោងដំណើរកម្សាន្តទៅសៀមរាប និងអង្គរ",
                "ស្វែងយល់ពីប្រវត្តិសាស្ត្រអង្គរវត្តដ៏រុងរឿង",
                "ការប៉ាន់ស្មានកញ្ចប់ថវិកាដើរលេងនៅកម្ពុជា"
            ]
            alt_km = [
                "ទិដ្ឋភាពទូទៅនៃតំបន់ទេសចរណ៍លេចធ្លោនៅខេត្តទាំង ២៥",
                "តើម្ហូបខ្មែរប្រពៃណីណាខ្លះដែលមិនគួររំលង?",
                "ពិធីបុណ្យប្រពៃណីខ្មែរ៖ បុណ្យចូលឆ្នាំខ្មែរ និងបុណ្យអុំទូក",
                "ស្វែងយល់ពីសម្បត្តិបេតិកភណ្ឌយូណេស្កូ៖ របាំព្រះរាជទ្រព្យ និងល្បុក្កតោ"
            ]

        return self._select_candidates(topic, primary_km if is_km else primary_en, alt_km if is_km else alt_en, exclude, refresh)

    def _select_candidates(
        self,
        topic: str,
        primary_list: List[str],
        alt_list: List[str],
        exclude: set,
        refresh: bool
    ) -> Dict[str, Any]:
        """Select 4 clean, unique suggestions taking exclusion and refresh into account."""
        if refresh:
            candidates = [c for c in alt_list if c not in exclude]
            if len(candidates) < 4:
                candidates += [c for c in primary_list if c not in exclude]
            if len(candidates) < 4:
                candidates = alt_list + primary_list
        else:
            candidates = [c for c in primary_list if c not in exclude]
            if len(candidates) < 4:
                candidates += [c for c in alt_list if c not in exclude]
            if len(candidates) < 4:
                candidates = primary_list + alt_list

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for c in candidates:
            if c not in seen:
                seen.add(c)
                unique.append(c)

        return {
            "topic": topic,
            "suggestions": unique[:4]
        }

suggestion_service = SuggestionService()
