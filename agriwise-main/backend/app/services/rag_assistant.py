import os
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RAGAssistantService:
    def __init__(self):
        self.documents = []
        self.vectorizer = None
        self.doc_vectors = None
        self._load_documents()

    def _load_documents(self):
        curr_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        json_path = os.path.join(curr_dir, "data", "agricultural_knowledge.json")
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                self.documents = json.load(f)
        
        # Build TF-IDF search index
        corpus = [f"{doc['title']}. {doc['category']}. {doc['content']}" for doc in self.documents]
        if corpus:
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            self.doc_vectors = self.vectorizer.fit_transform(corpus)

    def search_and_generate(self, query: str, farmer_context: str = None) -> dict:
        if not self.vectorizer or not self.documents:
            return {
                "response": "I am currently initializing the agronomic knowledge base. Please try again in a moment.",
                "sources": [],
                "disclaimer": "Agricultural assistant responses are based on curated reference material."
            }

        # Enhance query with farmer crop context if applicable
        enhanced_query = query
        if farmer_context:
            enhanced_query = f"{query} {farmer_context}"

        query_vector = self.vectorizer.transform([enhanced_query])
        scores = cosine_similarity(query_vector, self.doc_vectors)[0]

        # Top relevant indices with score threshold
        top_indices = [i for i in scores.argsort()[::-1] if scores[i] > 0.06]

        farmer_name = "Farmer"
        if farmer_context and "Farmer:" in farmer_context:
            try:
                farmer_name = farmer_context.split("Farmer:")[1].split(".")[0].strip()
            except Exception:
                pass

        if not top_indices:
            greeting_prefix = f"Namaste {farmer_name} ji,\n\n" if farmer_name != "Farmer" else "Namaste,\n\n"
            return {
                "response": (
                    f"{greeting_prefix}Rakshak searched our ICAR-verified agronomy database regarding '{query}', but could not retrieve a sufficiently grounded scientific document for that exact query. "
                    "For inquiries outside standard soil nutrients, irrigation, foliar pest management, organic bio-fertilizers, or mandi economics, please reach out to your local Krishi Vigyan Kendra (KVK) extension officer."
                ),
                "sources": [],
                "disclaimer": "Grounding Safeguard: Rakshak does not fabricate answers when scientific references are missing."
            }

        # Build retrieved passages
        retrieved_sources = []
        for idx in top_indices[:3]:
            doc = self.documents[idx]
            score = round(float(scores[idx]), 2)
            retrieved_sources.append({
                "title": doc["title"],
                "category": doc["category"],
                "relevance_score": score,
                "snippet": doc["content"][:220] + "..."
            })

        # Formulate personalized grounded answer
        greeting_prefix = f"Namaste {farmer_name} ji,\n\n" if farmer_name != "Farmer" else "Namaste,\n\n"
        synthesized_answer = (
            f"{greeting_prefix}Based on verified agronomic standards from {retrieved_sources[0]['title']}:\n\n"
            f"{self.documents[top_indices[0]]['content']}\n\n"
        )
        if len(top_indices) > 1:
            synthesized_answer += (
                f"Additionally, regarding {retrieved_sources[1]['category']} ({retrieved_sources[1]['title']}):\n"
                f"{self.documents[top_indices[1]]['content'][:260]}...\n\n"
            )

        if farmer_context and "Active Crops:" in farmer_context:
            try:
                active_crops_str = farmer_context.split("Active Crops:")[1].split(".")[0].strip()
                if active_crops_str:
                    synthesized_answer += f"🌱 Tailored note for your active crops ({active_crops_str}): Ensure field operations align with current soil moisture and phenological stage.\n\n"
            except Exception:
                pass

        synthesized_answer += "Key Takeaway: Always cross-reference application rates with your latest soil test report and localized micro-climate conditions."

        return {
            "response": synthesized_answer,
            "sources": retrieved_sources,
            "disclaimer": "Source Attribution: Answers are derived from verified ICAR, PAU, TNAU manuals and peer-reviewed agronomy handbooks."
        }

rag_service = RAGAssistantService()
