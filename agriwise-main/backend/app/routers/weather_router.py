from fastapi import APIRouter, Depends, Query
from ..schemas import WeatherResponse
from ..services.weather_service import weather_service
from ..auth import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("", response_model=WeatherResponse)
def get_weather(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    location: str = Query("Regional Agricultural Zone", description="Location name"),
    current_user = Depends(get_current_user)
):
    return weather_service.get_weather(lat=lat, lon=lon, location_name=location)
