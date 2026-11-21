from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List
import requests
from ..schemas import WeatherResponse
from ..services.weather_service import weather_service
from ..auth import get_optional_current_user
from ..database import get_db
from ..models import User, Farm, CropRecord

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("/detect")
def detect_user_location(request: Request):
    """
    Server-side IP location detection fallback using client IP.
    """
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()
    
    if client_ip and client_ip not in ["127.0.0.1", "localhost", "::1"]:
        try:
            resp = requests.get(f"https://ipwho.is/{client_ip}", timeout=3)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("success"):
                    return {
                        "city": d.get("city") or "Delhi",
                        "state": d.get("region") or "Delhi NCR",
                        "latitude": float(d.get("latitude", 28.6139)),
                        "longitude": float(d.get("longitude", 77.2090)),
                        "source": "SERVER_IP"
                    }
        except Exception:
            pass

    return {
        "city": "Delhi",
        "state": "Delhi NCR",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "source": "SERVER_HUB"
    }

@router.get("", response_model=WeatherResponse)
def get_weather(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    location: Optional[str] = Query(None, description="Location name"),
    crops: Optional[str] = Query(None, description="Comma-separated active crops list, e.g. Cotton,Wheat,Tomato"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns actionable, location-linked weather alerts and proactive crop advisories
    tailored to the farmer's registered location and active crops.
    """
    resolved_lat = lat
    resolved_lon = lon
    resolved_location = location
    active_crop_list: List[str] = []

    # 1. Parse crops from query parameter if provided
    if crops:
        active_crop_list = [c.strip() for c in crops.split(",") if c.strip()]

    # 2. If authenticated farmer, look up registered farms and crops in the database
    if current_user and current_user.role == "Farmer":
        user_farms = db.query(Farm).filter(Farm.owner_id == current_user.id).all()
        if user_farms:
            # If coordinates / location were not explicitly provided, use the registered farm's coordinates
            primary_farm = user_farms[0]
            if resolved_lat is None and primary_farm.latitude:
                resolved_lat = primary_farm.latitude
            if resolved_lon is None and primary_farm.longitude:
                resolved_lon = primary_farm.longitude
            if (not resolved_location or resolved_location == "Regional Agricultural Zone") and primary_farm.location:
                resolved_location = primary_farm.location

        # If crops weren't passed via query, pull the farmer's registered active crops
        if not active_crop_list:
            db_crops = db.query(CropRecord).join(Farm).filter(
                Farm.owner_id == current_user.id,
                CropRecord.status == "ACTIVE"
            ).all()
            if db_crops:
                for c in db_crops:
                    crop_title = f"{c.crop_name}"
                    if c.crop_variety:
                        crop_title += f" ({c.crop_variety})"
                    if crop_title not in active_crop_list:
                        active_crop_list.append(crop_title)

    # 3. Default coordinate & location fallback (Meerut, Uttar Pradesh - primary agronomy hub)
    if resolved_lat is None:
        resolved_lat = 28.9845
    if resolved_lon is None:
        resolved_lon = 77.7064
    if not resolved_location or resolved_location == "Regional Agricultural Zone":
        resolved_location = "Meerut, Uttar Pradesh"

    return weather_service.get_weather(
        lat=resolved_lat,
        lon=resolved_lon,
        location_name=resolved_location,
        active_crops=active_crop_list if active_crop_list else None
    )
