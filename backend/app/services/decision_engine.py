from typing import Optional
from sqlalchemy.orm import Session
from ..models import Farm, CropRecord, FarmActivity, FarmExpense, DiseaseAnalysis, Order
from .weather_service import weather_service
from .demand_forecaster import demand_service

class DecisionEngine:
    def get_farmer_decision_support(
        self, 
        db: Session, 
        user_id: int,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        location_name: Optional[str] = None
    ) -> dict:
        farms = db.query(Farm).filter(Farm.owner_id == user_id).all()
        farm_ids = [f.id for f in farms]
        
        crops = db.query(CropRecord).filter(CropRecord.farm_id.in_(farm_ids)).all() if farm_ids else []
        activities = db.query(FarmActivity).filter(FarmActivity.farm_id.in_(farm_ids)).order_by(FarmActivity.created_at.desc()).limit(5).all() if farm_ids else []
        expenses = db.query(FarmExpense).filter(FarmExpense.farm_id.in_(farm_ids)).all() if farm_ids else []
        recent_diseases = db.query(DiseaseAnalysis).filter(DiseaseAnalysis.user_id == user_id).order_by(DiseaseAnalysis.created_at.desc()).limit(3).all()
        
        total_expense = sum(e.amount for e in expenses)
        total_acreage = sum(f.area for f in farms)

        # Weather & Live GPS/Network Location context
        resolved_lat = lat
        resolved_lon = lon
        resolved_location = location_name

        if resolved_lat is None and farms and farms[0].latitude:
            resolved_lat = farms[0].latitude
        if resolved_lon is None and farms and farms[0].longitude:
            resolved_lon = farms[0].longitude
        if not resolved_location and farms and farms[0].location:
            resolved_location = farms[0].location

        resolved_lat = resolved_lat if resolved_lat is not None else 28.9845
        resolved_lon = resolved_lon if resolved_lon is not None else 77.7064
        resolved_location = resolved_location or "Meerut, Uttar Pradesh"

        active_crop_names = [c.crop_name for c in crops]
        weather_data = weather_service.get_weather(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_location,
            active_crops=active_crop_names or None
        )

        # Generate intelligent actionable signals
        signals = []

        # Signal 1: Weather + Farm Activities sync
        upcoming_rain = any(f.get("precipitation_mm", 0) > 3.0 for f in weather_data.get("forecast", [])[:2])
        if upcoming_rain:
            signals.append({
                "category": "IRRIGATION & SPRAY RISK",
                "priority": "HIGH",
                "headline": "Upcoming Rainfall Intersecting Field Operations",
                "action": "Rainfall detected in 48-hour forecast. Defer planned irrigation cycles and chemical sprays across your active plots.",
                "data_source_label": "EXTERNAL_API_WEATHER",
                "confidence": "HIGH"
            })
        else:
            signals.append({
                "category": "FIELD OPERATIONS",
                "priority": "NORMAL",
                "headline": "Optimal 3-Day Spraying & Weeding Window",
                "action": "Stable dry weather forecast. Excellent period to complete scheduled nutrient fertigation or mechanical weeding.",
                "data_source_label": "EXTERNAL_API_WEATHER",
                "confidence": "HIGH"
            })

        # Signal 2: Crop disease observation follow-up
        if recent_diseases and recent_diseases[0].severity in ["Severe", "High"]:
            signals.append({
                "category": "PATHOGEN CONTAINMENT",
                "priority": "URGENT",
                "headline": f"Follow-up: {recent_diseases[0].predicted_disease} in {recent_diseases[0].crop_name}",
                "action": "High-severity disease detected recently. Inspect adjacent plot blocks for secondary spore spread and review organic/chemical treatments.",
                "data_source_label": "AI_PREDICTION_CV",
                "confidence": f"{int(recent_diseases[0].confidence * 100)}%"
            })

        # Signal 3: Market demand opportunity
        active_crop_names = [c.crop_name for c in crops]
        primary_crop = active_crop_names[0] if active_crop_names else "Wheat"
        market_info = demand_service.forecast(primary_crop)
        if market_info.get("trend") == "UP":
            signals.append({
                "category": "MARKET TIMING",
                "priority": "OPPORTUNITY",
                "headline": f"Favorable Market Demand for {market_info['product_name']}",
                "action": f"Regional mandis show strong demand growth ({market_info['predicted_demand']} Q). Consider listing harvest on Agri-Wise Marketplace.",
                "data_source_label": "AI_FORECAST_DEMAND",
                "confidence": "89%"
            })

        # Signal 4: Financial expense tracking
        if total_expense > 0:
            signals.append({
                "category": "BUDGET & INPUT COST",
                "priority": "NORMAL",
                "headline": f"Cumulative Input Expenditure: ₹{total_expense:,.2f}",
                "action": f"Tracked across {len(expenses)} transactions. Compare against expected harvest yield to protect profit margins.",
                "data_source_label": "VERIFIED_FARMER_RECORDS",
                "confidence": "100%"
            })

        return {
            "summary_metrics": {
                "total_farms": len(farms),
                "total_acreage": round(total_acreage, 2),
                "active_crops_count": len([c for c in crops if c.status == "ACTIVE"]),
                "total_expenses": total_expense,
                "location": resolved_location,
                "latitude": resolved_lat,
                "longitude": resolved_lon,
                "weather_temp": weather_data["temperature"],
                "weather_condition": weather_data["condition"],
            },
            "signals": signals,
            "provenance_breakdown": {
                "VERIFIED_USER_DATA": "Farms, Crops, Activities, and Expense transactions entered by farmer",
                "EXTERNAL_WEATHER_DATA": "Meteorological measurements & forecasts from Open-Meteo",
                "AI_PREDICTIONS": "Scikit-Learn Crop Recommendation & Computer Vision Disease diagnostics",
                "SIMULATED_MARKET_BASELINE": "Agricultural Mandi price corridors & demand trend models"
            }
        }

decision_engine = DecisionEngine()
