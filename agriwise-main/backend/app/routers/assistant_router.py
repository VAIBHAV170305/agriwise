import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChatConversation, ChatMessage, User
from ..schemas import ChatQueryRequest, ChatQueryResponse
from ..services.rag_assistant import rag_service
from ..auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/assistant", tags=["AI Farmer Assistant (RAG)"])

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

    # Extract user, farm, and crop context to personalize RAG response
    farmer_context = None
    if current_user:
        from ..models import Farm, CropRecord
        farms = db.query(Farm).filter(Farm.owner_id == current_user.id).all()
        farm_names = [f"{f.farm_name} ({f.area} {f.area_unit}, Soil: {f.soil_type}, Loc: {f.location})" for f in farms]
        farm_ids = [f.id for f in farms]
        crops = db.query(CropRecord).filter(CropRecord.farm_id.in_(farm_ids)).all() if farm_ids else []
        crop_names = [f"{c.crop_name} (Variety: {c.crop_variety or 'Standard'}, Stage: {c.growth_stage}, Season: {c.season})" for c in crops]
        farmer_context = f"Farmer: {current_user.name}. Farms: {'; '.join(farm_names)}. Active Crops: {'; '.join(crop_names)}."

    # RAG Search and generate with farmer context
    rag_result = rag_service.search_and_generate(req.message, farmer_context=farmer_context)

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
