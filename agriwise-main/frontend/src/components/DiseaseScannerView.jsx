import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, UploadCloud, ShieldAlert, CheckCircle, AlertTriangle, 
  Leaf, RefreshCw, BookOpen, Clock, Eye, Sliders, ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import CustomAgriLogo from './CustomAgriLogo';
import WavyProgressLoader from './WavyProgressLoader';

export default function DiseaseScannerView() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropHint, setCropHint] = useState('Auto-Detect');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('organic');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const canvasRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  // Redraw lesion overlays whenever result or showBoundingBoxes changes
  useEffect(() => {
    if (!result || !previewUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (showBoundingBoxes && result.detected_lesions && result.detected_lesions.length > 0) {
        result.detected_lesions.forEach((lesion, idx) => {
          // Bounding Box
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = Math.max(2, Math.floor(canvas.width / 150));
          ctx.strokeRect(lesion.x, lesion.y, lesion.width, lesion.height);

          // Transparent highlight fill
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(lesion.x, lesion.y, lesion.width, lesion.height);

          // Label badge
          const labelText = `#${idx + 1} ${lesion.label} (${Math.round(lesion.confidence * 100)}%)`;
          ctx.font = `bold ${Math.max(12, Math.floor(canvas.width / 35))}px 'Plus Jakarta Sans', sans-serif`;
          const textWidth = ctx.measureText(labelText).width;
          const textHeight = Math.max(16, Math.floor(canvas.width / 30));

          ctx.fillStyle = '#dc2626';
          ctx.fillRect(lesion.x, Math.max(0, lesion.y - textHeight - 4), textWidth + 10, textHeight + 4);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, lesion.x + 5, Math.max(textHeight, lesion.y - 4));
        });
      }
    };
  }, [result, previewUrl, showBoundingBoxes]);

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

  const { showToast } = useToast();

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (cropHint && cropHint !== 'Auto-Detect') {
        formData.append('crop_name', cropHint);
      }

      const res = await api.analyzeDisease(formData);
      setResult(res);
      loadHistory();
      showToast(`Identified ${res.predicted_disease} (${(res.confidence * 100).toFixed(0)}% confidence)`, 'success');
    } catch (err) {
      showToast('Vision analysis failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Agronomic Canvas Generator: generates realistic diseased leaf scenarios for quick field testing
  const handleLoadSampleLeaf = async (sampleType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Natural soil/field background
    ctx.fillStyle = '#1e241e';
    ctx.fillRect(0, 0, 400, 400);

    if (sampleType === 'early_blight') {
      // Tomato Leaf with concentric target rings
      setCropHint('Tomato');
      ctx.beginPath();
      ctx.ellipse(200, 200, 110, 160, Math.PI / 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#558b2f';
      ctx.fill();

      // Veins
      ctx.strokeStyle = '#33691e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 360);
      ctx.lineTo(200, 40);
      ctx.stroke();

      // Concentric target rings (Alternaria)
      const lesions = [{ x: 160, y: 150, r: 35 }, { x: 240, y: 220, r: 28 }, { x: 170, y: 270, r: 22 }];
      lesions.forEach(l => {
        // Yellow chlorotic halo
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r + 12, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.65)';
        ctx.fill();

        // Dark brown rings
        for (let ring = l.r; ring > 5; ring -= 7) {
          ctx.beginPath();
          ctx.arc(l.x, l.y, ring, 0, 2 * Math.PI);
          ctx.fillStyle = ring % 14 === 0 ? '#451a03' : '#78350f';
          ctx.fill();
        }
      });
    } else if (sampleType === 'wheat_rust') {
      // Wheat blade with orange-yellow linear pustule stripes
      setCropHint('Wheat');
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(140, 30, 120, 340);

      // Linear stripe rust pustules
      ctx.fillStyle = '#ea580c';
      for (let x = 160; x <= 220; x += 22) {
        for (let y = 60; y <= 330; y += 18) {
          ctx.beginPath();
          ctx.ellipse(x, y, 5, 10, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (sampleType === 'rice_blast') {
      // Rice leaf with diamond / spindle lesions
      setCropHint('Rice');
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(150, 20, 100, 360);

      // Spindle lesions with grey centers and brown borders
      const spindles = [{ x: 200, y: 120 }, { x: 190, y: 220 }, { x: 210, y: 300 }];
      spindles.forEach(s => {
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 22, 45, Math.PI / 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#7c2d12';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 12, 28, Math.PI / 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
      });
    } else {
      // Lush Healthy Foliage
      setCropHint('Tomato');
      ctx.beginPath();
      ctx.ellipse(200, 200, 115, 170, Math.PI / 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#16a34a';
      ctx.fill();

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(200, 370);
      ctx.lineTo(200, 30);
      ctx.stroke();

      for (let i = 80; i < 330; i += 40) {
        ctx.beginPath();
        ctx.moveTo(200, i);
        ctx.lineTo(130, i - 25);
        ctx.moveTo(200, i);
        ctx.lineTo(270, i - 25);
        ctx.stroke();
      }
    }

    canvas.toBlob(blob => {
      const file = new File([blob], `${sampleType}_sample.png`, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">Vision Diagnostics Engine</span>
          <span style={{ fontSize: '0.8rem', color: '#576c60' }}>Computer Vision & ICAR Pathological Diagnostic Matrix</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', color: '#163326', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
          AI Foliar Disease & Pest Scanner
        </h2>
        <p style={{ color: '#4a5c52', fontSize: '0.9rem', maxWidth: '800px' }}>
          Upload high-resolution field photographs of leaves, stems, or crop canopies. The system segments necrotic lesions, chlorosis halos, and fungal pustules, predicting disease causality with calibrated ICAR/CIBRC organic and chemical remediation protocols.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Image Upload & Vision Canvas */}
        <div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#163326', fontFamily: "'Fraunces', serif", marginBottom: '14px' }}>
              Submit Crop Foliage Image
            </h3>

            {/* Crop selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Target Crop Category</label>
              <select className="form-select" value={cropHint} onChange={e => setCropHint(e.target.value)}>
                <option value="Auto-Detect">🔍 Auto-Detect (Any Crop / Field Plant)</option>
                <option value="Tomato">Tomato (Solanaceae)</option>
                <option value="Wheat">Wheat (Poaceae / Gramineae)</option>
                <option value="Rice">Rice / Paddy (Poaceae)</option>
                <option value="Cotton">Cotton (Malvaceae)</option>
                <option value="Potato">Potato (Solanaceae)</option>
                <option value="Chilli">Chilli / Pepper (Capsicum)</option>
                <option value="Corn">Corn / Maize (Poaceae)</option>
                <option value="Soybean">Soybean (Leguminosae)</option>
                <option value="Mustard">Mustard / Rapeseed (Brassicaceae)</option>
                <option value="Apple">Apple (Rosaceae)</option>
              </select>
            </div>

            {/* Dropzone & Interactive Canvas */}
            <div 
              style={{
                border: '2px dashed rgba(27, 56, 43, 0.2)',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                background: '#fcfbf8',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '16px',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (!previewUrl) document.getElementById('leaf-upload').click();
              }}
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
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    {result && result.detected_lesions && result.detected_lesions.length > 0 ? (
                      <canvas 
                        ref={canvasRef} 
                        style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', objectFit: 'contain' }}
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Leaf Preview" 
                        style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', objectFit: 'contain' }} 
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('leaf-upload').click();
                      }}
                    >
                      Choose Different Image
                    </button>
                    {result && result.detected_lesions && result.detected_lesions.length > 0 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.78rem', background: showBoundingBoxes ? '#eef4f0' : '#ffffff' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBoundingBoxes(!showBoundingBoxes);
                        }}
                      >
                        <Eye size={12} /> {showBoundingBoxes ? 'Hide Lesion Markers' : 'Show Lesion Markers'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={46} color="#2d6a4f" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#163326' }}>
                    Click or Drag Crop Leaf Image Here
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#687e72', marginTop: '4px' }}>
                    Capture from mobile camera or upload PNG, JPG, WebP (up to 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Instant Agricultural Field Test Samples */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CustomAgriLogo size={16} variant="icon" />
                <span style={{ fontSize: '0.78rem', color: '#163326', fontWeight: 700 }}>
                  Instant Test Leaf Samples (Real Field Scenarios):
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => handleLoadSampleLeaf('early_blight')} 
                  style={{ background: '#f4f8f5', border: '1px solid rgba(45, 106, 79, 0.25)', color: '#163326', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🍅 Tomato Early Blight
                </button>
                <button 
                  type="button"
                  onClick={() => handleLoadSampleLeaf('wheat_rust')} 
                  style={{ background: '#f4f8f5', border: '1px solid rgba(45, 106, 79, 0.25)', color: '#163326', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🌾 Wheat Stripe Rust
                </button>
                <button 
                  type="button"
                  onClick={() => handleLoadSampleLeaf('rice_blast')} 
                  style={{ background: '#f4f8f5', border: '1px solid rgba(45, 106, 79, 0.25)', color: '#163326', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🌱 Rice Blast Lesion
                </button>
                <button 
                  type="button"
                  onClick={() => handleLoadSampleLeaf('healthy')} 
                  style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🌿 Healthy Green Leaf
                </button>
              </div>
            </div>

            <button 
              type="button"
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }} 
              disabled={!selectedFile || loading}
              onClick={handleScan}
            >
              <CustomAgriLogo size={20} variant="icon" />
              {loading ? 'Analyzing Cellular & Foliar Pathology...' : 'Identify Crop Disease via Vision AI'}
            </button>
            {loading && (
              <div style={{ marginTop: '14px' }}>
                <WavyProgressLoader compact={true} text="Evaluating spectral pigmentation & lesion contours..." />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic & Remediation Result */}
        <div>
          {result ? (
            <div className="glass-card animate-fade-in" style={{ padding: '28px', border: '1px solid rgba(27, 56, 43, 0.12)' }}>
              {/* Header Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.82rem' }}>
                  Crop: {result.crop_name}
                </span>
                <span className={`badge ${
                  result.severity.includes('Severe') || result.severity.includes('High') 
                    ? 'badge-rose' 
                    : result.severity.includes('Moderate') 
                    ? 'badge-amber' 
                    : 'badge-emerald'
                }`}>
                  {result.severity}
                </span>
              </div>

              {/* Diagnosis Header */}
              <div style={{ marginTop: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(27, 56, 43, 0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: '#687e72', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
                  Identified Condition
                </span>
                <h2 style={{ fontSize: '1.75rem', color: '#163326', fontFamily: "'Fraunces', serif", marginTop: '2px' }}>
                  {result.predicted_disease}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                    <CheckCircle size={16} />
                    {Math.round(result.confidence * 100)}% Model Confidence
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#4a5c52' }}>
                    • Pathogen: <strong>{result.management_guide?.causal_pathogen || 'N/A'}</strong>
                  </span>
                </div>
              </div>

              {/* Leaf Infection & Tissue Health Meter */}
              <div style={{
                background: '#f4f8f5',
                border: '1px solid rgba(45, 106, 79, 0.15)',
                borderRadius: '14px',
                padding: '14px 18px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#163326' }}>
                    Foliar Infection Coverage:
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: result.infection_coverage_pct > 20 ? '#dc2626' : '#2d6a4f' }}>
                    {result.infection_coverage_pct}% Leaf Area Affected
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(5, result.infection_coverage_pct))}%`,
                    height: '100%',
                    background: result.infection_coverage_pct > 25 ? '#dc2626' : result.infection_coverage_pct > 10 ? '#f59e0b' : '#10b981',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#687e72', marginTop: '4px' }}>
                  <span>0% (Clean Canopy)</span>
                  <span>15% (Threshold Intervention)</span>
                  <span>40%+ (Critical Canopy Loss)</span>
                </div>
              </div>

              {/* Symptoms */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#163326', fontWeight: 700, marginBottom: '4px' }}>
                  Visible Clinical Symptoms
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                  {result.symptoms}
                </p>
              </div>

              {/* Remediation Tabs (Organic vs Chemical vs Prevention) */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(27, 56, 43, 0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setActiveTab('organic')}
                    style={{
                      background: activeTab === 'organic' ? '#163326' : '#f4f8f5',
                      color: activeTab === 'organic' ? '#ffffff' : '#2d6a4f',
                      border: '1px solid rgba(27, 56, 43, 0.15)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🌿 Organic & Bio-Control
                  </button>
                  <button
                    onClick={() => setActiveTab('chemical')}
                    style={{
                      background: activeTab === 'chemical' ? '#163326' : '#f4f8f5',
                      color: activeTab === 'chemical' ? '#ffffff' : '#2d6a4f',
                      border: '1px solid rgba(27, 56, 43, 0.15)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🧪 CIBRC Chemical Control
                  </button>
                  <button
                    onClick={() => setActiveTab('prevention')}
                    style={{
                      background: activeTab === 'prevention' ? '#163326' : '#f4f8f5',
                      color: activeTab === 'prevention' ? '#ffffff' : '#2d6a4f',
                      border: '1px solid rgba(27, 56, 43, 0.15)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ Cultural Prevention
                  </button>
                </div>

                <div style={{ background: '#faf9f5', border: '1px solid rgba(27, 56, 43, 0.08)', borderRadius: '12px', padding: '16px' }}>
                  {activeTab === 'organic' && (
                    <div>
                      <h5 style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, marginBottom: '8px' }}>
                        Bio-Fungicide & Natural Formulation Protocols:
                      </h5>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                        {result.management_guide?.organic_control?.map((rec, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'chemical' && (
                    <div>
                      <h5 style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 700, marginBottom: '8px' }}>
                        Recommended Fungicides / Bactericides (ICAR Standard):
                      </h5>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                        {result.management_guide?.chemical_control?.map((rec, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{rec}</li>
                        ))}
                      </ul>
                      <p style={{ fontSize: '0.72rem', color: '#687e72', marginTop: '8px' }}>
                        * Adhere to strict Pre-Harvest Intervals (PHI) and wear protective mask during application.
                      </p>
                    </div>
                  )}

                  {activeTab === 'prevention' && (
                    <div>
                      <h5 style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, marginBottom: '8px' }}>
                        Long-Term Agronomic Prevention & Field Hygiene:
                      </h5>
                      <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                        {result.management_guide?.preventive_actions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <p style={{ fontSize: '0.72rem', color: '#788c80', marginTop: '16px', lineHeight: 1.4 }}>
                ℹ️ {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <ShieldAlert size={44} color="#2d6a4f" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#163326', fontFamily: "'Fraunces', serif" }}>
                Awaiting Crop Foliage Image
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#576c60', marginTop: '6px', maxWidth: '380px', margin: '6px auto 0' }}>
                Select an image of infected foliage or click one of the instant field test samples to trigger real-time pathogen identification.
              </p>
            </div>
          )}

          {/* Past Disease Scans */}
          {history.length > 0 && (
            <div className="glass-card" style={{ marginTop: '24px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color="#163326" />
                <h4 style={{ fontSize: '0.92rem', color: '#163326', fontWeight: 700 }}>Recent Diagnostic History</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(0, 4).map((h, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fcfbf8', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#163326' }}>{h.predicted_disease}</span>
                      <span style={{ color: '#687e72', marginLeft: '6px' }}>({h.crop_name})</span>
                    </div>
                    <span className="badge badge-emerald">{Math.round(h.confidence * 100)}% Match</span>
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
