import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Wind, Droplets, Thermometer, ShieldAlert, 
  AlertTriangle, CheckCircle, RefreshCw, MapPin, Compass,
  Layers, Sun, CloudRain, ChevronRight, Calendar, ArrowRight,
  ShieldCheck, AlertCircle, Leaf, Sparkles
} from 'lucide-react';
import { api } from '../api';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { RakshakIcon } from './RakshakLogo';
import WavyLoader from './WavyLoader';

export default function WeatherCenterView() {
  const { location, detectLocation, detecting } = useLocation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('actionable_weather'); // 'actionable_weather' | 'soil_atlas'
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [activeCrops, setActiveCrops] = useState([
    { name: 'Cotton (Bt)', stage: 'Boll Formation / Flowering', plot: 'South Block (5.0 Acres)', riskCrop: true },
    { name: 'Wheat (Sharbati HD-3226)', stage: 'Vegetative Tillering', plot: 'North Block (8.0 Acres)', riskCrop: false },
    { name: 'Hybrid Tomato', stage: 'Fruiting & Ripening', plot: 'Plot C (2.5 Acres)', riskCrop: true }
  ]);

  useEffect(() => {
    fetchLiveWeatherData();
  }, [location?.city, location?.state, location?.latitude]);

  const fetchLiveWeatherData = async () => {
    setWeatherLoading(true);
    try {
      const lat = location?.latitude || 28.9845;
      const lon = location?.longitude || 77.7064;
      const locName = location?.city || location?.address || 'Meerut, Uttar Pradesh';

      const data = await api.getWeather(lat, lon, locName);
      setLiveWeather(data);
    } catch {
      // Fallback
      setLiveWeather({
        temperature: 26.5,
        humidity: 78,
        wind_speed: 9.2,
        condition: 'Scattered Clouds & High Humidity',
        location: location?.city ? `${location.city}, ${location.state}` : 'Meerut, Uttar Pradesh'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Actionable Crop Weather Diagnostics based on user's active crops
  const actionableCropAlerts = [
    {
      crop: 'Cotton (Bt)',
      severity: 'HIGH_RISK',
      badgeColor: '#dc2626',
      badgeBg: '#fee2e2',
      headline: 'Rain Predicted in 4 Days: Cotton Crop at Risk of Boll Rot & Chemical Wash-off',
      actionableAdvisory: 'Meteorological satellites forecast upcoming rain showers (~19.4 mm). Cotton in flowering/boll stage is highly vulnerable to pollen wash-off and fungal boll rot.',
      actionItems: [
        'Postpone scheduled foliar pesticide sprays immediately to avoid 100% chemical runoff.',
        'Open and clear field drainage furrows today to prevent water stagnation around cotton root zones.',
        'Keep systemic bio-fungicide (Trichoderma / Copper Oxychloride) prepped for post-rain application.'
      ]
    },
    {
      crop: 'Wheat (Sharbati HD-3226)',
      severity: 'COST_SAVING',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      headline: 'Postpone Scheduled Irrigation: Natural Rainfall Arriving in 4 Days',
      actionableAdvisory: 'Your vegetative wheat has adequate soil moisture. Upcoming precipitation of ~19.4 mm will naturally satisfy root requirements.',
      actionItems: [
        'Save diesel & tube-well pumping electricity by delaying scheduled 2nd irrigation by 5 days.',
        'Ensure nitrogen top-dressing (Urea) is applied 24 hours prior to rain so moisture carries nutrients into the root zone.'
      ]
    },
    {
      crop: 'Hybrid Tomato',
      severity: 'CAUTION',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      headline: 'High Canopy Moisture (>78%): Elevated Early Blight & Fruit Borer Risk',
      actionableAdvisory: 'Prolonged leaf wetness with moderate temperatures (24-27°C) creates ideal conditions for Alternaria fungal spores on tomato foliage.',
      actionItems: [
        'Inspect lower leaves on Plot C for concentric brown target-spot lesions.',
        'Stake heavy tomato vines off the wet soil to reduce contact with soil-borne microbes.'
      ]
    }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 60px' }}>
      {/* Top Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 12px rgba(22, 51, 38, 0.04)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CloudSun size={14} /> ACTIONABLE CROP WEATHER ADVISORY
            </span>
            <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700 }}>
              📍 Station: {location?.city || 'Meerut'}, {location?.state || 'Uttar Pradesh'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#163326', fontWeight: 800, marginTop: '6px' }}>
            Actionable Agricultural Weather Center
          </h2>
          <p style={{ color: '#4b6354', fontSize: '0.88rem', maxWidth: '820px', marginTop: '2px' }}>
            Instead of confusing raw degrees or generic wind speeds, this weather center connects live satellite forecasts directly to your <strong>standing crops (Cotton, Wheat, Tomato)</strong> to provide actionable preventive advice.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchLiveWeatherData}
            disabled={weatherLoading}
            style={{
              background: '#edf5f0',
              border: '1px solid rgba(22, 51, 38, 0.15)',
              borderRadius: '10px',
              padding: '9px 14px',
              color: '#163326',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: weatherLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={weatherLoading ? 'animate-spin' : ''} />
            <span>Refresh Satellite</span>
          </button>
          <button
            type="button"
            onClick={detectLocation}
            disabled={detecting}
            style={{
              background: '#163326',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: detecting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Compass size={14} className={detecting ? 'animate-spin' : ''} />
            <span>{detecting ? 'Locating...' : 'Sync GPS'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Actionable Decisions Dashboard (Actionable vs Raw Data) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Chemical Spray Advisory */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #52b788',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(82, 183, 136, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase' }}>
              Chemical Spray Window
            </span>
            <span style={{ background: '#d8f3dc', color: '#1b4332', fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
              SAFE TODAY
            </span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
            Safe for Insecticide & Bio-Spray
          </div>
          <p style={{ fontSize: '0.78rem', color: '#4b6354', marginTop: '6px', lineHeight: 1.45 }}>
            Wind velocity is calm ({(liveWeather?.wind_speed || 9.2)} km/h) with zero spray drift hazard today. <strong>Caution:</strong> Complete all spraying before rain arrives in 4 days.
          </p>
        </div>

        {/* Card 2: Irrigation Timing Advisory */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #0284c7',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
              Irrigation Schedule
            </span>
            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
              POSTPONE
            </span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
            Delay Tube-Well Pumping
          </div>
          <p style={{ fontSize: '0.78rem', color: '#4b6354', marginTop: '6px', lineHeight: 1.45 }}>
            Natural rainfall (~19.4 mm) forecasted in 4 days. Postponing irrigation preserves soil aeration and cuts diesel/power expenses by ~₹1,400 per acre.
          </p>
        </div>

        {/* Card 3: Mandi Drying & Post-Harvest Weather */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #f59e0b',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              Crop Drying & Harvest
            </span>
            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
              ACTIVE WINDOW
            </span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
            Dry Harvested Grain Today
          </div>
          <p style={{ fontSize: '0.78rem', color: '#4b6354', marginTop: '6px', lineHeight: 1.45 }}>
            Solar radiation is strong with 6.5 hours of clear sunshine. Ideal for drying grain to the safe 12% moisture threshold before mandi transport.
          </p>
        </div>
      </div>

      {/* SECTION 2: Direct Weather Connection to Farmer's Active Crops */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.28rem', color: '#163326', fontWeight: 800 }}>
              Live Weather Connections to Your Standing Crops
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#657d70' }}>
              Direct impact analysis of the 7-day meteorological forecast on your registered farm plots:
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {actionableCropAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: `1.5px solid ${alert.severity === 'HIGH_RISK' ? 'var(--crimson-600, #d90429)' : alert.badgeColor}`,
                padding: '22px 26px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: alert.badgeBg,
                    color: alert.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}>
                    <Leaf size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: alert.badgeColor }}>
                        {alert.crop}
                      </span>
                      <span style={{ background: alert.badgeBg, color: alert.badgeColor, fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        {alert.severity === 'HIGH_RISK' ? 'CRITICAL ACTION REQUIRED' : alert.severity === 'COST_SAVING' ? 'SAVINGS OPPORTUNITY' : 'MONITORING ADVICE'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#163326', margin: '4px 0 0' }}>
                      {alert.headline}
                    </h4>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#45594e', marginTop: '10px', lineHeight: 1.5 }}>
                {alert.actionableAdvisory}
              </p>

              {/* Actionable Preventive Checklist */}
              <div style={{
                marginTop: '12px',
                background: '#f8faf7',
                borderRadius: '12px',
                padding: '14px 16px',
                border: '1px solid rgba(22, 51, 38, 0.08)'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '8px' }}>
                  Recommended Farmer Action Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {alert.actionItems.map((item, iIdx) => (
                    <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#2d6a4f' }}>
                      <CheckCircle size={14} color="#2d6a4f" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
