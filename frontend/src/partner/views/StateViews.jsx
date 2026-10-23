import React from 'react';
import { ShieldAlert, Clock, AlertTriangle, ArrowLeft, RefreshCw, PhoneCall } from 'lucide-react';

export function PendingApprovalState({ partner, onNavigate, onRefresh }) {
  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: 680,
      margin: '60px auto',
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#fef3c7',
        color: '#d97706',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        <Clock size={32} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
        Operational Privileges Reserved for Approved Partners
      </h2>
      <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
        Your business partner account (<strong>{partner?.businessName || 'your agency'}</strong>) is currently in
        <strong style={{ color: '#d97706' }}> {partner?.status || 'Under Review'} </strong> status.
      </p>
      <div style={{
        background: '#fffbeb',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #fef3c7',
        textAlign: 'left',
        marginBottom: 24,
        fontSize: 13.5,
        color: '#92400e',
        lineHeight: 1.6
      }}>
        <strong>Platform Policy Notice:</strong> Registration does not automatically approve a business.
        Pending businesses may access onboarding, profile corrections, and support, but cannot receive
        operational privileges (technician job dispatch, live booking assignments, or financial payouts) until approved.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onNavigate && (
          <button
            onClick={() => onNavigate('/partner/onboarding')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Track & Complete Onboarding
          </button>
        )}
        {onNavigate && (
          <button
            onClick={() => onNavigate('/partner/support')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Access Partner Support Desk
          </button>
        )}
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
