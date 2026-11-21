import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, UploadCloud, ShieldAlert, CheckCircle, AlertTriangle, 
  Leaf, RefreshCw, BookOpen, Volume2, VolumeX, Copy, Check, 
  Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { RakshakIcon, RakshakBadge } from './RakshakLogo';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';

const CROP_CATEGORIES = [
  { id: 'Tomato', name: 'Tomato (Tamatar)', icon: '🍅' },
  { id: 'Potato', name: 'Potato (Aalu)', icon: '🥔' },
  { id: 'Wheat', name: 'Wheat (Gehun)', icon: '🌾' },
  { id: 'Rice', name: 'Rice / Paddy (Dhan)', icon: '🍚' },
  { id: 'Cotton', name: 'Cotton (Kapas)', icon: '🌿' },
  { id: 'Chilli', name: 'Chilli (Mirch)', icon: '🌶️' },
  { id: 'Mustard', name: 'Mustard (Sarson)', icon: '🌼' },
  { id: 'Corn', name: 'Corn / Maize (Makka)', icon: '🌽' },
  { id: 'Apple', name: 'Apple (Seb)', icon: '🍏' }
];

export default function DiseaseScannerView() {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropHint, setCropHint] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('organic');
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data || []);
    } catch {
      // Guest users simply get empty history
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
    if (e) e.preventDefault();
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
        message: `${res.severity} severity detected with ${Math.round(res.confidence * 100)}% confidence. Remediation guidelines displayed.`,
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

  // 1-Click Interactive Sample Foliage Generator
  const handleLoadSampleLeaf = (type = 'early_blight') => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Background dark soil
    ctx.fillStyle = '#141e17';
    ctx.fillRect(0, 0, 300, 300);
    
    // Leaf base
    ctx.beginPath();
    ctx.ellipse(150, 150, 85, 130, Math.PI / 8, 0, 2 * Math.PI);
    
    if (type === 'healthy') {
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      // Green veins
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(150, 260);
      ctx.lineTo(150, 40);
      ctx.stroke();
      setCropHint('Tomato');
    } else if (type === 'wheat_rust') {
      ctx.fillStyle = '#84cc16';
      ctx.fill();
      // Yellow-orange powdery stripes
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(115 + i * 12, 60, 6, 170);
      }
      setCropHint('Wheat');
    } else if (type === 'rice_blast') {
      ctx.fillStyle = '#65a30d';
      ctx.fill();
      // Spindle shaped lesions with grey centers
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(135, 120, 18, 38, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(135, 120, 8, 20, 0, 0, 2 * Math.PI);
      ctx.fill();
      setCropHint('Rice');
    } else if (type === 'cotton_blight') {
      ctx.fillStyle = '#4ade80';
      ctx.fill();
      // Angular black water-soaked spots
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(110, 100, 24, 20);
      ctx.fillRect(145, 140, 28, 22);
      ctx.fillRect(125, 180, 20, 18);
      setCropHint('Cotton');
    } else {
      // Tomato Early Blight (Concentric rings)
      ctx.fillStyle = '#a3e635';
      ctx.fill();
      
      // Target board lesions
      const drawConcentric = (x, y, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.65, 0, 2 * Math.PI);
        ctx.fillStyle = '#451a03';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.35, 0, 2 * Math.PI);
        ctx.fillStyle = '#1c1917';
        ctx.fill();
      };
      drawConcentric(125, 110, 32);
      drawConcentric(175, 165, 24);
      setCropHint('Tomato');
    }

    canvas.toBlob(blob => {
      const file = new File([blob], `${type}_specimen.png`, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    });
  };

  const handleSpeakDiagnosis = () => {
    if (!result || !('speechSynthesis' in window)) return;
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `Diagnosis: ${result.predicted_disease} in ${result.crop_name}. Severity: ${result.severity}. Symptoms: ${result.symptoms}. Recommended chemical solution: ${result.management_guide.chemical_control.join('. ')}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyPrescription = () => {
    if (!result) return;
    const text = `--- AGRIWISE PHYTOSANITARY PRESCRIPTION ---
Crop: ${result.crop_name}
Diagnosed Condition: ${result.predicted_disease} (Severity: ${result.severity}, Match: ${Math.round(result.confidence * 100)}%)
Pathogen: ${result.management_guide.causal_pathogen}
Symptoms: ${result.symptoms}

[CHEMICAL CONTROL PROTOCOL]
${result.management_guide.chemical_control.map(c => `• ${c}`).join('\n')}

[ORGANIC & BIOCONTROL REMEDY]
${result.management_guide.organic_control.map(o => `• ${o}`).join('\n')}

[PREVENTIVE ACTIONS]
${result.management_guide.preventive_actions}

Verified standard: ${result.disclaimer}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    showToast({
      title: 'Prescription Copied',
      message: 'Complete diagnostic prescription copied to clipboard.',
      type: 'success'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0 60px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22, 51, 38, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
        border: '1.5px solid rgba(22, 51, 38, 0.15)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <RakshakIcon size={26} color="#15803d" />
            <h1 style={{ 
              fontSize: '1.65rem', 
              fontFamily: "'Fraunces', serif", 
              fontWeight: 800, 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Rakshak AI Foliar Disease Scanner
            </h1>
            <RakshakBadge text="AI Vision Active" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '720px' }}>
            Instant computer-vision pathology diagnosis for Indian crops. Identifies blights, rusts, leaf curl, and nutrient chlorosis with calibrated ICAR remediation guidelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: '#15803d',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.8s infinite' }}></span>
            Phytopathology Model Online
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Image Upload & Live Camera */}
        <div>
          <div className="glass-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '14px' }}>
              Select Specimen & Image Source
            </h3>

            {/* Crop Category Selector Pills */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                Select Crop Species:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {CROP_CATEGORIES.map(c => {
                  const isSelected = cropHint.toLowerCase() === c.id.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCropHint(c.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #163326' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(22, 51, 38, 0.08)' : 'var(--bg-secondary)',
                        color: isSelected ? '#163326' : 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{c.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropzone & Preview Box */}
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {previewUrl ? (
                <div>
                  <img 
                    src={previewUrl} 
                    alt="Leaf Specimen" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '230px', 
                      borderRadius: '12px', 
                      objectFit: 'contain', 
                      margin: '0 auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <p style={{ fontSize: '0.78rem', color: '#163326', marginTop: '10px', fontWeight: 700 }}>
                    Click to change specimen photo
                  </p>
                </div>
              ) : (
                <div style={{ padding: '12px 0' }}>
                  <UploadCloud size={46} color="var(--forest-800)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Click or Drag Leaf Photo Here
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Supports PNG, JPG, WebP from phone camera or gallery
                  </p>
                </div>
              )}
            </div>

            {/* Device Camera Shortcut Button */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={16} color="var(--forest-800)" />
                Snap with Camera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UploadCloud size={16} color="var(--forest-800)" />
                Browse Device File
              </button>
            </div>

            {/* 1-Click Interactive Reference Presets */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                1-CLICK TEST SPECIMENS (FOR INSTANT DEMO):
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'early_blight', label: '🍅 Tomato Blight', crop: 'Tomato' },
                  { id: 'wheat_rust', label: '🌾 Wheat Rust', crop: 'Wheat' },
                  { id: 'rice_blast', label: '🍚 Rice Blast', crop: 'Rice' },
                  { id: 'cotton_blight', label: '🌿 Cotton Blight', crop: 'Cotton' },
                  { id: 'healthy', label: '🍃 Healthy Leaf', crop: 'Tomato' }
                ].map((spec, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleLoadSampleLeaf(spec.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      background: 'rgba(22, 51, 38, 0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ marginBottom: '16px' }}>
                <WavyLoader label="Analyzing foliar spectra & cross-referencing ICAR pathology database..." color="#163326" />
              </div>
            )}

            <button 
              type="button"
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.94rem' }} 
              disabled={!selectedFile || loading}
              onClick={handleScan}
            >
              <Sparkles size={18} color="#d8f3dc" />
              {loading ? 'Analyzing Leaf Foliage...' : 'Execute AI Computer Vision Scan'}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic & Advisory Result */}
        <div>
          {result ? (
            <div className={`glass-card animate-fade-in ${result.severity === 'Severe' || result.severity === 'High' ? 'card-critical' : ''}`} style={{ padding: '28px' }}>
              {/* Header Badges & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RakshakBadge 
                    text={`${result.crop_name} Diagnosis`} 
                    variant={result.severity === 'Severe' || result.severity === 'High' ? 'critical' : 'default'} 
                  />
                  <span className={`badge ${result.severity === 'Severe' || result.severity === 'High' ? 'badge-critical' : result.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'}`}>
                    Severity: {result.severity}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleSpeakDiagnosis}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: speaking ? '#15803d' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.76rem',
                      fontWeight: 600
                    }}
                    title="Read diagnosis aloud"
                  >
                    {speaking ? <VolumeX size={14} color="#15803d" /> : <Volume2 size={14} />}
                    {speaking ? 'Stop' : 'Listen'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrescription}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: copied ? '#15803d' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.76rem',
                      fontWeight: 600
                    }}
                    title="Copy full clinical prescription"
                  >
                    {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Prescription'}
                  </button>
                </div>
              </div>

              {/* Diagnosis Header */}
              <div style={{ marginTop: '18px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Identified Condition
                </span>
                <h2 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginTop: '2px', marginBottom: '6px' }}>
                  {result.predicted_disease}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: '#15803d' 
                  }}>
                    <CheckCircle size={15} color="#15803d" />
                    {Math.round(result.confidence * 100)}% Diagnostic Match
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    • Pathogen: <strong style={{ color: 'var(--text-primary)' }}>{result.management_guide.causal_pathogen}</strong>
                  </span>
                </div>
              </div>

              {/* Symptoms Observed */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
                  🔍 Pathological Symptoms & Foliar Signs:
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {result.symptoms}
                </p>
              </div>

              {/* Treatment Tabs (Organic vs Chemical vs Prevention) */}
              <div style={{ marginTop: '22px' }}>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
                  <button
                    onClick={() => setActiveTab('organic')}
                    style={{
                      background: activeTab === 'organic' ? '#163326' : 'var(--bg-secondary)',
                      color: activeTab === 'organic' ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '7px 16px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
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
                      padding: '7px 16px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
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
                      padding: '7px 16px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🛡️ Cultural Prevention
                  </button>
                </div>

                {activeTab === 'organic' && (
                  <div className="animate-fade-in">
                    <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                      {result.management_guide.organic_control.map((item, idx) => (
                        <li key={idx} style={{ lineHeight: 1.5 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'chemical' && (
                  <div className="animate-fade-in">
                    <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                      {result.management_guide.chemical_control.map((item, idx) => (
                        <li key={idx} style={{ lineHeight: 1.5 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Prescription {idx + 1}:</strong> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'prevention' && (
                  <div className="animate-fade-in" style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Good Agricultural Practices (GAP):</strong> {result.management_guide.preventive_actions}
                    </p>
                  </div>
                )}
              </div>

              {/* Verified Attribution Banner */}
              <div style={{
                marginTop: '22px',
                padding: '14px',
                background: 'rgba(22, 51, 38, 0.05)',
                borderLeft: '4px solid #163326',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={16} color="#163326" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>ICAR Advisory Grounding:</strong> {result.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '42px 28px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(22, 51, 38, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Leaf size={32} color="#163326" />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", margin: '0 0 8px' }}>
                Awaiting Leaf Foliage Specimen
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                Snap a leaf photo with your mobile camera, browse an image file, or click any of the 1-click test specimens on the left to execute an AI diagnostic scan.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Supports 25+ plant diseases</span>
                <span>•</span>
                <span>Calibrated for Indian climates</span>
              </div>
            </div>
          )}

          {/* Past Disease Scans */}
          {history.length > 0 && (
            <div className="glass-card" style={{ padding: '22px', marginTop: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", margin: 0 }}>
                  Recent Diagnosis History
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{history.length} records</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {history.slice(0, 6).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#163326' }}>{h.predicted_disease}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({h.crop_name})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      {Math.round(h.confidence * 100)}% Match • {h.created_at.split('T')[0]}
                    </span>
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
