from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import CropRecord, Farm, User
from ..schemas import CropRecordCreate, CropRecordResponse
from ..auth import get_current_user, log_audit

router = APIRouter(prefix="/crops", tags=["Crop Records"])

@router.get("", response_model=List[CropRecordResponse])
def get_crop_records(farm_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(CropRecord).join(Farm)
    if current_user.role != "Admin":
        query = query.filter(Farm.owner_id == current_user.id)
    if farm_id:
        query = query.filter(CropRecord.farm_id == farm_id)
    return query.order_by(CropRecord.created_at.desc()).all()

@router.post("", response_model=CropRecordResponse)
def create_crop_record(crop_in: CropRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == crop_in.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.owner_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to add crop to this farm")

    crop = CropRecord(
        farm_id=crop_in.farm_id,
        crop_name=crop_in.crop_name,
        region=crop_in.region or "Western Plain Zone (Gujarat)",
        crop_variety=crop_in.crop_variety,
        sowing_date=crop_in.sowing_date,
        expected_harvest_date=crop_in.expected_harvest_date,
        cultivated_area=crop_in.cultivated_area,
        season=crop_in.season,
        growth_stage=crop_in.growth_stage,
        harvest_quantity=crop_in.harvest_quantity,
        quantity_unit=crop_in.quantity_unit,
        status="ACTIVE"
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    log_audit(db, current_user, "CREATE_CROP", "CROP", str(crop.id), f"Added {crop.crop_name} to {farm.farm_name}")
    return crop

@router.patch("/{crop_id}", response_model=CropRecordResponse)
def update_crop_record(crop_id: int, updates: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = db.query(CropRecord).join(Farm).filter(CropRecord.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")
    if crop.farm.owner_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this crop")

    for k, v in updates.items():
        if hasattr(crop, k):
            setattr(crop, k, v)
    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/{crop_id}")
def delete_crop_record(crop_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = db.query(CropRecord).join(Farm).filter(CropRecord.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")
    if crop.farm.owner_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this crop")

    db.delete(crop)
    db.commit()
    return {"message": "Crop record deleted successfully"}
