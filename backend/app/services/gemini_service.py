import os
import time
import json
import base64
import logging
import requests
from typing import Optional, Dict, Any, List
from ..config import settings

logger = logging.getLogger("agriwise.gemini")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.primary_model = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.fallback_models = ["gemini-2.0-flash", "gemini-1.5-flash-latest"]
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self._last_status = {"checked": False, "live": False, "message": "Initialized"}
        self._backoff_until = 0

    def refresh_key(self, new_key: Optional[str] = None):
        """Update API key dynamically at runtime."""
        if new_key:
            self.api_key = new_key.strip()
        else:
            self.api_key = os.getenv("GEMINI_API_KEY", settings.GEMINI_API_KEY).strip()
        self._last_status["checked"] = False
        self._backoff_until = 0

    def check_health(self) -> Dict[str, Any]:
        """Verify API key validity against Google Generative Language API."""
        if not self.api_key:
            return {
                "configured": False,
                "live": False,
                "message": "No GEMINI_API_KEY configured."
            }

        url = f"{self.base_url}/{self.primary_model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": "Ping"}]}]
        }
        try:
            resp = requests.post(url, json=payload, timeout=3)
            if resp.status_code == 200:
                self._backoff_until = 0
                self._last_status = {
                    "configured": True,
                    "live": True,
                    "message": "Gemini API connection healthy and responding.",
                    "model": self.primary_model,
                    "masked_key": f"{self.api_key[:6]}...{self.api_key[-4:]}" if len(self.api_key) > 10 else "***"
                }
                return self._last_status
            else:
                self._backoff_until = time.time() + 120  # 2 minute circuit breaker on error
                err_data = resp.json().get("error", {})
                err_msg = err_data.get("message", resp.text)
                self._last_status = {
                    "configured": True,
                    "live": False,
                    "status_code": resp.status_code,
                    "message": f"Gemini API returned error: {err_msg}",
                    "reason": err_data.get("status", "HTTP_ERROR"),
                    "masked_key": f"{self.api_key[:6]}...{self.api_key[-4:]}" if len(self.api_key) > 10 else "***"
                }
                return self._last_status
        except Exception as e:
            self._backoff_until = time.time() + 120
            self._last_status = {
                "configured": True,
                "live": False,
                "message": f"Connection error: {str(e)}",
                "masked_key": f"{self.api_key[:6]}...{self.api_key[-4:]}" if len(self.api_key) > 10 else "***"
            }
            return self._last_status

    def generate_chat_response(
        self,
        query: str,
        context: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        language_preference: str = "en"
    ) -> Optional[str]:
        """
        Generates an agronomic response using Gemini API.
        Returns the text response on success, or None if the API is suspended/unavailable.
        """
        if not self.api_key or time.time() < self._backoff_until:
            return None

        # Build comprehensive system agronomic instructions
        system_prompt = (
            "You are Rakshak AI, an elite Agricultural & Agronomy Copilot on the AgriWise platform. "
            "You serve Indian farmers, FPOs, and agricultural buyers. Your recommendations strictly adhere to "
            "ICAR (Indian Council of Agricultural Research), State Agricultural Universities (PAU, TNAU, GBPUAT), "
            "and CIBRC (Central Insecticide Board) protocols.\n\n"
            "Guidelines:\n"
            "1. Give direct, practical, step-by-step advice tailored to Indian farming conditions.\n"
            "2. Prioritize Integrated Pest Management (IPM), cultural practices, and biological controls first.\n"
            "3. If chemical controls are necessary, specify exact chemical formulation, standard dilution (e.g. g/L or ml/L), and safe application window.\n"
            "4. Include safety precautions (spray mask, PPE, waiting period before harvest/PHI).\n"
            "5. If relevant, mention weather considerations (e.g. avoid spraying before rain or in high winds).\n"
            "6. Answer in the same language or dialect as the user's inquiry (English, Hindi, Hinglish, Punjabi, etc.)."
        )

        models_to_try = [self.primary_model] + [m for m in self.fallback_models if m != self.primary_model]

        for model in models_to_try:
            url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
            
            # Formulate user content with RAG context
            prompt_text = ""
            if context:
                prompt_text += f"[Verified ICAR Reference Context]:\n{context}\n\n"
            prompt_text += f"[Farmer Question]: {query}"

            contents = []
            # Append prior conversation turns if provided
            if chat_history:
                for msg in chat_history[-6:]:
                    role = "user" if msg.get("role") == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

            contents.append({"role": "user", "parts": [{"text": prompt_text}]})

            payload = {
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.35,
                    "topP": 0.9,
                    "maxOutputTokens": 1024
                }
            }

            try:
                resp = requests.post(url, json=payload, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                elif resp.status_code in (401, 403):
                    # Key is unauthorized or project suspended - trying other models with same key won't help
                    logger.warning(f"Gemini API key rejected ({resp.status_code}): {resp.text[:160]}")
                    break
                else:
                    logger.warning(f"Gemini API ({model}) returned {resp.status_code}: {resp.text[:160]}")
            except Exception as e:
                logger.warning(f"Gemini API request failed for {model}: {e}")
                break

        return None

    def analyze_disease_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        crop_hint: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Analyzes a crop leaf photo using Gemini multimodal vision.
        Returns structured diagnosis dict, or None if Gemini is unavailable.
        """
        if not self.api_key or time.time() < self._backoff_until:
            return None

        prompt = (
            "Analyze this crop foliage/leaf image for plant diseases or nutrient deficiencies as an ICAR plant pathologist.\n"
            f"{f'User indicates crop is likely: {crop_hint}.' if crop_hint else ''}\n"
            "Return a strictly valid JSON object (no markdown code blocks, just raw JSON) with this exact schema:\n"
            "{\n"
            '  "crop_name": "Crop name (e.g. Tomato, Wheat, Potato, Rice)",\n'
            '  "predicted_disease": "Specific disease or Healthy (e.g. Tomato Early Blight)",\n'
            '  "pathogen": "Causal organism with Latin name (e.g. Alternaria solani Fungus)",\n'
            '  "confidence": 0.94,\n'
            '  "severity": "Low" | "Moderate" | "Severe",\n'
            '  "symptoms": "Detailed visual symptoms observed",\n'
            '  "management_guide": {\n'
            '    "organic": ["Organic remedy step 1", "Organic step 2"],\n'
            '    "chemical": ["Exact chemical with dosage e.g. Mancozeb 75% WP @ 2.5 g/L"],\n'
            '    "prevention": "Preventive practices, crop rotation, irrigation tips"\n'
            '  },\n'
            '  "is_uncertain": false\n'
            "}"
        )

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        url = f"{self.base_url}/{self.primary_model}:generateContent?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        try:
            resp = requests.post(url, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_text = parts[0].get("text", "").strip()
                        # Clean potential markdown fences
                        if raw_text.startswith("```json"):
                            raw_text = raw_text[7:]
                        if raw_text.startswith("```"):
                            raw_text = raw_text[3:]
                        if raw_text.endswith("```"):
                            raw_text = raw_text[:-3]
                        parsed = json.loads(raw_text.strip())
                        return parsed
        except Exception as e:
            logger.warning(f"Gemini Vision call failed: {e}")

        return None

gemini_service = GeminiService()
