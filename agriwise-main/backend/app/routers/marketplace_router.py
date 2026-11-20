from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import ProductListing, User
from ..schemas import ProductListingCreate, ProductListingResponse
from ..auth import get_current_user, log_audit

router = APIRouter(prefix="/products", tags=["Marketplace"])

@router.get("", response_model=List[ProductListingResponse])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    organic_only: Optional[bool] = False,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    seller_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductListing).filter(ProductListing.status == "ACTIVE")
    
    if category and category != "All":
        query = query.filter(ProductListing.category == category)
    if search:
        query = query.filter(ProductListing.product_name.ilike(f"%{search}%"))
    if organic_only:
        query = query.filter(ProductListing.is_organic == True)
    if max_price:
        query = query.filter(ProductListing.asking_price <= max_price)
    if location:
        query = query.filter(ProductListing.location.ilike(f"%{location}%"))
    if seller_id:
        query = query.filter(ProductListing.seller_id == seller_id)

    listings = query.order_by(ProductListing.created_at.desc()).all()
    results = []
    for l in listings:
        res = ProductListingResponse.from_orm(l)
        res.seller_name = l.seller.name if l.seller else "Farmer"
        results.append(res)
    return results

@router.post("", response_model=ProductListingResponse)
def create_product_listing(
    prod_in: ProductListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Farmer", "FPO", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Farmers or FPOs can list products for sale."
        )

    listing = ProductListing(
        seller_id=current_user.id,
        farm_id=prod_in.farm_id,
        product_name=prod_in.product_name,
        category=prod_in.category,
        description=prod_in.description,
        available_quantity=prod_in.available_quantity,
        unit=prod_in.unit,
        asking_price=prod_in.asking_price,
        location=prod_in.location,
        region=prod_in.region or "Western Plain Zone (Gujarat)",
        harvest_date=prod_in.harvest_date,
        image_url=prod_in.image_url,
        is_organic=prod_in.is_organic or False,
        status="ACTIVE"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    log_audit(db, current_user, "CREATE_PRODUCT_LISTING", "PRODUCT", str(listing.id), f"Listed {listing.product_name}")

    res = ProductListingResponse.from_orm(listing)
    res.seller_name = current_user.name
    return res

@router.get("/{product_id}", response_model=ProductListingResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    listing = db.query(ProductListing).filter(ProductListing.id == product_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Product not found")
    res = ProductListingResponse.from_orm(listing)
    res.seller_name = listing.seller.name if listing.seller else "Farmer"
    return res

@router.patch("/{product_id}", response_model=ProductListingResponse)
def update_product_listing(
    product_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(ProductListing).filter(ProductListing.id == product_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Product not found")
    if listing.seller_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    for k, v in updates.items():
        if hasattr(listing, k):
            setattr(listing, k, v)
    db.commit()
    db.refresh(listing)
    res = ProductListingResponse.from_orm(listing)
    res.seller_name = listing.seller.name if listing.seller else "Farmer"
    return res

@router.delete("/{product_id}")
def delete_product_listing(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.query(ProductListing).filter(ProductListing.id == product_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Product not found")
    if listing.seller_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    listing.status = "ARCHIVED"
    db.commit()
    return {"message": "Listing archived successfully"}
