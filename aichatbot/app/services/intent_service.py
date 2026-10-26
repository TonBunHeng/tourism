import re
from typing import Dict, Any, List, Optional
from app.services.language_service import language_service

class IntentService:
    def __init__(self):
        self.provinces = {
            "Phnom Penh": ["phnom penh", "capital", "ភ្នំពេញ", "រាជធានី", "វាំង", "សារមន្ទីរជាតិ"],
            "Siem Reap": ["siem reap", "angkor", "សៀមរាប", "អង្គរ", "បាយ័ន", "តាព្រហ្ម", "បន្ទាយស្រី"],
            "Preah Sihanouk": ["sihanoukville", "sihanouk", "koh rong", "preah sihanouk", "ព្រះសីហនុ", "កំពង់សោម", "កោះរ៉ុង", "កោះរ៉ុងសន្លឹម"],
            "Kampot": ["kampot", "bokor", "កំពត", "បូកគោ", "ម្រេចកំពត"],
            "Battambang": ["battambang", "បាត់ដំបង", "រថភ្លើងឫស្សី", "ភ្នំសំពៅ"],
            "Kep": ["kep", "crab market", "កែប", "ផ្សារក្តាម"],
            "Mondulkiri": ["mondulkiri", "bousra", "មណ្ឌលគិរី", "ប៊ូស្រា", "ដំរី"],
            "Ratanakiri": ["ratanakiri", "yeak laom", "រតនគិរី", "យក្សឡោម"],
            "Koh Kong": ["koh kong", "cardamom", "កោះកុង", "ក្រវាញ"],
            "Preah Vihear": ["preah vihear", "ព្រះវិហារ"],
            "Kampong Thom": ["kampong thom", "sambor prei kuk", "កំពង់ធំ", "សំបូរព្រៃគុក"],
            "Kandal": ["kandal", "oudong", "koh dach", "កណ្តាល", "ឧដុង្គ", "កោះដាច់"],
            "Banteay Meanchey": ["banteay meanchey", "poipet", "banteay chhmar", "បន្ទាយមានជ័យ", "ប៉ោយប៉ែត", "បន្ទាយឆ្មារ"],
            "Kampong Cham": ["kampong cham", "koh pen", "កំពង់ចាម", "កោះប៉ែន"],
            "Kampong Chhnang": ["kampong chhnang", "pottery", "កំពង់ឆ្នាំង", "ក្អមឆ្នាំង"],
            "Kampong Speu": ["kampong speu", "kirirom", "aural", "កំពង់ស្ពឺ", "គិរីរម្យ", "ឱរ៉ាល់"],
            "Kratié": ["kratie", "dolphin", "kampi", "ក្រចេះ", "ផ្សោត", "កាំពី"],
            "Oddar Meanchey": ["oddar meanchey", "anlong veng", "samraong", "ឧត្តរមានជ័យ", "អន្លង់វែង", "សំរោង"],
            "Pailin": ["pailin", "phnom yat", "longan", "ប៉ៃលិន", "ភ្នំយ៉ាត", "មៀនប៉ៃលិន"],
            "Pursat": ["pursat", "kampong luong", "orange", "ពោធិ៍សាត់", "កំពង់ហ្លួង", "ក្រូចពោធិ៍សាត់"],
            "Prey Veng": ["prey veng", "neak loeung", "ba phnom", "ព្រៃវែង", "អ្នកលឿង", "បាភ្នំ"],
            "Stung Treng": ["stung treng", "sekong", "ស្ទឹងត្រែង", "សេកុង"],
            "Svay Rieng": ["svay rieng", "bavet", "ស្វាយរៀង", "បាវិត"],
            "Takéo": ["takeo", "angkor borei", "phnom da", "chisor", "តាកែវ", "អង្គរបុរី", "ភ្នំដា", "ភ្នំជីសូរ"],
            "Tboung Khmum": ["tboung khmum", "suong", "memot", "ត្បូងឃ្មុំ", "សួង", "មេមត់"]
        }
        
        self.intent_patterns = {
            "greeting": [
                r"\b(hi|hello|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening)\b|(សួស្តី|ជំរាបសួរ)"
            ],
            "coding": [
                r"\b(code|coding|python|javascript|typescript|vue|react|html|css|sql|function|debug|algorithm|bug|program|syntax|regex|git|docker|api|class|endpoint|compil|script)\b|(សរសេរកូដ|កូដ|កម្មវិធីកុំព្យូទ័រ)"
            ],
            "khmer_language": [
                r"\b(khmer\s+letter|formal\s+letter|administrative\s+letter|letter\s+format|khmer\s+writing|khmer\s+grammar|orthography|chuon\s+nath|proofread|correct\s+khmer|khmer\s+dictionary|format\s+a\s+.*letter)\b|(លិខិតផ្លូវការ|ទម្រង់លិខិត|សរសេរលិខិត|ពាក្យសុំច្បាប់|អក្ខរាវិរុទ្ធ|វេយ្យាករណ៍ខ្មែរ|វចនានុក្រមខ្មែរ|ជួន\s*ណាត)"
            ],
            "translation": [
                r"\b(translate|translation|how\s+to\s+say|mean\s+in\s+khmer|meaning\s+in\s+khmer|say\s+in\s+khmer|say\s+in\s+english)\b|(បកប្រែ|ប្រែសម្រួល|ប្រែជាភាសា|ជាភាសាអង់គ្លេស|ជាភាសាខ្មែរ)"
            ],
            "math_science": [
                r"\b(calculate|equation|formula|math|mathematics|physics|chemistry|biology|derivative|integral|algebra)\b|(គណនា|រូបវិទ្យា|គីមី|គណិតវិទ្យា|ជីវវិទ្យា)"
            ],
            "business_finance": [
                r"\b(business|startup|marketing|investment|strategy|economics|revenue|profit|gdp|finance|stock|bakong|aba|camdx)\b|(ធុរកិច្ច|អាជីវកម្ម|សេដ្ឋកិច្ច|ទីផ្សារ|វិនិយោគ|ចុះបញ្ជីអាជីវកម្ម)"
            ],
            "cambodia_government": [
                r"\b(passport|passports|visa|visas|evisa|driver\s+license|driving\s+license|sangkat|civil\s+registry|birth\s+certificate|marriage\s+certificate|public\s+service|ministry|gdi|mpwt|owso|one\s+window|government\s+service)\b|(លិខិតឆ្លងដែន|ទិដ្ឋាការ|បណ្ណបើកបរ|សំបុត្រកំណើត|សំបុត្រអាពាហ៍ពិពាហ៍|សេវាសាធារណៈ|សង្កាត់|ក្រសួង|ច្រកចេញចូលតែមួយ)"
            ],
            "cambodia_education": [
                r"\b(bacii|grade\s+12\s+exam|high\s+school\s+exam|rupp|itc|cadt|num|university\s+in\s+cambodia|study\s+guide|lesson\s+plan)\b|(បាក់ឌុប|ប្រឡងបាក់ឌុប|សាកលវិទ្យាល័យ|តិចណូ|មេរៀន|លំហាត់)"
            ],
            "cambodia_tech": [
                r"\b(bakong\s+api|khqr\s+api|laravel\s+cambodia|vue\s+cambodia|techo\s+startup|startup\s+cambodia|developer\s+cambodia)\b"
            ],
            "weather": [
                r"\b(weather|rain|temperature|forecast|climate|temp|degrees|humidity|sunny|storm)\b|(អាកាសធាតុ|ភ្លៀង|ក្តៅ|រងា|ព្យុះ|ពពក)"
            ],
            "currency": [
                r"\b(riel|khr|exchange|convert|currency|rate|usd\s+to\s+khr|khr\s+to\s+usd|dollar|riel\s+rate|money|cash)\b|(ប្តូរលុយ|រៀល|ដុល្លារ|អត្រាប្តូរប្រាក់|រូបិយប័ណ្ណ)"
            ],
            "itinerary": [
                r"\b(itinerary|plan|trip\s+plan|schedule|tour|route|day\s+1|day\s+2|day\s+3|day\s+4|day\s+5|3\s*day|4\s*day|5\s*day|multi-day)\b|(គម្រោង|ដំណើរកម្សាន្ត|ដើរលេង|គម្រោងដើរលេង)"
            ],
            "recommendation": [
                r"\b(recommend|recommendation|where\s+to\s+go|best\s+places|must\s+visit|top\s+attractions|things\s+to\s+do|suggest|highlight|suggested)\b|(ណែនាំ|កន្លែងណា|គួរទៅណា|កន្លែងល្បី|កន្លែងស្អាត)"
            ],
            "events": [
                r"\b(event|events|festival|festivals|holiday|water\s+festival|bon\s+om\s+touk|marathon|new\s+year|sankranta|pchum\s+ben)\b|(ពិធីបុណ្យ|បុណ្យ|អុំទូក|ចូលឆ្នាំ|ភ្ជុំបិណ្ឌ|ព្រឹត្តិការណ៍)"
            ],
            "culture": [
                r"\b(culture|tradition|heritage|history|apsara|shadow\s+theatre|sbek\s+thom|chapei|buddhism|monk|dress\s+code|pagoda|temple\s+rule)\b|(វប្បធម៌|ប្រពៃណី|ប្រវត្តិ|របាំ|អប្សរា|ចាប៉ី|ព្រះពុទ្ធសាសនា|វត្ត|គុនល្បុក្កតោ)"
            ],
            "food": [
                r"\b(food|eat|restaurant|dish|dishes|amok|lok\s+lak|kuy\s+teav|noodles|crab|seafood|street\s+food|dining|cuisine)\b|(ម្ហូប|អាហារ|ញ៉ាំ|ហាងបាយ|អាម៉ុក|ឡុកឡាក់|គុយទាវ|នំបញ្ចុក|ក្តាម)"
            ],
            "transportation": [
                r"\b(transport|transportation|how\s+to\s+get|taxi|bus|train|flight|ferry|speed\s+boat|tuk\s*tuk|passapp|grab|rent|drive|airport)\b|(ធ្វើដំណើរ|ជិះអី|ឡានក្រុង|តាក់ស៊ី|ទូក|កាណូត|យន្តហោះ)"
            ],
            "time": [
                r"\b(what\s+time|what\s+is\s+the\s+time|current\s+time|time\s+now|time\s+in\s+cambodia|time\s+zone|timezone|what\s+day\s+is\s+today|today\s+date|what\s+date)\b|(ម៉ោងប៉ុន្មាន|ម៉ោងប៉ុន្មានហើយ|វេលាម៉ោង|ថ្ងៃនេះថ្ងៃអ្វី|កាលបរិច្ឆេទ)"
            ],
            "identity": [
                r"\b(who\s+are\s+you|what\s+are\s+you|what\s+is\s+your\s+name|who\s+made\s+you|what\s+can\s+you\s+do)\b|(តើអ្នកជាអ្នកណា|តើអ្នកជាអ្វី|អ្នកបង្កើតដោយអ្នកណា)"
            ],
            "safety": [
                r"\b(safety|safe|emergency|police|hospital|doctor|clinic|scam|sim\s*card|internet|vaccine|tap\s*water)\b|(សុវត្ថិភាព|អាសន្ន|ប៉ូលិស|មន្ទីរពេទ្យ|ស៊ីមកាត|ទឹកស្អាត|គ្រោះថ្នាក់)"
            ],
            "place_search": [
                r"\b(where\s+is|location\s+of|tell\s+me\s+about|information\s+about|find|opening\s+hours|ticket|price\s+of|entrance\s+fee)\b|(នៅឯណា|ទីតាំង|តម្លៃសំបុត្រ|ម៉ោងបើក)"
            ],
            "conversation_summary": [
                r"\b(what\s+have\s+we\s+talked\s+about|summarize\s+our\s+conversation|summarize\s+chat|what\s+did\s+i\s+ask|recap\s+conversation|conversation\s+summary|chat\s+history)\b|(តើយើងបាននិយាយអំពីអ្វីខ្លះ|សង្ខេបការសន្ទនា|សង្ខេបកិច្ចសន្ទនា|សង្ខេបអ្វីដែលបាននិយាយ)"
            ]
        }

    def detect_intent(self, text: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Detect intent and extract all relevant entities from user message.
        Supports: general_qa, place_search, recommendation, itinerary, weather,
                  currency, events, culture, food, transportation, safety.
        """
        lowered = text.lower().strip()
        detected_lang = language_service.detect_language(text)
        entities = self.extract_entities(text)
        
        detected_intent = "general_qa"
        matched_pattern = False
        
        for intent_name, patterns in self.intent_patterns.items():
            if any(re.search(p, lowered) for p in patterns):
                detected_intent = intent_name
                matched_pattern = True
                break

        # Priority Rule: If duration or budget is extracted along with travel words, map to itinerary
        if entities.get("duration") and any(w in lowered for w in ["trip", "plan", "itinerary", "visit", "to", "in", "day", "days", "ថ្ងៃ", "ដើរលេង"]):
            detected_intent = "itinerary"
        elif entities.get("budget") and any(w in lowered for w in ["trip", "plan", "itinerary", "days", "visit"]):
            detected_intent = "itinerary"

        confidence = 0.95 if matched_pattern else 0.75
        if detected_intent == "general_qa" and (entities.get("destination") or entities.get("category")):
            confidence = 0.85

        entities["language"] = detected_lang

        return {
            "intent": detected_intent,
            "confidence": confidence,
            "entities": entities
        }

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract entities:
        - destination
        - province
        - duration (int)
        - budget (float)
        - category
        - travel_style
        - date
        - time
        - number_of_people (int)
        - language
        """
        lowered = text.lower()
        entities = {}
        
        # 1. Destination / Province Extraction
        for prov_name, aliases in self.provinces.items():
            if any(alias in lowered for alias in aliases):
                entities["destination"] = prov_name
                entities["province"] = prov_name
                break

        # 2. Duration Extraction (e.g., 3-day, 4 days, 5 days, ៣ ថ្ងៃ)
        duration_match = re.search(r'(\d+|១|២|៣|៤|៥|៦|៧|៨|៩|១០)\s*(?:-|–)?\s*(?:day|days|night|nights|ថ្ងៃ|យប់)', lowered)
        if duration_match:
            raw_num = duration_match.group(1)
            kh_digits = {'១': '1', '២': '2', '៣': '3', '៤': '4', '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9', '១០': '10'}
            num_str = kh_digits.get(raw_num, raw_num)
            try:
                days_int = int(num_str)
                entities["duration"] = days_int
                entities["duration_days"] = days_int
            except Exception:
                pass

        # 3. Budget Extraction (e.g., $300, 300$, under $300, 300 USD, 300 dollars, ៣០០ ដុល្លារ)
        budget_match = (
            re.search(r'(?:under|below|less\s+than|max|budget\s+of)?\s*\$\s*(\d+(?:\.\d+)?)', lowered) or
            re.search(r'(\d+(?:\.\d+)?)\s*\$', lowered) or
            re.search(r'(\d+(?:\.\d+)?)\s*(?:usd|dollars?|ដុល្លារ)', lowered)
        )
        if budget_match:
            try:
                entities["budget"] = float(budget_match.group(1))
                entities["budget_usd"] = float(budget_match.group(1))
            except Exception:
                pass

        # 4. Category Extraction
        category_keywords = {
            "temple": ["temple", "temples", "angkor", "ancient", "ruins", "ប្រាសាទ", "អង្គរ"],
            "beach": ["beach", "island", "sea", "snorkeling", "diving", "ឆ្នេរ", "កោះ", "សមុទ្រ"],
            "museum": ["museum", "gallery", "exhibit", "history", "សារមន្ទីរ"],
            "restaurant": ["restaurant", "food", "dining", "cafe", "meal", "breakfast", "lunch", "dinner", "ហាងបាយ", "ភោជនីយដ្ឋាន"],
            "activity": ["activity", "tour", "circus", "bamboo train", "kayak", "trekking", "ស្ទូចត្រី", "សៀក"],
            "culture": ["culture", "dance", "apsara", "puppet", "heritage", "វប្បធម៌", "របាំ"],
            "festival": ["festival", "event", "water festival", "new year", "បុណ្យ"]
        }
        for cat_name, kws in category_keywords.items():
            if any(kw in lowered for kw in kws):
                entities["category"] = cat_name
                break

        # 5. Travel Style
        if any(w in lowered for w in ["luxury", "resort", "fine dining", "5 star", "high-end", "ប្រណីត"]):
            entities["travel_style"] = "luxury"
        elif any(w in lowered for w in ["budget", "backpacker", "cheap", "hostel", "low cost", "សន្សំសំចៃ"]):
            entities["travel_style"] = "budget"
        elif any(w in lowered for w in ["culture", "heritage", "history", "temples", "វប្បធម៌"]):
            entities["travel_style"] = "culture"
        elif any(w in lowered for w in ["adventure", "trekking", "nature", "jungle", "kayak", "ផ្សងព្រេង"]):
            entities["travel_style"] = "adventure"
        elif any(w in lowered for w in ["relax", "chill", "peaceful", "quiet", "beach", "លំហែ"]):
            entities["travel_style"] = "relaxation"

        # 6. Number of people
        people_match = re.search(r'(\d+)\s*(?:people|persons?|travelers?|adults?|guests?|នាក់)', lowered)
        if people_match:
            try:
                entities["number_of_people"] = int(people_match.group(1))
            except Exception:
                pass

        # 7. Time / Date extraction
        if "tomorrow" in lowered or "ថ្ងៃស្អែក" in lowered:
            entities["date"] = "tomorrow"
        elif "today" in lowered or "ថ្ងៃនេះ" in lowered:
            entities["date"] = "today"
        elif "this weekend" in lowered or "ចុងសប្តាហ៍នេះ" in lowered:
            entities["date"] = "this_weekend"

        return entities

intent_service = IntentService()
