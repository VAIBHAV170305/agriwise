import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChatConversation, ChatMessage, User
from ..schemas import ChatQueryRequest, ChatQueryResponse
from ..services.rag_assistant import rag_service
from ..services.gemini_service import gemini_service
from ..auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/assistant", tags=["AI Farmer Assistant (RAG)"])

@router.get("/status")
def get_ai_status():
    """Returns AI subsystem health, configured Gemini key status, and active engine."""
    health = gemini_service.check_health()
    return {
        "status": "operational",
        "gemini": health,
        "knowledge_base_documents": len(rag_service.documents),
        "primary_engine": "Google Gemini (Generative)" if health.get("live") else "Rakshak ICAR Agronomic Engine (Autonomous)",
        "fallback_ready": True
    }

@router.post("/refresh-key")
def refresh_gemini_key(api_key: Optional[str] = None, current_user: Optional[User] = Depends(get_optional_current_user)):
    """Refreshes Gemini API key at runtime."""
    gemini_service.refresh_key(api_key)
    health = gemini_service.check_health()
    return {
        "message": "Gemini key refreshed successfully",
        "health": health
    }

@router.post("/chat", response_model=ChatQueryResponse)
def chat_with_assistant(
    req: ChatQueryRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve or create conversation if authenticated
    conv = None
    if current_user and req.conversation_id:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == req.conversation_id,
            ChatConversation.user_id == current_user.id
        ).first()

    if current_user and not conv:
        conv = ChatConversation(
            user_id=current_user.id,
            title=req.message[:50] + ("..." if len(req.message) > 50 else "")
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message if conversation exists
    if conv:
        user_msg = ChatMessage(
            conversation_id=conv.id,
            sender_role="user",
            content=req.message
        )
        db.add(user_msg)

    # RAG Search and generate
    rag_result = rag_service.search_and_generate(req.message)

    # Save assistant message with sources if conversation exists
    if conv:
        assistant_msg = ChatMessage(
            conversation_id=conv.id,
            sender_role="assistant",
            content=rag_result["response"],
            sources_json=json.dumps(rag_result["sources"])
        )
        db.add(assistant_msg)
        db.commit()

    return {
        "conversation_id": conv.id if conv else None,
        "response": rag_result["response"],
        "sources": rag_result["sources"],
        "disclaimer": rag_result["disclaimer"]
    }

@router.get("/conversations")
def get_user_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).order_by(ChatConversation.created_at.desc()).limit(15).all()

    return [{"id": c.id, "title": c.title, "created_at": c.created_at.isoformat()} for c in convs]

@router.get("/conversations/{conversation_id}")
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).join(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "sender_role": m.sender_role,
            "content": m.content,
            "sources": json.loads(m.sources_json) if m.sources_json else [],
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]
