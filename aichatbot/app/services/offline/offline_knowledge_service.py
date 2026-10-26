import re
from typing import Dict, Any, Optional
from app.utils.text_utils import is_khmer_text

class OfflineKnowledgeService:
    def synthesize_response(self, message: str, context: Optional[str] = None, is_matched: bool = False) -> str:
        """
        Synthesize fluent, conversational responses purely from local database records
        and cached Cambodian knowledge when internet and local LLMs are unreachable.
        """
        is_km = is_khmer_text(message)
        clean_msg = message.strip()

        # 1. Quick safe arithmetic calculation if user entered a mathematical expression
        math_match = re.match(r'^\s*([0-9\.\s\+\-\*\/\(\)\^]+)\s*=?\s*$', clean_msg)
        if math_match:
            expr = math_match.group(1).replace('^', '**')
            try:
                # Safe evaluation restricted to numbers and basic operators
                if re.match(r'^[0-9\.\s\+\-\*\/\(\)]+$', expr):
                    result = eval(expr, {"__builtins__": None}, {})
                    if is_km:
                        return f"🔢 **លទ្ធផលគណនា:** `{clean_msg}` = **{result}**"
                    return f"🔢 **Calculation Result:** `{clean_msg}` = **{result}**"
            except Exception:
                pass

        # 2. Transform matched database context into structured natural prose
        if context and context.strip():
            ctx_data = {}
            for line in context.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    ctx_data[k.strip().upper()] = v.strip()

            name = ctx_data.get("NAME") or "Cambodia Destination / Topic"
            desc = ctx_data.get("DESCRIPTION (KM)" if is_km else "DESCRIPTION (EN)") or ctx_data.get("DESCRIPTION (EN)") or ctx_data.get("DESCRIPTION (KM)") or ""
            location = ctx_data.get("PROVINCE/LOCATION") or ctx_data.get("PROVINCE")
            attractions = ctx_data.get("POPULAR ATTRACTIONS") or ctx_data.get("TOP ATTRACTIONS")
            opening = ctx_data.get("OPENING HOURS")
            fee = ctx_data.get("ENTRANCE FEE") or ctx_data.get("PRICE")
            best_time = ctx_data.get("BEST TIME TO VISIT") or ctx_data.get("BEST TIME")

            if is_km:
                paragraphs = [f"**{name}**\n\n{desc}"]
                details = []
                if location:
                    details.append(f"📍 **ទីតាំង:** {location}")
                if opening:
                    details.append(f"⏰ **ម៉ោងបើក:** {opening}")
                if fee:
                    details.append(f"🎟️ **សំបុត្រ:** {fee}")
                if best_time:
                    details.append(f"🗓️ **រដូវល្អបំផុត:** {best_time}")
                if attractions:
                    details.append(f"✨ **កន្លែងល្បីៗ:** {attractions}")
                if details:
                    paragraphs.append("\n".join(details))
                paragraphs.append("តើលោកអ្នកចង់ឱ្យខ្ញុំជួយផ្ដល់ព័ត៌មានបន្ថែម ឬរៀបចំគម្រោងលម្អិតទេ?")
                return "\n\n".join(paragraphs)
            else:
                paragraphs = [f"**{name}**\n\n{desc}"]
                details = []
                if location:
                    details.append(f"📍 **Location:** {location}")
                if opening:
                    details.append(f"⏰ **Hours:** {opening}")
                if fee:
                    details.append(f"🎟️ **Admission:** {fee}")
                if best_time:
                    details.append(f"🗓️ **Best Time to Visit:** {best_time}")
                if attractions:
                    details.append(f"✨ **Top Highlights:** {attractions}")
                if details:
                    paragraphs.append("\n".join(details))
                paragraphs.append("Would you like more details or guidance related to this topic?")
                return "\n\n".join(paragraphs)

        # 3. General overview response
        if is_km:
            return (
                "**សូមស្វាគមន៍មកកាន់ AngkorVers AI** *(ទម្រង់ក្រៅបណ្តាញ - Offline Mode)*\n\n"
                "បច្ចុប្បន្នប្រព័ន្ធកំពុងដំណើរការក្នុងទម្រង់មូលដ្ឋានទិន្នន័យក្រៅបណ្តាញ។ ខ្ញុំអាចជួយផ្ដល់ព័ត៌មានអំពី៖\n"
                "- 🏛️ **រាជធានី និងខេត្តទាំង ២៥:** ភ្នំពេញ, សៀមរាប, ព្រះសីហនុ, កំពត, បាត់ដំបង និងខេត្តដទៃទៀត\n"
                "- 👑 **ប្រវត្តិសាស្ត្រ និងបេតិកភណ្ឌ:** ប្រាសាទអង្គរវត្ត, ប្រាសាទព្រះវិហារ, សំបូរព្រៃគុក, កោះកេរ\n"
                "- 🍲 **ម្ហូបអាហារ និងប្រពៃណីខ្មែរ:** អាម៉ុក, ឡុកឡាក់, នំបញ្ចុក, ពិធីបុណ្យជាតិ\n"
                "- 💱 **ការចាយប្រាក់:** អត្រាប្តូរប្រាក់រៀល (KHR) និងដុល្លារ (USD)\n\n"
                "ដើម្បីទទួលបានការឆ្លើយតបស៊ីជម្រៅលើការសរសេរកូដ គណិតវិទ្យា និងចំណេះដឹងទូទៅ សូមភ្ជាប់ការតភ្ជាប់អ៊ីនធឺណិតដើម្បីដំណើរការជាមួយ Online AI (Gemini)។"
            )
        else:
            return (
                "**Welcome to AngkorVers AI** *(Offline Local Knowledge Mode)*\n\n"
                "The system is currently operating in offline mode. I can answer inquiries with verified local records on:\n"
                "- 🏛️ **Cambodia's 25 Administrative Units:** Phnom Penh, Siem Reap, Sihanoukville, Kampot, Battambang, and all 24 provinces\n"
                "- 👑 **World Heritage & History:** Angkor Wat, Preah Vihear, Sambor Prei Kuk, Koh Ker, and the Khmer Empire\n"
                "- 🍲 **Khmer Cuisine & Culture:** Fish Amok, Lok Lak, Nom Banh Chok, national festivals, and traditions\n"
                "- 💱 **Practical Travel Information:** Currency exchange (USD/KHR), transportation, and weather\n\n"
                "For advanced general inquiries, coding solutions, and deep research, please connect to online mode to utilize Gemini cloud intelligence."
            )

offline_knowledge_service = OfflineKnowledgeService()
