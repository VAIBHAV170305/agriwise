from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Farm, FarmActivity, FarmExpense, User
from ..schemas import (
    FarmCreate, FarmResponse,
    FarmActivityCreate, FarmActivityResponse,
    FarmExpenseCreate, FarmExpenseResponse
)
from ..auth import get_current_user, log_audit

router = APIRouter(prefix="/farms", tags=["Farm Management"])

@router.get("", response_model=List[FarmResponse])
def get_user_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "Admin":
        return db.query(Farm).all()
    return db.query(Farm).filter(Farm.owner_id == current_user.id).all()

@router.post("", response_model=FarmResponse)
def create_farm(farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = Farm(
        owner_id=current_user.id,
        farm_name=farm_in.farm_name,
        location=farm_in.location,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        area=farm_in.area,
        area_unit=farm_in.area_unit,
        soil_type=farm_in.soil_type,
        irrigation_type=farm_in.irrigation_type,
        water_resources=farm_in.water_resources,
        description=farm_in.description
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    log_audit(db, current_user, "CREATE_FARM", "FARM", str(farm.id), f"Created farm {farm.farm_name}")
    return farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.owner_id != current_user.id and current_user.role not in ["Admin", "FPO"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
    return farm

@router.delete("/{farm_id}")
def delete_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.owner_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this farm")
    
    db.delete(farm)
    db.commit()
    log_audit(db, current_user, "DELETE_FARM", "FARM", str(farm_id), f"Deleted farm {farm.farm_name}")
    return {"message": "Farm deleted successfully"}

# Activities
@router.get("/{farm_id}/activities", response_model=List[FarmActivityResponse])
def get_farm_activities(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FarmActivity).filter(FarmActivity.farm_id == farm_id).order_by(FarmActivity.created_at.desc()).all()

@router.post("/{farm_id}/activities", response_model=FarmActivityResponse)
def add_farm_activity(farm_id: int, act_in: FarmActivityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm or (farm.owner_id != current_user.id and current_user.role != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized to modify activities for this farm")
    
    act = FarmActivity(
        farm_id=farm_id,
        crop_record_id=act_in.crop_record_id,
        activity_type=act_in.activity_type,
        activity_date=act_in.activity_date,
        description=act_in.description,
        quantity=act_in.quantity,
        cost=act_in.cost or 0.0
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act

# Expenses
@router.get("/{farm_id}/expenses", response_model=List[FarmExpenseResponse])
def get_farm_expenses(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FarmExpense).filter(FarmExpense.farm_id == farm_id).order_by(FarmExpense.created_at.desc()).all()

@router.post("/{farm_id}/expenses", response_model=FarmExpenseResponse)
def add_farm_expense(farm_id: int, exp_in: FarmExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm or (farm.owner_id != current_user.id and current_user.role != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized to modify expenses for this farm")

    exp = FarmExpense(
        farm_id=farm_id,
        crop_record_id=exp_in.crop_record_id,
        category=exp_in.category,
        amount=exp_in.amount,
        date=exp_in.date,
        description=exp_in.description
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp
