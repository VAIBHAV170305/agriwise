from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User
from ..services.decision_engine import decision_engine
from ..auth import get_optional_current_user

router = APIRouter(prefix="/decision-support", tags=["AI Decision Support & Intelligence"])

@router.get("/dashboard")
def get_decision_support_dashboard(
    lat: Optional[float] = Query(None, description="Live GPS / Sensor Latitude"),
    lon: Optional[float] = Query(None, description="Live GPS / Sensor Longitude"),
    location: Optional[str] = Query(None, description="Resolved live location or city name"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 2
    return decision_engine.get_farmer_decision_support(
        db=db, 
        user_id=user_id,
        lat=lat,
        lon=lon,
        location_name=location
    )
