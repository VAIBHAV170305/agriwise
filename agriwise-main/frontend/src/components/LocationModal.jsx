import React, { useState } from 'react';
import { 
  X, MapPin, Navigation, Check, Search, Compass, 
  ChevronDown, CloudRain, CheckCircle2, Sparkles, Building2
} from 'lucide-react';
import { useLocation, latLonToMapCoords, INDIAN_CITIES_DATABASE } from '../context/LocationContext';

export default function LocationModal() {
  const { 
    location, 
    detecting, 
    errorMsg, 
    detectLocation, 
    setManualRegion, 
    showLocationModal, 
    setShowLocationModal,
    statesList,
    selectedState,
    citiesInSelectedState,
    handleStateChange,
    handleCityChange,
    searchIndianLocations
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!showLocationModal) return null;

  const searchResults = searchQuery.trim() ? searchIndianLocations(searchQuery) : [];

  // Key Indian benchmark cities to display clearly on the interactive pinpoint map
  const DISPLAY_CITIES_ON_MAP = [
    { name: 'Meerut', lat: 28.9845, lon: 77.7064, state: 'UP', isSpecial: true },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'NCR' },
    { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, state: 'PB' },
    { name: 'Anand', lat: 22.5645, lon: 72.9289, state: 'GJ' },
    { name: 'Surat', lat: 21.1702, lon: 72.8311, state: 'GJ' },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'RJ' },
    { name: 'Indore', lat: 22.7196, lon: 75.8577, state: 'MP' },
    { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'MH' },
    { name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'MH' },
    { name: 'Varanasi', lat: 25.3176, lon: 82.9739, state: 'UP' },
    { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'BR' },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'TS' },
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'KA' },
    { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, state: 'TN' },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'WB' },
    { name: 'Guwahati', lat: 26.1445, lon: 91.7362, state: 'AS' },
    { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'OD' }
  ];

  // Active pinpoint SVG coordinate
  const currentPin = latLonToMapCoords(location.latitude, location.longitude);

  const handleCityPick = (cityObj) => {
    setManualRegion(cityObj);
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 28, 20, 0.72)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2200,
      padding: '16px',
      animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div 
        className="glass-card" 
        style={{
          maxWidth: '820px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(11, 28, 20, 0.35)',
          border: '1px solid rgba(18, 53, 36, 0.12)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #123524 0%, #1b4d36 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={22} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Indian Pinpoint Location & Telemetry Hub
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#b9dcc8', margin: '3px 0 0' }}>
                Rapido-style search, State & City dropdowns, or live GPS pinpointing across India
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLocationModal(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. Fast Rapido-Style Search Bar with Auto-Complete */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f8faf7',
              border: '1.5px solid rgba(18, 53, 36, 0.2)',
              borderRadius: '14px',
              padding: '10px 16px',
              boxShadow: '0 2px 8px rgba(18, 53, 36, 0.04)'
            }}>
              <Search size={18} color="#123524" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                placeholder="Search Indian city, district or mandi (e.g., Meerut, Anand, Ludhiana, Pune, Varanasi)..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  width: '100%',
                  color: '#123524'
                }}
              />
              {searchQuery && (
                <X 
                  size={16} 
                  color="#657e70" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSearchQuery(''); setIsSearching(false); }} 
                />
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearching && searchQuery.trim() && (
              <div style={{
                position: 'absolute',
                top: '52px',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid rgba(18, 53, 36, 0.15)',
                borderRadius: '14px',
                boxShadow: '0 16px 40px rgba(18, 53, 36, 0.16)',
                maxHeight: '260px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '6px'
              }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', fontSize: '0.82rem', color: '#688273' }}>
                    No matching Indian agricultural cities found for "{searchQuery}". Try selecting from dropdowns below.
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
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#edf5f0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={16} color="#10b981" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#123524' }}>
                            {item.city}, {item.state}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#576c60' }}>
                            {item.mandiHub} • {item.agroZone}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                        Select & Pin 📍
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 2. State & City Synchronized Dropdowns + Auto-Detect GPS Button */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* State Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#123524', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                1. Select Indian State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(18, 53, 36, 0.18)',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#123524',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#123524', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                2. Select City / District
              </label>
              <select
                value={location.city || location.district}
                onChange={(e) => handleCityChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(18, 53, 36, 0.18)',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#123524',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {citiesInSelectedState.map(c => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({c.district !== c.city ? `${c.district} Dist.` : 'District'})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Detect Live GPS Button */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#123524', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                3. Live GPS Auto-Fix
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detecting}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#123524',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: detecting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(18, 53, 36, 0.15)'
                }}
              >
                <Navigation size={14} className={detecting ? 'animate-spin' : ''} />
                <span>{detecting ? 'Fixing GPS...' : 'Auto-Detect via GPS'}</span>
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
              fontSize: '0.76rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* 3. Interactive Map of India with Clear City Labels & Glowing Pinpoint */}
          <div style={{
            background: 'linear-gradient(180deg, #f8faf7 0%, #edf5f0 100%)',
            border: '1px solid rgba(18, 53, 36, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} color="#123524" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#123524' }}>
                  Interactive India City Pinpoint Map
                </span>
                <span style={{ fontSize: '0.72rem', color: '#576c60' }}>
                  (Tap any city to pin)
                </span>
              </div>
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(18, 53, 36, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#10b981'
              }}>
                📍 Pinned: {location.city || location.district}, {location.state}
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', justifyContent: 'center' }}>
              <svg
                viewBox="0 0 420 440"
                style={{ width: '100%', height: '100%', maxHeight: '300px' }}
              >
                {/* Background outline */}
                <path
                  d="M 125 50 Q 175 40 215 95 L 260 130 Q 330 140 370 170 L 360 230 Q 320 250 280 235 L 270 310 L 215 410 Q 175 430 155 370 L 130 260 Q 80 220 60 180 L 75 140 Q 110 90 125 50 Z"
                  fill="#eaf2ec"
                  stroke="#123524"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />

                {/* Major Indian Cities Plotted & Clearly Labeled */}
                {DISPLAY_CITIES_ON_MAP.map((c) => {
                  const pt = latLonToMapCoords(c.lat, c.lon);
                  const isCurrentCity = (location.city === c.name) || (location.district === c.name);

                  return (
                    <g 
                      key={c.name}
                      onClick={() => {
                        const fullCity = INDIAN_CITIES_DATABASE.find(x => x.city === c.name) || {
                          city: c.name,
                          state: c.state === 'UP' ? 'Uttar Pradesh' : c.state === 'GJ' ? 'Gujarat' : c.state === 'PB' ? 'Punjab' : c.state === 'MH' ? 'Maharashtra' : c.state,
                          district: c.name,
                          latitude: c.lat,
                          longitude: c.lon,
                          agroZone: 'Regional Agricultural Zone'
                        };
                        handleCityPick(fullCity);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isCurrentCity ? 6 : (c.isSpecial ? 5 : 3.5)}
                        fill={isCurrentCity ? '#f59e0b' : (c.isSpecial ? '#10b981' : '#123524')}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      <text
                        x={pt.x + 6}
                        y={pt.y + 3}
                        fontSize={isCurrentCity ? '9px' : '7.5px'}
                        fontWeight={isCurrentCity ? '900' : (c.isSpecial ? '800' : '600')}
                        fill={isCurrentCity ? '#b45309' : (c.isSpecial ? '#065f46' : '#2d4738')}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {c.name}
                      </text>
                    </g>
                  );
                })}

                {/* Active Rapido-Style Pinpoint Pulse Ring */}
                <circle
                  cx={currentPin.x}
                  cy={currentPin.y}
                  r="12"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  opacity="0.8"
                >
                  <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={currentPin.x}
                  cy={currentPin.y}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* 4. Connected Farmer Location & Proactive Weather Preview Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #10b981',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}>
                  {location.isGps ? '● GPS PINNED' : '● ACTIVE TELEMETRY REGION'}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#688273' }}>
                  {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#123524', marginTop: '4px' }}>
                {location.city || location.district}, {location.state}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#45594e', marginTop: '2px' }}>
                Agro Zone: <strong>{location.agroZone}</strong> • Mandi: <strong>{location.mandiHub || 'APMC Yard'}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              style={{
                background: '#123524',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(18, 53, 36, 0.2)'
              }}
            >
              <CheckCircle2 size={16} color="#10b981" />
              Confirm & Set Location
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
