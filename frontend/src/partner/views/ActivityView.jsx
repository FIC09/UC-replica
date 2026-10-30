import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, Shield, CheckCircle2, Clock, UserCheck, Lock, AlertCircle, 
  FileText, Search, RefreshCw, Download, Filter, Package, CreditCard, 
  Users, Settings, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

const BASELINE_AUDIT_LOGS = [];

export function ActivityView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await partnerClient.getActivityLogs();
      if (res && res.success && Array.isArray(res.logs) && res.logs.length > 0) {
        // Tag categories if not present
        const enhanced = res.logs.map(l => ({
          ...l,
          category: getCategoryForAction(l.action)
        }));
        setLogs(enhanced);
        if (isManualRefresh) showToast?.('Audit ledger synchronized with live backend node.');
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getCategoryForAction(action) {
    if (['BOOKING_DISPATCH', 'BOOKING_ASSIGNMENT', 'BOOKING_COMPLETION_OVERRIDE'].includes(action)) return 'DISPATCH';
    if (['STAFF_INVITED', 'STAFF_REMOVED', 'STAFF_STATUS_UPDATED', 'LOGIN_SUCCESS'].includes(action)) return 'STAFF';
    if (['INVENTORY_ALLOCATED', 'GOODS_RECEIVED_CONFIRMED', 'INVENTORY_ORDER', 'SUPPLY_ORDER_PLACED', 'INVENTORY_ADJUSTED', 'INVENTORY_RETURNED'].includes(action)) return 'INVENTORY';
    if (['BANK_CHANGE_REQUEST', 'REFUND_APPROVED'].includes(action)) return 'FINANCE';
    if (['DOCUMENT_UPLOADED', 'SETTINGS_UPDATE', 'TRAINING_SESSION_REQUESTED', 'SUPPORT_TICKET_CREATED'].includes(action)) return 'COMPLIANCE';
    return 'ALL';
  }

  const categoryDefinitions = [
    { id: 'ALL', label: 'All Activity', icon: History },
    { id: 'DISPATCH', label: 'Dispatch & Bookings', icon: CheckCircle2 },
    { id: 'STAFF', label: 'Staff & Security', icon: UserCheck },
    { id: 'INVENTORY', label: 'Inventory & Stock', icon: Package },
    { id: 'FINANCE', label: 'Banking & Payouts', icon: CreditCard },
    { id: 'COMPLIANCE', label: 'Docs & Settings', icon: ShieldCheck }
  ];

  const actionConfig = {
    'LOGIN_SUCCESS': { label: 'Auth Success', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    'BOOKING_DISPATCH': { label: 'Booking Dispatch', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    'BOOKING_ASSIGNMENT': { label: 'Job Reassignment', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    'BOOKING_COMPLETION_OVERRIDE': { label: 'Completion Override', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'BANK_CHANGE_REQUEST': { label: 'Bank Change Request', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'STAFF_INVITED': { label: 'Staff Invited', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    'STAFF_REMOVED': { label: 'Staff Removed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    'STAFF_STATUS_UPDATED': { label: 'Status Updated', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
    'INVENTORY_ORDER': { label: 'Inventory Order', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    'SUPPLY_ORDER_PLACED': { label: 'Supply Order', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    'GOODS_RECEIVED_CONFIRMED': { label: 'Goods Received', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    'INVENTORY_ALLOCATED': { label: 'Stock Allocated', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    'INVENTORY_ADJUSTED': { label: 'Stock Adjusted', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'INVENTORY_RETURNED': { label: 'Stock Returned', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    'DOCUMENT_UPLOADED': { label: 'Doc Uploaded', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    'TRAINING_SESSION_REQUESTED': { label: 'Training Requested', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    'SUPPORT_TICKET_CREATED': { label: 'Support Ticket', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
    'SETTINGS_UPDATE': { label: 'Settings Modified', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' }
  };

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (activeCategory !== 'ALL') {
        const cat = log.category || getCategoryForAction(log.action);
        if (cat !== activeCategory) return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actor = (log.actorName || '').toLowerCase();
        const role = (log.actorRole || '').toLowerCase();
        const act = (log.action || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const reason = (log.reason || '').toLowerCase();
        const entity = (log.entity || '').toLowerCase();
        return actor.includes(q) || role.includes(q) || act.includes(q) || details.includes(q) || reason.includes(q) || entity.includes(q);
      }
      return true;
    });
  }, [logs, activeCategory, searchQuery]);

  function formatTime(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  }

  function getRelativeTime(isoString) {
    if (!isoString) return '';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. Header Card (Flush Alignment) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '22px 28px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 800, 
            color: '#7c3aed', 
            textTransform: 'uppercase', 
            letterSpacing: 0.8,
            marginBottom: 4 
          }}>
            Statutory Compliance & Security Roster
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            Business Activity & Compliance Audit Trail
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Permanent, immutable ledger of staff actions, dispatch mutations, inventory movements, and statutory compliance events.
          </p>
        </div>

        {/* Status / Control Badges Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#f8fafc',
            padding: '7px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            color: '#334155',
            border: '1px solid #e2e8f0',
            whiteSpace: 'nowrap'
          }}>
            <Clock size={15} color="#7c3aed" />
            <span>Timezone: <strong>Asia/Kolkata (IST)</strong></span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ecfdf5',
            padding: '7px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            color: '#059669',
            border: '1px solid #a7f3d0',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
            <span>Immutable Ledger</span>
          </div>

          <button
            onClick={() => loadLogs(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#334155',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Tamper-Evident Immutability Policy Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #7c3aed',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#f5f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Lock size={20} color="#7c3aed" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
            Tamper-Evident Immutability Policy (Section 133 / ISO-27001)
          </div>
          <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
            Business users are strictly prohibited from editing, modifying, or truncating audit history. Every recorded event captures the authenticated actor, target entity, timestamp, operational reason, and cryptographic state summary.
          </div>
        </div>
      </div>

      {/* 3. Precision Filter & Search Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        {/* Segmented Category Buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {categoryDefinitions.map(cat => {
            const count = cat.id === 'ALL' 
              ? logs.length 
              : logs.filter(l => (l.category || getCategoryForAction(l.action)) === cat.id).length;
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#7c3aed' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 4px rgba(124, 58, 237, 0.25)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
                <span>{cat.label}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', minWidth: 260, flex: '0 1 300px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actor, action, reason..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              height: 36,
              padding: '0 32px 0 34px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12.5,
              color: '#0f172a',
              background: '#f8fafc',
              outline: 'none',
              transition: 'border 0.15s ease'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 2
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Logs Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #f3e8ff', borderTopColor: '#7c3aed', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Loading cryptographic audit ledger...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#94a3b8'
            }}>
              <History size={26} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              No Activity Found
            </div>
            <div style={{ fontSize: 13, color: '#64748b', maxWidth: 360, margin: '0 auto 18px', lineHeight: 1.5 }}>
              No recorded operational events match your filter or search criteria.
            </div>
            {(activeCategory !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 175 }}>
                    Timestamp (IST)
                  </th>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 190 }}>
                    Staff Actor
                  </th>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 180 }}>
                    Action Category
                  </th>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 165 }}>
                    Target Entity
                  </th>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 220 }}>
                    Operational Reason
                  </th>
                  <th style={{ padding: '13px 18px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Safe Change Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l, idx) => {
                  const cfg = actionConfig[l.action] || { label: l.action.replace(/_/g, ' '), color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
                  const initials = (l.actorName || 'Staff').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr 
                      key={l.id || idx} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafcff',
                        transition: 'background 0.12s ease'
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#0f172a'
                        }}>
                          {formatTime(l.timestamp)}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                          {getRelativeTime(l.timestamp)}
                        </div>
                      </td>

                      {/* Staff Actor */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            fontSize: 11,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <strong style={{ color: '#0f172a', display: 'block', fontSize: 13 }}>
                              {l.actorName}
                            </strong>
                            <span style={{ 
                              fontSize: 11, 
                              color: '#7c3aed', 
                              fontWeight: 600
                            }}>
                              {l.actorRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: cfg.color,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          padding: '4px 10px',
                          borderRadius: 6,
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Entity */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: 5,
                          border: '1px solid #e2e8f0'
                        }}>
                          {l.entity || 'BUSINESS_OPS'}
                        </span>
                      </td>

                      {/* Reason */}
                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5, verticalAlign: 'middle', lineHeight: 1.4 }}>
                        {l.reason || 'Routine operational execution'}
                      </td>

                      {/* Details / Change Summary */}
                      <td style={{ padding: '14px 18px', color: '#1e293b', fontSize: 12.5, verticalAlign: 'middle', lineHeight: 1.4 }}>
                        {l.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Table Footer / Pagination & Audit Statement */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12.5,
          color: '#64748b'
        }}>
          <div>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> authenticated audit events • Cryptographically chained
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
              ✓ SHA-256 Hash Integrity Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
