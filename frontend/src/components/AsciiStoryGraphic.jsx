import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Sun, CloudRain, Droplets, Zap, ShieldCheck, 
  IndianRupee, Sparkles, Activity, CheckCircle2, ArrowUpRight, 
  Thermometer, Wind, Eye, Cpu, Radio, BarChart2, Sprout, Layers
} from 'lucide-react';
import { RakshakIcon } from './RakshakLogo';

const CHAPTERS = [
  {
    id: 1,
    tabLabel: '1 Soil & Sowing',
    title: '1. Sowing & Soil Intelligence (बीज रोपण)',
    subtitle: 'Farmer Ramesh tests soil NPK & sows certified seeds under morning sun',
    weather: 'Sunny • 24°C',
    weatherIcon: <Sun size={14} color="#f59e0b" />,
    telemetry: 'Soil Moisture: 38% • pH: 6.8 Optimal • NPK Sensors Synced',
    badge: 'IoT Soil Sensor Active',
    badgeColor: '#10b981'
  },
  {
    id: 2,
    tabLabel: '2 Monsoon Radar',
    title: '2. Weather Shift & Monsoon (मेघ & सिंचन)',
    subtitle: 'Monsoon arrives. Drip irrigation auto-adjusts based on rainfall forecast',
    weather: 'Monsoon Showers • 21°C',
    weatherIcon: <CloudRain size={14} color="#38bdf8" />,
    telemetry: 'Rainfall: 19.4mm Expected • Drip Valve: AUTO-HALT • Saved 3,200L',
    badge: 'Radar Early Warning',
    badgeColor: '#38bdf8'
  },
  {
    id: 3,
    tabLabel: '3 Rakshak AI',
    title: '3. Rakshak AI Guardian (पौध संरक्षण)',
    subtitle: 'Rakshak AI vision scan detects foliar pest risk early; organic neem advisory deployed',
    weather: 'Clear Skies • 26°C',
    weatherIcon: <Sparkles size={14} color="#34d399" />,
    telemetry: 'Canopy Health: 99.2% • Pathogen: 0% Blight • ICAR Protocols Verified',
    badge: 'Computer Vision Online',
    badgeColor: '#34d399'
  },
  {
    id: 4,
    tabLabel: '4 Digital Mandi',
    title: '4. Bumper Harvest & Mandi (समृद्धि & लाभ)',
    subtitle: 'Direct B2B Mandi contract signed! Fair digital weighing and instant rupee payment',
    weather: 'Golden Harvest • 28°C',
    weatherIcon: <IndianRupee size={14} color="#fbbf24" />,
    telemetry: 'Harvest: 24.5 Qtl • Payout: ₹60,760 Instant Escrow • 0% Broker Cut',
    badge: 'e-NAM Direct Payout',
    badgeColor: '#fbbf24'
  }
];

export default function AsciiStoryGraphic({ compact = false }) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance scenes every 5.5 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % CHAPTERS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = CHAPTERS[activeChapter];

  return (
    <div 
      className="glass-card" 
      style={{
        background: 'linear-gradient(155deg, #0c2017 0%, #07140e 100%)',
        border: '1px solid rgba(52, 211, 153, 0.22)',
        borderRadius: '24px',
        padding: compact ? '16px' : '24px',
        color: '#d1fae5',
        boxShadow: '0 20px 50px rgba(5, 18, 12, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* 1. Terminal Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1px solid rgba(52, 211, 153, 0.14)',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Mac-Style Window Dots & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ 
              fontSize: '0.74rem', 
              color: '#6ee7b7', 
              fontWeight: 800, 
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              BHARAT AGRI-STACK // LIVE FIELD CHRONICLE
            </span>
          </div>
        </div>

        {/* Live Weather Indicator Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3px 12px',
          borderRadius: '999px',
          fontSize: '0.74rem',
          color: '#a7f3d0',
          fontWeight: 600
        }}>
          {current.weatherIcon}
          <span>{current.weather}</span>
        </div>
      </div>

      {/* 2. Chapter Navigation Pills & Auto-Cycle Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '8px', 
        marginBottom: '16px', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CHAPTERS.map((ch, idx) => {
            const isActive = activeChapter === idx;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapter(idx);
                  setIsPlaying(false);
                }}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #164e33 0%, #103b27 100%)' : 'rgba(255, 255, 255, 0.04)',
                  border: isActive ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.07)',
                  color: isActive ? '#ecfdf5' : '#9ca3af',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '0.73rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isActive ? '#34d399' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#064e3b' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.66rem',
                  fontWeight: 900
                }}>
                  {idx + 1}
                </span>
                <span>{ch.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Auto-Cycle Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: isPlaying ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            color: isPlaying ? '#6ee7b7' : '#fcd34d',
            borderRadius: '999px',
            cursor: 'pointer',
            padding: '5px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease'
          }}
          title={isPlaying ? 'Pause visual tour' : 'Auto-advance through story scenes'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'Auto-Cycle ON' : 'Paused'}</span>
        </button>
      </div>

      {/* 3. Scene Title & Agricultural Context */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h4 style={{ 
            fontSize: '1.05rem', 
            fontWeight: 800, 
            color: '#f0fdf4', 
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            {current.title}
          </h4>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: current.badgeColor,
            border: `1px solid ${current.badgeColor}40`
          }}>
            {current.badge}
          </span>
        </div>
        <p style={{ 
          fontSize: '0.82rem', 
          color: '#a7f3d0', 
          marginTop: '3px', 
          marginBottom: 0,
          lineHeight: 1.4 
        }}>
          {current.subtitle}
        </p>
      </div>

      {/* 4. VISUAL STORYTELLING CANVAS (Modern Graphic Cards per Chapter) */}
      <div style={{
        background: 'rgba(5, 17, 11, 0.75)',
        border: '1px solid rgba(52, 211, 153, 0.16)',
        borderRadius: '16px',
        padding: compact ? '14px' : '18px',
        boxShadow: 'inset 0 2px 14px rgba(0, 0, 0, 0.45)',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* ================= CHAPTER 1: SOWING & SOIL ================= */}
        {activeChapter === 0 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* SVG Farm Landscape & Germinating Seeds */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(30, 64, 45, 0.4) 0%, rgba(13, 31, 23, 0.8) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <Sprout size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f0fdf4' }}>
                    Certified HD-3226 Sharbati Wheat
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7' }}>
                    Sub-Surface Sowing • 99% Germination Index
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '4px 10px',
                borderRadius: '8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700 }}>SOIL pH</div>
                <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 900 }}>6.8 <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Optimal</span></div>
              </div>
            </div>

            {/* Precision NPK Sensor Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              {/* Nitrogen */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 800 }}>NITROGEN (N)</span>
                  <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>84%</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                  42 <span style={{ fontSize: '0.7rem', color: '#a7f3d0', fontWeight: 600 }}>mg/kg</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '84%', height: '100%', background: '#10b981', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Phosphorus */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 800 }}>PHOSPHORUS (P)</span>
                  <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>65%</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                  18 <span style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 600 }}>mg/kg</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Potassium */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 800 }}>POTASSIUM (K)</span>
                  <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700 }}>78%</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                  24 <span style={{ fontSize: '0.7rem', color: '#bae6fd', fontWeight: 600 }}>mg/kg</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: '#38bdf8', borderRadius: '999px' }} />
                </div>
              </div>
            </div>

            {/* Moisture & Probe Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.18)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a7f3d0' }}>
                <Droplets size={14} color="#34d399" />
                <span>Volumetric Soil Moisture: <strong>38% (Root Zone Ideal)</strong></span>
              </div>
              <span style={{ color: '#34d399', fontWeight: 800 }}>• Active Field Telemetry</span>
            </div>
          </div>
        )}

        {/* ================= CHAPTER 2: MONSOON & WEATHER RADAR ================= */}
        {activeChapter === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Doppler Weather Alert Hero */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                }}>
                  <CloudRain size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f0fdf4' }}>
                    Satellite Doppler Alert: Rain in 4 Days
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#7dd3fc' }}>
                    ~19.4 mm Rainfall on Tuesday (85% Probability)
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '4px 10px',
                borderRadius: '8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 800 }}>ACTION TRIGGER</div>
                <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 800 }}>POSTPONE PUMP</div>
              </div>
            </div>

            {/* Smart Irrigation Automation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 700 }}>IOT DRIP VALVE</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  AUTO-PAUSED
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Saves ~₹1,400 Diesel
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 700 }}>WATER HARVEST</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                  85% Capacity
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  +3,200L Stored
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 700 }}>SPRAY DRIFT</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                  8.4 km/h Calm
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Safe Next 48h
                </div>
              </div>
            </div>

            {/* Spray Window Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#bae6fd' }}>
                <Wind size={14} color="#38bdf8" />
                <span>Chemical/Foliar Spray Window: <strong>OPEN TODAY • Closes 48h prior to rain</strong></span>
              </div>
              <span style={{ color: '#38bdf8', fontWeight: 800 }}>• Automated Sync</span>
            </div>
          </div>
        )}

        {/* ================= CHAPTER 3: RAKSHAK AI GUARDIAN ================= */}
        {activeChapter === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Computer Vision Viewfinder HUD */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(2, 44, 34, 0.8) 100%)',
              border: '1.5px solid rgba(52, 211, 153, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Scanline effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #34d399, transparent)',
                animation: 'radarPulse 2s ease-in-out infinite'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                }}>
                  <RakshakIcon size={24} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f0fdf4' }}>
                    Rakshak Vision AI: Plot #4 Sharbati Wheat
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7' }}>
                    Real-time ExG Leaf Foliar Segmentation (25+ Pathogen Matrix)
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '4px 10px',
                borderRadius: '8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 800 }}>DIAGNOSIS</div>
                <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 900 }}>HEALTHY (99.4%)</div>
              </div>
            </div>

            {/* AI Diagnostics Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 700 }}>CANOPY INDEX</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  99.2% Healthy
                </div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '2px' }}>
                  Zero Blight / Rust
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 700 }}>ICAR PROTOCOL</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  Bio-Defense
                </div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginTop: '2px' }}>
                  Organic Neem Advisory
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 700 }}>VOICE ADVISORY</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  Audio Ready
                </div>
                <div style={{ fontSize: '0.68rem', color: '#fbbf24', marginTop: '2px' }}>
                  Hindi, Guj, Mar, Tel
                </div>
              </div>
            </div>

            {/* Prescribed preventive treatment */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a7f3d0' }}>
                <CheckCircle2 size={14} color="#34d399" />
                <span>ICAR Standard Treatment: <strong>Azadirachtin 0.03% (Neem Oil) 5ml/L preventive spray</strong></span>
              </div>
              <span style={{ color: '#34d399', fontWeight: 800 }}>• 100% Grounded</span>
            </div>
          </div>
        )}

        {/* ================= CHAPTER 4: BUMPER HARVEST & DIGITAL MANDI ================= */}
        {activeChapter === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Live B2B Contract Payout Hero */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.3) 0%, rgba(26, 18, 5, 0.7) 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
                }}>
                  <IndianRupee size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f0fdf4' }}>
                    Direct B2B Mandi Escrow Settlement
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#fde68a' }}>
                    24.5 Quintals Sharbati Wheat • Instant Bank UPI
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                padding: '4px 10px',
                borderRadius: '8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#fde68a', fontWeight: 800 }}>NET PAYOUT</div>
                <div style={{ fontSize: '1rem', color: '#fef08a', fontWeight: 900 }}>₹60,760</div>
              </div>
            </div>

            {/* Price Corridors & Zero-Cut Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 700 }}>AGRIWISE RATE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fef08a', marginTop: '2px' }}>
                  ₹2,480 <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/Qtl</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                  +8.4% Above MSP
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>GOVT MSP</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  ₹2,275 <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/Qtl</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
                  Official Baseline
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 700 }}>BROKER COMMISSION</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                  0%
                </div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '2px' }}>
                  Saved ₹3,600 Cut
                </div>
              </div>
            </div>

            {/* Traceability & Smart Weighing */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fef08a' }}>
                <ShieldCheck size={14} color="#f59e0b" />
                <span>e-NAM Trade Certificate: <strong>Batch #WB-2026-881 • Instant UPI to Farmer Ramesh</strong></span>
              </div>
              <span style={{ color: '#fbbf24', fontWeight: 800 }}>• Instant Settlement</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Live Telemetry Strip below visual canvas */}
      <div style={{
        marginTop: '14px',
        padding: '9px 14px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(52, 211, 153, 0.16)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '0.73rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase' }}>
            TELEMETRY:
          </span>
          <span style={{ color: '#d1fae5', fontWeight: 600 }}>
            {current.telemetry}
          </span>
        </div>

        <span style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700 }}>
          LIVE SATELLITE SYNC
        </span>
      </div>

      {/* Auto-cycle indicator bar */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 50%, #f59e0b 100%)',
          animation: 'storyProgress 5.5s linear infinite',
          width: '100%'
        }} />
      )}
    </div>
  );
}
