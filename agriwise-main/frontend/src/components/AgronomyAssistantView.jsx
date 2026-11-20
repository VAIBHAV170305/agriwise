import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, User, Send, BookOpen, ShieldCheck, 
  HelpCircle, RefreshCw, MessageSquare, Languages, Copy, Check
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import LanguageSelector from './LanguageSelector';
import RakshakLogo, { RakshakIcon, RakshakBadge } from './RakshakLogo';
import WhatsAppLoader from './WhatsAppLoader';

const QUICK_PROMPTS = [
  "What are the critical irrigation stages for wheat?",
  "How to manage Tomato Fruit Borer with organic IPM?",
  "Optimal N-P-K fertilizer split application for cereals?",
  "Recommended vermicompost dosage and Jeevamrutha prep?",
  "What grain moisture level is required for safe storage?"
];

export default function AgronomyAssistantView() {
  const { t, currentLanguageObj, greeting } = useLanguage();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Set localized greeting when language changes or initially
  useEffect(() => {
    const region = currentLanguageObj?.region || 'India';
    const nativeName = currentLanguageObj?.nativeName || 'your regional language';
    const name = currentLanguageObj?.name || 'English';
    const greet = greeting || 'Namaste';
    setMessages([
      {
        sender_role: 'assistant',
        content: (
          `${greet}! I am Rakshak AI, your dedicated agronomy advisor for ${region}. ` +
          `Ask me about soil nutrients, crop diseases, irrigation schedules, or MSP rates.`
        ),
        sources: []
      }
    ]);
  }, [currentLanguageObj, greeting]);

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

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title & Language Preference Bar with Custom Rakshak Logo */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RakshakLogo size={28} showText={false} />
            <span style={{ 
              fontSize: '1.45rem', 
              fontFamily: "'Fraunces', serif", 
              fontWeight: 800, 
              color: 'var(--text-primary)' 
            }}>
              Rakshak AI
            </span>
            <RakshakBadge text="Agronomy Shield Active" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
            Trained on ICAR and state agricultural university research.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Pills in active language */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
          {t('assistant.suggestedHeader', 'SUGGESTED TOPICS:')}
        </span>
        {[
          t('assistant.q1', QUICK_PROMPTS[0]),
          t('assistant.q2', QUICK_PROMPTS[1]),
          t('assistant.q3', QUICK_PROMPTS[2]),
          t('assistant.q4', QUICK_PROMPTS[3])
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--forest-800)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
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
                  background: isUser ? 'var(--emerald-600)' : 'linear-gradient(135deg, #163326 0%, #204b39 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
                }}>
                  {isUser ? <User size={18} color="#fff" /> : <RakshakIcon size={18} color="#d8f3dc" />}
                </div>

                <div style={{
                  background: isUser ? '#163326' : 'var(--bg-secondary)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>

                  {/* Copy button for assistant responses */}
                  {!isUser && (
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(m.content);
                        showToast({
                          title: 'Guidance Copied',
                          message: 'Rakshak AI advice copied to clipboard.',
                          type: 'success'
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy advice"
                    >
                      <Copy size={13} />
                    </button>
                  )}

                  {/* Sources / Citations Box */}
                  {m.sources && m.sources.length > 0 && (
                    <div style={{
                      marginTop: '14px',
                      paddingTop: '12px',
                      borderTop: isUser ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <BookOpen size={14} color={isUser ? '#d2e5d8' : 'var(--forest-800)'} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isUser ? '#d2e5d8' : 'var(--forest-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Verified Knowledge Sources Cited ({m.sources.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.sources.map((src, sIdx) => (
                          <div 
                            key={sIdx}
                            style={{
                              padding: '8px 12px',
                              background: isUser ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                              borderRadius: '8px',
                              border: isUser ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isUser ? '#ffffff' : 'var(--forest-800)' }}>{src.title}</span>
                              <span style={{ fontSize: '0.7rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{src.category} • Match: {Math.round(src.relevance_score * 100)}%</span>
                            </div>
                            <p style={{ fontSize: '0.73rem', color: isUser ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)', marginTop: '2px' }}>
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
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #163326 0%, #204b39 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(22, 51, 38, 0.2)'
              }}>
                <RakshakIcon size={18} color="#d8f3dc" />
              </div>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '14px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                <WhatsAppLoader size={7} color="#2dc653" centered={false} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Rakshak AI cross-referencing ICAR & University agronomy research...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
          >
            <input 
              className="form-input" 
              placeholder={t('assistant.placeholder', "Ask in your regional language about fertilizers, pests, sowing dates, market rates...")}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              <Send size={16} /> Send
            </button>
          </form>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Safeguard: Rakshak validates retrieved passages before answering. If a question falls outside verified documentation, it transparently declines rather than fabricating answers.
          </p>
        </div>
      </div>
    </div>
  );
}
