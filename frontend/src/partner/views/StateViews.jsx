import React from 'react';
import { ShieldAlert, Clock, AlertTriangle, ArrowLeft, RefreshCw, PhoneCall } from 'lucide-react';

export function PendingApprovalState({ partner, onNavigate, onRefresh, onLogout }) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div style={{
      padding: '36px 24px',
      maxWidth: 680,
      margin: '40px auto',
      background: '#ffffff',
      borderRadius: 16,
      border: '1.5px solid #fde68a',
      boxShadow: '0 15px 30px -10px rgba(217, 119, 6, 0.1)',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: 68,
        height: 68,
        borderRadius: '50%',
        background: '#fef3c7',
        color: '#d97706',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 18px'
      }}>
        <Clock size={34} />
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fde68a',
        padding: '4px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.5,
        marginBottom: 12
      }}>
        <span>●</span>
        <span>PARTNER FLEET AWAITING ADMIN APPROVAL</span>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
        Partner Registration Under Admin Review
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 22 }}>
        Thank you for applying. Your enterprise registration for <strong>{partner?.businessName || 'your agency'}</strong> has been routed to the Operations Admin Dashboard for enterprise compliance verification.
      </p>

      {/* Partner Application Summary Details */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px 20px',
        textAlign: 'left',
        marginBottom: 22,
        fontSize: 13
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b' }}>Partner Application ID:</span>
          <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{partner?.id || 'PTR-PENDING'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b' }}>Business Entity:</span>
          <strong style={{ color: '#0f172a' }}>{partner?.businessName || 'Agency'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b' }}>Owner / Authorized Lead:</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{partner?.ownerName || 'On File'} ({partner?.phone || ''})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b' }}>Category & Fleet Capacity:</span>
          <span style={{ color: '#0f172a' }}>{partner?.categoryName || partner?.category || 'General Home Services'} • {partner?.fleetSize || '6-15 Technicians'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, alignItems: 'center' }}>
          <span style={{ color: '#64748b' }}>Application Status:</span>
          <span style={{
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fde68a',
            padding: '3px 10px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12
          }}>
            ● {partner?.status || 'Pending Review'}
          </span>
        </div>
      </div>

      {/* Security & Access Restriction Notice */}
      <div style={{
        background: '#fffbeb',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #fde68a',
        textAlign: 'left',
        marginBottom: 24,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 1.55
      }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>🔒 Operational ERP Dashboard Access Restricted:</strong>
        Per Urban Company enterprise security protocols, high-volume booking dispatches, live technician GPS tracking, enterprise team rosters, and corporate bank payout settlements remain locked until the Platform Administrator approves your partner application in the Admin Dashboard.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onRefresh && (
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              background: '#6E42E5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 800,
              cursor: isRefreshing ? 'wait' : 'pointer',
              minHeight: 46,
              boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)'
            }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Checking Admin Approval...' : 'Check Approval Status / Refresh'}</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/partner/support')}
              style={{
                flex: 1,
                padding: '10px 18px',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Partner Support Desk
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                flex: 1,
                padding: '10px 18px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log Out / Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuspendedState({ partner, onNavigate }) {
  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: 680,
      margin: '60px auto',
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #fee2e2',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08)',
      textAlign: 'center'
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
        margin: '0 auto 20px'
      }}>
        <ShieldAlert size={32} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>
        Business Partner Account Suspended
      </h2>
      <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
        Doorstep operations and technician assignment privileges for <strong>{partner?.businessName || 'your agency'}</strong> have been placed on hold by Urban Company Compliance.
      </p>
      <div style={{
        background: '#fef2f2',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #fecaca',
        textAlign: 'left',
        marginBottom: 24,
        fontSize: 13.5
      }}>
        <strong style={{ color: '#b91c1c', display: 'block', marginBottom: 4 }}>Suspension Explanation:</strong>
        <span style={{ color: '#7f1d1d', lineHeight: 1.5, display: 'block' }}>
          {partner?.suspensionReason || 'Compliance audit review required on annual safety certifications and insurance renewal.'}
        </span>
        <div style={{ marginTop: 10, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>
          Permitted access: You have authorized access to Partner Support to submit compliance rectification documents.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onNavigate && (
          <button
            onClick={() => onNavigate('/partner/support')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Access Permitted Support Desk
          </button>
        )}
      </div>
    </div>
  );
}

export function PermissionDeniedState({ requiredPermission, userRole, onBack }) {
  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: 600,
      margin: '60px auto',
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: '#f1f5f9',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        <AlertTriangle size={30} color="#f59e0b" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
        Restricted Module Access
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
        Your assigned role as <strong>{userRole || 'Staff Member'}</strong> does not possess the
        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, margin: '0 4px', color: '#7c3aed' }}>
          {requiredPermission}
        </code>
        privilege required to view or modify this business module.
      </p>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
        Contact your agency's <strong>Business Owner</strong> to request role elevation or permissions adjustments.
      </p>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Return to Operations Dashboard
        </button>
      )}
    </div>
  );
}
