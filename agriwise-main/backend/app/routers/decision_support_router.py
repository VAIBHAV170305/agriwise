from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User
from ..services.decision_engine import decision_engine
from ..auth import get_current_user

router = APIRouter(prefix="/decision-support", tags=["AI Decision Support & Intelligence"])

@router.get("/dashboard")
def get_decision_support_dashboard(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    location: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return decision_engine.get_farmer_decision_support(
        db=db, user_id=current_user.id, lat=lat, lon=lon, location_name=location
    )
