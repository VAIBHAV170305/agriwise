import React, { useState, useRef } from 'react';
import { 
  MapPin, Info, CheckCircle2, ChevronRight, Layers, Sparkles, 
  Navigation, Compass, Search, ChevronDown 
} from 'lucide-react';
import { useLocation, latLonToMapCoords, mapCoordsToLatLon, findClosestIndianCity, INDIAN_CITIES_DATABASE } from '../context/LocationContext';

/**
 * Interactive Agro-Climatic Heat Map of India
 * Visualizes the 7 primary agricultural soil & climate belts of India.
 * Replaces manual slider forms with a single-click geographic & soil selector.
 */
export const AGRO_CLIMATIC_ZONES = [
  {
    id: 'indo-gangetic',
    name: 'Indo-Gangetic Alluvial Plain',
    shortName: 'Northern Plains',
    states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar'],
    color: '#10b981', // Lush Emerald
    heatLevel: 'Very High Fertility (86/100)',
    fertilityScore: 86,
    soilType: 'Deep Alluvial Loam (Khadar & Bhangar)',
    phRange: '7.2 - 7.8',
    phValue: 7.4,
    organicCarbon: '0.58% (Medium)',
    npk: { n: 95, p: 45, k: 40 },
    climate: 'Subtropical Continental with Monsoonal Rains',
    avgRainfall: 195,
    avgTemp: 24.5,
    avgHumidity: 78,
    primaryCrops: ['Wheat (Sharbati/HD-3226)', 'Basmati Paddy', 'Sugarcane', 'Potato', 'Mustard'],
    path: 'M 140 135 L 210 130 L 290 150 L 340 170 L 345 190 L 280 185 L 200 170 L 140 155 Z',
    badge: 'Breadbasket of India'
  },
  {
    id: 'deccan-black',
    name: 'Deccan & Central Black Soil Belt',
    shortName: 'Central Black Soil',
    states: ['Maharashtra', 'Madhya Pradesh', 'Gujarat', 'North Karnataka'],
    color: '#059669', // Deep Forest Green
    heatLevel: 'High Moisture Clay (88/100)',
    fertilityScore: 88,
    soilType: 'Deep Black Clay / Vertisol (Regur Soil)',
    phRange: '7.8 - 8.4',
    phValue: 8.0,
    organicCarbon: '0.68% (Medium-High)',
    npk: { n: 110, p: 50, k: 30 },
    climate: 'Tropical Wet & Dry / Semi-Arid Plateau',
    avgRainfall: 85,
    avgTemp: 26.0,
    avgHumidity: 68,
    primaryCrops: ['Cotton (Bt)', 'Soybean', 'Chickpea (Desi/Kabuli)', 'Onion', 'Pigeon Pea (Tur)', 'Wheat'],
    path: 'M 120 180 L 195 175 L 255 190 L 245 250 L 180 270 L 125 240 L 95 200 Z',
    badge: 'Cotton & Pulses Capital'
  },
  {
    id: 'western-arid',
    name: 'Western Arid & Semi-Arid Zone',
    shortName: 'Western Dry Region',
    states: ['Rajasthan', 'North Gujarat (Kutch)', 'South-West Haryana'],
    color: '#f59e0b', // Harvest Amber
    heatLevel: 'Low-to-Medium Fertility (52/100)',
    fertilityScore: 52,
    soilType: 'Sandy Aridisols, Calcareous Sand Dunes & Loam',
    phRange: '8.1 - 8.8',
    phValue: 8.3,
    organicCarbon: '0.24% (Low)',
    npk: { n: 35, p: 30, k: 55 },
    climate: 'Arid to Semi-Arid with Low Precipitation',
    avgRainfall: 45,
    avgTemp: 28.5,
    avgHumidity: 35,
    primaryCrops: ['Pearl Millet (Bajra)', 'Mustard (Sarson)', 'Cluster Bean (Guar)', 'Cumin (Jeera)', 'Moth Bean'],
    path: 'M 75 140 L 135 135 L 145 190 L 95 200 L 60 180 Z',
    badge: 'High Solar & Spices'
  },
  {
    id: 'southern-red',
    name: 'Southern Red & Yellow Plateau',
    shortName: 'Southern Plateau',
    states: ['Karnataka', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu'],
    color: '#d97706', // Ochre Amber
    heatLevel: 'Moderate Fertility (68/100)',
    fertilityScore: 68,
    soilType: 'Red Sandy Loam to Ferruginous Alfisols',
    phRange: '6.2 - 6.9',
    phValue: 6.5,
    organicCarbon: '0.44% (Medium)',
    npk: { n: 60, p: 45, k: 40 },
    climate: 'Tropical Semi-Arid to Humid Southern Basin',
    avgRainfall: 95,
    avgTemp: 27.0,
    avgHumidity: 70,
    primaryCrops: ['Groundnut', 'Maize', 'Finger Millet (Ragi)', 'Chilli (Guntur)', 'Red Gram', 'Sunflower'],
    path: 'M 175 270 L 245 250 L 260 330 L 205 380 L 165 340 Z',
    badge: 'Millets & Oilseeds'
  },
  {
    id: 'eastern-delta',
    name: 'Eastern Delta & Lower Gangetic',
    shortName: 'Eastern Delta',
    states: ['West Bengal', 'Odisha', 'Assam'],
    color: '#0284c7', // Delta Blue
    heatLevel: 'Rich Alluvium (84/100)',
    fertilityScore: 84,
    soilType: 'Deltaic Alluvium, Acidic Silt & Clay',
    phRange: '5.8 - 6.8',
    phValue: 6.2,
    organicCarbon: '0.72% (High)',
    npk: { n: 80, p: 55, k: 45 },
    climate: 'Humid Subtropical with Abundant Monsoon',
    avgRainfall: 240,
    avgTemp: 26.5,
    avgHumidity: 84,
    primaryCrops: ['Paddy / Aman Rice', 'Jute', 'Mustard', 'Vegetables', 'Tea'],
    path: 'M 290 160 L 350 170 L 360 220 L 310 240 L 285 200 Z',
    badge: 'High Rainfall & Paddy'
  },
  {
    id: 'coastal-humid',
    name: 'Western Ghats & Coastal Humid',
    shortName: 'Coastal Western Ghats',
    states: ['Kerala', 'Coastal Karnataka', 'Goa', 'Konkan'],
    color: '#047857', // Deep Emerald
    heatLevel: 'High Organic Laterite (78/100)',
    fertilityScore: 78,
    soilType: 'Laterite & Lateritic Humus Rich Forest Soil',
    phRange: '5.2 - 6.2',
    phValue: 5.6,
    organicCarbon: '1.15% (Very High)',
    npk: { n: 50, p: 35, k: 80 },
    climate: 'Tropical Rainforest & Heavy Orographic Rains',
    avgRainfall: 260,
    avgTemp: 26.0,
    avgHumidity: 88,
    primaryCrops: ['Coconut', 'Black Pepper', 'Rubber', 'Coffee', 'Arecanut', 'Cardamom'],
    path: 'M 125 240 L 165 270 L 155 350 L 180 395 L 165 385 L 140 310 Z',
    badge: 'Spices & Plantation'
  },
  {
    id: 'himalayan-temperate',
    name: 'Himalayan & Sub-Himalayan Zone',
    shortName: 'Himalayan Belt',
    states: ['Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir'],
    color: '#0891b2', // Mountain Cyan
    heatLevel: 'Temperate Montane (72/100)',
    fertilityScore: 72,
    soilType: 'Brown Hill Forest Soil, Podzols, Glacial Gravel',
    phRange: '6.0 - 6.8',
    phValue: 6.4,
    organicCarbon: '1.25% (High)',
    npk: { n: 40, p: 70, k: 120 },
    climate: 'Temperate Montane with Winter Snowfall',
    avgRainfall: 140,
    avgTemp: 16.0,
    avgHumidity: 72,
    primaryCrops: ['Apple (Royal Delicious)', 'Walnut', 'Almond', 'Potato Seed', 'Barley'],
    path: 'M 125 70 L 180 60 L 220 110 L 160 120 L 130 95 Z',
    badge: 'Horticulture & Orchards'
  }
];

export const DISPLAY_CITIES_ON_MAP = [
  { name: 'Meerut', lat: 28.9845, lon: 77.7064, state: 'Uttar Pradesh', isSpecial: true },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
  { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, state: 'Punjab' },
  { name: 'Anand', lat: 22.5645, lon: 72.9289, state: 'Gujarat' },
  { name: 'Surat', lat: 21.1702, lon: 72.8311, state: 'Gujarat' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  { name: 'Indore', lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' }
];

export default function IndiaAgriHeatMap({ 
  selectedZoneId, 
  onSelectZone,
  userLocationName = ''
}) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const {
    location,
    detecting,
    detectLocation,
    setManualRegion,
    statesList,
    selectedState,
    citiesInSelectedState,
    handleStateChange,
    handleCityChange,
    searchIndianLocations,
    latLonToMapCoords
  } = useLocation();

  const activeZone = AGRO_CLIMATIC_ZONES.find(z => z.id === selectedZoneId) || AGRO_CLIMATIC_ZONES[0];
  const displayedZone = hoveredZone || activeZone;

  // Map city/state to corresponding agro-climatic zone
  const mapCityToZone = (cityName, stateName) => {
    const c = (cityName || '').toLowerCase();
    const s = (stateName || '').toLowerCase();
    if (c.includes('meerut') || c.includes('delhi') || c.includes('ludhiana') || c.includes('varanasi') || c.includes('patna') || s.includes('punjab') || s.includes('uttar pradesh') || s.includes('bihar') || s.includes('haryana')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'indo-gangetic');
    }
    if (c.includes('jaipur') || c.includes('jodhpur') || s.includes('rajasthan')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'western-arid');
    }
    if (c.includes('anand') || c.includes('surat') || c.includes('pune') || c.includes('nagpur') || c.includes('indore') || s.includes('maharashtra') || s.includes('madhya pradesh') || s.includes('gujarat')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'deccan-black');
    }
    if (c.includes('hyderabad') || c.includes('bengaluru') || c.includes('coimbatore') || s.includes('karnataka') || s.includes('telangana') || s.includes('tamil nadu') || s.includes('andhra')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'southern-red');
    }
    if (c.includes('kolkata') || c.includes('bhubaneswar') || c.includes('guwahati') || s.includes('bengal') || s.includes('odisha') || s.includes('assam')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'eastern-delta');
    }
    if (s.includes('kerala') || s.includes('goa')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'coastal-humid');
    }
    if (s.includes('himachal') || s.includes('uttarakhand') || s.includes('kashmir')) {
      return AGRO_CLIMATIC_ZONES.find(z => z.id === 'himalayan-temperate');
    }
    return AGRO_CLIMATIC_ZONES[0];
  };

  const handleCityPick = (cityObj) => {
    setManualRegion(cityObj);
    const z = mapCityToZone(cityObj.city, cityObj.state);
    if (z && onSelectZone) onSelectZone(z);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const onStateSelect = (st) => {
    handleStateChange(st);
    const firstCity = INDIAN_CITIES_DATABASE.find(c => c.state === st);
    if (firstCity) {
      const z = mapCityToZone(firstCity.city, firstCity.state);
      if (z && onSelectZone) onSelectZone(z);
    }
  };

  const onCitySelect = (ct) => {
    handleCityChange(ct);
    const found = citiesInSelectedState.find(c => c.city === ct);
    if (found) {
      const z = mapCityToZone(found.city, found.state);
      if (z && onSelectZone) onSelectZone(z);
    }
  };

  const searchResults = searchQuery.trim() ? searchIndianLocations(searchQuery).slice(0, 8) : [];
  const currentPin = latLonToMapCoords ? latLonToMapCoords(location.latitude, location.longitude) : { x: 155, y: 126 };
  const svgRef = useRef(null);

  const handleSvgClick = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const svgX = (clickX / rect.width) * 420;
    const svgY = (clickY / rect.height) * 440;

    const { lat, lon } = mapCoordsToLatLon(svgX, svgY);
    const closest = findClosestIndianCity(lat, lon);
    handleCityPick(closest);
  };

  return (
    <div className="india-heatmap-wrapper" style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid rgba(18, 53, 36, 0.1)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid rgba(18, 53, 36, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase'
            }}>
              Interactive Soil & Climate Atlas
            </span>
            {userLocationName && (
              <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
                📍 GPS Synced: {userLocationName}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#123524', fontWeight: 800, marginTop: '4px' }}>
            Agro-Climatic Heat Map of India
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#576c60' }}>
            Click any agro-climatic belt below to immediately load regional soil properties, pH levels, and AI seasonal crop recommendations.
          </p>
        </div>

        {/* Selected Zone Quick Pill */}
        <div style={{
          background: '#f4f8f5',
          border: '1px solid #bce1ce',
          borderRadius: '10px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: activeZone.color,
            boxShadow: `0 0 8px ${activeZone.color}`
          }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.66rem', color: '#576c60', fontWeight: 700, textTransform: 'uppercase' }}>
              Selected Agro Zone
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#123524' }}>
              {activeZone.name}
            </div>
          </div>
        </div>
      </div>

      {/* Rapido-Style Indian Pinpoint Search & State/City Dropdowns */}
      <div style={{
        background: '#f8faf8',
        border: '1px solid rgba(18, 53, 36, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative'
      }}>
        {/* Live Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid rgba(18, 53, 36, 0.18)',
            borderRadius: '8px',
            padding: '6px 10px',
            gap: '8px'
          }}>
            <Search size={15} color="#576c60" />
            <input
              type="text"
              placeholder="Search Indian city, district, or mandi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                width: '100%',
                background: 'transparent',
                color: '#123524'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#576c60' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Popup */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid rgba(18, 53, 36, 0.15)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCityPick(item)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #f0f4f1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div>
                    <strong style={{ color: '#123524' }}>{item.city}</strong>
                    <span style={{ color: '#576c60', marginLeft: '6px' }}>({item.state})</span>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>{item.mandiHub}</div>
                  </div>
                  <MapPin size={14} color="#10b981" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3d5246' }}>State:</span>
          <select
            value={selectedState}
            onChange={(e) => onStateSelect(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(18, 53, 36, 0.18)',
              background: '#ffffff',
              fontSize: '0.8rem',
              color: '#123524',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* City Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3d5246' }}>City/District:</span>
          <select
            value={location.city || ''}
            onChange={(e) => onCitySelect(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(18, 53, 36, 0.18)',
              background: '#ffffff',
              fontSize: '0.8rem',
              color: '#123524',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {citiesInSelectedState.map(c => (
              <option key={c.city} value={c.city}>
                {c.city} {c.city === 'Meerut' ? '⭐ (Default)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Live GPS Auto-Detect Button */}
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#123524',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          <Compass size={14} className={detecting ? 'animate-spin' : ''} />
          {detecting ? 'Detecting...' : 'Auto-Detect GPS'}
        </button>
      </div>

      {/* Main Grid: Interactive Map (Left) + Regional Intelligence Card (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* SVG Interactive Map */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #f8faf7 0%, #edf5f0 100%)',
          borderRadius: '14px',
          border: '1px solid rgba(18, 53, 36, 0.08)',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '380px'
        }}>
          <svg
            ref={svgRef}
            onClick={handleSvgClick}
            viewBox="0 0 420 440"
            style={{ width: '100%', maxHeight: '370px', overflow: 'visible', cursor: 'crosshair' }}
          >
            {/* Ambient Background Grid */}
            <defs>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(18, 53, 36, 0.06)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" rx="8" />

            {/* India Boundary Outline Base */}
            <path
              d="M 125 50 
                 Q 175 40 215 95 
                 L 260 130 
                 Q 330 140 370 170 
                 L 360 230 
                 Q 320 250 280 235 
                 L 270 310 
                 L 215 410 
                 Q 175 430 155 370 
                 L 130 260 
                 Q 80 220 60 180 
                 L 75 140 
                 Q 110 90 125 50 Z"
              fill="rgba(18, 53, 36, 0.04)"
              stroke="rgba(18, 53, 36, 0.2)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Interactive Agro-Climatic Belt Polygons */}
            {AGRO_CLIMATIC_ZONES.map((zone) => {
              const isSelected = activeZone.id === zone.id;
              const isHovered = hoveredZone?.id === zone.id;

              return (
                <g key={zone.id}>
                  <path
                    d={zone.path}
                    fill={zone.color}
                    fillOpacity={isSelected ? 0.88 : isHovered ? 0.75 : 0.45}
                    stroke={isSelected ? '#ffffff' : isHovered ? '#f59e0b' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.2}
                    cursor="pointer"
                    style={{
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: isSelected ? 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredZone(zone)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => {
                      if (onSelectZone) onSelectZone(zone);
                    }}
                  />
                </g>
              );
            })}

            {/* Clearly Rendered Indian Agricultural Benchmark Cities */}
            {DISPLAY_CITIES_ON_MAP.map((city) => {
              const pt = latLonToMapCoords ? latLonToMapCoords(city.lat, city.lon) : { x: 155, y: 126 };
              const isCurrent = location.city?.toLowerCase() === city.name.toLowerCase();
              const isMeerut = city.name === 'Meerut';

              return (
                <g 
                  key={city.name} 
                  transform={`translate(${pt.x}, ${pt.y})`}
                  cursor="pointer"
                  onClick={() => {
                    const found = INDIAN_CITIES_DATABASE.find(c => c.city.toLowerCase() === city.name.toLowerCase()) || {
                      city: city.name,
                      state: city.state,
                      district: city.name,
                      latitude: city.lat,
                      longitude: city.lon
                    };
                    handleCityPick(found);
                  }}
                >
                  {/* Outer pulse for Meerut or active selection */}
                  {(isCurrent || isMeerut) && (
                    <circle 
                      r={isCurrent ? "9" : "7"} 
                      fill={isCurrent ? "#dc2626" : "#f59e0b"} 
                      fillOpacity={isCurrent ? 0.35 : 0.25} 
                      className="animate-pulse" 
                    />
                  )}

                  {/* City Node Marker */}
                  <circle 
                    r={isCurrent ? "4.5" : isMeerut ? "4.2" : "3"} 
                    fill={isCurrent ? "#dc2626" : isMeerut ? "#f59e0b" : "#1f2937"} 
                    stroke="#ffffff" 
                    strokeWidth={isCurrent || isMeerut ? "1.6" : "1"} 
                  />

                  {/* High Contrast Legible City Label with Stroke Outline */}
                  <text
                    x={pt.x > 310 ? -6 : 6}
                    y={pt.y < 70 ? 12 : -4}
                    textAnchor={pt.x > 310 ? 'end' : 'start'}
                    fontSize={isCurrent || isMeerut ? "8.5" : "7"}
                    fontWeight={isCurrent || isMeerut ? "800" : "600"}
                    fill={isCurrent ? "#dc2626" : isMeerut ? "#b45309" : "#1e293b"}
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: '2.5px',
                      strokeLinejoin: 'round',
                      userSelect: 'none'
                    }}
                  >
                    {isMeerut ? `⭐ ${city.name}` : city.name}
                  </text>
                </g>
              );
            })}

            {/* Glowing Live Pinpoint Indicator */}
            <g transform={`translate(${currentPin.x}, ${currentPin.y})`}>
              <circle r="14" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
              <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <circle r="2" fill="#ffffff" />
            </g>
          </svg>

          {/* Quick Legend Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            padding: '6px 10px',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            fontSize: '0.68rem',
            color: '#123524',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 800 }}>Soil Heat Scale:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} /> High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} /> Medium
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '2px' }} /> Humid
            </span>
          </div>
        </div>

        {/* Detailed Regional Agronomic Profile Card */}
        <div style={{
          background: '#fcfdfc',
          borderRadius: '14px',
          border: '1px solid rgba(18, 53, 36, 0.12)',
          padding: '20px'
        }}>
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{
                background: '#eef5f1',
                color: '#123524',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #c8dfd1'
              }}>
                {displayedZone.badge}
              </span>
              <h4 style={{ fontSize: '1.25rem', color: '#123524', fontWeight: 800, marginTop: '6px' }}>
                {displayedZone.name}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#576c60', marginTop: '2px' }}>
                Key States: <strong>{displayedZone.states.join(', ')}</strong>
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#123524' }}>
                {displayedZone.fertilityScore}
                <span style={{ fontSize: '0.75rem', color: '#688273' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                Fertility Rating
              </div>
            </div>
          </div>

          {/* Key Agronomic Parameters Grid (No manual inputs needed!) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
              <span style={{ fontSize: '0.66rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                Soil Classification
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#123524', marginTop: '2px' }}>
                {displayedZone.soilType}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
              <span style={{ fontSize: '0.66rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                Natural Soil pH Range
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                pH {displayedZone.phRange} (Optimal)
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
              <span style={{ fontSize: '0.66rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                Soil Organic Carbon
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#123524', marginTop: '2px' }}>
                {displayedZone.organicCarbon}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18, 53, 36, 0.08)' }}>
              <span style={{ fontSize: '0.66rem', color: '#688273', fontWeight: 700, textTransform: 'uppercase' }}>
                Prevalent Climate
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#123524', marginTop: '2px' }}>
                {displayedZone.climate.split('/')[0]}
              </div>
            </div>
          </div>

          {/* Primary Seasonal Crops */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.72rem', color: '#576c60', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              High-Suitability Regional Crops:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {displayedZone.primaryCrops.map((c, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(18, 53, 36, 0.12)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#123524'
                  }}
                >
                  🌾 {c}
                </span>
              ))}
            </div>
          </div>

          {/* Direct Select CTA Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSelectZone(displayedZone)}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <CheckCircle2 size={16} />
            Auto-Apply {displayedZone.shortName} Soil & Telemetry
          </button>
        </div>
      </div>

      {/* Quick State Pills Selector Bar */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(18, 53, 36, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.72rem', color: '#688273', fontWeight: 700, flexShrink: 0 }}>
          SELECT AGRI REGION:
        </span>
        {AGRO_CLIMATIC_ZONES.map((zone) => {
          const isSelected = activeZone.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone)}
              style={{
                background: isSelected ? '#123524' : '#ffffff',
                color: isSelected ? '#ffffff' : '#3d5246',
                border: isSelected ? '1px solid #123524' : '1px solid rgba(18, 53, 36, 0.12)',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#f0f8f3';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(18, 53, 36, 0.12)';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              {zone.shortName} ({zone.phRange} pH)
            </button>
          );
        })}
      </div>
    </div>
  );
}
