from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import FPOOrganization, FPOMembership, User, Farm, CropRecord, ProductListing, Order
from ..auth import get_current_user

router = APIRouter(prefix="/fpo", tags=["FPO Management & Analytics"])

@router.get("/overview")
def get_fpo_overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check or get primary FPO
    fpo = db.query(FPOOrganization).first()
    if not fpo:
        # Create default organization if empty
        fpo = FPOOrganization(
            name="Kisan Kalyan Agritech Producer Co.",
            registration_number="FPO-2026-IND-8841",
            contact_email="kisan.fpo@agriwise.com",
            region="Western Agro-Climatic Zone",
            description="Empowering 1,200+ smallholder and marginal farmers with aggregated inputs, shared machinery, and direct bulk mandi selling."
        )
        db.add(fpo)
        db.commit()
        db.refresh(fpo)

    # Member farmers
    memberships = db.query(FPOMembership).filter(FPOMembership.fpo_id == fpo.id).all()
    member_farmer_ids = [m.farmer_id for m in memberships]
    
    # Also include any farmers in system for rich analytics
    if not member_farmer_ids:
        all_farmers = db.query(User).filter(User.role == "Farmer").all()
        for f_user in all_farmers:
            m = FPOMembership(fpo_id=fpo.id, farmer_id=f_user.id, status="ACTIVE")
            db.add(m)
        db.commit()
        memberships = db.query(FPOMembership).filter(FPOMembership.fpo_id == fpo.id).all()
        member_farmer_ids = [m.farmer_id for m in memberships]

    member_count = len(member_farmer_ids)
    
    # Farms & Crops aggregated
    farms_count = db.query(Farm).filter(Farm.owner_id.in_(member_farmer_ids)).count() if member_farmer_ids else 0
    total_acreage = db.query(func.sum(Farm.area)).filter(Farm.owner_id.in_(member_farmer_ids)).scalar() or 0.0

    # Aggregated produce available for bulk supply
    listings = db.query(ProductListing).filter(
        ProductListing.seller_id.in_(member_farmer_ids),
        ProductListing.status == "ACTIVE"
    ).all() if member_farmer_ids else []

    produce_aggregation = {}
    for l in listings:
        if l.product_name not in produce_aggregation:
            produce_aggregation[l.product_name] = {
                "category": l.category,
                "total_quantity": 0.0,
                "unit": l.unit,
                "avg_price": l.asking_price,
                "farmers_count": 0
            }
        produce_aggregation[l.product_name]["total_quantity"] += l.available_quantity
        produce_aggregation[l.product_name]["farmers_count"] += 1

    # Bulk orders stats
    total_sales = db.query(func.sum(Order.total_amount)).filter(
        Order.seller_id.in_(member_farmer_ids),
        Order.status.in_(["ACCEPTED", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "DELIVERED"])
    ).scalar() or 0.0

    return {
        "organization": {
            "id": fpo.id,
            "name": fpo.name,
            "registration_number": fpo.registration_number,
            "region": fpo.region,
            "description": fpo.description,
            "contact_email": fpo.contact_email
        },
        "metrics": {
            "registered_members": member_count,
            "total_farms": farms_count,
            "pooled_acreage": round(total_acreage, 1),
            "total_sales_value": round(total_sales, 2),
            "active_produce_batches": len(listings)
        },
        "pooled_inventory": list(produce_aggregation.values()),
        "member_farmers": [
            {
                "id": m.farmer.id,
                "name": m.farmer.name,
                "email": m.farmer.email,
                "phone": m.farmer.phone,
                "status": m.status,
                "joined_at": m.joined_at.strftime("%Y-%m-%d")
            }
            for m in memberships if m.farmer
        ]
    }
