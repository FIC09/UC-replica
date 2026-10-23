import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  Briefcase,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  FileText,
  LifeBuoy,
  RefreshCw,
  MailCheck
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function NotificationsView({ showToast, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [outboxNotice, setOutboxNotice] = useState('');

  const categories = [
    'ALL',
    'New Booking',
    'Reassignment',
    'Cancellation',
    'Training Requirement',
    'Document Review',
    'Expiry Reminders',
    'Settlement Updates',
    'Support Replies'
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await partnerClient.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        if (res.outboxNotice) {
          setOutboxNotice(res.outboxNotice);
        }
      }
    } catch (err) {
      showToast?.('Error loading notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      const res = await partnerClient.markNotificationRead(id);
      if (res && res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        showToast?.('Notification marked as read.');
      }
    } catch (err) {
      showToast?.('Could not mark notification as read');
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await partnerClient.markAllNotificationsRead();
      if (res && res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast?.('All notifications marked as read.');
      }
    } catch (err) {
      showToast?.('Could not mark all notifications as read');
    }
  }

  // Deep Link navigation handler
  function handleDeepLink(notif) {
    if (notif.deepLink && onNavigate) {
      onNavigate(notif.deepLink.tab || notif.deepLink.view || 'overview');
    } else {
      showToast?.(`Navigating to related entity: ${notif.title}`);
    }
  }

  // Filter logic
  const filtered = notifications.filter(n => {
    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory || n.type === selectedCategory;
    const matchesRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read);
    return matchesCat && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const categoryIcons = {
    'New Booking': <Briefcase size={18} />,
    'Reassignment': <Users size={18} />,
    'Cancellation': <AlertCircle size={18} />,
    'Training Requirement': <GraduationCap size={18} />,
    'Document Review': <FileText size={18} />,
    'Expiry Reminders': <ShieldAlert size={18} />,
    'Settlement Updates': <DollarSign size={18} />,
    'Support Replies': <LifeBuoy size={18} />
  };

  const categoryColors = {
    'New Booking': { bg: '#ede9fe', text: '#6d28d9' },
    'Reassignment': { bg: '#e0f2fe', text: '#0284c7' },
    'Cancellation': { bg: '#fee2e2', text: '#dc2626' },
    'Training Requirement': { bg: '#fef3c7', text: '#b45309' },
    'Document Review': { bg: '#f3e8ff', text: '#7c3aed' },
    'Expiry Reminders': { bg: '#ffedd5', text: '#c2410c' },
    'Settlement Updates': { bg: '#dcfce7', text: '#16a34a' },
    'Support Replies': { bg: '#e0e7ff', text: '#4338ca' }
  };

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
            Operational Notifications & Alerts
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Bookings, reassignments, cancellations, academy compliance, expiry reminders, and settlement updates
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <CheckCheck size={16} /> Mark All as Read ({unreadCount})
            </button>
          )}

          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
            <button
              onClick={() => setReadFilter('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12.5,
                fontWeight: readFilter === 'ALL' ? 700 : 500,
                background: readFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: readFilter === 'ALL' ? '#7c3aed' : '#64748b',
                boxShadow: readFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setReadFilter('UNREAD')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12.5,
                fontWeight: readFilter === 'UNREAD' ? 700 : 500,
                background: readFilter === 'UNREAD' ? '#ffffff' : 'transparent',
                color: readFilter === 'UNREAD' ? '#7c3aed' : '#64748b',
                boxShadow: readFilter === 'UNREAD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Local Outbox Delivery Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 12,
        padding: '14px 20px',
        border: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <MailCheck size={20} color="#64748b" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
          <strong>Local Outbox Delivery Notice:</strong> {outboxNotice || 'External SMS, WhatsApp, and push delivery gateways are unconfigured in sandbox mode. Operational alerts are queued and delivered reliably into this in-app local outbox without claiming third-party external transmission.'}
        </div>
      </div>

      {/* 8 Mandatory Category Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: selectedCategory === cat ? 700 : 500,
              background: selectedCategory === cat ? '#7c3aed' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#64748b',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
          No alerts to display under the selected category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(n => {
            const catColor = categoryColors[n.category] || { bg: '#ede9fe', text: '#7c3aed' };
            const icon = categoryIcons[n.category] || <Bell size={18} />;

            return (
              <div
                key={n.id}
                style={{
                  background: n.read ? '#ffffff' : '#f5f3ff',
                  borderRadius: 14,
                  border: n.read ? '1px solid #e2e8f0' : '1px solid #ddd6fe',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: catColor.bg,
                    color: catColor.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: catColor.text, background: catColor.bg, padding: '2px 8px', borderRadius: 4 }}>
                        {n.category || 'Platform Notice'}
                      </span>
                      <strong style={{ fontSize: 15, color: '#0f172a' }}>{n.title}</strong>
                      {!n.read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}></span>
                      )}
                    </div>

                    <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 6px 0', lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {n.deepLink && (
                    <button
                      onClick={() => handleDeepLink(n)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#7c3aed',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={13} /> View Context
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
