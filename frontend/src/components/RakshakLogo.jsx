import React from 'react';

/**
 * Custom Brand Mark for Rakshak AI (AgriWise AI Protector)
 * Distinct proprietary identity incorporating the Letter 'R', an organic leaf curve,
 * and a protective agronomic shield. Replaces generic sparkle icons.
 */
export function RakshakIcon({ size = 20, color = 'currentColor', className = '', style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="rakshakGreenGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dc653" />
          <stop offset="60%" stopColor="#1b4332" />
          <stop offset="100%" stopColor="#081c15" />
        </linearGradient>
        <linearGradient id="rakshakLeafGrad" x1="10" y1="4" x2="20" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#52b788" />
          <stop offset="100%" stopColor="#2d6a4f" />
        </linearGradient>
      </defs>

      {/* Protective Agronomic Shield Base */}
      <path 
        d="M12 2.5 L4 5.5 V11 C4 16.5 7.5 21.2 12 22.5 C16.5 21.2 20 16.5 20 11 V5.5 L12 2.5 Z" 
        stroke={color === 'currentColor' ? 'currentColor' : color} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />

      {/* Distinct stylized 'R' Stem (Vertical spine of R) */}
      <path 
        d="M8.5 7.5 V17.5" 
        stroke={color === 'currentColor' ? 'currentColor' : color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />

      {/* Intertwined Organic Leaf forming the upper bowl of the 'R' */}
      <path 
        d="M8.5 7.5 H12.8 C15.4 7.5 16.6 9.1 16.4 11.2 C16.1 13.1 14.5 13.9 12.5 13.9 H8.5" 
        stroke={color === 'currentColor' ? 'currentColor' : color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Central Botanical Leaf Vein inside R's loop */}
      <path 
        d="M10.5 8.2 C13 8.8 15.2 10.2 13 12.8" 
        stroke="#52b788" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
      />

      {/* Dynamic Descending Leg of 'R' with leaf blade curvature */}
      <path 
        d="M12.5 13.9 L16.2 17.5" 
        stroke={color === 'currentColor' ? 'currentColor' : color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />

      {/* Tiny sprout leaf apex crowning the shield */}
      <circle cx="12" cy="2.5" r="1.2" fill="#2dc653" />
    </svg>
  );
}

/**
 * Full Rakshak Logo with typography and shield badge
 */
export default function RakshakLogo({ size = 32, showText = true, layout = 'row' }) {
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: layout === 'column' ? '6px' : '10px',
      flexDirection: layout === 'column' ? 'column' : 'row'
    }}>
      <div style={{
        width: `${size + 8}px`,
        height: `${size + 8}px`,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #163326 0%, #204b39 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(22, 51, 38, 0.22)',
        border: '1px solid rgba(82, 183, 136, 0.3)',
        flexShrink: 0
      }}>
        <RakshakIcon size={size} color="#d8f3dc" />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: layout === 'column' ? 'center' : 'left' }}>
          <div style={{ 
            fontSize: `${Math.max(14, size * 0.44)}px`, 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            color: 'var(--text-primary)',
            fontFamily: "'Fraunces', serif",
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>Rakshak</span>
            <span style={{ 
              fontSize: '0.62em', 
              padding: '1px 6px', 
              borderRadius: '4px', 
              background: '#e8efe9', 
              color: '#1b382b', 
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              AI
            </span>
          </div>
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            Agronomy Shield
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated Pill Badge for Rakshak AI features
 */
export function RakshakBadge({ text = 'Rakshak AI Engine', variant = 'default' }) {
  const isCritical = variant === 'critical';

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.74rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        background: isCritical ? '#fff5f5' : '#eef6f0',
        color: isCritical ? '#b91c1c' : '#1b4332',
        border: isCritical ? '1px solid #fca5a5' : '1px solid #c9e4ca',
        boxShadow: isCritical ? '0 1px 4px rgba(217, 4, 41, 0.12)' : '0 1px 4px rgba(27, 56, 43, 0.06)'
      }}
    >
      <RakshakIcon size={13} color={isCritical ? '#d90429' : '#2d6a4f'} />
      <span>{text}</span>
    </span>
  );
}
