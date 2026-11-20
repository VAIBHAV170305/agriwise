import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import CropRecommendation, User
from ..schemas import CropRecommendRequest, CropRecommendationResponse
from ..services.crop_recommender import crop_service
from ..auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/recommendations", tags=["Crop Recommendation"])

@router.post("/crop", response_model=CropRecommendationResponse)
def get_crop_recommendation(
    req: CropRecommendRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    result = crop_service.recommend(
        n=req.nitrogen,
        p=req.phosphorus,
        k=req.potassium,
        temp=req.temperature,
        hum=req.humidity,
        ph=req.ph,
        rain=req.rainfall
    )

    # Save recommendation in history if authenticated
    if current_user:
        record = CropRecommendation(
            user_id=current_user.id,
            farm_id=req.farm_id,
            input_features_json=json.dumps(result["input_features"]),
            recommended_crop=result["recommended_crop"],
            alternative_crops_json=json.dumps(result["alternative_crops"]),
            confidence=result["confidence"],
            explanation=result["explanation"],
            model_version=result["model_version"]
        )
        db.add(record)
        db.commit()

    return result

@router.get("/history")
def get_recommendation_history(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []

    records = db.query(CropRecommendation).filter(
        CropRecommendation.user_id == current_user.id
    ).order_by(CropRecommendation.created_at.desc()).limit(20).all()

    history = []
    for r in records:
        history.append({
            "id": r.id,
            "recommended_crop": r.recommended_crop,
            "confidence": r.confidence,
            "input_features": json.loads(r.input_features_json) if r.input_features_json else {},
            "alternative_crops": json.loads(r.alternative_crops_json) if r.alternative_crops_json else [],
            "explanation": r.explanation,
            "model_version": r.model_version,
            "created_at": r.created_at.isoformat()
        })
    return history
