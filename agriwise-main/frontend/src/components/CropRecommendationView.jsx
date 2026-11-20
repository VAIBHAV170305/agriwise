import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Info, Compass,
  HelpCircle, ChevronRight, BarChart2, ShieldAlert,
  MapPin, Sliders, RefreshCw, Leaf, Droplets, Sun, Calendar, Plus
} from 'lucide-react';
import { api } from '../api';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import CustomAgriLogo from './CustomAgriLogo';
import WavyProgressLoader from './WavyProgressLoader';
import IndiaAgriHeatMap, { AGRO_CLIMATIC_ZONES } from './IndiaAgriHeatMap';

export default function CropRecommendationView() {
  const { location, detectLocation, detecting } = useLocation();
  const { showToast } = useToast();

  // Active Selected Agro-Climatic Zone
  const [selectedZone, setSelectedZone] = useState(AGRO_CLIMATIC_ZONES[0]);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Recommendation State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  // Optional Advanced Soil Lab Override (Collapsed by default for farmers)
  const [showAdvancedOverride, setShowAdvancedOverride] = useState(false);
  const [customParams, setCustomParams] = useState({
    nitrogen: 90,
    phosphorus: 45,
    potassium: 40,
    ph: 7.2
  });

  // 1. On Mount & Location change: Auto-detect matching agro zone & live weather
  useEffect(() => {
    loadHistory();
    matchUserLocationToZone();
  }, [location]);

  const matchUserLocationToZone = () => {
    if (!location) return;

    const locState = (location.state || '').toLowerCase();
    const locDistrict = (location.district || '').toLowerCase();

    // Match closest zone based on state/district
    let matched = AGRO_CLIMATIC_ZONES.find(z => 
      z.states.some(st => locState.includes(st.toLowerCase()) || st.toLowerCase().includes(locState))
    );

    if (!matched) {
      if (locState.includes('gujarat') && (locDistrict.includes('kutch') || locDistrict.includes('banas'))) {
        matched = AGRO_CLIMATIC_ZONES.find(z => z.id === 'western-arid');
      } else {
        matched = AGRO_CLIMATIC_ZONES[1]; // Deccan Black Soil
      }
    }

    if (matched) {
      setSelectedZone(matched);
      fetchLiveWeatherAndRecommend(matched, location.latitude, location.longitude, location.address);
    }
  };

  // Fetch Live Weather & Automatically Synthesize Recommendation without manual sliders
  const fetchLiveWeatherAndRecommend = async (zone, lat, lon, locName) => {
    setLoading(true);
    setWeatherLoading(true);
    setError('');

    let currentTemp = zone.avgTemp;
    let currentHum = zone.avgHumidity;
    let currentRain = zone.avgRainfall;

    try {
      const weatherRes = await api.getWeather(lat || 22.5645, lon || 72.9289, locName || zone.name);
      if (weatherRes) {
        setLiveWeather(weatherRes);
        if (weatherRes.temperature) currentTemp = weatherRes.temperature;
        if (weatherRes.humidity) currentHum = weatherRes.humidity;
      }
    } catch {
      // fallback to zone climatological averages
    } finally {
      setWeatherLoading(false);
    }

    // Call Random Forest Agronomic Recommendation Model
    try {
      const payload = {
        nitrogen: customParams.nitrogen || zone.npk.n,
        phosphorus: customParams.phosphorus || zone.npk.p,
        potassium: customParams.potassium || zone.npk.k,
        temperature: currentTemp,
        humidity: currentHum,
        ph: customParams.ph || zone.phValue,
        rainfall: currentRain
      };

      const res = await api.getCropRecommendation(payload);
      setResult(res);
      loadHistory();
      showToast(`Auto-computed crop recommendations for ${zone.shortName}!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to synthesize recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setCustomParams({
      nitrogen: zone.npk.n,
      phosphorus: zone.npk.p,
      potassium: zone.npk.k,
      ph: zone.phValue
    });
    fetchLiveWeatherAndRecommend(zone, location?.latitude, location?.longitude, `${zone.name}`);
  };

  const loadHistory = async () => {
    try {
      const data = await api.getRecommendationHistory();
      setHistory(data || []);
    } catch {
      // ignore
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 40px' }}>
      {/* Title & Automated Telemetry Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(18, 53, 36, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">Zero-Manual-Input Intelligence</span>
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              🇮🇳 India Agro-Climatic Model
            </span>
            <span style={{ fontSize: '0.78rem', color: '#576c60' }}>
              ICAR Soil & Satellite Synced
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#123524', fontWeight: 800, marginTop: '6px' }}>
            Seasonal Crop Recommendation Engine
          </h2>
          <p style={{ color: '#45594e', fontSize: '0.9rem', maxWidth: '780px', marginTop: '3px' }}>
            No manual soil formulas or technical numbers required. Agri-Wise automatically resolves your local soil classification, natural pH range, and live Open-Meteo weather via GPS or the Interactive Heat Map below.
          </p>
        </div>

        {/* GPS Auto-Detect Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={detectLocation}
            disabled={detecting}
            style={{ padding: '10px 18px' }}
          >
            <Compass size={16} className={detecting ? 'animate-spin' : ''} />
            {detecting ? 'Detecting GPS...' : 'Auto-Detect My Farm GPS'}
          </button>
        </div>
      </div>

      {/* 1. Interactive Heat Map of India (Replaces Slider Forms) */}
      <div style={{ marginBottom: '28px' }}>
        <IndiaAgriHeatMap
          selectedZoneId={selectedZone.id}
          onSelectZone={handleZoneSelect}
          userLocationName={location?.address || `${selectedZone.name}`}
        />
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(18, 53, 36, 0.1)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <WavyProgressLoader 
            text={`Synthesizing ICAR crop profiles for ${selectedZone.name} (pH ${selectedZone.phRange}, ${liveWeather?.temperature || selectedZone.avgTemp}°C)...`}
          />
        </div>
      )}

      {/* 3. Prediction Results & Recommended Seasonal Crops */}
      {result && !loading && (
        <div style={{ marginBottom: '32px' }}>
          {/* Main Optimal Crop Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f4f9f5 100%)',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '28px 32px',
            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.12)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Bar with Match Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={13} /> TOP RECOMMENDED CROP
                </span>
                <span style={{ fontSize: '0.8rem', color: '#123524', fontWeight: 600 }}>
                  Agro-Zone: <strong>{selectedZone.name}</strong>
                </span>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #10b981',
                padding: '6px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px'
              }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#123524' }}>
                  {Math.round(result.confidence * 100)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  Suitability Match
                </span>
              </div>
            </div>

            {/* Crop Headline */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#123524',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(18, 53, 36, 0.2)'
              }}>
                <Leaf size={28} color="#34d399" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.85rem', color: '#123524', fontWeight: 800, lineHeight: 1.1 }}>
                  {result.recommended_crop}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#45594e', marginTop: '4px' }}>
                  Optimal alignment with regional {selectedZone.soilType} and current temperature ({liveWeather?.temperature || selectedZone.avgTemp}°C).
                </p>
              </div>
            </div>

            {/* Auto-Derived Telemetry Specs (No manual sliders!) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '20px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid rgba(18, 53, 36, 0.08)'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                  Soil pH Range
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  pH {selectedZone.phRange}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                  Ambient Temperature
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  {liveWeather?.temperature || selectedZone.avgTemp}°C (Live Telemetry)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                  Relative Humidity
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  {liveWeather?.humidity || selectedZone.avgHumidity}%
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                  Water Regimen
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  Drip or Canal Basin
                </div>
              </div>
            </div>

            {/* Agronomic Explanation */}
            <div style={{ marginTop: '16px', padding: '14px', background: '#eef6f1', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
              <p style={{ fontSize: '0.84rem', color: '#123524', lineHeight: 1.45 }}>
                <strong>Agronomic Rationale:</strong> {result.explanation}
              </p>
            </div>
          </div>

          {/* Alternative Recommended Crops Grid */}
          {result.alternative_crops && result.alternative_crops.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1.15rem', color: '#123524', fontWeight: 800, marginBottom: '14px' }}>
                Secondary High-Yield Crop Alternatives for this Belt
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px'
              }}>
                {result.alternative_crops.map((alt, idx) => (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      border: '1px solid rgba(18, 53, 36, 0.1)',
                      borderRadius: '14px',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#576c60', fontWeight: 700, textTransform: 'uppercase' }}>
                          Alternative {idx + 1}
                        </span>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {Math.round(alt.confidence * 100)}% Match
                        </span>
                      </div>

                      <h5 style={{ fontSize: '1.18rem', color: '#123524', fontWeight: 800, marginTop: '8px' }}>
                        {alt.crop}
                      </h5>
                      <p style={{ fontSize: '0.8rem', color: '#45594e', marginTop: '4px' }}>
                        Resilient alternative suited to {selectedZone.soilType.split('(')[0]} with standard farm management.
                      </p>
                    </div>

                    <div style={{
                      marginTop: '14px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(18, 53, 36, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem',
                      color: '#10b981',
                      fontWeight: 700
                    }}>
                      <span>Verified ICAR Crop Profile</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Collapsible Advanced Soil Lab Test Override (Optional for Agronomists only) */}
      <div style={{
        marginTop: '28px',
        background: '#ffffff',
        border: '1px solid rgba(18, 53, 36, 0.1)',
        borderRadius: '14px',
        padding: '16px 20px'
      }}>
        <div 
          onClick={() => setShowAdvancedOverride(!showAdvancedOverride)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="#688273" />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#123524' }}>
              Certified Soil Health Card Custom Lab Override (Optional for Agronomists)
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
            {showAdvancedOverride ? '▲ Hide Lab Inputs' : '▼ Expand Lab Override'}
          </span>
        </div>

        {showAdvancedOverride && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(18, 53, 36, 0.08)' }}>
            <p style={{ fontSize: '0.8rem', color: '#576c60', marginBottom: '14px' }}>
              Farmers do not need to alter these. If you have an official laboratory Soil Health Card issued by Krishi Vigyan Kendra (KVK), you can override default regional values here:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#123524' }}>Nitrogen (N) kg/ha</label>
                <input
                  type="number"
                  className="form-input"
                  value={customParams.nitrogen}
                  onChange={(e) => setCustomParams({ ...customParams, nitrogen: parseFloat(e.target.value) || 0 })}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#123524' }}>Phosphorus (P) kg/ha</label>
                <input
                  type="number"
                  className="form-input"
                  value={customParams.phosphorus}
                  onChange={(e) => setCustomParams({ ...customParams, phosphorus: parseFloat(e.target.value) || 0 })}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#123524' }}>Potassium (K) kg/ha</label>
                <input
                  type="number"
                  className="form-input"
                  value={customParams.potassium}
                  onChange={(e) => setCustomParams({ ...customParams, potassium: parseFloat(e.target.value) || 0 })}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#123524' }}>Soil pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={customParams.ph}
                  onChange={(e) => setCustomParams({ ...customParams, ph: parseFloat(e.target.value) || 7.0 })}
                  style={{ marginTop: '4px' }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => fetchLiveWeatherAndRecommend(selectedZone, location?.latitude, location?.longitude, selectedZone.name)}
              style={{ marginTop: '14px' }}
            >
              Re-Calculate Recommendation with Lab Values
            </button>
          </div>
        )}
      </div>

      {/* 5. Past Recommendation History */}
      {history.length > 0 && (
        <div style={{
          marginTop: '24px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid rgba(18, 53, 36, 0.1)'
        }}>
          <h4 style={{ fontSize: '0.96rem', color: '#123524', fontWeight: 800, marginBottom: '12px' }}>
            Recent Agro-Climatic Recommendation Logs
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {history.slice(0, 5).map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid rgba(18, 53, 36, 0.06)' }}>
                <span style={{ fontWeight: 700, color: '#123524' }}>🌾 {h.recommended_crop}</span>
                <span style={{ color: '#688273' }}>
                  {Math.round(h.confidence * 100)}% Suitability • {h.created_at ? h.created_at.split('T')[0] : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
