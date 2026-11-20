import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, Clock, Truck, CheckCheck, 
  XCircle, RefreshCw, AlertCircle, MapPin, Key, ShieldCheck,
  Phone, Navigation, Eye, Compass, Gauge, Snowflake, Radio, ExternalLink,
  ChevronRight, X, AlertTriangle, Shield
} from 'lucide-react';
import { api } from '../api';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'ACCEPTED', label: 'Farmer Accepted' },
  { key: 'PROCESSING', label: 'Packing & Grading' },
  { key: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch' },
  { key: 'SHIPPED', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export default function BuyerOrdersView({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'

  // Live Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(null);

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

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this pending order?')) return;
    try {
      await api.updateOrderStatus(orderId, 'CANCELLED');
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const openLiveTracking = async (order) => {
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
      console.warn('Failed to load tracking telemetry:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedOtp(id);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const getStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    const idx = ORDER_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getDeliveryStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-emerald"><CheckCircle size={12} /> Delivered & Verified</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-sky"><Truck size={12} /> Out for Final Delivery</span>;
      case 'IN_TRANSIT':
        return <span className="badge badge-sky"><Navigation size={12} /> In Transit (Live GPS)</span>;
      case 'PICKED_UP':
        return <span className="badge badge-emerald"><CheckCheck size={12} /> Picked Up from Farm</span>;
      case 'OUT_FOR_PICKUP':
        return <span className="badge badge-amber"><Clock size={12} /> En Route to Farm Gate</span>;
      case 'ASSIGNED':
        return <span className="badge badge-amber"><Truck size={12} /> Agri-Truck Assigned</span>;
      case 'CANCELLED':
        return <span className="badge badge-rose"><XCircle size={12} /> Logistics Cancelled</span>;
      default:
        return <span className="badge badge-amber"><Radio size={12} /> Matching Freight Partner</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ACTIVE') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (filter === 'DELIVERED') return o.status === 'DELIVERED';
    if (filter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title & Stats Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sky">Buyer Tracking Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mapped Agri-Logistics Telemetry</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            My Purchase Orders & Live Dispatch Tracking
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live GPS telemetry, assigned delivery partners, verification PINs, and farm-to-warehouse checkpoints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={loadOrders} title="Refresh Live Orders">
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => onNavigate('marketplace')}>
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
        {[
          { key: 'ALL', label: `All Orders (${orders.length})` },
          { key: 'ACTIVE', label: `Active & In-Transit (${orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length})` },
          { key: 'DELIVERED', label: `Delivered (${orders.filter(o => o.status === 'DELIVERED').length})` },
          { key: 'CANCELLED', label: `Cancelled (${orders.filter(o => o.status === 'CANCELLED').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: filter === tab.key ? 700 : 500,
              background: filter === tab.key ? '#163326' : 'transparent',
              color: filter === tab.key ? '#ffffff' : 'var(--text-secondary)',
              border: filter === tab.key ? 'none' : '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--forest-800)" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Package size={40} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>
            No Orders Found in this View
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Visit the marketplace to discover fresh wheat, tomatoes, pulses, and contract directly with farmers.
          </p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => onNavigate('marketplace')}>
            Browse Produce Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {filteredOrders.map(o => {
            const currentStepIdx = getStepIndex(o.status);
            const isCancelled = o.status === 'CANCELLED';
            const isDelivered = o.status === 'DELIVERED';
            const hasDriver = !!o.delivery_partner_id;

            return (
              <div 
                key={o.id} 
                className="glass-card" 
                style={{ 
                  padding: '28px',
                  border: isDelivered ? '1px solid rgba(22, 101, 52, 0.2)' : '1px solid var(--border-color)',
                  background: '#ffffff',
                  boxShadow: '0 4px 20px rgba(22, 51, 38, 0.04)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>
                        Order #{o.id}
                      </span>
                      <span className={`badge ${
                        isCancelled ? 'badge-rose' : 
                        isDelivered ? 'badge-emerald' : 
                        o.status === 'SHIPPED' ? 'badge-sky' : 'badge-amber'
                      }`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {getDeliveryStatusBadge(o.delivery_status)}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Seller: <strong style={{ color: 'var(--text-primary)' }}>{o.seller_name}</strong> • Placed on {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CONTRACT VALUE</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-800)', fontFamily: "'Fraunces', serif" }}>
                      ₹{o.total_amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                {!isCancelled ? (
                  <div style={{ margin: '24px 0 20px', padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isDone 
                                ? '#163326' 
                                : 'var(--bg-secondary)',
                              border: isDone ? 'none' : '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isDone ? '#ffffff' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              zIndex: 2,
                              boxShadow: isCurrent ? '0 0 10px rgba(22, 51, 38, 0.4)' : 'none'
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{
                              fontSize: '0.74rem',
                              marginTop: '8px',
                              color: isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                              fontWeight: isCurrent ? 700 : 500,
                              textAlign: 'center'
                            }}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ margin: '18px 0', padding: '12px 16px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--rose-500)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--rose-400)', fontWeight: 600 }}>This purchase order has been cancelled and stock released.</span>
                  </div>
                )}

                {/* Logistics Integration & Driver Section */}
                {!isCancelled && (
                  <div style={{
                    margin: '18px 0',
                    padding: '16px 18px',
                    borderRadius: '14px',
                    background: '#f7faf8',
                    border: '1px solid rgba(22, 51, 38, 0.12)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    {/* Driver details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: hasDriver ? '#163326' : '#e2e8e4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: hasDriver ? '#dcfce7' : '#657a6e',
                        flexShrink: 0
                      }}>
                        <Truck size={24} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4d6356', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Agri-Fleet Logistics Partner
                          </span>
                          {hasDriver && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} title="Active GPS Linked" />
                          )}
                        </div>

                        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {hasDriver ? (o.delivery_partner_name || 'Vikram Singh') : 'Matching Regional Agri-Truck...'}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span>{o.vehicle_type || 'Agri-Truck Mini (1.5 Tonne)'} • {o.vehicle_number || 'GJ-23-AX-8910'}</span>
                          {hasDriver && o.delivery_partner_phone && (
                            <a 
                              href={`tel:${o.delivery_partner_phone}`} 
                              style={{ color: '#163326', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Phone size={11} /> {o.delivery_partner_phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery PIN (OTP) Security Box */}
                    {!isDelivered && (
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid rgba(22, 51, 38, 0.16)',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#556c5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Delivery Verification PIN
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#163326', fontFamily: 'monospace' }}>
                              {o.delivery_otp || '4829'}
                            </span>
                            <button
                              onClick={() => copyToClipboard(o.delivery_otp || '4829', o.id)}
                              style={{
                                background: copiedOtp === o.id ? '#163326' : '#f0f4f1',
                                color: copiedOtp === o.id ? '#fff' : '#163326',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {copiedOtp === o.id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#667d70', maxWidth: '140px', lineHeight: 1.2 }}>
                          Give this code to the driver upon produce inspection.
                        </span>
                      </div>
                    )}

                    {/* Live Tracking CTA */}
                    <div>
                      <button
                        className="btn-primary"
                        onClick={() => openLiveTracking(o)}
                        style={{
                          background: '#163326',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(22, 51, 38, 0.16)'
                        }}
                      >
                        <Compass size={16} />
                        <span>Track Live Consignment & GPS</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Items and Address Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PURCHASED COMMODITIES:</span>
                    {o.items && o.items.map((itm, i) => (
                      <div key={i} style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {itm.product_name} • {itm.quantity} {itm.unit} @ ₹{itm.agreed_price_per_unit}/{itm.unit}
                      </div>
                    ))}
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#15803d" /> Delivery Destination: <strong>{o.delivery_address}</strong>
                    </p>
                    {o.pickup_address && (
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🌾 Farm Gate Origin: {o.pickup_address}</span>
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {o.status === 'PENDING' && (
                      <button 
                        className="btn-secondary" 
                        style={{ color: 'var(--rose-400)' }}
                        onClick={() => handleCancelOrder(o.id)}
                      >
                        Cancel Order
                      </button>
                    )}

                    {isDelivered && (
                      <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCheck size={16} /> Verified Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Consignment Telemetry Modal */}
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
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-emerald">Live Telemetry Link Active</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>NavIC / IRNSS Satellite Ground Fix</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'Fraunces', serif" }}>
                  Order #{trackingOrder.id} • Live Logistics & Dispatch Tracker
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Transit Corridor: {trackingOrder.pickup_address || 'Farm Gate'} ➔ {trackingOrder.delivery_address}
                </p>
              </div>

              <button 
                onClick={() => setTrackingOrder(null)}
                style={{ background: '#f4f6f4', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#45594e" />
              </button>
            </div>

            {trackingLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
                <RefreshCw className="animate-spin" size={32} color="#163326" />
              </div>
            ) : (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Live Telemetry KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8faf9', border: '1px solid rgba(22, 51, 38, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#688273', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Gauge size={14} /> LIVE GPS SPEED
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#163326', marginTop: '4px' }}>
                      {routeData?.current_position?.speed_kmh || trackingOrder.gps_speed_kmh || 38.5} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>km/h</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>Cruise Optimal</span>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8faf9', border: '1px solid rgba(22, 51, 38, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#688273', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Navigation size={14} /> REMAINING DISTANCE
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#163326', marginTop: '4px' }}>
                      {routeData?.remaining_distance_km || Math.round((trackingOrder.estimated_distance_km || 24.8) * 0.45)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>km</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#688273' }}>Total: {trackingOrder.estimated_distance_km || 24.8} km</span>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8faf9', border: '1px solid rgba(22, 51, 38, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#688273', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Clock size={14} /> ESTIMATED ARRIVAL
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#163326', marginTop: '4px' }}>
                      {routeData?.remaining_duration_mins || 19} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mins</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>On-Time Schedule</span>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8faf9', border: '1px solid rgba(22, 51, 38, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#688273', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Snowflake size={14} /> COLD-CHAIN TEMP
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                      18.2°C
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>Moisture Protected</span>
                  </div>
                </div>

                {/* Delivery Verification PIN Box */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                      <Key size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                        Your 4-Digit Delivery Verification PIN
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#163326', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
                        {trackingOrder.delivery_otp || '4829'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#166534', maxWidth: '300px', lineHeight: 1.3 }}>
                    The delivery driver ({trackingOrder.delivery_partner_name || 'Vikram Singh'}) will request this code upon arrival to confirm produce handover and unlock settlement.
                  </div>
                </div>

                {/* Simulated Waypoints & Checkpoints */}
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#163326', marginBottom: '12px' }}>
                    Multi-Stage Agricultural Route Waypoints
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(routeData?.waypoints || [
                      { step: 1, name: 'Farm Gate Dispatch', location: trackingOrder.pickup_address, action: 'Produce loading & quality weighment verification completed', traffic: 'LOW' },
                      { step: 2, name: 'Anand Bypass (SH-188)', location: 'Mogra Agro Cross-Junction', action: 'Maintaining 45 km/h for perishable produce load stability', traffic: 'CLEAR' },
                      { step: 3, name: 'National Express Agro Corridor', location: 'NH-48 Tollway Link', action: 'Fast-tag active • Temperature monitoring stable at 18°C', traffic: 'CLEAR' },
                      { step: 4, name: 'Destination Mandi / Warehouse', location: trackingOrder.delivery_address, action: 'Unload at Bay #4 and obtain Buyer OTP verification', traffic: 'MODERATE' },
                    ]).map((wp, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: idx === 1 ? '#f0fdf4' : '#fafafa',
                        border: idx === 1 ? '1px solid #86efac' : '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#15803d' : idx === 1 ? '#163326' : '#cbd5e1',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {wp.step || idx + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.86rem', color: '#163326' }}>{wp.name}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>{wp.traffic || 'CLEAR'} TRAFFIC</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#687e72', marginTop: '2px' }}>{wp.location}</div>
                          <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>{wp.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Checkpoint logs from database */}
                {checkpoints.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#163326', marginBottom: '8px' }}>
                      Verified Checkpoint Telemetry Log
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {checkpoints.map(c => (
                        <div key={c.id} style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                          <span><strong>{c.status}</strong> — {c.location_name}: {c.notes}</span>
                          <span style={{ color: '#94a3b8' }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
