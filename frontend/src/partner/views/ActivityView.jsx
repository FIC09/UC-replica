import React, { useState, useEffect } from 'react';
import { History, Shield, CheckCircle2, Clock, UserCheck, Lock, AlertCircle, FileText } from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function ActivityView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await partnerClient.getActivityLogs();
      if (res && res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      showToast?.('Error loading audit log: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const actionColors = {
    'LOGIN_SUCCESS': '#2563eb',
    'BOOKING_DISPATCH': '#7c3aed',
    'BOOKING_ASSIGNMENT': '#7c3aed',
    'BOOKING_COMPLETION_OVERRIDE': '#d97706',
    'BANK_CHANGE_REQUEST': '#d97706',
    'STAFF_INVITED': '#059669',
    'STAFF_REMOVED': '#dc2626',
    'STAFF_STATUS_UPDATED': '#475569',
    'INVENTORY_ORDER': '#0284c7',
    'SUPPLY_ORDER_PLACED': '#0284c7',
    'GOODS_RECEIVED_CONFIRMED': '#16a34a',
    'INVENTORY_ALLOCATED': '#7c3aed',
    'INVENTORY_ADJUSTED': '#d97706',
    'INVENTORY_RETURNED': '#0284c7',
    'DOCUMENT_UPLOADED': '#7c3aed',
    'TRAINING_SESSION_REQUESTED': '#2563eb',
    'SUPPORT_TICKET_CREATED': '#475569',
    'SETTINGS_UPDATE': '#475569'
  };

  const filteredLogs = actionFilter === 'ALL'
    ? logs
    : logs.filter(l => l.action === actionFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Business Activity & Compliance Audit Trail
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Permanent, immutable ledger of staff actions, dispatch mutations, inventory movements, and statutory compliance events
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#475569', border: '1px solid #e2e8f0' }}>
          <Clock size={16} color="#7c3aed" /> Timezone: Asia/Kolkata
        </div>
      </div>

      {/* Immutable Audit Trail Security Guarantee Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <Lock size={20} color="#475569" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
          <strong>Tamper-Evident Immutability Policy:</strong> Business users are strictly prohibited from editing, modifying, or deleting audit history. Every recorded event captures the authenticated actor, target entity, timestamp, reason, and safe change summary.
        </div>
      </div>

      {/* Filter by Action */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', 'STAFF_INVITED', 'INVENTORY_ALLOCATED', 'GOODS_RECEIVED_CONFIRMED', 'DOCUMENT_UPLOADED', 'SETTINGS_UPDATE'].map(act => (
          <button
            key={act}
            onClick={() => setActionFilter(act)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: actionFilter === act ? 700 : 500,
              background: actionFilter === act ? '#7c3aed' : '#ffffff',
              color: actionFilter === act ? '#ffffff' : '#64748b',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {act === 'ALL' ? `All Activity (${logs.length})` : act.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading audit activity log...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            No activity logged under this category.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Timestamp (Asia/Kolkata)</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Staff Actor</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Entity</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Operational Reason</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Safe Change Summary</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(l.timestamp).toLocaleTimeString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{l.actorName}</strong>
                      <span style={{ fontSize: 11.5, color: '#7c3aed', background: '#f5f3ff', padding: '1px 6px', borderRadius: 4 }}>
                        {l.actorRole}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: actionColors[l.action] || '#475569',
                        background: '#f8fafc',
                        border: `1px solid ${actionColors[l.action] || '#cbd5e1'}33`,
                        padding: '3px 8px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap'
                      }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 600, fontSize: 12.5 }}>
                      {l.entity || 'BUSINESS_OPS'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12.5, maxWidth: 220 }}>
                      {l.reason || 'Operational workflow execution'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', maxWidth: 300, fontSize: 12.5 }}>
                      {l.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
