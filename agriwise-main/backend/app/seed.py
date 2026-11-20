from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
import datetime
from .models import (
    User, Farm, CropRecord, FarmActivity, FarmExpense,
    ProductListing, Notification, FPOOrganization, FPOMembership, KnowledgeDocument,
    Order, OrderItem, DeliveryCheckpoint
)
from .auth import hash_password
import json
import os

def ensure_logistics_columns(engine):
    """Safely migrate SQLite database to add logistics fields if they don't already exist."""
    inspector = inspect(engine)
    existing_cols = {c['name'] for c in inspector.get_columns('orders')}
    
    needed_cols = [
        ("delivery_partner_id", "INTEGER"),
        ("delivery_status", "VARCHAR(50) DEFAULT 'UNASSIGNED'"),
        ("pickup_address", "TEXT"),
        ("pickup_contact_name", "VARCHAR(100)"),
        ("pickup_contact_phone", "VARCHAR(30)"),
        ("pickup_latitude", "FLOAT"),
        ("pickup_longitude", "FLOAT"),
        ("dropoff_latitude", "FLOAT"),
        ("dropoff_longitude", "FLOAT"),
        ("estimated_distance_km", "FLOAT DEFAULT 0.0"),
        ("estimated_duration_mins", "INTEGER DEFAULT 0"),
        ("delivery_fee", "FLOAT DEFAULT 0.0"),
        ("delivery_otp", "VARCHAR(10)"),
        ("delivered_at", "DATETIME"),
        ("delivery_notes_partner", "TEXT"),
        ("route_waypoints_json", "TEXT"),
        ("vehicle_type", "VARCHAR(60) DEFAULT 'Agri-Truck Mini (1.5 Tonne)'"),
        ("vehicle_number", "VARCHAR(30) DEFAULT 'GJ-23-AX-8910'"),
        ("current_latitude", "FLOAT"),
        ("current_longitude", "FLOAT"),
        ("gps_speed_kmh", "FLOAT DEFAULT 0.0"),
        ("last_gps_update", "DATETIME"),
        ("pod_notes", "TEXT"),
        ("pod_signature", "VARCHAR(150)")
    ]
    
    # Ensure crop_records has region column
    try:
        crop_cols = {c['name'] for c in inspector.get_columns('crop_records')}
        with engine.connect() as conn:
            if 'region' not in crop_cols:
                conn.execute(text("ALTER TABLE crop_records ADD COLUMN region VARCHAR(100) DEFAULT 'Western Plain Zone (Gujarat)'"))
                conn.commit()
    except Exception as e:
        print(f"Crop records migration warning: {e}")

    # Ensure product_listings has region and harvest_date columns
    try:
        prod_cols = {c['name'] for c in inspector.get_columns('product_listings')}
        with engine.connect() as conn:
            if 'region' not in prod_cols:
                conn.execute(text("ALTER TABLE product_listings ADD COLUMN region VARCHAR(100) DEFAULT 'Western Plain Zone (Gujarat)'"))
                conn.commit()
            if 'harvest_date' not in prod_cols:
                conn.execute(text("ALTER TABLE product_listings ADD COLUMN harvest_date VARCHAR(30)"))
                conn.commit()
    except Exception as e:
        print(f"Product listings migration warning: {e}")

    with engine.connect() as conn:
        for col_name, col_type in needed_cols:
            if col_name not in existing_cols:
                try:
                    conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception as e:
                    print(f"Column migration warning for {col_name}: {e}")

        # Ensure any existing orders have valid delivery fallback values
        try:
            conn.execute(text("UPDATE orders SET delivery_otp = '4829' WHERE delivery_otp IS NULL OR delivery_otp = ''"))
            conn.execute(text("UPDATE orders SET delivery_status = 'UNASSIGNED' WHERE delivery_status IS NULL OR delivery_status = ''"))
            conn.execute(text("UPDATE orders SET delivery_fee = 480.0 WHERE delivery_fee IS NULL OR delivery_fee = 0.0"))
            conn.commit()
        except Exception as e:
            print(f"Logistics backfill warning: {e}")

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@agriwise.com").first():
        return

    print("Seeding initial Agri-Wise database records...")

    # 1. Users for each role
    admin_user = User(
        name="Platform Administrator",
        email="admin@agriwise.com",
        phone="+91-9876543210",
        password_hash=hash_password("Admin@123"),
        role="Admin",
        account_status="ACTIVE"
    )
    farmer_user = User(
        name="Ramesh Patel (Farmer)",
        email="farmer@agriwise.com",
        phone="+91-9876543211",
        password_hash=hash_password("Farmer@123"),
        role="Farmer",
        account_status="ACTIVE"
    )
    buyer_user = User(
        name="Ananya Sharma (Wholesale Buyer)",
        email="buyer@agriwise.com",
        phone="+91-9876543212",
        password_hash=hash_password("Buyer@123"),
        role="Buyer",
        account_status="ACTIVE"
    )
    fpo_user = User(
        name="Sanjay Verma (FPO Lead)",
        email="fpo@agriwise.com",
        phone="+91-9876543213",
        password_hash=hash_password("FPO@123"),
        role="FPO",
        account_status="ACTIVE"
    )

    db.add_all([admin_user, farmer_user, buyer_user, fpo_user])
    db.commit()
    db.refresh(farmer_user)
    db.refresh(buyer_user)
    db.refresh(fpo_user)

    # 2. Farms for farmer
    farm1 = Farm(
        owner_id=farmer_user.id,
        farm_name="Green Meadows Farm (North Block)",
        location="Anand, Gujarat (22.56°N, 72.95°E)",
        latitude=22.5645,
        longitude=72.9289,
        area=12.5,
        area_unit="Acres",
        soil_type="Loamy Alluvial",
        irrigation_type="Drip & Tube-well",
        water_resources="Borewell + Canal distributary",
        description="Certified sustainable farm specializing in Wheat, Cotton, and organic vegetables."
    )
    farm2 = Farm(
        owner_id=farmer_user.id,
        farm_name="Surya Valley Orchards",
        location="Nashik, Maharashtra (19.99°N, 73.78°E)",
        latitude=19.9975,
        longitude=73.7898,
        area=6.0,
        area_unit="Acres",
        soil_type="Black Clay Loam",
        irrigation_type="Micro-Sprinkler",
        water_resources="Farm pond and drip filtration unit",
        description="High-density horticulture plot producing table grapes and greenhouse tomatoes."
    )
    db.add_all([farm1, farm2])
    db.commit()
    db.refresh(farm1)
    db.refresh(farm2)

    # 3. Crops
    crop1 = CropRecord(
        farm_id=farm1.id,
        crop_name="Wheat (Sharbati Gold)",
        crop_variety="HD-3226 Super Cereal",
        sowing_date="2026-11-15",
        expected_harvest_date="2027-03-25",
        cultivated_area=8.0,
        season="Rabi",
        growth_stage="Flowering & Grain Filling",
        harvest_quantity=180.0,
        quantity_unit="Quintals",
        status="ACTIVE"
    )
    crop2 = CropRecord(
        farm_id=farm2.id,
        crop_name="Hybrid Organic Tomato",
        crop_variety="Abhinav F1",
        sowing_date="2026-08-10",
        expected_harvest_date="2026-11-20",
        cultivated_area=3.5,
        season="Kharif",
        growth_stage="Fruiting & Harvest",
        harvest_quantity=450.0,
        quantity_unit="Crater Boxes (25kg)",
        status="ACTIVE"
    )
    db.add_all([crop1, crop2])
    db.commit()
    db.refresh(crop1)
    db.refresh(crop2)

    # 4. Activities & Expenses
    act1 = FarmActivity(
        farm_id=farm1.id,
        crop_record_id=crop1.id,
        activity_type="Fertilizer",
        activity_date="2026-10-02",
        description="Top-dressing with neem-coated urea @ 45 kg/acre during early morning.",
        cost=3200.0
    )
    act2 = FarmActivity(
        farm_id=farm2.id,
        crop_record_id=crop2.id,
        activity_type="Irrigation",
        activity_date="2026-10-08",
        description="Scheduled 4-hour precision drip fertigation with soluble potassium nitrate.",
        cost=850.0
    )
    exp1 = FarmExpense(
        farm_id=farm1.id,
        crop_record_id=crop1.id,
        category="Seeds",
        amount=14500.0,
        date="2026-09-15",
        description="Purchase of certified HD-3226 pedigree seed sacks."
    )
    exp2 = FarmExpense(
        farm_id=farm1.id,
        crop_record_id=crop1.id,
        category="Irrigation",
        amount=4200.0,
        date="2026-09-28",
        description="Canal water tariff and electricity charge."
    )
    exp3 = FarmExpense(
        farm_id=farm2.id,
        crop_record_id=crop2.id,
        category="Labor",
        amount=9800.0,
        date="2026-10-05",
        description="Pruning and trellis staking labor crew."
    )
    db.add_all([act1, act2, exp1, exp2, exp3])

    # 5. Marketplace Product Listings
    prod1 = ProductListing(
        seller_id=farmer_user.id,
        farm_id=farm1.id,
        product_name="Premium Sharbati Wheat (Milled Grain)",
        category="Cereals",
        description="Golden grain, rich in protein, naturally sun-dried to 11% moisture. Chemical residue-free.",
        available_quantity=2500.0,
        unit="kg",
        asking_price=32.0,
        location="Anand, Gujarat",
        image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
        is_organic=True,
        status="ACTIVE"
    )
    prod2 = ProductListing(
        seller_id=farmer_user.id,
        farm_id=farm2.id,
        product_name="Grade-A Farm Fresh Red Tomatoes",
        category="Vegetables",
        description="Firm, uniformly ripened hybrid tomatoes with high lycopene content. Harvested at pink blush stage.",
        available_quantity=1800.0,
        unit="kg",
        asking_price=28.0,
        location="Nashik, Maharashtra",
        image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
        is_organic=False,
        status="ACTIVE"
    )
    prod3 = ProductListing(
        seller_id=farmer_user.id,
        farm_id=farm1.id,
        product_name="Desi Chickpea / Bengal Gram (Chana)",
        category="Pulses",
        description="Cleaned, unpolished bold desi chana with high germinability and nutrition.",
        available_quantity=1200.0,
        unit="kg",
        asking_price=64.0,
        location="Anand, Gujarat",
        image_url="https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
        is_organic=True,
        status="ACTIVE"
    )
    db.add_all([prod1, prod2, prod3])

    # 6. Notifications for Farmer
    n1 = Notification(
        recipient_id=farmer_user.id,
        notification_type="WEATHER",
        priority="WARNING",
        title="Weather Alert: Rain Expected in 48 Hours",
        message="Meteorological sensors predict 12mm rain. Postpone fungicide spraying on North Farm Block.",
        related_resource="/weather"
    )
    n2 = Notification(
        recipient_id=farmer_user.id,
        notification_type="MARKET",
        priority="INFO",
        title="Tomato Mandi Demand Rising",
        message="Regional Mandi demand index for tomato increased by 18% this week with prices reaching ₹32/kg.",
        related_resource="/market"
    )
    db.add_all([n1, n2])

    # 7. FPO Organization
    fpo_org = FPOOrganization(
        name="Kisan Kalyan Agritech Producer Co.",
        registration_number="FPO-2026-IND-8841",
        contact_email="kisan.fpo@agriwise.com",
        region="Western Agro-Climatic Zone",
        description="Cooperative supporting smallholder aggregation, shared tractor fleet, bulk fertilizer procurement, and direct consumer supply chains."
    )
    db.add(fpo_org)
    db.commit()
    db.refresh(fpo_org)

    fpo_member = FPOMembership(
        fpo_id=fpo_org.id,
        farmer_id=farmer_user.id,
        status="ACTIVE"
    )
    db.add(fpo_member)
    db.commit()

    print("Initial seed data successfully written to database!")

def seed_delivery_data(db: Session):
    """Seed Delivery Partner demo user and realistic active/historical agricultural logistics orders."""
    # Check if delivery partner already exists
    delivery_user = db.query(User).filter(User.email == "delivery@agriwise.com").first()
    if not delivery_user:
        delivery_user = User(
            name="Vikram Singh (Agri Logistics Partner)",
            email="delivery@agriwise.com",
            phone="+91-9876543214",
            password_hash=hash_password("Delivery@123"),
            role="Delivery",
            account_status="ACTIVE"
        )
        db.add(delivery_user)
        db.commit()
        db.refresh(delivery_user)
        print("Created Delivery Partner user: delivery@agriwise.com")

    # Fetch farmer and buyer for foreign keys
    farmer_user = db.query(User).filter(User.role == "Farmer").first()
    buyer_user = db.query(User).filter(User.role == "Buyer").first()
    wheat_prod = db.query(ProductListing).filter(ProductListing.product_name.like("%Wheat%")).first()
    tomato_prod = db.query(ProductListing).filter(ProductListing.product_name.like("%Tomato%")).first()

    if not farmer_user or not buyer_user:
        return

    # Check if we already have logistics orders for this partner
    existing_delivery_orders = db.query(Order).filter(Order.delivery_partner_id == delivery_user.id).count()
    if existing_delivery_orders > 0:
        return

    print("Seeding rich Agricultural Logistics and GPS delivery orders...")

    # Order 1: Active IN_TRANSIT order with Live GPS Telemetry & Waypoints
    order1 = Order(
        buyer_id=buyer_user.id,
        seller_id=farmer_user.id,
        delivery_partner_id=delivery_user.id,
        status="SHIPPED",
        delivery_status="IN_TRANSIT",
        total_amount=16000.0,
        delivery_fee=1450.0,
        delivery_otp="4829",
        pickup_address="Gate 2, Green Meadows Farm, Anand-Nadiad Highway, Anand Rural, Gujarat - 388001",
        pickup_contact_name=farmer_user.name,
        pickup_contact_phone=farmer_user.phone or "+91-9876543211",
        pickup_latitude=22.5645,
        pickup_longitude=72.9289,
        delivery_address="Wholesale Bay #14, APMC Naroda Terminal, Ahmedabad Mandi Hub, Gujarat - 382330",
        dropoff_latitude=23.0754,
        dropoff_longitude=72.6392,
        current_latitude=22.8210,
        current_longitude=72.7845,
        gps_speed_kmh=46.5,
        last_gps_update=datetime.datetime.utcnow(),
        estimated_distance_km=76.8,
        estimated_duration_mins=95,
        vehicle_type="Agri-Truck Mini (1.5 Tonne Eco-Diesel)",
        vehicle_number="GJ-23-AX-8910",
        delivery_notes="500 kg Sharbati Wheat. Tarpaulin cover mandatory. Handle with moisture guard.",
        delivery_notes_partner="Cargo verified and moisture level within 11% safe threshold. Cruising on NH-48 towards Bareja.",
        route_waypoints_json=json.dumps([
            {"step": 1, "name": "Farm Gate Anand Dispatch", "status": "COMPLETED", "lat": 22.5645, "lng": 72.9289},
            {"step": 2, "name": "NE-1 Toll Plaza (Nadiad)", "status": "COMPLETED", "lat": 22.6912, "lng": 72.8631},
            {"step": 3, "name": "Bareja Junction (Current Location)", "status": "IN_PROGRESS", "lat": 22.8210, "lng": 72.7845},
            {"step": 4, "name": "South Ring Road Flyover", "status": "PENDING", "lat": 22.9815, "lng": 72.6512},
            {"step": 5, "name": "APMC Naroda Bay #14 Dock", "status": "PENDING", "lat": 23.0754, "lng": 72.6392}
        ]),
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3),
        updated_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
    )
    db.add(order1)
    db.commit()
    db.refresh(order1)

    # Order 1 items
    if wheat_prod:
        item1 = OrderItem(
            order_id=order1.id,
            product_id=wheat_prod.id,
            product_name=wheat_prod.product_name,
            quantity=500.0,
            unit="kg",
            agreed_price_per_unit=32.0,
            total_price=16000.0
        )
        db.add(item1)

    # Order 1 checkpoints
    cp1 = DeliveryCheckpoint(
        order_id=order1.id,
        delivery_partner_id=delivery_user.id,
        status="ASSIGNED",
        location_name="AgriWise Anand Logistics Command",
        latitude=22.5645,
        longitude=72.9289,
        notes="Order assigned to partner Vikram Singh. Dispatch schedule confirmed.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=45)
    )
    cp2 = DeliveryCheckpoint(
        order_id=order1.id,
        delivery_partner_id=delivery_user.id,
        status="OUT_FOR_PICKUP",
        location_name="En Route to Farm Gate #2",
        latitude=22.5640,
        longitude=72.9280,
        notes="Vehicle arrived at Anand Farm Gate. Quality seal check initiated.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=10)
    )
    cp3 = DeliveryCheckpoint(
        order_id=order1.id,
        delivery_partner_id=delivery_user.id,
        status="PICKED_UP",
        location_name="Green Meadows Farm Gate #2",
        latitude=22.5645,
        longitude=72.9289,
        notes="500 kg Wheat loaded securely. Weighbridge manifest signed by Farmer Ramesh Patel.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=30)
    )
    cp4 = DeliveryCheckpoint(
        order_id=order1.id,
        delivery_partner_id=delivery_user.id,
        status="IN_TRANSIT",
        location_name="NH-48 Corridor (Bareja Sector)",
        latitude=22.8210,
        longitude=72.7845,
        notes="Transit in progress at 46.5 km/h. Live GPS telemetry active.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
    )
    db.add_all([cp1, cp2, cp3, cp4])

    # Order 2: OUT_FOR_PICKUP (Assigned, heading to pickup location)
    order2 = Order(
        buyer_id=buyer_user.id,
        seller_id=farmer_user.id,
        delivery_partner_id=delivery_user.id,
        status="PROCESSING",
        delivery_status="OUT_FOR_PICKUP",
        total_amount=8400.0,
        delivery_fee=920.0,
        delivery_otp="7261",
        pickup_address="Surya Valley Orchards, Dindori Road, Nashik, Maharashtra - 422004",
        pickup_contact_name=farmer_user.name,
        pickup_contact_phone=farmer_user.phone or "+91-9876543211",
        pickup_latitude=19.9975,
        pickup_longitude=73.7898,
        delivery_address="Hadapsar Agro Terminal Cold Storage, Pune, Maharashtra - 411028",
        dropoff_latitude=18.5204,
        dropoff_longitude=73.8567,
        current_latitude=20.0050,
        current_longitude=73.7920,
        gps_speed_kmh=24.0,
        last_gps_update=datetime.datetime.utcnow(),
        estimated_distance_km=210.0,
        estimated_duration_mins=240,
        vehicle_type="Refrigerated Reefer Van (2 Tonne)",
        vehicle_number="MH-15-EG-4421",
        delivery_notes="Perishable grade-A tomatoes. Maintain temperature between 14-16°C.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1),
        updated_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
    )
    db.add(order2)
    db.commit()
    db.refresh(order2)

    if tomato_prod:
        item2 = OrderItem(
            order_id=order2.id,
            product_id=tomato_prod.id,
            product_name=tomato_prod.product_name,
            quantity=300.0,
            unit="kg",
            agreed_price_per_unit=28.0,
            total_price=8400.0
        )
        db.add(item2)

    cp_o2 = DeliveryCheckpoint(
        order_id=order2.id,
        delivery_partner_id=delivery_user.id,
        status="OUT_FOR_PICKUP",
        location_name="Nashik Agro Corridor (Approaching Farm)",
        latitude=20.0050,
        longitude=73.7920,
        notes="Reefer van pre-cooled to 15°C. ETA to farm gate: 12 minutes.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
    )
    db.add(cp_o2)

    # Order 3: Completed DELIVERED order for history
    order3 = Order(
        buyer_id=buyer_user.id,
        seller_id=farmer_user.id,
        delivery_partner_id=delivery_user.id,
        status="DELIVERED",
        delivery_status="DELIVERED",
        total_amount=12800.0,
        delivery_fee=850.0,
        delivery_otp="1234",
        pickup_address="Green Meadows Farm, Block B, Anand Rural, Gujarat",
        pickup_contact_name=farmer_user.name,
        pickup_contact_phone=farmer_user.phone or "+91-9876543211",
        pickup_latitude=22.5645,
        pickup_longitude=72.9289,
        delivery_address="Kalyan Mandi Grain Depot, Sayajiganj, Vadodara, Gujarat - 390005",
        dropoff_latitude=22.3072,
        dropoff_longitude=73.1812,
        current_latitude=22.3072,
        current_longitude=73.1812,
        gps_speed_kmh=0.0,
        estimated_distance_km=46.2,
        estimated_duration_mins=55,
        vehicle_type="Agri-Truck Mini (1.5 Tonne Eco-Diesel)",
        vehicle_number="GJ-23-AX-8910",
        delivered_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=2),
        pod_notes="All 40 jute bags received in flawless condition with zero moisture damage. Verified by depot manager Manoj K.",
        pod_signature="Receiver: Manoj K. (Depot In-charge) • Verified via Secure OTP 1234",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=6),
        updated_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=2)
    )
    db.add(order3)
    db.commit()
    db.refresh(order3)

    if wheat_prod:
        item3 = OrderItem(
            order_id=order3.id,
            product_id=wheat_prod.id,
            product_name=wheat_prod.product_name,
            quantity=400.0,
            unit="kg",
            agreed_price_per_unit=32.0,
            total_price=12800.0
        )
        db.add(item3)

    cp_hist = DeliveryCheckpoint(
        order_id=order3.id,
        delivery_partner_id=delivery_user.id,
        status="DELIVERED",
        location_name="Vadodara Mandi Depot Dock #2",
        latitude=22.3072,
        longitude=73.1812,
        notes="Produce safely unloaded. OTP verification successful. Trip complete.",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=2)
    )
    db.add(cp_hist)

    # Order 4: Available pool (UNASSIGNED) order that delivery partner can claim
    order4 = Order(
        buyer_id=buyer_user.id,
        seller_id=farmer_user.id,
        delivery_partner_id=None,
        status="READY_FOR_DISPATCH",
        delivery_status="UNASSIGNED",
        total_amount=19200.0,
        delivery_fee=2450.0,
        delivery_otp="9941",
        pickup_address="Agro Logistics Hub Plot 9, Bardoli Road, Surat, Gujarat - 395006",
        pickup_contact_name="Sanjay Patel (Farm Aggregator)",
        pickup_contact_phone="+91-9876543299",
        pickup_latitude=21.1702,
        pickup_longitude=72.8311,
        delivery_address="Vashi APMC Agricultural Sector 19, Navi Mumbai, Maharashtra - 400703",
        dropoff_latitude=19.0760,
        dropoff_longitude=72.9980,
        estimated_distance_km=284.0,
        estimated_duration_mins=320,
        vehicle_type="Heavy Agri-Hauler (3.5 Tonne)",
        vehicle_number="TBD (Available for Assignment)",
        delivery_notes="Bulk 600kg Chickpea (Desi Chana) consignment. Palletized and shrink-wrapped.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
        updated_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    db.add(order4)
    db.commit()
    db.refresh(order4)

    if wheat_prod:
        item4 = OrderItem(
            order_id=order4.id,
            product_id=wheat_prod.id,
            product_name="Desi Chickpea / Bengal Gram (Chana)",
            quantity=300.0,
            unit="kg",
            agreed_price_per_unit=64.0,
            total_price=19200.0
        )
        db.add(item4)

    db.commit()
    print("Agricultural logistics seed completed successfully!")

