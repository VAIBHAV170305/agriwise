import json
import base64
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import DiseaseAnalysis, User
from ..schemas import DiseaseAnalysisResponse
from ..services.disease_classifier import disease_service
from ..auth import get_current_user

router = APIRouter(prefix="/disease", tags=["Crop Disease Identification"])

@router.post("/analyze", response_model=DiseaseAnalysisResponse)
async def analyze_crop_image(
    file: UploadFile = File(...),
    crop_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WebP) are supported.")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    result = disease_service.analyze_image(image_bytes, crop_hint=crop_name)

    # Convert small preview thumbnail to base64 for history display
    preview_b64 = f"data:{file.content_type};base64,{base64.b64encode(image_bytes[:2048]).decode('utf-8')}"

    # Store analysis record
    record = DiseaseAnalysis(
        user_id=current_user.id,
        crop_name=result["crop_name"],
        predicted_disease=result["predicted_disease"],
        confidence=result["confidence"],
        severity=result["severity"],
        symptoms=result["symptoms"],
        management_guide_json=json.dumps(result["management_guide"]),
        image_url_or_preview=preview_b64,
        is_uncertain=result["is_uncertain"]
    )
    db.add(record)
    db.commit()

    return result

@router.get("/history")
def get_disease_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(DiseaseAnalysis).filter(
        DiseaseAnalysis.user_id == current_user.id
    ).order_by(DiseaseAnalysis.created_at.desc()).limit(15).all()

    history = []
    for r in records:
        history.append({
            "id": r.id,
            "crop_name": r.crop_name,
            "predicted_disease": r.predicted_disease,
            "confidence": r.confidence,
            "severity": r.severity,
            "symptoms": r.symptoms,
            "management_guide": json.loads(r.management_guide_json) if r.management_guide_json else {},
            "created_at": r.created_at.isoformat()
        })
    return history
