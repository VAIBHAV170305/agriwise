import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, 
  Sprout, Layers, Building2, ChevronRight, Landmark, BadgeCheck,
  Languages
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function FarmerProfileModal({ 
  isOpen, 
  onClose, 
  profileData, 
  onNavigate 
}) {
  const [activeSubTab, setActiveSubTab] = useState('identity');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const { currentLanguageObj, greeting, t } = useLanguage();

  if (!isOpen) return null;

  const profile = profileData || {};
  const stats = profile.stats || {
    total_farms: 2,
    total_acres: 18.5,
    active_crops: 2,
    active_listings: 3,
    orders_fulfilled: 52,
    fpo_count: 1
  };

  const farms = profile.farms || [
    {
      id: 1,
      farm_name: "Green Meadows Farm (North Block)",
      location: "Anand, Gujarat (22.56°N, 72.95°E)",
      area: 12.5,
      area_unit: "Acres",
      soil_type: "Loamy Alluvial",
      irrigation_type: "Drip & Tube-well",
      water_resources: "Borewell + Canal distributary",
      description: "Certified sustainable farm specializing in Wheat, Cotton, and organic vegetables."
    },
    {
      id: 2,
      farm_name: "Surya Valley Orchards",
      location: "Nashik, Maharashtra (19.99°N, 73.78°E)",
      area: 6.0,
      area_unit: "Acres",
      soil_type: "Black Clay Loam",
      irrigation_type: "Micro-Sprinkler",
      water_resources: "Farm pond and drip filtration unit",
      description: "High-density horticulture plot producing table grapes and greenhouse tomatoes."
    }
  ];

  const crops = profile.crops || [
    {
      id: 1,
      crop_name: "Wheat (Sharbati Gold)",
      crop_variety: "HD-3226 Super Cereal",
      farm_name: "Green Meadows Farm",
      season: "Rabi",
      growth_stage: "Flowering & Grain Filling",
      sowing_date: "2026-11-15",
      expected_harvest_date: "2027-03-25",
      cultivated_area: 8.0,
      harvest_quantity: 180.0,
      quantity_unit: "Quintals",
      status: "ACTIVE"
    },
    {
      id: 2,
      crop_name: "Hybrid Organic Tomato",
      crop_variety: "Abhinav F1",
      farm_name: "Surya Valley Orchards",
      season: "Kharif",
      growth_stage: "Fruiting & Harvest",
      sowing_date: "2026-08-10",
      expected_harvest_date: "2026-11-20",
      cultivated_area: 3.5,
      harvest_quantity: 450.0,
      quantity_unit: "Crater Boxes (25kg)",
      status: "ACTIVE"
    }
  ];

  return (
    <div style={{
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
      zIndex: 2000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(15, 33, 25, 0.25)',
          overflow: 'hidden',
          border: '1px solid rgba(27, 56, 43, 0.12)'
        }}
      >
        {/* Modal Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #163326 0%, #1e4d36 60%, #2a6144 100%)',
          color: '#ffffff',
          padding: '24px 28px 20px',
          position: 'relative',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={18} />
          </button>

          {/* Farmer Primary Identity */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              flexShrink: 0
            }}>
              {profile.name ? profile.name[0] : 'R'}
              <span style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#52b788',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #163326',
                color: '#163326'
              }}>
                <CheckCircle2 size={12} strokeWidth={3} />
              </span>
            </div>

            {/* Basic Info */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  letterSpacing: '-0.02em'
                }}>
                  {profile.name || 'Ramesh Patel (Farmer)'}
                </h3>
                <span style={{
                  background: 'rgba(82, 183, 136, 0.22)',
                  color: '#95d5b2',
                  border: '1px solid rgba(82, 183, 136, 0.4)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} />
                  Verified Kisan
                </span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#e4efe7',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '999px'
                }}>
                  ID: {profile.farmer_id || 'KID-2026-GJ-0002'}
                </span>
              </div>

              <p style={{
                fontSize: '0.84rem',
                color: '#c2dacb',
                margin: '6px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#95d5b2" />
                  {profile.district || 'Anand'}, {profile.state || 'Gujarat'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} color="#95d5b2" />
                  {profile.phone || '+91-9876543211'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} color="#95d5b2" />
                  {profile.email || 'farmer@agriwise.com'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '10px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: '#a3c2af', textTransform: 'uppercase', fontWeight: 600 }}>Total Land</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{stats.total_acres || 18.5} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Acres</span></div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: '#a3c2af', textTransform: 'uppercase', fontWeight: 600 }}>Farm Holdings</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{stats.total_farms || 2} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Farms</span></div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: '#a3c2af', textTransform: 'uppercase', fontWeight: 600 }}>Active Crops</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{stats.active_crops || 2} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Varieties</span></div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: '#a3c2af', textTransform: 'uppercase', fontWeight: 600 }}>Mandi Listings</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{stats.active_listings || 3} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Lots</span></div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: '#a3c2af', textTransform: 'uppercase', fontWeight: 600 }}>Trust Rating</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffdd67' }}>★ {profile.trust_rating || 4.9} <span style={{ fontSize: '0.72rem', color: '#d8e5dd', fontWeight: 500 }}>({profile.total_reviews || 52})</span></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(27, 56, 43, 0.08)',
          background: '#fcfbf8',
          padding: '0 24px',
          overflowX: 'auto',
          gap: '8px'
        }}>
          {[
            { id: 'identity', label: 'Farmer Identity & KYC', icon: <BadgeCheck size={15} /> },
            { id: 'farms', label: 'Land & Farm Holdings', icon: <Layers size={15} /> },
            { id: 'crops', label: 'Crop Portfolio', icon: <Sprout size={15} /> },
            { id: 'fpo', label: 'FPO & Cooperatives', icon: <Building2 size={15} /> },
            { id: 'schemes', label: 'Government Schemes & Cards', icon: <Landmark size={15} /> },
            { id: 'language', label: t('profile.languagePrefTab', 'Language Preference'), icon: <Languages size={15} /> }
          ].map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '14px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2.5px solid #163326' : '2.5px solid transparent',
                  color: isActive ? '#163326' : '#687c70',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ color: isActive ? '#163326' : '#889e91' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          background: '#fbfaf6',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

          {/* TAB 1: IDENTITY & KYC */}
          {activeSubTab === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ margin: '0 0 16px', color: '#163326', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BadgeCheck size={18} color="#2d6a4f" />
                  Kisan Personal & Registry Profile
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Full Legal Name</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.name || 'Ramesh Somabhai Patel'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Farmer Category</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.landholding_category || 'Small & Medium Landholder (Progressive)'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Registered Mobile</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.phone || '+91 98765 43211'} (WhatsApp Verified)</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Official Email</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.email || 'farmer@agriwise.com'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Agro-Climatic Zone</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.agro_zone || 'Western Plain Zone (Zone XIII)'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Farming Experience</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.farming_experience || '14+ Years (Inherited Agriculture)'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Advisory Language</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{profile.preferred_language || 'Gujarati, Hindi, English'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#718779', textTransform: 'uppercase', fontWeight: 700 }}>Account Status</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2d6a4f', marginTop: '2px' }}>
                      ACTIVE • KYC COMPLETE
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory & Financial Credentials */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ margin: '0 0 16px', color: '#163326', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#2d6a4f" />
                  Government KYC & Banking Verification
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px'
                }}>
                  <div style={{ padding: '12px', background: '#f4f8f5', borderRadius: '8px', border: '1px solid #d5e6db' }}>
                    <div style={{ fontSize: '0.68rem', color: '#52796f', fontWeight: 700 }}>AADHAAR VERIFICATION</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#163326', marginTop: '4px' }}>Linked & Biometrically Authenticated</div>
                    <div style={{ fontSize: '0.74rem', color: '#2d6a4f', marginTop: '2px' }}>UIDAI Status: VALID (Masked: ****4211)</div>
                  </div>

                  <div style={{ padding: '12px', background: '#f4f8f5', borderRadius: '8px', border: '1px solid #d5e6db' }}>
                    <div style={{ fontSize: '0.68rem', color: '#52796f', fontWeight: 700 }}>KISAN CREDIT CARD (KCC)</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#163326', marginTop: '4px' }}>SBI Anand Agri Branch</div>
                    <div style={{ fontSize: '0.74rem', color: '#2d6a4f', marginTop: '2px' }}>Approved Limit: ₹3,50,000 (Active)</div>
                  </div>

                  <div style={{ padding: '12px', background: '#f4f8f5', borderRadius: '8px', border: '1px solid #d5e6db' }}>
                    <div style={{ fontSize: '0.68rem', color: '#52796f', fontWeight: 700 }}>PM-KISAN BENEFICIARY ID</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#163326', marginTop: '4px' }}>{profile.pm_kisan_id || 'PMK-GJ-98224'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#2d6a4f', marginTop: '2px' }}>Direct Benefit Transfer: Active</div>
                  </div>

                  <div style={{ padding: '12px', background: '#f4f8f5', borderRadius: '8px', border: '1px solid #d5e6db' }}>
                    <div style={{ fontSize: '0.68rem', color: '#52796f', fontWeight: 700 }}>e-NAM NATIONAL MANDI REG</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#163326', marginTop: '4px' }}>{profile.enam_id || 'ENAM-GJ-0429'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#2d6a4f', marginTop: '2px' }}>Inter-State Trading Permitted</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAND & FARMS */}
          {activeSubTab === 'farms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#163326', fontSize: '1rem', fontWeight: 700 }}>
                  Registered Farm Holdings ({farms.length})
                </h4>
                {onNavigate && (
                  <button
                    onClick={() => { onClose(); onNavigate('farms'); }}
                    style={{
                      background: '#163326',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Open Farm Manager <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {farms.map((farm, idx) => (
                <div 
                  key={farm.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(27, 56, 43, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h5 style={{ margin: 0, fontSize: '1.05rem', color: '#163326', fontWeight: 700 }}>
                          {farm.farm_name}
                        </h5>
                        <span style={{
                          background: '#eef4f0',
                          color: '#2d6a4f',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          Plot #{idx + 1}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#687c70', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#2d6a4f" />
                        {farm.location}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163326' }}>
                        {farm.area} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#687c70' }}>{farm.area_unit || 'Acres'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f8f9f6',
                    borderRadius: '8px',
                    border: '1px solid rgba(27, 56, 43, 0.05)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Soil Classification</span>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{farm.soil_type || 'Loamy Alluvial'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Irrigation Infrastructure</span>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{farm.irrigation_type || 'Drip & Tube-well'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Water Resources</span>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{farm.water_resources || 'Borewell + Canal'}</div>
                    </div>
                  </div>

                  {farm.description && (
                    <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: '#4d6154', fontStyle: 'italic' }}>
                      "{farm.description}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CROPS */}
          {activeSubTab === 'crops' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#163326', fontSize: '1rem', fontWeight: 700 }}>
                  Active Cultivated Crops ({crops.length})
                </h4>
                {onNavigate && (
                  <button
                    onClick={() => { onClose(); onNavigate('farms'); }}
                    style={{
                      background: '#163326',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    View Field Records <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {crops.map((crop, idx) => (
                <div 
                  key={crop.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(27, 56, 43, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: '#eef4f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2d6a4f'
                        }}>
                          <Sprout size={16} />
                        </span>
                        <h5 style={{ margin: 0, fontSize: '1.05rem', color: '#163326', fontWeight: 700 }}>
                          {crop.crop_name}
                        </h5>
                        <span style={{
                          background: '#e8f5e9',
                          color: '#2e7d32',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {crop.season} Season
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 36px', fontSize: '0.8rem', color: '#687c70' }}>
                        Variety: <strong>{crop.crop_variety || 'High Yield'}</strong> • Holding: {crop.farm_name || 'Main Plot'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        background: '#d8f3dc',
                        color: '#1b4332',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {crop.growth_stage || 'Active Growth'}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f8f9f6',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Cultivated Area</span>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#163326', marginTop: '2px' }}>{crop.cultivated_area || 8.0} Acres</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Sowing Date</span>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{crop.sowing_date || '2026-11-15'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Expected Harvest</span>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#163326', marginTop: '2px' }}>{crop.expected_harvest_date || '2027-03-25'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700, textTransform: 'uppercase' }}>Target Yield</span>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2d6a4f', marginTop: '2px' }}>{crop.harvest_quantity} {crop.quantity_unit}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: FPO & COOPERATIVE */}
          {activeSubTab === 'fpo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#163326',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#163326', fontSize: '1.1rem', fontWeight: 800 }}>
                      Kisan Kalyan Agritech Producer Co.
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#687c70' }}>
                      Registration: <strong>FPO-2026-IND-8841</strong> • Western Agro-Climatic Zone
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  padding: '14px',
                  background: '#f8f9f6',
                  borderRadius: '10px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700 }}>MEMBERSHIP STATUS</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2d6a4f', marginTop: '2px' }}>Active Voting Shareholder</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700 }}>SHARE CAPITAL ALLOTTED</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#163326', marginTop: '2px' }}>50 Equity Shares (Class A)</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700 }}>COLD STORAGE ALLOCATION</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#163326', marginTop: '2px' }}>Slot 14B (Solar Cold Store)</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#718779', fontWeight: 700 }}>BULK FERTILIZER SUBSIDY</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2d6a4f', marginTop: '2px' }}>12% Member Discount Active</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#4a5e52', lineHeight: 1.5 }}>
                  The FPO provides member farmers with collective bargaining for procurement, shared machinery (rotavators, seed drills, multi-crop harvesters), quality testing labs, and direct B2B institutional buyer contracts with guaranteed floor prices.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEMES & BADGES */}
          {activeSubTab === 'schemes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: '#163326', fontSize: '1rem', fontWeight: 700 }}>
                Enrolled Agricultural Schemes & Certifications
              </h4>

              {[
                {
                  title: "PM-KISAN Samman Nidhi",
                  id: profile.pm_kisan_id || "PMK-GJ-98224",
                  desc: "Direct income support of ₹6,000 per annum paid in three equal 4-monthly installments.",
                  status: "16th Installment Credited",
                  badge: "Active Beneficiary"
                },
                {
                  title: "National Soil Health Card Scheme",
                  id: "SHC-2026-GJ-71829",
                  desc: "Soil tested: pH 7.2, Organic Carbon 0.68%, High available Phosphorus & Potassium. Grade A certificate.",
                  status: "Valid till March 2029",
                  badge: "Grade A Certified"
                },
                {
                  title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                  id: "PMFBY-2026-WHEAT-881",
                  desc: "Comprehensive yield protection and post-harvest calamity coverage for Wheat and Tomato crops.",
                  status: "Coverage: ₹2,40,000",
                  badge: "Insured Policy"
                },
                {
                  title: "Sub-Mission on Agricultural Mechanization (SMAM)",
                  id: "SMAM-2025-SOLAR-091",
                  desc: "Capital subsidy for solar-powered micro-irrigation drip fertigation pumpset.",
                  status: "Subsidy Disbursed (45%)",
                  badge: "Subsidy Completed"
                },
                {
                  title: "NPOP Sustainable Organic Farm In-Conversion",
                  id: "NPOP-ORG-GJ-2026-03",
                  desc: "Aditi Organic Certification Agency audit passed for chemical residue-free wheat production.",
                  status: "Conversion Year 2",
                  badge: "NPOP In-Conversion"
                }
              ].map((scheme, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(27, 56, 43, 0.08)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '14px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h5 style={{ margin: 0, fontSize: '0.92rem', color: '#163326', fontWeight: 700 }}>
                        {scheme.title}
                      </h5>
                      <span style={{
                        background: '#eef4f0',
                        color: '#2d6a4f',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}>
                        {scheme.badge}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#687c70' }}>
                      ID: <strong>{scheme.id}</strong> • {scheme.desc}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#2d6a4f',
                    whiteSpace: 'nowrap'
                  }}>
                    {scheme.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: LANGUAGE PREFERENCE */}
          {activeSubTab === 'language' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 56, 43, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#eef4f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#163326'
                    }}>
                      <Languages size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#163326', fontSize: '1.05rem', fontWeight: 800 }}>
                        {t('profile.languagePrefTitle', 'Select Your Preferred Regional Language')}
                      </h4>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#657a6e' }}>
                        {t('profile.languagePrefDesc', 'AgriWise adapts all advisory, weather, market reports, and AI assistance to your native language.')}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: '#edf5f0',
                    border: '1px solid rgba(45, 106, 79, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    color: '#2d6a4f',
                    fontWeight: 700
                  }}>
                    Active: <strong>{currentLanguageObj.nativeName} ({currentLanguageObj.name})</strong>
                  </div>
                </div>

                {/* Farmer Greeting Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #163326 0%, #234938 100%)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(22, 51, 38, 0.15)'
                }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                      {greeting} • {profile.name || 'Ramesh Patel'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#c3dbcd', marginTop: '4px' }}>
                      Primary Agronomic Zone: {profile.agro_zone || 'Western Plain Zone (Zone XIII)'} • All crop & soil guidance translated
                    </div>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🌾</span>
                </div>

                {/* Inline Language Selector */}
                <LanguageSelector 
                  variant="inline" 
                  onSelected={(code) => {
                    setSaveSuccessMsg(t('common.savedSuccess', 'Language preference updated and saved successfully!'));
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }}
                />

                {saveSuccessMsg && (
                  <div style={{
                    marginTop: '16px',
                    padding: '10px 16px',
                    background: '#edf7ed',
                    border: '1px solid #b7e4c7',
                    borderRadius: '8px',
                    color: '#2d6a4f',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '16px 28px',
          background: '#ffffff',
          borderTop: '1px solid rgba(27, 56, 43, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#718779' }}>
            Agri-Wise Registered Farmer ID: <strong>{profile.farmer_id || 'KID-2026-GJ-0002'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onNavigate && (
              <button
                onClick={() => { onClose(); onNavigate('listings'); }}
                style={{
                  background: 'transparent',
                  color: '#163326',
                  border: '1px solid rgba(27, 56, 43, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                My Mandi Produce
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#163326',
                color: '#ffffff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
