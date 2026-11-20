import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '700px',
          margin: '40px auto',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#dc2626'
          }}>
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#991b1b', marginBottom: '8px', fontWeight: 700 }}>
            Module Display Issue
          </h3>
          <p style={{ color: '#7f1d1d', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
            An unexpected error occurred while rendering this module: <br />
            <code style={{ background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </code>
          </p>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#163326',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} /> Reload View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
