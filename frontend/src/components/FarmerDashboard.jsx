import React, { useState, useEffect } from 'react';
import { 
  Activity, CloudSun, TrendingUp, AlertTriangle, ShieldCheck, 
  MapPin, Leaf, DollarSign, Calendar, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';
import ShimmerSkeleton from './ShimmerSkeleton';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';

export default function FarmerDashboard({ onNavigate }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard(false);
  }, []);

  const loadDashboard = async (notify = false) => {
    setLoading(true);
    try {
      const res = await api.getDecisionSupport();
      setData(res);
      if (notify) {
        showToast({
          title: 'Signals Refreshed',
          message: 'Agronomic telemetry and Mandi prices synchronized.',
          type: 'success'
        });
      }
    } catch (err) {
      console.error(err);
      if (notify) {
        showToast({
          title: 'Refresh Issue',
          message: 'Using cached telemetry.',
          type: 'warning'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '36px 0', maxWidth: '1000px', margin: '0 auto' }}>
        <WavyLoader label="Synthesizing localized agronomic telemetry, weather, and Mandi price corridors..." color="#163326" />
        <div style={{ marginTop: '30px' }}>
          <ShimmerSkeleton rows={4} height={52} borderRadius={12} />
        </div>
      </div>
    );
  }

  const metrics = data?.summary_metrics || {};
  const signals = data?.signals || [];

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(27, 56, 43, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">Decision Support Engine Active</span>
            <span style={{
              background: '#eef4f0',
              color: '#2d6a4f',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              🇮🇳 {currentLanguageObj.nativeName}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#687e72' }}>Continuous Telemetry Sync</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: '#163326', fontWeight: 800 }}>
            {greeting} • {t('nav.overview', 'Farm Intelligence & Unified Signal Stream')}
          </h2>
          <p style={{ color: '#4a5c52', fontSize: '0.94rem', maxWidth: '650px', marginTop: '4px' }}>
            Aggregating localized soil data, real-time meteorological forecasts, disease surveillance, and regional mandi demand corridors into proactive recommendations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary"
            onClick={() => onNavigate('crops-recommend')}
          >
            <RakshakIcon size={16} color="#d8f3dc" /> Run Crop Recommendation
          </button>
          <button 
            className="btn-secondary"
            onClick={() => loadDashboard(true)}
          >
            <RefreshCw size={16} /> Refresh Signals
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#576c60', fontWeight: 600 }}>REGISTERED FARMS</span>
            <MapPin size={18} color="#2d5740" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.total_farms || 0} <span style={{ fontSize: '0.9rem', color: '#73867d', fontWeight: 500 }}>Plots</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#2d5740', marginTop: '4px', fontWeight: 600 }}>
            Total {metrics.total_acreage || 0} Acres Managed
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#576c60', fontWeight: 600 }}>ACTIVE CROPS</span>
            <Leaf size={18} color="#2d5740" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.active_crops_count || 0} <span style={{ fontSize: '0.9rem', color: '#73867d', fontWeight: 500 }}>Batches</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#73867d', marginTop: '4px' }}>
            Rabi & Kharif Cultivation
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#576c60', fontWeight: 600 }}>LOCAL WEATHER</span>
            <CloudSun size={18} color="#22678f" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            {metrics.weather_temp || 28}°C
          </div>
          <p style={{ fontSize: '0.78rem', color: '#22678f', marginTop: '4px', fontWeight: 600 }}>
            {metrics.weather_condition || 'Partly Cloudy'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#576c60', fontWeight: 600 }}>LOGGED EXPENSES</span>
            <DollarSign size={18} color="#b47818" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#163326', marginTop: '8px' }}>
            ₹{Number(metrics.total_expenses || 0).toLocaleString()}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#b47818', marginTop: '4px', fontWeight: 600 }}>
            Seeds, Labor & Irrigation
          </p>
        </div>
      </div>

      {/* Proactive Signal Intelligence Feed */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>Proactive Agricultural Action Signals</h3>
            <p style={{ fontSize: '0.82rem', color: '#576c60' }}>
              Synthesized by AI combining multiple data streams. Each signal transparently indicates its data provenance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {signals.map((sig, idx) => {
            const isHigh = sig.priority === 'HIGH' || sig.priority === 'URGENT';
            const isOpp = sig.priority === 'OPPORTUNITY';
            
            return (
              <div 
                key={idx}
                className={`glass-card card-hover-lift ${isHigh ? 'card-critical' : ''}`}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderLeft: `4px solid ${isHigh ? 'var(--crimson-600)' : isOpp ? 'var(--amber-500)' : '#163326'}`
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className={`badge ${isHigh ? 'badge-critical pulse-critical' : isOpp ? 'badge-amber' : 'badge-emerald'}`}>
                      {isHigh ? 'CRITICAL ALERT: ' : ''}{sig.category}
                    </span>
                    
                    {/* Data Provenance Tag */}
                    <span className={`tag-provenance ${
                      sig.data_source_label.includes('VERIFIED') ? 'tag-verified' :
                      sig.data_source_label.includes('AI') ? 'tag-ai' :
                      sig.data_source_label.includes('WEATHER') ? 'tag-external' : 'tag-simulated'
                    }`}>
                      SOURCE: {sig.data_source_label}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Confidence: {sig.confidence}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: '#163326', marginBottom: '4px', fontWeight: 700 }}>
                    {sig.headline}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    {sig.action}
                  </p>
                </div>

                <div>
                  <button 
                    className="btn-outline"
                    onClick={() => {
                      if (sig.category.includes('IRRIGATION') || sig.category.includes('SPRAY')) onNavigate('weather');
                      else if (sig.category.includes('PATHOGEN')) onNavigate('disease');
                      else if (sig.category.includes('MARKET')) onNavigate('market');
                      else onNavigate('farms');
                    }}
                  >
                    Action Plan <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Data Provenance Explanation (Module 8 Requirement) */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h4 style={{ fontSize: '0.96rem', marginBottom: '8px', color: '#163326', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <ShieldCheck size={18} color="#2d5740" /> Decision-Support System Data Provenance Architecture
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#576c60', marginBottom: '14px' }}>
          To prevent misleading certainty, Agri-Wise explicitly distinguishes between factual recorded data, live external weather sensors, and probabilistic machine learning models:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#fcfbf8', border: '1px solid rgba(27, 56, 43, 0.08)', borderRadius: '8px' }}>
            <span className="tag-provenance tag-verified">VERIFIED_FARMER_RECORDS</span>
            <p style={{ fontSize: '0.76rem', color: '#687e72', marginTop: '4px' }}>
              Ground-truth acreages, crop sowing dates, and expenditure receipts inputted directly by the farmer.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#fcfbf8', border: '1px solid rgba(27, 56, 43, 0.08)', borderRadius: '8px' }}>
            <span className="tag-provenance tag-external">EXTERNAL_API_WEATHER</span>
            <p style={{ fontSize: '0.76rem', color: '#687e72', marginTop: '4px' }}>
              Live satellite and ground station telemetry via Open-Meteo meteorological endpoints.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#fcfbf8', border: '1px solid rgba(27, 56, 43, 0.08)', borderRadius: '8px' }}>
            <span className="tag-provenance tag-ai">AI_PREDICTIONS</span>
            <p style={{ fontSize: '0.76rem', color: '#687e72', marginTop: '4px' }}>
              Agronomic suitability analysis and foliage disease diagnostics with stated confidence bounds.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#fcfbf8', border: '1px solid rgba(27, 56, 43, 0.08)', borderRadius: '8px' }}>
            <span className="tag-provenance tag-simulated">SIMULATED_MARKET_BASELINE</span>
            <p style={{ fontSize: '0.76rem', color: '#687e72', marginTop: '4px' }}>
              Historical mandi baseline data modeling price corridors and seasonal supply-demand shifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
