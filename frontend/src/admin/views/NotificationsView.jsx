import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  Smartphone,
  Mail,
  CheckCircle2,
  Clock,
  Inbox,
  AlertTriangle,
  Building2,
  HardHat,
  Search,
  Calendar
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function NotificationsView({ onShowToast }) {
  const [notifications, setNotifications] = useState([]);
  const [channel, setChannel] = useState('In-App Push');
  const [targetAudience, setTargetAudience] = useState('All Customers');
  const [scheduledTime, setScheduledTime] = useState('Immediate');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'outbox'

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    adminClient.getNotifications()
      .then(res => setNotifications(res.notifications || []))
      .catch(() => {});
  }

  async function handleSendBroadcast(e) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);

    try {
      const res = await adminClient.sendNotification({
        title,
        message,
        channel,
        audience: targetAudience,
        scheduledTime
      });

      if (res.success) {
        setNotifications(prev => [res.notification, ...prev]);
        setTitle('');
        setMessage('');
        if (onShowToast) onShowToast(res.message);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  const outboxCount = notifications.filter(n => n.outboxQueued).length;
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'outbox') return n.outboxQueued;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Broadcast Notifications & Local Outbox
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #C7D2FE'
            }}>
              Provider-Confirmed Delivery Safeguard
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Broadcast operational alerts, SMS updates, and in-app messages. External gateway dispatches are queued in a local outbox if provider connectivity is unconfirmed.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: activeTab === 'all' ? '1px solid #6E42E5' : '1px solid #E2E8F0',
              backgroundColor: activeTab === 'all' ? '#F5F3FF' : '#FFFFFF',
              color: activeTab === 'all' ? '#6E42E5' : '#64748B',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Broadcasts ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outbox')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: activeTab === 'outbox' ? '1px solid #D97706' : '1px solid #E2E8F0',
              backgroundColor: activeTab === 'outbox' ? '#FFFBEB' : '#FFFFFF',
              color: activeTab === 'outbox' ? '#92400E' : '#64748B',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Inbox size={14} />
            <span>Local Outbox ({outboxCount})</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* Composer Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={16} color="#6E42E5" /> Compose New Broadcast
          </h4>

          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Dispatch Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                {['In-App Push', 'SMS Gateway', 'WhatsApp', 'Email Gateway'].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: channel === ch ? '1px solid #6E42E5' : '1px solid #E2E8F0',
                      backgroundColor: channel === ch ? '#F5F3FF' : '#FFFFFF',
                      color: channel === ch ? '#6E42E5' : '#475569',
                      textAlign: 'center'
                    }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Target Audience</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
              >
                <option value="All Customers">All Verified Customers (24,500)</option>
                <option value="Professionals Only">Active Field Technicians (1,200)</option>
                <option value="Business Partners">Franchise Business Partners (42)</option>
                <option value="High-Value Users">UC Plus VIP Subscribers (480)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Scheduled Dispatch Time</label>
              <select
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
              >
                <option value="Immediate">Immediate Dispatch</option>
                <option value="Tomorrow Morning (08:00 AM)">Tomorrow Morning (08:00 AM)</option>
                <option value="Weekend Priority (Sat 09:00 AM)">Weekend Priority (Sat 09:00 AM)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Message Headline / Subject</label>
              <input
                type="text"
                required
                placeholder="Short announcement title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Notification Content Body</label>
              <textarea
                rows={3}
                required
                placeholder="Full operational message text..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6
              }}
            >
              <Send size={15} />
              <span>{sending ? 'Queueing Broadcast...' : 'Transmit / Queue Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* Notifications & Outbox List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNotifications.map(n => (
            <div
              key={n.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: n.outboxQueued ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                padding: 18,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{n.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F1F5F9', color: '#475569' }}>
                    {n.channel}
                  </span>
                </div>

                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: n.outboxQueued ? '#FFFBEB' : '#ECFDF5',
                  color: n.outboxQueued ? '#92400E' : '#059669'
                }}>
                  {n.status}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                {n.message}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748B', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                <div>
                  Audience: <strong style={{ color: '#0F172A' }}>{n.audience}</strong> ({n.recipientsCount} users)
                </div>
                <div>{n.sentAt} • Open Rate: <strong>{n.openRate}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
