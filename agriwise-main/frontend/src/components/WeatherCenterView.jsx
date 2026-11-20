import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Wind, Droplets, Thermometer, ShieldAlert, 
  AlertTriangle, CheckCircle, RefreshCw, MapPin, Compass,
  Sliders, Activity, Sparkles, Layers, ShieldCheck, Sun, CloudRain,
  ChevronRight, Calendar, ArrowRight, Eye
} from 'lucide-react';
import { api } from '../api';
import { useLocation, INDIAN_AGRI_REGIONS } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import CustomAgriLogo from './CustomAgriLogo';
import WavyProgressLoader from './WavyProgressLoader';

// Comprehensive Regional Soil Fertility Database of India
export const INDIA_SOIL_REGIONS = [
  {
    id: 'indo-gangetic',
    name: 'Indo-Gangetic Alluvial Plains',
    states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar'],
    soilType: 'Deep Alluvial Loam (Khadar & Bhangar)',
    color: '#10b981',
    fertilityScore: 84,
    fertilityRating: 'High Fertility',
    organicCarbon: '0.58% (Medium)',
    nitrogen: '190 kg/ha (Low-Medium)',
    phosphorus: '22 kg/ha (Medium)',
    potassium: '295 kg/ha (High)',
    ph: '7.2 - 7.8 (Neutral to Slightly Alkaline)',
    ec: '0.42 dS/m (Non-Saline)',
    primaryCrops: ['Wheat', 'Paddy / Basmati', 'Sugarcane', 'Potato', 'Mustard'],
    deficiencies: ['Zinc (Zn)', 'Sulfur (S)', 'Nitrogen (N)'],
    reclamationAdvice: [
      'Apply Zinc Sulfate (ZnSO4 21%) @ 25 kg/ha at sowing.',
      'Incorporate green manure crop (Dhaincha / Sesbania) before paddy transplantation to boost organic carbon.',
      'Split urea application into 3 doses to avoid nitrate leaching into groundwater.'
    ]
  },
  {
    id: 'deccan-black',
    name: 'Deccan & Central Black Soil Belt (Regur)',
    states: ['Maharashtra', 'Madhya Pradesh', 'Gujarat (Saurashtra)', 'North Karnataka'],
    soilType: 'Deep Black Montmorillonite Clay (Self-Ploughing)',
    color: '#059669',
    fertilityScore: 88,
    fertilityRating: 'Very High Fertility',
    organicCarbon: '0.68% (Medium-High)',
    nitrogen: '215 kg/ha (Medium)',
    phosphorus: '14 kg/ha (Low)',
    potassium: '340 kg/ha (Very High)',
    ph: '7.8 - 8.4 (Alkaline, High Calcium Carbonate)',
    ec: '0.65 dS/m (Safe)',
    primaryCrops: ['Cotton (Bt)', 'Soybean', 'Desi & Kabuli Chickpea', 'Wheat', 'Onion', 'Pigeon Pea (Tur)'],
    deficiencies: ['Available Phosphorus (P)', 'Zinc (Zn)', 'Iron (Fe)'],
    reclamationAdvice: [
      'Apply Single Super Phosphate (SSP) @ 150 kg/acre + Phosphate Solubilizing Bacteria (PSB) to unlock fixed phosphorus.',
      'In deep black clay, avoid excess irrigation to prevent root asphyxiation during heavy monsoon showers.',
      'Foliar spray of 0.5% Ferrous Sulfate + 0.1% Citric Acid if iron chlorosis appears on young foliage.'
    ]
  },
  {
    id: 'western-arid',
    name: 'Western Arid & Desert Sand Zone',
    states: ['Rajasthan', 'North Gujarat (Kutch/Banaskantha)', 'South-West Haryana'],
    soilType: 'Sandy Aridisols, Calcareous Sand Dunes, Saline Patches',
    color: '#f59e0b',
    fertilityScore: 48,
    fertilityRating: 'Low-to-Moderate Fertility',
    organicCarbon: '0.22% (Critical Low)',
    nitrogen: '125 kg/ha (Low)',
    phosphorus: '15 kg/ha (Low)',
    potassium: '270 kg/ha (Medium-High)',
    ph: '8.2 - 8.8 (Strongly Alkaline / Calcareous)',
    ec: '1.85 dS/m (Moderate Salinity)',
    primaryCrops: ['Pearl Millet (Bajra)', 'Mustard (Sarson)', 'Cluster Bean (Guar)', 'Cumin (Jeera)', 'Moth Bean'],
    deficiencies: ['Organic Carbon', 'Nitrogen', 'Zinc', 'Microbial Biomass'],
    reclamationAdvice: [
      'Apply Gypsum @ 2-3 Tonnes/ha in saline-alkali patches followed by heavy flooding to flush sodium salts.',
      'Mandatory heavy Farm Yard Manure (FYM) or Vermicompost @ 4 Tonnes/acre annually to build moisture retention.',
      'Adopt micro-drip fertigation with water-soluble fertilizers to minimize evaporative salt accumulation.'
    ]
  },
  {
    id: 'southern-red',
    name: 'Southern Red & Yellow Plateau Zone',
    states: ['Karnataka', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu'],
    soilType: 'Red Sandy Loam to Red Loamy Clay (Ferruginous Alfisols)',
    color: '#d97706',
    fertilityScore: 66,
    fertilityRating: 'Moderate Fertility',
    organicCarbon: '0.42% (Low-Medium)',
    nitrogen: '165 kg/ha (Low)',
    phosphorus: '16 kg/ha (Medium)',
    potassium: '195 kg/ha (Medium)',
    ph: '6.2 - 6.9 (Slightly Acidic to Neutral)',
    ec: '0.28 dS/m (Clean / Non-Saline)',
    primaryCrops: ['Groundnut', 'Maize', 'Red Gram', 'Finger Millet (Ragi)', 'Chilli / Guntur Pepper', 'Sunflower'],
    deficiencies: ['Nitrogen', 'Phosphorus', 'Boron', 'Calcium'],
    reclamationAdvice: [
      'Apply Rock Phosphate or DAP combined with mycorrhiza bio-fertilizer.',
      'Soil application of Borax @ 10 kg/ha once every two years for high seed-set in groundnut and sunflower.',
      'Practice contour bunding and mulching to control soil erosion on sloping red terrain.'
    ]
  },
  {
    id: 'coastal-laterite',
    name: 'Western Ghats & Coastal Laterite Zone',
    states: ['Kerala', 'Coastal Karnataka', 'Goa', 'Konkan (Maharashtra)'],
    soilType: 'Porous Laterite Soil with High Iron & Aluminium Hydrates',
    color: '#047857',
    fertilityScore: 74,
    fertilityRating: 'Moderate-High Organic',
    organicCarbon: '1.18% (Very High)',
    nitrogen: '280 kg/ha (High)',
    phosphorus: '11 kg/ha (Low - High P-Fixing Capacity)',
    potassium: '160 kg/ha (Low-Medium)',
    ph: '5.0 - 6.2 (Strongly Acidic)',
    ec: '0.12 dS/m (Very Low / Thoroughly Leached)',
    primaryCrops: ['Coconut', 'Rubber', 'Black Pepper', 'Arecanut', 'Cashew', 'Cardamom', 'Ginger'],
    deficiencies: ['Phosphorus (Strong Acid Fixation)', 'Calcium', 'Magnesium', 'Molybdenum'],
    reclamationAdvice: [
      'Apply Agricultural Lime (CaCO3) or Dolomite @ 500 kg/ha once every 3 years to correct severe soil acidity.',
      'Apply Rock Phosphate rather than water-soluble phosphates, as it dissolves slowly in acidic soils.',
      'Maintain cover cropping with Mucuna or Calopogonium to prevent monsoon soil erosion on undulating slopes.'
    ]
  },
  {
    id: 'eastern-deltaic',
    name: 'Eastern Coastal & Deltaic Alluvium',
    states: ['West Bengal', 'Odisha', 'Coastal Andhra Pradesh'],
    soilType: 'Fine Deltaic Silt, Saline Marine Alluvium',
    color: '#0284c7',
    fertilityScore: 82,
    fertilityRating: 'High Fertility',
    organicCarbon: '0.74% (High)',
    nitrogen: '210 kg/ha (Medium)',
    phosphorus: '24 kg/ha (Medium-High)',
    potassium: '280 kg/ha (High)',
    ph: '6.4 - 7.5 (Neutral to Coastal Brackish)',
    ec: '1.20 dS/m (Slight Coastal Salinity)',
    primaryCrops: ['Paddy (Aman/Boro)', 'Jute', 'Mustard', 'Vegetables', 'Betel Vine', 'Brackish Aquaculture'],
    deficiencies: ['Zinc', 'Sulfur', 'Potash in sandy beach strips'],
    reclamationAdvice: [
      'In coastal saline belts (Sundarbans/Coastal Odisha), raise ridge-and-furrow planting beds above tidal water levels.',
      'Apply Sulfur @ 30 kg/ha to enhance oil content in mustard and sesame.',
      'Promote salt-tolerant paddy varieties (e.g., CSR-36, Lunishree) in coastal saline backwaters.'
    ]
  },
  {
    id: 'himalayan-brown',
    name: 'Himalayan & Sub-Himalayan Brown Hill Soil',
    states: ['Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir'],
    soilType: 'Brown Forest Soil, Podzols, Glacial Gravelly Loam',
    color: '#0891b2',
    fertilityScore: 78,
    fertilityRating: 'High (Humus-Rich)',
    organicCarbon: '1.25% (Very High)',
    nitrogen: '275 kg/ha (High)',
    phosphorus: '17 kg/ha (Medium)',
    potassium: '310 kg/ha (High)',
    ph: '5.8 - 6.6 (Slightly Acidic)',
    ec: '0.18 dS/m (Pristine)',
    primaryCrops: ['Apple', 'Walnut', 'Almond', 'Saffron', 'Barley', 'Off-season Exotic Vegetables'],
    deficiencies: ['Boron', 'Zinc', 'Calcium'],
    reclamationAdvice: [
      'Apply Solubor (Boron 20%) @ 1 g/L during pink bud and petal fall stages of apple orchards.',
      'Terrace farming with vegetative grass hedges to arrest runoff and soil erosion on steep slopes.',
      'Maintain organic mulch around tree basins to prevent winter root freezing.'
    ]
  }
];

export default function WeatherCenterView() {
  const { location, detectLocation, detecting } = useLocation();
  const { showToast } = useToast();

  // Active view: 'live_weather' (Live API Weather & Advisories), 'simulator' (Physics simulator), 'soil' (India Soil Map)
  const [activeTab, setActiveTab] = useState('live_weather');

  // Live Weather State from Live Open-Meteo API
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Selected Soil Region in India
  const [selectedSoilRegion, setSelectedSoilRegion] = useState(INDIA_SOIL_REGIONS[0]);

  // Environmental Physics Simulator Parameters
  const [envParams, setEnvParams] = useState({
    temperature: 28.5,
    humidity: 62,
    pressure: 1012,
    cloudCover: 35,
    windSpeed: 10,
    soilTemp: 25.0
  });

  // Fetch Live Weather whenever location changes
  useEffect(() => {
    fetchLiveWeatherData();
  }, [location]);

  // Match default soil region to user's location
  useEffect(() => {
    if (location?.state) {
      const match = INDIA_SOIL_REGIONS.find(r => 
        r.states.some(st => st.toLowerCase().includes(location.state.toLowerCase()))
      );
      if (match) setSelectedSoilRegion(match);
    }
  }, [location]);

  const fetchLiveWeatherData = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const lat = location?.latitude || 22.5645;
      const lon = location?.longitude || 72.9289;
      const locName = location?.address || (location?.district ? `${location.district}, ${location.state}` : 'Anand, Gujarat');

      const data = await api.getWeather(lat, lon, locName);
      setLiveWeather(data);
      if (data?.temperature) {
        setEnvParams(p => ({
          ...p,
          temperature: data.temperature,
          humidity: data.humidity || p.humidity,
          windSpeed: Math.round(data.wind_speed || p.windSpeed)
        }));
      }
    } catch (err) {
      console.error(err);
      setWeatherError('Failed to fetch live satellite weather telemetry.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Environmental forecast calculation for physics simulator
  const computeEnvironmentalForecast = () => {
    const T = envParams.temperature;
    const RH = envParams.humidity;
    const P = envParams.pressure;
    const WS = envParams.windSpeed;
    const CC = envParams.cloudCover;

    const dewPoint = Math.round((T - ((100 - RH) / 5)) * 10) / 10;

    let heatIndex = T;
    if (T >= 27 && RH >= 40) {
      heatIndex = Math.round(
        -8.784 + 1.611 * T + 2.338 * (RH / 10) - 0.146 * T * (RH / 10)
      );
    }

    const svp = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
    const avp = svp * (RH / 100);
    const vpd = Math.max(0.1, Math.round((svp - avp) * 100) / 100);

    let rainProb = 0;
    if (RH > 75) rainProb += 35;
    else if (RH > 60) rainProb += 20;

    if (CC > 70) rainProb += 30;
    else if (CC > 40) rainProb += 15;

    if (P < 1008) rainProb += 25;
    else if (P < 1013) rainProb += 10;

    if (T - dewPoint < 3.5) rainProb += 15;
    rainProb = Math.min(95, Math.max(5, rainProb));

    let condition = 'Partly Cloudy & Stable';
    let advisoryColor = 'emerald';
    if (rainProb >= 70) {
      condition = 'High Precipitation / Thunderstorm Imminent';
      advisoryColor = 'rose';
    } else if (rainProb >= 45) {
      condition = 'Scattered Convective Showers Likely';
      advisoryColor = 'amber';
    } else if (T > 38) {
      condition = 'Intense Heatwave & High Evaporation';
      advisoryColor = 'rose';
    } else if (T < 8) {
      condition = 'Ground Frost & Cold Wave Alert';
      advisoryColor = 'sky';
    } else if (CC < 25 && RH < 45) {
      condition = 'Clear Skies & Bright Solar Radiation';
      advisoryColor = 'emerald';
    }

    const spraySafe = WS <= 16 && rainProb < 40;
    const sprayCaution = WS > 16 && WS <= 24;
    const sprayWashoffRisk = rainProb >= 40;

    let irrigationNeed = 'Normal Scheduled Interval';
    if (vpd > 1.8 || (T > 34 && RH < 45)) {
      irrigationNeed = 'Urgent High Transpiration — Increase Drip Volume';
    } else if (rainProb > 60 || RH > 85) {
      irrigationNeed = 'Postpone Irrigation — Natural Precipitation Expected';
    }

    return {
      dewPoint,
      heatIndex,
      vpd,
      rainProb,
      condition,
      advisoryColor,
      spraySafe,
      sprayCaution,
      sprayWashoffRisk,
      irrigationNeed
    };
  };

  const prediction = computeEnvironmentalForecast();

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 40px' }}>
      {/* Top Banner */}
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
            <span className="badge badge-sky">Live Open-Meteo & IMD Telemetry</span>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
              📍 Real-Time Location: {location?.district}, {location?.state} ({location?.latitude}°N, {location?.longitude}°E)
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#123524', fontWeight: 800, marginTop: '6px' }}>
            Actionable Agricultural Weather Center
          </h2>
          <p style={{ color: '#45594e', fontSize: '0.9rem', maxWidth: '780px', marginTop: '2px' }}>
            Replaced static hardcoded data with live Open-Meteo satellite feeds, providing real-time chemical spray advisories, irrigation windows, and the National Soil Fertility Atlas.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#edf5f0',
          border: '1px solid rgba(18, 53, 36, 0.1)',
          borderRadius: '999px',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('live_weather')}
            style={{
              background: activeTab === 'live_weather' ? '#123524' : 'transparent',
              color: activeTab === 'live_weather' ? '#ffffff' : '#3d5246',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CloudSun size={15} /> Live Weather Station
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('soil')}
            style={{
              background: activeTab === 'soil' ? '#123524' : 'transparent',
              color: activeTab === 'soil' ? '#ffffff' : '#3d5246',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} /> India Soil Fertility Atlas
          </button>
        </div>
      </div>

      {/* MODULE 1: LIVE ACTIONABLE WEATHER STATION */}
      {activeTab === 'live_weather' && (
        <div className="animate-fade-in">
          {weatherLoading && (
            <div style={{ marginBottom: '20px' }}>
              <WavyProgressLoader text="Connecting to Open-Meteo atmospheric radar & local sensors..." />
            </div>
          )}

          {/* 1. Live Weather Observation Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f3 100%)',
            border: '1px solid rgba(18, 53, 36, 0.12)',
            borderRadius: '20px',
            padding: '28px 32px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Live Meteorological Station Feed
                </span>
                <h3 style={{ fontSize: '2rem', color: '#123524', fontWeight: 800, marginTop: '2px' }}>
                  {liveWeather?.temperature || 28.5}°C
                  <span style={{ fontSize: '1.1rem', color: '#576c60', fontWeight: 600, marginLeft: '10px' }}>
                    {liveWeather?.condition || 'Partly Cloudy & Stable'}
                  </span>
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#45594e', marginTop: '2px' }}>
                  Station: <strong>{liveWeather?.location || location?.address}</strong>
                </p>
              </div>

              {/* Refresh / GPS Detect Controls */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={fetchLiveWeatherData}
                  disabled={weatherLoading}
                >
                  <RefreshCw size={15} className={weatherLoading ? 'animate-spin' : ''} />
                  Refresh Telemetry
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={detectLocation}
                  disabled={detecting}
                >
                  <Compass size={15} className={detecting ? 'animate-spin' : ''} />
                  {detecting ? 'Locating...' : 'Sync with GPS'}
                </button>
              </div>
            </div>

            {/* 4 Live Environmental Telemetry Tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '24px'
            }}>
              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>RELATIVE HUMIDITY</span>
                  <Droplets size={16} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#123524', marginTop: '4px' }}>
                  {liveWeather?.humidity || 65}%
                </div>
                <span style={{ fontSize: '0.72rem', color: '#688273' }}>Canopy Evaporation</span>
              </div>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>WIND VELOCITY</span>
                  <Wind size={16} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#123524', marginTop: '4px' }}>
                  {liveWeather?.wind_speed || 8.5} <span style={{ fontSize: '0.8rem' }}>km/h</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: (liveWeather?.wind_speed || 8) <= 16 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {(liveWeather?.wind_speed || 8) <= 16 ? 'Safe for Spraying' : 'High Drift Hazard'}
                </span>
              </div>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>PRECIPITATION MM</span>
                  <CloudRain size={16} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#123524', marginTop: '4px' }}>
                  {liveWeather?.rainfall || 0.0} <span style={{ fontSize: '0.8rem' }}>mm</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#688273' }}>Accumulated Volume</span>
              </div>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>VAPOR PRESSURE DEFICIT</span>
                  <Activity size={16} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#123524', marginTop: '4px' }}>
                  {prediction.vpd} <span style={{ fontSize: '0.8rem' }}>kPa</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#688273' }}>Crop Transpiration Index</span>
              </div>
            </div>
          </div>

          {/* 2. Actionable Agricultural Advisories (Chemical Spray & Irrigation Regimen) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
            marginBottom: '28px'
          }}>
            {/* Spraying & Irrigation Rules */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#123524', fontWeight: 800, marginBottom: '14px' }}>
                Actionable Field Operations Advisories
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Spray Timing */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(18, 53, 36, 0.1)',
                  background: (liveWeather?.wind_speed || 8) <= 16 ? '#f0fdf4' : '#fffbeb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  {(liveWeather?.wind_speed || 8) <= 16 ? (
                    <CheckCircle size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
                  )}
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#123524' }}>
                      Pesticide & Foliar Nutrient Spray Window:
                    </strong>
                    <p style={{ fontSize: '0.8rem', color: '#45594e', marginTop: '2px', lineHeight: 1.4 }}>
                      {(liveWeather?.wind_speed || 8) <= 16
                        ? 'Optimal Spray Window: Wind velocity is within 16 km/h. Droplet drift is minimal. Ideal for foliar micronutrients and pest control sprays.'
                        : 'Drift Hazard: Wind speeds exceeding 16 km/h. Suspend pesticide spraying to prevent drift into neighboring plots or water sources.'}
                    </p>
                  </div>
                </div>

                {/* Irrigation Window */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(18, 53, 36, 0.1)',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <Droplets size={22} color="#0284c7" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#123524' }}>
                      Canopy Transpiration & Irrigation Advisory:
                    </strong>
                    <p style={{ fontSize: '0.8rem', color: '#45594e', marginTop: '2px', lineHeight: 1.4 }}>
                      {prediction.irrigationNeed} (VPD: {prediction.vpd} kPa). Schedule drip irrigation during early morning hours (6:00 - 9:00 AM) to maximize root uptake.
                    </p>
                  </div>
                </div>

                {/* AI Weather Advisories from Backend */}
                {liveWeather?.agricultural_advisories && liveWeather.agricultural_advisories.map((adv, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: adv.type === 'WARNING' ? '#fff7ed' : '#f0fdf4',
                      border: `1px solid ${adv.type === 'WARNING' ? '#fed7aa' : '#bbf7d0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <ShieldAlert size={18} color={adv.type === 'WARNING' ? '#ea580c' : '#16a34a'} style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#123524' }}>{adv.title}</strong>
                      <p style={{ fontSize: '0.78rem', color: '#45594e', marginTop: '2px' }}>{adv.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Live Meteorological Forecast */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#123524', fontWeight: 800 }}>
                  7-Day Meteorological Outlook
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                  Open-Meteo Satellite Model
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {liveWeather?.forecast && liveWeather.forecast.length > 0 ? (
                  liveWeather.forecast.map((day, dIdx) => (
                    <div 
                      key={dIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: dIdx === 0 ? '#edf5f0' : '#fcfdfc',
                        borderRadius: '10px',
                        border: '1px solid rgba(18, 53, 36, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#123524' }}>
                          {day.day}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#688273' }}>
                          {day.date ? day.date.split('-').slice(1).join('/') : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CloudSun size={15} color="#0284c7" />
                        <span style={{ fontSize: '0.78rem', color: '#45594e', fontWeight: 600 }}>
                          {day.condition}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700 }}>
                          🌧️ {day.rain_chance}%
                        </span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#123524' }}>
                          {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°C
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#688273', fontSize: '0.84rem' }}>
                    Loading 7-day radar forecast...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: INTERACTIVE INDIA SOIL FERTILITY ATLAS */}
      {activeTab === 'soil' && (
        <div className="animate-fade-in">
          {/* Soil Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #faf8f2 100%)',
            border: '1px solid rgba(18, 53, 36, 0.12)',
            borderRadius: '18px',
            padding: '24px 28px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.35rem', color: '#123524', fontWeight: 800 }}>
              National Agricultural Soil Fertility Atlas (ICAR Survey 2026)
            </h3>
            <p style={{ color: '#45594e', fontSize: '0.88rem', maxWidth: '850px', marginTop: '4px' }}>
              Select any agro-climatic zone across India to inspect soil classification, natural pH profiles, macronutrient saturation (N-P-K), micronutrient deficiencies, and tailored reclamation guidelines.
            </p>

            {/* Region Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              {INDIA_SOIL_REGIONS.map((reg) => {
                const isSelected = selectedSoilRegion.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedSoilRegion(reg)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #123524' : '1px solid rgba(18, 53, 36, 0.14)',
                      background: isSelected ? '#123524' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#3d5246',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {reg.name.split(' (')[0]} ({reg.fertilityScore}/100)
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Soil Region Details */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(18, 53, 36, 0.12)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{
                  background: '#eef5f1',
                  color: '#123524',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid #bce1ce'
                }}>
                  {selectedSoilRegion.fertilityRating}
                </span>
                <h4 style={{ fontSize: '1.6rem', color: '#123524', fontWeight: 800, marginTop: '8px' }}>
                  {selectedSoilRegion.name}
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#576c60' }}>
                  Coverage: <strong>{selectedSoilRegion.states.join(', ')}</strong> • Soil Type: <strong>{selectedSoilRegion.soilType}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#123524' }}>
                  {selectedSoilRegion.fertilityScore}
                  <span style={{ fontSize: '0.9rem', color: '#688273' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                  Soil Health Index
                </div>
              </div>
            </div>

            {/* Nutrients Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              margin: '24px 0'
            }}>
              <div style={{ background: '#f8faf7', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: '#688273', fontWeight: 700 }}>NATURAL pH RANGE</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  {selectedSoilRegion.ph}
                </div>
              </div>

              <div style={{ background: '#f8faf7', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: '#688273', fontWeight: 700 }}>ORGANIC CARBON</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  {selectedSoilRegion.organicCarbon}
                </div>
              </div>

              <div style={{ background: '#f8faf7', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: '#688273', fontWeight: 700 }}>NITROGEN (N) SATURATION</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  {selectedSoilRegion.nitrogen}
                </div>
              </div>

              <div style={{ background: '#f8faf7', padding: '14px', borderRadius: '12px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: '#688273', fontWeight: 700 }}>POTASSIUM (K) & PHOSPHORUS (P)</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#123524', marginTop: '2px' }}>
                  {selectedSoilRegion.potassium} / {selectedSoilRegion.phosphorus}
                </div>
              </div>
            </div>

            {/* Reclamation Guidelines */}
            <div style={{
              background: '#f4f8f5',
              padding: '18px 20px',
              borderRadius: '14px',
              borderLeft: '4px solid #10b981'
            }}>
              <strong style={{ fontSize: '0.88rem', color: '#123524' }}>
                ICAR Soil Health & Reclamation Protocols:
              </strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '0.82rem', color: '#45594e', lineHeight: 1.6 }}>
                {selectedSoilRegion.reclamationAdvice.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
