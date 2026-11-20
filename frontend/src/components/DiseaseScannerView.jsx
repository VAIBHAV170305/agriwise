import React, { useState, useEffect } from 'react';
import { 
  Camera, UploadCloud, ShieldAlert, CheckCircle, AlertTriangle, 
  Leaf, RefreshCw, BookOpen, Clock
} from 'lucide-react';
import { api } from '../api';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';

export default function DiseaseScannerView() {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropHint, setCropHint] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('organic');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data || []);
    } catch {
      // ignore
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (cropHint) formData.append('crop_name', cropHint);

      const res = await api.analyzeDisease(formData);
      setResult(res);
      loadHistory();
      const isSevere = res.severity === 'Severe' || res.severity === 'High';
      showToast({
        title: `Diagnosis: ${res.predicted_disease}`,
        message: `${res.severity} severity detected with ${Math.round(res.confidence * 100)}% model confidence. Remediation guidelines displayed.`,
        type: isSevere ? 'critical' : 'success'
      });
    } catch (err) {
      showToast({
        title: 'Diagnostic Scan Failed',
        message: err.message || 'Error executing AI vision model.',
        type: 'critical'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample leaf image loader for instant testing without needing an external leaf photo
  const handleLoadSampleLeaf = async (type = 'early_blight') => {
    // Generate a colorful leaf canvas blob
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1c2820';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw leaf shape
    ctx.beginPath();
    ctx.ellipse(128, 128, 70, 110, Math.PI / 6, 0, 2 * Math.PI);
    ctx.fillStyle = type === 'healthy' ? '#22c55e' : '#84cc16';
    ctx.fill();

    // If diseased, draw brown target spot lesions
    if (type !== 'healthy') {
      ctx.beginPath();
      ctx.arc(110, 100, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#78350f';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(150, 145, 18, 0, 2 * Math.PI);
      ctx.fillStyle = '#92400e';
      ctx.fill();
    }

    canvas.toBlob(blob => {
      const file = new File([blob], `${type}_leaf_sample.png`, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0 60px' }}>
      {/* Work In Progress (WIP) / Coming Soon Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1.5px solid #f59e0b',
        borderRadius: '16px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.12)'
      }}>
        <div style={{
          background: '#d97706',
          color: '#ffffff',
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Clock size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#b45309',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Work in Progress (WIP) • Coming Soon
            </span>
            <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 700 }}>
              ICAR Deep-Learning Calibration in Progress
            </span>
          </div>
          <h3 style={{ fontSize: '1.12rem', color: '#78350f', fontWeight: 800, margin: '2px 0 6px', fontFamily: "'Fraunces', serif" }}>
            Tau AI Leaf Disease Scanner Under Development
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#92400e', lineHeight: 1.5, margin: 0 }}>
            Tau, our computer-vision leaf pathology model is currently undergoing deep-learning training and clinical field trials across 38+ regional crops with the Indian Council of Agricultural Research (ICAR) & State Agricultural Universities. Real-time live camera diagnosis will be unlocked in the upcoming release. You can test the diagnostic treatment simulator below.
          </p>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-amber">WIP Preview Simulator</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>Crop Disease Identification & Management Advisory</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
          Test leaf specimen diagnostics for pathogen classification, severity grading, organic biocontrol remedies, and chemical spray guidelines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Image Upload & Preview */}
        <div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '14px' }}>Submit Crop Foliage Image</h3>

            {/* Crop selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Crop Category</label>
              <select className="form-select" value={cropHint} onChange={e => setCropHint(e.target.value)}>
                <option value="Tomato">Tomato (Solanaceae)</option>
                <option value="Potato">Potato (Solanaceae)</option>
                <option value="Wheat">Wheat (Poaceae)</option>
                <option value="Rice">Rice / Paddy (Poaceae)</option>
                <option value="Corn">Corn / Maize (Poaceae)</option>
                <option value="Apple">Apple (Rosaceae)</option>
              </select>
            </div>

            {/* Dropzone */}
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
              onClick={() => document.getElementById('leaf-upload').click()}
            >
              <input 
                id="leaf-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />

              {previewUrl ? (
                <div>
                  <img 
                    src={previewUrl} 
                    alt="Leaf Preview" 
                    style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '12px', objectFit: 'contain', margin: '0 auto' }} 
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--forest-800)', marginTop: '10px', fontWeight: 600 }}>
                    Click to choose a different image
                  </p>
                </div>
              ) : (
                <div>
                  <UploadCloud size={44} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click or Drag Leaf Image Here</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Instant Demo Leaf Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Reference Leaf Specimens (Preview):</span>
              <button 
                type="button"
                onClick={() => handleLoadSampleLeaf('early_blight')} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Sample Blighted Leaf
              </button>
              <button 
                type="button"
                onClick={() => handleLoadSampleLeaf('healthy')} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Sample Healthy Leaf
              </button>
            </div>

            {loading && (
              <div style={{ marginBottom: '14px' }}>
                <WavyLoader label="Analyzing foliar textures & cross-referencing ICAR pathology database..." color="#163326" />
              </div>
            )}

            <button 
              type="button"
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }} 
              disabled={!selectedFile || loading}
              onClick={handleScan}
            >
              <RakshakIcon size={18} color="#d8f3dc" />
              {loading ? 'Processing Leaf Pathology...' : 'Execute AI Computer Vision Scan'}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic & Advisory Result */}
        <div>
          {result ? (
            <div className={`glass-card animate-fade-in ${result.severity === 'Severe' || result.severity === 'High' ? 'card-critical' : ''}`} style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <RakshakBadge text={`${result.crop_name} Diagnostic`} variant={result.severity === 'Severe' || result.severity === 'High' ? 'critical' : 'default'} />
                <span className={`badge ${result.severity === 'Severe' || result.severity === 'High' ? 'badge-critical' : result.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'}`}>
                  Severity: {result.severity}
                </span>
              </div>

              {/* Diagnosis Header */}
              <div style={{ marginTop: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Detected Condition</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginTop: '2px' }}>
                  {result.predicted_disease}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <CheckCircle size={15} color="var(--forest-800)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-800)' }}>
                    {Math.round(result.confidence * 100)}% Model Confidence
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {result.management_guide.causal_pathogen}</span>
                </div>
              </div>

              {/* Symptoms */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '4px' }}>Pathological Symptoms</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {result.symptoms}
                </p>
              </div>

              {/* Treatment Tabs (Organic vs Chemical) */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setActiveTab('organic')}
                    style={{
                      background: activeTab === 'organic' ? '#163326' : 'var(--bg-secondary)',
                      color: activeTab === 'organic' ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🌿 Organic Biocontrol
                  </button>
                  <button
                    onClick={() => setActiveTab('chemical')}
                    style={{
                      background: activeTab === 'chemical' ? '#163326' : 'var(--bg-secondary)',
                      color: activeTab === 'chemical' ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Chemical Protocol
                  </button>
                  <button
                    onClick={() => setActiveTab('prevention')}
                    style={{
                      background: activeTab === 'prevention' ? '#163326' : 'var(--bg-secondary)',
                      color: activeTab === 'prevention' ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ Cultural Prevention
                  </button>
                </div>

                {activeTab === 'organic' && (
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.management_guide.organic_control.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {activeTab === 'chemical' && (
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.management_guide.chemical_control.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {activeTab === 'prevention' && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {result.management_guide.preventive_actions}
                  </p>
                )}
              </div>

              {/* Professional Disclaimer */}
              <div style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderLeft: '4px solid var(--rose-500)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={16} color="var(--rose-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <strong>Advisory Disclaimer:</strong> {result.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
              <Leaf size={36} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Awaiting Leaf Foliage Upload</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Select a crop image from your computer or choose one of the instant sample tests, then click "Execute AI Computer Vision Scan".
              </p>
            </div>
          )}

          {/* Past Disease Scans */}
          {history.length > 0 && (
            <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '12px' }}>Past Pathological Scans</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {history.slice(0, 5).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--forest-800)' }}>{h.predicted_disease}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({h.crop_name})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(h.confidence * 100)}% • {h.created_at.split('T')[0]}</span>
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
