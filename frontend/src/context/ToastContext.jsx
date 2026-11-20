import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ message, title, type = 'info', duration = 3800 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, title, type, duration };

    setToasts((prev) => [...prev.slice(-3), newToast]); // keep maximum 4 active toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Floating Bottom Toast Container with Smooth Ease-in/Ease-out */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          pointerEvents: 'none',
          maxWidth: '92vw',
          width: '460px'
        }}
      >
        {toasts.map((toast) => {
          const isCritical = toast.type === 'critical' || toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          // Color palette with contrasting crimson red for critical alerts
          let bg = '#ffffff';
          let border = '1px solid rgba(27, 56, 43, 0.16)';
          let accentColor = '#163326';
          let icon = <Info size={18} color="#163326" />;

          if (isCritical) {
            bg = '#fff5f5';
            border = '1px solid #fecdd3';
            accentColor = '#d90429';
            icon = <AlertCircle size={18} color="#d90429" />;
          } else if (isSuccess) {
            bg = '#f4fbf6';
            border = '1px solid #b7e4c7';
            accentColor = '#2d6a4f';
            icon = <CheckCircle2 size={18} color="#2d6a4f" />;
          } else if (isWarning) {
            bg = '#fffbeb';
            border = '1px solid #fde68a';
            accentColor = '#b45309';
            icon = <AlertTriangle size={18} color="#b45309" />;
          }

          return (
            <div
              key={toast.id}
              className="toast-notification-card"
              style={{
                pointerEvents: 'auto',
                width: '100%',
                background: bg,
                border: border,
                borderRadius: '14px',
                padding: '12px 16px',
                boxShadow: isCritical 
                  ? '0 10px 30px rgba(217, 4, 41, 0.16), 0 2px 8px rgba(0,0,0,0.06)' 
                  : '0 10px 30px rgba(22, 51, 38, 0.12), 0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'toastSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              {/* Left Accent Strip */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: accentColor
              }} />

              {/* Icon */}
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {icon}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ 
                    fontSize: '0.86rem', 
                    fontWeight: 700, 
                    color: accentColor, 
                    lineHeight: 1.2,
                    marginBottom: '2px'
                  }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ 
                  fontSize: '0.82rem', 
                  color: isCritical ? '#991b1b' : '#264634', 
                  lineHeight: 1.45,
                  wordBreak: 'break-word'
                }}>
                  {toast.message}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  color: '#718579',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title="Dismiss"
              >
                <X size={15} />
              </button>

              {/* Toast Expiry Progress Bar (Google Play Store style subtle bottom bar) */}
              {toast.duration > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2.5px',
                    background: accentColor,
                    opacity: 0.65,
                    animation: `toastProgress ${toast.duration}ms linear forwards`
                  }} 
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
