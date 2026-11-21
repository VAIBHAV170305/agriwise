import React, { useState, useRef } from 'react';
import { 
  Search, MapPin, Navigation, Compass, CheckCircle2, 
  X, ChevronDown, Check, Sparkles, Filter, Globe
} from 'lucide-react';
import { 
  useLocation, 
  latLonToMapCoords, 
  mapCoordsToLatLon, 
  findClosestIndianCity, 
  INDIAN_CITIES_DATABASE,
  INDIAN_STATES 
} from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

export default function RapidoLocationSelector({ 
  onLocationSelected, 
  showConfirmButton = true,
  isModal = false 
}) {
  const { 
    location, 
    detecting, 
    errorMsg, 
    detectLocation, 
    setManualRegion, 
    statesList, 
    selectedState, 
    citiesInSelectedState, 
    handleStateChange, 
    handleCityChange, 
    searchIndianLocations 
  } = useLocation();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activePinCoords, setActivePinCoords] = useState(() => latLonToMapCoords(location.latitude, location.longitude));
  const svgRef = useRef(null);

  // Sync pin when location changes externally
  React.useEffect(() => {
    setActivePinCoords(latLonToMapCoords(location.latitude, location.longitude));
  }, [location.latitude, location.longitude]);

  const searchResults = searchQuery.trim() ? searchIndianLocations(searchQuery) : [];

  // Key pan-India reference cities plotted on the map
  const PAN_INDIA_CITIES = [
    // North
    { name: 'Srinagar', state: 'J&K', lat: 34.0837, lon: 74.7973 },
    { name: 'Shimla', state: 'HP', lat: 31.1048, lon: 77.1734 },
    { name: 'Dehradun', state: 'UK', lat: 30.3165, lon: 78.0322 },
    { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
    { name: 'Khanna', state: 'Punjab', lat: 30.7068, lon: 76.2166 },
    { name: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
    { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
    { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064, isSpecial: true },
    { name: 'Agra', state: 'UP', lat: 27.1767, lon: 78.0081 },
    { name: 'Lucknow', state: 'UP', lat: 26.8467, lon: 80.9462 },
    { name: 'Varanasi', state: 'UP', lat: 25.3176, lon: 82.9739 },

    // West
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
    { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { name: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289 },
    { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },

    // Central
    { name: 'Gwalior', state: 'MP', lat: 26.2183, lon: 78.1828 },
    { name: 'Bhopal', state: 'MP', lat: 23.2599, lon: 77.4126 },
    { name: 'Indore', state: 'MP', lat: 22.7196, lon: 75.8577 },
    { name: 'Jabalpur', state: 'MP', lat: 23.1815, lon: 79.9864 },
    { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },

    // East
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
    { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { name: 'Burdwan', state: 'West Bengal', lat: 23.2324, lon: 87.8615 },
    { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },

    // South
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
    { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
    { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
    { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
    { name: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
    { name: 'Palakkad', state: 'Kerala', lat: 10.7867, lon: 76.6548 },
    { name: 'Wayanad', state: 'Kerala', lat: 11.6854, lon: 76.1320 }
  ];

  // Handle click on Map SVG to set pinpoint
  const handleSvgClick = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates to SVG viewBox (0 0 460 480)
    const svgX = (clickX / rect.width) * 460;
    const svgY = (clickY / rect.height) * 480;

    const { lat, lon } = mapCoordsToLatLon(svgX, svgY);
    const closest = findClosestIndianCity(lat, lon);

    setActivePinCoords({ x: svgX, y: svgY });
    setManualRegion(closest);

    if (showToast) {
      showToast({
        title: `Pinpoint Dropped: ${closest.city}`,
        message: `${closest.district}, ${closest.state} • ${closest.agroZone}`,
        type: 'info'
      });
    }

    if (onLocationSelected) {
      onLocationSelected(closest);
    }
  };

  const handleCityPick = (cityObj) => {
    setManualRegion(cityObj);
    const pt = latLonToMapCoords(cityObj.latitude, cityObj.longitude);
    setActivePinCoords(pt);
    setSearchQuery('');
    setIsSearching(false);

    if (showToast) {
      showToast({
        title: `Selected: ${cityObj.city}`,
        message: `Agro Zone: ${cityObj.agroZone} • Soil: ${cityObj.soilType}`,
        type: 'success'
      });
    }

    if (onLocationSelected) {
      onLocationSelected(cityObj);
    }
  };

  const handleConfirm = () => {
    if (showToast) {
      showToast({
        title: 'Farm Location Confirmed',
        message: `Active location set to ${location.city || location.district}, ${location.state}. Telemetry synchronized.`,
        type: 'success'
      });
    }
    if (onLocationSelected) {
      onLocationSelected(location);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. Rapido-Style Top Live Search Box with Instant Autocomplete */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          border: '2px solid #163326',
          borderRadius: '16px',
          padding: '10px 16px',
          boxShadow: '0 6px 20px rgba(22, 51, 38, 0.08)',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#eef6f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#163326'
          }}>
            <Search size={15} />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Search any Indian village, city, district, or mandi (e.g., Meerut, Anand, Ludhiana, Pune, Nashik)..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#163326',
              flex: 1
            }}
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setIsSearching(false); }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#688273', padding: '4px' }}
            >
              <X size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#587965', fontWeight: 700 }}>
              <Globe size={13} /> Pan-India Search
            </div>
          )}
        </div>

        {/* Instant Autocomplete Suggestions */}
        {isSearching && searchQuery.trim() && (
          <div style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1.5px solid #163326',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(22, 51, 38, 0.2)',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 300,
            padding: '8px'
          }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.84rem', color: '#688273' }}>
                No direct match found for "{searchQuery}". Select from the State & City selectors below or tap the map.
              </div>
            ) : (
              searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCityPick(item)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f0f4f1',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#edf5f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: item.city === 'Meerut' ? '#fef3c7' : '#eaf2ec',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <MapPin size={16} color={item.city === 'Meerut' ? '#d97706' : '#2d6a4f'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#163326' }}>
                        {item.city}, {item.state} {item.city === 'Meerut' && <span style={{ fontSize: '0.72rem', color: '#b45309' }}>⭐ (Default Region)</span>}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#587965' }}>
                        Mandi: <strong>{item.mandiHub}</strong> • Soil: {item.soilType}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#2d6a4f', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    Select Pin 📍
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. Pan-India State & City Hierarchy Selector + Auto-Detect GPS Button */}
      <div style={{
        background: '#f8faf7',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* State Selection */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
            <Filter size={12} color="#2d6a4f" />
            1. Select State ({INDIAN_STATES.length} States / UTs)
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(22, 51, 38, 0.2)',
              background: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#163326',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {INDIAN_STATES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* City Selection */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
            <MapPin size={12} color="#2d6a4f" />
            2. Select City / District / Mandi
          </label>
          <select
            value={location.city || location.district}
            onChange={(e) => handleCityChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(22, 51, 38, 0.2)',
              background: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#163326',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {citiesInSelectedState.map(c => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.district !== c.city ? `${c.district} Dist.` : 'District'}) {c.city === 'Meerut' ? '⭐ (Default)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-Detect GPS Button */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
            <Navigation size={12} color="#2d6a4f" />
            3. Pinpoint Live GPS
          </label>
          <button
            type="button"
            onClick={() => detectLocation(true)}
            disabled={detecting}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: '#163326',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: detecting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(22, 51, 38, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={15} className={detecting ? 'animate-spin' : ''} />
            <span>{detecting ? 'Locating...' : 'Locate Me (GPS)'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '8px 14px',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontSize: '0.78rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* 3. Interactive Pan-India Map Canvas with Click-to-Pin & Rapido Marker */}
      <div style={{
        background: 'linear-gradient(180deg, #f8faf7 0%, #edf5f0 100%)',
        border: '1.5px solid rgba(22, 51, 38, 0.12)',
        borderRadius: '20px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header Bar on Top of Map */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              Tap Anywhere to Drop Pin 📍
            </span>
            <span style={{ fontSize: '0.78rem', color: '#587965', fontWeight: 600 }}>
              Pan-India Agricultural Map
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(22, 51, 38, 0.12)',
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#163326',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d90429' }} />
            Active Pin: {location.city || location.district}, {location.state}
          </div>
        </div>

        {/* SVG Pan-India Map */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: isModal ? '320px' : '360px',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'crosshair'
        }}>
          <svg
            ref={svgRef}
            viewBox="0 0 460 480"
            onClick={handleSvgClick}
            style={{ width: '100%', height: '100%', maxHeight: isModal ? '320px' : '360px' }}
          >
            {/* Ambient Background Grid */}
            <defs>
              <pattern id="rapidoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(22, 51, 38, 0.05)" />
              </pattern>

              {/* Glowing Pin Gradient */}
              <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d90429" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d90429" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#rapidoGrid)" rx="12" />

            {/* Complete Pan-India Boundary Outline */}
            {/* North: J&K, Ladakh -> East: Assam, Arunachal -> South: TN, Kerala -> West: Gujarat, Rajasthan */}
            <path
              d="M 160 55
                 Q 190 35 220 50
                 L 235 85
                 Q 260 115 285 125
                 L 320 135
                 Q 360 140 405 160
                 L 415 195
                 Q 390 220 370 210
                 L 350 215
                 Q 330 240 310 245
                 L 295 285
                 L 260 360
                 L 225 435
                 Q 200 450 185 410
                 L 165 340
                 L 150 280
                 Q 125 240 95 215
                 L 75 185
                 Q 95 155 120 135
                 L 145 105 Z"
              fill="#eaf2ec"
              stroke="#163326"
              strokeWidth="2"
              strokeOpacity="0.4"
            />

            {/* Regional Zone Shade Belts */}
            {/* 1. Northern Plains (Indo-Gangetic) */}
            <path
              d="M 145 140 L 220 135 L 300 155 L 340 180 L 330 205 L 260 195 L 180 180 L 140 160 Z"
              fill="#10b981"
              fillOpacity="0.25"
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* 2. Deccan Black Soil Belt */}
            <path
              d="M 125 190 L 210 185 L 270 200 L 260 270 L 190 290 L 130 260 L 105 215 Z"
              fill="#059669"
              fillOpacity="0.25"
              stroke="#059669"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* 3. Western Arid */}
            <path
              d="M 85 150 L 145 140 L 155 200 L 105 215 L 75 185 Z"
              fill="#f59e0b"
              fillOpacity="0.25"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* 4. Southern Plateau */}
            <path
              d="M 185 290 L 260 270 L 270 350 L 215 410 L 175 360 Z"
              fill="#d97706"
              fillOpacity="0.25"
              stroke="#d97706"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Plotted Indian Cities with Click Handlers */}
            {PAN_INDIA_CITIES.map((c) => {
              const pt = latLonToMapCoords(c.lat, c.lon);
              const isSelected = (location.city?.toLowerCase() === c.name.toLowerCase());
              const isSpecial = c.isSpecial;

              return (
                <g
                  key={c.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    const full = INDIAN_CITIES_DATABASE.find(x => x.city.toLowerCase() === c.name.toLowerCase()) || {
                      city: c.name,
                      state: c.state,
                      district: c.name,
                      latitude: c.lat,
                      longitude: c.lon
                    };
                    handleCityPick(full);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* City dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : isSpecial ? 5 : 3.5}
                    fill={isSelected ? '#d90429' : isSpecial ? '#f59e0b' : '#163326'}
                    stroke="#ffffff"
                    strokeWidth={isSelected || isSpecial ? 1.8 : 1}
                  />

                  {/* Legible City Name with White Stroke */}
                  <text
                    x={pt.x + 6}
                    y={pt.y + 3}
                    fontSize={isSelected ? '9px' : '7.5px'}
                    fontWeight={isSelected ? '900' : isSpecial ? '800' : '600'}
                    fill={isSelected ? '#d90429' : isSpecial ? '#b45309' : '#1e293b'}
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: '2.5px',
                      strokeLinejoin: 'round',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  >
                    {isSpecial ? `⭐ ${c.name}` : c.name}
                  </text>
                </g>
              );
            })}

            {/* Dynamic Rapido Pinpoint Marker with Pulse Animation at Active Pin */}
            <g transform={`translate(${activePinCoords.x}, ${activePinCoords.y})`}>
              {/* Radar Pulse Wave 1 */}
              <circle r="18" fill="none" stroke="#d90429" strokeWidth="2" opacity="0.6">
                <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Drop Shadow */}
              <ellipse cx="0" cy="2" rx="6" ry="2" fill="rgba(0,0,0,0.25)" />

              {/* Pin Head */}
              <path
                d="M 0 0 C -8 -12, -8 -22, 0 -22 C 8 -22, 8 -12, 0 0 Z"
                fill="#d90429"
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="drop-shadow(0 3px 6px rgba(217, 4, 41, 0.4))"
              />
              {/* Center Dot */}
              <circle cx="0" cy="-14" r="3" fill="#ffffff" />
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Rapido-Style Bottom Location Confirmation Drawer Card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #163326',
        borderRadius: '20px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(22, 51, 38, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #163326 0%, #2d6a4f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(22, 51, 38, 0.25)'
          }}>
            <MapPin size={24} color="#f59e0b" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: location.isGps ? '#dcfce7' : '#fef3c7',
                color: location.isGps ? '#15803d' : '#92400e',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                {location.isGps ? '● LIVE GPS LOCK' : '● PINPOINT SELECTED'}
              </span>
              <span style={{ fontSize: '0.76rem', color: '#688273', fontWeight: 600 }}>
                {location.latitude?.toFixed(4)}° N, {location.longitude?.toFixed(4)}° E
              </span>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326', marginTop: '3px', fontFamily: "'Fraunces', serif" }}>
              {location.city || location.district}, {location.state}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#587965', marginTop: '2px' }}>
              Mandi Hub: <strong>{location.mandiHub}</strong> • Soil: <strong>{location.soilType || 'Alluvial Clay Loam'} (pH {location.phValue || 7.4})</strong>
            </div>
          </div>
        </div>

        {showConfirmButton && (
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              background: '#163326',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(22, 51, 38, 0.25)',
              transition: 'all 0.18s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <CheckCircle2 size={18} color="#10b981" />
            <span>Confirm Farm Location</span>
          </button>
        )}
      </div>
    </div>
  );
}
