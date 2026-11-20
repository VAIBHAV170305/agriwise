import React, { useState } from 'react';
import { 
  Sprout, ShieldCheck, Zap, Activity, CloudSun, Leaf, 
  ShoppingBag, ArrowRight, Check, Lock, Mail, User, Phone,
  TrendingUp, Award, Layers
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import LocationBanner from './LocationBanner';

export default function LandingView({ onRoleSwitch, onLoginSuccess, onOpenLogin }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Farmer'
  });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(form);
      } else {
        await api.login(form.email, form.password);
      }
      onLoginSuccess();
      setShowAuthModal(false);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px 0 80px' }}>
      {/* Live Agricultural Telemetry & Location Service on Main Page */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 28px', padding: '0 10px' }}>
        <LocationBanner variant="hero" />
      </div>

      {/* Hero Section matching the user's reference image */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'center',
        maxWidth: '1240px',
        margin: '0 auto 60px',
        padding: '20px 10px'
      }}>
        {/* Left Hero Column */}
        <div>
          {/* Tagline */}
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#6e8577',
            textTransform: 'uppercase',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '22px', height: '2px', background: '#6e8577', display: 'inline-block' }}></span>
            {t('landing.heroBadge', 'Bharat Agri-Stack & Field Intelligence Network')}
          </div>

          {/* Headline with split colors */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 4.4vw, 4.2rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            fontWeight: 800,
            marginBottom: '24px'
          }}>
            <span style={{ color: '#163326', display: 'block' }}>{t('landing.heroTitle1', 'Smarter farming for')}</span>
            <span style={{ color: '#587965' }}>{t('landing.heroTitleAccent', 'every Indian farmer.')}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.08rem',
            color: '#4a5e52',
            lineHeight: 1.6,
            maxWidth: '520px',
            marginBottom: '28px'
          }}>
            {t('landing.heroDesc', 'Multi-lingual agronomy AI, disease diagnosis with computer vision, real-time APMC mandi forecasts, soil health analytics, and direct farm-to-buyer commerce tailored to all Indian states.')}
          </p>

          {/* Checklist with soft green ticks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#2a3d33', fontWeight: 500 }}>
              <span style={{ color: '#2b5741', fontWeight: 700 }}>✓</span>
              <span>Keep farm and crop records together</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#2a3d33', fontWeight: 500 }}>
              <span style={{ color: '#2b5741', fontWeight: 700 }}>✓</span>
              <span>Turn questions into grounded next steps</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#2a3d33', fontWeight: 500 }}>
              <span style={{ color: '#2b5741', fontWeight: 700 }}>✓</span>
              <span>Connect offerings, orders and deliveries</span>
            </div>
          </div>

          {/* Primary Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary"
              onClick={() => onOpenLogin ? onOpenLogin() : onRoleSwitch('Farmer')}
              style={{
                background: '#163326',
                padding: '14px 28px',
                fontSize: '0.96rem',
                borderRadius: '999px',
                boxShadow: '0 4px 16px rgba(22, 51, 38, 0.18)'
              }}
            >
              <span>{t('landing.ctaFarmer', 'Launch Farmer Dashboard')}</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Footnote */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#657a6e',
            marginTop: '20px'
          }}>
            <ShieldCheck size={16} color="#4f735f" />
            <span>Secure account sign-in • your data stays private to your role</span>
          </div>
        </div>

        {/* Right Hero Graphic: Organic circular field illustration with floating cards */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            position: 'relative',
            background: 'linear-gradient(180deg, #d8e5db 0%, #c1d6c7 40%, #769982 70%, #52755e 100%)',
            boxShadow: '0 20px 50px rgba(27, 56, 43, 0.12)',
            overflow: 'visible'
          }}>
            {/* Sun Disc */}
            <div style={{
              position: 'absolute',
              top: '55px',
              right: '90px',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'rgba(250, 232, 178, 0.65)',
              filter: 'blur(2px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '75px',
              right: '135px',
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              background: 'rgba(250, 232, 178, 0.85)'
            }} />

            {/* Rolling field layers SVG inside circle */}
            <svg viewBox="0 0 440 440" style={{ width: '100%', height: '100%', borderRadius: '50%', position: 'absolute', inset: 0 }}>
              {/* Hill 1 */}
              <path d="M 0 240 Q 220 180 440 230 L 440 440 L 0 440 Z" fill="#91af9a" />
              {/* Hill 2 */}
              <path d="M 0 280 Q 200 240 440 300 L 440 440 L 0 440 Z" fill="#6c9077" />
              {/* Hill 3 (Deep foreground) */}
              <path d="M 0 340 Q 240 300 440 370 L 440 440 L 0 440 Z" fill="#4d7159" />
              
              {/* Minimal sprout in center */}
              <g transform="translate(210, 215)">
                <path d="M 10 30 C 10 20 15 15 20 8" fill="none" stroke="#2a4535" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 19 8 C 15 2 7 6 7 14 C 14 14 17 11 19 8 Z" fill="#3d5c48" />
                <path d="M 21 11 C 25 5 33 8 32 16 C 25 16 23 13 21 11 Z" fill="#4c6e58" />
              </g>
            </svg>

            {/* Floating Card 1: Top Left - Farm Intelligence */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '-40px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 8px 30px rgba(22, 51, 38, 0.12)',
              border: '1px solid rgba(22, 51, 38, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e8efe9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf size={18} color="#2d5740" />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#163326', lineHeight: 1.2 }}>Farm intelligence</div>
                <div style={{ fontSize: '0.7rem', color: '#687e72', marginTop: '2px' }}>Grounded in your records</div>
              </div>
            </div>

            {/* Floating Card 2: Bottom Right - Market Access */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              right: '-40px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 8px 30px rgba(22, 51, 38, 0.12)',
              border: '1px solid rgba(22, 51, 38, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fbf5e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={18} color="#946d14" />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#163326', lineHeight: 1.2 }}>Market access</div>
                <div style={{ fontSize: '0.7rem', color: '#687e72', marginTop: '2px' }}>From offering to delivery</div>
              </div>
            </div>

            {/* Subtle curved text label below */}
            <div style={{
              position: 'absolute',
              bottom: '-24px',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#6e8577',
              textTransform: 'uppercase'
            }}>
              GROW WITH A LITTLE MORE CLARITY
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Lingual Regional Language Banner for Indian Farmers */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <LanguageSelector variant="landing-banner" />
      </div>

      {/* Role Selection Launcher Box */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(27, 56, 43, 0.09)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
        maxWidth: '960px',
        margin: '0 auto 60px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>
              Launch Role Workspaces
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#576c60', marginTop: '2px' }}>
              Test each stakeholder perspective with pre-seeded agronomic records and wholesale market orders.
            </p>
          </div>

          <button 
            className="btn-outline" 
            onClick={() => { setShowAuthModal(true); setIsRegister(false); }}
          >
            Custom Sign-in
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}>
          {Object.entries(DEMO_ACCOUNTS).map(([roleKey, acc]) => (
            <div
              key={roleKey}
              onClick={() => onRoleSwitch(roleKey)}
              style={{
                background: '#fcfbf8',
                border: '1px solid rgba(27, 56, 43, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#163326';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(27, 56, 43, 0.08)';
                e.currentTarget.style.background = '#fcfbf8';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: '#eaf2ec',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <User size={18} color="#163326" />
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#163326', fontWeight: 700 }}>{roleKey} Portal</h4>
              <p style={{ fontSize: '0.78rem', color: '#687e72', marginTop: '4px' }}>{acc.label}</p>
              <span style={{ fontSize: '0.75rem', color: '#2d5740', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                Open Desk →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Feature Pillars Grid in warm clean cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0 10px'
      }}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#e8efe9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Leaf size={20} color="#1b382b" />
          </div>
          <h3 style={{ fontSize: '1.18rem', color: '#163326', marginBottom: '8px' }}>AI Crop Recommender</h3>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Trained Random Forest classifier matching 22 agricultural crops to soil Nitrogen, Phosphorus, Potassium, pH, and precipitation profiles.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#fdf0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={20} color="#a83838" />
          </div>
          <h3 style={{ fontSize: '1.18rem', color: '#163326', marginBottom: '8px' }}>Vision Disease Scanner</h3>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Rapid leaf pathology identification with organic biocontrol remedies and chemical intervention schedules.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#edf5fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <CloudSun size={20} color="#22678f" />
          </div>
          <h3 style={{ fontSize: '1.18rem', color: '#163326', marginBottom: '8px' }}>Weather & Rakshak AI</h3>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Micro-climate agricultural advisories plus Rakshak, our intelligent AI assistant citing verified agronomy manuals.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#fbf5e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShoppingBag size={20} color="#b47818" />
          </div>
          <h3 style={{ fontSize: '1.18rem', color: '#163326', marginBottom: '8px' }}>Direct Mandi Marketplace</h3>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Disintermediate produce sales, track 90-day demand corridors, and fulfill purchase orders directly with institutional buyers.
          </p>
        </div>
      </div>

      {/* Modal: Custom Login / Register */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '32px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: '#163326', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <Sprout size={22} color="#d2e5d8" />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#163326', fontWeight: 800 }}>
                {isRegister ? 'Create Agri-Wise Account' : 'Welcome to Agri-Wise'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#687e72' }}>
                {isRegister ? 'Register for role-based access' : 'Enter your credentials'}
              </p>
            </div>

            {authError && (
              <div style={{
                padding: '10px', background: '#fdf0f0',
                border: '1px solid #fad2d2', borderRadius: '6px',
                color: '#a83838', fontSize: '0.8rem', marginBottom: '14px'
              }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isRegister && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600 }}>Full Name</label>
                  <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ramesh Patel" />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600 }}>Email Address</label>
                <input required type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="farmer@agriwise.com" />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600 }}>Password</label>
                <input required type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>

              {isRegister && (
                <>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600 }}>Mobile Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91-9876543210" />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600 }}>Account Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="Farmer">Farmer (Agricultural Producer)</option>
                      <option value="Buyer">Buyer (Wholesaler / Processor)</option>
                      <option value="Delivery">Delivery Partner (Agri Logistics & Fleet)</option>
                      <option value="FPO">Farmer Producer Organization (FPO)</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }} disabled={loading}>
                {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsRegister(!isRegister)} 
                  style={{ background: 'none', border: 'none', color: '#163326', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAuthModal(false)} 
                  style={{ background: 'none', border: 'none', color: '#687e72', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
