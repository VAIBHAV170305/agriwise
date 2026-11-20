import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, User, Send, BookOpen, ShieldCheck, Sparkles, 
  HelpCircle, RefreshCw, MessageSquare, Languages, MapPin,
  Layers, Sprout, CheckCircle2, UserCheck, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function AgronomyAssistantView() {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Multilingual Voice Recognition & Audio Playback
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const recognitionRef = useRef(null);

  const SPEECH_LANG_MAP = {
    hi: 'hi-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    mr: 'mr-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    bn: 'bn-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    or: 'or-IN',
    en: 'en-IN'
  };

  const currentSpeechLang = SPEECH_LANG_MAP[currentLanguageObj?.code] || 'hi-IN';

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentSpeechLang;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSpeakMessage = (text, idx) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentSpeechLang;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Farmer & Farm Details
  const [farmerUser, setFarmerUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [farmerFarms, setFarmerFarms] = useState([]);
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  // Load all user details, farms, and crops
  useEffect(() => {
    loadFarmerFullDetails();
  }, []);

  const loadFarmerFullDetails = async () => {
    setDetailsLoading(true);
    try {
      const u = api.getUser();
      setFarmerUser(u);

      const [prof, farms] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getFarms().catch(() => [])
      ]);

      setFarmerProfile(prof);
      setFarmerFarms(farms || []);

      let allCrops = [];
      if (farms && farms.length > 0) {
        const cropsList = await api.getCrops(farms[0].id).catch(() => []);
        allCrops = cropsList || [];
      }
      setFarmerCrops(allCrops);

      initializePersonalizedGreeting(u, prof, farms, allCrops);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Build Personalized Welcome Message containing the farmer's name, registered farm, soil, and active crops
  const initializePersonalizedGreeting = (user, profile, farms, crops) => {
    const rawName = user?.name || profile?.name || 'Farmer';
    // Clean name: e.g. "Ramesh Patel (Farmer)" -> "Ramesh Patel"
    const cleanName = rawName.replace(/\(.*?\)/g, '').trim();

    const greetWord = greeting || 'Namaste';
    const primaryFarm = farms && farms.length > 0 ? farms[0] : null;
    const farmName = primaryFarm?.farm_name || 'Green Meadows Farm';
    const farmArea = primaryFarm ? `${primaryFarm.area} ${primaryFarm.area_unit}` : '12.5 Acres';
    const farmLocation = primaryFarm?.location || profile?.district ? `${profile.district}, ${profile.state}` : 'Anand, Gujarat';
    const soilType = primaryFarm?.soil_type || 'Loamy Alluvial';
    const irrigation = primaryFarm?.irrigation_type || 'Drip & Tube-well';

    let cropSummaryText = 'No active crops registered yet.';
    if (crops && crops.length > 0) {
      cropSummaryText = crops.map(c => 
        `• ${c.crop_name} (${c.crop_variety || 'Standard Cultivar'} — ${c.growth_stage} Stage, Season: ${c.season})`
      ).join('\n');
    } else {
      cropSummaryText = '• Sharbati Wheat (HD-3226, Vegetative Stage)\n• Hybrid Tomato (Fruiting Stage)';
    }

    const greetingText = (
      `${greetWord} ${cleanName} ji! 🙏\n\n` +
      `I am Rakshak AI, your dedicated agronomy intelligence advisor. I have synchronized all your registered farm and cultivation details:\n\n` +
      `👤 Farmer Account: ${cleanName} ${profile?.farmer_id ? `(ID: ${profile.farmer_id})` : ''}\n` +
      `🏡 Registered Farm: ${farmName} (${farmArea})\n` +
      `📍 Location & Agro-Zone: ${farmLocation} ${profile?.agro_zone ? `• ${profile.agro_zone}` : ''}\n` +
      `🧪 Soil & Water: ${soilType} with ${irrigation}\n` +
      `🌾 Active Standing Crops:\n${cropSummaryText}\n\n` +
      `I am calibrated to provide tailored guidance for your specific crops and soil conditions. ` +
      `What would you like assistance with today? You can ask about fertilizer split schedules, pest/disease prevention, irrigation timings, or mandi demand trends.`
    );

    setMessages([
      {
        sender_role: 'assistant',
        content: greetingText,
        sources: []
      }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender_role: 'user', content: query, sources: [] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(query, activeConversationId);
      if (res.conversation_id) {
        setActiveConversationId(res.conversation_id);
      }
      const assistantMsg = {
        sender_role: 'assistant',
        content: res.response,
        sources: res.sources || []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender_role: 'assistant',
        content: `Error communicating with knowledge engine: ${err.message}`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Farmer's display name
  const displayName = (farmerUser?.name || 'Ramesh Patel').replace(/\(.*?\)/g, '').trim();
  const primaryFarm = farmerFarms && farmerFarms.length > 0 ? farmerFarms[0] : null;

  // Tailored Quick Prompts based on farmer's registered crops
  const dynamicPrompts = farmerCrops && farmerCrops.length > 0
    ? [
        `Optimal fertilizer N-P-K schedule for my ${farmerCrops[0]?.crop_name}?`,
        `When should I irrigate my ${farmerCrops[0]?.crop_name} in ${primaryFarm?.soil_type || 'alluvial'} soil?`,
        `How to protect ${farmerCrops[1]?.crop_name || 'Tomato'} from foliar blight?`,
        `Current mandi market demand and MSP rate for ${farmerCrops[0]?.crop_name}?`
      ]
    : [
        "What are the critical irrigation stages for Wheat?",
        "Optimal N-P-K fertilizer split application for Tomato?",
        "How to manage foliar blight with organic bio-fungicides?",
        "Recommended vermicompost dosage and Jeevamrutha preparation?"
      ];

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title & Language Preference Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Rakshak AI — Agronomy Intelligence</span>
            <span style={{
              background: '#edf5f0',
              color: '#2d6a4f',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {currentLanguageObj?.nativeName || 'Regional'} Mode Active
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#163326', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            Personalized Agronomic Advisor
          </h2>
          <p style={{ color: '#4a5c52', fontSize: '0.9rem' }}>
            Synchronized with your registered landholding, soil telemetry, and active cultivation records. Powered by ICAR, PAU, and TNAU agronomy knowledge bases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#687e71', fontWeight: 600 }}>Language:</span>
          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* Active Farmer & Crop Intelligence Dossier Card */}
      <div className="glass-card" style={{
        padding: '18px 24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%)',
        border: '1px solid rgba(45, 106, 79, 0.2)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#163326',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              <UserCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#163326' }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  {farmerProfile?.farmer_id || 'KID-2026-GJ-0002'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#576c60', margin: 0, marginTop: '2px' }}>
                📍 {primaryFarm?.location || 'Anand, Gujarat'} • {farmerProfile?.agro_zone || 'Western Plain Zone (Zone XIII)'}
              </p>
            </div>
          </div>

          {/* Farm & Crops Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.78rem', color: '#4a5c52' }}>
              <span style={{ color: '#788c80', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>FARM & SOIL:</span>
              <strong style={{ color: '#163326' }}>{primaryFarm?.farm_name || 'Green Meadows Farm'} ({primaryFarm?.area || '12.5'} {primaryFarm?.area_unit || 'Acres'})</strong> • {primaryFarm?.soil_type || 'Loamy Alluvial'}
            </div>

            <div style={{ borderLeft: '1px solid rgba(27, 56, 43, 0.15)', paddingLeft: '16px', fontSize: '0.78rem', color: '#4a5c52' }}>
              <span style={{ color: '#788c80', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>STANDING CROPS:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                {farmerCrops && farmerCrops.length > 0 ? (
                  farmerCrops.map((c, i) => (
                    <span key={i} style={{ fontSize: '0.74rem', background: '#eef4f0', color: '#163326', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🌾 {c.crop_name} ({c.growth_stage})
                    </span>
                  ))
                ) : (
                  <>
                    <span style={{ fontSize: '0.74rem', background: '#eef4f0', color: '#163326', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🌾 Wheat (Vegetative)
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#eef4f0', color: '#163326', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🍅 Tomato (Fruiting)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Topic Buttons Tailored to Farmer's Crops */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{ fontSize: '0.78rem', color: '#687e72', alignSelf: 'center', fontWeight: 700 }}>
          SUGGESTED FOR YOUR CROPS:
        </span>
        {dynamicPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 56, 43, 0.15)',
              color: '#163326',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden' }}>
        {/* Messages Container */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, idx) => {
            const isUser = m.sender_role === 'user';
            return (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: isUser ? '80%' : '90%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isUser ? '#16a34a' : '#163326',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isUser ? <User size={18} color="#fff" /> : <Bot size={18} color="#fff" />}
                </div>

                <div style={{
                  background: isUser ? '#163326' : '#ffffff',
                  border: isUser ? 'none' : '1px solid rgba(27, 56, 43, 0.12)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: isUser ? '#ffffff' : '#163326',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>

                  {/* Multilingual Audio TTS Playback */}
                  {!isUser && (
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(m.content, idx)}
                        style={{
                          background: speakingIdx === idx ? '#fef3c7' : '#f0f5f2',
                          border: speakingIdx === idx ? '1px solid #f59e0b' : '1px solid rgba(18, 53, 36, 0.12)',
                          borderRadius: '999px',
                          padding: '3px 10px',
                          fontSize: '0.74rem',
                          color: speakingIdx === idx ? '#b45309' : '#123524',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        {speakingIdx === idx ? <VolumeX size={13} color="#b45309" /> : <Volume2 size={13} color="#10b981" />}
                        <span>{speakingIdx === idx ? 'Stop Audio' : 'Listen / आवाज़ में सुनें'}</span>
                      </button>
                    </div>
                  )}

                  {/* Sources / Citations Box */}
                  {m.sources && m.sources.length > 0 && (
                    <div style={{
                      marginTop: '14px',
                      paddingTop: '12px',
                      borderTop: isUser ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(27, 56, 43, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <BookOpen size={14} color={isUser ? '#d2e5d8' : '#2d6a4f'} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isUser ? '#d2e5d8' : '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Verified Scientific Agronomy Sources Cited ({m.sources.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.sources.map((src, sIdx) => (
                          <div 
                            key={sIdx}
                            style={{
                              padding: '8px 12px',
                              background: isUser ? 'rgba(255, 255, 255, 0.08)' : '#fcfbf8',
                              borderRadius: '8px',
                              border: isUser ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(27, 56, 43, 0.08)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isUser ? '#ffffff' : '#163326' }}>{src.title}</span>
                              <span style={{ fontSize: '0.7rem', color: isUser ? 'rgba(255,255,255,0.7)' : '#687e72' }}>{src.category} • Match: {Math.round(src.relevance_score * 100)}%</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: isUser ? 'rgba(255,255,255,0.85)' : '#4a5c52', marginTop: '2px' }}>
                              "{src.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: '#163326',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{ background: '#ffffff', border: '1px solid rgba(27, 56, 43, 0.12)', borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw className="animate-spin" size={16} color="#2d6a4f" />
                <span style={{ fontSize: '0.82rem', color: '#4a5c52' }}>Synthesizing personalized advice for {displayName}'s crops...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div style={{
            background: 'linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%)',
            padding: '8px 24px',
            borderTop: '1px solid #fca5a5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#991b1b',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'inline-block',
                animation: 'pulse 1s infinite'
              }} />
              <span>{t('nav.listening', 'Listening in')} {currentLanguageObj?.nativeName || 'Hindi'} — {t('nav.speakInHindi', 'Speak your query naturally...')}</span>
            </div>
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#b91c1c',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.78rem'
              }}
            >
              Done / बंद करें
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '16px 24px', background: '#fcfbf8', borderTop: '1px solid rgba(27, 56, 43, 0.1)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            {/* Multilingual Voice Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop listening" : `Speak in ${currentLanguageObj?.nativeName || 'Hindi'} (बोलकर पूछें)`}
              style={{
                background: isListening ? '#fee2e2' : '#edf5f0',
                border: isListening ? '1.5px solid #ef4444' : '1px solid rgba(27, 56, 43, 0.15)',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                color: isListening ? '#dc2626' : '#123524',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {isListening ? (
                <MicOff size={18} color="#dc2626" />
              ) : (
                <Mic size={18} color="#10b981" />
              )}
              <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                {isListening ? 'Stop' : 'Voice (बोलें)'}
              </span>
            </button>

            <input 
              className="form-input" 
              placeholder={isListening ? `${t('nav.listening', 'Listening... Please speak now in')} ${currentLanguageObj?.nativeName}` : `${t('nav.voicePlaceholder', `Ask Rakshak in ${currentLanguageObj?.nativeName || 'Hindi'} or tap mic to speak...`)}`}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                border: isListening ? '1.5px solid #ef4444' : undefined,
                background: isListening ? '#fffdfd' : undefined
              }}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              <Send size={16} /> Send
            </button>
          </form>
          <p style={{ fontSize: '0.72rem', color: '#788c80', marginTop: '6px', textAlign: 'center' }}>
            Safeguard: Rakshak personalizes recommendations to your registered soil and crops while citing verified ICAR scientific agronomy research.
          </p>
        </div>
      </div>
    </div>
  );
}
