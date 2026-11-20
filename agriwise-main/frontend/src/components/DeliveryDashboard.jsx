import React, { useState, useEffect } from 'react';
import { 
  Truck, Navigation, MapPin, CheckCircle2, Clock, Phone, AlertCircle, 
  ArrowRight, ShieldCheck, Key, FileText, Gauge, DollarSign, Compass, 
  RefreshCw, Send, Radio, User, Package, ChevronRight, Check, AlertTriangle,
  Zap, Fuel, Snowflake, Eye, Shield
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function DeliveryDashboard({ activeSubTab = 'delivery-ops', setActiveSubTab }) {
  const { t } = useLanguage();

  // Internal tab state: 'assigned' | 'available' | 'gps' | 'history'
  const [currentView, setCurrentView] = useState('assigned');
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Status update modal / form
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLocationName, setStatusLocationName] = useState('');

  // Delivery confirmation (OTP + POD)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [podSignature, setPodSignature] = useState('');

  // Live GPS simulation
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(48.5);

  // Sync with sidebar active tab
  useEffect(() => {
    if (activeSubTab === 'delivery-gps') {
      setCurrentView('gps');
    } else if (activeSubTab === 'delivery-history') {
      setCurrentView('history');
    } else {
      setCurrentView('assigned');
    }
  }, [activeSubTab]);

  useEffect(() => {
    loadAllDeliveryData();
  }, []);

  const loadAllDeliveryData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [assigned, available, history, telem] = await Promise.all([
        api.getAssignedDeliveries().catch(() => []),
        api.getAvailableDeliveries().catch(() => []),
        api.getDeliveryHistory().catch(() => []),
        api.getDeliveryTelemetry().catch(() => null)
      ]);

      setAssignedOrders(assigned || []);
      setAvailableOrders(available || []);
      setHistoryOrders(history || []);
      setTelemetry(telem);

      // Default selected order: First active assigned order
      if (assigned && assigned.length > 0) {
        setSelectedOrder(assigned[0]);
        loadRouteForOrder(assigned[0].id);
      } else if (history && history.length > 0) {
        setSelectedOrder(history[0]);
      }
    } catch (err) {
      console.error('Error loading delivery dashboard:', err);
      setErrorMessage(err.message || 'Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  };

  const loadRouteForOrder = async (orderId) => {
    try {
      const r = await api.getDeliveryRouteOptimization(orderId);
      setRouteData(r);
    } catch (err) {
      console.warn('Failed to fetch route data:', err);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    loadRouteForOrder(order.id);
  };

  const handleClaimOrder = async (orderId) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const updated = await api.claimDeliveryOrder(orderId);
      setSuccessMessage(`Order #${orderId} claimed successfully! Added to your active delivery manifest.`);
      await loadAllDeliveryData();
      setSelectedOrder(updated);
      setCurrentView('assigned');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to claim order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    const nextStatus = getNextLogicalStatus(order.delivery_status);
    setSelectedStatus(nextStatus);
    setStatusLocationName(getDefaultLocationNameForStatus(nextStatus, order));
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const getNextLogicalStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'UNASSIGNED': return 'ASSIGNED';
      case 'ASSIGNED': return 'OUT_FOR_PICKUP';
      case 'OUT_FOR_PICKUP': return 'PICKED_UP';
      case 'PICKED_UP': return 'IN_TRANSIT';
      case 'IN_TRANSIT': return 'OUT_FOR_DELIVERY';
      case 'OUT_FOR_DELIVERY': return 'DELIVERED';
      default: return 'IN_TRANSIT';
    }
  };

  const getDefaultLocationNameForStatus = (status, order) => {
    switch (status) {
      case 'OUT_FOR_PICKUP': return 'En Route to Farm Gate (Approaching Anand Sector)';
      case 'PICKED_UP': return order?.pickup_address || 'Farm Gate Produce Inspection Post';
      case 'IN_TRANSIT': return 'State Agro Highway SH-188 / NH-48 Expressway Corridor';
      case 'OUT_FOR_DELIVERY': return 'Final Mile Approach to Mandi Terminal Dock';
      case 'DELIVERED': return order?.delivery_address || 'Buyer Warehouse Receiving Dock';
      default: return 'Transit Waypoint';
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const updated = await api.updateDeliveryStatus(selectedOrder.id, {
        status: selectedStatus,
        notes: statusNotes,
        location_name: statusLocationName
      });
      setSuccessMessage(`Delivery status updated to "${selectedStatus}" for Order #${selectedOrder.id}`);
      setShowStatusModal(false);
      await loadAllDeliveryData();
      setSelectedOrder(updated);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenConfirmModal = (order) => {
    setSelectedOrder(order);
    setOtpCode(order.delivery_otp || '4829'); // Pre-fill with demo order OTP for frictionless testing
    setPodNotes('All produce bags inspected in prime condition. Zero leakage or cargo shift.');
    setPodSignature(`Verified by Buyer ${order.buyer_name || 'Representative'} via Verified OTP`);
    setShowConfirmModal(true);
  };

  const handleConfirmDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const updated = await api.confirmDeliveryOtp(selectedOrder.id, {
        otp: otpCode,
        pod_notes: podNotes,
        pod_signature: podSignature
      });
      setSuccessMessage(`Order #${selectedOrder.id} successfully DELIVERED! Payment of ₹${updated.delivery_fee} unlocked.`);
      setShowConfirmModal(false);
      await loadAllDeliveryData();
      setSelectedOrder(updated);
      setCurrentView('history');
      if (setActiveSubTab) setActiveSubTab('delivery-history');
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Live GPS Step simulator
  const handleSimulateGpsPulse = async () => {
    if (!selectedOrder) return;
    setIsSimulatingGps(true);
    try {
      const deltaLat = (Math.random() - 0.4) * 0.005;
      const deltaLng = (Math.random() - 0.4) * 0.005;
      const newLat = (selectedOrder.current_latitude || 22.8210) + deltaLat;
      const newLng = (selectedOrder.current_longitude || 72.7845) + deltaLng;
      const newSpeed = Math.floor(40 + Math.random() * 18);
      setSimulatedSpeed(newSpeed);

      await api.updateDeliveryGps(selectedOrder.id, {
        latitude: newLat,
        longitude: newLng,
        gps_speed_kmh: newSpeed
      });

      setSelectedOrder(prev => ({
        ...prev,
        current_latitude: newLat,
        current_longitude: newLng,
        gps_speed_kmh: newSpeed
      }));

      loadRouteForOrder(selectedOrder.id);
      setSuccessMessage(`Live GPS Telemetry broadcasted: ${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E @ ${newSpeed} km/h`);
    } catch (err) {
      console.warn('GPS update simulation error:', err);
    } finally {
      setIsSimulatingGps(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'UNASSIGNED': { bg: '#f1f5f9', color: '#475569', label: 'Unassigned Pool' },
      'ASSIGNED': { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned to Driver' },
      'OUT_FOR_PICKUP': { bg: '#fef3c7', color: '#b45309', label: 'En Route to Farm' },
      'PICKED_UP': { bg: '#dbeafe', color: '#1d4ed8', label: 'Produce Loaded' },
      'IN_TRANSIT': { bg: '#ede9fe', color: '#6d28d9', label: 'In Transit (Live GPS)' },
      'OUT_FOR_DELIVERY': { bg: '#ffedd5', color: '#c2410c', label: 'Out for Final Mile' },
      'DELIVERED': { bg: '#dcfce7', color: '#15803d', label: 'Delivered & Confirmed' },
      'CANCELLED': { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' }
    };
    const s = map[status] || { bg: '#f1f5f9', color: '#334155', label: status };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.74rem',
        fontWeight: 700
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }} />
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner: Fleet Telemetry & Driver Profile */}
      <div style={{
        background: 'linear-gradient(135deg, #12281e 0%, #1b382b 60%, #244b3a 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: '#ffffff',
        boxShadow: '0 8px 30px rgba(18, 40, 30, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background watermarks */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          <Truck size={240} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                background: 'rgba(213, 230, 219, 0.2)',
                color: '#d5e6db',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Radio size={12} className="animate-pulse" />
                NavIC / IRNSS Satellite Telemetry Active
              </span>
              <span style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                Driver Online
              </span>
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.025em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}>
              {telemetry?.partner_name || 'Vikram Singh'} • Logistics Field Command
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#c3d9cc', maxWidth: '640px', lineHeight: 1.45 }}>
              Active Agri-Fleet Partner • Dedicated Cold-Chain & Perishable Agro-Freight Dispatch
            </p>
          </div>

          {/* Vehicle card tag */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#2d6a4f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#a3c2b1', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Vehicle Telemetry
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                {telemetry?.vehicle_info?.reg_number || 'GJ-23-AX-8910'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d5e6db', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{telemetry?.vehicle_info?.model || 'Tata Ace Agri-Gold'}</span>
                <span>•</span>
                <span style={{ color: '#86efac' }}>Reefer 16.4°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Logistics Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginTop: '22px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.18)', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#a3c2b1', fontWeight: 600 }}>Active Shipments</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
              {assignedOrders.length} Trips
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac' }}>
              {availableOrders.length} open for claim
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.18)', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#a3c2b1', fontWeight: 600 }}>Today's Freight Payout</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fef08a', margin: '2px 0' }}>
              ₹{telemetry?.today_earnings ? telemetry.today_earnings.toLocaleString() : '1,420'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d5e6db' }}>
              Total: ₹{telemetry?.total_earnings ? telemetry.total_earnings.toLocaleString() : '18,450'}
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.18)', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#a3c2b1', fontWeight: 600 }}>Distance Covered</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
              {selectedOrder?.estimated_distance_km || 76.8} km
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac' }}>
              Eco-Score: 94% Green
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.18)', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#a3c2b1', fontWeight: 600 }}>On-Time Success Rate</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
              98.6%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fef08a' }}>
              ★ 4.92 / 5.0 (58 Ratings)
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts banner */}
      {successMessage && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage('')} 
            style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage('')} 
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Sub-navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(27, 56, 43, 0.1)',
        paddingBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setCurrentView('assigned');
              if (setActiveSubTab) setActiveSubTab('delivery-ops');
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              background: currentView === 'assigned' ? '#163326' : '#eef3ef',
              color: currentView === 'assigned' ? '#ffffff' : '#33483c',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s ease'
            }}
          >
            <Truck size={16} />
            Assigned Orders ({assignedOrders.length})
          </button>

          <button
            onClick={() => {
              setCurrentView('available');
              if (setActiveSubTab) setActiveSubTab('delivery-ops');
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              background: currentView === 'available' ? '#163326' : '#eef3ef',
              color: currentView === 'available' ? '#ffffff' : '#33483c',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s ease'
            }}
          >
            <Package size={16} />
            Available for Claim ({availableOrders.length})
          </button>

          <button
            onClick={() => {
              setCurrentView('gps');
              if (setActiveSubTab) setActiveSubTab('delivery-gps');
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              background: currentView === 'gps' ? '#163326' : '#eef3ef',
              color: currentView === 'gps' ? '#ffffff' : '#33483c',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s ease'
            }}
          >
            <Navigation size={16} />
            Live GPS & Route Optimization
          </button>

          <button
            onClick={() => {
              setCurrentView('history');
              if (setActiveSubTab) setActiveSubTab('delivery-history');
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              background: currentView === 'history' ? '#163326' : '#eef3ef',
              color: currentView === 'history' ? '#ffffff' : '#33483c',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s ease'
            }}
          >
            <CheckCircle2 size={16} />
            Delivery History ({historyOrders.length})
          </button>
        </div>

        <button
          onClick={loadAllDeliveryData}
          disabled={loading}
          style={{
            background: '#ffffff',
            border: '1px solid rgba(27, 56, 43, 0.14)',
            borderRadius: '9px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            color: '#1b382b',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Telemetry
        </button>
      </div>

      {/* VIEW 1: ASSIGNED ORDERS & STATUS STEPS */}
      {currentView === 'assigned' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px' }}>
          {/* Left Column: List of assigned orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326', margin: 0 }}>
              Active Delivery Assignments ({assignedOrders.length})
            </h3>

            {assignedOrders.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px dashed rgba(27, 56, 43, 0.2)',
                borderRadius: '16px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#607469'
              }}>
                <Truck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ margin: '0 0 12px', fontWeight: 600 }}>No active shipments assigned currently.</p>
                <button
                  onClick={() => setCurrentView('available')}
                  className="btn-primary"
                  style={{ fontSize: '0.82rem', padding: '8px 16px', margin: '0 auto' }}
                >
                  Explore Available Consignments
                </button>
              </div>
            ) : (
              assignedOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    style={{
                      background: '#ffffff',
                      border: isSelected ? '2px solid #2d6a4f' : '1px solid rgba(27, 56, 43, 0.1)',
                      borderRadius: '16px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected ? '0 8px 24px rgba(45, 106, 79, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#163326' }}>
                        ORDER #{order.id}
                      </span>
                      {getStatusBadge(order.delivery_status)}
                    </div>

                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                      {order.items?.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ') || 'Agricultural Produce'}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#576f62', display: 'flex', flexDirection: 'column', gap: '4px', margin: '10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2d6a4f', flexShrink: 0 }} />
                        <strong style={{ color: '#163326' }}>Pick:</strong> {order.pickup_address}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b45309', flexShrink: 0 }} />
                        <strong style={{ color: '#163326' }}>Drop:</strong> {order.delivery_address}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(27, 56, 43, 0.08)',
                      fontSize: '0.78rem'
                    }}>
                      <span style={{ color: '#576f62' }}>
                        Est: <strong>{order.estimated_distance_km} km</strong> • {order.estimated_duration_mins} mins
                      </span>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1b382b' }}>
                        Payout: ₹{order.delivery_fee}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed selected order workbench */}
          {selectedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.1)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                        Shipment #{selectedOrder.id} Details
                      </h2>
                      {getStatusBadge(selectedOrder.delivery_status)}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#576f62' }}>
                      Carrier Vehicle: <strong>{selectedOrder.vehicle_number}</strong> ({selectedOrder.vehicle_type})
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenStatusModal(selectedOrder)}
                      style={{
                        background: '#163326',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
                      }}
                    >
                      <RefreshCw size={15} />
                      Update Status
                    </button>

                    <button
                      onClick={() => handleOpenConfirmModal(selectedOrder)}
                      style={{
                        background: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(21, 128, 61, 0.2)'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Confirm Delivery (OTP)
                    </button>
                  </div>
                </div>

                {/* Status Stepper Progression */}
                <div style={{
                  background: '#f8faf9',
                  border: '1px solid rgba(27, 56, 43, 0.08)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#6a8174', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                    Logistics Progression Stepper
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {[
                      { key: 'ASSIGNED', label: 'Assigned' },
                      { key: 'OUT_FOR_PICKUP', label: 'Out for Pickup' },
                      { key: 'PICKED_UP', label: 'Picked Up' },
                      { key: 'IN_TRANSIT', label: 'In Transit' },
                      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                      { key: 'DELIVERED', label: 'Delivered' }
                    ].map((step, idx, arr) => {
                      const statusHierarchy = ['ASSIGNED', 'OUT_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                      const currentIdx = statusHierarchy.indexOf(selectedOrder.delivery_status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = selectedOrder.delivery_status === step.key;

                      return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isCurrent ? '#2d6a4f' : isComplete ? '#dcfce7' : '#e2e8f0',
                            color: isCurrent ? '#ffffff' : isComplete ? '#15803d' : '#64748b',
                            border: isCurrent ? '2px solid #163326' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            zIndex: 2,
                            boxShadow: isCurrent ? '0 0 0 4px rgba(45, 106, 79, 0.2)' : 'none'
                          }}>
                            {isComplete ? <Check size={14} /> : idx + 1}
                          </div>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: isCurrent ? 800 : 600,
                            color: isCurrent ? '#163326' : isComplete ? '#2d6a4f' : '#64748b',
                            marginTop: '6px',
                            textAlign: 'center'
                          }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pickup & Dropoff 2-Column Split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Pickup Details */}
                  <div style={{
                    background: '#f4f8f5',
                    border: '1px solid rgba(45, 106, 79, 0.15)',
                    borderRadius: '14px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2d6a4f', fontWeight: 800, fontSize: '0.84rem' }}>
                      <MapPin size={16} />
                      PICKUP (FARM GATE)
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                      {selectedOrder.pickup_contact_name || selectedOrder.seller_name}
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#4a6054', lineHeight: 1.4 }}>
                      {selectedOrder.pickup_address}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`tel:${selectedOrder.pickup_contact_phone || selectedOrder.seller_phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ffffff',
                          border: '1px solid rgba(45, 106, 79, 0.2)',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          color: '#2d6a4f',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={13} />
                        Call Farmer ({selectedOrder.pickup_contact_phone || selectedOrder.seller_phone})
                      </a>
                    </div>
                  </div>

                  {/* Dropoff Details */}
                  <div style={{
                    background: '#fff9f0',
                    border: '1px solid rgba(180, 83, 9, 0.15)',
                    borderRadius: '14px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.84rem' }}>
                      <MapPin size={16} />
                      DROP-OFF (BUYER / WAREHOUSE)
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                      {selectedOrder.buyer_name}
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#68513b', lineHeight: 1.4 }}>
                      {selectedOrder.delivery_address}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`tel:${selectedOrder.buyer_phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ffffff',
                          border: '1px solid rgba(180, 83, 9, 0.25)',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          color: '#b45309',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={13} />
                        Call Buyer ({selectedOrder.buyer_phone})
                      </a>
                    </div>
                  </div>
                </div>

                {/* Produce & Handling Specifications */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(27, 56, 43, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '18px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#6a8174', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Produce Items & Quality Safeguard Notes
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#163326' }}>
                        <span>• <strong>{item.quantity} {item.unit}</strong> {item.product_name}</span>
                        <span style={{ fontWeight: 700 }}>Consignment Value: ₹{item.total_price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.delivery_notes && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: '#fbfaf6',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2d6a4f',
                      fontSize: '0.8rem',
                      color: '#465b50'
                    }}>
                      <strong>Handling Advisory:</strong> {selectedOrder.delivery_notes}
                    </div>
                  )}

                  {selectedOrder.delivery_notes_partner && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      background: '#f0fdf4',
                      borderRadius: '8px',
                      borderLeft: '4px solid #16a34a',
                      fontSize: '0.8rem',
                      color: '#15803d'
                    }}>
                      <strong>Partner Log:</strong> {selectedOrder.delivery_notes_partner}
                    </div>
                  )}
                </div>

                {/* Quick Live GPS Shortcut link */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f1f8f4',
                  borderRadius: '12px',
                  padding: '12px 18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Compass size={20} color="#2d6a4f" />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#163326' }}>
                        Live Route & GPS Telemetry
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#576f62' }}>
                        Position: {selectedOrder.current_latitude?.toFixed(4)}°N, {selectedOrder.current_longitude?.toFixed(4)}°E @ {selectedOrder.gps_speed_kmh} km/h
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('gps');
                      if (setActiveSubTab) setActiveSubTab('delivery-gps');
                    }}
                    style={{
                      background: '#2d6a4f',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    Open Live GPS Map <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 56, 43, 0.1)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              color: '#657d70'
            }}>
              Select an order from the left manifest to inspect delivery parameters and update transit status.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: AVAILABLE SHIPMENTS FOR CLAIM */}
      {currentView === 'available' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', margin: '0 0 4px' }}>
                Open Agricultural Freight Pool ({availableOrders.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#5e7568' }}>
                Unclaimed farm produce shipments ready for immediate pickup. Claim loads matching your vehicle capacity.
              </p>
            </div>
          </div>

          {availableOrders.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px dashed rgba(27, 56, 43, 0.2)',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#607469'
            }}>
              <CheckCircle2 size={42} color="#2d6a4f" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#163326', margin: '0 0 6px' }}>
                All Shipments Claimed!
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.84rem' }}>
                There are currently no unassigned consignments in your regional dispatch sector.
              </p>
              <button onClick={() => setCurrentView('assigned')} className="btn-primary" style={{ margin: '0 auto' }}>
                Back to My Active Trips
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {availableOrders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(27, 56, 43, 0.12)',
                    borderRadius: '18px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        background: '#eef6f1',
                        color: '#2d6a4f',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        READY FOR DISPATCH
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#163326' }}>
                        ₹{order.delivery_fee} Fee
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326', margin: '0 0 8px' }}>
                      Consignment #{order.id}: {order.items?.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ') || 'Produce'}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#4a5e52', margin: '14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={15} color="#2d6a4f" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: '#163326' }}>Farm Pickup:</strong> {order.pickup_address}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={15} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: '#163326' }}>Mandi Drop:</strong> {order.delivery_address}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: '#f8faf9',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      color: '#556c5e',
                      marginBottom: '16px'
                    }}>
                      <span>Distance: <strong>{order.estimated_distance_km} km</strong></span>
                      <span>•</span>
                      <span>Est: <strong>{order.estimated_duration_mins} mins</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      background: '#163326',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
                    }}
                  >
                    <Truck size={16} />
                    Claim This Delivery Run (₹{order.delivery_fee})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: LIVE GPS TRACKING & ROUTE OPTIMIZATION */}
      {currentView === 'gps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Top Control Bar for Selected Order */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(27, 56, 43, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#163326',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Compass size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#657e70', fontWeight: 700, textTransform: 'uppercase' }}>
                  Live Navigation Feed
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
                  {selectedOrder ? `Tracking Order #${selectedOrder.id}` : 'Select a Shipment'}
                </div>
              </div>
            </div>

            {/* Order Selector Dropdown if multiple assigned */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {assignedOrders.length > 1 && (
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const found = assignedOrders.find(o => o.id === parseInt(e.target.value));
                    if (found) handleSelectOrder(found);
                  }}
                  className="form-select"
                  style={{ fontSize: '0.82rem', padding: '7px 12px' }}
                >
                  {assignedOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id} ({o.delivery_status}) - {o.items?.[0]?.product_name || 'Produce'}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleSimulateGpsPulse}
                disabled={isSimulatingGps || !selectedOrder}
                style={{
                  background: '#2d6a4f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(45, 106, 79, 0.25)'
                }}
              >
                <Radio size={14} className={isSimulatingGps ? 'animate-spin' : ''} />
                Simulate Live GPS Ping
              </button>
            </div>
          </div>

          {/* Interactive Radar & Map Simulation */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1.2fr',
            gap: '24px',
            alignItems: 'stretch'
          }}>
            {/* Visual Route Corridor Radar */}
            <div style={{
              background: '#0f1f17',
              borderRadius: '20px',
              padding: '24px',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Top Map Overlay Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block'
                  }} className="animate-pulse" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#86efac', letterSpacing: '0.04em' }}>
                    LIVE SATELLITE CORRIDOR • NH-48 EXPRESSWAY
                  </span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Gauge size={13} color="#fef08a" />
                  <span>Speed: {selectedOrder?.gps_speed_kmh || simulatedSpeed} km/h</span>
                </div>
              </div>

              {/* Graphic Schematic Radar Corridor */}
              <div style={{
                position: 'relative',
                height: '280px',
                margin: '20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* SVG Visual Road Route line with glowing pulse */}
                <svg width="100%" height="100%" viewBox="0 0 540 240" style={{ position: 'absolute', inset: 0 }}>
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Road backdrop */}
                  <path
                    d="M 50 180 Q 180 80 270 120 T 490 60"
                    fill="none"
                    stroke="#1e3a2b"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Road Center line dashes */}
                  <path
                    d="M 50 180 Q 180 80 270 120 T 490 60"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="8 8"
                    opacity="0.4"
                  />
                  {/* Active Route Glow Path */}
                  <path
                    d="M 50 180 Q 180 80 270 120 T 490 60"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Origin Point: Farm Gate */}
                  <circle cx="50" cy="180" r="10" fill="#22c55e" />
                  <circle cx="50" cy="180" r="16" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />
                  <text x="50" y="215" fill="#86efac" fontSize="11" fontWeight="700" textAnchor="middle">
                    Anand Farm Gate
                  </text>

                  {/* Checkpoint 1: Toll */}
                  <circle cx="160" cy="115" r="5" fill="#eab308" />
                  <text x="160" y="100" fill="#fde047" fontSize="10" fontWeight="600" textAnchor="middle">
                    NE-1 Toll Plaza
                  </text>

                  {/* CURRENT VEHICLE POSITION (Animated Marker) */}
                  <circle cx="270" cy="120" r="14" fill="#38bdf8" />
                  <circle cx="270" cy="120" r="24" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="270" y="160" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle">
                    YOU: GJ-23-AX-8910
                  </text>

                  {/* Checkpoint 3: Ring Road */}
                  <circle cx="380" cy="85" r="5" fill="#cbd5e1" />
                  <text x="380" y="70" fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle">
                    SP Ring Rd South
                  </text>

                  {/* Destination Point: Mandi Terminal */}
                  <circle cx="490" cy="60" r="10" fill="#f97316" />
                  <circle cx="490" cy="60" r="16" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
                  <text x="490" y="95" fill="#fdba74" fontSize="11" fontWeight="700" textAnchor="middle">
                    APMC Naroda Mandi
                  </text>
                </svg>
              </div>

              {/* Bottom Telemetry HUD */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                zIndex: 2
              }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>COORDINATES</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedOrder?.current_latitude?.toFixed(4) || '22.8210'}° N, {selectedOrder?.current_longitude?.toFixed(4) || '72.7845'}° E
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>REMAINING DISTANCE</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                    {routeData?.remaining_distance_km || 34.5} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>ESTIMATED TIME (ETA)</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fef08a' }}>
                    {routeData?.remaining_duration_mins || 28} mins
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>COLD CHAIN CARGO</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#86efac' }}>
                    Optimal 16.4°C
                  </div>
                </div>
              </div>
            </div>

            {/* Route Optimization & Multi-Point Waypoints Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 56, 43, 0.1)',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                    Route Optimization Intelligence
                  </h4>
                  <span style={{
                    background: '#eef8f2',
                    color: '#2d6a4f',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    AI Dynamic Rerouting
                  </span>
                </div>

                {/* Efficiency metrics card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '18px'
                }}>
                  <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(27, 56, 43, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#5e7568', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Fuel size={13} color="#2d6a4f" />
                      Fuel Saved
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
                      {routeData?.estimated_fuel_saved_liters || 1.4} Liters
                    </div>
                  </div>

                  <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(27, 56, 43, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#5e7568', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={13} color="#b45309" />
                      Eco-Driving Score
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
                      {routeData?.fuel_efficiency_score || '94%'}
                    </div>
                  </div>
                </div>

                {/* Step by step waypoints */}
                <div style={{ fontSize: '0.74rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Multi-Point Waypoints & Traffic Flow
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(routeData?.waypoints || [
                    { step: 1, name: 'Farm Gate Anand', road_type: 'Rural Link Road', traffic: 'LOW', traffic_color: '#2d6a4f', eta_mins: 0 },
                    { step: 2, name: 'SH-188 Western Bypass', road_type: '4-Lane State Highway', traffic: 'MODERATE', traffic_color: '#b59b58', eta_mins: 11 },
                    { step: 3, name: 'NE-1 Express Tollway', road_type: 'Expressway', traffic: 'CLEAR', traffic_color: '#2d6a4f', eta_mins: 26 },
                    { step: 4, name: 'APMC Naroda Bay Dock', road_type: 'Commercial Terminal', traffic: 'MODERATE', traffic_color: '#b59b58', eta_mins: 42 }
                  ]).map((wp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#fbfcfb',
                        border: '1px solid rgba(27, 56, 43, 0.08)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#163326',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {wp.step}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#163326' }}>{wp.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#647c6e' }}>{wp.road_type}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: wp.traffic === 'CLEAR' || wp.traffic === 'LOW' ? '#dcfce7' : '#fef3c7',
                          color: wp.traffic_color || '#2d6a4f'
                        }}>
                          {wp.traffic}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#647c6e', marginTop: '2px' }}>+{wp.eta_mins}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Next Step Button */}
              {selectedOrder && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(27, 56, 43, 0.08)' }}>
                  <button
                    onClick={() => handleOpenStatusModal(selectedOrder)}
                    style={{
                      width: '100%',
                      background: '#163326',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Advance Status to Next Milestone <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: DELIVERY HISTORY & EARNINGS */}
      {currentView === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', margin: '0 0 4px' }}>
                Completed Deliveries & Freight Ledger
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#5e7568' }}>
                Archived logs of completed agri-produce journeys, verified POD OTP receipts, and freight fee payouts.
              </p>
            </div>
          </div>

          {historyOrders.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px dashed rgba(27, 56, 43, 0.2)',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#607469'
            }}>
              <CheckCircle2 size={40} color="#2d6a4f" style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No completed delivery history records found yet.</p>
            </div>
          ) : (
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 56, 43, 0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f9f6', borderBottom: '1px solid rgba(27, 56, 43, 0.1)', color: '#2d6a4f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '14px 18px' }}>Trip ID</th>
                      <th style={{ padding: '14px 18px' }}>Produce Cargo</th>
                      <th style={{ padding: '14px 18px' }}>Pickup Gate</th>
                      <th style={{ padding: '14px 18px' }}>Delivery Destination</th>
                      <th style={{ padding: '14px 18px' }}>Distance</th>
                      <th style={{ padding: '14px 18px' }}>POD Verification</th>
                      <th style={{ padding: '14px 18px' }}>Freight Payout</th>
                      <th style={{ padding: '14px 18px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.map((order, idx) => (
                      <tr 
                        key={order.id} 
                        style={{ 
                          borderBottom: idx !== historyOrders.length - 1 ? '1px solid rgba(27, 56, 43, 0.06)' : 'none',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfdfc'
                        }}
                      >
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#163326' }}>
                          #{order.id}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#163326', fontWeight: 600 }}>
                          {order.items?.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ') || 'Produce Cargo'}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#4a5f53' }}>
                          {order.pickup_address}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#4a5f53' }}>
                          {order.delivery_address}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#163326', fontWeight: 700 }}>
                          {order.estimated_distance_km} km
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={13} /> Verified OTP ({order.delivery_otp || '1234'})
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#688273' }}>
                              {order.pod_signature || 'Signed by Buyer'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#15803d', fontSize: '0.94rem' }}>
                          +₹{order.delivery_fee}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: UPDATE DELIVERY STATUS STEPPER */}
      {showStatusModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(22, 51, 38, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  Advance Delivery Milestone
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#5e7568' }}>
                  Shipment #{selectedOrder.id} • Carrier: {selectedOrder.vehicle_number}
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#647c6e' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326', display: 'block', marginBottom: '6px' }}>
                  Target Delivery Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setStatusLocationName(getDefaultLocationNameForStatus(e.target.value, selectedOrder));
                  }}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="ASSIGNED">ASSIGNED (Dispatch Confirmation)</option>
                  <option value="OUT_FOR_PICKUP">OUT_FOR_PICKUP (En route to Farmer Gate)</option>
                  <option value="PICKED_UP">PICKED_UP (Produce Loaded & Weighed)</option>
                  <option value="IN_TRANSIT">IN_TRANSIT (On State / National Highway)</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Final Approach to Mandi Terminal)</option>
                  <option value="DELIVERED">DELIVERED (Requires Buyer OTP Confirmation)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326', display: 'block', marginBottom: '6px' }}>
                  Waypoint / Location Name
                </label>
                <input
                  type="text"
                  required
                  value={statusLocationName}
                  onChange={(e) => setStatusLocationName(e.target.value)}
                  placeholder="e.g. Anand-Nadiad Toll Plaza or APMC Naroda Receiving Dock"
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326', display: 'block', marginBottom: '6px' }}>
                  Driver Observation Notes (Quality & Cold-Chain)
                </label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Moisture levels verified, tarpaulin tied firmly. Reefer container maintained at 16°C."
                  className="form-input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f3',
                    border: '1px solid rgba(27, 56, 43, 0.1)',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#43584c'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {actionLoading ? 'Updating...' : 'Save & Broadcast Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELIVERY (OTP + DIGITAL POD) */}
      {showConfirmModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(22, 51, 38, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  Confirm Delivery & Verify OTP
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#5e7568' }}>
                  Ask buyer for the 4-digit code sent to their phone to release freight payout.
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#647c6e' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 4-Digit OTP Input */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '8px' }}>
                  ENTER 4-DIGIT BUYER DELIVERY OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="4829"
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '2px solid #22c55e',
                    width: '180px',
                    margin: '0 auto',
                    background: '#ffffff',
                    color: '#163326'
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '6px' }}>
                  Demo fallback: <strong>4829</strong> or <strong>1234</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326', display: 'block', marginBottom: '6px' }}>
                  Proof of Delivery (POD) Sign-off
                </label>
                <input
                  type="text"
                  required
                  value={podSignature}
                  onChange={(e) => setPodSignature(e.target.value)}
                  placeholder="e.g. Manoj K. (Depot In-charge)"
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326', display: 'block', marginBottom: '6px' }}>
                  Receiver Condition Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g. Bags intact, zero moisture, weight matched manifest."
                  className="form-input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{
                background: '#f8faf9',
                padding: '10px 14px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: '#5a7364' }}>Delivery Fee Credited:</span>
                <strong style={{ color: '#15803d', fontSize: '0.96rem' }}>+₹{selectedOrder.delivery_fee}</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f3',
                    border: '1px solid rgba(27, 56, 43, 0.1)',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#43584c'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 1.5,
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {actionLoading ? 'Verifying OTP...' : 'Verify OTP & Complete Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
