import os
import sqlite3
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

class MemoryService:
    def __init__(self, db_path: str = settings.SQLITE_DB_PATH):
        self.db_path = db_path
        self.json_backup_path = os.path.join(os.path.dirname(self.db_path), "chat_history.json")
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._restore_from_json_if_needed()

    def _get_connection(self):
        return sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("PRAGMA journal_mode=WAL;")
                cursor.execute("PRAGMA busy_timeout=30000;")
            except Exception as e:
                print(f"MemoryService PRAGMA note: {e}")

            # Messages table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Session Metadata table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    destination TEXT,
                    duration TEXT,
                    budget REAL,
                    travel_style TEXT,
                    language TEXT,
                    preferences TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Auto-migrate missing columns for existing databases
            cursor.execute("PRAGMA table_info(sessions)")
            existing_cols = {col[1] for col in cursor.fetchall()}
            for col_name, col_type in [
                ("budget", "REAL"),
                ("travel_style", "TEXT"),
                ("language", "TEXT"),
                ("preferences", "TEXT"),
                ("title", "TEXT")
            ]:
                if col_name not in existing_cols:
                    try:
                        cursor.execute(f"ALTER TABLE sessions ADD COLUMN {col_name} {col_type};")
                    except Exception as e:
                        print(f"MemoryService column migration note ({col_name}): {e}")
            conn.commit()

    def _restore_from_json_if_needed(self):
        """Restore chat history from backup if SQLite database is newly created."""
        if not os.path.exists(self.json_backup_path):
            return
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM messages")
                count = cursor.fetchone()[0]
                if count == 0:
                    with open(self.json_backup_path, "r", encoding="utf-8") as f:
                        history_data = json.load(f)
                        if isinstance(history_data, list):
                            for sess in history_data:
                                sid = sess.get("session_id")
                                msgs = sess.get("messages", [])
                                for m in msgs:
                                    role = m.get("role") or m.get("sender") or "user"
                                    if role == "ai":
                                        role = "assistant"
                                    content = m.get("content") or m.get("message") or ""
                                    if sid and content:
                                        cursor.execute(
                                            "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
                                            (sid, role, content)
                                        )
                                cursor.execute(
                                    "INSERT OR REPLACE INTO sessions (session_id, updated_at) VALUES (?, CURRENT_TIMESTAMP)",
                                    (sid,)
                                )
                            conn.commit()
        except Exception as e:
            print(f"MemoryService JSON restore note: {e}")

    def _sync_to_json_file(self):
        """Export active chat sessions to storage backup."""
        try:
            sessions = self.get_all_sessions()
            full_history = []
            for s in sessions:
                sid = s["session_id"]
                msgs = self.get_history(sid, limit=200)
                full_history.append({
                    "session_id": sid,
                    "title": s["title"],
                    "updated_at": s["updated_at"],
                    "message_count": s["message_count"],
                    "messages": msgs
                })
            with open(self.json_backup_path, "w", encoding="utf-8") as f:
                json.dump(full_history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"MemoryService JSON sync note: {e}")

    def get_or_create_session_id(self, session_id: Optional[str] = None) -> str:
        if not session_id or not session_id.strip():
            return f"session_{uuid.uuid4().hex[:8]}"
        return session_id.strip()

    def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            meta_json = json.dumps(metadata) if metadata else None
            cursor.execute(
                "INSERT INTO messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?)",
                (session_id, role, content, meta_json)
            )
            cursor.execute(
                "INSERT INTO sessions (session_id, updated_at) VALUES (?, CURRENT_TIMESTAMP) ON CONFLICT(session_id) DO UPDATE SET updated_at=CURRENT_TIMESTAMP",
                (session_id,)
            )
            conn.commit()
        self._sync_to_json_file()

    def update_session_metadata(
        self,
        session_id: str,
        destination: Optional[str] = None,
        duration: Optional[str] = None,
        budget: Optional[float] = None,
        travel_style: Optional[str] = None,
        language: Optional[str] = None,
        preferences: Optional[Dict[str, Any]] = None
    ):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT destination, duration, budget, travel_style, language, preferences FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            
            cur_dest = destination or (row[0] if row else None)
            cur_dur = duration or (row[1] if row else None)
            cur_bud = budget if budget is not None else (row[2] if row else None)
            cur_sty = travel_style or (row[3] if row else None)
            cur_lang = language or (row[4] if row else None)
            cur_pref = json.dumps(preferences) if preferences else (row[5] if row else None)
            
            cursor.execute("""
                INSERT INTO sessions (session_id, destination, duration, budget, travel_style, language, preferences, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(session_id) DO UPDATE SET
                    destination = COALESCE(excluded.destination, sessions.destination),
                    duration = COALESCE(excluded.duration, sessions.duration),
                    budget = COALESCE(excluded.budget, sessions.budget),
                    travel_style = COALESCE(excluded.travel_style, sessions.travel_style),
                    language = COALESCE(excluded.language, sessions.language),
                    preferences = COALESCE(excluded.preferences, sessions.preferences),
                    updated_at = CURRENT_TIMESTAMP
            """, (session_id, cur_dest, cur_dur, cur_bud, cur_sty, cur_lang, cur_pref))
            conn.commit()

    def get_session_metadata(self, session_id: str) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT destination, duration, budget, travel_style, language, preferences FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            if row:
                prefs = None
                if row[5]:
                    try:
                        prefs = json.loads(row[5])
                    except Exception:
                        pass
                return {
                    "destination": row[0],
                    "duration": row[1],
                    "budget": row[2],
                    "travel_style": row[3],
                    "language": row[4],
                    "preferences": prefs
                }
            return {}

    def get_history(self, session_id: str, limit: int = settings.MAX_HISTORY_MESSAGES) -> List[Dict[str, str]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
                (session_id, limit)
            )
            rows = cursor.fetchall()
            return [{"role": r[0], "content": r[1]} for r in reversed(rows)]

    def delete_session(self, session_id: str) -> bool:
        sid = session_id.strip()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE session_id = ? OR session_id = ? OR session_id = ?", (sid, f"#{sid}", sid.lstrip("#")))
            cursor.execute("DELETE FROM sessions WHERE session_id = ? OR session_id = ? OR session_id = ?", (sid, f"#{sid}", sid.lstrip("#")))
            conn.commit()
        self._sync_to_json_file()
        return True

    def delete_all_sessions(self) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages")
            cursor.execute("DELETE FROM sessions")
            conn.commit()
        self._sync_to_json_file()
        return True

    def purge_expired_sessions(self, max_age_hours: float = 72.0):
        """Automatically delete chat sessions and messages older than max_age_hours (default 72 hours / 3 days)."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "DELETE FROM messages WHERE datetime(created_at) < datetime('now', ?)",
                    (f"-{int(max_age_hours * 60)} minutes",)
                )
                cursor.execute("""
                    DELETE FROM sessions 
                    WHERE datetime(updated_at) < datetime('now', ?)
                       OR session_id NOT IN (SELECT DISTINCT session_id FROM messages)
                """, (f"-{int(max_age_hours * 60)} minutes",))
                conn.commit()
        except Exception as e:
            print(f"MemoryService purge note: {e}")

    def get_structured_conversation_summary(self, session_id: str, language: str = "en") -> Dict[str, Any]:
        """Generate structured conversation recap based on session messages and metadata."""
        is_km = "km" in language
        history = self.get_history(session_id, limit=30)
        meta = self.get_session_metadata(session_id)
        
        user_msgs = [m["content"] for m in history if m.get("role") == "user"]
        assistant_msgs = [m["content"] for m in history if m.get("role") in ["assistant", "ai"]]

        # Extract topics
        topics = []
        full_text = " ".join(user_msgs).lower()
        if any(w in full_text for w in ["angkor", "temple", "bayon", "តាព្រហ្ម", "ប្រាសាទ", "វត្ត"]):
            topics.append("Angkor & Ancient Temples" if not is_km else "ប្រាសាទបុរាណ និងអង្គរ")
        if any(w in full_text for w in ["itinerary", "plan", "day", "trip", "គម្រោង", "ដើរលេង"]):
            topics.append("Custom Travel Itinerary" if not is_km else "គម្រោងដំណើរកម្សាន្ត")
        if any(w in full_text for w in ["food", "dish", "amok", "eat", "restaurant", "ម្ហូប", "អាហារ", "អាម៉ុក", "ឡុកឡាក់"]):
            topics.append("Khmer Cuisine & Dining" if not is_km else "ម្ហូបអាហារ និងភោជនីយដ្ឋានខ្មែរ")
        if any(w in full_text for w in ["weather", "rain", "temperature", "temp", "អាកាសធាតុ", "ភ្លៀង"]):
            topics.append("Real-Time Weather" if not is_km else "ការព្យាករណ៍អាកាសធាតុ")
        if any(w in full_text for w in ["riel", "dollar", "exchange", "khr", "usd", "currency", "ប្តូរលុយ", "រៀល"]):
            topics.append("Currency Exchange & Budget" if not is_km else "អត្រាប្តូរប្រាក់ និងថវិកា")
        if any(w in full_text for w in ["beach", "koh rong", "island", "sea", "ឆ្នេរ", "កោះ", "កោះរ៉ុង"]):
            topics.append("Tropical Islands & Beaches" if not is_km else "កោះ និងឆ្នេរសមុទ្រ")
            
        if not topics:
            topics.append("Cambodia Tourism Inquiry" if not is_km else "ព័ត៌មានទេសចរណ៍កម្ពុជា")

        dest = meta.get("destination") or "Siem Reap"
        style = meta.get("travel_style") or "cultural"
        
        # Formulate structured recap text
        topic_bullets = "\n".join([f"- {t}" for t in topics])
        if is_km:
            summary_text = (
                f"**សង្ខេបកិច្ចសន្ទនារបស់យើងរហូតមកដល់ពេលនេះ៖**\n\n"
                f"📍 **គោលដៅទេសចរណ៍ចម្បង៖** {dest}\n"
                f"✨ **ប្រធានបទដែលបានពិភាក្សា៖**\n{topic_bullets}\n\n"
                f"💬 **ចំនួនសារសរុប៖** {len(history)} សារ\n\n"
                f"តើអ្នកចង់ឱ្យខ្ញុំជួយលម្អិតបន្ថែមលើប្រធានបទណាមួយទៀតដែរឬទេ?"
            )
        else:
            summary_text = (
                f"**Here is a summary of our conversation so far:**\n\n"
                f"📍 **Active Destination:** {dest}\n"
                f"✨ **Topics Discussed:**\n{topic_bullets}\n\n"
                f"💬 **Total Conversation Messages:** {len(history)}\n\n"
                f"Would you like to explore any of these topics further or plan the next step of your journey?"
            )

        return {
            "type": "conversation_summary",
            "topics": topics,
            "preferences": [style] if style else [],
            "active_destination": dest,
            "previous_plans": [f"{dest} Trip Exploration"],
            "message_count": len(history),
            "summary_text": summary_text
        }

    def rename_session(self, session_id: str, title: str) -> bool:
        """Rename a specific chat session with a custom user-defined title."""
        sid = session_id.strip()
        clean_title = title.strip()[:100]
        if not clean_title:
            return False
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sessions (session_id, title, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(session_id) DO UPDATE SET title = ?, updated_at = CURRENT_TIMESTAMP
            """, (sid, clean_title, clean_title))
            conn.commit()
        self._sync_to_json_file()
        return True

    def search_sessions(self, query: str) -> List[Dict[str, Any]]:
        """Search sessions by matching title or message content."""
        clean_q = f"%{query.strip()}%"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT s.session_id, s.title, MAX(m.created_at) as last_updated, COUNT(m.id) as msg_count
                FROM sessions s
                LEFT JOIN messages m ON s.session_id = m.session_id
                WHERE s.title LIKE ? OR m.content LIKE ?
                GROUP BY s.session_id
                ORDER BY last_updated DESC
            """, (clean_q, clean_q))
            rows = cursor.fetchall()
            return [
                {
                    "session_id": r[0],
                    "title": r[1] or "New Chat",
                    "updated_at": r[2],
                    "message_count": r[3]
                }
                for r in rows
            ]

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        self.purge_expired_sessions(max_age_hours=72.0)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    m.session_id, 
                    MAX(m.created_at) as last_updated, 
                    COUNT(m.id) as message_count,
                    (SELECT content FROM messages WHERE session_id = m.session_id AND role = 'user' ORDER BY id ASC LIMIT 1) as first_user_msg,
                    s.title as custom_title
                FROM messages m
                LEFT JOIN sessions s ON m.session_id = s.session_id
                GROUP BY m.session_id
                ORDER BY last_updated DESC
            """)
            rows = cursor.fetchall()
            
            sessions = []
            for r in rows:
                sid, last_updated, msg_count, raw_title, custom_title = r[0], r[1], r[2], r[3], r[4]
                if custom_title and custom_title.strip():
                    title = custom_title.strip()
                elif raw_title and raw_title.strip():
                    clean_t = " ".join(raw_title.strip().split())
                    title = clean_t[:45] + ("..." if len(clean_t) > 45 else "")
                else:
                    title = "New Chat"
                
                sessions.append({
                    "session_id": sid,
                    "updated_at": last_updated,
                    "message_count": msg_count,
                    "title": title
                })
            return sessions

memory_service = MemoryService()
