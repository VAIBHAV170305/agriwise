import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="Farmer", nullable=False)  # Farmer, Buyer, FPO, Admin
    account_status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, SUSPENDED
    preferred_language = Column(String(10), default="en", nullable=True)  # en, hi, gu, mr, pa, te, ta, bn, kn
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    recommendations = relationship("CropRecommendation", back_populates="user")
    disease_analyses = relationship("DiseaseAnalysis", back_populates="user")
    listings = relationship("ProductListing", back_populates="seller")
    orders_placed = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    orders_received = relationship("Order", back_populates="seller", foreign_keys="Order.seller_id")
    deliveries = relationship("Order", back_populates="delivery_partner", foreign_keys="Order.delivery_partner_id")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
    conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    fpo_memberships = relationship("FPOMembership", back_populates="farmer", foreign_keys="FPOMembership.farmer_id")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area = Column(Float, nullable=False)
    area_unit = Column(String(20), default="Acres")  # Acres, Hectares
    soil_type = Column(String(50), nullable=True)  # Alluvial, Black, Red, Laterite, Clay, Sandy, Loamy
    irrigation_type = Column(String(50), nullable=True)  # Drip, Sprinkler, Canal, Tube well, Rainfed
    water_resources = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    crops = relationship("CropRecord", back_populates="farm", cascade="all, delete-orphan")
    activities = relationship("FarmActivity", back_populates="farm", cascade="all, delete-orphan")
    expenses = relationship("FarmExpense", back_populates="farm", cascade="all, delete-orphan")

class CropRecord(Base):
    __tablename__ = "crop_records"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    region = Column(String(100), nullable=True)
    crop_variety = Column(String(100), nullable=True)
    sowing_date = Column(String(30), nullable=True)
    expected_harvest_date = Column(String(30), nullable=True)
    actual_harvest_date = Column(String(30), nullable=True)
    cultivated_area = Column(Float, nullable=True)
    season = Column(String(50), nullable=True)  # Kharif, Rabi, Zaid, Summer, Annual
    growth_stage = Column(String(50), default="Germination")  # Sowing, Vegetative, Flowering, Fruiting, Maturity, Harvested
    harvest_quantity = Column(Float, nullable=True)
    quantity_unit = Column(String(20), default="Quintals")
    status = Column(String(30), default="ACTIVE")  # ACTIVE, HARVESTED, ARCHIVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="crops")
    activities = relationship("FarmActivity", back_populates="crop_record")
    expenses = relationship("FarmExpense", back_populates="crop_record")

class FarmActivity(Base):
    __tablename__ = "farm_activities"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_record_id = Column(Integer, ForeignKey("crop_records.id"), nullable=True)
    activity_type = Column(String(50), nullable=False)  # Sowing, Irrigation, Fertilizer, Pesticide, Weeding, Inspection, Harvesting
    activity_date = Column(String(30), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(String(50), nullable=True)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="activities")
    crop_record = relationship("CropRecord", back_populates="activities")

class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_record_id = Column(Integer, ForeignKey("crop_records.id"), nullable=True)
    category = Column(String(50), nullable=False)  # Seeds, Fertilizer, Crop Protection, Irrigation, Labor, Equipment, Transport, Other
    amount = Column(Float, nullable=False)
    date = Column(String(30), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="expenses")
    crop_record = relationship("CropRecord", back_populates="expenses")

class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    input_features_json = Column(Text, nullable=False)  # N, P, K, temp, humidity, ph, rainfall
    recommended_crop = Column(String(80), nullable=False)
    alternative_crops_json = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    model_version = Column(String(50), default="rf_crop_v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

class DiseaseAnalysis(Base):
    __tablename__ = "disease_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_record_id = Column(Integer, ForeignKey("crop_records.id"), nullable=True)
    crop_name = Column(String(80), nullable=False)
    predicted_disease = Column(String(120), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(30), default="Moderate")  # Low, Moderate, High, Severe
    symptoms = Column(Text, nullable=True)
    management_guide_json = Column(Text, nullable=True)  # organic, chemical, prevention
    image_url_or_preview = Column(Text, nullable=True)
    is_uncertain = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="disease_analyses")

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, default=0.0)
    wind_speed = Column(Float, default=0.0)
    condition = Column(String(80), nullable=False)
    forecast_json = Column(Text, nullable=True)
    agricultural_advisories_json = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(80), nullable=False)  # Soil, Irrigation, Crop Diseases, Fertilizers, Market
    source = Column(String(150), default="ICAR & Agronomy Standard Handbook")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), default="Farming Inquiry")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"), nullable=False)
    sender_role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)  # retrieved knowledge chunks
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("ChatConversation", back_populates="messages")

class MarketRecord(Base):
    __tablename__ = "market_records"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Cereals, Pulses, Fruits, Vegetables, Spices, Cash Crops
    market_location = Column(String(100), nullable=False)
    date_period = Column(String(30), nullable=False)
    observed_demand = Column(Float, nullable=False)  # In Quintals
    observed_price = Column(Float, nullable=False)  # In ₹/Kg
    price_unit = Column(String(20), default="₹/kg")
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    market_location = Column(String(100), nullable=False)
    forecast_period = Column(String(50), nullable=False)
    predicted_demand = Column(Float, nullable=False)
    predicted_price_min = Column(Float, nullable=False)
    predicted_price_max = Column(Float, nullable=False)
    trend = Column(String(20), default="UP")  # UP, DOWN, STABLE
    confidence = Column(Float, default=0.88)
    model_version = Column(String(50), default="rf_demand_v1.0")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

class ProductListing(Base):
    __tablename__ = "product_listings"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    product_name = Column(String(120), nullable=False)
    category = Column(String(50), nullable=False)  # Cereals, Pulses, Fruits, Vegetables, Spices, Cash Crops
    description = Column(Text, nullable=True)
    available_quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")  # kg, quintals, tonnes, boxes
    asking_price = Column(Float, nullable=False)  # per unit
    location = Column(String(150), nullable=False)
    region = Column(String(100), nullable=True)
    harvest_date = Column(String(30), nullable=True)
    image_url = Column(Text, nullable=True)
    is_organic = Column(Boolean, default=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, PAUSED, OUT_OF_STOCK, ARCHIVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    seller = relationship("User", back_populates="listings")
    order_items = relationship("OrderItem", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), default="PENDING")  # PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, SHIPPED, DELIVERED, CANCELLED
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_notes = Column(Text, nullable=True)
    contact_phone = Column(String(30), nullable=True)

    # Logistics & Delivery Partner fields
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    delivery_status = Column(String(50), default="UNASSIGNED", nullable=True)  # UNASSIGNED, ASSIGNED, OUT_FOR_PICKUP, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    pickup_address = Column(Text, nullable=True)
    pickup_contact_name = Column(String(100), nullable=True)
    pickup_contact_phone = Column(String(30), nullable=True)
    pickup_latitude = Column(Float, nullable=True)
    pickup_longitude = Column(Float, nullable=True)
    dropoff_latitude = Column(Float, nullable=True)
    dropoff_longitude = Column(Float, nullable=True)
    estimated_distance_km = Column(Float, default=0.0)
    estimated_duration_mins = Column(Integer, default=0)
    delivery_fee = Column(Float, default=0.0)
    delivery_otp = Column(String(10), nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    delivery_notes_partner = Column(Text, nullable=True)
    route_waypoints_json = Column(Text, nullable=True)
    vehicle_type = Column(String(60), default="Agri-Truck Mini (1.5 Tonne)", nullable=True)
    vehicle_number = Column(String(30), default="GJ-23-AX-8910", nullable=True)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    gps_speed_kmh = Column(Float, default=0.0)
    last_gps_update = Column(DateTime, nullable=True)
    pod_notes = Column(Text, nullable=True)
    pod_signature = Column(String(150), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    buyer = relationship("User", back_populates="orders_placed", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="orders_received", foreign_keys=[seller_id])
    delivery_partner = relationship("User", back_populates="deliveries", foreign_keys=[delivery_partner_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    checkpoints = relationship("DeliveryCheckpoint", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_listings.id"), nullable=False)
    product_name = Column(String(120), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    agreed_price_per_unit = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("ProductListing", back_populates="order_items")

class DeliveryCheckpoint(Base):
    __tablename__ = "delivery_checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="checkpoints")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)  # WEATHER, ADVISORY, ORDER, MARKET, DISEASE, SYSTEM
    priority = Column(String(20), default="INFO")  # URGENT, WARNING, INFO
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    related_resource = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recipient = relationship("User", back_populates="notifications")

class FPOOrganization(Base):
    __tablename__ = "fpo_organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    registration_number = Column(String(80), unique=True, nullable=False)
    contact_email = Column(String(120), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    region = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    memberships = relationship("FPOMembership", back_populates="fpo", cascade="all, delete-orphan")

class FPOMembership(Base):
    __tablename__ = "fpo_memberships"

    id = Column(Integer, primary_key=True, index=True)
    fpo_id = Column(Integer, ForeignKey("fpo_organizations.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, PENDING, INACTIVE
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    fpo = relationship("FPOOrganization", back_populates="memberships")
    farmer = relationship("User", back_populates="fpo_memberships", foreign_keys=[farmer_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_email = Column(String(120), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(80), nullable=False)
    resource_id = Column(String(80), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
