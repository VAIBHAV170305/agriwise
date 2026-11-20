import React from 'react';

/**
 * Google Play Store Inspired Wavy Progressive Line Loader
 * Features undulating sinusoidal waves that continuously flow with 
 * smooth ease-in-out rhythm, agricultural emerald & harvest amber accents.
 */
export default function WavyProgressLoader({ 
  text = 'Processing agronomic telemetry...', 
  compact = false,
  color = '#10b981',
  accentColor = '#f59e0b'
}) {
  return (
    <div className="wavy-loader-container" style={{ width: '100%', padding: compact ? '4px 0' : '16px 0' }}>
      {text && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#16382a'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="wavy-pulsing-dot" />
            {text}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#688273', fontFamily: 'var(--font-mono)' }}>
            LIVE SYNC
          </span>
        </div>
      )}

      {/* Play Store Wavy Track */}
      <div 
        className="wavy-track" 
        style={{
          position: 'relative',
          width: '100%',
          height: compact ? '4px' : '6px',
          background: 'rgba(22, 56, 42, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}
      >
        {/* Animated progressive wave bar */}
        <div 
          className="wavy-bar-indeterminate" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '100%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${color} 25%, 
              ${accentColor} 50%, 
              ${color} 75%, 
              transparent 100%
            )`
          }}
        />
        
        {/* Secondary undulating wave overlay */}
        <div 
          className="wavy-bar-subtle" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '60%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              #34d399 50%, 
              transparent 100%
            )`
          }}
        />
      </div>

      {/* Sine Wave Graphic for prominent states */}
      {!compact && (
        <div style={{ marginTop: '6px', overflow: 'hidden', height: '14px', opacity: 0.85 }}>
          <svg 
            className="wavy-svg-flow"
            width="200%" 
            height="14" 
            viewBox="0 0 800 14" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <path 
              d="M 0 7 Q 25 1, 50 7 T 100 7 T 150 7 T 200 7 T 250 7 T 300 7 T 350 7 T 400 7 T 450 7 T 500 7 T 550 7 T 600 7 T 650 7 T 700 7 T 750 7 T 800 7" 
              stroke="url(#playStoreWaveGrad)" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
            <defs>
              <linearGradient id="playStoreWaveGrad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
