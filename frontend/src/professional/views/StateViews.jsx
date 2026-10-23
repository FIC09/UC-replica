import React from 'react';

// 1. Loading State
export function LoadingState({ message = 'Loading dispatch data...' }) {
  return (
    <div style={{
      minHeight: 280,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: '4px solid #f3e8ff',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: '#6b21a8' }}>
        {message}
      </div>
    </div>
  );
}

// 2. Empty State
export function EmptyState({ icon = '📦', title = 'No Dispatches Found', message = 'There are no active items in this view.', actionText, onAction }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 18,
      border: '1px solid #e2e8f0',
      padding: '48px 24px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '24px auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 46
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// 3. Error State
export function ErrorState({ error = 'Failed to load data from server.', onRetry }) {
  return (
    <div style={{
      background: '#fef2f2',
      border: '1.5px solid #fecaca',
      borderRadius: 18,
      padding: '32px 24px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '24px auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#991b1b', margin: '0 0 8px 0' }}>
        Service Disruption
      </h3>
      <p style={{ fontSize: 13, color: '#b91c1c', margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#b91c1c',
            color: '#ffffff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 44
          }}
        >
          Retry Request ↺
        </button>
      )}
    </div>
  );
}

// 4. Suspended State View
export function SuspendedState({ profile, onNavigate, onLogout }) {
  return (
    <div style={{
      maxWidth: 640,
      margin: '30px auto',
      padding: '0 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 22,
        border: '1.5px solid #fca5a5',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.08)'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 18px auto'
        }}>
          🚫
        </div>

        <div style={{
          display: 'inline-block',
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '4px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.5,
          marginBottom: 10
        }}>
          ACCOUNT SUSPENDED
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
          Portal Access Restricted
        </h2>

        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          Your service worker account <strong>{profile?.id || 'PRO-8847'}</strong> has been temporarily suspended by the Safety & Disciplinary Review Board.
        </p>

        {/* Reason Box */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 14,
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: 24
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
            Official Reason & Policy Violation
          </div>
          <div style={{ fontSize: 13, color: '#7f1d1d', marginTop: 6, lineHeight: 1.45, fontWeight: 600 }}>
            {profile?.suspendReason || 'Account suspended due to 3 consecutive unexcused booking cancellations within a 24-hour window, violating Partner SLA Policy.'}
          </div>
        </div>

        {/* Action Next Steps */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '16px 20px',
          textAlign: 'left',
          fontSize: 13,
          color: '#334155',
          lineHeight: 1.5,
          marginBottom: 28
        }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Reinstatement Counseling Required:</div>
          <div>• In-person review at <strong>{profile?.operationalHub || 'Bandra West Central Hub'}</strong></div>
          <div style={{ marginTop: 2 }}>• Counseling with Operations Cell (Officer Kiran Mehta)</div>
          <div style={{ marginTop: 2 }}>• Active dispatches, slot bookings, and instant withdrawals are temporarily paused</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => onNavigate('/professional/support')}
            style={{
              width: '100%',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '14px 0',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48
            }}
          >
            Appeal Suspension / Contact Disciplinary Cell
          </button>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              padding: '12px 0',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44
            }}
          >
            Sign Out / Switch Demo Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Permission Denied State
export function PermissionDeniedState({ title = 'Permission Denied', message = 'You do not have access to view or mutate this worker record.', onBack }) {
  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: '32px 24px',
      background: '#ffffff',
      borderRadius: 18,
      border: '1.5px solid #fed7aa',
      textAlign: 'center',
      boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.08)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🛡️</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#9a3412', margin: '0 0 8px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: '#c2410c', margin: '0 0 24px 0', lineHeight: 1.5 }}>
        {message}
      </p>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: '#ea580c',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 46
          }}
        >
          Return to My Dashboard →
        </button>
      )}
    </div>
  );
}

// 6. Session Expired Modal
export function SessionExpiredModal({ onRelogin }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: 16
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: '32px 28px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>⏰</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          Session Expired
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          Your security session has timed out. Please authenticate with your registered phone or password to continue.
        </p>
        <button
          onClick={onRelogin}
          style={{
            width: '100%',
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            padding: '12px 0',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 48
          }}
        >
          Re-authenticate Now
        </button>
      </div>
    </div>
  );
}

// 7. Persistent Offline & Mobile Reliability Connectivity Banner
export function OfflineBanner({ isOffline, onReconnect }) {
  const [reconnecting, setReconnecting] = React.useState(false);
  const [justReconnected, setJustReconnected] = React.useState(false);

  const handleReconnectCheck = async () => {
    setReconnecting(true);
    try {
      if (onReconnect) {
        await onReconnect();
      } else {
        // Ping lightweight endpoint
        await fetch('/api/professional/profile');
      }
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    } catch {
      // Still offline
    } finally {
      setReconnecting(false);
    }
  };

  if (justReconnected) {
    return (
      <div style={{
        background: '#059669',
        color: '#ffffff',
        padding: '10px 16px',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(5,150,105,0.2)'
      }}>
        <span>✅</span>
        <span>Reconnected to Server. Permissions, dispatches & sync states revalidated successfully.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div style={{
      background: '#991b1b',
      color: '#ffffff',
      padding: '10px 16px',
      fontSize: 12,
      fontWeight: 600,
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)'
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: 18, animation: 'pulse 1.5s infinite' }}>📡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.2 }}>
              Offline Mode Active (Pending Sync)
            </div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 1 }}>
              Drafts preserved locally. Financial transfers, payout updates, and job completions require live server verification.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleReconnectCheck}
            disabled={reconnecting}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: reconnecting ? 'wait' : 'pointer',
              minHeight: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {reconnecting ? 'Reconnecting...' : 'Retry Connection ↺'}
          </button>
        </div>
      </div>
    </div>
  );
}

