import React, { useState } from 'react';
import { LogOut, ChevronRight, ArrowLeft, Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Sidebar({
  currentUser,
  currentRole,
  activeTab,
  setActiveTab,
  tabs = [],
  tabGroups = [],
  onLogout,
  onRequestLogout,
  onOpenProfile
}) {
  const { t, currentLanguageObj } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  // Normalize tabs into structured functional groups:
  const normalizedGroups = React.useMemo(() => {
    if (tabGroups && tabGroups.length > 0) {
      return tabGroups;
    }
    if (!tabs || tabs.length === 0) return [];
    
    // Check if tabs array is already an array of group objects
    if (tabs[0]?.tabs && Array.isArray(tabs[0].tabs)) {
      return tabs;
    }

    // If tabs have a group property
    const hasGroups = tabs.some(t => t.group);
    if (!hasGroups) {
      return [{ group: 'all', groupLabel: t('nav.navigationHeader', 'Platform Modules'), tabs }];
    }

    const groupsMap = new Map();
    tabs.forEach(tab => {
      const gKey = tab.group || 'default';
      const gLabel = tab.groupLabel || (
        gKey === 'overview' ? t('nav.groupOverview', 'Overview') :
        gKey === 'crop_intelligence' ? t('nav.groupCropIntelligence', 'Crop & Intelligence') :
        gKey === 'commerce_money' ? t('nav.groupCommerce', 'Commerce & Mandi') : ''
      );
      if (!groupsMap.has(gKey)) {
        groupsMap.set(gKey, { group: gKey, groupLabel: gLabel, tabs: [] });
      }
      groupsMap.get(gKey).tabs.push(tab);
    });
    return Array.from(groupsMap.values());
  }, [tabs, tabGroups, t]);

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      maxHeight: '100vh',
      position: 'sticky',
      top: 0,
      background: '#ffffff',
      borderRight: '1px solid rgba(27, 56, 43, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '2px 0 12px rgba(22, 51, 38, 0.03)',
      overflow: 'hidden'
    }}>
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab('overview')}
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(27, 56, 43, 0.06)',
          flexShrink: 0
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#163326',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(22, 51, 38, 0.16)',
          flexShrink: 0
        }}>
          {/* Seedling Sprout Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d5e6db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 6.5 18.5 H 17.5" />
            <path d="M 12 18.5 V 13" />
            <path d="M 12 13.8 C 9 14.8 6.5 12.8 7.2 10.2 C 7.8 7.8 11 8.8 12 11.8" />
            <path d="M 12 11.8 C 13.2 8.8 15.5 6.2 17.8 7.2 C 19.2 8.5 17.5 12.5 12.5 11.8" />
          </svg>
        </div>
        <div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            letterSpacing: '-0.025em', 
            color: '#163326',
            lineHeight: 1.05,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
          }}>
            agriwise
          </div>
          <div style={{ 
            fontSize: '0.62rem', 
            fontWeight: 700, 
            letterSpacing: '0.16em', 
            color: '#718779', 
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: '3px'
          }}>
            FIELD DESK
          </div>
        </div>
      </div>

      {/* Navigation Section (Strictly Scrollable with minHeight: 0) */}
      <div 
        className="sidebar-nav-scroll"
        style={{
          padding: '16px 12px',
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overscrollBehavior: 'contain'
        }}
      >
        {normalizedGroups.map((group, gIdx) => (
          <div key={group.group || gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {/* Functional Group Header */}
            {group.groupLabel && (
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#718779',
                textTransform: 'uppercase',
                padding: '6px 10px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{group.groupLabel}</span>
                <span style={{ 
                  height: '1px', 
                  background: 'rgba(27, 56, 43, 0.08)', 
                  flex: 1, 
                  marginLeft: '8px' 
                }} />
              </div>
            )}

            {/* Navigation Tab Items */}
            {group.tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: isActive ? '#163326' : 'transparent',
                    color: isActive ? '#ffffff' : '#45594e',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.16s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(22, 51, 38, 0.16)' : 'none',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#eef3ef';
                      e.currentTarget.style.color = '#163326';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#45594e';
                    }
                  }}
                >
                  <span style={{
                    color: isActive ? '#d5e6db' : '#6b8275',
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
                    <ChevronRight size={14} style={{ opacity: 0.8 }} />
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
        borderTop: '1px solid rgba(27, 56, 43, 0.08)',
        background: '#fcfbf8'
      }}>
        {/* Quick Language Preference Card */}
        <div style={{ padding: '10px 12px 6px' }}>
          <button
            onClick={() => setShowLangModal(true)}
            type="button"
            title="Click to change language / भाषा बदलें"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f5f8f6',
              border: '1px solid rgba(27, 56, 43, 0.12)',
              borderRadius: '10px',
              padding: '8px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 1px 3px rgba(27, 56, 43, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#edf5f0';
              e.currentTarget.style.borderColor = '#2d6a4f';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f8f6';
              e.currentTarget.style.borderColor = 'rgba(27, 56, 43, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '1.15rem' }}>🇮🇳</span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.62rem',
                  color: '#657c70',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {t('common.language', 'Language')}
                </div>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#163326',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentLanguageObj.nativeName}
                  <span style={{ fontSize: '0.72rem', color: '#687e71', fontWeight: 500, marginLeft: '4px' }}>
                    ({currentLanguageObj.short})
                  </span>
                </div>
              </div>
            </div>

            <span style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 56, 43, 0.15)',
              color: '#2d6a4f',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}>
              <Languages size={12} />
              {t('common.edit', 'Change')}
            </span>
          </button>
        </div>

        {/* User Card & Logout */}
        <div style={{
          padding: '10px 14px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          {currentUser ? (
            <div 
              onClick={onOpenProfile}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
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
                background: '#163326',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#163326',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser.name.split(' (')[0] || currentUser.name}
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  color: '#2d6a4f',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#718779', fontWeight: 600 }}>
              Guest Session
            </div>
          )}

          {currentUser && (
            <button
              onClick={onRequestLogout || onLogout}
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
