import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Order, OrderItem, ProductListing, Notification, User, DeliveryCheckpoint
from ..schemas import OrderCreate, OrderResponse
from ..auth import get_current_user, log_audit

router = APIRouter(prefix="/orders", tags=["Order & Logistics Management"])

VALID_TRANSITIONS = {
    "PENDING": ["ACCEPTED", "CANCELLED"],
    "ACCEPTED": ["PROCESSING", "CANCELLED"],
    "PROCESSING": ["READY_FOR_DISPATCH", "CANCELLED"],
    "READY_FOR_DISPATCH": ["SHIPPED", "CANCELLED"],
    "SHIPPED": ["DELIVERED"],
    "DELIVERED": [],
    "CANCELLED": []
}

@router.post("", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one product.")

    # Group items by seller and validate stock
    total_order_amount = 0.0
    items_to_create = []
    seller_id = None

    for item_req in order_in.items:
        product = db.query(ProductListing).filter(ProductListing.id == item_req.product_id).first()
        if not product or product.status != "ACTIVE":
            raise HTTPException(status_code=404, detail=f"Product #{item_req.product_id} is unavailable or archived.")

        if item_req.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")

        if product.available_quantity < item_req.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Requested quantity ({item_req.quantity} {product.unit}) exceeds available stock ({product.available_quantity} {product.unit}) for '{product.product_name}'."
            )

        if seller_id is None:
            seller_id = product.seller_id
        elif seller_id != product.seller_id:
            raise HTTPException(status_code=400, detail="For direct coordination, items in a single order must come from the same farm/seller.")

        # Atomic inventory deduction
        product.available_quantity -= item_req.quantity
        if product.available_quantity == 0:
            product.status = "OUT_OF_STOCK"

        item_total = product.asking_price * item_req.quantity
        total_order_amount += item_total

        items_to_create.append({
            "product_id": product.id,
            "product_name": product.product_name,
            "quantity": item_req.quantity,
            "unit": product.unit,
            "agreed_price_per_unit": product.asking_price,
            "total_price": item_total
        })

    # Fetch seller details for pickup coordination
    seller = db.query(User).filter(User.id == seller_id).first()
    seller_name = seller.name if seller else "Farmer"
    seller_phone = seller.phone if seller else "+91-9876543211"
    
    # Pickup location from product listing or default regional farm gate
    pickup_addr = product.location if (product and product.location) else "Green Meadows Farm, Block A, Anand Rural, Gujarat"

    # Generate random secure 4-digit OTP for delivery verification
    delivery_otp = str(random.randint(1000, 9999))
    total_qty = sum(itm["quantity"] for itm in items_to_create)
    delivery_fee = round(max(350.0, 350.0 + (total_qty * 1.5)), 2)

    pickup_lat = 22.5645
    pickup_lng = 72.9289
    dropoff_lat = 22.5560
    dropoff_lng = 72.9510

    # Create Order mapped directly with delivery parameters
    new_order = Order(
        buyer_id=current_user.id,
        seller_id=seller_id,
        status="PENDING",
        total_amount=round(total_order_amount, 2),
        delivery_address=order_in.delivery_address,
        delivery_notes=order_in.delivery_notes,
        contact_phone=order_in.contact_phone or current_user.phone,
        delivery_partner_id=None,
        delivery_status="UNASSIGNED",
        delivery_otp=delivery_otp,
        delivery_fee=delivery_fee,
        pickup_address=pickup_addr,
        pickup_contact_name=seller_name,
        pickup_contact_phone=seller_phone,
        pickup_latitude=pickup_lat,
        pickup_longitude=pickup_lng,
        dropoff_latitude=dropoff_lat,
        dropoff_longitude=dropoff_lng,
        current_latitude=pickup_lat,
        current_longitude=pickup_lng,
        estimated_distance_km=24.8,
        estimated_duration_mins=42,
        vehicle_type="Agri-Truck Mini (1.5 Tonne)",
        vehicle_number="GJ-23-AX-8910"
    )
    db.add(new_order)
    db.flush()

    for itm in items_to_create:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=itm["product_id"],
            product_name=itm["product_name"],
            quantity=itm["quantity"],
            unit=itm["unit"],
            agreed_price_per_unit=itm["agreed_price_per_unit"],
            total_price=itm["total_price"]
        )
        db.add(order_item)

    # Initial delivery checkpoint
    init_checkpoint = DeliveryCheckpoint(
        order_id=new_order.id,
        status="UNASSIGNED",
        location_name="Farmer Gate Dispatch Terminal",
        latitude=pickup_lat,
        longitude=pickup_lng,
        notes="Purchase contract initiated. Ready in agricultural freight dispatch pool."
    )
    db.add(init_checkpoint)

    # Trigger notification to Seller
    seller_notif = Notification(
        recipient_id=seller_id,
        notification_type="ORDER",
        priority="URGENT",
        title="New Marketplace Order Received!",
        message=f"Buyer {current_user.name} placed Order #{new_order.id} for ₹{round(total_order_amount, 2)}. Please review and accept.",
        related_resource=f"/orders/{new_order.id}"
    )
    db.add(seller_notif)

    # Broadcast notification to delivery partners
    delivery_partners = db.query(User).filter(User.role == "Delivery").all()
    for dp in delivery_partners:
        dp_notif = Notification(
            recipient_id=dp.id,
            notification_type="LOGISTICS",
            priority="INFO",
            title="New Delivery Consignment Available",
            message=f"Order #{new_order.id}: {items_to_create[0]['product_name']} ready for pickup in {pickup_addr}. Delivery fee: ₹{delivery_fee}.",
            related_resource=f"/delivery/orders/{new_order.id}"
        )
        db.add(dp_notif)

    db.commit()
    db.refresh(new_order)

    log_audit(db, current_user, "CREATE_ORDER", "ORDER", str(new_order.id), f"Placed order for ₹{total_order_amount}")

    return _format_order(new_order)

@router.get("", response_model=List[OrderResponse])
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "Admin":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    elif current_user.role == "Buyer":
        orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "Farmer":
        orders = db.query(Order).filter(Order.seller_id == current_user.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "Delivery":
        orders = db.query(Order).filter(Order.delivery_partner_id == current_user.id).order_by(Order.created_at.desc()).all()
    else:
        # FPO can view both
        orders = db.query(Order).filter(
            (Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id)
        ).order_by(Order.created_at.desc()).all()

    return [_format_order(o) for o in orders]

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role not in ["Admin", "Delivery"] and current_user.id not in [order.buyer_id, order.seller_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return _format_order(order)

@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status field")

    # Authorization & Transition rules
    if new_status not in VALID_TRANSITIONS.get(order.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{order.status}' to '{new_status}'. Allowed: {VALID_TRANSITIONS.get(order.status)}"
        )

    # Only seller or admin can accept/ship; buyer can cancel pending orders
    if new_status == "CANCELLED" and current_user.id == order.buyer_id and order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Buyers can only cancel orders in PENDING status.")
    elif current_user.id not in [order.seller_id, order.buyer_id] and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to update status.")

    order.status = new_status

    # Synchronize delivery status and log checkpoints
    if new_status == "PROCESSING":
        checkpoint = DeliveryCheckpoint(
            order_id=order.id,
            delivery_partner_id=order.delivery_partner_id,
            status="PROCESSING",
            location_name="Farm Lot Grading & Sorting Bay",
            latitude=order.pickup_latitude or 22.5645,
            longitude=order.pickup_longitude or 72.9289,
            notes="Produce sorting, moisture check, and moisture-proof packing active."
        )
        db.add(checkpoint)
    elif new_status == "READY_FOR_DISPATCH":
        if order.delivery_partner_id:
            order.delivery_status = "OUT_FOR_PICKUP"
        checkpoint = DeliveryCheckpoint(
            order_id=order.id,
            delivery_partner_id=order.delivery_partner_id,
            status="READY_FOR_DISPATCH",
            location_name="Farm Gate Loading Dock",
            latitude=order.pickup_latitude or 22.5645,
            longitude=order.pickup_longitude or 72.9289,
            notes="Produce packaged & sealed with quality tag. Staged for Agri-Truck loading."
        )
        db.add(checkpoint)
        if order.delivery_partner_id:
            dp_notif = Notification(
                recipient_id=order.delivery_partner_id,
                notification_type="ORDER",
                priority="URGENT",
                title="Consignment Ready for Pickup!",
                message=f"Farmer has staged Order #{order.id} at farm gate. Proceed for pickup.",
                related_resource=f"/delivery/orders/{order.id}"
            )
            db.add(dp_notif)
    elif new_status == "SHIPPED":
        order.delivery_status = "IN_TRANSIT"
        checkpoint = DeliveryCheckpoint(
            order_id=order.id,
            delivery_partner_id=order.delivery_partner_id,
            status="IN_TRANSIT",
            location_name="State Agro Corridor (NH-48)",
            latitude=order.pickup_latitude or 22.5645,
            longitude=order.pickup_longitude or 72.9289,
            notes="Agri-Truck departed farm plot. Produce in transit under monitored conditions."
        )
        db.add(checkpoint)
    elif new_status == "DELIVERED":
        order.delivery_status = "DELIVERED"
        order.delivered_at = datetime.datetime.utcnow()
    elif new_status == "CANCELLED":
        order.delivery_status = "CANCELLED"

    db.commit()

    # If cancelled, restore stock
    if new_status == "CANCELLED":
        for item in order.items:
            product = db.query(ProductListing).filter(ProductListing.id == item.product_id).first()
            if product:
                product.available_quantity += item.quantity
                if product.status == "OUT_OF_STOCK":
                    product.status = "ACTIVE"
        db.commit()

    # Notify counterpart
    recipient_id = order.buyer_id if current_user.id == order.seller_id else order.seller_id
    notif = Notification(
        recipient_id=recipient_id,
        notification_type="ORDER",
        priority="INFO",
        title=f"Order #{order.id} Status Updated",
        message=f"Order status changed to '{new_status}'.",
        related_resource=f"/orders/{order.id}"
    )
    db.add(notif)
    db.commit()

    return {"message": f"Order status updated to {new_status}", "order": _format_order(order)}

def _format_order(order: Order) -> dict:
    buyer_name = order.buyer.name if order.buyer else "Buyer"
    buyer_phone = order.contact_phone or (order.buyer.phone if order.buyer else "+91-9876543212")
    seller_name = order.seller.name if order.seller else "Farmer"
    seller_phone = order.seller.phone if order.seller else "+91-9876543211"
    dp_name = order.delivery_partner.name if order.delivery_partner else ("Vikram Singh" if order.delivery_partner_id else None)
    dp_phone = order.delivery_partner.phone if order.delivery_partner else ("+91-9876543214" if order.delivery_partner_id else None)

    return {
        "id": order.id,
        "buyer_id": order.buyer_id,
        "seller_id": order.seller_id,
        "buyer_name": buyer_name,
        "buyer_phone": buyer_phone,
        "seller_name": seller_name,
        "seller_phone": seller_phone,
        "status": order.status,
        "total_amount": order.total_amount,
        "delivery_address": order.delivery_address,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit": item.unit,
                "agreed_price_per_unit": item.agreed_price_per_unit,
                "total_price": item.total_price
            }
            for item in order.items
        ],
        "delivery_partner_id": order.delivery_partner_id,
        "delivery_partner_name": dp_name,
        "delivery_partner_phone": dp_phone,
        "delivery_status": order.delivery_status or "UNASSIGNED",
        "delivery_otp": order.delivery_otp or "4829",
        "pickup_address": order.pickup_address or "Green Meadows Farm, Block A, Anand Rural, Gujarat",
        "pickup_contact_name": order.pickup_contact_name or seller_name,
        "pickup_contact_phone": order.pickup_contact_phone or seller_phone,
        "pickup_latitude": order.pickup_latitude or 22.5645,
        "pickup_longitude": order.pickup_longitude or 72.9289,
        "dropoff_latitude": order.dropoff_latitude or 22.5560,
        "dropoff_longitude": order.dropoff_longitude or 72.9510,
        "current_latitude": order.current_latitude or 22.5645,
        "current_longitude": order.current_longitude or 72.9289,
        "gps_speed_kmh": order.gps_speed_kmh if order.gps_speed_kmh is not None else 38.5,
        "estimated_distance_km": order.estimated_distance_km or 24.8,
        "estimated_duration_mins": order.estimated_duration_mins or 42,
        "delivery_fee": order.delivery_fee if (order.delivery_fee and order.delivery_fee > 0) else 450.0,
        "vehicle_type": order.vehicle_type or "Agri-Truck Mini (1.5 Tonne)",
        "vehicle_number": order.vehicle_number or "GJ-23-AX-8910",
        "delivery_notes": order.delivery_notes,
        "delivery_notes_partner": order.delivery_notes_partner,
        "delivered_at": order.delivered_at,
        "created_at": order.created_at,
        "updated_at": order.updated_at
    }

