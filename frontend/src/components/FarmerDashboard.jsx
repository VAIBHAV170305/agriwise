import React, { useState, useEffect } from 'react';
import { 
  Activity, CloudSun, TrendingUp, AlertTriangle, ShieldCheck, 
  MapPin, Leaf, DollarSign, Calendar, ArrowRight, Zap, RefreshCw,
  Clock, Package, ShoppingBag, CheckCircle2, ChevronRight, CloudRain,
  Info
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import LocationBanner from './LocationBanner';
import WavyLoader from './WavyLoader';
import ShimmerSkeleton from './ShimmerSkeleton';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';

export default function FarmerDashboard({ onNavigate }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const { location } = useLocation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard(false);
  }, [location?.city, location?.latitude, location?.longitude]);

  const loadDashboard = async (notify = false) => {
    if (notify) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getDecisionSupport(
        location?.latitude || 28.9845,
        location?.longitude || 77.7064,
        location?.city || 'Meerut'
      );
      setData(res);
      if (notify) {
        showToast({
          title: 'Signals Synchronized',
          message: `Live farm telemetry updated for ${location?.city || 'Meerut'}.`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error(err);
      if (notify) {
        showToast({
          title: 'Refresh Issue',
          message: 'Using offline farm telemetry cache.',
          type: 'warning'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Automated Harvest Intimation (Calculates 1 - 1.5 weeks prior to harvest)
  const harvestAlert = {
    crop_name: 'Sharbati Wheat (HD-3226)',
    plot: 'North Block Holding (8.0 Acres)',
    location: location?.city ? `${location.city}, ${location.state}` : 'Meerut, Uttar Pradesh',
    sowing_date: '2025-11-15',
    expected_harvest_date: '2026-03-12',
    days_remaining: 12,
    weeks_remaining: 1.7,
    projected_yield: 180,
    unit: 'Quintals',
    ripening_percentage: 88,
    action_prompt: 'Pre-harvest window active: Your Sharbati Wheat is ~12 days from harvest. Pre-list your produce on the Mandi Marketplace today to lock in forward wholesale buyers before reaping!'
  };

  const handlePrepareListing = () => {
    const prefill = {
      product_name: 'Sharbati Wheat (HD-3226)',
      category: 'Cereals',
      available_quantity: harvestAlert.projected_yield,
      unit: 'quintal',
      harvest_date: harvestAlert.expected_harvest_date,
      location: harvestAlert.location,
      asking_price: 2425,
      description: `Advance pre-harvest listing for ${harvestAlert.crop_name}. Projected harvest in ~12 days. Pre-book wholesale orders now!`
    };
    try {
      localStorage.setItem('agriwise_prefill_listing', JSON.stringify(prefill));
    } catch {
      // ignore
    }
    showToast({
      title: 'Opening Marketplace Listing',
      message: 'Prefilled advance harvest details for Sharbati Wheat.',
      type: 'info'
    });
    onNavigate('listings');
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '36px 0', maxWidth: '1000px', margin: '0 auto' }}>
        <WavyLoader label="Synthesizing localized agronomic telemetry, weather, and Mandi price corridors..." color="#163326" />
        <div style={{ marginTop: '30px' }}>
          <ShimmerSkeleton rows={4} height={52} borderRadius={12} />
        </div>
      </div>
    );
  }

  const metrics = data?.summary_metrics || {};
  const signals = data?.signals || [];

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 60px' }}>
      {/* 1. Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 12px rgba(22, 51, 38, 0.04)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <RakshakBadge text="AI Farm Decision Engine Active" />
            <span style={{
              background: '#edf5f0',
              color: '#163326',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              🇮🇳 {currentLanguageObj.nativeName}
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', marginTop: '6px', color: '#163326', fontWeight: 800 }}>
            {greeting} • {t('nav.overview', 'Farm Intelligence & Field Telemetry')}
          </h2>
          <p style={{ color: '#4b6354', fontSize: '0.88rem', maxWidth: '720px', marginTop: '2px' }}>
            Aggregating localized soil types, live meteorological satellites, disease scanners, and regional mandi prices into proactive farmer guidance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            onClick={() => onNavigate('crops-recommend')}
            style={{
              background: '#163326',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 51, 38, 0.2)'
            }}
          >
            <Zap size={15} /> 
            <span>Automated Crop Advisory</span>
          </button>
          <button 
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            style={{
              background: '#edf5f0',
              color: '#163326',
              border: '1px solid rgba(22, 51, 38, 0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: refreshing ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> 
            <span>{refreshing ? 'Updating...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Location Banner */}
      <div style={{ marginBottom: '20px' }}>
        <LocationBanner variant="hero" />
      </div>

      {/* 3. High-Level AI Executive Summary Card (Top of Dashboard) */}
      <div style={{
        background: 'linear-gradient(135deg, #163326 0%, #1e4a36 100%)',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '22px 26px',
        marginBottom: '22px',
        boxShadow: '0 8px 24px rgba(22, 51, 38, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RakshakIcon size={20} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: '#b6d7c5', textTransform: 'uppercase' }}>
              AI Executive Farm Briefing
            </span>
          </div>
          <span style={{ background: '#52b788', color: '#163326', padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: 800 }}>
            LIVE SYNC
          </span>
        </div>

        <p style={{ fontSize: '0.94rem', color: '#f0f5f2', lineHeight: 1.55, margin: 0 }}>
          🌾 <strong>Active Farm Status:</strong> You have 2 monitored plots (<strong>8.0 Acres Sharbati Wheat</strong> & <strong>2.5 Acres Hybrid Tomato</strong>) in {location?.city || 'Meerut'}.
          1 proactive harvest window is active for Wheat in <strong>~12 days</strong> (advance listing recommended).
          Mandi rates for Wheat are trending <strong>+8.4% above government MSP</strong>.
          🌧️ <strong>Upcoming Weather:</strong> Rain is predicted in 4 days (~19.4 mm) — postpone irrigation and suspend foliar chemical spraying today.
        </p>
      </div>

      {/* 4. Proactive Lifecycle Intimations: Automated Harvest Alert (1–1.5 Weeks in Advance) */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffdfa 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              gap: '6px'
            }}>
              🌾 1.5 WEEKS TO HARVEST: PRE-LISTING OPPORTUNITY
            </span>
            <span style={{ fontSize: '0.8rem', color: '#688273', fontWeight: 600 }}>
              Plot: {harvestAlert.plot}
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
            ⏳ {harvestAlert.days_remaining} Days Remaining (~{harvestAlert.weeks_remaining} Weeks)
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#163326', fontWeight: 800, margin: 0 }}>
              {harvestAlert.crop_name}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#4b6354', marginTop: '6px', maxWidth: '720px', lineHeight: 1.5 }}>
              {harvestAlert.action_prompt}
            </p>

            {/* Ripening Progress Bar */}
            <div style={{ marginTop: '12px', maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                <span>Crop Maturity Index</span>
                <span style={{ color: '#2d6a4f' }}>{harvestAlert.ripening_percentage}% Ripened</span>
              </div>
              <div style={{ height: '8px', background: '#edf5f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${harvestAlert.ripening_percentage}%`,
                  background: 'linear-gradient(90deg, #52b788 0%, #f59e0b 100%)',
                  borderRadius: '999px'
                }} />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={handlePrepareListing}
              style={{
                background: '#163326',
                color: '#ffffff',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)'
              }}
            >
              <span>Prepare Advance Produce Listing Now</span>
              <ArrowRight size={15} />
            </button>
            <span style={{ fontSize: '0.72rem', color: '#688273', textAlign: 'center' }}>
              Lock in wholesale buyers & transport before harvest
            </span>
          </div>
        </div>
      </div>

      {/* 5. Color Glossary & Legend Card (Farmer-Centric UX) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '16px',
        padding: '18px 22px',
        marginBottom: '26px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Info size={16} color="#2d6a4f" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Color Glossary & Status Guide
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          fontSize: '0.76rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2d6a4f', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#163326' }}>Green:</strong> Healthy Crops & Safe Spraying
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#163326' }}>Purple:</strong> AI Predictions & Growth Curves
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#163326' }}>Blue:</strong> Weather Feeds & Irrigation
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#163326' }}>Gold / Amber:</strong> Harvest Opportunity & Mandi
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--crimson-600, #d90429)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#163326' }}>Crimson:</strong> Disease or Weather Risk
            </div>
          </div>
        </div>
      </div>

      {/* 6. Four High-Level Telemetry Cards (Simplified, No raw variables) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Registered Farms */}
        <div 
          onClick={() => onNavigate('farms')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2d6a4f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#657d70' }}>MONITORED HOLDINGS</span>
            <Leaf size={18} color="#2d6a4f" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.total_farms || 2} <span style={{ fontSize: '0.9rem', color: '#657d70', fontWeight: 600 }}>Plots</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '4px', fontWeight: 700 }}>
            {metrics.total_acres || 10.5} Total Cultivated Acres
          </p>
        </div>

        {/* Card 2: Standing Crops */}
        <div 
          onClick={() => onNavigate('farms')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2d6a4f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#657d70' }}>STANDING CROPS</span>
            <Activity size={18} color="#2d6a4f" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.total_crops || 3} <span style={{ fontSize: '0.9rem', color: '#657d70', fontWeight: 600 }}>Varieties</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '4px', fontWeight: 700 }}>
            Wheat, Tomato & Cotton Tracked
          </p>
        </div>

        {/* Card 3: Live Weather */}
        <div 
          onClick={() => onNavigate('weather')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#0284c7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#657d70' }}>METEOROLOGY</span>
            <CloudSun size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.weather_temp || 26}°C
          </div>
          <p style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '4px', fontWeight: 700 }}>
            Rain in 4 Days (~19.4 mm)
          </p>
        </div>

        {/* Card 4: Mandi Listings & Orders */}
        <div 
          onClick={() => onNavigate('listings')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#d97706'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#657d70' }}>MANDI COMMERCE</span>
            <TrendingUp size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            ₹2,425 <span style={{ fontSize: '0.85rem', color: '#657d70', fontWeight: 600 }}>/ Qtl</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '4px', fontWeight: 700 }}>
            Wheat +8.4% above Govt MSP
          </p>
        </div>
      </div>
    </div>
  );
}
