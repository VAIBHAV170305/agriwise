import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3600) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

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

      {/* Floating Bottom Toast Container */}
      <div 
        className="toast-container" 
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10000,
          pointerEvents: 'none',
          maxWidth: '92vw',
          width: '420px'
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className="toast-notification animate-toast-in"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: '#123524',
                color: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 12px 36px rgba(18, 53, 36, 0.28), 0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${
                  isSuccess ? '#10b981' : isWarning ? '#f59e0b' : isError ? '#ef4444' : 'rgba(255, 255, 255, 0.18)'
                }`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Type Accent Icon */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {isSuccess && <CheckCircle2 size={19} color="#34d399" />}
                {isWarning && <AlertTriangle size={19} color="#fbbf24" />}
                {isError && <AlertCircle size={19} color="#f87171" />}
                {!isSuccess && !isWarning && !isError && <Info size={19} color="#60a5fa" />}
              </div>

              {/* Message */}
              <div style={{
                flex: 1,
                fontSize: '0.86rem',
                fontWeight: 600,
                lineHeight: 1.35,
                color: '#f8faf7'
              }}>
                {toast.message}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'; }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
