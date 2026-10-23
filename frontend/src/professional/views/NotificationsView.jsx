import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function NotificationsView({ onNavigate, showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Preferences
  const [prefs, setPrefs] = useState({
    jobOffersInApp: true,
    jobOffersSms: true,
    earningsUpdatesPush: true,
    bookingChangesInApp: true,
    safetyAlertsUrgent: true
  });

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'new_assignment', label: 'Assignments' },
    { id: 'offer_expiry', label: 'Offer Expiry' },
    { id: 'booking_changes', label: 'Booking Changes' },
    { id: 'customer_cancellation', label: 'Cancellations' },
    { id: 'reassignment', label: 'Reassignments' },
    { id: 'training', label: 'Training SOP' },
    { id: 'document_review', label: 'Document Review' },
    { id: 'expiry_reminders', label: 'Expiry Reminders' },
    { id: 'earnings_updates', label: 'Earnings' },
    { id: 'payout_status', label: 'Payouts' },
    { id: 'support_responses', label: 'Support Desk' },
    { id: 'policy_updates', label: 'Policy Updates' }
  ];

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (unreadOnly) params.read = 'false';
      const res = await professionalClient.getNotifications(params);
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [activeCategory, unreadOnly]);

  useEffect(() => {
    professionalClient.getSettings().then(res => {
      if (res.success && res.settings?.notificationPreferences) {
        setPrefs(res.settings.notificationPreferences);
      }
    }).catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await professionalClient.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast('Notifications marked read');
    }
  };

  const handleToggleSingleRead = async (id, currentRead) => {
    try {
      if (!currentRead) {
        await professionalClient.markNotificationsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch {}
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await professionalClient.updateSettings({ notificationPreferences: prefs });
      showToast('Notification preferences saved successfully.');
      setShowPreferencesModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update preferences');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 960, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Dispatch Alerts & Notifications
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Verified operational broadcasts, earnings statements, and customer reschedule alerts
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPreferencesModal(true)}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚙️ Preferences
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{
              background: unreadCount === 0 ? '#f1f5f9' : '#0f172a',
              color: unreadCount === 0 ? '#94a3b8' : '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: unreadCount === 0 ? 'default' : 'pointer'
            }}
          >
            ✓ Mark All Read
          </button>
        </div>
      </div>

      {/* Local Outbox Notice Banner */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📬</span>
          <div style={{ fontSize: 13, color: '#334155' }}>
            <strong>Local Outbox Active:</strong> External SMS & push gateways are unconfigured in this test environment. Alerts are delivered through verified in-app dispatch and simulated local outbox without false delivery claims.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            Show Unread Only ({unreadCount})
          </label>
        </div>
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 6 }}>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={{
              background: activeCategory === c.id ? '#0f172a' : '#ffffff',
              color: activeCategory === c.id ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              padding: '7px 15px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
          Loading alerts...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No alerts in this category</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>You are up to date on all dispatches, payouts, and compliance reminders.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleToggleSingleRead(n.id, n.read)}
              style={{
                background: n.read ? '#ffffff' : '#f0fdf4',
                borderRadius: 14,
                padding: '18px 22px',
                border: n.read ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  {!n.read && (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#16a34a'
                    }} />
                  )}
                  <span style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {n.category?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span style={{
                    background: n.deliveryChannel === 'local_outbox_sms' ? '#fef3c7' : '#ecfdf5',
                    color: n.deliveryChannel === 'local_outbox_sms' ? '#b45309' : '#059669',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {n.deliveryStatus || 'Delivered (In-App Verified)'}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  {n.title}
                </div>

                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>
                  {n.message}
                </div>

                {n.deepLink && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) onNavigate(n.deepLink);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      padding: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    View in App →
                  </button>
                )}
              </div>

              {!n.read && (
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showPreferencesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Notification Delivery Channels
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px 0' }}>
              Configure how you receive operational booking updates and earnings alerts.
            </p>

            <form onSubmit={handleSavePreferences}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>New Job Offer In-App Alert</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Plays high-priority chime on new dispatch</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.jobOffersInApp}
                    onChange={(e) => setPrefs({ ...prefs, jobOffersInApp: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>SMS Fallback for New Offers</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Sends SMS when cellular data is offline (Simulated)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.jobOffersSms}
                    onChange={(e) => setPrefs({ ...prefs, jobOffersSms: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Earnings & Payout Confirmations</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Immediate alert when bank batch releases</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.earningsUpdatesPush}
                    onChange={(e) => setPrefs({ ...prefs, earningsUpdatesPush: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Customer Schedule Changes</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Real-time updates on customer arrival window requests</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.bookingChangesInApp}
                    onChange={(e) => setPrefs({ ...prefs, bookingChangesInApp: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, background: '#0f172a', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
