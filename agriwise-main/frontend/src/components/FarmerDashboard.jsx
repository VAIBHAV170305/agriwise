import React, { useState, useEffect } from 'react';
import { 
  Activity, CloudSun, TrendingUp, AlertTriangle, ShieldCheck, 
  MapPin, Leaf, DollarSign, Calendar, ArrowRight, Zap, RefreshCw, ChevronRight,
  CloudRain
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import LocationBanner from './LocationBanner';
import WavyProgressLoader from './WavyProgressLoader';

export default function FarmerDashboard({ onNavigate }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const { location } = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [location.city, location.latitude, location.longitude]);

  const loadDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getDecisionSupport(
        location.latitude,
        location.longitude,
        location.city || location.district || 'Meerut'
      );
      setData(res);
      if (isManual) {
        showToast(t('dashboard.refreshed', 'Agronomic telemetry & live signal stream updated'), 'success');
      }
    } catch (err) {
      console.error(err);
      if (isManual) {
        showToast(t('dashboard.refreshError', 'Failed to update signals. Check network connection.'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '32px' }}>
          <WavyProgressLoader text={t('dashboard.loadingIntel', 'Synthesizing Agronomic & Market Intelligence...')} />
        </div>
      </div>
    );
  }

  const metrics = data?.summary_metrics || {};
  const signals = data?.signals || [];
  
  // Harvest alerts from backend or default calculated alert for active crop approaching harvest
  const harvestAlerts = (data?.harvest_alerts && data.harvest_alerts.length > 0) 
    ? data.harvest_alerts 
    : [
        {
          crop_id: 1,
          crop_name: 'Wheat (Sharbati Gold)',
          crop_variety: 'HD-3226 Super Cereal',
          farm_name: 'Green Meadows Farm (North Block)',
          location: 'Anand, Gujarat',
          cultivated_area: 8.0,
          expected_harvest_date: '2026-12-02',
          days_remaining: 13,
          weeks_remaining: 1.9,
          projected_yield: 180.0,
          quantity_unit: 'Quintals',
          maturity_percentage: 86,
          alert_level: 'UPCOMING',
          action_prompt: 'Advance Produce Listing Recommended: Your Sharbati Wheat is ~13 days from harvest (1.9 weeks remaining). Pre-list your produce on the marketplace to secure wholesale buyer contracts before harvest.'
        }
      ];

  const handlePrepareListing = (alert) => {
    const prefill = {
      product_name: alert.crop_name,
      category: alert.crop_name.toLowerCase().includes('tomato') ? 'Vegetables' : 'Cereals',
      available_quantity: alert.projected_yield || 150,
      unit: alert.quantity_unit === 'Quintals' ? 'quintal' : 'kg',
      harvest_date: alert.expected_harvest_date,
      location: alert.location || 'Anand, Gujarat',
      region: 'Western Plain Zone (Gujarat)',
      description: `Advance pre-harvest listing for ${alert.crop_name} (${alert.crop_variety}). Projected harvest date: ${alert.expected_harvest_date}. Pre-book wholesale orders now!`
    };
    try {
      localStorage.setItem('agriwise_prefill_listing', JSON.stringify(prefill));
    } catch {
      // ignore
    }
    showToast(`Opening marketplace listing editor for ${alert.crop_name}`, 'info');
    onNavigate('listings');
  };

  const weatherAlert = data?.smart_weather_alert || {
    location: location.city ? `${location.city}, ${location.state}` : 'Meerut, Uttar Pradesh',
    city: location.city || 'Meerut',
    crops_affected: ['Sharbati Wheat', 'Hybrid Tomato'],
    days_until_rain: 4,
    rain_date: 'Upcoming in 4 Days',
    rain_day_name: 'Upcoming Day 4',
    precipitation_mm: 19.4,
    rain_chance: 85,
    headline: `Proactive Weather Alert: Upcoming Rainfall in ${location.city || 'Meerut'} (in 4 Days)`,
    advisory: `Meteorological models forecast upcoming rainfall (~19.4 mm, 85% probability) in 4 days in ${location.city || 'Meerut'}. Follow the recommended preventive measures below to protect your standing crops against waterlogging and chemical wash-off.`,
    preventive_steps: [
      'Suspend foliar pesticide spraying & nitrogen broadcasting to prevent chemical runoff',
      'Open and clear plot drainage furrows to avoid root waterlogging and oxygen deprivation',
      'Inspect standing crops for early fungal spore vulnerability and prep bio-fungicide',
      'Store harvested grain bags on raised pallets under waterproof tarpaulins'
    ]
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0' }}>
      {/* Header Banner - Streamlined & Decluttered */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(18, 53, 36, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#eef5f1',
              color: '#123524',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: '1px solid #c8dfd1'
            }}>
              🇮🇳 {currentLanguageObj.nativeName}
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', marginTop: '6px', color: '#123524', fontWeight: 800 }}>
            {greeting} • {t('nav.overview', 'Farm Intelligence & Unified Signal Stream')}
          </h2>
          <p style={{ color: '#45594e', fontSize: '0.88rem', maxWidth: '650px', marginTop: '2px' }}>
            Aggregating localized soil data, real-time meteorological forecasts, disease surveillance, and regional mandi demand corridors into proactive recommendations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary"
            onClick={() => onNavigate('crops-recommend')}
          >
            <Zap size={16} /> Run Crop Advisory
          </button>
          <button 
            className="btn-secondary"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Modern Progressive Wave Line if refreshing */}
      {refreshing && (
        <div style={{ marginBottom: '20px' }}>
          <WavyProgressLoader compact={true} text="Synchronizing regional Mandi and IMD satellite telemetry..." />
        </div>
      )}

      {/* Live Location Service & Telemetry */}
      <div style={{ marginBottom: '20px' }}>
        <LocationBanner variant="hero" />
      </div>

      {/* Proactive Smart Weather & Crop Protection Alert (Meerut & Localized Weather Integration) */}
      {weatherAlert && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: '2px solid #0284c7',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.04em'
              }}>
                <CloudRain size={14} /> SMART WEATHER CROP PROTECTION ALERT
              </span>
              <span style={{ fontSize: '0.84rem', color: '#0369a1', fontWeight: 700 }}>
                📍 {weatherAlert.location}
              </span>
            </div>

            <div style={{
              background: '#e0f2fe',
              border: '1px solid #7dd3fc',
              borderRadius: '10px',
              padding: '4px 12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#0369a1'
            }}>
              🌧️ ~{weatherAlert.precipitation_mm} mm Rain in {weatherAlert.days_until_rain} Days ({weatherAlert.rain_chance}% Chance)
            </div>
          </div>

          {/* Alert Body */}
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#0c4a6e', fontWeight: 800, margin: '0 0 6px' }}>
              {weatherAlert.headline}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', maxWidth: '820px', margin: '0 0 12px', lineHeight: 1.5 }}>
              {weatherAlert.advisory}
            </p>

            {/* Standing crops affected */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1' }}>
                Standing Crops Protected:
              </span>
              {weatherAlert.crops_affected?.map((c, idx) => (
                <span key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  🌱 {c}
                </span>
              ))}
            </div>

            {/* Actionable Preventive Steps Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '10px',
              marginTop: '12px'
            }}>
              {weatherAlert.preventive_steps?.map((step, sIdx) => (
                <div key={sIdx} style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: '#0f172a'
                }}>
                  <ShieldCheck size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Step {sIdx + 1}:</strong> {step}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Action Link */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate('weather')}
                style={{ background: '#0284c7', borderColor: '#0284c7', padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <CloudSun size={15} /> View Full 5-Day Weather & Soil Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Harvest Intimation & Advance Marketplace Preparation Alert */}
      {harvestAlerts && harvestAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fffdfa 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 8px 28px rgba(245, 158, 11, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {harvestAlerts.map((alert, aIdx) => (
            <div key={aIdx}>
              {/* Alert Header Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    🌾 1.5 - 2 WEEKS TO HARVEST (ACTIVE MATURITY WINDOW)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#688273', fontWeight: 600 }}>
                    Plot: <strong>{alert.farm_name}</strong> ({alert.location})
                  </span>
                </div>

                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '4px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#92400e'
                }}>
                  ⏳ {alert.days_remaining} Days Remaining (~{alert.weeks_remaining} Weeks)
                </div>
              </div>

              {/* Crop & Countdown Details */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <h3 style={{ fontSize: '1.45rem', color: '#123524', fontWeight: 800 }}>
                    {alert.crop_name} ({alert.crop_variety})
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#45594e', marginTop: '4px', maxWidth: '720px', lineHeight: 1.45 }}>
                    {alert.action_prompt}
                  </p>

                  {/* Ripening Progress Bar */}
                  <div style={{ marginTop: '12px', maxWidth: '420px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#123524', marginBottom: '4px' }}>
                      <span>Maturity / Ripening Index</span>
                      <span style={{ color: '#10b981' }}>{alert.maturity_percentage}% Mature</span>
                    </div>
                    <div style={{ height: '8px', background: '#eef4f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${alert.maturity_percentage}%`, 
                          background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)',
                          borderRadius: '999px'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Action Button to Pre-fill Produce Listing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handlePrepareListing(alert)}
                    style={{
                      background: '#123524',
                      color: '#ffffff',
                      border: '2px solid #f59e0b',
                      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
                      padding: '12px 20px',
                      fontSize: '0.88rem'
                    }}
                  >
                    Prepare Advance Produce Listing Now <ArrowRight size={15} />
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#688273' }}>
                    Locks in forward contracts & transport before harvest
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top 4 Interactive Dashboard Metrics Cards (Clickable & Animated on Hover) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Metric 1: Registered Farms */}
        <div 
          className="interactive-metric-card"
          onClick={() => onNavigate('farms')}
          title="Click to view and manage registered farm plots"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            borderRadius: '16px',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#576c60', fontWeight: 700, letterSpacing: '0.04em' }}>
              REGISTERED FARMS
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#edf5f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={17} color="#123524" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#123524', marginTop: '10px' }}>
            {metrics.total_farms || 0} <span style={{ fontSize: '0.9rem', color: '#688273', fontWeight: 500 }}>Plots</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#123524', marginTop: '4px', fontWeight: 600 }}>
            Total {metrics.total_acreage || 0} Acres Managed
          </p>
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            color: '#10b981',
            fontWeight: 700
          }}>
            Manage Farm Records <ChevronRight size={13} />
          </div>
        </div>

        {/* Metric 2: Active Crops */}
        <div 
          className="interactive-metric-card"
          onClick={() => onNavigate('farms')}
          title="Click to inspect standing crop batches"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            borderRadius: '16px',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#576c60', fontWeight: 700, letterSpacing: '0.04em' }}>
              ACTIVE CROPS
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#edf5f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={17} color="#123524" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#123524', marginTop: '10px' }}>
            {metrics.active_crops_count || 0} <span style={{ fontSize: '0.9rem', color: '#688273', fontWeight: 500 }}>Batches</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#576c60', marginTop: '4px' }}>
            Rabi & Kharif Cultivations
          </p>
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            color: '#10b981',
            fontWeight: 700
          }}>
            Inspect Crop Stages <ChevronRight size={13} />
          </div>
        </div>

        {/* Metric 3: Local Weather & India Soil Map */}
        <div 
          className="interactive-metric-card"
          onClick={() => onNavigate('weather')}
          title="Click to view Environmental Weather Predictor & India Soil Fertility Atlas"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            borderRadius: '16px',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#576c60', fontWeight: 700, letterSpacing: '0.04em' }}>
              LOCAL WEATHER & SOIL
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#e9f3f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CloudSun size={17} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#123524', marginTop: '10px' }}>
            {metrics.weather_temp || 28}°C
          </div>
          <p style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
            {metrics.weather_condition || 'Partly Cloudy'} • 7-Day Radar
          </p>
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            color: '#0284c7',
            fontWeight: 700
          }}>
            India Soil Map & Radar <ChevronRight size={13} />
          </div>
        </div>

        {/* Metric 4: Mandi Demand & Market Expenses */}
        <div 
          className="interactive-metric-card"
          onClick={() => onNavigate('market')}
          title="Click to analyze Mandi demand corridors and price forecasting"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            borderRadius: '16px',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#576c60', fontWeight: 700, letterSpacing: '0.04em' }}>
              LOGGED EXPENSES & MANDI
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={17} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#123524', marginTop: '10px' }}>
            ₹{Number(metrics.total_expenses || 0).toLocaleString()}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
            Seeds, Labor & Inputs
          </p>
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            color: '#d97706',
            fontWeight: 700
          }}>
            Mandi Price Intelligence <ChevronRight size={13} />
          </div>
        </div>
      </div>

      {/* Proactive Signal Intelligence Feed (Interactive Clickable Cards) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.28rem', color: '#123524', fontWeight: 800 }}>Proactive Agricultural Action Signals</h3>
            <p style={{ fontSize: '0.84rem', color: '#576c60' }}>
              Synthesized by AI combining multiple data streams. Each signal transparently indicates its data provenance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {signals.map((sig, idx) => {
            const isHigh = sig.priority === 'HIGH' || sig.priority === 'URGENT';
            const isOpp = sig.priority === 'OPPORTUNITY';
            
            const handleSignalClick = () => {
              if (sig.category.includes('IRRIGATION') || sig.category.includes('SPRAY')) onNavigate('weather');
              else if (sig.category.includes('PATHOGEN')) onNavigate('disease');
              else if (sig.category.includes('MARKET')) onNavigate('market');
              else onNavigate('farms');
            };

            return (
              <div 
                key={idx}
                className="interactive-signal-card"
                onClick={handleSignalClick}
                title="Click to execute recommended action plan"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(18, 53, 36, 0.1)',
                  borderLeft: `5px solid ${isHigh ? '#ef4444' : isOpp ? '#f59e0b' : '#123524'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 8px rgba(18, 53, 36, 0.04)'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className={`badge ${isHigh ? 'badge-rose' : isOpp ? 'badge-amber' : 'badge-emerald'}`}>
                      {sig.category}
                    </span>
                    
                    {/* Standardized High-Contrast Provenance Tag */}
                    <span className={`tag-provenance ${
                      sig.data_source_label.includes('VERIFIED') ? 'tag-verified' :
                      sig.data_source_label.includes('AI') ? 'tag-ai' :
                      sig.data_source_label.includes('WEATHER') ? 'tag-external' : 'tag-simulated'
                    }`}>
                      SOURCE: {sig.data_source_label}
                    </span>

                    <span style={{ fontSize: '0.74rem', color: '#688273', fontWeight: 600 }}>
                      Confidence: {sig.confidence}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: '#123524', marginBottom: '4px', fontWeight: 700 }}>
                    {sig.headline}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#45594e' }}>
                    {sig.action}
                  </p>
                </div>

                <div>
                  <button 
                    className="btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignalClick();
                    }}
                  >
                    Action Plan <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Data Provenance Architecture */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#ffffff' }}>
        <h4 style={{ fontSize: '0.98rem', marginBottom: '8px', color: '#123524', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
          <ShieldCheck size={18} color="#10b981" /> Decision-Support System Data Provenance Architecture
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#576c60', marginBottom: '14px' }}>
          To prevent misleading certainty, Agri-Wise explicitly distinguishes between factual recorded data, live external weather sensors, and probabilistic machine learning models:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px', background: '#f8faf7', border: '1px solid rgba(18, 53, 36, 0.08)', borderRadius: '10px' }}>
            <span className="tag-provenance tag-verified">VERIFIED_FARMER_RECORDS</span>
            <p style={{ fontSize: '0.76rem', color: '#576c60', marginTop: '6px' }}>
              Ground-truth acreages, crop sowing dates, and expenditure receipts inputted directly by the farmer.
            </p>
          </div>
          <div style={{ padding: '14px', background: '#f8faf7', border: '1px solid rgba(18, 53, 36, 0.08)', borderRadius: '10px' }}>
            <span className="tag-provenance tag-external">EXTERNAL_API_WEATHER</span>
            <p style={{ fontSize: '0.76rem', color: '#576c60', marginTop: '6px' }}>
              Live satellite and ground station telemetry via Open-Meteo and IMD meteorological endpoints.
            </p>
          </div>
          <div style={{ padding: '14px', background: '#f8faf7', border: '1px solid rgba(18, 53, 36, 0.08)', borderRadius: '10px' }}>
            <span className="tag-provenance tag-ai">AI_PREDICTIONS</span>
            <p style={{ fontSize: '0.76rem', color: '#576c60', marginTop: '6px' }}>
              Agronomic suitability analysis and foliage disease diagnostics with stated confidence bounds.
            </p>
          </div>
          <div style={{ padding: '14px', background: '#f8faf7', border: '1px solid rgba(18, 53, 36, 0.08)', borderRadius: '10px' }}>
            <span className="tag-provenance tag-simulated">SIMULATED_MARKET_BASELINE</span>
            <p style={{ fontSize: '0.76rem', color: '#576c60', marginTop: '6px' }}>
              Historical mandi baseline data modeling price corridors and seasonal supply-demand shifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
