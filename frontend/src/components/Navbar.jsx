import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Bell, LogOut, CheckCircle2, ChevronRight, ChevronDown,
  User, ShieldCheck, MapPin, Layers, Phone, Mail,
  Building2, ExternalLink, ArrowRight, Award, Landmark, Eye
} from 'lucide-react';
import { RakshakIcon } from './RakshakLogo';
import { api, DEMO_ACCOUNTS } from '../api';
import FarmerProfileModal from './FarmerProfileModal';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import LocationBanner from './LocationBanner';

export default function Navbar({ 
  isLanding = false,
  currentUser, 
  currentRole, 
  activeTab, 
  setActiveTab, 
  onRoleSwitch, 
  onLogout,
  onRequestLogout,
  onOpenLogin,
  activeTabLabel,
  showProfileModal: externalShowProfileModal,
  setShowProfileModal: externalSetShowProfileModal
}) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();

  // Profile dropdown & modal state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [internalShowProfileModal, setInternalShowProfileModal] = useState(false);
  const isProfileModalOpen = externalShowProfileModal !== undefined ? externalShowProfileModal : internalShowProfileModal;
  const setProfileModalOpen = externalSetShowProfileModal || setInternalShowProfileModal;
  const [profileData, setProfileData] = useState(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      loadProfileData();
    }
  }, [currentUser]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  const loadProfileData = async () => {
    try {
      const data = await api.getProfile();
      setProfileData(data);
    } catch {
      // Fallback with sensible defaults based on currentUser
      setProfileData({
        id: currentUser?.id || 2,
        name: currentUser?.name || 'Ramesh Patel (Farmer)',
        email: currentUser?.email || 'farmer@agriwise.com',
        phone: currentUser?.phone || '+91-9876543211',
        role: currentUser?.role || 'Farmer',
        farmer_id: 'KID-2026-GJ-0002',
        district: 'Anand District',
        state: 'Gujarat',
        agro_zone: 'Western Plain Zone (Zone XIII)',
        farming_experience: '14+ Years',
        landholding_category: 'Small & Medium Landholder',
        trust_rating: 4.9,
        total_reviews: 52,
        stats: {
          total_farms: 2,
          total_acres: 18.5,
          active_crops: 2,
          active_listings: 3,
          orders_fulfilled: 52,
          fpo_count: 1
        }
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Farmer summary info for dropdown
  const stats = profileData?.stats || {
    total_farms: 2,
    total_acres: 18.5,
    active_crops: 2,
    active_listings: 3,
    orders_fulfilled: 52
  };

  // 1. LANDING PAGE NAVBAR (Clean header, NO module navigation tabs)
  if (isLanding) {
    return (
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#ffffff',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid rgba(27, 56, 43, 0.08)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#163326',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(22, 51, 38, 0.16)',
              flexShrink: 0
            }}>
              {/* Exact Seedling Sprout Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d5e6db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 6.5 18.5 H 17.5" />
                <path d="M 12 18.5 V 13" />
                <path d="M 12 13.8 C 9 14.8 6.5 12.8 7.2 10.2 C 7.8 7.8 11 8.8 12 11.8" />
                <path d="M 12 11.8 C 13.2 8.8 15.5 6.2 17.8 7.2 C 19.2 8.5 17.5 12.5 12.5 11.8" />
              </svg>
            </div>
            <div>
              <div style={{ 
                fontSize: '1.38rem', 
                fontWeight: 800, 
                letterSpacing: '-0.025em', 
                color: '#163326',
                lineHeight: 1.05,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
              }}>
                agriwise
              </div>
              <div style={{ 
                fontSize: '0.64rem', 
                fontWeight: 700, 
                letterSpacing: '0.18em', 
                color: '#718779', 
                textTransform: 'uppercase',
                lineHeight: 1,
                marginTop: '4px'
              }}>
                FIELD DESK
              </div>
            </div>
          </div>

          {/* Right Controls: Role Switcher Dropdown Menu + Sign In / Dashboard Shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Clean Role Switcher Dropdown Menu */}
            <div ref={roleDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f1f5f2',
                  border: '1px solid rgba(27, 56, 43, 0.12)',
                  borderRadius: '999px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#163326',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>{currentRole === 'Buyer' ? '💼 Wholesale Buyer' : '🌾 Farmer'}</span>
                <ChevronDown size={14} style={{ transform: showRoleDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
              </button>

              {showRoleDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#ffffff',
                  border: '1px solid rgba(27, 56, 43, 0.12)',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(22, 51, 38, 0.15)',
                  width: '260px',
                  zIndex: 1000,
                  padding: '6px',
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ padding: '6px 10px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#718779', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Select Demo Role
                  </div>
                  {[
                    { key: 'Farmer', label: 'Farmer / Producer', icon: '🌾', desc: 'Ramesh Patel • Cultivation & Mandi' },
                    { key: 'Buyer', label: 'Wholesale Buyer', icon: '💼', desc: 'Ananya Sharma • Mandi Procurement' }
                  ].map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => {
                        onRoleSwitch(r.key);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        borderRadius: '8px',
                        background: currentRole === r.key ? '#edf5f0' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.14s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (currentRole !== r.key) e.currentTarget.style.background = '#f6f9f7';
                      }}
                      onMouseLeave={(e) => {
                        if (currentRole !== r.key) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#163326' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#688273' }}>
                            {r.desc}
                          </div>
                        </div>
                      </div>
                      {currentRole === r.key && <span style={{ color: '#2d6a4f', fontWeight: 800, fontSize: '0.8rem' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{
                    background: '#163326',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
                  }}
                >
                  Enter Field Desk <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <button 
                className="btn-primary"
                onClick={onOpenLogin || (() => setActiveTab('login'))}
                style={{
                  background: '#163326',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // 2. LOGGED-IN TOP HEADER (Header bar to the right of the Sidebar)
  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: '#ffffff',
        borderBottom: '1px solid rgba(27, 56, 43, 0.08)',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: Current Active View Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#163326',
            margin: 0,
            letterSpacing: '-0.02em',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
          }}>
            {activeTabLabel || 'Dashboard'}
          </h2>
        </div>

        {/* Right Controls: Location Pill + Role Switcher Dropdown + Notifications + Profile Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LocationBanner variant="compact" />

          {/* Clean Role Switcher Dropdown Menu */}
          <div ref={roleDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowProfileDropdown(false);
                setShowNotifs(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.12)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#163326',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(22, 51, 38, 0.04)',
                transition: 'all 0.18s ease'
              }}
            >
              <span>{currentRole === 'Buyer' ? '💼 Wholesale Buyer' : '🌾 Farmer'}</span>
              <ChevronDown size={13} style={{ transform: showRoleDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
            </button>

            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.12)',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(22, 51, 38, 0.15)',
                width: '260px',
                zIndex: 1000,
                padding: '6px',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '6px 10px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#718779', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Switch Workspace Role
                </div>
                {[
                  { key: 'Farmer', label: 'Farmer / Producer', icon: '🌾', desc: 'Ramesh Patel • Field Intelligence' },
                  { key: 'Buyer', label: 'Wholesale Buyer', icon: '💼', desc: 'Ananya Sharma • Mandi Procurement' }
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      onRoleSwitch(r.key);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      border: 'none',
                      borderRadius: '8px',
                      background: currentRole === r.key ? '#edf5f0' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.14s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (currentRole !== r.key) e.currentTarget.style.background = '#f6f9f7';
                    }}
                    onMouseLeave={(e) => {
                      if (currentRole !== r.key) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#163326' }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#688273' }}>
                          {r.desc}
                        </div>
                      </div>
                    </div>
                    {currentRole === r.key && <span style={{ color: '#2d6a4f', fontWeight: 800, fontSize: '0.8rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowProfileDropdown(false);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.12)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1b382b',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span 
                  className="pulse-critical"
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--crimson-600)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fbfaf6',
                    boxShadow: '0 0 8px rgba(217, 4, 41, 0.4)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '340px',
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.12)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                padding: '18px',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#1b382b', margin: 0, fontWeight: 700 }}>Notifications ({unreadCount} new)</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: '#1b382b', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#75867d', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                      No alerts at this moment.
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: n.is_read ? '#fcfbf8' : '#eef4f0',
                          borderLeft: `3px solid ${n.priority === 'URGENT' ? '#a83838' : n.priority === 'WARNING' ? '#b47818' : '#1b382b'}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1b382b' }}>{n.title}</span>
                          <span style={{ fontSize: '0.65rem', color: '#75867d' }}>{n.notification_type}</span>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: '#4a5c52', marginTop: '4px', margin: '4px 0 0' }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Button & Container */}
          {currentUser ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifs(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '5px 12px 5px 6px',
                  borderRadius: '999px',
                  background: showProfileDropdown ? '#f2f7f4' : '#ffffff',
                  border: showProfileDropdown ? '1px solid #163326' : '1px solid rgba(27, 56, 43, 0.14)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                aria-expanded={showProfileDropdown}
                title="Open Profile Menu"
              >
                {/* Farmer Avatar with Online Indicator */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #163326 0%, #2d6a4f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#fff',
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(22, 51, 38, 0.2)'
                }}>
                  {currentUser.name ? currentUser.name[0] : 'R'}
                  {/* Green pulse dot */}
                  <span style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#2dc653',
                    border: '2px solid #ffffff'
                  }} />
                </div>

                {/* Farmer Name & Role Details */}
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: '90px' }}>
                  <div style={{ 
                    fontSize: '0.84rem', 
                    fontWeight: 800, 
                    color: '#163326', 
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {currentUser.name.split(' (')[0] || currentUser.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.66rem', 
                    color: '#52796f', 
                    lineHeight: 1.1, 
                    marginTop: '2px', 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <CheckCircle2 size={10} color="#2d6a4f" />
                    {currentUser.role} • Verified
                  </div>
                </div>

                {/* Animated Dropdown Chevron */}
                <div style={{
                  color: '#657a6f',
                  display: 'flex',
                  alignItems: 'center',
                  transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {/* Comprehensive Farmer Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '370px',
                  background: '#ffffff',
                  border: '1px solid rgba(27, 56, 43, 0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 16px 40px rgba(15, 33, 25, 0.16)',
                  padding: '16px',
                  zIndex: 1002,
                  animation: 'fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Profile Card Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #163326 0%, #204b36 100%)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#ffffff',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#2d6a4f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {currentUser.name ? currentUser.name[0] : 'R'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.98rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {currentUser.name}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: '#b7d9c5',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>ID: {profileData?.farmer_id || 'KID-2026-GJ-0002'}</span>
                          <span>•</span>
                          <span>{profileData?.district || 'Anand, Gujarat'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Badges in Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: 'rgba(82, 183, 136, 0.25)',
                        color: '#95d5b2',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={11} />
                        Aadhaar KYC
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.14)',
                        color: '#e4efe7',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Landmark size={11} />
                        PM-KISAN Linked
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.14)',
                        color: '#ffdd67',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        ★ 4.9 Rating
                      </span>
                    </div>
                  </div>

                  {/* Agricultural Metrics Snapshot */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    background: '#f8faf8',
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(27, 56, 43, 0.06)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.62rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Land</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#163326', marginTop: '2px' }}>{stats.total_acres || 18.5} <span style={{ fontSize: '0.64rem', fontWeight: 500 }}>Ac</span></div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.62rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Farms</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#163326', marginTop: '2px' }}>{stats.total_farms || 2} <span style={{ fontSize: '0.64rem', fontWeight: 500 }}>Plots</span></div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.62rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Crops</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#163326', marginTop: '2px' }}>{stats.active_crops || 2} <span style={{ fontSize: '0.64rem', fontWeight: 500 }}>Sown</span></div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.62rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Mandi</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#163326', marginTop: '2px' }}>{stats.active_listings || 3} <span style={{ fontSize: '0.64rem', fontWeight: 500 }}>Lots</span></div>
                    </div>
                  </div>

                  {/* Farmer Key Details Quick List */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid rgba(27, 56, 43, 0.08)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: '#718779' }}>Primary Soil:</span>
                      <strong style={{ color: '#163326' }}>{profileData?.primary_soil || 'Loamy Alluvial'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: '#718779' }}>Irrigation:</span>
                      <strong style={{ color: '#163326' }}>{profileData?.irrigation_summary || 'Solar Drip & Tube-well'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: '#718779' }}>FPO Co-op:</span>
                      <strong style={{ color: '#2d6a4f' }}>Kisan Kalyan Agritech</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: '#718779' }}>Soil Health Card:</span>
                      <strong style={{ color: '#2d6a4f' }}>Grade A (pH 7.2)</strong>
                    </div>
                  </div>

                  {/* Primary Button: View Full Farmer Profile Modal */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setProfileModalOpen(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #163326 0%, #204b36 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)',
                      transition: 'transform 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Eye size={16} />
                    View All Farmer Details & Documents
                  </button>

                  {/* Quick Action Shortcuts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(27, 56, 43, 0.08)', paddingTop: '8px' }}>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setActiveTab('farms');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#264234',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f7f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={14} color="#2d6a4f" />
                        Manage Farms & Crops
                      </span>
                      <ChevronRight size={14} color="#82968a" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setActiveTab('listings');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#264234',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f7f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RakshakIcon size={14} color="#2d6a4f" />
                        My Mandi Produce Listings
                      </span>
                      <ChevronRight size={14} color="#82968a" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setActiveTab('orders');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#264234',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f7f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={14} color="#2d6a4f" />
                        Buyer Orders & Dispatch
                      </span>
                      <ChevronRight size={14} color="#82968a" />
                    </button>
                  </div>

                  {/* Dropdown Footer: Logout */}
                  <div style={{
                    borderTop: '1px solid rgba(27, 56, 43, 0.08)',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#889e90' }}>
                      Session ID: #{currentUser.id} (Online)
                    </span>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onRequestLogout) {
                          onRequestLogout();
                        } else {
                          onLogout();
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#a83838',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fdeded'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn-primary"
              onClick={onOpenLogin || (() => setActiveTab('login'))}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Full Farmer Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profileData={profileData}
        onNavigate={(tab) => {
          setProfileModalOpen(false);
          setActiveTab(tab);
        }}
      />
    </>
  );
}

