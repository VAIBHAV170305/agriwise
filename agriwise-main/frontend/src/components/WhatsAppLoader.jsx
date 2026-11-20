import React from 'react';

/**
 * WhatsApp-style Organic Pulsing Dots Loader
 * Smooth micro-interaction with staggered organic bounce and customizable labels.
 */
export default function WhatsAppLoader({ 
  size = 10, 
  color = '#25D366', 
  label = '', 
  centered = true 
}) {
  return (
    <div 
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: centered ? 'center' : 'flex-start',
        gap: '8px',
        padding: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: `${size * 0.7}px` }}>
        <span 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'whatsappDot 1.4s ease-in-out 0s infinite both'
          }} 
        />
        <span 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'whatsappDot 1.4s ease-in-out 0.2s infinite both'
          }} 
        />
        <span 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'whatsappDot 1.4s ease-in-out 0.4s infinite both'
          }} 
        />
      </div>

      {label && (
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-secondary, #4a5c52)', 
          fontWeight: 600,
          letterSpacing: '0.01em'
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
