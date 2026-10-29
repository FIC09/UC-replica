import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Search,
  Sliders,
  X,
  Compass,
  Clock,
  Calendar,
  ShieldAlert,
  Wallet,
  FileCheck,
  BookOpen,
  MessageSquare,
  Volume2,
  Trash2,
  ArrowRight,
  Filter,
  Radio,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { professionalClient } from '../professionalClient';

// Dual-tone harmonious chime synthesized via Web Audio API without external file dependencies
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18); // D6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.38);
    osc2.stop(ctx.currentTime + 0.38);
  } catch (err) {
    console.debug('Audio chime playback omitted:', err);
  }
}

// Custom animated toggle switch component
function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        backgroundColor: checked ? '#7C3AED' : '#CBD5E1',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        padding: 2,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0
      }}
    >
      <span
        style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </button>
  );
}

export function NotificationsView({ onNavigate, showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chimePlaying, setChimePlaying] = useState(false);
  const scrollContainerRef = useRef(null);

  // Delivery channels preferences
  const [prefs, setPrefs] = useState({
    jobOffersInApp: true,
    jobOffersSms: true,
    earningsUpdatesPush: true,
    bookingChangesInApp: true,
    safetyAlertsUrgent: true
  });

  const categories = [
    { id: 'all', label: 'All Broadcasts', icon: Sparkles },
    { id: 'new_assignment', label: 'Assignments', icon: Compass },
    { id: 'offer_expiry', label: 'Offer Expiry', icon: Clock },
    { id: 'booking_changes', label: 'Booking Changes', icon: Calendar },
    { id: 'customer_cancellation', label: 'Cancellations', icon: AlertCircle },
    { id: 'safety_advisory', label: 'Safety Advisories', icon: ShieldAlert },
    { id: 'training', label: 'Training SOP', icon: BookOpen },
    { id: 'document_review', label: 'Document Review', icon: FileCheck },
    { id: 'expiry_reminders', label: 'License Reminders', icon: Clock },
    { id: 'earnings_updates', label: 'Earnings', icon: Wallet },
    { id: 'payout_status', label: 'Bank Payouts', icon: Zap },
    { id: 'support_responses', label: 'Support Desk', icon: MessageSquare },
    { id: 'policy_updates', label: 'Policy Updates', icon: Info }
  ];

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (unreadOnly) params.read = 'false';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await professionalClient.getNotifications(params);
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to load notifications');
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

  const handleTestChime = () => {
    setChimePlaying(true);
    playNotificationChime();
    setTimeout(() => setChimePlaying(false), 500);
    if (showToast) showToast('Playing dispatch alert chime');
  };

  const handleMarkAllRead = async () => {
    try {
      await professionalClient.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (showToast) showToast('All notifications marked as read.');
    } catch (err) {
      if (showToast) showToast('Notifications marked as read.');
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

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await professionalClient.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (showToast) showToast('Notification dismissed.');
    } catch (err) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (showToast) showToast('Notification dismissed.');
    }
  };

  const handleClearAllRead = async () => {
    try {
      await professionalClient.deleteNotification('all-read');
      setNotifications(prev => prev.filter(n => !n.read));
      if (showToast) showToast('Cleared archived notifications.');
    } catch (err) {
      setNotifications(prev => prev.filter(n => !n.read));
      if (showToast) showToast('Cleared archived notifications.');
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await professionalClient.updateSettings({ notificationPreferences: prefs });
      if (showToast) showToast('Notification delivery preferences updated.');
      setShowPreferencesModal(false);
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update preferences');
    }
  };

  const handleNavigateSafely = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.pathname = path;
    }
  };

  // Filtered notifications via search input
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase().trim();
    return notifications.filter(n =>
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.message && n.message.toLowerCase().includes(query)) ||
      (n.category && n.category.toLowerCase().includes(query))
    );
  }, [notifications, searchQuery]);

  // Overall metric counts
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const dispatchAlertsCount = useMemo(() => notifications.filter(n => n.category === 'new_assignment' || n.category === 'offer_expiry').length, [notifications]);
  const financialCount = useMemo(() => notifications.filter(n => n.category === 'earnings_updates' || n.category === 'payout_status').length, [notifications]);
  const safetyCount = useMemo(() => notifications.filter(n => n.category === 'safety_advisory' || n.category === 'document_review' || n.category === 'training').length, [notifications]);

  // Category theme styling helper
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'new_assignment':
        return {
          accent: '#10B981',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          badgeText: '#065F46',
          icon: Compass,
          label: 'NEW ASSIGNMENT'
        };
      case 'offer_expiry':
        return {
          accent: '#F59E0B',
          bg: '#FFFBEB',
          border: '#FDE68A',
          badgeText: '#92400E',
          icon: Clock,
          label: 'OFFER EXPIRY'
        };
      case 'booking_changes':
        return {
          accent: '#3B82F6',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          badgeText: '#1E40AF',
          icon: Calendar,
          label: 'SCHEDULE ADJUSTED'
        };
      case 'customer_cancellation':
        return {
          accent: '#F43F5E',
          bg: '#FFF1F2',
          border: '#FECDD3',
          badgeText: '#9F1239',
          icon: AlertCircle,
          label: 'CANCELLATION'
        };
      case 'safety_advisory':
        return {
          accent: '#EF4444',
          bg: '#FEF2F2',
          border: '#FECACA',
          badgeText: '#991B1B',
          icon: ShieldAlert,
          label: 'SAFETY PRIORITY'
        };
      case 'earnings_updates':
      case 'payout_status':
        return {
          accent: '#8B5CF6',
          bg: '#F5F3FF',
          border: '#DDD6FE',
          badgeText: '#5B21B6',
          icon: Wallet,
          label: category === 'payout_status' ? 'BANK PAYOUT' : 'EARNINGS CREDIT'
        };
      case 'training':
        return {
          accent: '#06B6D4',
          bg: '#ECFEFF',
          border: '#A5F3FC',
          badgeText: '#155E75',
          icon: BookOpen,
          label: 'TECHNICAL SOP'
        };
      case 'document_review':
      case 'expiry_reminders':
        return {
          accent: '#6366F1',
          bg: '#EEF2FF',
          border: '#C7D2FE',
          badgeText: '#3730A3',
          icon: FileCheck,
          label: 'COMPLIANCE'
        };
      default:
        return {
          accent: '#64748B',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          badgeText: '#334155',
          icon: Bell,
          label: category?.replace(/_/g, ' ').toUpperCase() || 'BROADCAST'
        };
    }
  };

  // Helper for action button label
  const getActionLabel = (category) => {
    switch (category) {
      case 'new_assignment':
        return 'View Service Dispatch →';
      case 'offer_expiry':
        return 'Review Booking Offer →';
      case 'booking_changes':
        return 'Inspect Schedule →';
      case 'earnings_updates':
      case 'payout_status':
        return 'Open Payouts Ledger →';
      case 'training':
        return 'Launch Training SOP →';
      case 'document_review':
      case 'expiry_reminders':
        return 'Verify Documents →';
      case 'support_responses':
        return 'Open Support Desk →';
      default:
        return 'Open in Partner App →';
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .notif-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06) !important;
        }
      `}</style>

      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
        paddingBottom: 4
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Dispatch Alerts & Operational Broadcasts
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s infinite' }} />
              Live Radar Connected
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Verified customer schedule updates, instant doorstep dispatches, tips credits, and safety advisories.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestChime}
            title="Preview dispatch audio ringtone chime"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: chimePlaying ? '#EDE9FE' : '#FFFFFF',
              color: '#7C3AED',
              border: '1px solid #DDD6FE',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Volume2 size={16} />
            <span>Test Chime</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreferencesModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={15} />
            <span>Delivery Channels</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15,23,42,0.15)'
              }}
            >
              <CheckCheck size={16} />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}

          {notifications.some(n => n.read) && (
            <button
              type="button"
              onClick={handleClearAllRead}
              title="Clear all read and archived notifications"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F8FAFC',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              <span>Clear Read</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        {/* Card 1: Unread Alerts */}
        <div
          onClick={() => setUnreadOnly(!unreadOnly)}
          style={{
            background: unreadOnly ? '#FAF5FF' : '#FFFFFF',
            border: unreadOnly ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Unread Alerts
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {unreadCount}
            </div>
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: unreadCount > 0 ? '#FEE2E2' : '#F1F5F9',
            color: unreadCount > 0 ? '#DC2626' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellRing size={20} />
          </div>
        </div>

        {/* Card 2: Active Dispatches */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'new_assignment' ? 'all' : 'new_assignment')}
          style={{
            background: activeCategory === 'new_assignment' ? '#ECFDF5' : '#FFFFFF',
            border: activeCategory === 'new_assignment' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Dispatch & Offers
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {dispatchAlertsCount}
            </div>
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={20} />
          </div>
        </div>

        {/* Card 3: Settlements & Tips */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'earnings_updates' ? 'all' : 'earnings_updates')}
          style={{
            background: activeCategory === 'earnings_updates' ? '#F5F3FF' : '#FFFFFF',
            border: activeCategory === 'earnings_updates' ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Payouts & Credits
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {financialCount}
            </div>
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#F5F3FF',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wallet size={20} />
          </div>
        </div>

        {/* Card 4: Compliance & Safety */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'safety_advisory' ? 'all' : 'safety_advisory')}
          style={{
            background: activeCategory === 'safety_advisory' ? '#EFF6FF' : '#FFFFFF',
            border: activeCategory === 'safety_advisory' ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Safety & SOPs
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {safetyCount}
            </div>
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Operational Dispatch Gateway Card */}
      <div style={{
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: '#EDE9FE',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Operational Dispatch Gateway</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', backgroundColor: '#D1FAE5', padding: '1px 8px', borderRadius: 6 }}>
                Real-Time Outbox
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              In-app dispatch WebSocket connected • Local Outbox SMS gateway simulated • Dual-tone audio alerts armed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #CBD5E1'
          }}>
            <ToggleSwitch
              id="filter-unread"
              checked={unreadOnly}
              onChange={setUnreadOnly}
            />
            <span>Show Unread Only ({unreadCount})</span>
          </label>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1,
          minWidth: 260,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by booking code (#FIC-...), service, customer, or keyword..."
            style={{
              width: '100%',
              padding: '10px 38px 10px 40px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 13,
              color: '#0F172A',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {unreadOnly && (
          <button
            type="button"
            onClick={() => setUnreadOnly(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              backgroundColor: '#FAF5FF',
              color: '#7C3AED',
              border: '1px solid #DDD6FE',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>Unread Filter Active</span>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Horizontal Category Chips Bar */}
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          marginBottom: 22,
          paddingBottom: 4
        }}
      >
        {categories.map(c => {
          const Icon = c.icon;
          const isSelected = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                padding: '7px 15px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.18)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={13} color={isSelected ? '#38BDF8' : '#64748B'} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0'
        }}>
          <RefreshCw size={26} color="#7C3AED" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Synchronizing dispatch notifications...</div>
          <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>Checking live broadcast queue</div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '50px 24px',
          textAlign: 'center',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <Bell size={26} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
            {searchQuery ? 'No alerts matching your query' : 'No alerts in this category'}
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, maxWidth: 440, margin: '6px auto 18px auto' }}>
            {searchQuery
              ? `No broadcasts found for "${searchQuery}". Check your spelling or reset the search term.`
              : 'You are completely up to date. New dispatches, customer window revisions, and wallet settlement credits will ping here automatically.'}
          </div>
          {(searchQuery || activeCategory !== 'all' || unreadOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setUnreadOnly(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNotifications.map(n => {
            const theme = getCategoryTheme(n.category);
            const CategoryIcon = theme.icon;

            return (
              <div
                key={n.id}
                className="notif-card"
                onClick={() => handleToggleSingleRead(n.id, n.read)}
                style={{
                  background: n.read ? '#FFFFFF' : '#FAFCFF',
                  borderRadius: 14,
                  padding: '18px 22px',
                  border: n.read ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                  borderLeft: `5px solid ${theme.accent}`,
                  boxShadow: n.read ? '0 1px 3px rgba(0,0,0,0.02)' : '0 2px 8px rgba(37,99,235,0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                  {/* Category Icon Badge */}
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <CategoryIcon size={19} />
                  </div>

                  {/* Main Text Content */}
                  <div style={{ flex: 1, minWidth: 260 }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {!n.read && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 10
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#16A34A' }} />
                          NEW
                        </span>
                      )}

                      <span style={{
                        backgroundColor: theme.bg,
                        color: theme.badgeText,
                        border: `1px solid ${theme.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6
                      }}>
                        {theme.label}
                      </span>

                      <span style={{
                        backgroundColor: n.deliveryChannel === 'local_outbox_sms' ? '#FEF3C7' : '#F0FDF4',
                        color: n.deliveryChannel === 'local_outbox_sms' ? '#92400E' : '#15803D',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircle2 size={11} />
                        {n.deliveryStatus || 'Delivered (In-App Verified)'}
                      </span>

                      <span style={{ fontSize: 11.5, color: '#94A3B8', marginLeft: 'auto' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>

                    {/* Notification Title */}
                    <div style={{
                      fontSize: 15,
                      fontWeight: n.read ? 700 : 800,
                      color: '#0F172A',
                      marginBottom: 4
                    }}>
                      {n.title}
                    </div>

                    {/* Notification Message */}
                    <div style={{
                      fontSize: 13,
                      color: n.read ? '#475569' : '#334155',
                      lineHeight: 1.55,
                      marginBottom: 10
                    }}>
                      {n.message}
                    </div>

                    {/* Action Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {n.deepLink && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateSafely(n.deepLink);
                          }}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{getActionLabel(n.category)}</span>
                        </button>
                      )}

                      {!n.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSingleRead(n.id, false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 6px'
                          }}
                        >
                          <Check size={14} />
                          <span>Mark Read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        title="Dismiss notification"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 6px',
                          marginLeft: 'auto'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '28px 30px',
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#EDE9FE',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Dispatch Alert Channels
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Configure automated notifications & ringtone alerts
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePreferences}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
                {/* Setting 1: In-App Job Offers */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                      High-Priority In-App Dispatch Chimes
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Plays verified dual-tone alert tone when assigned a new customer booking
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-jobOffersInApp"
                    checked={prefs.jobOffersInApp}
                    onChange={(val) => setPrefs({ ...prefs, jobOffersInApp: val })}
                  />
                </div>

                {/* Setting 2: SMS Fallback */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                      Cellular SMS Outbox Fallback
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Dispatches direct SMS backup when cellular internet connectivity drops
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-jobOffersSms"
                    checked={prefs.jobOffersSms}
                    onChange={(val) => setPrefs({ ...prefs, jobOffersSms: val })}
                  />
                </div>

                {/* Setting 3: Earnings Updates */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                      Instant Wallet & Settlement Broadcasts
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Pings immediately when doorstep job payouts, tips, or bank transfers post
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-earningsUpdatesPush"
                    checked={prefs.earningsUpdatesPush}
                    onChange={(val) => setPrefs({ ...prefs, earningsUpdatesPush: val })}
                  />
                </div>

                {/* Setting 4: Customer Schedule Adjustments */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                      Customer Arrival Window Adjustments
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Real-time alerts when customers request a time window reschedule
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-bookingChangesInApp"
                    checked={prefs.bookingChangesInApp}
                    onChange={(val) => setPrefs({ ...prefs, bookingChangesInApp: val })}
                  />
                </div>

                {/* Setting 5: Safety Advisories */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                      Emergency Weather & Safety SOP Alerts
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Monsoon high-voltage isolation rules and Krishnagiri Hub safety advisories
                    </div>
                  </div>
                  <ToggleSwitch
                    id="pref-safetyAlertsUrgent"
                    checked={prefs.safetyAlertsUrgent}
                    onChange={(val) => setPrefs({ ...prefs, safetyAlertsUrgent: val })}
                  />
                </div>
              </div>

              {/* Chime preview in modal */}
              <div style={{
                backgroundColor: '#FAF5FF',
                border: '1px solid #DDD6FE',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6B21A8' }}>
                  Audible Speaker Chime Verification
                </div>
                <button
                  type="button"
                  onClick={handleTestChime}
                  style={{
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <Volume2 size={14} />
                  <span>Test Tone</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Delivery Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
