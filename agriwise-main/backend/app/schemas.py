from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class EmailOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)

class MultiStepRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: str = Field("Farmer", pattern="^(Farmer|Buyer|FPO|Admin|Delivery)$")
    preferred_language: Optional[str] = "en"
    # Step 2 Agronomic / Commercial Profile
    state: Optional[str] = None
    district: Optional[str] = None
    farm_name: Optional[str] = None
    area: Optional[float] = None
    soil_type: Optional[str] = "Loamy"
    primary_crop: Optional[str] = None
    business_name: Optional[str] = None
    gstin: Optional[str] = None
    otp: Optional[str] = None

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: str = Field("Farmer", pattern="^(Farmer|Buyer|FPO|Admin|Delivery)$")
    preferred_language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    account_status: str
    preferred_language: Optional[str] = "en"
    created_at: datetime

    class Config:
        from_attributes = True

class UserPreferenceUpdate(BaseModel):
    preferred_language: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Farm Schemas
class FarmCreate(BaseModel):
    farm_name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: float
    area_unit: Optional[str] = "Acres"
    soil_type: Optional[str] = "Loamy"
    irrigation_type: Optional[str] = "Drip"
    water_resources: Optional[str] = None
    description: Optional[str] = None

class FarmResponse(FarmCreate):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Crop Record Schemas
class CropRecordCreate(BaseModel):
    farm_id: int
    crop_name: str
    crop_variety: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    cultivated_area: Optional[float] = None
    season: Optional[str] = "Kharif"
    growth_stage: Optional[str] = "Vegetative"
    harvest_quantity: Optional[float] = None
    quantity_unit: Optional[str] = "Quintals"

class CropRecordResponse(CropRecordCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Farm Activity & Expense Schemas
class FarmActivityCreate(BaseModel):
    farm_id: int
    crop_record_id: Optional[int] = None
    activity_type: str
    activity_date: str
    description: Optional[str] = None
    quantity: Optional[str] = None
    cost: Optional[float] = 0.0

class FarmActivityResponse(FarmActivityCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FarmExpenseCreate(BaseModel):
    farm_id: int
    crop_record_id: Optional[int] = None
    category: str
    amount: float
    date: str
    description: Optional[str] = None

class FarmExpenseResponse(FarmExpenseCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Crop Recommendation Schemas
class CropRecommendRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, le=250, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=5, le=100, description="Relative humidity in %")
    ph: float = Field(..., ge=2, le=12, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=1500, description="Rainfall in mm")
    farm_id: Optional[int] = None

class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float
    alternative_crops: List[Dict[str, Any]]
    explanation: str
    input_features: Dict[str, float]
    model_version: str
    disclaimer: str

# Disease Analysis Schemas
class DiseaseAnalysisResponse(BaseModel):
    crop_name: str
    predicted_disease: str
    confidence: float
    severity: str
    symptoms: str
    management_guide: Dict[str, Any]
    is_uncertain: bool
    disclaimer: str

# Weather Schemas
class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    condition: str
    forecast: List[Dict[str, Any]]
    agricultural_advisories: List[Dict[str, Any]]
    active_crops: Optional[List[str]] = None
    crop_advisories: Optional[List[Dict[str, Any]]] = None
    rain_alert: Optional[Dict[str, Any]] = None
    spray_window: Optional[Dict[str, Any]] = None
    irrigation_window: Optional[Dict[str, Any]] = None
    harvest_window: Optional[Dict[str, Any]] = None

# AI Assistant & RAG Schemas
class ChatQueryRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatSource(BaseModel):
    title: str
    category: str
    relevance_score: float
    snippet: str

class ChatQueryResponse(BaseModel):
    conversation_id: Optional[int] = None
    response: str
    sources: List[ChatSource]
    disclaimer: str

# Market & Forecasting Schemas
class MarketForecastRequest(BaseModel):
    product_name: str
    market_location: Optional[str] = "Regional Mandi"

class MarketForecastResponse(BaseModel):
    product_name: str
    category: str
    market_location: str
    forecast_period: str
    predicted_demand: float
    demand_unit: str = "Quintals"
    predicted_price_range: Dict[str, Any]
    trend: str
    confidence: float
    historical_points: List[Dict[str, Any]]
    forecast_points: List[Dict[str, Any]]
    model_version: str
    is_synthetic_baseline: bool
    evaluation_metrics: Optional[Dict[str, Any]] = None

# Marketplace Schemas
class ProductListingCreate(BaseModel):
    farm_id: Optional[int] = None
    product_name: str
    category: str
    description: Optional[str] = None
    available_quantity: float
    unit: str = "kg"
    asking_price: float
    location: str
    image_url: Optional[str] = None
    is_organic: Optional[bool] = False
    cultivated_area: Optional[float] = None
    harvest_date: Optional[str] = None
    certification_type: Optional[str] = None
    certification_number: Optional[str] = None
    certificate_doc_url: Optional[str] = None

class ProductListingResponse(ProductListingCreate):
    id: int
    seller_id: int
    seller_name: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str
    delivery_notes: Optional[str] = None
    contact_phone: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None
    status: str
    total_amount: float
    delivery_address: str
    items: List[Dict[str, Any]]
    delivery_partner_id: Optional[int] = None
    delivery_partner_name: Optional[str] = None
    delivery_partner_phone: Optional[str] = None
    delivery_status: Optional[str] = "UNASSIGNED"
    delivery_otp: Optional[str] = None
    pickup_address: Optional[str] = None
    pickup_contact_name: Optional[str] = None
    pickup_contact_phone: Optional[str] = None
    pickup_latitude: Optional[float] = None
    pickup_longitude: Optional[float] = None
    dropoff_latitude: Optional[float] = None
    dropoff_longitude: Optional[float] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    gps_speed_kmh: Optional[float] = 0.0
    estimated_distance_km: Optional[float] = 0.0
    estimated_duration_mins: Optional[int] = 0
    delivery_fee: Optional[float] = 0.0
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    delivery_notes: Optional[str] = None
    delivery_notes_partner: Optional[str] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Delivery Partner Schemas
class DeliveryStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DeliveryConfirmRequest(BaseModel):
    otp: str
    pod_notes: Optional[str] = None
    pod_signature: Optional[str] = "Verified by Recipient"

class DeliveryGpsUpdate(BaseModel):
    latitude: float
    longitude: float
    gps_speed_kmh: Optional[float] = 0.0

class DeliveryCheckpointResponse(BaseModel):
    id: int
    order_id: int
    status: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class DeliveryOrderResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    delivery_partner_id: Optional[int] = None
    delivery_partner_name: Optional[str] = None
    delivery_partner_phone: Optional[str] = None
    buyer_name: str
    buyer_phone: Optional[str] = None
    seller_name: str
    seller_phone: Optional[str] = None
    order_status: str
    delivery_status: str
    total_amount: float
    delivery_fee: float
    items: List[Dict[str, Any]]
    pickup_address: Optional[str] = None
    pickup_contact_name: Optional[str] = None
    pickup_contact_phone: Optional[str] = None
    pickup_latitude: Optional[float] = None
    pickup_longitude: Optional[float] = None
    delivery_address: str
    dropoff_latitude: Optional[float] = None
    dropoff_longitude: Optional[float] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    gps_speed_kmh: Optional[float] = 0.0
    estimated_distance_km: float
    estimated_duration_mins: int
    delivery_otp: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    route_waypoints_json: Optional[str] = None
    delivery_notes: Optional[str] = None
    pod_notes: Optional[str] = None
    pod_signature: Optional[str] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    notification_type: str
    priority: str
    title: str
    message: str
    related_resource: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
