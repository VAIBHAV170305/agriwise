import React, { useEffect } from 'react';
import { LogOut, X, ShieldAlert, User, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser
}) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawName = currentUser?.name || 'Farmer Member';
  const cleanName = rawName.split(' (')[0] || rawName;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11, 28, 20, 0.65)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid rgba(22, 51, 38, 0.14)',
          boxShadow: '0 24px 60px rgba(11, 28, 20, 0.28), 0 4px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #163326 0%, #204b38 100%)',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(217, 4, 41, 0.18)',
              border: '1.5px solid rgba(217, 4, 41, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="#ff6b6b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {t('auth.logoutConfirmTitle', 'Confirm Sign-Out')}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#b6d7c5', margin: '2px 0 0' }}>
                Agri-Wise Field Desk Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Active User Card */}
          <div style={{
            background: '#f8faf7',
            border: '1px solid rgba(22, 51, 38, 0.08)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#163326',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: '2px solid #52b788',
              flexShrink: 0
            }}>
              {cleanName[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#163326' }}>
                {cleanName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#688273', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#2d6a4f', fontWeight: 700 }}>{currentUser?.role || 'Farmer'}</span>
                <span>•</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.email || 'Active Field Session'}
                </span>
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '0.86rem',
            color: '#3d5246',
            lineHeight: 1.5,
            marginBottom: '22px'
          }}>
            {t('auth.logoutConfirmDesc', 'Are you sure you want to end your active workspace session? You will need to sign back in to access your farm telemetry, crop diagnostics, and mandi listings.')}
          </p>

          {/* Action Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Confirm Sign-Out (Crimson Danger Button) */}
            <button
              onClick={onConfirmLogout}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--crimson-600, #d90429)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(217, 4, 41, 0.28)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b80020';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--crimson-600, #d90429)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={16} />
              {t('auth.confirmSignOut', 'Yes, Sign Out of Agri-Wise')}
            </button>

            {/* 2. Cancel & Stay Logged In */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(22, 51, 38, 0.15)',
                background: '#f8faf7',
                color: '#163326',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#edf5f0';
                e.currentTarget.style.borderColor = '#163326';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8faf7';
                e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.15)';
              }}
            >
              {t('auth.stayLoggedIn', 'Cancel & Stay Logged In')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
