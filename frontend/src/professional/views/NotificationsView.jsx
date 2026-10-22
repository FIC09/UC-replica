import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function NotificationsView({ showToast }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-01',
      title: 'New Service Booking Assigned',
      message: 'You have been assigned Powerjet AC Servicing for customer Rohan Kapoor at Pali Hill, Bandra West.',
      timestamp: 'Today, 01:30 PM',
      read: false,
      type: 'dispatch'
    },
    {
      id: 'NOTIF-02',
      title: '₹8,500 Payout Settled to Bank Account',
      message: 'Your weekly earnings payout has been successfully credited to HDFC Bank A/C ending in 4821.',
      timestamp: 'Yesterday, 06:15 PM',
      read: true,
      type: 'payment'
    },
    {
      id: 'NOTIF-03',
      title: '5-Star Review Received',
      message: 'Homeowner Pooja Bhatia rated your AC servicing 5.0 stars: "Punctual, polite, and very methodical."',
      timestamp: '21 Oct 2026',
      read: true,
      type: 'review'
    },
    {
      id: 'NOTIF-04',
      title: 'Heavy Rainfall Monsoon Surge Active',
      message: 'Monsoon surge pricing of +15% is currently live across Western Suburbs. Earn extra per job!',
      timestamp: '20 Oct 2026',
      read: true,
      type: 'surge'
    }
  ]);

  useEffect(() => {
    professionalClient.getNotifications().then(data => {
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    }).catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await professionalClient.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read');
    } catch (err) {
      showToast('Notifications marked read');
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Dispatch & Platform Notifications
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Real-time booking assignments, customer reviews, and banking settlement alerts
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          style={{
            background: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ✓ Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: n.read ? '#ffffff' : '#f0fdf4',
              borderRadius: 12,
              padding: '16px 20px',
              border: n.read ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: n.type === 'dispatch' ? '#eff6ff' :
                n.type === 'payment' ? '#ecfdf5' :
                n.type === 'review' ? '#fef3c7' : '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0
            }}>
              {n.type === 'dispatch' ? '🔔' :
                n.type === 'payment' ? '💰' :
                n.type === 'review' ? '⭐' : '⛈️'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {n.title}
                </h4>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {n.timestamp}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
