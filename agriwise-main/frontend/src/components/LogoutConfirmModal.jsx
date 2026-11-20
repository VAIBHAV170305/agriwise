import React from 'react';
import { LogOut, ArrowLeft, X, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import CustomAgriLogo from './CustomAgriLogo';

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirmLogout,
  onExitToLanding,
  currentUser
}) {
  const { t } = useLanguage();

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
        backdropFilter: 'blur(6px)',
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
          border: '1px solid rgba(18, 53, 36, 0.14)',
          boxShadow: '0 24px 60px rgba(11, 28, 20, 0.28), 0 4px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #123524 0%, #1b4d36 100%)',
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
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={22} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {t('auth.logoutConfirmTitle', 'Confirm Session Termination')}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#b6d7c5', margin: '2px 0 0' }}>
                Agri-Wise Field Desk Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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
            border: '1px solid rgba(18, 53, 36, 0.08)',
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
              background: '#123524',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: '2px solid #10b981',
              flexShrink: 0
            }}>
              {cleanName[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#123524' }}>
                {cleanName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#688273', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{currentUser?.role || 'Farmer'}</span>
                <span>•</span>
                <span>{currentUser?.email || 'Active Session'}</span>
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '0.86rem',
            color: '#3d5246',
            lineHeight: 1.5,
            marginBottom: '20px'
          }}>
            Are you sure you want to end your active workspace session? Any unsaved form drafts or temporary uploads will be cleared.
          </p>

          {/* Action Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Confirm Logout (Red/Amber) */}
            <button
              onClick={onConfirmLogout}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={16} />
              {t('common.confirmLogout', 'Yes, Log Out of Session')}
            </button>

            {/* 2. Switch to Public Landing / Public Portal (Moved here from dashboard per user request) */}
            {onExitToLanding && (
              <button
                onClick={onExitToLanding}
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(18, 53, 36, 0.2)',
                  background: '#f4f8f5',
                  color: '#123524',
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
                  e.currentTarget.style.background = '#e7f1eb';
                  e.currentTarget.style.borderColor = '#123524';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f4f8f5';
                  e.currentTarget.style.borderColor = 'rgba(18, 53, 36, 0.2)';
                }}
              >
                <ArrowLeft size={15} />
                {t('nav.landingLink', 'Go to Public Portal (Keep Session)')}
              </button>
            )}

            {/* 3. Cancel & Stay on Dashboard */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid transparent',
                background: 'transparent',
                color: '#657d70',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f4f7f4';
                e.currentTarget.style.color = '#123524';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#657d70';
              }}
            >
              {t('common.cancel', 'Cancel & Stay on Dashboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
