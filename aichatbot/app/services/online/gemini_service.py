import os
import json
import requests
from typing import List, Dict, Any, Optional, Iterator
from app.core.config import settings
from app.core.prompts import GEMINI_SYSTEM_INSTRUCTION

try:
    # pyrefly: ignore [missing-import]
    import google.genai as genai
    # pyrefly: ignore [missing-import]
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False

class GeminiOnlineService:
    def __init__(self):
        self.client = None
        self.last_used_model = settings.effective_online_model
        self._init_gemini_client()

    def _init_gemini_client(self):
        api_key = settings.effective_gemini_api_key
        if HAS_GOOGLE_GENAI and api_key:
            try:
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"GeminiOnlineService: Client init note: {e}")
                self.client = None

    def is_available(self) -> bool:
        """Check if Gemini API is configured with an API key."""
        return bool(settings.effective_gemini_api_key)

    def _get_models_priority(self) -> List[str]:
        models = [
            settings.effective_online_model,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-flash-lite-latest",
        ]
        seen = set()
        return [m for m in models if m and not (m in seen or seen.add(m))]

    def _build_content_parts(self, prompt: str, attachments: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        parts = []
        if attachments:
            for att in attachments:
                b64_data = att.get("data") or att.get("base64")
                mime = att.get("type") or att.get("mime_type") or "image/jpeg"
                if b64_data:
                    # Strip data URL prefix if present
                    if "," in b64_data:
                        b64_data = b64_data.split(",", 1)[1]
                    parts.append({
                        "inlineData": {
                            "mimeType": mime,
                            "data": b64_data
                        }
                    })
        parts.append({"text": prompt})
        return parts

    def generate_with_model(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, str]]:
        """
        Generate response from Google Gemini API and return {'text': str, 'model': str}.
        Tries high-speed active models with fast failover across all candidate models.
        """
        api_key = settings.effective_gemini_api_key.strip()
        if not api_key:
            return None

        sys_inst = system_instruction or GEMINI_SYSTEM_INSTRUCTION
        models_to_try = self._get_models_priority()
        per_model_timeout = min(max(settings.GEMINI_TIMEOUT_SECONDS, 8), 25)
        content_parts = self._build_content_parts(prompt, attachments)

        # 1. Direct REST API (Fastest with seamless model failover)
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                payload = {
                    "contents": [{"parts": content_parts}],
                    "systemInstruction": {"parts": [{"text": sys_inst}]},
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 4096
                    }
                }
                res = requests.post(url, json=payload, timeout=per_model_timeout)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        non_thought = [p.get("text", "") for p in parts if p.get("text") and not p.get("thought")]
                        texts = non_thought if non_thought else [p.get("text", "") for p in parts if p.get("text")]
                        if texts:
                            ans = "".join(texts).strip()
                            if len(ans) > 3:
                                self.last_used_model = model
                                return {"text": ans, "model": model}
                elif res.status_code == 400:
                    err_text = res.text
                    if "API_KEY_INVALID" in err_text or "key not valid" in err_text.lower():
                        print("GeminiOnlineService: API Key is invalid.")
                        return None
                    print(f"GeminiOnlineService: Model {model} status 400 ({err_text[:120]}), trying next...")
                    continue
                elif res.status_code in [404, 429, 500, 502, 503, 504]:
                    print(f"GeminiOnlineService: Model {model} status {res.status_code}, trying next model...")
                    continue
                elif res.status_code in [401, 403]:
                    err_text = res.text
                    print(f"GeminiOnlineService: Auth error ({res.status_code}): {err_text[:120]}")
                    return None
            except Exception as ex:
                print(f"GeminiOnlineService REST note ({model}): {ex}")
                continue

        # 2. SDK Call fallback
        if HAS_GOOGLE_GENAI and self.client:
            for sdk_model in models_to_try[:3]:
                try:
                    response = self.client.models.generate_content(
                        model=sdk_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=sys_inst,
                            temperature=0.4,
                            max_output_tokens=4096,
                        )
                    )
                    if response and hasattr(response, 'text') and response.text:
                        self.last_used_model = sdk_model
                        return {"text": response.text.strip(), "model": sdk_model}
                except Exception as e:
                    print(f"GeminiOnlineService SDK note ({sdk_model}): {e}")
                    continue

        return None

    def generate_stream(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Iterator[str]:
        """
        Generate streaming tokens from Gemini using REST SSE stream.
        Yields chunks of text as they arrive.
        """
        api_key = settings.effective_gemini_api_key.strip()
        if not api_key:
            return

        sys_inst = system_instruction or GEMINI_SYSTEM_INSTRUCTION
        models_to_try = self._get_models_priority()
        content_parts = self._build_content_parts(prompt, attachments)

        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={api_key}"
                payload = {
                    "contents": [{"parts": content_parts}],
                    "systemInstruction": {"parts": [{"text": sys_inst}]},
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 4096
                    }
                }
                with requests.post(url, json=payload, stream=True, timeout=30) as res:
                    if res.status_code == 200:
                        res.encoding = "utf-8"
                        streamed_any = False
                        for raw_line in res.iter_lines():
                            if not raw_line:
                                continue
                            if isinstance(raw_line, bytes):
                                line = raw_line.decode("utf-8", errors="replace")
                            else:
                                line = raw_line

                            if line.startswith("data: "):
                                json_str = line[6:].strip()
                                if json_str == "[DONE]":
                                    break
                                try:
                                    chunk_data = json.loads(json_str)
                                    cands = chunk_data.get("candidates", [])
                                    if cands:
                                        parts = cands[0].get("content", {}).get("parts", [])
                                        for p in parts:
                                            txt = p.get("text", "")
                                            if txt and not p.get("thought"):
                                                # Recover if upstream sent Latin-1 mojibake
                                                if any(0xE0 <= ord(c) <= 0xEF for c in txt):
                                                    try:
                                                        txt = txt.encode("latin-1").decode("utf-8")
                                                    except Exception:
                                                        pass
                                                streamed_any = True
                                                yield txt
                                except Exception:
                                    pass
                        if streamed_any:
                            self.last_used_model = model
                            return
                    elif res.status_code in [404, 429, 500, 503]:
                        continue
            except Exception as e:
                print(f"GeminiOnlineService stream error ({model}): {e}")
                continue

        # If streaming didn't succeed, fallback to standard generation and yield as single block
        fallback = self.generate_with_model(prompt, system_instruction, attachments)
        if fallback and fallback.get("text"):
            yield fallback["text"]

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Backwards-compatible generate method returning plain text."""
        res = self.generate_with_model(prompt, system_instruction)
        return res["text"] if res else None

gemini_online_service = GeminiOnlineService()
