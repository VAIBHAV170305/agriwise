import React from 'react';

/**
 * Custom Agri-Wise Brand & AI Logo
 * Replaces generic cyclic arrows and stars AI icons with a bespoke,
 * high-contrast agricultural intelligence emblem: an organic leaf fused with
 * neural data contours and harvest gold accent nodes.
 */
export default function CustomAgriLogo({ 
  size = 36, 
  variant = 'full', // 'full' | 'icon' | 'ai'
  inverted = false,
  className = ''
}) {
  const iconSvg = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      className={className}
    >
      <defs>
        {/* Emerald Agricultural Gradient */}
        <linearGradient id="agriEmeraldGrad" x1="6" y1="42" x2="38" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d2b1d" />
          <stop offset="50%" stopColor="#1b4d36" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Harvest Amber AI Intelligence Accent */}
        <linearGradient id="harvestAmberGrad" x1="18" y1="6" x2="42" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Soft Ambient Glow */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Badge Container (Optional Rounding) */}
      <rect 
        x="2" 
        y="2" 
        width="44" 
        height="44" 
        rx="12" 
        fill={inverted ? '#ffffff' : '#123524'} 
        stroke={inverted ? 'rgba(27, 56, 43, 0.12)' : 'rgba(255, 255, 255, 0.1)'} 
        strokeWidth="1.2"
      />

      {/* Central Sprout Stem */}
      <path 
        d="M24 40 V22" 
        stroke={inverted ? '#123524' : '#6ee7b7'} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Left Leaf Blade - Earth & Biology */}
      <path 
        d="M24 28 C16 28 11 22 13 14 C18 14 24 19 24 28 Z" 
        fill={inverted ? '#1b4d36' : 'url(#agriEmeraldGrad)'} 
        stroke={inverted ? '#123524' : '#34d399'} 
        strokeWidth="1.2"
      />

      {/* Right Leaf Blade - Neural AI & Precision Telemetry */}
      <path 
        d="M24 22 C32 20 37 13 35 7 C29 8 24 14 24 22 Z" 
        fill="url(#harvestAmberGrad)" 
        stroke="#fef3c7" 
        strokeWidth="1.2"
        filter="url(#softGlow)"
      />

      {/* Neural AI Nodes & Circuit Connections */}
      <circle cx="33" cy="9" r="2.2" fill="#ffffff" />
      <circle cx="37" cy="19" r="1.8" fill="#fef3c7" />
      <path 
        d="M33 9 L37 19 L26 23" 
        stroke="#ffffff" 
        strokeWidth="1" 
        strokeDasharray="2 2" 
        opacity="0.85" 
      />

      {/* Base Earth Soil Anchor Arc */}
      <path 
        d="M15 40 Q24 42 33 40" 
        stroke={inverted ? '#2d6a4f' : '#34d399'} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );

  if (variant === 'icon') {
    return iconSvg;
  }

  if (variant === 'ai') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {iconSvg}
        <div>
          <div style={{ 
            fontSize: '0.86rem', 
            fontWeight: 800, 
            letterSpacing: '-0.01em', 
            color: inverted ? '#ffffff' : '#123524',
            lineHeight: 1
          }}>
            Rakshak AI
          </div>
          <div style={{ 
            fontSize: '0.62rem', 
            fontWeight: 700, 
            letterSpacing: '0.12em', 
            color: inverted ? '#a7f3d0' : '#f59e0b',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: '3px'
          }}>
            Agronomic Copilot
          </div>
        </div>
      </div>
    );
  }

  // Full Brand Logo
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
      {iconSvg}
      <div>
        <div style={{ 
          fontSize: '1.28rem', 
          fontWeight: 800, 
          letterSpacing: '-0.03em', 
          color: inverted ? '#ffffff' : '#123524',
          lineHeight: 1.05,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
          agriwise
        </div>
        <div style={{ 
          fontSize: '0.62rem', 
          fontWeight: 700, 
          letterSpacing: '0.18em', 
          color: inverted ? '#6ee7b7' : '#527964', 
          textTransform: 'uppercase',
          lineHeight: 1,
          marginTop: '3px'
        }}>
          FIELD DESK
        </div>
      </div>
    </div>
  );
}
