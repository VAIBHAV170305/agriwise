import React, { useState, useEffect } from 'react';
import { Sprout, Sun, CloudRain, ShieldCheck, TrendingUp, Award, Heart } from 'lucide-react';

const MASCOT_TIPS = [
  {
    title: "Soil Nutrient Optimization",
    desc: "Soil testing before sowing saves up to 25% on chemical N-P-K fertilizer and preserves soil microbes.",
    badge: "ICAR Agronomy"
  },
  {
    title: "Proactive Disease Prevention",
    desc: "Rakshak AI detects leaf rust, powdery mildew, and blight within 2 seconds using multi-spectral computer vision.",
    badge: "Crop Protection"
  },
  {
    title: "Fair APMC Mandi Prices",
    desc: "Compare modal prices across 250+ mandis directly to sell at the peak of the market demand curve.",
    badge: "Direct Commerce"
  },
  {
    title: "Smart Irrigation Scheduling",
    desc: "Weather-linked soil moisture telemetry prevents root rot and cuts diesel/electricity pumping costs by 30%.",
    badge: "Water Conservation"
  }
];

export default function FarmingMascot({ compact = false }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % MASCOT_TIPS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentTip = MASCOT_TIPS[tipIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: compact ? '360px' : '460px',
      margin: '0 auto',
      userSelect: 'none'
    }}>
      {/* Background Agrarian Aura Glow */}
      <div style={{
        position: 'absolute',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(82, 183, 136, 0.22) 0%, rgba(22, 51, 38, 0.02) 70%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        zIndex: 0
      }} />

      {/* Mascot Graphic Artwork (SVG) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: compact ? '200px' : '260px',
        height: compact ? '200px' : '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg 
          viewBox="0 0 280 280" 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible', filter: 'drop-shadow(0 12px 24px rgba(22, 51, 38, 0.18))' }}
        >
          <defs>
            <linearGradient id="turbanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e76f51" />
              <stop offset="50%" stopColor="#f4a261" />
              <stop offset="100%" stopColor="#e76f51" />
            </linearGradient>
            <linearGradient id="vestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#163326" />
              <stop offset="100%" stopColor="#2d6a4f" />
            </linearGradient>
            <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0efe9" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52b788" />
              <stop offset="100%" stopColor="#2d6a4f" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd8b8" />
              <stop offset="100%" stopColor="#f4b282" />
            </linearGradient>
          </defs>

          {/* Golden Wheat Halo */}
          <circle cx="140" cy="140" r="115" fill="none" stroke="rgba(212, 163, 115, 0.28)" strokeWidth="2.5" strokeDasharray="6 6" />
          <circle cx="140" cy="140" r="128" fill="none" stroke="rgba(82, 183, 136, 0.2)" strokeWidth="1.5" />

          {/* Floating Leaves & Weather Elements */}
          <g className="pulse-critical" style={{ transformOrigin: '230px 60px' }}>
            <circle cx="230" cy="60" r="16" fill="#fefae0" stroke="#d4a373" strokeWidth="1.5" />
            <path d="M 230 48 Q 242 60 230 72 Q 218 60 230 48" fill="#52b788" />
          </g>
          <g style={{ transformOrigin: '45px 85px' }}>
            <circle cx="50" cy="85" r="14" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.2" />
            <path d="M 45 88 Q 50 78 55 88 Z" fill="#2d6a4f" />
          </g>

          {/* Body: Kurta (White Linen) */}
          <path d="M 75 250 C 80 200, 100 178, 140 178 C 180 178, 200 200, 205 250 Z" fill="url(#kurtaGrad)" stroke="#d5e0d9" strokeWidth="2" />

          {/* Nehru Agritech Vest (Deep Forest Green) */}
          <path d="M 90 250 C 95 208, 110 182, 140 182 C 170 182, 185 208, 190 250 L 165 250 L 140 205 L 115 250 Z" fill="url(#vestGrad)" />
          {/* Smart Field Badge */}
          <rect x="155" y="210" width="18" height="12" rx="3" fill="#52b788" />
          <circle cx="164" cy="216" r="3" fill="#ffffff" />

          {/* Neck */}
          <rect x="127" y="152" width="26" height="28" rx="6" fill="url(#skinGrad)" />

          {/* Head */}
          <ellipse cx="140" cy="130" rx="44" ry="46" fill="url(#skinGrad)" />

          {/* Ears */}
          <ellipse cx="94" cy="132" rx="9" ry="13" fill="url(#skinGrad)" />
          <ellipse cx="186" cy="132" rx="9" ry="13" fill="url(#skinGrad)" />

          {/* Smart Agronomy Earphone / Headset */}
          <path d="M 186 130 Q 194 130 192 144 Q 186 156 168 158" fill="none" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="186" cy="132" r="5" fill="#52b788" />
          <circle cx="166" cy="158" r="3" fill="#163326" />

          {/* Indian Saffron / Ochre Turban (Pagri) */}
          <path d="M 88 120 C 82 85, 110 50, 140 50 C 175 50, 198 85, 192 120 C 180 92, 160 84, 140 84 C 120 84, 100 92, 88 120 Z" fill="url(#turbanGrad)" />
          {/* Turban Folds */}
          <path d="M 95 98 Q 140 68 185 98" fill="none" stroke="#c95a3f" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 100 112 Q 140 82 180 112" fill="none" stroke="#d96a4a" strokeWidth="3" strokeLinecap="round" />
          {/* Turban Crest Leaf Jewel */}
          <circle cx="140" cy="65" r="8" fill="#52b788" stroke="#ffffff" strokeWidth="2" />
          <path d="M 140 54 Q 148 64 140 74 Q 132 64 140 54" fill="#ffffff" />

          {/* Eyebrows */}
          <path d="M 112 114 Q 124 110 132 115" fill="none" stroke="#4a2810" strokeWidth="3" strokeLinecap="round" />
          <path d="M 148 115 Q 156 110 168 114" fill="none" stroke="#4a2810" strokeWidth="3" strokeLinecap="round" />

          {/* Friendly Eyes */}
          <ellipse cx="123" cy="126" rx="6" ry="7" fill="#2d1c10" />
          <ellipse cx="157" cy="126" rx="6" ry="7" fill="#2d1c10" />
          {/* Eye Sparkles */}
          <circle cx="125" cy="124" r="2.2" fill="#ffffff" />
          <circle cx="159" cy="124" r="2.2" fill="#ffffff" />

          {/* Nose */}
          <path d="M 140 125 L 140 137 Q 140 142 144 142" fill="none" stroke="#d49266" strokeWidth="2.5" strokeLinecap="round" />

          {/* Genuine Warm Smile */}
          <path d="M 124 150 Q 140 164 156 150" fill="none" stroke="#9e3b24" strokeWidth="3" strokeLinecap="round" />
          {/* Rosy Cheeks */}
          <ellipse cx="110" cy="138" rx="8" ry="5" fill="rgba(231, 111, 81, 0.22)" />
          <ellipse cx="170" cy="138" rx="8" ry="5" fill="rgba(231, 111, 81, 0.22)" />

          {/* Sprout Sprig in Hand (Left side of chest) */}
          <g>
            <path d="M 70 215 Q 78 185 86 175" fill="none" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" />
            <path d="M 86 175 C 92 165, 104 168, 102 178 C 95 186, 88 180, 86 175 Z" fill="url(#leafGrad)" />
            <path d="M 82 185 C 72 180, 68 190, 75 195 C 80 196, 82 190, 82 185 Z" fill="url(#leafGrad)" />
          </g>
        </svg>
      </div>

      {/* Mascot Nameplate */}
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #163326 0%, #204b38 100%)',
          color: '#ffffff',
          padding: '4px 14px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(22, 51, 38, 0.16)'
        }}>
          <Sprout size={14} color="#52b788" />
          <span style={{ fontSize: '0.84rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Kisan Mitra (किसान मित्र)
          </span>
          <span style={{
            fontSize: '0.62rem',
            background: '#52b788',
            color: '#163326',
            fontWeight: 800,
            padding: '1px 6px',
            borderRadius: '6px',
            textTransform: 'uppercase'
          }}>
            AI Mascot
          </span>
        </div>
      </div>

      {/* Interactive Agricultural Wisdom Card */}
      <div 
        onClick={() => setTipIndex((tipIndex + 1) % MASCOT_TIPS.length)}
        title="Click to view next agronomy tip"
        style={{
          marginTop: '16px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px 18px',
          border: '1.5px solid rgba(82, 183, 136, 0.35)',
          boxShadow: '0 8px 24px rgba(22, 51, 38, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#2d6a4f';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(22, 51, 38, 0.14)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(82, 183, 136, 0.35)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 51, 38, 0.08)';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326' }}>
              {currentTip.title}
            </span>
          </div>
          <span style={{
            fontSize: '0.64rem',
            fontWeight: 700,
            color: '#2d6a4f',
            background: '#edf5f0',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {currentTip.badge}
          </span>
        </div>

        <p style={{
          fontSize: '0.78rem',
          color: '#4b6354',
          lineHeight: 1.45,
          margin: 0
        }}>
          "{currentTip.desc}"
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
          fontSize: '0.68rem',
          color: '#8b9f93'
        }}>
          <span>Click card for next tip</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {MASCOT_TIPS.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === tipIndex ? '14px' : '5px',
                  height: '5px',
                  borderRadius: '3px',
                  background: idx === tipIndex ? '#2d6a4f' : '#d5e0d9',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
