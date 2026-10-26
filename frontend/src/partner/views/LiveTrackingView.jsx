import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, HardHat, Clock, AlertTriangle, 
  CheckCircle2, RefreshCw, Phone, ShieldCheck, ChevronRight,
  TrendingUp, Users, ArrowUpRight, Filter, Play
} from 'lucide-react';
import { partnerClient } from '../partnerClient';
import { LiveMapTracker } from '../../components/LiveMapTracker';

export function LiveTrackingView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [simulatingStep, setSimulatingStep] = useState(false);

  const storedPartner = partnerClient.getStoredPartner();
  const partnerId = storedPartner?.id || 'PTR-CHN-501';

  useEffect(() => {
    fetchPartnerOperations();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchPartnerOperations, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, partnerId]);

  async function fetchPartnerOperations() {
    try {
      // Query operations filtered to this partner agency
      const res = await fetch(`/api/tracking/operations/all?partnerId=${encodeURIComponent(partnerId)}`);
      const data = await res.json();
        const freshSessions = data.sessions || [];
        setSessions(freshSessions);
        setSelectedSession(prev => {
          if (!prev) return freshSessions[0] || null;
          const matching = freshSessions.find(s => s.id === prev.id || s.bookingId === prev.bookingId);
          return matching || prev;
        });
    } catch (err) {
      console.warn('Failed to fetch partner live operations:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateStep(bookingId) {
    if (!bookingId) return;
    setSimulatingStep(true);
    try {
      const res = await fetch(`/api/tracking/advance-step/${bookingId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Live GPS updated for booking ${bookingId}`);
        fetchPartnerOperations();
      }
    } catch (err) {
      showToast?.('Simulation error: ' + err.message);
    } finally {
      setSimulatingStep(false);
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}>
            <Navigation size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Live Fleet Tracking
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0 0' }}>
              Real-time GPS monitor for {storedPartner?.businessName || 'Business Partner'} technicians
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            color: '#475569',
            fontWeight: 600
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: autoRefresh ? '#10B981' : '#94A3B8',
              boxShadow: autoRefresh ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none'
            }} />
            <span>{autoRefresh ? 'Live GPS Stream' : 'Sync Paused'}</span>
          </div>

          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={14} className={autoRefresh ? 'spin' : ''} />
            <span>{autoRefresh ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Technician List & Live Road Map */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 380px) 1fr',
        gap: 20,
        minHeight: 540
      }}>
        {/* Left Column: Fleet List */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <strong style={{ fontSize: 13.5, color: '#0F172A' }}>
              Fleet Active on Bookings ({sessions.length})
            </strong>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                <HardHat size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No partner workers currently dispatched.</p>
                <p style={{ fontSize: 11.5, margin: '4px 0 0' }}>When your technicians receive and accept bookings, their live GPS updates appear here.</p>
              </div>
            ) : (
              sessions.map(s => {
                const isSelected = selectedSession?.bookingId === s.bookingId;
                return (
                  <div
                    key={s.id || s.bookingId}
                    onClick={() => setSelectedSession(s)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: isSelected ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                      background: isSelected ? '#FAF5FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: '#EDE9FE',
                          color: '#6D28D9',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {s.workerName?.slice(0, 2).toUpperCase() || 'PR'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {s.workerName}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {s.workerTrade}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10,
                        textTransform: 'uppercase',
                        background: s.status === 'en_route' ? '#EDE9FE' :
                                    s.status === 'arrived' ? '#FEF3C7' :
                                    s.status === 'in_progress' ? '#DCFCE7' : '#F1F5F9',
                        color: s.status === 'en_route' ? '#6D28D9' :
                               s.status === 'arrived' ? '#92400E' :
                               s.status === 'in_progress' ? '#166534' : '#475569'
                      }}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: 11.5, color: '#475569', marginTop: 8 }}>
                      Booking <strong>{s.bookingId}</strong> • {s.customerAddress?.split(',')[0]}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                      ETA: {s.remainingEtaMinutes} min • {s.remainingDistanceKm} km away
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Map View */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={16} color="#7C3AED" />
              <strong style={{ fontSize: 13.5, color: '#0F172A' }}>
                {selectedSession ? `Live Route: ${selectedSession.workerName}` : 'Select a technician to view live route'}
              </strong>
            </div>

            {selectedSession && (
              <button
                type="button"
                onClick={() => handleSimulateStep(selectedSession.bookingId)}
                disabled={simulatingStep}
                style={{
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Play size={12} fill="#FFFFFF" />
                <span>Simulate GPS Movement</span>
              </button>
            )}
          </div>

          {/* Real Live Map Tracker (Zomato & Swiggy Style) */}
          <div style={{ flex: 1, minHeight: 520 }}>
            <LiveMapTracker
              session={selectedSession}
              bookingId={selectedSession?.bookingId}
              height={560}
              showControls={true}
              onStepAdvanced={() => {
                fetchPartnerOperations();
                showToast?.(`Live GPS updated for ${selectedSession?.workerName || 'technician'}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
