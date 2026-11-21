import React, { useState, useEffect } from 'react';
import { 
  Activity, CloudSun, TrendingUp, AlertTriangle, ShieldCheck, 
  MapPin, Leaf, DollarSign, Calendar, ArrowRight, Zap, RefreshCw,
  Clock, Package, ShoppingBag, CheckCircle2, ChevronRight, CloudRain,
  Info, Sparkles, Plus, Award, BarChart3, Droplets, Thermometer,
  Compass, CheckSquare, Layers, Navigation
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import LocationBanner from './LocationBanner';
import WavyLoader from './WavyLoader';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';

export default function FarmerDashboard({ onNavigate }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const { location, detectLocation, detecting } = useLocation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [selectedCropTab, setSelectedCropTab] = useState('wheat'); // 'wheat' | 'tomato' | 'cotton'

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
          title: 'Telemetry Notice',
          message: 'Using offline farm telemetry cache.',
          type: 'info'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Automated Harvest Intimation (1.5 weeks prior to harvest)
  const harvestAlert = {
    crop_name: 'Sharbati Wheat (HD-3226)',
    plot: 'North Block Holding (8.0 Acres)',
    location: location?.city ? `${location.city}, ${location.state}` : 'Meerut, Uttar Pradesh',
    sowing_date: '2025-11-15',
    expected_harvest_date: '2026-03-12',
    days_remaining: 12,
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
      unit: 'Quintals',
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
      title: 'Opening Product Creator',
      message: 'Prefilled advance harvest details for Sharbati Wheat.',
      type: 'info'
    });
    onNavigate('create-product');
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '60px 0', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <WavyLoader label="Synthesizing localized agronomic telemetry, weather radar, and Mandi price corridors..." color="#163326" />
      </div>
    );
  }

  const metrics = data?.summary_metrics || {};

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 60px' }}>
      
      {/* 1. HERO AGRONOMY COMMAND BAR */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fbf9 100%)',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '24px',
        padding: '26px 30px',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 20px rgba(22, 51, 38, 0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#163326',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} color="#52b788" />
              {t('farmer.agriStackId', 'BHARAT AGRI-STACK ID')}: KID-2026-GJ-0002
            </span>
            <span style={{
              background: '#edf6f0',
              color: '#2d6a4f',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              border: '1px solid rgba(45, 106, 79, 0.2)'
            }}>
              📍 {location?.city || 'Meerut'}, {location?.state || 'Uttar Pradesh'} ({location?.agroZone || 'Upper Gangetic Plain'})
            </span>
            <span style={{
              background: location?.isLiveSynced ? '#dcfce7' : '#fef3c7',
              color: location?.isLiveSynced ? '#15803d' : '#92400e',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{location?.isLiveSynced ? (location?.source === 'GPS' ? t('farmer.liveGpsActive', '🟢 Live GPS Active') : t('farmer.liveNetworkSynced', '🌐 Live Network Synced')) : t('farmer.pinnedLocation', '📍 Pinned Location')}</span>
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', marginTop: '8px', color: '#163326', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {greeting}, Ramesh Patel
          </h1>
          <p style={{ color: '#4b6354', fontSize: '0.86rem', maxWidth: '750px', marginTop: '2px' }}>
            {t('farmer.consoleSub', 'Your centralized agricultural intelligence console: standing crop health, upcoming weather early warnings, and APMC market demand.')}
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => detectLocation(true)}
            disabled={detecting}
            style={{
              background: '#ffffff',
              color: '#163326',
              border: '1px solid rgba(22, 51, 38, 0.15)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: detecting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
            title="Auto-detect and sync your live GPS / Network coordinates"
          >
            <Navigation size={14} className={detecting ? 'animate-spin' : ''} color="#2d6a4f" /> 
            <span>{detecting ? t('farmer.locating', 'Locating...') : t('farmer.syncGps', 'Sync Live GPS')}</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('create-product')}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(22, 51, 38, 0.2)'
            }}
          >
            <Plus size={16} /> 
            <span>{t('farmer.addProduct', 'Add a Product')}</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('crops-recommend')}
            style={{
              background: '#edf6f0',
              color: '#163326',
              border: '1px solid rgba(22, 51, 38, 0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={15} color="#2d6a4f" /> 
            <span>{t('farmer.cropAdvisory', 'Crop Advisory')}</span>
          </button>

          <button 
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            style={{
              background: '#ffffff',
              color: '#163326',
              border: '1px solid rgba(22, 51, 38, 0.12)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: refreshing ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> 
            <span>{refreshing ? t('farmer.updating', 'Updating...') : t('farmer.syncRadar', 'Sync Radar')}</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE AI BRIEFING BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #163326 0%, #1e4a36 100%)',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '22px 28px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(22, 51, 38, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RakshakIcon size={20} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: '#b6d7c5', textTransform: 'uppercase' }}>
              {t('farmer.executiveBriefingTitle', 'Rakshak AI • Executive Farm Briefing')}
            </span>
          </div>
          <span style={{ background: '#52b788', color: '#163326', padding: '3px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
            {t('farmer.liveSatelliteSync', 'LIVE SATELLITE SYNC')}
          </span>
        </div>

        <p style={{ fontSize: '0.94rem', color: '#f0f5f2', lineHeight: 1.6, margin: 0 }}>
          🌾 <strong>{t('farmer.activeFarmStatusTitle', 'Active Farm Status:')}</strong> You have 2 monitored holdings (<strong>8.0 Acres Sharbati Wheat</strong> & <strong>2.5 Acres Hybrid Tomato</strong>) in {location?.city || 'Meerut'}.
          1 proactive harvest window is active for Wheat in <strong>~12 days</strong> (advance listing recommended to lock in forward APMC contracts).
          Mandi rates for Wheat are trending <strong>+8.4% above government MSP</strong>.
          🌧️ <strong>{t('farmer.upcomingWeatherTitle', 'Upcoming Weather:')}</strong> Rain is predicted in 4 days (~19.4 mm) — postpone scheduled irrigation and complete foliar sprays before Sunday.
        </p>
      </div>

      {/* 3. FOUR HIGH-IMPACT TELEMETRY METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
        marginBottom: '26px'
      }}>
        {/* Card 1: Monitored Landholdings */}
        <div 
          onClick={() => onNavigate('farms')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2d6a4f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#657d70', textTransform: 'uppercase' }}>
              {t('farmer.cardHoldings', 'Monitored Holdings')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={16} color="#2d6a4f" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#163326', marginTop: '8px', lineHeight: 1.1 }}>
            10.5 <span style={{ fontSize: '0.9rem', color: '#657d70', fontWeight: 600 }}>{t('farmer.acres', 'Acres')}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '6px', fontWeight: 700 }}>
            {t('farmer.cardHoldingsDesc', '2 Active Plots • Deep Alluvial Loam (pH 7.4)')}
          </p>
        </div>

        {/* Card 2: Standing Crops */}
        <div 
          onClick={() => onNavigate('farms')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2d6a4f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#657d70', textTransform: 'uppercase' }}>
              {t('farmer.cardStandingCrops', 'Standing Crops')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#2d6a4f" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#163326', marginTop: '8px', lineHeight: 1.1 }}>
            3 <span style={{ fontSize: '0.9rem', color: '#657d70', fontWeight: 600 }}>{t('farmer.varieties', 'Varieties')}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '6px', fontWeight: 700 }}>
            {t('farmer.cardStandingCropsDesc', 'Wheat, Tomato & Cotton • 98% Normal Canopy')}
          </p>
        </div>

        {/* Card 3: Agro-Weather Radar */}
        <div 
          onClick={() => onNavigate('weather')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #0284c7',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
              {t('farmer.cardWeatherRadar', 'Weather Radar (4-Day Rain Alert)')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudSun size={16} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#163326', marginTop: '8px', lineHeight: 1.1 }}>
            {metrics.weather_temp != null ? `${metrics.weather_temp}°C` : '26.5°C'} <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>🌧️ {t('farmer.rainInDays', 'Rain in 4 Days')}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '6px', fontWeight: 700 }}>
            {location?.city || 'Meerut'}: {t('farmer.cardWeatherDesc', '19.4 mm on Tuesday • Spray Window Safe Today')}
          </p>
        </div>

        {/* Card 4: Mandi Benchmark */}
        <div 
          onClick={() => onNavigate('market')}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '22px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#d97706'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#657d70', textTransform: 'uppercase' }}>
              {t('farmer.cardMandiBenchmark', 'Live Mandi Corridor')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#163326', marginTop: '8px', lineHeight: 1.1 }}>
            ₹2,425 <span style={{ fontSize: '0.85rem', color: '#657d70', fontWeight: 600 }}>{t('farmer.perQtl', '/ Qtl')}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '6px', fontWeight: 700 }}>
            {t('farmer.cardMandiDesc', 'Wheat +8.4% above Govt MSP (₹2,275)')}
          </p>
        </div>
      </div>

      {/* 4. PROACTIVE HARVEST INTIMATION BANNER (1.5 WEEKS IN ADVANCE) */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffdfa 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '26px',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {t('farmer.preListingOpp', '🌾 1.5 WEEKS TO HARVEST: PRE-LISTING OPPORTUNITY')}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#688273', fontWeight: 600 }}>
                  Plot: {harvestAlert.plot}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', margin: '4px 0 2px' }}>
                {harvestAlert.crop_name} Expected Harvest in ~12 Days
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#45594e', margin: 0, maxWidth: '780px' }}>
                {t('farmer.preListingPrompt', harvestAlert.action_prompt)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={handlePrepareListing}
              style={{
                background: '#163326',
                color: '#ffffff',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '11px 20px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                transition: 'all 0.16s ease'
              }}
            >
              <span>{t('farmer.prepareListingBtn', 'Prepare Advance Produce Listing Now')}</span>
              <ArrowRight size={15} />
            </button>
            <span style={{ fontSize: '0.7rem', color: '#688273', textAlign: 'center' }}>
              {t('farmer.routeHelper', 'Directly routes to dedicated Product Creator')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. STANDING CROPS & FARM PLOTS MONITOR (GALLERY) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#163326', margin: 0 }}>
              {t('farmer.farmPlotsTitle', 'Monitored Farm Plots & Standing Crop Health')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#657d70', margin: '2px 0 0' }}>
              {t('farmer.farmPlotsSub', 'Real-time physiological stage tracking, harvest timelines, and localized weather diagnostics:')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('farms')}
            style={{
              background: '#edf6f0',
              border: '1px solid rgba(22, 51, 38, 0.12)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#2d6a4f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{t('farmer.manageAllPlots', 'Manage All Plots')}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Plot 1: Sharbati Wheat */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
                alt="Sharbati Wheat"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge badge-emerald">Cereals</span>
                <span style={{ background: '#163326', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800 }}>
                  8.0 Acres
                </span>
              </div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <span style={{ background: '#52b788', color: '#163326', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                  ✓ 99% Optimal Growth
                </span>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  Sharbati Wheat (HD-3226)
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#688273', marginTop: '3px' }}>
                  North Block Holding • Sown Nov 15 • Harvest in ~12 Days
                </div>

                {/* Ripening Progress */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                    <span>Ripening & Grain Filling</span>
                    <span>88% Complete</span>
                  </div>
                  <div style={{ height: '7px', background: '#f0f5f2', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #52b788, #f59e0b)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: '#edf6f0', padding: '10px 12px', borderRadius: '10px', fontSize: '0.76rem', color: '#2d6a4f' }}>
                  💡 <strong>Action:</strong> Postpone irrigation pumping today; natural rain in 4 days will satisfy root moisture. Apply Urea top-dressing 24h prior.
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.66rem', color: '#6e8577', textTransform: 'uppercase', fontWeight: 700 }}>Projected Yield</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>180 Quintals</div>
                </div>
                <button
                  type="button"
                  onClick={handlePrepareListing}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                >
                  Pre-List Produce
                </button>
              </div>
            </div>
          </div>

          {/* Plot 2: Hybrid Organic Tomato */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"
                alt="Organic Tomato"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge badge-emerald">Vegetables</span>
                <span style={{ background: '#163326', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800 }}>
                  2.5 Acres
                </span>
              </div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                  ⚠️ Blight Caution
                </span>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  Hybrid Tomato (Abhinav F1)
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#688273', marginTop: '3px' }}>
                  Plot C Horticulture • High Density Drip • Fruiting Stage
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                    <span>Fruiting & Ripening</span>
                    <span>75% Harvested</span>
                  </div>
                  <div style={{ height: '7px', background: '#f0f5f2', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#0284c7', borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: '#fef3c7', padding: '10px 12px', borderRadius: '10px', fontSize: '0.76rem', color: '#92400e' }}>
                  ⚠️ <strong>Action:</strong> Harvest all mature and breaker-stage tomatoes today before Tuesday rain to prevent skin rupture and early blight.
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.66rem', color: '#6e8577', textTransform: 'uppercase', fontWeight: 700 }}>Market Value</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>₹28.00 / kg</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('create-product')}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                >
                  List Fresh Crates
                </button>
              </div>
            </div>
          </div>

          {/* Plot 3: Long Staple Cotton */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80"
                alt="Cotton"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge badge-emerald">Cash Crops</span>
                <span style={{ background: '#163326', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800 }}>
                  5.0 Acres
                </span>
              </div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                  🚨 Spray Hold Alert
                </span>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  Bt Cotton (Bollgard II)
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#688273', marginTop: '3px' }}>
                  South Block Holding • Flowering & Boll Formation
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#163326', marginBottom: '4px' }}>
                    <span>Boll Maturation</span>
                    <span>55% Matured</span>
                  </div>
                  <div style={{ height: '7px', background: '#f0f5f2', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '55%', height: '100%', background: '#7c3aed', borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: '#fee2e2', padding: '10px 12px', borderRadius: '10px', fontSize: '0.76rem', color: '#dc2626' }}>
                  🚨 <strong>Action:</strong> Hold all foliar chemical spraying immediately to prevent wash-off during Tuesday's 19.4 mm rain. Clear field furrow ends.
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.66rem', color: '#6e8577', textTransform: 'uppercase', fontWeight: 700 }}>Spot Rate</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>₹7,150 / Qtl</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('weather')}
                  style={{
                    background: '#edf6f0',
                    border: '1px solid rgba(22, 51, 38, 0.12)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2d6a4f',
                    cursor: 'pointer'
                  }}
                >
                  View Radar Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LIVE APMC MANDI PRICE CORRIDOR & DEMAND INTELLIGENCE */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-emerald">Agmarknet Verified</span>
              <span style={{ fontSize: '0.74rem', color: '#6e8577', fontWeight: 600 }}>
                Live APMC Price Corridors
              </span>
            </div>
            <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#163326', marginTop: '4px', margin: 0 }}>
              {t('farmer.mandiTableTitle', 'Regional Mandi Rates vs Government MSP (2025–26)')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('market')}
            style={{
              background: '#edf6f0',
              border: '1px solid rgba(22, 51, 38, 0.12)',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#2d6a4f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{t('farmer.openMandiHub', 'Open Full Mandi Hub')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid rgba(22, 51, 38, 0.12)', color: '#6e8577', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thCommodity', 'Crop Commodity')}</th>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thMandi', 'Active Mandi Hub')}</th>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thModalRate', 'Current Modal Rate')}</th>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thGovtMsp', 'Govt MSP')}</th>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thMspDiff', 'MSP Difference')}</th>
                <th style={{ padding: '10px 14px' }}>{t('farmer.thDemand', 'Wholesale Demand')}</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>{t('farmer.thAction', 'Direct Action')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { crop: '🌾 Sharbati Wheat (HD-3226)', mandi: 'Meerut Mandi (Sardhana)', price: '₹2,425 / Qtl', msp: '₹2,275 / Qtl', diff: '+₹150 (+6.6%)', demand: '📈 High Bullish Demand', action: 'Pre-List Batch' },
                { crop: '🍅 Hybrid Tomato', mandi: 'Meerut Mandi Samiti', price: '₹2,800 / Qtl (₹28/kg)', msp: 'N/A (Perishable)', diff: '+12.4% this week', demand: '📈 Heavy Demand', action: 'List Crates' },
                { crop: '🌿 Long Staple Bt Cotton', mandi: 'Bathinda / Sirsa Market', price: '₹7,150 / Qtl', msp: '₹6,620 / Qtl', diff: '+₹530 (+8.0%)', demand: '🟢 Steady APMC Flow', action: 'View Bids' },
                { crop: '🌱 Mustard (Pusa Bold)', mandi: 'Bharatpur Oilseeds Yard', price: '₹5,450 / Qtl', msp: '₹5,650 / Qtl', diff: '-₹200 (-3.5%)', demand: '🟡 Moderate Inflow', action: 'Price Watch' }
              ].map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid rgba(22, 51, 38, 0.06)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#163326' }}>{row.crop}</td>
                  <td style={{ padding: '12px 14px', color: '#688273' }}>{row.mandi}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2d6a4f', fontSize: '0.94rem' }}>{row.price}</td>
                  <td style={{ padding: '12px 14px', color: '#688273' }}>{row.msp}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: row.diff.startsWith('+') ? '#15803d' : '#b45309' }}>
                    {row.diff}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#163326' }}>
                    {row.demand}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate('create-product')}
                      style={{
                        background: '#edf6f0',
                        color: '#2d6a4f',
                        border: '1px solid rgba(45, 106, 79, 0.2)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. UPCOMING 7-DAY FARM OPERATIONS & ACTION SCHEDULE */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#163326', margin: 0 }}>
              {t('farmer.sevenDayTitle', '7-Day Farm Operations & Action Schedule')}
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#688273' }}>
              {t('farmer.sevenDaySub', 'Automated agronomic checklist synchronized with upcoming 4-day rainfall arrival:')}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { day: 'Today (Saturday)', badge: t('farmer.safeWindow', 'SAFE WINDOW'), bg: '#edf6f0', color: '#2d6a4f', task: 'Morning bio-spray window is safe (calm wind 8.4 km/h). Inspect tomato vines.' },
            { day: 'Tomorrow (Sunday)', badge: t('farmer.harvestToday', 'HARVEST TODAY'), bg: '#fef3c7', color: '#b45309', task: 'Harvest mature breaker-stage tomatoes; clear furrow ends before downpour.' },
            { day: 'Monday (Day 3)', badge: t('farmer.preRainUrea', 'PRE-RAIN UREA'), bg: '#e0f2fe', color: '#0369a1', task: 'Hold foliar spray; apply top-dressing Urea on wheat 24h before rainfall.' },
            { day: 'Tuesday (Day 4)', badge: t('farmer.rainArrival', '🚨 RAIN ARRIVAL'), bg: '#fee2e2', color: '#dc2626', task: 'Rainfall expected (~19.4 mm). Postpone tube-well pumping to save diesel.' },
            { day: 'Thursday (Post-Rain)', badge: t('farmer.diagnostics', 'DIAGNOSTICS'), bg: '#f3e8ff', color: '#7c3aed', task: 'Check cotton plots for boll rot spores; schedule Copper Oxychloride if required.' }
          ].map((item, sIdx) => (
            <div
              key={sIdx}
              style={{
                background: '#f8faf7',
                border: '1px solid rgba(22, 51, 38, 0.08)',
                borderRadius: '14px',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#163326' }}>
                  {item.day}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: item.color, background: item.bg, padding: '2px 6px', borderRadius: '4px' }}>
                  {item.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#4b6354', margin: 0, lineHeight: 1.45 }}>
                {item.task}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. COLOR GLOSSARY & STATUS LEGEND */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.08)',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '26px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '18px',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#163326' }}>
          <Info size={14} color="#2d6a4f" />
          <span>{t('farmer.legendTitle', 'Status Legend:')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2d6a4f', flexShrink: 0 }} />
          <span><strong style={{ color: '#163326' }}>{t('farmer.legendGreen', 'Green: Healthy / Safe Operations')}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
          <span><strong style={{ color: '#163326' }}>{t('farmer.legendPurple', 'Purple: AI Advisory Signals')}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
          <span><strong style={{ color: '#163326' }}>{t('farmer.legendBlue', 'Blue: Meteorology & Irrigation')}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          <span><strong style={{ color: '#163326' }}>{t('farmer.legendAmber', 'Amber: Harvest & Mandi Window')}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
          <span><strong style={{ color: '#163326' }}>{t('farmer.legendCrimson', 'Crimson: Critical Risk Alert')}</strong></span>
        </div>
      </div>

      {/* 9. QUICK ACTIONPAD TILES */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#163326', marginBottom: '14px' }}>
          {t('farmer.actionpadTitle', 'Quick Actionpad & Farm Workspaces')}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}>
          {[
            { id: 'create-product', label: t('farmer.addProduct', 'Add a Product'), icon: <Plus size={20} />, desc: 'Publish harvest batch to buyers', color: '#2d6a4f', bg: '#edf6f0' },
            { id: 'crops-recommend', label: t('farmer.cropAdvisory', 'Crop Advisory'), icon: <Zap size={20} />, desc: 'Soil map & climate recommendations', color: '#7c3aed', bg: '#f3e8ff' },
            { id: 'weather', label: t('nav.weather', 'Weather Center'), icon: <CloudSun size={20} />, desc: '7-day radar & crop protection', color: '#0284c7', bg: '#e0f2fe' },
            { id: 'market', label: t('nav.market', 'Live Mandi Bhav & Prices'), icon: <TrendingUp size={20} />, desc: 'Live APMC market rates across India', color: '#d97706', bg: '#fef3c7' },
            { id: 'orders', label: t('nav.orders', 'Orders Received'), icon: <Package size={20} />, desc: 'Track buyer dispatch & payouts', color: '#059669', bg: '#d1fae5' },
            { id: 'farms', label: t('nav.farms', 'Farm Management'), icon: <Layers size={20} />, desc: 'Manage plots & soil records', color: '#4b5563', bg: '#f3f4f6' }
          ].map(tile => (
            <div
              key={tile.id}
              onClick={() => onNavigate(tile.id)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(22, 51, 38, 0.1)',
                borderRadius: '16px',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tile.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: tile.bg,
                color: tile.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                {tile.icon}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#163326' }}>
                {tile.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#688273', marginTop: '2px', lineHeight: 1.35 }}>
                {tile.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
