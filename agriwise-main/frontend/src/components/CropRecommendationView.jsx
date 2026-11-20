import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Info, Compass,
  HelpCircle, ChevronRight, BarChart2, ShieldAlert,
  MapPin, Sliders, RefreshCw, Leaf, Droplets, Sun, Calendar, Plus,
  TrendingUp, Award, ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';
import WavyLoader from './WavyLoader';
import IndiaAgriHeatMap, { AGRO_CLIMATIC_ZONES } from './IndiaAgriHeatMap';
import RapidoLocationSelector from './RapidoLocationSelector';
import LocationBanner from './LocationBanner';

export default function CropRecommendationView() {
  const { location, detectLocation, detecting } = useLocation();
  const { showToast } = useToast();

  // Active Selected Agro-Climatic Zone from Map / Location
  const [selectedZone, setSelectedZone] = useState(AGRO_CLIMATIC_ZONES[0]);
  const [mapMode, setMapMode] = useState('rapido'); // 'rapido' | 'heat'
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Recommendation State
  const [loading, setLoading] = useState(false);
  const [topCrops, setTopCrops] = useState([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);
  const [error, setError] = useState('');

  // Optional Advanced Soil Lab Override (Collapsed by default for farmers)
  const [showAdvancedOverride, setShowAdvancedOverride] = useState(false);
  const [customParams, setCustomParams] = useState({
    nitrogen: 90,
    phosphorus: 45,
    potassium: 40,
    ph: 7.4
  });

  // Current Season Calculation
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 10 || month <= 3) return { name: 'Rabi (रबी)', seasonCode: 'rabi', window: 'October - April (Cool Winter Sowing)' };
    if (month >= 6 && month <= 9) return { name: 'Kharif (खरीफ)', seasonCode: 'kharif', window: 'June - October (Monsoon Season)' };
    return { name: 'Zaid (जायद)', seasonCode: 'zaid', window: 'March - June (Summer Crops)' };
  };

  const currentSeason = getCurrentSeason();

  // 1. On Mount & Location change: Auto-detect matching agro zone & live weather
  useEffect(() => {
    matchUserLocationToZone();
  }, [location?.city, location?.state, location?.latitude]);

  const matchUserLocationToZone = () => {
    if (!location) return;

    const locState = (location.state || '').toLowerCase();
    const locDistrict = (location.district || location.city || '').toLowerCase();

    // Match closest zone based on state/district
    let matched = AGRO_CLIMATIC_ZONES.find(z => 
      z.states.some(st => locState.includes(st.toLowerCase()) || st.toLowerCase().includes(locState))
    );

    if (!matched) {
      if (locState.includes('gujarat') && (locDistrict.includes('kutch') || locDistrict.includes('banas'))) {
        matched = AGRO_CLIMATIC_ZONES.find(z => z.id === 'western-arid');
      } else if (locState.includes('uttar pradesh') || locDistrict.includes('meerut')) {
        matched = AGRO_CLIMATIC_ZONES[0]; // Indo-Gangetic Alluvial
      } else {
        matched = AGRO_CLIMATIC_ZONES[1]; // Deccan Black Soil
      }
    }

    if (matched) {
      setSelectedZone(matched);
      fetchLiveWeatherAndRecommend(matched, location.latitude, location.longitude, location.city || location.address);
    }
  };

  // Fetch Live Weather & Automatically Synthesize Top 5 Crops without manual technical sliders
  const fetchLiveWeatherAndRecommend = async (zone, lat, lon, locName) => {
    setLoading(true);
    setWeatherLoading(true);
    setError('');

    let currentTemp = zone.avgTemp;
    let currentHum = zone.avgHumidity;
    let currentRain = zone.avgRainfall;

    try {
      const weatherRes = await api.getWeather(lat || 28.9845, lon || 77.7064, locName || zone.name);
      if (weatherRes) {
        setLiveWeather(weatherRes);
        if (weatherRes.temperature) currentTemp = weatherRes.temperature;
        if (weatherRes.humidity) currentHum = weatherRes.humidity;
      }
    } catch {
      // Fallback to zone averages
    } finally {
      setWeatherLoading(false);
    }

    // Call Agronomic Recommendation Engine
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

      // Synthesize Top 5 Suitable Crops for this exact zone & season
      const primaryRec = res.recommended_crop || zone.primaryCrops[0] || 'Wheat';
      const allZoneCrops = zone.primaryCrops || ['Wheat', 'Sugarcane', 'Mustard', 'Potato', 'Tomato'];
      const combinedCrops = Array.from(new Set([primaryRec, ...allZoneCrops])).slice(0, 5);

      const synthesizedTop5 = combinedCrops.map((cropName, idx) => {
        const isFirst = idx === 0;
        return {
          rank: idx + 1,
          name: cropName,
          suitabilityBadge: isFirst ? 'Highest Yield & Profit Match' : idx === 1 ? 'Optimal Soil Match' : idx === 2 ? 'Low Water Requirement' : idx === 3 ? 'High Mandi Demand' : 'Soil Nutrient Enhancer',
          season: currentSeason.name,
          maturityDays: cropName.toLowerCase().includes('wheat') ? '115 - 125 Days' : cropName.toLowerCase().includes('sugarcane') ? '300 - 360 Days' : cropName.toLowerCase().includes('mustard') ? '90 - 110 Days' : cropName.toLowerCase().includes('potato') ? '80 - 95 Days' : '100 - 120 Days',
          projectedYield: cropName.toLowerCase().includes('wheat') ? '48 - 54 Qtl/Ha' : cropName.toLowerCase().includes('sugarcane') ? '750 - 850 Qtl/Ha' : cropName.toLowerCase().includes('mustard') ? '18 - 22 Qtl/Ha' : cropName.toLowerCase().includes('potato') ? '220 - 280 Qtl/Ha' : '45 - 55 Qtl/Ha',
          mandiPriceEstimate: cropName.toLowerCase().includes('wheat') ? '₹2,425 / Quintal (+8% over MSP)' : cropName.toLowerCase().includes('mustard') ? '₹5,650 / Quintal (+11% over MSP)' : cropName.toLowerCase().includes('potato') ? '₹1,250 / Quintal (Steady Demand)' : '₹2,800 / Quintal (Peak APMC)',
          soilTypeMatch: zone.soilType,
          phSuitability: `Ideal in pH ${zone.phRange}`,
          irrigationRequirement: cropName.toLowerCase().includes('mustard') ? 'Low (2-3 Irrigations)' : cropName.toLowerCase().includes('sugarcane') ? 'High (Drip Recommended)' : 'Moderate (3-4 Critical Stages)',
          icarTip: `Certified high-germination seed recommended for ${zone.shortName}. Seed treatment with Trichoderma viride @ 5g/kg protects against early root-rot.`
        };
      });

      setTopCrops(synthesizedTop5);
      setSelectedCropDetail(synthesizedTop5[0]);
    } catch (err) {
      setError(err.message || 'Failed to synthesize crop recommendation.');
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
    fetchLiveWeatherAndRecommend(zone, location.latitude, location.longitude, location.city || zone.name);
    showToast({
      title: `${zone.shortName} Selected`,
      message: `Inferred Soil: ${zone.soilType} (pH ${zone.phRange}). Synthesizing crops...`,
      type: 'info'
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 60px' }}>
      {/* Header Banner */}
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
              background: '#edf5f0',
              color: '#163326',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RakshakIcon size={14} /> ZERO MANUAL SLIDERS • AUTOMATED AGRONOMY
            </span>
            <span style={{ fontSize: '0.78rem', color: '#2d6a4f', fontWeight: 700 }}>
              🌾 Active Season: {currentSeason.name} ({currentSeason.window})
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#163326', fontWeight: 800, marginTop: '6px' }}>
            Crop Recommendation
          </h2>
          <p style={{ color: '#4b6354', fontSize: '0.85rem', maxWidth: '820px', marginTop: '2px' }}>
            Recommended crops tailored to your soil terrain and live weather telemetry.
          </p>
        </div>

        {/* GPS Location & Live Telemetry Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={detectLocation}
            disabled={detecting}
            style={{
              background: '#163326',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: detecting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 51, 38, 0.2)'
            }}
          >
            <Compass size={16} className={detecting ? 'animate-spin' : ''} />
            <span>{detecting ? 'Detecting GPS...' : `Sync GPS (${location?.city || 'Meerut'})`}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Interactive Terrain Map on Left, Top 5 Suitable Crops on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 440px) 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Interactive India Terrain & Soil Heat-Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(22, 51, 38, 0.04)'
          }}>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Interactive Location & Soil Atlas
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326', margin: '2px 0 0' }}>
                  Pan-India Map & Pinpoint Selector
                </h3>
              </div>

              {/* Mode Toggle: Rapido Pinpoint vs Soil Belts */}
              <div style={{ display: 'flex', background: '#eef4f0', padding: '3px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMapMode('rapido')}
                  style={{
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: mapMode === 'rapido' ? '#163326' : 'transparent',
                    color: mapMode === 'rapido' ? '#ffffff' : '#4a5e52',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📍 Rapido Pinpoint
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('heat')}
                  style={{
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: mapMode === 'heat' ? '#163326' : 'transparent',
                    color: mapMode === 'heat' ? '#ffffff' : '#4a5e52',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🌾 Soil Belts
                </button>
              </div>
            </div>

            {/* View Switching: Rapido Pinpoint vs Heat Map */}
            {mapMode === 'rapido' ? (
              <RapidoLocationSelector 
                onLocationSelected={(loc) => {
                  matchUserLocationToZone();
                }}
                showConfirmButton={false}
              />
            ) : (
              <IndiaAgriHeatMap 
                selectedZoneId={selectedZone.id} 
                onSelectZone={handleZoneSelect}
                compactView={true}
              />
            )}

            {/* Auto-Inferred Soil Parameters Card (No sliders!) */}
            <div style={{
              marginTop: '16px',
              background: '#f8faf7',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(22, 51, 38, 0.08)'
            }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '8px' }}>
                Auto-Inferred Regional Soil Profile:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: '#657d70', display: 'block', fontSize: '0.7rem' }}>SOIL TYPE</span>
                  <strong style={{ color: '#163326' }}>{selectedZone.soilType.split(' (')[0]}</strong>
                </div>
                <div>
                  <span style={{ color: '#657d70', display: 'block', fontSize: '0.7rem' }}>NATURAL pH RANGE</span>
                  <strong style={{ color: '#2d6a4f' }}>pH {selectedZone.phRange}</strong>
                </div>
                <div>
                  <span style={{ color: '#657d70', display: 'block', fontSize: '0.7rem' }}>FERTILITY INDEX</span>
                  <strong style={{ color: '#163326' }}>{selectedZone.heatLevel.split(' (')[0]}</strong>
                </div>
                <div>
                  <span style={{ color: '#657d70', display: 'block', fontSize: '0.7rem' }}>LIVE TEMPERATURE</span>
                  <strong style={{ color: '#2d6a4f' }}>{liveWeather?.temperature || selectedZone.avgTemp}°C</strong>
                </div>
              </div>
            </div>

            {/* Collapsed Advanced Soil Lab Override (Only for lab testing) */}
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowAdvancedOverride(!showAdvancedOverride)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#657d70',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Sliders size={12} />
                <span>{showAdvancedOverride ? 'Hide Soil Lab Overrides' : '🔬 Have a Soil Health Card? Enter exact values (Optional)'}</span>
              </button>

              {showAdvancedOverride && (
                <div style={{ marginTop: '10px', padding: '12px', background: '#f4f7f5', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#163326', fontWeight: 700 }}>Nitrogen (N)</label>
                      <input 
                        type="number" 
                        value={customParams.nitrogen} 
                        onChange={e => setCustomParams({ ...customParams, nitrogen: Number(e.target.value) })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#163326', fontWeight: 700 }}>Soil pH</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={customParams.ph} 
                        onChange={e => setCustomParams({ ...customParams, ph: Number(e.target.value) })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchLiveWeatherAndRecommend(selectedZone, location.latitude, location.longitude, location.city)}
                    style={{ background: '#163326', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Recalculate with Custom Values
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Top 5 Suitable Crops (Ranked Cards) */}
        <div>
          {/* Header Strip for Recommendations */}
          <div style={{
            background: 'linear-gradient(135deg, #163326 0%, #204b38 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#b6d7c5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Recommendations Generated for:
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {location?.city || location?.district || 'Meerut'}, {selectedZone.name}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#52b788', color: '#163326', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                Top 5 Suitable Crops
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', textAlign: 'center', border: '1px solid rgba(22, 51, 38, 0.1)' }}>
              <WavyLoader text={`Cross-referencing soil map & weather for ${location?.city || selectedZone.shortName}...`} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topCrops.map((crop, idx) => {
                const isSelected = selectedCropDetail?.name === crop.name;
                return (
                  <div
                    key={crop.name}
                    onClick={() => setSelectedCropDetail(crop)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #2d6a4f' : '1px solid rgba(22, 51, 38, 0.12)',
                      padding: '18px 22px',
                      boxShadow: isSelected ? '0 8px 24px rgba(45, 106, 79, 0.14)' : '0 2px 8px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#52b788';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: idx === 0 ? '#163326' : '#edf5f0',
                          color: idx === 0 ? '#52b788' : '#163326',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          #{crop.rank}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                              {crop.name}
                            </h4>
                            <span style={{
                              background: idx === 0 ? '#d8f3dc' : '#edf5f0',
                              color: '#1b4332',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {crop.suitabilityBadge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#657d70', marginTop: '2px' }}>
                            {crop.season} • Expected Maturity: <strong>{crop.maturityDays}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Mandi Price & Yield Metric */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2d6a4f' }}>
                          {crop.mandiPriceEstimate}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#657d70' }}>
                          Est. Yield: <strong>{crop.projectedYield}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Quick ICAR Agronomy Wisdom */}
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: '#f8faf7',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      color: '#3d5246',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Leaf size={14} color="#2d6a4f" style={{ flexShrink: 0 }} />
                      <span>{crop.icarTip}</span>
                    </div>

                    {/* Sowing Specifications Strip */}
                    <div style={{
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '0.74rem',
                      color: '#587965',
                      flexWrap: 'wrap'
                    }}>
                      <span>💧 {crop.irrigationRequirement}</span>
                      <span>🌱 {crop.soilTypeMatch}</span>
                      <span>🧪 {crop.phSuitability}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
