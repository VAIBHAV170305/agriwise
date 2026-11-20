import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, Clock, Truck, CheckCheck, 
  XCircle, RefreshCw, AlertCircle, Phone, MapPin,
  Navigation, Compass, Gauge, Snowflake, X, Radio, ShieldCheck
} from 'lucide-react';
import { api } from '../api';

export default function FarmerOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracking modal state for Farmer
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const openLogisticsTelemetry = async (order) => {
    setTrackingOrder(order);
    setTrackingLoading(true);
    try {
      const [route, chks] = await Promise.all([
        api.getDeliveryRouteOptimization(order.id).catch(() => null),
        api.getDeliveryCheckpoints(order.id).catch(() => [])
      ]);
      setRouteData(route);
      setCheckpoints(chks || []);
    } catch (err) {
      console.warn('Failed to load tracking data:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Orders & Dispatch</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            Orders Received
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Manage wholesale orders and coordinate delivery dispatches.
          </p>
        </div>

        <button className="btn-secondary" onClick={loadOrders}>
          <RefreshCw size={16} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--forest-800)" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Package size={40} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>No Orders Received Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            When wholesale buyers order your listed commodities, they will appear here with full delivery coordination.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(o => {
            const isPending = o.status === 'PENDING';
            const isAccepted = o.status === 'ACCEPTED';
            const isProcessing = o.status === 'PROCESSING';
            const isReady = o.status === 'READY_FOR_DISPATCH';
            const isShipped = o.status === 'SHIPPED';
            const isDelivered = o.status === 'DELIVERED';
            const hasDriver = !!o.delivery_partner_id;

            return (
              <div key={o.id} className="glass-card" style={{ padding: '26px', background: '#ffffff' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>
                        Order #{o.id}
                      </span>
                      <span className={`badge ${
                        isPending ? 'badge-amber' : 
                        isAccepted || isProcessing ? 'badge-sky' : 
                        isShipped || isReady ? 'badge-emerald' : 
                        isDelivered ? 'badge-emerald' : 'badge-rose'
                      }`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {o.delivery_status && (
                        <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>
                          Logistics: {o.delivery_status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Buyer: <strong style={{ color: 'var(--text-primary)' }}>{o.buyer_name}</strong> • Placed on {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>PAYOUT VALUE</span>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--forest-800)', fontFamily: "'Fraunces', serif" }}>
                      ₹{o.total_amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ marginTop: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
                  {o.items && o.items.map((itm, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {itm.product_name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>× {itm.quantity} {itm.unit}</span>
                      </span>
                      <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
                        ₹{itm.total_price.toLocaleString()} (@ ₹{itm.agreed_price_per_unit}/{itm.unit})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Logistics & Assigned Delivery Partner Strip */}
                <div style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#f6faf7',
                  border: '1px solid rgba(22, 51, 38, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: hasDriver ? '#163326' : '#e2e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasDriver ? '#fff' : '#64748b' }}>
                      <Truck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#163326' }}>
                        {hasDriver ? `Agri-Truck: ${o.delivery_partner_name || 'Vikram Singh'}` : 'Delivery Pool: Unassigned (Broadcasted)'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#667d70' }}>
                        {hasDriver ? `${o.vehicle_type || 'Agri-Truck Mini'} • ${o.vehicle_number || 'GJ-23-AX-8910'} • Phone: ${o.delivery_partner_phone || '+91-9876543214'}` : 'Available for pickup claiming by regional transport partners.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => openLogisticsTelemetry(o)}
                      style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Compass size={14} /> View Route & Telemetry
                    </button>
                  </div>
                </div>

                {/* Delivery Address & Status Action Buttons */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} color="#15803d" />
                    <span>Destination APMC/Warehouse: <strong>{o.delivery_address}</strong></span>
                  </div>

                  {/* Lifecycle Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isPending && (
                      <>
                        <button className="btn-primary" onClick={() => handleUpdateStatus(o.id, 'ACCEPTED')}>
                          <CheckCircle size={15} /> Accept Order
                        </button>
                        <button className="btn-secondary" style={{ color: 'var(--rose-400)' }} onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}>
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button className="btn-primary" onClick={() => handleUpdateStatus(o.id, 'PROCESSING')}>
                        <Clock size={15} /> Start Packing & Grading
                      </button>
                    )}

                    {isProcessing && (
                      <button className="btn-primary" onClick={() => handleUpdateStatus(o.id, 'READY_FOR_DISPATCH')}>
                        <Package size={15} /> Ready for Dispatch (Stage at Farm Gate)
                      </button>
                    )}

                    {isReady && (
                      <button className="btn-primary" onClick={() => handleUpdateStatus(o.id, 'SHIPPED')}>
                        <Truck size={15} /> Confirm Handover & Dispatch
                      </button>
                    )}

                    {isShipped && (
                      <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={15} /> Consignment In Transit to Buyer
                      </span>
                    )}

                    {isDelivered && (
                      <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCheck size={16} /> Delivered & Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Route & Telemetry Modal for Farmer */}
      {trackingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(22, 51, 38, 0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setTrackingOrder(null);
        }}>
          <div className="glass-card animate-fade-in" style={{
            maxWidth: '740px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-emerald">Agri-Logistics Corridor</span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'Fraunces', serif" }}>
                  Order #{trackingOrder.id} Route & Dispatch Telemetry
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Pickup: {trackingOrder.pickup_address} ➔ Dropoff: {trackingOrder.delivery_address}
                </p>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                style={{ background: '#f4f6f4', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#45594e" />
              </button>
            </div>

            {trackingLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <RefreshCw className="animate-spin" size={28} color="#163326" />
              </div>
            ) : (
              <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', background: '#f8faf9', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SPEED</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#163326' }}>
                      {routeData?.current_position?.speed_kmh || trackingOrder.gps_speed_kmh || 38.5} km/h
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8faf9', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DISTANCE TO BUYER</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#163326' }}>
                      {routeData?.remaining_distance_km || 11.2} km
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8faf9', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ESTIMATED TRAVEL</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#163326' }}>
                      {routeData?.remaining_duration_mins || 19} mins
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#163326', marginBottom: '8px' }}>
                    Dispatch Checkpoints Timeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {checkpoints.length > 0 ? (
                      checkpoints.map(c => (
                        <div key={c.id} style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>{c.status}</strong>: {c.location_name} — {c.notes}</span>
                          <span style={{ color: '#94a3b8' }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                        Initial status: Order staged in freight pool. Checkpoints log automatically as driver updates status.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
