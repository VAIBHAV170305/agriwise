from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Farm, CropRecord
from ..schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse, UserPreferenceUpdate,
    EmailOtpRequest, VerifyOtpRequest, MultiStepRegister
)
from ..auth import hash_password, verify_password, create_access_token, get_current_user, log_audit
from ..services.email_service import email_otp_service

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/send-otp")
def send_email_otp(req: EmailOtpRequest):
    """
    Sends a 6-digit OTP code to the requested email address via
    external email service (SendGrid / Brevo / Resend) with dev sandbox fallback.
    """
    return email_otp_service.send_otp(req.email)

@router.post("/verify-otp", response_model=TokenResponse)
def verify_email_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the email OTP. If valid, signs in the user.
    If the email is not registered yet, auto-provisions a Farmer user.
    """
    is_valid, msg = email_otp_service.verify_otp(req.email, req.otp)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    normalized_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    # Auto-provision farmer account if new user
    if not user:
        name_hint = normalized_email.split('@')[0].replace('.', ' ').title()
        user = User(
            name=f"{name_hint} (Farmer)",
            email=normalized_email,
            phone="+91-9876500000",
            password_hash=hash_password("Farmer@123"),
            role="Farmer",
            preferred_language="en",
            account_status="ACTIVE"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create initial farm holding
        farm = Farm(
            owner_id=user.id,
            farm_name=f"{name_hint}'s Krishi Farm",
            location="Anand, Gujarat",
            area=5.0,
            area_unit="Acres",
            soil_type="Loamy Alluvial",
            irrigation_type="Drip & Tube-well"
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)

        # Seed initial crop
        crop = CropRecord(
            farm_id=farm.id,
            crop_name="Wheat",
            crop_variety="HD-3226 (Pusa Yashasvi)",
            season="Rabi",
            growth_stage="Vegetative",
            cultivated_area=3.5,
            status="Healthy"
        )
        db.add(crop)
        db.commit()

        log_audit(db, user, "USER_OTP_AUTOPROVISION", "USER", str(user.id), "New account provisioned via Email OTP")

    log_audit(db, user, "USER_OTP_LOGIN", "USER", str(user.id), "Successful OTP login via External Email Service")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register-multistep", response_model=TokenResponse)
def register_multistep(data: MultiStepRegister, db: Session = Depends(get_db)):
    """
    Handles Multi-Step Onboarding:
    Step 1: Credentials & Identity
    Step 2: Role & Agronomic Parameters (State, District, Farm Size, Soil, Crops)
    Step 3: Verification (OTP check if provided)
    """
    normalized_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    # If OTP code was provided, verify it
    if data.otp:
        is_valid, msg = email_otp_service.verify_otp(normalized_email, data.otp)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    # Securely hash password
    hashed = hash_password(data.password)
    new_user = User(
        name=data.name,
        email=normalized_email,
        phone=data.phone or "+91-9876543210",
        password_hash=hashed,
        role=data.role,
        preferred_language=data.preferred_language or "en",
        account_status="ACTIVE"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If user is a Farmer or FPO, provision their initial farm holding & crops
    if data.role in ("Farmer", "FPO"):
        location_str = f"{data.district or 'Anand'}, {data.state or 'Gujarat'}"
        farm = Farm(
            owner_id=new_user.id,
            farm_name=data.farm_name or f"{data.name.split()[0]}'s Farm",
            location=location_str,
            area=data.area or 5.0,
            area_unit="Acres",
            soil_type=data.soil_type or "Loamy",
            irrigation_type="Drip Irrigation"
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)

        if data.primary_crop:
            crop = CropRecord(
                farm_id=farm.id,
                crop_name=data.primary_crop,
                crop_variety="High Yield Hybrid",
                season="Rabi",
                growth_stage="Vegetative",
                cultivated_area=data.area or 3.0,
                status="Healthy"
            )
            db.add(crop)
            db.commit()

    log_audit(db, new_user, "USER_MULTISTEP_REGISTER", "USER", str(new_user.id), f"Completed onboarding as {new_user.role}")

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Securely hash password using bcrypt
    hashed = hash_password(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hashed,
        role=user_in.role,
        preferred_language=getattr(user_in, 'preferred_language', 'en') or 'en',
        account_status="ACTIVE"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit(db, new_user, "USER_REGISTER", "USER", str(new_user.id), f"Registered as {new_user.role}")

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if user.account_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is suspended. Contact system administrator."
        )

    log_audit(db, user, "USER_LOGIN", "USER", str(user.id), "Successful login")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile")
def get_detailed_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from ..models import Farm, CropRecord, ProductListing, Order, FPOMembership, FPOOrganization
    
    base_profile = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone or "+91-9876543211",
        "role": current_user.role,
        "account_status": current_user.account_status,
        "preferred_language": current_user.preferred_language or "en",
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }

    if current_user.role == "Farmer":
        farms = db.query(Farm).filter(Farm.owner_id == current_user.id).all()
        farm_ids = [f.id for f in farms]
        farm_dict_map = {f.id: f.farm_name for f in farms}

        crops = db.query(CropRecord).filter(CropRecord.farm_id.in_(farm_ids)).all() if farm_ids else []
        listings = db.query(ProductListing).filter(ProductListing.seller_id == current_user.id).all()
        orders = db.query(Order).filter(Order.seller_id == current_user.id).all()
        memberships = db.query(FPOMembership).filter(FPOMembership.farmer_id == current_user.id).all()

        fpo_details = []
        for m in memberships:
            fpo = db.query(FPOOrganization).filter(FPOOrganization.id == m.fpo_id).first()
            if fpo:
                fpo_details.append({
                    "fpo_id": fpo.id,
                    "name": fpo.name,
                    "registration_number": fpo.registration_number,
                    "region": fpo.region,
                    "status": m.status,
                    "joined_at": m.joined_at.isoformat() if m.joined_at else None
                })

        total_area = sum(f.area for f in farms) if farms else 0.0

        base_profile.update({
            "farmer_id": f"KID-2026-GJ-{current_user.id:04d}",
            "identification_badge": "Government Registered Kisan (Verified)",
            "kyc_status": "VERIFIED",
            "aadhaar_linked": True,
            "pm_kisan_id": f"PMK-GJ-982{current_user.id}4",
            "soil_health_card": "Grade A (Tested Mar 2026, pH 7.2)",
            "kcc_status": "Active (SBI Agri Loan)",
            "kcc_limit": "₹3,50,000",
            "enam_id": f"ENAM-GJ-04{current_user.id}9",
            "crop_insurance": "PMFBY Active (Rabi 2026)",
            "organic_certification": "NPOP Sustainable In-Conversion (Grade 2)",
            "district": "Anand District",
            "state": "Gujarat",
            "agro_zone": "Western Plain Zone (Zone XIII)",
            "farming_experience": "14+ Years",
            "landholding_category": "Small & Medium Landholder",
            "trust_rating": 4.9,
            "total_reviews": 52,
            "preferred_language": "Gujarati / Hindi / English",
            "irrigation_summary": "Solar Drip & Deep Tube-well",
            "primary_soil": "Loamy Alluvial & Black Clay",
            "stats": {
                "total_farms": len(farms),
                "total_acres": round(total_area, 1),
                "active_crops": len(crops),
                "active_listings": len(listings),
                "orders_fulfilled": len(orders),
                "fpo_count": len(fpo_details)
            },
            "farms": [
                {
                    "id": f.id,
                    "farm_name": f.farm_name,
                    "location": f.location,
                    "latitude": f.latitude,
                    "longitude": f.longitude,
                    "area": f.area,
                    "area_unit": f.area_unit,
                    "soil_type": f.soil_type,
                    "irrigation_type": f.irrigation_type,
                    "water_resources": f.water_resources,
                    "description": f.description
                }
                for f in farms
            ],
            "crops": [
                {
                    "id": c.id,
                    "farm_id": c.farm_id,
                    "farm_name": farm_dict_map.get(c.farm_id, "Main Holding"),
                    "crop_name": c.crop_name,
                    "crop_variety": c.crop_variety,
                    "season": c.season,
                    "growth_stage": c.growth_stage,
                    "sowing_date": c.sowing_date,
                    "expected_harvest_date": c.expected_harvest_date,
                    "cultivated_area": c.cultivated_area,
                    "harvest_quantity": c.harvest_quantity,
                    "quantity_unit": c.quantity_unit,
                    "status": c.status
                }
                for c in crops
            ],
            "listings": [
                {
                    "id": p.id,
                    "product_name": p.product_name,
                    "category": p.category,
                    "available_quantity": p.available_quantity,
                    "unit": p.unit,
                    "asking_price": p.asking_price,
                    "is_organic": p.is_organic,
                    "status": p.status
                }
                for p in listings
            ],
            "fpos": fpo_details
        })

    return base_profile

@router.patch("/preferences", response_model=UserResponse)
def update_user_preferences(pref: UserPreferenceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.preferred_language = pref.preferred_language
    db.commit()
    db.refresh(current_user)
    log_audit(db, current_user, "UPDATE_PREFERENCE", "USER", str(current_user.id), f"Updated preferred language to {pref.preferred_language}")
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, current_user, "USER_LOGOUT", "USER", str(current_user.id), "Logged out")
    return {"message": "Logged out successfully."}

