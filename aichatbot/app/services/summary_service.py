from typing import Dict, Any, List, Optional
from app.services.tourism_service import tourism_service
from app.utils.text_utils import is_khmer_text

class SummaryService:
    def generate_summary(self, topic: str, target_lang: str = "km") -> Dict[str, Any]:
        """Generate structured summary for a destination or topic."""
        items = tourism_service.search_keyword(topic, limit=3)
        if not items:
            items = tourism_service.find_items_by_province(topic)
            
        if not items:
            if target_lang == "km":
                return {
                    "summary_text": f"មិនមានព័ត៌មានលម្អិតសម្រាប់ '{topic}' នៅក្នុងទិន្នន័យទេសចរណ៍ទេ។",
                    "topic": topic,
                    "found": False
                }
            else:
                return {
                    "summary_text": f"No detailed summary found for '{topic}' in the tourism database.",
                    "topic": topic,
                    "found": False
                }
                
        primary = items[0]
        name = primary.get("name_km") if target_lang == "km" and primary.get("name_km") else primary.get("name")
        province = primary.get("province_km") if target_lang == "km" and primary.get("province_km") else primary.get("province")
        desc = primary.get("description_km") if target_lang == "km" and primary.get("description_km") else primary.get("description")
        best_time = primary.get("best_time_to_visit", "N/A")
        duration = primary.get("estimated_duration", "N/A")
        activities = ", ".join(primary.get("activities", []))
        tips = "; ".join(primary.get("travel_tips", []))
        
        if target_lang == "km":
            text = (
                f"📍 **សង្ខេបរមណីយដ្ឋាន៖ {name}**\n\n"
                f"• **ទីតាំង៖** {province}\n"
                f"• **ពិពណ៌នា៖** {desc}\n"
                f"• **ពេលវេលាល្អបំផុត៖** {best_time}\n"
                f"• **រយៈពេលសសមស្រប៖** {duration}\n"
                f"• **សកម្មភាពពេញនិយម៖** {activities}\n"
                f"• **ប័ណ្ណណែនាំ៖** {tips}"
            )
        else:
            text = (
                f"📍 **Summary for {name}**\n\n"
                f"• **Location:** {province}\n"
                f"• **Description:** {desc}\n"
                f"• **Best Time to Visit:** {best_time}\n"
                f"• **Recommended Duration:** {duration}\n"
                f"• **Popular Activities:** {activities}\n"
                f"• **Travel Tips:** {tips}"
            )
            
        return {
            "summary_text": text,
            "topic": topic,
            "found": True,
            "item_details": primary
        }

    def generate_itinerary(self, destination: str, days: int = 3, target_lang: str = "km") -> str:
        """Generate structured day-by-day travel itinerary."""
        dest_items = tourism_service.find_items_by_province(destination)
        if not dest_items:
            dest_items = tourism_service.search_keyword(destination, limit=5)
            
        dest_name = destination.title()
        
        if target_lang == "km":
            lines = [f"🗓️ **ផែនការដំណើរកម្សាន្តទៅកាន់ {dest_name} រយៈពេល {days} ថ្ងៃ**\n"]
            for d in range(1, days + 1):
                lines.append(f"📌 **ថ្ងៃទី {d}**")
                lines.append("  • **ព្រឹក (Morning):** ទស្សនាទីតាំងប្រវត្តិសាស្ត្រ/ប្រាសាទសំខាន់ ពិសាអាហារព្រឹកក្នុងស្រុក (នំបញ្ចុក/កុយទាវ)")
                lines.append("  • **រសៀល (Afternoon):** ដើរកម្សាន្តតំបន់ធម្មជាតិ ឬសារមន្ទីរ និងញ៉ាំអាហារថ្ងៃត្រង់ (អាម៉ុក/ឡុកឡាក់)")
                lines.append("  • **ល្ងាច (Evening):** ទស្សនាថ្ងៃលិច ដើរផ្សាររាត្រី និងពិសាគ្រឿងសមុទ្រ/អាហាររាត្រី")
                lines.append("  • **មធ្យោបាយធ្វើដំណើរ៖** ជិះតុលតុល (PassApp/Grab) ឬរ៉ឺម៉កកង់បី")
                lines.append("  • **ប័ណ្ណណែនាំ៖** ពាក់សម្លៀកបំពាក់សមរម្យ យកឡេការពារកម្តៅថ្ងៃ និងទឹកពិសារតាមខ្លួន\n")
            lines.append("💡 *កំណត់ចំណាំ៖ តម្លៃ និងកាលវិភាគអាចផ្លាស់ប្តូរតាមរដូវកាល*")
        else:
            lines = [f"🗓️ **{days}-Day Travel Itinerary for {dest_name}**\n"]
            for d in range(1, days + 1):
                lines.append(f"📌 **Day {d}**")
                lines.append("  • **Morning:** Visit core heritage/temple highlights and enjoy local breakfast (Num Banh Chok/Kuy Teav).")
                lines.append("  • **Afternoon:** Explore nature or museums and savor Khmer lunch (Fish Amok/Beef Lok Lak).")
                lines.append("  • **Evening:** Watch the sunset, stroll night markets, and enjoy local dinner.")
                lines.append("  • **Transport Suggestion:** Remorque / Tuk-Tuk via PassApp or Grab.")
                lines.append("  • **Travel Tip:** Wear comfortable walking shoes, respectful attire, and sunscreen.\n")
            lines.append("💡 *Note: Itineraries can be customized based on season and interest.*")
            
        return "\n".join(lines)

summary_service = SummaryService()
