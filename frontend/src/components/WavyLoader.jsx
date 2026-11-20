import React from 'react';

/**
 * Google Play Store Style Wavy Download / Progress Bar
 * Uses an animated oscillating SVG wave path with smooth gradient easing.
 */
export default function WavyLoader({ 
  height = 8, 
  color = '#2d6a4f', 
  label = 'Processing agronomic data...', 
  showLabel = true 
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {showLabel && (
        <div style={{ 
          fontSize: '0.78rem', 
          color: 'var(--text-secondary, #4a5c52)', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{label}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #75867d)' }}>Please wait</span>
        </div>
      )}

      {/* Wavy Animated Track Container */}
      <div 
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'rgba(45, 106, 79, 0.12)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Continuous oscillating wave SVG */}
        <div 
          className="wavy-bar-inner"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: `linear-gradient(90deg, transparent 0%, ${color} 40%, #52b788 70%, transparent 100%)`,
            animation: 'wavySlide 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />

        {/* Overlay Wave Pattern */}
        <svg 
          viewBox="0 0 800 20" 
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '200%',
            height: '100%',
            opacity: 0.45,
            animation: 'wavySine 1.2s linear infinite'
          }}
        >
          <path 
            d="M 0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10 T 500 10 T 600 10 T 700 10 T 800 10 L 800 20 L 0 20 Z" 
            fill={color} 
          />
        </svg>
      </div>
    </div>
  );
}
