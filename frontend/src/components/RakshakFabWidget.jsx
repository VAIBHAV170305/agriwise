import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Minimize2, Maximize2, Send, Bot, User, 
  RefreshCw, Layers, ShieldCheck, ChevronDown, 
  MapPin, AlertCircle, Leaf, MessageSquare, Mic, MicOff, Volume2, VolumeX,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import RakshakLogo, { RakshakIcon, RakshakBadge } from './RakshakLogo';
import WhatsAppLoader from './WhatsAppLoader';

export default function RakshakFabWidget({ onNavigateFull }) {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [farmerData, setFarmerData] = useState({ name: 'Farmer Member', farm: null, crops: [] });
  const messagesEndRef = useRef(null);

  // Multilingual Speech Recognition & Synthesis
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast({
        title: 'Speech Not Supported',
        message: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
        type: 'critical'
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentSpeechLang;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
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

  // Load farmer dossier once on mount to personalize greeting
  useEffect(() => {
    loadDossier();
  }, []);

  const loadDossier = async () => {
    try {
      const u = api.getUser();
      const [prof, farms] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getFarms().catch(() => [])
      ]);

      let allCrops = [];
      if (farms && farms.length > 0) {
        allCrops = await api.getCrops(farms[0].id).catch(() => []);
      }

      const rawName = u?.name || prof?.name || 'Farmer Member';
      const cleanName = rawName.replace(/\(.*?\)/g, '').trim();
      const farmObj = farms && farms.length > 0 ? farms[0] : null;

      setFarmerData({
        name: cleanName,
        farm: farmObj,
        crops: allCrops,
        profile: prof
      });

      // Construct Initial Dossier Welcome
      const greetWord = greeting || 'Namaste';
      const farmName = farmObj?.farm_name || 'Agri Farm';
      const location = farmObj?.location || (prof ? `${prof.district}, ${prof.state}` : 'Field Plots');

      let cropSummary = 'Wheat & Tomato';
      if (allCrops && allCrops.length > 0) {
        cropSummary = allCrops.map(c => `${c.crop_name} (${c.stage})`).slice(0, 2).join(', ');
      }

      setMessages([
        {
          sender_role: 'assistant',
          content: `${greetWord} ${cleanName}! I am Rakshak AI, your dedicated agronomy & crop protection copilot. Synced with your active plots (${cropSummary}) in ${location}. Ask me anytime about pest prevention, fertilizer schedules, weather impact, or mandi prices.`,
          sources: ['ICAR / CIBRC Agronomy Database']
        }
      ]);
    } catch {
      setMessages([
        {
          sender_role: 'assistant',
          content: `${greeting || 'Namaste'}! I am Rakshak AI, your dedicated agronomy copilot. How can I assist your farm today?`,
          sources: []
        }
      ]);
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

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

  const QUICK_PROMPTS = [
    "Check pest & disease risk for Wheat",
    "How to manage Tomato Fruit Borer with organic IPM?",
    "Optimal N-P-K split fertilizer dosage",
    "Current Mandi MSP rates & price forecast"
  ];

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000 }}>
      {/* Floating Action Button (when widget is closed) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Open Rakshak AI Copilot"
          style={{
            background: 'linear-gradient(135deg, #163326 0%, #1e4a36 100%)',
            border: '1.5px solid rgba(82, 183, 136, 0.4)',
            borderRadius: '50px',
            padding: '10px 18px 10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(22, 51, 38, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(22, 51, 38, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(22, 51, 38, 0.35)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#24523d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(82, 183, 136, 0.5)'
            }}>
              <RakshakIcon size={20} />
            </div>
            {/* Pulsing Emerald Dot */}
            <span 
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '10px',
                height: '10px',
                background: '#52b788',
                borderRadius: '50%',
                border: '2px solid #163326',
                boxShadow: '0 0 8px #52b788'
              }} 
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontSize: '0.88rem', 
              fontWeight: 800, 
              color: '#ffffff',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Rakshak AI
              <span style={{
                background: '#52b788',
                color: '#163326',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Copilot
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#b6d7c5', fontWeight: 500 }}>
              {farmerData.name ? `${farmerData.name}'s Advisor` : 'Agronomic Assistant'}
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div 
          style={{
            width: isMinimized ? '320px' : '420px',
            maxWidth: 'calc(100vw - 36px)',
            height: isMinimized ? '58px' : '620px',
            maxHeight: 'calc(100vh - 80px)',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.15)',
            boxShadow: '0 24px 60px rgba(11, 28, 20, 0.28), 0 4px 16px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #163326 0%, #1e4a36 100%)',
            padding: '12px 16px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RakshakIcon size={24} />
              <div>
                <div style={{ 
                  fontSize: '0.92rem', 
                  fontWeight: 800, 
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Rakshak AI
                  <span style={{ 
                    fontSize: '0.62rem', 
                    background: 'rgba(82, 183, 136, 0.25)', 
                    color: '#d5e6db', 
                    border: '1px solid rgba(82, 183, 136, 0.4)',
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    fontWeight: 700 
                  }}>
                    ONLINE
                  </span>
                </div>
                {!isMinimized && (
                  <div style={{ fontSize: '0.68rem', color: '#b6d7c5' }}>
                    Synced: {farmerData.name}
                  </div>
                )}
              </div>
            </div>

            {/* Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Navigate to full page assistant if available */}
              {onNavigateFull && !isMinimized && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateFull('assistant');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px'
                  }}
                  title="Open full page view"
                >
                  <ExternalLink size={14} />
                </button>
              )}

              {/* Minimize / Expand */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
                title="Close Widget"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Section (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Context Strip */}
              <div style={{
                background: '#f4f8f5',
                padding: '6px 14px',
                borderBottom: '1px solid rgba(22, 51, 38, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#2d6a4f',
                fontWeight: 600
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="#2d6a4f" />
                  ICAR / CIBRC Agronomy Core
                </span>
                <span style={{ color: '#688273' }}>
                  🇮🇳 {currentLanguageObj?.name || 'English'}
                </span>
              </div>

              {/* Messages Area */}
              <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#fcfdfc'
              }}>
                {messages.map((m, idx) => {
                  const isUser = m.sender_role === 'user';
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '92%',
                        alignSelf: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isUser ? '#163326' : '#ffffff',
                        color: isUser ? '#ffffff' : '#163326',
                        border: isUser ? 'none' : '1px solid rgba(22, 51, 38, 0.1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                        position: 'relative'
                      }}>
                        {m.content}

                        {/* Read Aloud Text-to-Speech Button for Assistant Responses */}
                        {!isUser && (
                          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleSpeakMessage(m.content, idx)}
                              title="Listen to advice (बोलकर सुनें)"
                              style={{
                                background: speakingIdx === idx ? '#fee2e2' : '#f0f5f2',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                color: speakingIdx === idx ? '#dc2626' : '#2d6a4f',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {speakingIdx === idx ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              <span>{speakingIdx === idx ? 'Stop' : 'Listen'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sources pill */}
                      {!isUser && m.sources && m.sources.length > 0 && (
                        <div style={{
                          marginTop: '4px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px'
                        }}>
                          {m.sources.map((src, sIdx) => (
                            <span 
                              key={sIdx}
                              style={{
                                fontSize: '0.65rem',
                                color: '#587965',
                                background: '#edf5f0',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                              }}
                            >
                              ✓ {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 2px',
                    background: '#ffffff',
                    border: '1px solid rgba(22, 51, 38, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    alignSelf: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}>
                    <WhatsAppLoader size="small" />
                    <span style={{ fontSize: '0.78rem', color: '#688273', fontWeight: 600 }}>
                      Consulting agronomy models...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div style={{
                padding: '8px 12px',
                background: '#f8faf8',
                borderTop: '1px solid rgba(22, 51, 38, 0.06)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}>
                {QUICK_PROMPTS.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(22, 51, 38, 0.14)',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#2d6a4f',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#edf5f0';
                      e.currentTarget.style.borderColor = '#2d6a4f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(22, 51, 38, 0.14)';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Listening Banner */}
              {isListening && (
                <div style={{
                  background: '#fee2e2',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #ef4444'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '0.74rem', fontWeight: 700 }}>
                    <span className="pulse-critical" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                    Listening in {currentLanguageObj?.name} (बोलें)...
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
                      fontSize: '0.72rem'
                    }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                style={{
                  padding: '10px 14px',
                  background: '#ffffff',
                  borderTop: '1px solid rgba(22, 51, 38, 0.08)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                {/* Multilingual Voice Microphone Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? "Stop listening" : `Speak in ${currentLanguageObj?.nativeName || 'regional language'} (बोलकर पूछें)`}
                  style={{
                    background: isListening ? '#fee2e2' : '#edf5f0',
                    border: isListening ? '1.5px solid #ef4444' : '1px solid rgba(22, 51, 38, 0.15)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    color: isListening ? '#dc2626' : '#163326',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {isListening ? (
                    <MicOff size={16} color="#dc2626" />
                  ) : (
                    <Mic size={16} color="#2d6a4f" />
                  )}
                  <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                    {isListening ? 'Stop' : 'Voice'}
                  </span>
                </button>

                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? 'Listening...' : 'Ask Rakshak or tap mic to speak...'}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: isListening ? '1.5px solid #ef4444' : '1px solid rgba(22, 51, 38, 0.15)',
                    fontSize: '0.84rem',
                    color: '#163326',
                    outline: 'none',
                    background: isListening ? '#fffdfd' : '#ffffff'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#2d6a4f'; }}
                  onBlur={(e) => { if (!isListening) e.target.style.borderColor = 'rgba(22, 51, 38, 0.15)'; }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{
                    background: input.trim() ? '#163326' : '#d5e0d9',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 13px',
                    cursor: input.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
