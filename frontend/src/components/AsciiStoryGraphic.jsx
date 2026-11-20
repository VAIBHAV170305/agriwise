import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, Sun, CloudRain, ShieldCheck, IndianRupee } from 'lucide-react';
import { RakshakIcon } from './RakshakLogo';

const CHAPTERS = [
  {
    id: 1,
    title: '1. Sowing & Soil (बीज रोपण)',
    subtitle: 'Farmer Ramesh tests soil NPK & sows certified seeds under morning sun',
    weather: 'Sunny • 24°C',
    metric: 'Soil Moisture: 38% • pH: 6.8 Optimal',
    icon: <Sun size={15} color="#e69c24" />,
    ascii: [
      "        \\   |   /                 _   _   _",
      "      '  .-----.  '              ' ) ( ) ( )",
      "    --  (   SUN   )  --           =( BHARAT )=",
      "      .  '-----'  .                 \\_/_/ \\_/",
      "        /   |   \\",
      "                                       [FARMER]",
      "   ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~    (o_o) < Namaste!",
      "  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\   <|---|~ [Seed Bag]",
      " ===================================    /   \\",
      "   .    .    .    .    .    .    .    .   |   .",
      "  (o)  (o)  (o)  (o)  (o)  (o)  (o)  (o) (o)  (o)  <- Seeds Sown",
      " ##################################################",
      " >>> NPK SENSOR: Nitrogen 42mg | Phosphorus 18mg | Potassium 24mg"
    ]
  },
  {
    id: 2,
    title: '2. Weather Shift & Monsoon (मेघ & सिंचन)',
    subtitle: 'Monsoon arrives. Drip irrigation auto-adjusts based on rainfall forecast',
    weather: 'Monsoon Showers • 21°C',
    metric: 'Rainfall: 14mm Expected • Drip Valve: AUTO-HALT',
    icon: <CloudRain size={15} color="#3b82f6" />,
    ascii: [
      "       .---.       .---.            .---.",
      "      (  _  )     (     )          (  _  )  <- Monsoon Clouds",
      "     (______)_   (_______)        (______)_",
      "      ' ' ' '     ' ' ' '          ' ' ' '",
      "     / / / /     / / / /          / / / /   <- Rain Showers",
      "      ' ' ' '     ' ' ' '          ' ' ' '",
      "                                       [FARMER]",
      "       |     |     |     |              (\\__/)  [Umbrella]",
      "     --+-----+-----+-----+-- [DRIP]     (•‿•)",
      "       :     :     :     :             <|---|/",
      "      /\\    /\\    /\\    /\\              /   \\",
      "     .||.  .||.  .||.  .||.           .-------.",
      "  ~~(Germinating Seedlings)~~~~~~~~~~~|RAIN TANK| 85% Full",
      " >>> WEATHER ENGINE: High precipitation alert. Conserving 3200L water."
    ]
  },
  {
    id: 3,
    title: '3. Rakshak AI Guardian (पौध संरक्षण)',
    subtitle: 'Rakshak AI vision scan detects foliar pest risk early; organic neem advisory deployed',
    weather: 'Clear Skies • 26°C',
    metric: 'Plant Health: 99.2% • Pest Incident: 0% Prevented',
    icon: <RakshakIcon size={15} color="#10b981" />,
    ascii: [
      "    +-----------------------------------------------+",
      "    |  [RAKSHAK AI] AGRO-VISION SCAN: FIELD PLOT #4 |",
      "    +-----------------------------------------------+",
      "             \\",
      "      \\|/    \\|/       [RAKSHAK SHIELD]       \\|/    \\|/",
      "      -*-    -*-        .------------.        -*-    -*-",
      "      /|\\    /|\\       /  RAKSHAK AI  \\       /|\\    /|\\",
      "      |||    |||      |   { R + LEAF } |      |||    |||",
      "      |||    |||       \\   PROTECTED  /       |||    |||",
      "     /|||\\  /|||\\       '------------'       /|||\\  /|||\\",
      "    ======================================================",
      "    Lush Wheat Canopy Reaching 45cm • Nitrogen Assimilation: 96%",
      " >>> ICAR GROUNDING: Zero blight detected. Foliar micro-spray on schedule."
    ]
  },
  {
    id: 4,
    title: '4. Bumper Harvest & Mandi (समृद्धि & लाभ)',
    subtitle: 'Direct B2B Mandi contract signed! Fair digital weighing and instant rupee payment',
    weather: 'Golden Harvest • 28°C',
    metric: 'Produce: 24.5 Quintals • Realized Price: ₹2,450/Qtl (Above MSP)',
    icon: <IndianRupee size={15} color="#d97706" />,
    ascii: [
      "    **************************************************",
      "    *     DIRECT B2B MANDI CONTRACT: INSTANT ESCROW   *",
      "    **************************************************",
      "               $$$   ₹ ₹ ₹   $$$   ₹ ₹ ₹",
      "           .----------------------------.",
      "          /   AGRI-WISE DIGITAL MANDI   \\",
      "         |   CONTRACT: 2500 KG GRAIN    |  [BUYER CONFIRMED]",
      "          \\  NET PAYOUT: ₹ 61,250       /",
      "           '----------------------------'",
      "        [#] [#] [#]                      [HAPPY FARMER]",
      "       (Bumper Bags)                         (\\o/)",
      "       ==============                          |  < 'Fair price!'",
      "       | DIGITAL SCALE | -> 2450.0 KG         / \\",
      " >>> INTERMEDIARY MARGIN: 0% • DIRECT TO BANK ACCOUNT IN 12 SECONDS!"
    ]
  }
];

export default function AsciiStoryGraphic({ compact = false }) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance scenes every 5 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % CHAPTERS.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = CHAPTERS[activeChapter];

  return (
    <div 
      className="glass-card" 
      style={{
        background: '#0d1f17',
        border: '1px solid #1f4031',
        borderRadius: '20px',
        padding: compact ? '16px' : '22px',
        color: '#d4ebd9',
        boxShadow: '0 16px 40px rgba(10, 26, 19, 0.35)',
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Terminal Title Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(82, 183, 136, 0.18)',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Terminal Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: '#73a98a', fontWeight: 700, letterSpacing: '0.04em' }}>
            AGRI-STORY CONSOLE // LIVE FARM CHRONICLE
          </span>
        </div>

        {/* Live Weather / Time Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 10px',
          borderRadius: '999px',
          fontSize: '0.72rem',
          color: '#a3d9b8'
        }}>
          {current.icon}
          <span>{current.weather}</span>
        </div>
      </div>

      {/* Chapter Selection Pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {CHAPTERS.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => {
              setActiveChapter(idx);
              setIsPlaying(false);
            }}
            style={{
              background: activeChapter === idx ? '#1e4836' : 'rgba(255, 255, 255, 0.04)',
              border: activeChapter === idx ? '1px solid #52b788' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeChapter === idx ? '#d8f3dc' : '#73a98a',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{idx + 1}</span>
            <span style={{ display: compact ? 'none' : 'inline' }}>
              {idx === 0 ? 'Sowing' : idx === 1 ? 'Rain' : idx === 2 ? 'Rakshak AI' : 'Mandi ₹'}
            </span>
          </button>
        ))}

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: 'transparent',
            border: 'none',
            color: isPlaying ? '#52b788' : '#eab308',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '0.72rem',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={isPlaying ? 'Pause Auto-cycle' : 'Auto-cycle Scenes'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'Auto-Cycle ON' : 'Paused'}</span>
        </button>
      </div>

      {/* Scene Context & Headline */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbfaf6', letterSpacing: '-0.01em' }}>
          {current.title}
        </div>
        <div style={{ fontSize: '0.76rem', color: '#90bf9e', marginTop: '2px', lineHeight: 1.35 }}>
          {current.subtitle}
        </div>
      </div>

      {/* ASCII Art Canvas */}
      <div style={{
        background: '#07130e',
        border: '1px solid #143526',
        borderRadius: '12px',
        padding: compact ? '12px 10px' : '16px 14px',
        overflowX: 'auto',
        fontSize: compact ? '0.62rem' : '0.74rem',
        lineHeight: 1.25,
        color: '#52b788',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.45)'
      }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre' }}>
          {current.ascii.map((line, lIdx) => {
            // Highlight specific storytelling elements in distinct colors
            let style = {};
            if (line.includes('SUN') || line.includes('Rain') || line.includes('RAIN TANK')) {
              style = { color: '#fde047' }; // Sun / Tank Gold
            } else if (line.includes('RAKSHAK')) {
              style = { color: '#6ee7b7', fontWeight: 700 }; // Rakshak Emerald
            } else if (line.includes('MANDI') || line.includes('₹') || line.includes('PAYOUT')) {
              style = { color: '#facc15', fontWeight: 700 }; // Mandi Gold
            } else if (line.includes('>>>')) {
              style = { color: '#a7f3d0', fontWeight: 700 }; // Sensor Bar
            } else if (line.includes('FARMER') || line.includes('o_o')) {
              style = { color: '#ffffff' }; // Farmer
            }
            return (
              <div key={lIdx} style={style}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>

      {/* Live Telemetry Sensor Bar below ASCII canvas */}
      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(82, 183, 136, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '0.7rem'
      }}>
        <span style={{ color: '#52b788', fontWeight: 700 }}>
          LIVE TELEMETRY:
        </span>
        <span style={{ color: '#d8f3dc' }}>
          {current.metric}
        </span>
      </div>

      {/* Auto-cycle indicator bar */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #10b981 100%)',
          animation: 'storyProgress 5.2s linear infinite',
          width: '100%'
        }} />
      )}
    </div>
  );
}
