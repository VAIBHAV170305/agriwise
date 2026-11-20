from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import MarketForecastResponse
from ..services.demand_forecaster import demand_service, COMMODITY_BASELINES
from ..auth import get_current_user

router = APIRouter(prefix="/market", tags=["Market Intelligence & Demand Forecasting"])

@router.get("/commodities")
def get_supported_commodities():
    return [
        {"name": k, "category": v["category"], "base_price": v["base_price"]}
        for k, v in COMMODITY_BASELINES.items()
    ]

@router.get("/forecast", response_model=MarketForecastResponse)
def get_market_forecast(
    product: str = Query("Wheat", description="Crop/Commodity name"),
    location: str = Query("Central Mandi Hub", description="Mandi/Region"),
    current_user = Depends(get_current_user)
):
    return demand_service.forecast(product, location)
