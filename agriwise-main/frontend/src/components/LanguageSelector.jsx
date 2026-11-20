import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Languages, Check, ChevronDown, MapPin, Search, X } from 'lucide-react';

export default function LanguageSelector({ 
  variant = 'dropdown', // 'dropdown' | 'modal' | 'inline' | 'compact' | 'landing-banner'
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  dropDirection = 'down', // 'down' | 'up'
  onSelected
}) {
  const { currentLang, currentLanguageObj, setLanguage, languages, t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDropdownOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsDropdownOpen = externalOnClose 
    ? (val) => { if (!val) externalOnClose(); } 
    : setInternalIsOpen;

  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside for dropdown variant
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen && (variant === 'dropdown' || variant === 'compact')) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, variant, setIsDropdownOpen]);

  const filteredLanguages = languages.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code) => {
    setLanguage(code);
    setIsDropdownOpen(false);
    if (externalOnClose) externalOnClose();
    if (onSelected) onSelected(code);
  };

  // 1. MODAL VARIANT (Used for high-priority, zero-clipping selection from Sidebar, Footer, or Quick Switchers)
  if (variant === 'modal') {
    if (!isDropdownOpen) return null;

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 33, 25, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => {
          setIsDropdownOpen(false);
          if (externalOnClose) externalOnClose();
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '560px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(16, 36, 27, 0.28)',
            border: '1px solid rgba(27, 56, 43, 0.12)',
            padding: '24px 28px',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>🇮🇳</span>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  {t('common.selectLanguage', 'Select Language Preference')}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#687e71' }}>
                  11 Indian Agricultural Languages & Regional Dialects
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                if (externalOnClose) externalOnClose();
              }}
              style={{
                background: '#f4f7f5',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#495d52',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e6ece8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f4f7f5'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f7f6f1',
            border: '1px solid rgba(27, 56, 43, 0.12)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '14px'
          }}>
            <Search size={15} style={{ color: '#7a8c80' }} />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search language, state or native script (e.g. Hindi, ગુજરાતી, Punjab)..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.84rem',
                width: '100%',
                color: '#163326'
              }}
            />
          </div>

          {/* Languages Grid */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '8px',
            paddingRight: '4px',
            maxHeight: '400px'
          }}>
            {filteredLanguages.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2d6a4f' : '1px solid rgba(27, 56, 43, 0.1)',
                    background: isSelected ? '#edf5f0' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f7faf8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: isSelected ? '#163326' : '#eef3ef',
                      color: isSelected ? '#ffffff' : '#2d6a4f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {lang.short}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 800, 
                        color: '#163326',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {lang.nativeName}
                        <span style={{ fontSize: '0.76rem', color: '#687d70', fontWeight: 500 }}>
                          ({lang.name})
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.68rem', 
                        color: '#718579', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <MapPin size={10} style={{ opacity: 0.7, flexShrink: 0 }} />
                        {lang.region.split(' (')[0]}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span style={{
                      background: '#2d6a4f',
                      color: '#ffffff',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(27, 56, 43, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#657a6e'
          }}>
            <span>Active: <strong style={{ color: '#163326' }}>{currentLanguageObj.nativeName} ({currentLanguageObj.name})</strong></span>
            <span style={{ color: '#2d6a4f', fontWeight: 700 }}>✓ Applied across entire platform</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. DROPDOWN / COMPACT BUTTON (used in Navbar & Top Headers)
  if (variant === 'dropdown' || variant === 'compact') {
    const isUp = dropDirection === 'up';

    return (
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="Change Indian Language Preference"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: isDropdownOpen ? '#163326' : '#ffffff',
            color: isDropdownOpen ? '#ffffff' : '#1b382b',
            border: '1px solid rgba(27, 56, 43, 0.16)',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isDropdownOpen ? '0 4px 14px rgba(22, 51, 38, 0.2)' : '0 1px 3px rgba(27, 56, 43, 0.05)'
          }}
        >
          <Languages size={15} style={{ color: isDropdownOpen ? '#80ed99' : '#2d6a4f' }} />
          <span style={{ 
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            letterSpacing: '0.01em'
          }}>
            {currentLanguageObj.nativeName}
          </span>
          <span style={{
            fontSize: '0.66rem',
            background: isDropdownOpen ? 'rgba(255,255,255,0.2)' : '#eef4f0',
            color: isDropdownOpen ? '#ffffff' : '#2d6a4f',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {currentLanguageObj.short}
          </span>
          <ChevronDown 
            size={13} 
            style={{ 
              transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
              opacity: 0.7
            }} 
          />
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            ...(isUp ? { bottom: '44px' } : { top: '44px' }),
            width: '380px',
            maxWidth: 'calc(100vw - 24px)',
            background: '#ffffff',
            border: '1px solid rgba(27, 56, 43, 0.14)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(16, 36, 27, 0.18)',
            padding: '16px',
            zIndex: 9000,
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#163326' }}>
                    {t('common.selectLanguage', 'Select Language Preference')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6e8276', fontWeight: 500 }}>
                    11 Regional Languages for Indian Farmers
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f7f6f1',
              border: '1px solid rgba(27, 56, 43, 0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              marginBottom: '10px'
            }}>
              <Search size={14} style={{ color: '#7a8c80' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search state, language or script..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.78rem',
                  width: '100%',
                  color: '#163326'
                }}
              />
            </div>

            {/* Languages List */}
            <div style={{
              maxHeight: '290px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '5px',
              paddingRight: '4px'
            }}>
              {filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #2d6a4f' : '1px solid rgba(27, 56, 43, 0.07)',
                      background: isSelected ? '#edf5f0' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f7faf8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: isSelected ? '#163326' : '#eef3ef',
                        color: isSelected ? '#ffffff' : '#2d6a4f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        {lang.short}
                      </span>
                      <div>
                        <div style={{ 
                          fontSize: '0.84rem', 
                          fontWeight: 700, 
                          color: '#163326',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {lang.nativeName}
                          <span style={{ fontSize: '0.74rem', color: '#687d70', fontWeight: 500 }}>
                            ({lang.name})
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '0.67rem', 
                          color: '#718579', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginTop: '1px'
                        }}>
                          <MapPin size={10} style={{ opacity: 0.7 }} />
                          {lang.region.split(' (')[0]}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{
                        background: '#2d6a4f',
                        color: '#ffffff',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(27, 56, 43, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#657a6e'
            }}>
              <span>Selected: <strong>{currentLanguageObj.nativeName}</strong></span>
              <span style={{ color: '#2d6a4f', fontWeight: 600 }}>Syncs across all modules</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. INLINE / GRID SELECTOR (for Farmer Profile Modal, Settings, or Auth)
  if (variant === 'inline') {
    return (
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '10px',
          marginTop: '12px'
        }}>
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  border: isSelected ? '2px solid #2d6a4f' : '1px solid rgba(27, 56, 43, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  background: isSelected ? '#edf5f0' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(45, 106, 79, 0.12)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: isSelected ? '#163326' : '#eef3ef',
                      color: isSelected ? '#ffffff' : '#2d6a4f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}>
                      {lang.short}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#163326' }}>
                        {lang.nativeName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#687d70', fontWeight: 600 }}>
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: '#718579',
                    marginTop: '8px',
                    lineHeight: 1.3
                  }}>
                    {lang.region}
                  </div>
                </div>

                {isSelected ? (
                  <span style={{
                    background: '#2d6a4f',
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(27, 56, 43, 0.2)',
                    flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. LANDING PAGE BANNER (Prominent quick switcher on Landing View)
  if (variant === 'landing-banner') {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(27, 56, 43, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(22, 51, 38, 0.06)',
        margin: '20px 0 28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#eef4f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#163326'
            }}>
              <Languages size={18} />
            </span>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#163326' }}>
                अपनी भाषा चुनें / Select Your Regional Language
              </div>
              <div style={{ fontSize: '0.74rem', color: '#62796c' }}>
                AgriWise is built for farmers across Bharat in 11 Indian languages
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '0.74rem',
            background: '#edf5f0',
            color: '#2d6a4f',
            padding: '4px 10px',
            borderRadius: '999px',
            fontWeight: 700
          }}>
            Active: <strong>{currentLanguageObj.nativeName} ({currentLanguageObj.name})</strong>
          </div>
        </div>

        {/* Horizontal scrollable pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}>
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSelected ? '#163326' : '#f7f6f1',
                  color: isSelected ? '#ffffff' : '#234938',
                  border: isSelected ? '1px solid #163326' : '1px solid rgba(27, 56, 43, 0.1)',
                  borderRadius: '999px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{lang.nativeName}</span>
                <span style={{ 
                  opacity: 0.75, 
                  fontSize: '0.68rem',
                  fontWeight: 500 
                }}>
                  {lang.name}
                </span>
                {isSelected && <Check size={13} strokeWidth={3} style={{ color: '#80ed99' }} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
