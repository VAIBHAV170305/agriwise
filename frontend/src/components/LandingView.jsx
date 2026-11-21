import React, { useState } from 'react';
import { 
  Sprout, ShieldCheck, Zap, Activity, CloudSun, Leaf, 
  ShoppingBag, ArrowRight, Check, Lock, Mail, User, Phone,
  TrendingUp, Award, Layers, AlertTriangle
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import AsciiStoryGraphic from './AsciiStoryGraphic';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';

export default function LandingView({ onRoleSwitch, onLoginSuccess, onOpenLogin }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRolePreview, setSelectedRolePreview] = useState('Farmer');

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
    <div className="animate-fade-in" style={{ padding: '30px 0 80px' }}>
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

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn-primary"
              onClick={() => onRoleSwitch('Farmer')}
              style={{
                background: '#163326',
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '0.96rem',
                borderRadius: '999px',
                boxShadow: '0 4px 16px rgba(22, 51, 38, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🚀 Launch Farmer Dashboard</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenLogin ? onOpenLogin() : onRoleSwitch('Farmer')}
              style={{
                padding: '14px 22px',
                fontSize: '0.92rem',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              <span>Sign In with Password</span>
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

        {/* Right Hero: Interactive Bharat Agri-Stack Storytelling & Telemetry Console */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ width: '100%' }}>
            <AsciiStoryGraphic />
          </div>
        </div>
      </div>

      {/* Multi-Lingual Regional Language Banner for Indian Farmers (Restricted while regional translations are in progress) */}
      {/* <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <LanguageSelector variant="landing-banner" />
      </div> */}

      {/* Role Selection & Authentication Access Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(27, 56, 43, 0.1)',
        borderRadius: '18px',
        padding: '24px 28px',
        boxShadow: '0 4px 20px rgba(22, 51, 38, 0.05)',
        maxWidth: '860px',
        margin: '0 auto 50px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.22rem', color: '#163326', fontWeight: 800, margin: 0 }}>
              Role-Based Workspace Access
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#576c60', marginTop: '3px', margin: 0 }}>
              Telemetry, farm maps, and mandi trading dynamically adapt based on your authenticated persona.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              className="btn-outline" 
              onClick={() => onOpenLogin ? onOpenLogin() : setShowAuthModal(true)}
              style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              Sign In with Credentials
            </button>
          </div>
        </div>

        {/* Clean Role Selection & Quick Access Launchpad */}
        <div style={{
          background: '#f8faf7',
          border: '1px solid rgba(27, 56, 43, 0.08)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* 5 Quick Access 1-Click Buttons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ⚡ 1-Click Quick Access:
              </span>
              <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 600 }}>
                Directly launch any workspace
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px'
            }}>
              {[
                { key: 'Farmer', label: 'Farmer', icon: '🌾', user: 'Ramesh Patel', badge: 'Producer', color: '#2d6a4f', bg: '#edf6f0' },
                { key: 'Buyer', label: 'Buyer', icon: '💼', user: 'Ananya Sharma', badge: 'Wholesale', color: '#b45309', bg: '#fef3c7' },
                { key: 'Delivery', label: 'Delivery', icon: '🚚', user: 'Vikram Singh', badge: 'Logistics', color: '#0284c7', bg: '#e0f2fe' },
                { key: 'FPO', label: 'FPO Lead', icon: '👥', user: 'Sanjay Verma', badge: 'Aggregator', color: '#7c3aed', bg: '#f3e8ff' },
                { key: 'Admin', label: 'Admin', icon: '🛡️', user: 'Platform Admin', badge: 'Governance', color: '#dc2626', bg: '#fee2e2' }
              ].map(btn => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => {
                    setSelectedRolePreview(btn.key);
                    onRoleSwitch(btn.key);
                  }}
                  title={`Launch ${btn.label} workspace as ${btn.user}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: selectedRolePreview === btn.key ? `2px solid ${btn.color}` : '1px solid rgba(27, 56, 43, 0.12)',
                    background: selectedRolePreview === btn.key ? btn.bg : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.16s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = btn.color;
                    e.currentTarget.style.background = btn.bg;
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRolePreview !== btn.key) {
                      e.currentTarget.style.borderColor = 'rgba(27, 56, 43, 0.12)';
                      e.currentTarget.style.background = '#ffffff';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>{btn.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#163326', lineHeight: 1.1 }}>
                      {btn.label}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#688273', marginTop: '2px' }}>
                      {btn.user.split(' ')[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(27, 56, 43, 0.08)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#688273', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Role Preview:
              </span>
              <select
                value={selectedRolePreview}
                onChange={(e) => setSelectedRolePreview(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(27, 56, 43, 0.16)',
                  background: '#ffffff',
                  color: '#163326',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="Farmer">🌾 Farmer / Agricultural Producer (Ramesh Patel)</option>
                <option value="Buyer">💼 Wholesale Buyer & Aggregator (Ananya Sharma)</option>
                <option value="Delivery">🚚 Delivery Partner & Fleet Logistics (Vikram Singh)</option>
                <option value="FPO">👥 FPO Lead / Producer Organization (Sanjay Verma)</option>
                <option value="Admin">🛡️ Platform Admin / Governance (Administrator)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => onRoleSwitch(selectedRolePreview)}
              style={{ padding: '8px 18px', fontSize: '0.84rem' }}
            >
              <span>Launch {selectedRolePreview} Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Dynamic Role Preview for Selected Role */}
          {(() => {
            const roleInfo = {
              Farmer: {
                title: '🌾 Farmer Field Desk (Ramesh Patel • Anand, Gujarat)',
                desc: 'Crop planning, soil terrain mapping, live APMC Mandi rates, and direct harvest sales.',
                badge: 'Primary Producer Flow',
                bg: '#edf6f0',
                color: '#2d6a4f'
              },
              Buyer: {
                title: '💼 Wholesale Buyer Desk (Ananya Sharma • Mandi Procurement)',
                desc: 'Discover verified farm produce batches, negotiate forward purchase orders, and track fulfillment.',
                badge: 'Direct Mandi Commerce',
                bg: '#fef3c7',
                color: '#b45309'
              },
              Delivery: {
                title: '🚚 Logistics & Fleet Dispatch (Vikram Singh • Cold-Chain)',
                desc: 'Route optimization, active consignment transit tracking, proof of delivery, and fleet telemetry.',
                badge: 'Logistics & Dispatch',
                bg: '#e0f2fe',
                color: '#0284c7'
              },
              FPO: {
                title: '👥 Farmer Producer Org (Sanjay Verma • Aggregator)',
                desc: 'Cluster aggregation, input bulk procurement, member farm monitoring, and institutional contracts.',
                badge: 'FPO Aggregation',
                bg: '#f3e8ff',
                color: '#7c3aed'
              },
              Admin: {
                title: '🛡️ Platform Telemetry & Governance (Platform Administrator)',
                desc: 'System health monitoring, audit logging, mandi market data feeds, and verification controls.',
                badge: 'Platform Governance',
                bg: '#fee2e2',
                color: '#dc2626'
              }
            }[selectedRolePreview] || {
              title: `${selectedRolePreview} Workspace`,
              desc: 'Dedicated agronomy and commerce workspace.',
              badge: 'Workspace',
              bg: '#edf6f0',
              color: '#2d6a4f'
            };

            return (
              <div style={{
                background: roleInfo.bg,
                border: '1px solid rgba(27, 56, 43, 0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#163326' }}>
                    {roleInfo.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#576c60', marginTop: '2px' }}>
                    {roleInfo.desc}
                  </div>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', background: '#ffffff', color: roleInfo.color, border: `1px solid ${roleInfo.color}40`, fontWeight: 700 }}>
                  {roleInfo.badge}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Critical Alert Ribbon using Curated Crimson Accent */}
      <div 
        className="card-critical animate-fade-in"
        style={{
          maxWidth: '1240px',
          margin: '0 auto 40px',
          padding: '14px 20px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-critical pulse-critical">
            CRITICAL SAFEGUARD
          </span>
          <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
            Unpredicted pest outbreaks & harvest gluts cause 20% to 40% crop losses annually. Rakshak AI provides pre-emptive diagnostics and guaranteed forward Mandi contracts.
          </span>
        </div>
        <button
          onClick={() => onRoleSwitch('Farmer')}
          style={{
            background: 'var(--crimson-600)',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217, 4, 41, 0.25)'
          }}
        >
          Protect My Crop →
        </button>
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
        <div className="glass-card card-hover-lift" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#e8efe9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <RakshakIcon size={20} color="#1b382b" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.18rem', color: '#163326', margin: 0 }}>Crop Recommender</h3>
            <RakshakBadge text="AI Matcher" />
          </div>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Trained Random Forest classifier matching 22 agricultural crops to soil Nitrogen, Phosphorus, Potassium, pH, and precipitation profiles.
          </p>
        </div>

        <div className="glass-card card-hover-lift" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#ffe5e7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={20} color="var(--crimson-600)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.18rem', color: '#163326', margin: 0 }}>Vision Disease Scanner</h3>
            <span className="badge badge-critical">Early Warning</span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Rapid leaf pathology identification with organic biocontrol remedies, preventing <strong style={{ color: 'var(--crimson-600)' }}>20%-40%</strong> yield losses from foliar pathogens.
          </p>
        </div>

        <div className="glass-card card-hover-lift" style={{ padding: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#edf5fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <CloudSun size={20} color="#22678f" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.18rem', color: '#163326', margin: 0 }}>Weather & Rakshak AI</h3>
            <RakshakBadge text="RAG Verified" />
          </div>
          <p style={{ fontSize: '0.86rem', color: '#576c60', lineHeight: 1.5 }}>
            Micro-climate agricultural advisories plus Rakshak, our intelligent AI assistant citing ICAR and SAU verified agronomy manuals.
          </p>
        </div>

        <div className="glass-card card-hover-lift" style={{ padding: '28px' }}>
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
