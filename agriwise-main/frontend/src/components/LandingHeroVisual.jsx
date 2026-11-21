import React, { useState } from 'react';
import { 
  ShieldCheck, Leaf, TrendingUp, Sparkles, MapPin, 
  CheckCircle2, CloudSun, Droplets, ArrowUpRight 
} from 'lucide-react';
import heroFarmerImg from '../assets/hero-farmer.jpg';
import heroFieldImg from '../assets/hero-field.jpg';

export default function LandingHeroVisual() {
  const [selectedPhoto, setSelectedPhoto] = useState('farmer'); // 'farmer' | 'field'

  const activeImage = selectedPhoto === 'farmer' ? heroFarmerImg : heroFieldImg;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto'
    }}>
      {/* Decorative ambient glowing ring behind image */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: '10%',
        background: 'radial-gradient(circle, rgba(45, 106, 79, 0.18) 0%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Main Image Frame */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(22, 51, 38, 0.12)',
        boxShadow: '0 24px 60px rgba(18, 53, 36, 0.16)',
        background: '#ffffff',
        zIndex: 1
      }}>
        {/* The Hero Image */}
        <img 
          src={activeImage} 
          alt="Indian smart farming and modern agriculture field"
          style={{
            width: '100%',
            height: '420px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
        />

        {/* Subtle gradient vignette at the bottom of the image for contrast */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(14, 35, 25, 0.85) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        {/* Top-Right Floating Badge: Bharat Agri-Stack Live Verified */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(22, 51, 38, 0.15)',
          borderRadius: '999px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 8px #16a34a'
          }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326', letterSpacing: '0.02em' }}>
            Bharat Agri-Stack Verified
          </span>
        </div>

        {/* Top-Left Photo Switcher Pills */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(18, 53, 36, 0.75)',
          backdropFilter: 'blur(8px)',
          borderRadius: '999px',
          padding: '3px',
          display: 'flex',
          gap: '3px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <button
            type="button"
            onClick={() => setSelectedPhoto('farmer')}
            style={{
              background: selectedPhoto === 'farmer' ? '#ffffff' : 'transparent',
              color: selectedPhoto === 'farmer' ? '#163326' : '#d4ebd9',
              border: 'none',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhoto('field')}
            style={{
              background: selectedPhoto === 'field' ? '#ffffff' : 'transparent',
              color: selectedPhoto === 'field' ? '#163326' : '#d4ebd9',
              border: 'none',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Crop Field
          </button>
        </div>

        {/* Bottom Floating Glass Card 1: Rakshak AI Crop Health */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(22, 51, 38, 0.14)',
          borderRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          maxWidth: '240px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
          }}>
            <Leaf size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#657d70', fontWeight: 700, textTransform: 'uppercase' }}>
              Rakshak AI Vision
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#163326', lineHeight: 1.2 }}>
              99.4% Healthy Canopy
            </div>
          </div>
        </div>

        {/* Bottom Floating Glass Card 2: APMC Mandi Gain */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(22, 51, 38, 0.14)',
          borderRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          maxWidth: '220px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
          }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#657d70', fontWeight: 700, textTransform: 'uppercase' }}>
              APMC Mandi Rate
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#163326', lineHeight: 1.2 }}>
              ₹2,480/Q <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>+8.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
