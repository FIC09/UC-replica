import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: 640,
            width: '100%',
            background: '#1E293B',
            borderRadius: 16,
            padding: 32,
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F87171', margin: '0 0 12px' }}>
              Application Render Error
            </h2>
            <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.5 }}>
              A runtime exception prevented this view from rendering:
            </p>
            <pre style={{
              background: '#090E1A',
              padding: 16,
              borderRadius: 8,
              color: '#FCA5A5',
              fontSize: 13,
              overflowX: 'auto',
              border: '1px solid #7F1D1D',
              margin: '0 0 16px'
            }}>
              {this.state.error?.toString()}
            </pre>
            <details style={{ fontSize: 12, color: '#64748B', marginBottom: 20, cursor: 'pointer' }}>
              <summary>View Stack Trace</summary>
              <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 18px',
                  background: '#6E42E5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                style={{
                  padding: '10px 18px',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Reset Local Storage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
