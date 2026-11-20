from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import User, Farm, ProductListing, Order, AuditLog, CropRecommendation, DiseaseAnalysis
from ..schemas import UserResponse
from ..auth import require_role, log_audit

router = APIRouter(prefix="/admin", tags=["Administration & Platform Monitoring"])

@router.get("/metrics")
def get_admin_metrics(
    admin_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    users_count = db.query(User).count()
    users_by_role = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    farms_count = db.query(Farm).count()
    listings_count = db.query(ProductListing).count()
    active_listings_count = db.query(ProductListing).filter(ProductListing.status == "ACTIVE").count()
    orders_count = db.query(Order).count()
    total_gmv = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    
    crop_ai_invocations = db.query(CropRecommendation).count()
    disease_scans = db.query(DiseaseAnalysis).count()

    return {
        "system_health": "ONLINE - NORMAL",
        "total_users": users_count,
        "users_by_role": {role: cnt for role, cnt in users_by_role},
        "farms_registered": farms_count,
        "product_listings": {
            "total": listings_count,
            "active": active_listings_count
        },
        "marketplace_orders": {
            "count": orders_count,
            "gmv_turnover": round(total_gmv, 2)
        },
        "ai_service_telemetry": {
            "crop_recommendations_computed": crop_ai_invocations,
            "disease_vision_scans": disease_scans,
            "rag_assistant_engine": "ACTIVE (TF-IDF Vector Index v1.0)"
        }
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    status_update: dict,
    admin_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = status_update.get("account_status")
    if new_status not in ["ACTIVE", "SUSPENDED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be ACTIVE or SUSPENDED")

    user.account_status = new_status
    db.commit()
    log_audit(db, admin_user, "USER_STATUS_CHANGE", "USER", str(user.id), f"Changed status to {new_status}")
    return {"message": f"User status set to {new_status}"}

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: dict,
    admin_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_role = role_update.get("role")
    if new_role not in ["Farmer", "Buyer", "FPO", "Admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = new_role
    db.commit()
    log_audit(db, admin_user, "USER_ROLE_CHANGE", "USER", str(user.id), f"Changed role to {new_role}")
    return {"message": f"User role updated to {new_role}"}

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    admin_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "actor_id": l.actor_id,
            "actor_email": l.actor_email,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]
