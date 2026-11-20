import React from 'react';
import { MapPin, Navigation, Compass, CheckCircle2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function LocationBanner({ variant = 'hero' }) {
  const { location, detecting, detectLocation, setShowLocationModal } = useLocation();

  const cityName = location.city || location.district;

  if (variant === 'compact') {
    return (
      <div 
        onClick={() => setShowLocationModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(238, 244, 240, 0.95)',
          border: '1px solid rgba(18, 53, 36, 0.22)',
          padding: '6px 14px',
          borderRadius: '999px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 4px rgba(18, 53, 36, 0.05)'
        }}
        title="Click to search Indian cities, change state/district, or auto-detect GPS"
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: location.isGps ? '#10b981' : '#f59e0b',
          boxShadow: location.isGps ? '0 0 8px #10b981' : '0 0 6px #f59e0b'
        }} />
        <MapPin size={14} color="#123524" />
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#123524', whiteSpace: 'nowrap' }}>
          {cityName}, {location.state}
        </span>
        <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, paddingLeft: '2px' }}>
          Change
        </span>
      </div>
    );
  }

  // Full Rich Banner
  return (
    <div 
      className="glass-card" 
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%)',
        border: '1px solid rgba(18, 53, 36, 0.12)',
        borderRadius: '18px',
        padding: '18px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Info: Location details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#123524',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(18, 53, 36, 0.2)'
        }}>
          <MapPin size={22} color="#f59e0b" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#2d6a4f'
            }}>
              Active Agricultural Location
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: location.isGps ? '#dcfce7' : '#fef3c7',
              color: location.isGps ? '#15803d' : '#92400e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: location.isGps ? '#16a34a' : '#f59e0b'
              }} />
              {location.isGps ? 'Live GPS Active' : 'Pinned Location'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#123524', margin: 0 }}>
              {cityName}, {location.state}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#576c60', fontWeight: 600 }}>
              ({location.agroZone})
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#688273', marginTop: '2px' }}>
            Coordinates: {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E • Mandi Hub: {location.mandiHub || `${cityName} APMC Mandi`}
          </div>
        </div>
      </div>

      {/* Right Actions: Search / Change Pinpoint or Auto-Detect GPS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={detectLocation}
          disabled={detecting}
          className="btn-secondary"
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Auto-detect current location using your device GPS"
        >
          <Navigation size={13} className={detecting ? 'animate-spin' : ''} />
          {detecting ? 'Locating...' : 'GPS Auto-Detect'}
        </button>

        <button
          onClick={() => setShowLocationModal(true)}
          className="btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Compass size={14} />
          Select City / Pinpoint Map
        </button>
      </div>
    </div>
  );
}
