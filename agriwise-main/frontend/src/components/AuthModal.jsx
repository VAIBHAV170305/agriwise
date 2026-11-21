import React, { useState } from 'react';
import { 
  Sprout, X, User, Lock, Mail, Phone, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertTriangle, Users, ShoppingBag
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import LanguageSelector from './LanguageSelector';
import WavyLoader from './WavyLoader';
import { RakshakIcon } from './RakshakLogo';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onRoleSwitch }) {
  const { t, currentLang, languages } = useLanguage();
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: 'farmer@agriwise.com',
    password: 'Farmer@123',
    phone: '',
    role: 'Farmer',
    preferred_language: currentLang || 'en'
  });

  if (!isOpen) return null;

  const handleQuickDemoLogin = async (roleKey) => {
    setAuthError('');
    setLoading(true);
    try {
      const acc = DEMO_ACCOUNTS[roleKey];
      const res = await api.login(acc.email, acc.password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      } else if (onRoleSwitch) {
        await onRoleSwitch(roleKey);
      }
      showToast({
        title: `Welcome, ${res.user.name}`,
        message: `Signed in as ${res.user.role}. Your personalized agronomy records are ready.`,
        type: 'success'
      });
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Quick login failed');
      showToast({
        title: 'Sign In Failed',
        message: err.message || 'Could not verify persona credentials.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register(form);
        if (onLoginSuccess) onLoginSuccess(res.user);
        showToast({
          title: 'Account Created',
          message: `Welcome to Agri-Wise, ${res.user.name}! Registered as ${res.user.role}.`,
          type: 'success'
        });
      } else {
        const res = await api.login(form.email, form.password);
        if (onLoginSuccess) onLoginSuccess(res.user);
        showToast({
          title: `Welcome, ${res.user.name}`,
          message: `Signed in as ${res.user.role}.`,
          type: 'success'
        });
      }
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
      showToast({
        title: 'Authentication Error',
        message: err.message || 'Check your credentials.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 51, 38, 0.48)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-card animate-fade-in" 
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}
      >
        {/* Top Right Controls: Language Selector & Close Button */}
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <LanguageSelector variant="compact" />
          <button
            onClick={onClose}
            style={{
              background: '#f4f7f5',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#163326',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 12px rgba(22, 51, 38, 0.2)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d5e6db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 6.5 18.5 H 17.5" />
              <path d="M 12 18.5 V 13" />
              <path d="M 12 13.8 C 9 14.8 6.5 12.8 7.2 10.2 C 7.8 7.8 11 8.8 12 11.8" />
              <path d="M 12 11.8 C 13.2 8.8 15.5 6.2 17.8 7.2 C 19.2 8.5 17.5 12.5 12.5 11.8" />
            </svg>
          </div>
          <h3 style={{
            fontSize: '1.45rem',
            color: '#163326',
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            marginBottom: '4px'
          }}>
            {isRegister ? 'Create Agri-Wise Account' : 'Sign in to Agri-Wise'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#687e72' }}>
            {isRegister ? 'Access AI agronomy & market intelligence' : 'Choose a demo persona or use your credentials'}
          </p>
        </div>

        {/* Quick 1-Click Demo Profiles (When in Sign In mode) */}
        {!isRegister && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ⚡ Quick Demo Access (1-Click)
                </label>
                <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 600 }}>
                  Select any role
                </span>
              </div>

              {/* 5 Quick Access Persona Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                marginBottom: '10px'
              }}>
                {[
                  { key: 'Farmer', label: 'Farmer', icon: '🌾', user: 'Ramesh', color: '#2d6a4f', bg: '#edf6f0' },
                  { key: 'Buyer', label: 'Buyer', icon: '💼', user: 'Ananya', color: '#b45309', bg: '#fef3c7' },
                  { key: 'Delivery', label: 'Delivery', icon: '🚚', user: 'Vikram', color: '#0284c7', bg: '#e0f2fe' },
                  { key: 'FPO', label: 'FPO', icon: '👥', user: 'Sanjay', color: '#7c3aed', bg: '#f3e8ff' },
                  { key: 'Admin', label: 'Admin', icon: '🛡️', user: 'Admin', color: '#dc2626', bg: '#fee2e2' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(item.key)}
                    title={`1-Click login as ${item.label} (${item.user})`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '7px 4px',
                      borderRadius: '10px',
                      border: '1px solid rgba(22, 51, 38, 0.12)',
                      background: '#fcfdfc',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.16s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.background = item.bg;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.12)';
                      e.currentTarget.style.background = '#fcfdfc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#163326', marginTop: '3px' }}>{item.label}</span>
                    <span style={{ fontSize: '0.62rem', color: '#688273' }}>{item.user}</span>
                  </button>
                ))}
              </div>

              <select
                className="form-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) handleQuickDemoLogin(e.target.value);
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(22, 51, 38, 0.12)',
                  background: '#f8faf7',
                  color: '#52665b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>Or select persona from dropdown...</option>
                <option value="Farmer">🌾 Farmer: Ramesh Patel (farmer@agriwise.com)</option>
                <option value="Buyer">💼 Wholesale Buyer: Ananya Sharma (buyer@agriwise.com)</option>
                <option value="Delivery">🚚 Delivery Partner: Vikram Singh (delivery@agriwise.com)</option>
                <option value="FPO">👥 FPO Lead: Sanjay Verma (fpo@agriwise.com)</option>
                <option value="Admin">🛡️ Platform Admin: Platform Administrator (admin@agriwise.com)</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '18px 0 10px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(22, 51, 38, 0.1)' }} />
              <span style={{ fontSize: '0.74rem', color: '#829589', fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(22, 51, 38, 0.1)' }} />
            </div>
          </div>
        )}

        {/* Error message */}
        {authError && (
          <div style={{
            padding: '10px 14px',
            background: '#fdf2f2',
            border: '1px solid #f8c8c8',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '0.82rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <input 
                required 
                className="form-input" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Ramesh Patel" 
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <input 
              required 
              type="email" 
              className="form-input" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              placeholder="farmer@agriwise.com" 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <input 
              required 
              type="password" 
              className="form-input" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              placeholder="••••••••" 
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Mobile Phone
                </label>
                <input 
                  className="form-input" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="+91-9876543210" 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Account Role
                </label>
                <select 
                  className="form-select" 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})}
                >
                  <option value="Farmer">Farmer (Agricultural Producer)</option>
                  <option value="Buyer">Buyer (Wholesaler / Processor)</option>
                  <option value="Delivery">Delivery Partner (Agri Logistics & Fleet)</option>
                  <option value="FPO">Farmer Producer Organization (FPO)</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#4a5e52', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Preferred Language (मातृभाषा)
                </label>
                <select 
                  className="form-select" 
                  value={form.preferred_language || currentLang} 
                  onChange={e => setForm({...form, preferred_language: e.target.value})}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name}) — {l.region.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {loading && (
            <div style={{ margin: '8px 0' }}>
              <WavyLoader label="Authenticating session & loading workspace..." color="#163326" />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              marginTop: '8px',
              padding: '12px',
              borderRadius: '999px',
              fontSize: '0.95rem'
            }} 
            disabled={loading}
          >
            {loading ? 'Entering Workspace...' : (isRegister ? 'Register & Enter Workspace' : 'Sign In')}
            <ArrowRight size={16} />
          </button>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '8px', 
            fontSize: '0.8rem',
            paddingTop: '6px'
          }}>
            <button 
              type="button" 
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
              }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#163326', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : "New user? Create an account"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#687e72', 
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
