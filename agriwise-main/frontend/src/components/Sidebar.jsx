import React, { useState } from 'react';
import { LogOut, ChevronRight, ArrowLeft, Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import CustomAgriLogo from './CustomAgriLogo';

export default function Sidebar({
  currentUser,
  currentRole,
  activeTab,
  setActiveTab,
  tabGroups = [],
  tabs = [], // fallback if flat tabs passed
  onLogout,
  onOpenProfile
}) {
  const { t, currentLanguageObj } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  // Normalize into groups if flat array was provided
  const normalizedGroups = tabGroups.length > 0 
    ? tabGroups 
    : [{ group: t('nav.navigationHeader', 'Platform Modules'), items: tabs }];

  return (
    <aside style={{
      width: '264px',
      minWidth: '264px',
      height: '100vh',
      maxHeight: '100vh',
      position: 'sticky',
      top: 0,
      background: '#ffffff',
      borderRight: '1px solid rgba(18, 53, 36, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '2px 0 16px rgba(18, 53, 36, 0.03)',
      overflow: 'hidden'
    }}>
      {/* Brand Header with Custom Agricultural AI Logo */}
      <div 
        onClick={() => setActiveTab('overview')}
        style={{
          padding: '18px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(18, 53, 36, 0.06)',
          flexShrink: 0
        }}
      >
        <CustomAgriLogo size={36} variant="full" />
      </div>

      {/* Navigation Sections Grouped Functionally */}
      <div 
        className="sidebar-nav-scroll"
        style={{
          padding: '14px 10px',
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overscrollBehavior: 'contain'
        }}
      >
        {normalizedGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {/* Functional Group Header */}
            {group.group && (
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#6c8577',
                textTransform: 'uppercase',
                padding: '6px 12px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{group.group}</span>
                <span style={{ 
                  height: '1px', 
                  background: 'rgba(18, 53, 36, 0.08)', 
                  flex: 1, 
                  marginLeft: '8px' 
                }} />
              </div>
            )}

            {/* Navigation Tab Items */}
            {group.items.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                    background: isActive ? '#123524' : 'transparent',
                    color: isActive ? '#ffffff' : '#3d5246',
                    fontSize: '0.83rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.16s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(18, 53, 36, 0.18)' : 'none',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#edf5f0';
                      e.currentTarget.style.color = '#123524';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#3d5246';
                    }
                  }}
                >
                  <span style={{
                    color: isActive ? '#f59e0b' : '#6b8275',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {tab.icon}
                  </span>
                  <span style={{ 
                    flex: 1, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <ChevronRight size={14} color="#f59e0b" style={{ opacity: 0.9 }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pinned Bottom Footer: Language Preference Card + User Profile */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(18, 53, 36, 0.08)',
        background: '#fafcf9'
      }}>
        {/* Quick Language Preference Card */}
        <div style={{ padding: '8px 10px 4px' }}>
          <button
            onClick={() => setShowLangModal(true)}
            type="button"
            title="Click to change language / भाषा बदलें"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f2f7f4',
              border: '1px solid rgba(18, 53, 36, 0.1)',
              borderRadius: '9px',
              padding: '7px 9px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eaf4ee';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f2f7f4';
              e.currentTarget.style.borderColor = 'rgba(18, 53, 36, 0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.58rem',
                  color: '#657c70',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {t('common.language', 'Language')}
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#123524',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentLanguageObj.nativeName}
                </div>
              </div>
            </div>

            <span style={{
              background: '#ffffff',
              border: '1px solid rgba(18, 53, 36, 0.12)',
              color: '#123524',
              padding: '2px 7px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}>
              <Languages size={11} />
              {t('common.edit', 'Change')}
            </span>
          </button>
        </div>

        {/* User Card & Logout */}
        <div style={{
          padding: '8px 12px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {currentUser ? (
            <div 
              onClick={onOpenProfile}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '9px', 
                minWidth: 0,
                cursor: onOpenProfile ? 'pointer' : 'default',
                padding: '4px 6px',
                borderRadius: '8px',
                transition: 'background 0.15s ease',
                flex: 1
              }}
              title={onOpenProfile ? "Click to view full farmer profile details" : undefined}
              onMouseEnter={(e) => { if (onOpenProfile) e.currentTarget.style.background = '#eef4f0'; }}
              onMouseLeave={(e) => { if (onOpenProfile) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#123524',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                flexShrink: 0,
                border: '1px solid #10b981'
              }}>
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#123524',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser.name.split(' (')[0] || currentUser.name}
                </div>
                <div style={{
                  fontSize: '0.66rem',
                  color: '#10b981',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.76rem', color: '#718779', fontWeight: 600 }}>
              Guest Session
            </div>
          )}

          {currentUser && (
            <button
              onClick={onLogout}
              title="Log Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#82968a',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a83838';
                e.currentTarget.style.background = '#fdeded';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#82968a';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Language Selection Modal */}
      <LanguageSelector 
        variant="modal"
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </aside>
  );
}
