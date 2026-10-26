import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, HardHat, Clock, AlertTriangle, 
  CheckCircle2, RefreshCw, Phone, ShieldCheck, ChevronRight,
  TrendingUp, Users, ArrowUpRight, Filter, Play
} from 'lucide-react';
import { LiveMapTracker } from '../../components/LiveMapTracker';

export function OperationsView({ onNavigate, onShowToast }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [simulatingStep, setSimulatingStep] = useState(false);

  useEffect(() => {
    fetchOperations();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchOperations, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  async function fetchOperations() {
    try {
      const res = await fetch('/api/tracking/operations/all');
      const data = await res.json();
      if (data.success) {
        const freshSessions = data.sessions || [];
        setSessions(freshSessions);
        setSelectedSession(prev => {
          if (!prev) return freshSessions[0] || null;
          const matching = freshSessions.find(s => s.id === prev.id || s.bookingId === prev.bookingId);
          return matching || prev;
        });
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('Failed to fetch tracking operations:', err.message);
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
        onShowToast?.(`Advanced worker GPS step for booking ${bookingId}`);
        fetchOperations();
      }
    } catch (err) {
      onShowToast?.('Simulation error: ' + err.message);
    } finally {
      setSimulatingStep(false);
    }
  }

  async function handleTriggerAutoAssign(bookingId) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/auto-assign`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onShowToast?.('Intelligent Auto-Assignment executed successfully!');
        fetchOperations();
      } else {
        onShowToast?.(data.message || 'Auto-assignment evaluation completed');
      }
    } catch (err) {
      onShowToast?.('Dispatch error: ' + err.message);
    }
  }

  const filteredSessions = sessions.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const enRouteCount = sessions.filter(s => s.status === 'en_route').length;
  const arrivedCount = sessions.filter(s => s.status === 'arrived').length;
  const inProgressCount = sessions.filter(s => s.status === 'in_progress').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
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
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Live Operations Center
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0 0' }}>
                Real-time GPS dispatch monitor, active technician tracking, and intelligent auto-assignment
              </p>
            </div>
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
            <span>{autoRefresh ? 'Live Telemetry Stream' : 'Paused'}</span>
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
            <span>{autoRefresh ? 'Pause Sync' : 'Resume Sync'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Active Tracking Sessions</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {sessions.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            Live authoritative feed
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Travelling to Customer</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#7C3AED', marginTop: 4 }}>
            {enRouteCount}
          </div>
          <div style={{ fontSize: 11.5, color: '#6D28D9', fontWeight: 600, marginTop: 4 }}>
            🛵 In Transit
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Arrived On-Site</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#D97706', marginTop: 4 }}>
            {arrivedCount}
          </div>
          <div style={{ fontSize: 11.5, color: '#B45309', fontWeight: 600, marginTop: 4 }}>
            📍 Awaiting PIN verify
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>In Progress</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {inProgressCount}
          </div>
          <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600, marginTop: 4 }}>
            ⚡ Active service
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Worker Dispatch List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 420px) 1fr',
        gap: 20,
        minHeight: 560
      }}>
        {/* Left Column: Worker Sessions List */}
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
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              Active Professionals ({filteredSessions.length})
            </span>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'en_route', 'arrived', 'in_progress'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  style={{
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === f ? '#7C3AED' : '#F1F5F9',
                    color: statusFilter === f ? '#FFFFFF' : '#64748B'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'en_route' ? 'En Route' : f === 'arrived' ? 'Arrived' : 'In Work'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                <Navigation size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No active tracking sessions found.</p>
                <p style={{ fontSize: 11.5, margin: '4px 0 0' }}>When a customer books in Chennai/Mumbai, worker assignment and GPS tracking appear here automatically.</p>
              </div>
            ) : (
              filteredSessions.map(session => {
                const isSelected = selectedSession?.bookingId === session.bookingId;
                return (
                  <div
                    key={session.id || session.bookingId}
                    onClick={() => setSelectedSession(session)}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: isSelected ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                      background: isSelected ? '#FAF5FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#E0E7FF',
                          color: '#4338CA',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {session.workerAvatar || session.workerName?.slice(0, 2).toUpperCase() || 'PRO'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {session.workerName}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {session.workerTrade || 'Service Professional'}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 12,
                        textTransform: 'uppercase',
                        background: session.status === 'en_route' ? '#EDE9FE' :
                                    session.status === 'arrived' ? '#FEF3C7' :
                                    session.status === 'in_progress' ? '#DCFCE7' : '#F1F5F9',
                        color: session.status === 'en_route' ? '#6D28D9' :
                               session.status === 'arrived' ? '#92400E' :
                               session.status === 'in_progress' ? '#166534' : '#475569'
                      }}>
                        {session.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4 }}>
                      Booking: <strong>{session.bookingId}</strong> • {session.customerName}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 8,
                      fontSize: 11,
                      color: '#64748B',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: 8
                    }}>
                      <span>📍 {session.customerAddress?.split(',')[0]}</span>
                      <span>⏱️ ETA: {session.remainingEtaMinutes || 5} min ({session.remainingDistanceKm || 0} km)</span>
                    </div>

                    {/* Quick Step Simulation Button */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateStep(session.bookingId);
                        }}
                        style={{
                          flex: 1,
                          padding: '5px 8px',
                          background: '#7C3AED',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <Play size={11} fill="#FFFFFF" />
                        <span>Simulate GPS Step</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live GPS Map Canvas & Telematics Inspector */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Map Header */}
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
                {selectedSession ? `Tracking: ${selectedSession.workerName} (${selectedSession.bookingId})` : 'Live Operations Map'}
              </strong>
            </div>

            {selectedSession && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: '#475569' }}>
                <span>GPS: <strong>{selectedSession.currentCoords?.lat?.toFixed(4)}, {selectedSession.currentCoords?.lng?.toFixed(4)}</strong></span>
                <span>Speed: <strong>{selectedSession.speed || 24} km/h</strong></span>
                <span>PIN: <strong style={{ color: '#1E40AF' }}>{selectedSession.safetyPin || '4829'}</strong></span>
              </div>
            )}
          </div>

          {/* Real Live Map Tracker (Zomato & Swiggy Style) */}
          <div style={{ flex: 1, minHeight: 520 }}>
            <LiveMapTracker
              session={selectedSession}
              bookingId={selectedSession?.bookingId}
              height={560}
              showControls={true}
              onStepAdvanced={(updatedTracking) => {
                if (updatedTracking) {
                  setSelectedSession(prev => ({ ...prev, ...updatedTracking }));
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
