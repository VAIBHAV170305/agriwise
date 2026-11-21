import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, 
  User, Phone, MapPin, Layers, Sprout, ShoppingBag, Truck, Users, 
  Send, RefreshCw, AlertTriangle, KeyRound, Check
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import LanguageSelector from './LanguageSelector';
import FarmingMascot from './FarmingMascot';
import WavyLoader from './WavyLoader';
import RakshakLogo, { RakshakIcon } from './RakshakLogo';

const INDIAN_STATES = [
  "Gujarat", "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh",
  "Madhya Pradesh", "Rajasthan", "Karnataka", "Tamil Nadu", "Andhra Pradesh",
  "Telangana", "West Bengal", "Bihar", "Odisha"
];

const SOIL_TYPES = [
  "Loamy Alluvial (जलोढ़ मिट्टी)",
  "Black Clay / Regur (काली मिट्टी)",
  "Red & Yellow Sandy (लाल मिट्टी)",
  "Laterite & Coastal (लैटेराइट मिट्टी)",
  "Sandy Desert Loam (रेतीली मिट्टी)"
];

const POPULAR_CROPS = [
  "Wheat (गेहूं)", "Rice / Paddy (धान)", "Cotton (कपास)",
  "Sugarcane (गन्ना)", "Tomato (टमाटर)", "Mustard (सरसों)",
  "Soybean (सोयाबीन)", "Potato (आलू)", "Maize (मक्का)"
];

export default function AuthView({ onLoginSuccess, onBackToLanding, initialMode = 'login' }) {
  const { t, currentLang, languages, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState(initialMode === 'register' ? 'register' : 'signin'); // 'signin' | 'register'
  const [signInType, setSignInType] = useState('otp'); // 'otp' | 'password'

  // Multi-step Registration State
  const [currentStep, setCurrentStep] = useState(1); // 1: Identity, 2: Profile, 3: Verify

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Identity
    name: '',
    email: 'farmer@agriwise.com',
    password: 'Farmer@123',
    phone: '+91 98765 43210',
    role: 'Farmer',
    // Step 2: Role / Agricultural Parameters
    state: 'Gujarat',
    district: 'Anand',
    farm_name: 'Anand Krishi Farm',
    area: 5.0,
    soil_type: 'Loamy Alluvial (जलोढ़ मिट्टी)',
    primary_crop: 'Wheat (गेहूं)',
    business_name: 'Gujarat Agro Traders',
    preferred_language: currentLang || 'en',
    // Step 3: Verification
    otp: ''
  });

  // OTP State for Sign-In
  const [loginEmail, setLoginEmail] = useState('farmer@agriwise.com');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDeliveryInfo, setOtpDeliveryInfo] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Password Login State
  const [passwordEmail, setPasswordEmail] = useState('farmer@agriwise.com');
  const [passwordInput, setPasswordInput] = useState('Farmer@123');

  // Handle Send OTP (via SendGrid / External Service)
  const handleSendOtp = async (targetEmail, isRegistration = false) => {
    const emailToDispatch = targetEmail || (isRegistration ? formData.email : loginEmail);
    if (!emailToDispatch || !emailToDispatch.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }

    setAuthError('');
    setLoading(true);

    try {
      const res = await api.sendEmailOtp(emailToDispatch);
      setOtpSent(true);
      setOtpDeliveryInfo(res);
      showToast({
        title: 'OTP Code Dispatched',
        message: `Security code sent via ${res.channel || 'Email Service'} to ${emailToDispatch}. Valid for 10 minutes.`,
        type: 'info'
      });

      // Auto-fill demo OTP if available for zero-friction evaluation
      if (res.demo_otp) {
        if (isRegistration) {
          setFormData(prev => ({ ...prev, otp: res.demo_otp }));
        } else {
          setLoginOtp(res.demo_otp);
        }
      }

      setOtpCountdown(60);
      const timer = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch email OTP.');
      showToast({
        title: 'OTP Dispatch Error',
        message: err.message || 'Could not connect to email delivery service.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP Login
  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    if (!loginOtp || loginOtp.trim().length < 4) {
      setAuthError('Please enter the 6-digit OTP code');
      return;
    }

    setAuthError('');
    setLoading(true);
    try {
      const res = await api.verifyEmailOtp(loginEmail, loginOtp);
      showToast({
        title: `Welcome, ${res.user.name}`,
        message: `Successfully verified via Email OTP. Accessing ${res.user.role} workspace.`,
        type: 'success'
      });
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired OTP code.');
      showToast({
        title: 'Verification Failed',
        message: err.message || 'Incorrect verification code.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const res = await api.login(passwordEmail, passwordInput);
      showToast({
        title: `Welcome back, ${res.user.name}`,
        message: `Signed in successfully as ${res.user.role}.`,
        type: 'success'
      });
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setAuthError(err.message || 'Incorrect email or password.');
      showToast({
        title: 'Sign In Failed',
        message: err.message || 'Invalid credentials.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemo = async (roleKey) => {
    setAuthError('');
    setLoading(true);
    try {
      const acc = DEMO_ACCOUNTS[roleKey];
      const res = await api.login(acc.email, acc.password);
      showToast({
        title: `Demo Session: ${res.user.name}`,
        message: `Connected to ${res.user.role} environment with active plots.`,
        type: 'success'
      });
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setAuthError(err.message || 'Quick login error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Multi-Step Registration Submit
  const handleMultiStepSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name || 'Farmer Member',
        email: formData.email,
        password: formData.password || 'Farmer@123',
        phone: formData.phone,
        role: formData.role,
        preferred_language: formData.preferred_language,
        state: formData.state,
        district: formData.district,
        farm_name: formData.farm_name,
        area: parseFloat(formData.area) || 5.0,
        soil_type: formData.soil_type,
        primary_crop: formData.primary_crop,
        business_name: formData.business_name,
        otp: formData.otp
      };

      const res = await api.registerMultiStep(payload);
      showToast({
        title: 'Onboarding Complete!',
        message: `Welcome to Bharat Agri-Stack, ${res.user.name}! Your farm profile is activated.`,
        type: 'success'
      });
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      showToast({
        title: 'Onboarding Error',
        message: err.message || 'Could not complete registration.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fbfaf6 0%, #f4f2ea 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Decoupled Navigation Bar */}
      <header style={{
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(22, 51, 38, 0.08)',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(22, 51, 38, 0.15)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#163326',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#edf5f0';
                e.currentTarget.style.borderColor = '#163326';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.15)';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Public Portal</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: '#163326',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d5e6db" strokeWidth="2.2">
                <path d="M 6.5 18.5 H 17.5" />
                <path d="M 12 18.5 V 13" />
                <path d="M 12 13.8 C 9 14.8 6.5 12.8 7.2 10.2 C 7.8 7.8 11 8.8 12 11.8" />
                <path d="M 12 11.8 C 13.2 8.8 15.5 6.2 17.8 7.2 C 19.2 8.5 17.5 12.5 12.5 11.8" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '1.18rem', fontWeight: 800, color: '#163326', letterSpacing: '-0.02em' }}>
                agriwise
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#587965', marginLeft: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                AUTHENTICATION DESK
              </span>
            </div>
          </div>
        </div>

        {/* Language Selector Component */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Two-Column Auth Experience */}
      <main style={{
        flex: 1,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '36px 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 460px) 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Column: Agriculture-Themed Visuals & Mascot */}
        <section style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 24px',
          border: '1px solid rgba(22, 51, 38, 0.1)',
          boxShadow: '0 12px 36px rgba(22, 51, 38, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Mascot Graphic with Tips */}
          <FarmingMascot />

          {/* Agrarian Highlights */}
          <div style={{
            marginTop: '28px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{
              background: '#f8faf7',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(22, 51, 38, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#163326', fontSize: '0.8rem', fontWeight: 800 }}>
                <ShieldCheck size={14} color="#2d6a4f" />
                ICAR Validated
              </div>
              <div style={{ fontSize: '0.72rem', color: '#657d70', marginTop: '3px' }}>
                CIBRC fertilizer & pesticide dosage protocols
              </div>
            </div>

            <div style={{
              background: '#f8faf7',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(22, 51, 38, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#163326', fontSize: '0.8rem', fontWeight: 800 }}>
                <Sprout size={14} color="#2d6a4f" />
                Kisan Stack
              </div>
              <div style={{ fontSize: '0.72rem', color: '#657d70', marginTop: '3px' }}>
                PM-Kisan & Soil Health Card integration ready
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sign In / Multi-Step Registration Form */}
        <section style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 36px 42px',
          border: '1px solid rgba(22, 51, 38, 0.12)',
          boxShadow: '0 16px 48px rgba(22, 51, 38, 0.08)'
        }}>
          {/* Mode Switcher: Sign In vs Multi-Step Onboarding */}
          <div style={{
            display: 'flex',
            background: '#f0f5f2',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '26px'
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: authMode === 'signin' ? '#ffffff' : 'transparent',
                color: authMode === 'signin' ? '#163326' : '#657d70',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: authMode === 'signin' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              Sign In to Field Desk
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: authMode === 'register' ? '#ffffff' : 'transparent',
                color: authMode === 'register' ? '#163326' : '#657d70',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              Multi-Step Register
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div style={{
              background: '#fdf2f2',
              border: '1.5px solid var(--crimson-600, #d90429)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#991b1b',
              fontSize: '0.84rem',
              fontWeight: 600
            }}>
              <AlertTriangle size={18} color="#d90429" style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: SIGN IN (OTP or Password)                        */}
          {/* ======================================================== */}
          {authMode === 'signin' && (
            <div>
              {/* Sign In Method Toggle: Email OTP vs Password */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setSignInType('otp')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: signInType === 'otp' ? '#2d6a4f' : 'rgba(22, 51, 38, 0.15)',
                    background: signInType === 'otp' ? '#edf5f0' : 'transparent',
                    color: signInType === 'otp' ? '#163326' : '#657d70',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={13} />
                  <span>External Email OTP (SendGrid)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignInType('password')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: signInType === 'password' ? '#2d6a4f' : 'rgba(22, 51, 38, 0.15)',
                    background: signInType === 'password' ? '#edf5f0' : 'transparent',
                    color: signInType === 'password' ? '#163326' : '#657d70',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <KeyRound size={13} />
                  <span>Password Login</span>
                </button>
              </div>

              {/* Sub-Option A: Email OTP Login */}
              {signInType === 'otp' && (
                <form onSubmit={handleVerifyOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Farmer / Business Email Address
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Mail size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="farmer@agriwise.com"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            borderRadius: '10px',
                            border: '1px solid rgba(22, 51, 38, 0.18)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            color: '#163326'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={loading || otpCountdown > 0}
                        onClick={() => handleSendOtp(loginEmail, false)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          background: otpCountdown > 0 ? '#d5e0d9' : '#163326',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: otpCountdown > 0 ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Send size={13} />
                        <span>{otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}</span>
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div style={{
                      background: '#f4f8f5',
                      border: '1px solid rgba(45, 106, 79, 0.2)',
                      borderRadius: '12px',
                      padding: '14px',
                      animation: 'scaleIn 0.2s ease'
                    }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                        Enter 6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '2px solid #2d6a4f',
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          letterSpacing: '8px',
                          textAlign: 'center',
                          outline: 'none',
                          color: '#163326',
                          background: '#ffffff'
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#587965', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Service: {otpDeliveryInfo?.channel || 'External REST Email API'}</span>
                        <span>Valid for 10 minutes</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !loginOtp}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: loginOtp ? '#163326' : '#d5e0d9',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: loginOtp ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: loginOtp ? '0 4px 16px rgba(22, 51, 38, 0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {loading ? <WavyLoader size="small" /> : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Sub-Option B: Password Login */}
              {signInType === 'password' && (
                <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        required
                        value={passwordEmail}
                        onChange={(e) => setPasswordEmail(e.target.value)}
                        placeholder="farmer@agriwise.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          color: '#163326'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          color: '#163326'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#163326',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(22, 51, 38, 0.2)'
                    }}
                  >
                    {loading ? <WavyLoader size="small" /> : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick 1-Click Role Login Buttons */}
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ⚡ 1-Click Quick Access Logins
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 600 }}>
                    Instant sign in
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px'
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
                      disabled={loading}
                      onClick={() => handleQuickDemo(btn.key)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(22, 51, 38, 0.12)',
                        background: '#ffffff',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = btn.color;
                        e.currentTarget.style.background = btn.bg;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.12)';
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '1.1rem' }}>{btn.icon}</span>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: btn.color,
                          background: btn.bg,
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          {btn.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#163326', marginTop: '4px' }}>
                        {btn.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#688273', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {btn.user}
                      </div>
                    </button>
                  ))}
                </div>

                <select
                  className="form-select"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleQuickDemo(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(22, 51, 38, 0.12)',
                    background: '#f8faf7',
                    color: '#556b5e',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Or choose role from dropdown...</option>
                  <option value="Farmer">🌾 Farmer: Ramesh Patel (farmer@agriwise.com)</option>
                  <option value="Buyer">💼 Wholesale Buyer: Ananya Sharma (buyer@agriwise.com)</option>
                  <option value="Delivery">🚚 Delivery Partner: Vikram Singh (delivery@agriwise.com)</option>
                  <option value="FPO">👥 FPO Lead: Sanjay Verma (fpo@agriwise.com)</option>
                  <option value="Admin">🛡️ Platform Admin: Platform Administrator (admin@agriwise.com)</option>
                </select>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: MULTI-STEP REGISTRATION FLOW                     */}
          {/* ======================================================== */}
          {authMode === 'register' && (
            <div>
              {/* Step Progress Tracker */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#163326',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.76rem',
                      fontWeight: 800
                    }}>
                      {currentStep}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#163326' }}>
                      {currentStep === 1 && 'Step 1: Account & Credentials'}
                      {currentStep === 2 && 'Step 2: Role & Agronomic Parameters'}
                      {currentStep === 3 && 'Step 3: Verification & Launch'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#688273', fontWeight: 700 }}>
                    Step {currentStep} of 3
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: '#edf2ee', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(currentStep / 3) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2d6a4f 0%, #52b788 100%)',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* STEP 1: Basic Identity & Credentials                 */}
              {/* ---------------------------------------------------- */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Full Name (किसान / व्यापारी का नाम)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ramesh Patel"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          color: '#163326'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Email Address (for OTP & Mandi telemetry)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ramesh.patel@gmail.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          color: '#163326'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                        Mobile Phone Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            borderRadius: '10px',
                            border: '1px solid rgba(22, 51, 38, 0.18)',
                            fontSize: '0.84rem',
                            outline: 'none',
                            color: '#163326'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                        Password (पासवर्ड)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="#688273" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            borderRadius: '10px',
                            border: '1px solid rgba(22, 51, 38, 0.18)',
                            fontSize: '0.84rem',
                            outline: 'none',
                            color: '#163326'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.name || !formData.email) {
                        setAuthError('Please fill in your name and email address to continue.');
                        return;
                      }
                      setAuthError('');
                      setCurrentStep(2);
                    }}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#163326',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(22, 51, 38, 0.18)'
                    }}
                  >
                    <span>Continue to Role & Profile</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 2: Role & Agronomic Parameters                  */}
              {/* ---------------------------------------------------- */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Role Selection Dropdown Menu */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '8px' }}>
                      Select Your Agri-Stack Role
                    </label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(22, 51, 38, 0.18)',
                        background: '#ffffff',
                        color: '#163326',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Farmer">🌾 Farmer / Primary Producer (किसान) — Cultivation, soil maps & produce sales</option>
                      <option value="Buyer">💼 Mandi Buyer / Trader (व्यापारी) — Wholesale sourcing & forward contracts</option>
                    </select>
                  </div>

                  {/* Agricultural Profile (for Farmer / FPO) */}
                  {formData.role === 'Farmer' || formData.role === 'FPO' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '4px' }}>
                            State (राज्य)
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '9px',
                              borderRadius: '9px',
                              border: '1px solid rgba(22, 51, 38, 0.18)',
                              fontSize: '0.84rem',
                              color: '#163326',
                              background: '#ffffff'
                            }}
                          >
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '4px' }}>
                            District / Tehsil (ज़िला)
                          </label>
                          <input
                            type="text"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            placeholder="Anand"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '9px',
                              border: '1px solid rgba(22, 51, 38, 0.18)',
                              fontSize: '0.84rem',
                              color: '#163326'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '4px' }}>
                            Farm Size (Acres)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder="5.0"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '9px',
                              border: '1px solid rgba(22, 51, 38, 0.18)',
                              fontSize: '0.84rem',
                              color: '#163326'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '4px' }}>
                            Primary Crop (मुख्य फसल)
                          </label>
                          <select
                            value={formData.primary_crop}
                            onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '9px',
                              borderRadius: '9px',
                              border: '1px solid rgba(22, 51, 38, 0.18)',
                              fontSize: '0.84rem',
                              color: '#163326',
                              background: '#ffffff'
                            }}
                          >
                            {POPULAR_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#163326', marginBottom: '4px' }}>
                          Soil Type (मिट्टी का प्रकार)
                        </label>
                        <select
                          value={formData.soil_type}
                          onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px',
                            borderRadius: '9px',
                            border: '1px solid rgba(22, 51, 38, 0.18)',
                            fontSize: '0.84rem',
                            color: '#163326',
                            background: '#ffffff'
                          }}
                        >
                          {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                        Business / Organization Name
                      </label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        placeholder="Mandi Procurement Agency Ltd."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          fontSize: '0.88rem',
                          color: '#163326'
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        padding: '11px 18px',
                        borderRadius: '12px',
                        border: '1px solid rgba(22, 51, 38, 0.18)',
                        background: '#ffffff',
                        color: '#163326',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSendOtp(formData.email, true);
                        setCurrentStep(3);
                      }}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#163326',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 16px rgba(22, 51, 38, 0.18)'
                      }}
                    >
                      <span>Proceed to Verification</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 3: Verification & Launch (OTP Integration)      */}
              {/* ---------------------------------------------------- */}
              {currentStep === 3 && (
                <form onSubmit={handleMultiStepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Kisan / Trader Identity Preview Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #163326 0%, #204b38 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RakshakIcon size={20} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', color: '#b6d7c5' }}>
                          BHARAT AGRI-STACK IDENTITY
                        </span>
                      </div>
                      <span style={{ background: '#52b788', color: '#163326', padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800 }}>
                        READY
                      </span>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{formData.name || 'Farmer Member'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#d5e6db', marginTop: '2px' }}>
                      {formData.role} • {formData.farm_name || formData.business_name} ({formData.district}, {formData.state})
                    </div>
                  </div>

                  {/* OTP Code Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Enter 6-Digit Email OTP dispatched to {formData.email}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                        placeholder="••••••"
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '2px solid #2d6a4f',
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          letterSpacing: '6px',
                          textAlign: 'center',
                          outline: 'none',
                          color: '#163326'
                        }}
                      />
                      <button
                        type="button"
                        disabled={otpCountdown > 0}
                        onClick={() => handleSendOtp(formData.email, true)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(22, 51, 38, 0.18)',
                          background: otpCountdown > 0 ? '#f0f5f2' : '#ffffff',
                          color: '#163326',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: otpCountdown > 0 ? 'default' : 'pointer'
                        }}
                      >
                        {otpCountdown > 0 ? `${otpCountdown}s` : 'Resend'}
                      </button>
                    </div>
                  </div>

                  {/* Language Preference */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Preferred Dashboard Language (भाषा प्राथमिकता)
                    </label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) => {
                        setFormData({ ...formData, preferred_language: e.target.value });
                        setLanguage(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        border: '1px solid rgba(22, 51, 38, 0.18)',
                        fontSize: '0.84rem',
                        color: '#163326',
                        background: '#ffffff'
                      }}
                    >
                      {languages.map(l => (
                        <option key={l.code} value={l.code}>
                          {l.nativeName} ({l.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: '1px solid rgba(22, 51, 38, 0.18)',
                        background: '#ffffff',
                        color: '#163326',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.otp}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: formData.otp ? '#163326' : '#d5e0d9',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: formData.otp ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: formData.otp ? '0 4px 16px rgba(22, 51, 38, 0.2)' : 'none'
                      }}
                    >
                      {loading ? <WavyLoader size="small" /> : (
                        <>
                          <span>Complete & Launch Dashboard</span>
                          <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
