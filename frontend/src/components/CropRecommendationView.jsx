import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Info, RefreshCw, 
  HelpCircle, ChevronRight, BarChart2, ShieldAlert
} from 'lucide-react';
import { api } from '../api';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';

const PRESETS = [
  { label: 'Alluvial Plains (Paddy/Wheat)', n: 90, p: 45, k: 40, temp: 24, hum: 82, ph: 6.5, rain: 200 },
  { label: 'Semi-Arid Pulses (Chickpea/Lentil)', n: 35, p: 65, k: 80, temp: 19, hum: 18, ph: 7.2, rain: 75 },
  { label: 'Horticultural Orchard (Pomegranate/Grapes)', n: 25, p: 130, k: 200, temp: 22, hum: 85, ph: 6.2, rain: 70 },
  { label: 'Black Soil Cash Crop (Cotton/Maize)', n: 110, p: 50, k: 20, temp: 25, hum: 70, ph: 6.8, rain: 85 }
];

export default function CropRecommendationView() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    nitrogen: 90,
    phosphorus: 45,
    potassium: 40,
    temperature: 24.5,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 200.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getRecommendationHistory();
      setHistory(data || []);
    } catch {
      // ignore
    }
  };

  const handleApplyPreset = (p) => {
    setForm({
      nitrogen: p.n,
      phosphorus: p.p,
      potassium: p.k,
      temperature: p.temp,
      humidity: p.hum,
      ph: p.ph,
      rainfall: p.rain
    });
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.getCropRecommendation(form);
      setResult(res);
      loadHistory();
      showToast({
        title: `Optimal Crop: ${res.recommended_crop}`,
        message: `Recommendation calculated with ${Math.round(res.confidence * 100)}% confidence score.`,
        type: 'success'
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch crop recommendation');
      showToast({
        title: 'Recommendation Error',
        message: err.message || 'Could not process soil parameters.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">Crop Recommendation</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>AI-Based Crop Recommendation Engine</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
          Predicts agronomically optimal crop suitability using soil macronutrients (N, P, K), soil chemical balance (pH), and local climatic features (temperature, relative humidity, rainfall).
        </p>
      </div>

      {/* Quick Presets */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUICK PRESETS:</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleApplyPreset(p)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--forest-800)',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Input Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '18px' }}>Agricultural & Environmental Parameters</h3>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRecommend} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* N, P, K Inputs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Soil Nitrogen (N) — <span style={{ color: 'var(--emerald-400)' }}>{form.nitrogen} kg/ha</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Typical: 20 - 140</span>
              </div>
              <input 
                type="range" min="0" max="180" step="1" 
                value={form.nitrogen} 
                onChange={e => setForm({...form, nitrogen: parseFloat(e.target.value)})}
                style={{ width: '100%', accentColor: 'var(--emerald-500)' }} 
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Soil Phosphorus (P) — <span style={{ color: 'var(--emerald-400)' }}>{form.phosphorus} kg/ha</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Typical: 10 - 145</span>
              </div>
              <input 
                type="range" min="0" max="150" step="1" 
                value={form.phosphorus} 
                onChange={e => setForm({...form, phosphorus: parseFloat(e.target.value)})}
                style={{ width: '100%', accentColor: 'var(--emerald-500)' }} 
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Soil Potassium (K) — <span style={{ color: 'var(--emerald-400)' }}>{form.potassium} kg/ha</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Typical: 15 - 205</span>
              </div>
              <input 
                type="range" min="0" max="220" step="1" 
                value={form.potassium} 
                onChange={e => setForm({...form, potassium: parseFloat(e.target.value)})}
                style={{ width: '100%', accentColor: 'var(--emerald-500)' }} 
              />
            </div>

            {/* pH & Temperature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Soil pH (Acidity/Alkalinity)</label>
                <input 
                  type="number" step="0.1" min="3.5" max="9.5" 
                  className="form-input" 
                  value={form.ph} 
                  onChange={e => setForm({...form, ph: parseFloat(e.target.value)})} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ambient Temperature (°C)</label>
                <input 
                  type="number" step="0.5" min="5" max="48" 
                  className="form-input" 
                  value={form.temperature} 
                  onChange={e => setForm({...form, temperature: parseFloat(e.target.value)})} 
                />
              </div>
            </div>

            {/* Humidity & Rainfall */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Relative Humidity (%)</label>
                <input 
                  type="number" step="1" min="10" max="100" 
                  className="form-input" 
                  value={form.humidity} 
                  onChange={e => setForm({...form, humidity: parseFloat(e.target.value)})} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Rainfall (mm)</label>
                <input 
                  type="number" step="5" min="10" max="400" 
                  className="form-input" 
                  value={form.rainfall} 
                  onChange={e => setForm({...form, rainfall: parseFloat(e.target.value)})} 
                />
              </div>
            </div>

            {loading && (
              <div style={{ marginTop: '12px' }}>
                <WavyLoader label="Classifying soil nutrients across 22 crop models..." color="#163326" />
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '12px', justifyContent: 'center' }} disabled={loading}>
              <RakshakIcon size={18} color="#d8f3dc" />
              {loading ? 'Synthesizing Soil Matrix...' : 'Compute Agronomic Recommendation'}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results */}
        <div>
          {result ? (
            <div className="glass-card animate-fade-in" style={{ padding: '28px', border: '1px solid var(--emerald-500)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <RakshakBadge text="Optimal Agronomic Match" />
              </div>

              {/* Main Crop Prediction */}
              <div style={{ marginTop: '16px', textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Recommended Cultivation
                </span>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", margin: '4px 0', letterSpacing: '-0.02em' }}>
                  {result.recommended_crop}
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 14px', borderRadius: '999px', marginTop: '6px' }}>
                  <CheckCircle2 size={16} color="var(--forest-800)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-800)' }}>
                    {Math.round(result.confidence * 100)}% Confidence Suitability
                  </span>
                </div>
              </div>

              {/* Scientific Agronomic Rationale */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>Agronomic Suitability Rationale</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {result.explanation}
                </p>
              </div>

              {/* Alternative Crops */}
              {result.alternative_crops && result.alternative_crops.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                    Ranked Alternatives
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.alternative_crops.map((alt, i) => (
                      <div 
                        key={i} 
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{alt.crop}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--forest-800)', fontWeight: 600 }}>{Math.round(alt.confidence * 100)}% match</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Requirement Disclaimer (Module 3) */}
              <div style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderLeft: '4px solid var(--amber-500)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={16} color="var(--amber-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <strong>Decision-Support Notice:</strong> {result.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #163326 0%, #204b39 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 14px rgba(22, 51, 38, 0.2)'
              }}>
                <RakshakIcon size={28} color="#d8f3dc" />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>
                Awaiting Soil Parameters
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Adjust the NPK, pH, and environmental sliders on the left or select a quick preset, then click "Compute Agronomic Recommendation".
              </p>
            </div>
          )}

          {/* Past Recommendations History */}
          {history.length > 0 && (
            <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '12px' }}>Recent Recommendation History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {history.slice(0, 5).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--forest-800)' }}>{h.recommended_crop}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(h.confidence * 100)}% Conf • {h.created_at.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
