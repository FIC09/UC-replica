import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Shield, 
  Filter, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Download, 
  Eye, 
  X, 
  Clock, 
  User, 
  Terminal,
  Lock,
  ArrowRight
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function AuditLogsView({ onShowToast }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  function loadLogs() {
    adminClient.getAuditLogs()
      .then(res => setLogs(res.auditLogs || []))
      .catch(() => {});
  }

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch = (l.actor || '').toLowerCase().includes(q) ||
                          (l.actorEmail || '').toLowerCase().includes(q) ||
                          (l.action || '').toLowerCase().includes(q) ||
                          (l.target || '').toLowerCase().includes(q) ||
                          (l.reason || '').toLowerCase().includes(q);
    const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesEntity = entityFilter === 'ALL' || l.entityType === entityFilter;
    return matchesSearch && matchesSeverity && matchesEntity;
  });

  async function handleExportCsv() {
    setExporting(true);
    try {
      const blob = await adminClient.exportAuditLogsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urban_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExporting(false);
      if (onShowToast) onShowToast('Audit trail exported successfully with formula injection protection');
    } catch {
      // Fallback client-side CSV generator with formula injection escaping
      const sanitizeCsvCell = (val) => {
        if (val === null || val === undefined) return '""';
        let str = String(val).replace(/"/g, '""');
        if (/^[=+\-@\t\r]/.test(str)) {
          str = "'" + str;
        }
        return `"${str}"`;
      };

      const headers = ['Log ID', 'Timestamp', 'Actor', 'Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Severity', 'IP Address', 'Reason'];
      const rows = filtered.map(l => [
        sanitizeCsvCell(l.logId || l.id),
        sanitizeCsvCell(new Date(l.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
        sanitizeCsvCell(l.actor),
        sanitizeCsvCell(l.actorEmail),
        sanitizeCsvCell(l.role),
        sanitizeCsvCell(l.action),
        sanitizeCsvCell(l.entityType),
        sanitizeCsvCell(l.entityId),
        sanitizeCsvCell(l.severity),
        sanitizeCsvCell(l.ipAddress),
        sanitizeCsvCell(l.reason)
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urban_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExporting(false);
      if (onShowToast) onShowToast('Audit trail exported successfully');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>System Audit Logs & Security Trail</h3>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0 0' }}>
            Tamper-evident chronological log of all administrator actions, session revocations, refunds and pricing overrides
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            color: '#334155',
            border: '1px solid #CBD5E1',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: exporting ? 'not-allowed' : 'pointer'
          }}
        >
          <Download size={15} color="#6E42E5" /> {exporting ? 'Exporting...' : 'Export Audit CSV'}
        </button>
      </div>

      {/* Immutable Notice Banner */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 10,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 12.5,
        color: '#475569'
      }}>
        <Lock size={18} color="#6E42E5" style={{ flexShrink: 0 }} />
        <span>
          <strong>Immutable Append-Only Ledger:</strong> Audit logs cannot be modified, edited, or deleted by any administrator account. All entries record actor credentials, IP address, timestamp in <code>Asia/Kolkata</code>, and safe before/after state summaries with sensitive bank account and authorization token sanitization.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: '10px 16px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, reason, entity ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155'
            }}
          >
            <option value="ALL">All Entity Types</option>
            <option value="PlatformSettings">Platform Settings</option>
            <option value="Admin">Admin Staff Accounts</option>
            <option value="Booking">Bookings</option>
            <option value="BusinessPartner">Business Partners</option>
            <option value="PayoutStatement">Payout Statements</option>
            <option value="PlatformDemoSandbox">Demo Sandbox</option>
          </select>

          {['ALL', 'Info', 'Warning', 'Critical'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: severityFilter === sev ? '1px solid #6E42E5' : '1px solid #E2E8F0',
                backgroundColor: severityFilter === sev ? '#F5F3FF' : '#FFFFFF',
                color: severityFilter === sev ? '#6E42E5' : '#475569'
              }}
            >
              {sev === 'ALL' ? 'All Severity' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>Timestamp (IST)</th>
              <th style={{ padding: '12px 18px' }}>Actor</th>
              <th style={{ padding: '12px 18px' }}>Action & Entity</th>
              <th style={{ padding: '12px 18px' }}>Reason / Description</th>
              <th style={{ padding: '12px 18px' }}>Severity</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Inspection</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id || l.logId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px', color: '#64748B', fontSize: 12, fontFamily: 'monospace' }}>
                  {new Date(l.timestamp).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{l.actor}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>{l.role} ({l.ipAddress})</div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: '#F1F5F9',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 11.5,
                    color: '#334155'
                  }}>
                    {l.action}
                  </span>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                    {l.entityType} ({l.entityId})
                  </div>
                </td>
                <td style={{ padding: '14px 18px', color: '#334155', fontSize: 12.5, maxWidth: 300 }}>
                  {l.reason}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    backgroundColor: l.severity === 'Critical' ? '#FEE2E2' : l.severity === 'Warning' ? '#FEF3C7' : '#EFF6FF',
                    color: l.severity === 'Critical' ? '#DC2626' : l.severity === 'Warning' ? '#B45309' : '#1D4ED8'
                  }}>
                    {l.severity || 'Info'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedLog(l)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#6E42E5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Eye size={13} /> View Diff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* State Inspection Drawer / Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: 720,
            maxWidth: '92vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Audit Record: {selectedLog.logId || selectedLog.id}
                </h4>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {new Date(selectedLog.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (Asia/Kolkata)
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Actor Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, fontSize: 12 }}>
                <div><strong>Actor Name:</strong> {selectedLog.actor}</div>
                <div><strong>Email:</strong> {selectedLog.actorEmail || 'N/A'}</div>
                <div><strong>Role:</strong> {selectedLog.role}</div>
                <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                <div><strong>Entity Type:</strong> {selectedLog.entityType}</div>
                <div><strong>Entity ID:</strong> {selectedLog.entityId}</div>
              </div>

              {/* Action & Reason */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Action & Justification</div>
                <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 800, color: '#6E42E5', marginBottom: 4 }}>{selectedLog.action}</div>
                  <div style={{ color: '#0F172A' }}>{selectedLog.reason}</div>
                </div>
              </div>

              {/* Safe Before / After Summaries */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>State Before Action</div>
                  <pre style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 11.5,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: 220
                  }}>
                    {JSON.stringify(selectedLog.beforeSummary || { status: 'Prior baseline' }, null, 2)}
                  </pre>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>State After Action</div>
                  <pre style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 11.5,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: 220
                  }}>
                    {JSON.stringify(selectedLog.afterSummary || { status: 'Updated state' }, null, 2)}
                  </pre>
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic' }}>
                * All sensitive passwords, authorization tokens, and private bank credentials are automatically stripped or masked prior to audit record retention.
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
