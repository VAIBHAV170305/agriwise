import os
import re
import json
import logging
from typing import Optional, List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .gemini_service import gemini_service
from .expert_knowledge import CLINICAL_SOLUTIONS

logger = logging.getLogger("agriwise.rag")

class RAGAssistantService:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.doc_vectors = None
        self._load_documents()

    def _load_documents(self):
        curr_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        json_path = os.path.join(curr_dir, "data", "agricultural_knowledge.json")
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load agricultural_knowledge.json: {e}")
                self.documents = []

        if self.documents:
            corpus = [
                f"{doc.get('title', '')}. {doc.get('category', '')}. {doc.get('crop', '')}. {doc.get('content', '')}"
                for doc in self.documents
            ]
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            self.doc_vectors = self.vectorizer.fit_transform(corpus)

    def is_hindi(self, text: str) -> bool:
        """Detects if query is written in Devanagari script or Hindi Romanized (Hinglish)."""
        # Devanagari check
        if re.search(r'[\u0900-\u097F]', text):
            return True
        # Common Hinglish terms check
        hinglish_words = [
            "kya", "hai", "kaise", "ilaj", "davai", "dawa", "karein", "kare", "peeli", 
            "patti", "keeda", "safed", "makkhi", "gehun", "tamatar", "dhan", "sarson",
            "kisan", "paani", "mitti", "khad", "bigha", "sundhi", "chhidkaav", "rog"
        ]
        tokens = text.lower().split()
        return any(w in tokens for w in hinglish_words)

    def match_clinical_solution(self, query: str) -> Optional[Dict[str, Any]]:
        """Matches clinical problems by symptom and crop overlap."""
        q_clean = query.lower()
        tokens = set(re.findall(r'\b[a-z0-9]+\b', q_clean))

        best_match = None
        max_matches = 0

        for sol in CLINICAL_SOLUTIONS:
            matches = 0
            for kw in sol["keywords"]:
                if " " in kw:
                    if kw in q_clean:
                        matches += 3
                else:
                    if kw in tokens:
                        matches += 1

            if matches > max_matches and matches >= 2:
                max_matches = matches
                best_match = sol

        return best_match

    def retrieve_context(self, query: str, top_k: int = 3) -> tuple[List[Dict[str, Any]], str]:
        """Finds top relevant reference documents for the query."""
        if not self.vectorizer or not self.documents or self.doc_vectors is None:
            return [], ""

        try:
            query_vector = self.vectorizer.transform([query])
            scores = cosine_similarity(query_vector, self.doc_vectors)[0]
            top_indices = scores.argsort()[::-1]

            retrieved = []
            context_blocks = []
            for idx in top_indices:
                score = float(scores[idx])
                if score < 0.04 and len(retrieved) >= 1:
                    break
                doc = self.documents[idx]
                retrieved.append({
                    "title": doc.get("title", "Agricultural Advisory"),
                    "category": doc.get("category", "General"),
                    "crop": doc.get("crop", "All"),
                    "relevance_score": round(score, 2),
                    "snippet": doc.get("content", "")[:240] + "...",
                    "source": doc.get("source", "ICAR Extension")
                })
                context_blocks.append(f"[{doc.get('title')} - {doc.get('source')}]:\n{doc.get('content')}")
                if len(retrieved) >= top_k:
                    break

            return retrieved, "\n\n".join(context_blocks)
        except Exception as e:
            logger.warning(f"Error in context retrieval: {e}")
            return [], ""

    def search_and_generate(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Main entry point for farmer questions.
        1. Checks for exact clinical problem solution.
        2. Queries Gemini API if operational.
        3. Falls back to verified clinical knowledge synthesizer.
        """
        clean_query = query.strip()
        retrieved_sources, context_str = self.retrieve_context(clean_query, top_k=3)

        # 1. Attempt Live Gemini Generation if key is valid
        gemini_text = gemini_service.generate_chat_response(
            query=clean_query,
            context=context_str if context_str else None,
            chat_history=conversation_history,
            language_preference=language
        )

        if gemini_text:
            return {
                "response": gemini_text,
                "sources": retrieved_sources,
                "disclaimer": "Generated by Google Gemini 1.5 with ICAR Verified Agronomic Grounding.",
                "engine": "gemini-live"
            }

        # 2. Autonomous Clinical Expert Engine (Exact Desired Solutions)
        synthesized_text = self._synthesize_clinical_response(clean_query, retrieved_sources)

        return {
            "response": synthesized_text,
            "sources": retrieved_sources,
            "disclaimer": "Rakshak Agronomic Intelligence Engine (Adhering to ICAR, PAU, TNAU & CIBRC Guidelines).",
            "engine": "rakshak-icar-engine"
        }

    def _synthesize_clinical_response(
        self,
        query: str,
        sources: List[Dict[str, Any]]
    ) -> str:
        """
        Synthesizes precise, actionable solutions matching farmer queries.
        Handles symptoms, dosages, organic remedies, weather safeguards, and Hindi queries.
        """
        q_lower = query.lower()
        hindi_mode = self.is_hindi(query)

        # Conversational greeting check
        greeting_words = ["hello", "hi", "hey", "namaste", "namaskar", "sat sri akaal", "kem cho", "ram ram", "pranam"]
        tokens = query.lower().split()
        if len(tokens) <= 3 and any(w in tokens for w in greeting_words):
            if hindi_mode:
                return (
                    "**नमस्ते किसान भाई!** मैं **रक्षक एआई (Rakshak AI)** हूँ, आपका डिजिटल कृषि सलाहकार।\n\n"
                    "मैं आपकी इन विषयों में सटीक सहायता कर सकता हूँ:\n"
                    "• **फसल रोग व कीट नियंत्रण**: पत्तियों पर धब्बे, पीलापन, सुंडी, सफेद मक्खी, माहू का इलाज व दवाई की मात्रा\n"
                    "• **खाद व उर्वरक अनुपात**: गेहूं, धान, आलू, गन्ने में DAP, यूरिया, पोटाश व जिंक प्रति एकड़/बीघा सही समय पर\n"
                    "• **सिंचाई व मौसम सुरक्षा**: 4 दिन पहले बारिश का अलर्ट, पाला व लू से बचाव\n"
                    "• **मंडी भाव व बिक्री**: न्यूनतम समर्थन मूल्य (MSP) और AgriWise पर फसल लिस्टिंग\n\n"
                    "*आपकी फसल में क्या समस्या आ रही है? कृपया अपनी भाषा में पूछें।*"
                )
            return (
                "**Namaste Kisan Bandhu!** Welcome to **Rakshak AI**, your AgriWise agronomy copilot.\n\n"
                "I can provide exact clinical solutions for:\n"
                "• **Pest & Disease Diagnosis**: Leaf spots, yellowing, blights, rusts, borers, and exact chemical/organic dosages\n"
                "• **Fertilizer Schedules**: N-P-K, Urea, DAP, Zinc, and Potash splits per Acre and Bigha\n"
                "• **Irrigation & Weather Alerts**: Critical stage watering and 4-day rain preparation\n"
                "• **Government Support**: PM-KISAN installment status verification, PMFBY crop insurance\n\n"
                "*What crop challenge or question can I solve for your farm today?*"
            )

        # AgriWise platform instructions check
        if any(w in q_lower for w in ["how to sell", "create product", "add product", "add listing", "fpo pooling"]):
            return (
                "### 🚜 How to Add a Product & Sell on AgriWise:\n\n"
                "1. **Access the Create Page**:\n"
                "   Click the **'+ Add a Product'** button in the top navigation or go directly to `/create`.\n\n"
                "2. **Enter Crop Specifications**:\n"
                "   • Select Crop Variety (e.g., Sharbati Wheat, Hybrid Tomato, Desi Cotton).\n"
                "   • Enter Available Stock in **Quintals** or **Kg**.\n"
                "   • Specify Cultivated Land Area in **Acres** (Mandatory for certified origin traceability).\n"
                "   • Set your base Ask Price per unit.\n\n"
                "3. **Certification Verification (Optional Premium)**:\n"
                "   • If organic, specify accreditation body (NPOP, PGS-India, SOCA) and upload proof.\n"
                "   • Certified listings attract **15-25% higher bids** from institutional buyers.\n\n"
                "4. **Direct Settlement**:\n"
                "   • Verified buyers and FPOs place direct bids. Dispatches are tracked with escrow-protected settlement."
            )

        # Weather precautions check
        if any(w in q_lower for w in ["rain alert", "baarish", "storm alert", "weather advisory", "meerut rain"]):
            return (
                "### 🌧️ Proactive Crop Protection Ahead of Rain:\n\n"
                "1. **Immediate Drainage Action**:\n"
                "   Clear drainage channels and unblock field bunds right now. Standing water causes immediate root rot and wilting.\n\n"
                "2. **Halt Input Applications**:\n"
                "   **Suspend all fertilizer broadcasting (Urea/DAP)** and chemical pesticide/fungicide sprays until 48 hours after rain clears. Rain washes away inputs, wasting money and causing nutrient runoff.\n\n"
                "3. **Standing Crop Defense**:\n"
                "   • **Wheat**: Stop all irrigation to prevent lodging (plants falling flat in wind).\n"
                "   • **Tomato / Vegetables**: Check stakes and trellis wires to prevent vine snap under gusty rain.\n"
                "   • **Harvested Grains**: Shift produce immediately to raised dunnage and cover tightly with waterproof tarpaulins."
            )

        # Match clinical solution
        clinical = self.match_clinical_solution(query)
        if clinical:
            crop = clinical["crop"]
            cond = clinical["condition"]
            symp = clinical["symptoms"]
            chems = clinical["chemical_medicines"]
            org = clinical["organic_remedy"]
            prec = clinical["precautions"]

            if hindi_mode:
                res = [
                    f"### 🌾 फसल निदान व सटीक समाधान: {crop}\n",
                    f"**समस्या / रोग**: {cond}\n",
                    f"**लक्षण (Symptoms)**: {symp}\n\n",
                    "#### 💊 अनुशंसित दवाई व छिड़काव मात्रा (Chemical Solutions):"
                ]
                for c in chems:
                    res.append(f"• **{c}**")

                res.append("\n#### 🌿 जैविक व प्राकृतिक उपाय (Organic / IPM Remedy):")
                for o in org:
                    res.append(f"• {o}")

                res.append(f"\n#### ⚠️ महत्वपूर्ण सावधानियां (Key Precautions):")
                res.append(f"• {prec}")
                res.append("\n*मानक संदर्भ: ICAR केंद्रीय कृषि अनुसंधान परिषद एवं राज्य कृषि विश्वविद्यालय प्रोटोकॉल।*")
                return "\n".join(res)
            else:
                res = [
                    f"### 🌾 Clinical Agronomic Advisory: {crop}\n",
                    f"**Diagnosed Condition**: {cond}\n",
                    f"**Observed Symptoms**: {symp}\n\n",
                    "#### 💊 Recommended Medicines & Formulations (Exact Dosages):"
                ]
                for c in chems:
                    res.append(f"• **{c}**")

                res.append("\n#### 🌿 Organic & Biological IPM Interventions:")
                for o in org:
                    res.append(f"• {o}")

                res.append(f"\n#### ⚠️ Critical Application Safeguards:")
                res.append(f"• {prec}")
                res.append("\n*Reference: ICAR Guidelines & Central Insecticide Board (CIBRC) Registered Formulations.*")
                return "\n".join(res)

        # If no specific clinical template, synthesize from retrieved ICAR sources
        if sources:
            top = sources[0]
            return (
                f"### 🌾 ICAR Agronomic Advisory: {top['title']}\n"
                f"**System**: {top['crop']} | **Authority**: {top['source']}\n\n"
                f"#### 📋 Recommended Guidelines:\n"
                f"{top['snippet']}\n\n"
                f"#### 🔬 Practical Field Instructions:\n"
                f"1. **Inspection**: Inspect lower leaves and root zone early in the morning for pest egg masses or discoloration.\n"
                f"2. **Balanced Nutrition**: Apply split Nitrogen dosages based on plant growth stage. Incorporate Zinc and Potash at basal preparation.\n"
                f"3. **Integrated Defense**: Begin with biological agents (Trichoderma viride @ 5g/L or Neem oil 3000 ppm). If damage crosses economic threshold levels, apply targeted systemic fungicides or insecticides with proper PPE.\n\n"
                f"*Source: {top['source']} - Standard Agricultural Practice Manual.*"
            )

        # General high-grade fallback
        return (
            f"### 🌾 Agronomic Guidance for '{query}':\n\n"
            "Based on ICAR agricultural extension protocols:\n\n"
            "1. **Diagnostic Assessment**:\n"
            "   Examine both upper and lower leaf surfaces for lesions, insect feeding, or wilting symptoms.\n\n"
            "2. **Nutrient & Water Balance**:\n"
            "   Maintain balanced N-P-K ratios (120:60:40 for cereals; 150:100:120 for root tubers). Avoid water stagnation in field beds.\n\n"
            "3. **Targeted Crop Protection**:\n"
            "   For fungal blights and spots, use Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L. For sucking pests (whiteflies, thrips, aphids), use Diafenthiuron 50% WP @ 1.25 g/L or Thiamethoxam 25% WG @ 0.5 g/L.\n\n"
            "4. **Safety & Weather Verification**:\n"
            "   Always verify the 7-day weather forecast in AgriWise Weather Center before scheduling chemical sprays or irrigations.\n\n"
            "*Reference: ICAR Agro-Advisory Standards.*"
        )

rag_service = RAGAssistantService()
