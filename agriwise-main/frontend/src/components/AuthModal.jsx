import React, { useState } from 'react';
import { 
  X, User, Lock, Mail, Phone, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertTriangle, Users, ShoppingBag, Sparkles,
  KeyRound, Send, RefreshCw
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import CustomAgriLogo from './CustomAgriLogo';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onRoleSwitch }) {
  const { t, currentLang } = useLanguage();
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password' | 'register'
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Email OTP state
  const [otpEmail, setOtpEmail] = useState('farmer@agriwise.com');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDeliveryInfo, setOtpDeliveryInfo] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);

  // Standard Form state
  const [form, setForm] = useState({
    name: '',
    email: 'farmer@agriwise.com',
    password: 'Farmer@123',
    phone: '',
    role: 'Farmer',
    preferred_language: currentLang || 'en'
  });

  if (!isOpen) return null;

  // Handle Send OTP via Free External Email Service
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpEmail || !otpEmail.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }

    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    try {
      const res = await api.sendEmailOtp(otpEmail);
      setOtpSent(true);
      setOtpDeliveryInfo(res);
      setAuthSuccess(`Security verification code dispatched to ${otpEmail}`);
      
      // Auto-populate for seamless demo/testing if demo_otp returned
      if (res.demo_otp) {
        setOtpCode(res.demo_otp);
      }

      setOtpTimer(60);
      const timerInterval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch email OTP. Please verify email address.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError('Please enter the complete 6-digit verification code');
      return;
    }

    setAuthError('');
    setLoading(true);
    try {
      const res = await api.verifyEmailOtp(otpEmail, otpCode);
      if (onLoginSuccess) onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Demo Login
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
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login & Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      if (authMode === 'register') {
        const res = await api.register(form);
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        const res = await api.login(form.email, form.password);
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 53, 36, 0.55)',
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
        className="glass-card animate-scale-in" 
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid rgba(18, 53, 36, 0.12)',
          boxShadow: '0 20px 48px rgba(18, 53, 36, 0.22)',
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
              color: '#576c60',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Brand Header with Custom Logo */}
        <div style={{ marginBottom: '20px' }}>
          <CustomAgriLogo size={36} variant="full" />
          <h3 style={{ fontSize: '1.3rem', color: '#123524', fontWeight: 800, marginTop: '12px' }}>
            {authMode === 'register' 
              ? t('common.register', 'Register Farmer Account') 
              : authMode === 'otp'
              ? 'Farmer Email OTP Login'
              : t('common.signIn', 'Sign In with Password')}
          </h3>
          <p style={{ color: '#576c60', fontSize: '0.82rem', marginTop: '2px' }}>
            {authMode === 'otp'
              ? 'Passwordless sign-in via reliable transactional email service'
              : 'Access your digitized farm plots, crop health radar, and mandi orders'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'flex',
          background: '#f0f5f2',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(18, 53, 36, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '7px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'otp' ? '#ffffff' : 'transparent',
              color: authMode === 'otp' ? '#123524' : '#576c60',
              fontWeight: authMode === 'otp' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: authMode === 'otp' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={13} color="#10b981" /> Email OTP
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('password'); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '7px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'password' ? '#ffffff' : 'transparent',
              color: authMode === 'password' ? '#123524' : '#576c60',
              fontWeight: authMode === 'password' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: authMode === 'password' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Lock size={13} /> Password
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '7px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'register' ? '#ffffff' : 'transparent',
              color: authMode === 'register' ? '#123524' : '#576c60',
              fontWeight: authMode === 'register' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: authMode === 'register' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <User size={13} /> Register
          </button>
        </div>

        {/* Alerts & Messages */}
        {authError && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* 1. EMAIL OTP AUTHENTICATION FLOW */}
        {authMode === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>
                    Registered Email Address *
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input 
                      type="email" 
                      required 
                      className="form-input" 
                      placeholder="e.g. farmer@agriwise.com" 
                      value={otpEmail} 
                      onChange={e => setOtpEmail(e.target.value)} 
                      style={{ paddingLeft: '36px' }}
                    />
                    <Mail size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#688273', marginTop: '4px', display: 'block' }}>
                    A 6-digit security code will be sent via external cloud email service.
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}
                  disabled={loading}
                >
                  <Send size={15} />
                  {loading ? 'Dispatching OTP via Cloud Email...' : 'Send Verification OTP Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>
                      Enter 6-Digit Verification Code *
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                      Sent to: {otpEmail}
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      maxLength="6"
                      required 
                      className="form-input" 
                      placeholder="e.g. 849201" 
                      value={otpCode} 
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                      style={{
                        paddingLeft: '38px',
                        fontSize: '1.25rem',
                        letterSpacing: '6px',
                        fontWeight: 800,
                        textAlign: 'center',
                        color: '#123524'
                      }}
                    />
                    <KeyRound size={18} color="#10b981" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  {/* Dev / Test Auto-Fill Badge */}
                  {otpDeliveryInfo?.demo_otp && (
                    <div style={{
                      marginTop: '8px',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem'
                    }}>
                      <span style={{ color: '#92400e', fontWeight: 600 }}>
                        🔑 Instant Test Code: <strong>{otpDeliveryInfo.demo_otp}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(otpDeliveryInfo.demo_otp)}
                        style={{
                          background: '#92400e',
                          color: '#ffffff',
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, justifyContent: 'center', padding: '11px' }}
                    disabled={loading || otpCode.length !== 6}
                  >
                    <CheckCircle2 size={16} />
                    {loading ? 'Verifying OTP...' : 'Verify OTP & Enter Field Desk'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpTimer > 0}
                    className="btn-secondary"
                    style={{ padding: '11px 14px' }}
                    title="Resend OTP code"
                  >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    {otpTimer > 0 ? `${otpTimer}s` : 'Resend'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setAuthSuccess(''); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#576c60',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'center'
                  }}
                >
                  Change Email Address
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. PASSWORD LOGIN / REGISTER FLOW */}
        {(authMode === 'password' || authMode === 'register') && (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>Full Legal Name *</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. Ramesh Patel" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    style={{ paddingLeft: '36px' }}
                  />
                  <User size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>Email Address *</label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  placeholder="e.g. farmer@agriwise.com" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  style={{ paddingLeft: '36px' }}
                />
                <Mail size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>Password *</label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input 
                  type="password" 
                  required 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  style={{ paddingLeft: '36px' }}
                />
                <Lock size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#123524' }}>Platform Role *</label>
                <select 
                  className="form-select" 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})}
                  style={{ marginTop: '4px' }}
                >
                  <option value="Farmer">👨‍🌾 Farmer (Cultivator)</option>
                  <option value="Buyer">🛒 Wholesale Buyer / Trader</option>
                  <option value="FPO">🏢 FPO Lead / Aggregator</option>
                  <option value="Delivery">🚚 Delivery Logistics Partner</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Quick Demo Switcher Section */}
        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(18, 53, 36, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#688273', textTransform: 'uppercase' }}>
              ⚡ Quick Demo One-Click Access:
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Farmer')}
              style={{
                background: '#edf5f0',
                border: '1px solid #bce1ce',
                color: '#123524',
                padding: '7px 8px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              👨‍🌾 Farmer
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Buyer')}
              style={{
                background: '#f4f8f5',
                border: '1px solid rgba(18, 53, 36, 0.12)',
                color: '#123524',
                padding: '7px 8px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              🛒 Buyer
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('FPO')}
              style={{
                background: '#f4f8f5',
                border: '1px solid rgba(18, 53, 36, 0.12)',
                color: '#123524',
                padding: '7px 8px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              🏢 FPO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
