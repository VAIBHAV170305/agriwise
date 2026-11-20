import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import RapidoLocationSelector from './RapidoLocationSelector';

export default function LocationModal() {
  const { showLocationModal, setShowLocationModal } = useLocation();

  if (!showLocationModal) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 28, 20, 0.76)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2200,
      padding: '16px',
      animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div 
        className="glass-card" 
        style={{
          maxWidth: '860px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(11, 28, 20, 0.38)',
          border: '1.5px solid rgba(22, 51, 38, 0.16)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #163326 0%, #24523d 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={22} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff', fontFamily: "'Fraunces', serif" }}>
                Interactive Pan-India Location & Pinpoint Selector
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#b9dcc8', margin: '2px 0 0' }}>
                Search any Indian city/mandi, select state & district, tap on the map, or auto-detect via GPS
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLocationModal(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.14)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <RapidoLocationSelector 
            onLocationSelected={() => setShowLocationModal(false)} 
            showConfirmButton={true}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
}
