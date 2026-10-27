import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  PhoneOff,
  ShieldCheck,
  Star,
  UserCheck,
  Calendar,
  MessageSquare,
  Send,
  Sparkles,
  Copy,
  Check,
  Navigation,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { LiveMapTracker } from './LiveMapTracker';
import { RapidoChatDrawer } from './RapidoChatDrawer';
import { useWebRtcVoiceCall } from '../utils/useWebRtcVoiceCall';
import { WebRtcCallModal } from './WebRtcCallModal';

export function OrderTrackingModal({ booking, onClose, onUpdateBookingStatus }) {
  // Stages:
  // 1: Confirmed (Safety PIN generated, order received)
  // 2: Partner Assigned (Rajesh Sharma assigned)
  // 3: On The Way 🛵 (Live GPS route, ETA countdown, moving scooter)
  // 4: Arrived at Doorstep 📍 (PIN verification prompt)
  // 5: Service In Progress ⚡ (Safety PIN verified, service elapsed timer)
  // 6: Service Completed 🎉 (Quality check, review rating, invoice)
  const initialStage = (booking?.status === 'Completed') ? 6
    : (booking?.status === 'In Progress') ? 5
    : (booking?.status === 'Arrived') ? 4
    : (booking?.status === 'En Route') ? 3
    : (booking?.assignedProfessional?.name || booking?.assignedPartner) ? 2
    : 1;
  const [stage, setStage] = useState(initialStage);

  // Real-time speed mode: 'normal' (standard countdown), 'fast' (auto-advance every 6-8s), 'manual'
  const [speedMode, setSpeedMode] = useState('normal');

  // Active countdown for Stage 3 (ETA in seconds)
  const [etaSeconds, setEtaSeconds] = useState(18 * 60 + 24); // 18 mins 24 secs

  // Active elapsed timer for Stage 5 (Service duration in seconds)
  const [serviceElapsed, setServiceElapsed] = useState(0);

  // Safety PIN state
  const safetyPin = booking?.safetyPin || '';
  const [copiedPin, setCopiedPin] = useState(false);

  // Responsive desktop detection for spacious 2-column layout
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 820 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 820);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active view tab: 'tracker' | 'partner' | 'invoice'
  const [activeTab, setActiveTab] = useState('tracker');

  // High-Fidelity WebRTC Voice Calling Hook (Free P2P Internet Voice)
  const webrtcVoice = useWebRtcVoiceCall({
    currentUserRole: 'customer',
    currentUserId: booking?.userId || booking?.userPhone || 'cust-user',
    currentBookingId: booking?.id
  });

  // Interactive Chat Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Review state for Stage 6
  const [userRating, setUserRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Backend authoritative tracking session
  const [trackingData, setTrackingData] = useState(null);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);

  // Live local booking state (synchronized via WebSockets)
  const [liveBooking, setLiveBooking] = useState(booking || {});

  // Synchronize with authoritative TrackingSession & SSE live stream
  useEffect(() => {
    if (!booking?.id) return;

    let isMounted = true;
    fetch(`/api/tracking/${booking.id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.tracking) {
          setTrackingData(data.tracking);
          if (data.tracking.remainingEtaMinutes != null) {
            setEtaSeconds(Math.max(60, data.tracking.remainingEtaMinutes * 60));
          }
          if (data.tracking.status === 'completed') setStage(6);
          else if (data.tracking.status === 'in_progress') setStage(5);
          else if (data.tracking.status === 'arrived') setStage(4);
          else if (data.tracking.status === 'en_route') setStage(3);
          else if (data.tracking.status === 'assigned') setStage(2);
        }
      })
      .catch(err => console.warn('Tracking fetch note:', err.message));

    // Connect SSE stream
    const eventSource = new EventSource(`/api/tracking/stream/${booking.id}`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'update' && payload.tracking) {
          if (!isMounted) return;
          const trk = payload.tracking;
          setTrackingData(trk);
          if (trk.remainingEtaMinutes != null) {
            setEtaSeconds(Math.max(60, trk.remainingEtaMinutes * 60));
          }
          if (trk.status === 'completed') setStage(6);
          else if (trk.status === 'in_progress') setStage(5);
          else if (trk.status === 'arrived') setStage(4);
          else if (trk.status === 'en_route') setStage(3);
          else if (trk.status === 'assigned') setStage(2);
        }
      } catch (e) {}
    };

    // Connect WebSocket room for assignment updates
    const socket = io();
    socket.emit('join:room', `booking:${booking.id}`);

    const handleBookingLiveEvent = (event) => {
      if (!event) return;
      const type = event.eventType || event.type;
      const payload = event.payload || {};

      if (type === 'ASSIGNMENT_ACCEPTED') {
        setLiveBooking(prev => ({
          ...prev,
          status: 'Assigned',
          assignmentStatus: 'ASSIGNED',
          assignedPartner: payload.proName,
          assignedProfessional: {
            id: payload.proId,
            name: payload.proName,
            phone: payload.proPhone,
            trade: payload.proTrade || prev?.serviceName
          }
        }));
        setStage(2);
      } else if (type === 'ASSIGNMENT_OFFERED') {
        setLiveBooking(prev => ({
          ...prev,
          assignmentStatus: 'OFFERED',
          offeredTo: {
            proName: payload.proName,
            timeoutSeconds: payload.timeoutSeconds
          }
        }));
      } else if (type === 'ASSIGNMENT_FAILED') {
        setLiveBooking(prev => ({
          ...prev,
          assignmentStatus: 'AWAITING_OWNER_ATTENTION'
        }));
      }
    };

    socket.on('realtime:event', handleBookingLiveEvent);
    socket.on('ASSIGNMENT_OFFERED', handleBookingLiveEvent);
    socket.on('ASSIGNMENT_ACCEPTED', handleBookingLiveEvent);
    socket.on('ASSIGNMENT_FAILED', handleBookingLiveEvent);

    return () => {
      isMounted = false;
      eventSource.close();
      socket.off('realtime:event', handleBookingLiveEvent);
      socket.off('ASSIGNMENT_OFFERED', handleBookingLiveEvent);
      socket.off('ASSIGNMENT_ACCEPTED', handleBookingLiveEvent);
      socket.off('ASSIGNMENT_FAILED', handleBookingLiveEvent);
      socket.disconnect();
    };
  }, [booking?.id]);

  // Handlers for real backend transitions
  async function handleVerifyPin() {
    try {
      const pinToVerify = trackingData?.safetyPin || safetyPin;
      const res = await fetch(`/api/tracking/verify-pin/${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify })
      });
      const data = await res.json();
      if (data.success) {
        setStage(5);
        onUpdateBookingStatus?.(booking.id, 'In Progress');
      } else {
        alert(data.message || 'PIN verification failed');
      }
    } catch (err) {
      setStage(5);
    }
  }

  async function handleCompleteService(ratingVal = 5) {
    try {
      const res = await fetch(`/api/tracking/complete-service/${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingVal, notes: 'Service completed thoroughly and sanitized.' })
      });
      const data = await res.json();
      if (data.success) {
        setStage(6);
        setRatingSubmitted(true);
        onUpdateBookingStatus?.(booking.id, 'Completed');
      }
    } catch (err) {
      setStage(6);
      setRatingSubmitted(true);
    }
  }

  async function handleSimulateGpsStep() {
    setIsSimulatingGps(true);
    try {
      const res = await fetch(`/api/tracking/advance-step/${booking.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.tracking) {
        setTrackingData(data.tracking);
        if (data.tracking.status === 'arrived') {
          setStage(4);
        }
      }
    } catch (err) {
      console.warn('GPS advance note:', err.message);
    } finally {
      setIsSimulatingGps(false);
    }
  }

  // 1. REAL-TIME TICKER EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      // Countdown for Stage 3
      if (stage === 3) {
        setEtaSeconds((prev) => {
          if (prev <= 1) {
            // Reached destination -> advance to stage 4
            setStage(4);
            return 0;
          }
          // In fast mode, decrease by 45 seconds per tick
          const step = speedMode === 'fast' ? 45 : 1;
          return Math.max(0, prev - step);
        });
      }

      // Elapsed count-up for Stage 5
      if (stage === 5) {
        setServiceElapsed((prev) => {
          const step = speedMode === 'fast' ? 20 : 1;
          const next = prev + step;
          if (speedMode === 'fast' && next >= 180) {
            // In fast demo, complete after ~3 mins
            setStage(6);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, speedMode]);

  // Real Privacy-Protected Free WebRTC Voice Calling Flow
  function handleInitiateCall() {
    webrtcVoice.initiateCall({
      bookingId: booking?.id,
      callerRole: 'customer',
      callerName: booking?.userName || 'Customer',
      peerName: proName || 'Technician'
    });
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isPartnerTyping, isChatOpen]);

  if (!booking) return null;

  // Formatting helpers
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatStopwatch = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Copy PIN
  const handleCopyPin = () => {
    navigator.clipboard?.writeText(safetyPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Send message to partner
  const handleSendMessage = (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    const userMsg = {
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Simulate partner response
    setIsPartnerTyping(true);
    setTimeout(() => {
      let reply = 'Got it, thank you! I will be there as scheduled.';
      if (msg.toLowerCase().includes('gate') || msg.toLowerCase().includes('call')) {
        reply = 'Understood! I will call your phone right as I enter the security gate.';
      } else if (msg.toLowerCase().includes('flat') || msg.toLowerCase().includes('floor') || msg.toLowerCase().includes('lift')) {
        reply = 'Noted! Coming straight to Flat 402 via the elevator.';
      } else if (msg.toLowerCase().includes('pin')) {
        reply = safetyPin ? `Thank you! I will verify PIN ${safetyPin} upon arrival.` : 'Thank you! I will verify with you upon arrival.';
      }
      setIsPartnerTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'partner',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1800);
  };

  // Authoritative live professional & tracking telemetry
  const hasAssignedPro = Boolean(trackingData?.workerName || liveBooking?.assignedProfessional?.name || liveBooking?.assignedPartner);
  const proName = trackingData?.workerName || liveBooking?.assignedProfessional?.name || liveBooking?.assignedPartner || '';
  const proTrade = trackingData?.workerTrade || liveBooking?.assignedProfessional?.trade || liveBooking?.serviceName || 'Home Service Specialist';
  const proRating = trackingData?.workerRating ?? liveBooking?.assignedProfessional?.rating ?? 4.9;
  const assignmentStatus = liveBooking?.assignmentStatus || (hasAssignedPro ? 'ASSIGNED' : 'UNASSIGNED');
  const activePin = trackingData?.safetyPin || safetyPin;

  // Calculated distance based on live telemetry or fallback
  const distanceKm = trackingData?.remainingDistanceKm != null
    ? trackingData.remainingDistanceKm.toFixed(1)
    : Math.max(0.1, ((etaSeconds / (18 * 60)) * 2.8)).toFixed(1);

  const totalWaypoints = trackingData?.routePolyline?.length || 15;
  const currentWaypoint = trackingData?.currentWaypointIndex || 0;
  const routeProgressPercent = trackingData?.routePolyline?.length
    ? Math.min(100, Math.max(8, Math.round((currentWaypoint / (totalWaypoints - 1)) * 100)))
    : Math.min(100, Math.max(8, Math.round(((18 * 60 - etaSeconds) / (18 * 60)) * 100)));

  return (
    <div
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="tracker-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: isDesktop ? 1080 : 540,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          height: isDesktop ? '88vh' : undefined,
          position: 'relative',
          transition: 'max-width 0.25s ease'
        }}
      >
        {/* =========================================================================
            1. STICKY MODAL HEADER (Full Width)
           ========================================================================= */}
        <div
          style={{
            background: stage === 6
              ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
              : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
            color: '#FFFFFF',
            padding: '16px 22px',
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>

          {/* Header Title & Order ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stage === 6 ? <CheckCircle2 size={22} color="#FFFFFF" /> : <Sparkles size={20} color="#FBBF24" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  {stage === 6 ? 'Service Completed 🎉' : 'Live Service Tracking'}
                </h2>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {stage === 3 ? 'En Route 🛵' : stage === 4 ? 'At Doorstep 📍' : stage === 5 ? 'Ongoing ⚡' : stage === 6 ? 'Finished' : 'Confirmed'}
                </span>
              </div>
              <p style={{ fontSize: 12, opacity: 0.85, margin: '2px 0 0 0' }}>
                Order #{booking.id || 'UC-78214'} • Total: <strong>₹{booking.totalAmount}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SPLIT BODY CONTAINER (2-Column Desktop / 1-Column Mobile)
           ========================================================================= */}
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* =========================================================================
              LEFT COLUMN: Telemetry, PIN, Pro Card, Tabs & Timeline (Scrollable)
             ========================================================================= */}
          <div style={{
            width: isDesktop ? 460 : '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: isDesktop ? '1px solid #E2E8F0' : 'none',
            background: '#FFFFFF',
            overflowY: 'auto',
            maxHeight: isDesktop ? '100%' : undefined
          }}>

            {/* 3. UNIFIED PARTNER CARD (Avatar, Rating & Dual Actions) */}
            {!hasAssignedPro ? (
              <div style={{
                padding: '16px 20px',
                background: assignmentStatus === 'AWAITING_OWNER_ATTENTION' ? '#FEF2F2' : '#F5F3FF',
                borderBottom: '1px solid #E2E8F0',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: assignmentStatus === 'AWAITING_OWNER_ATTENTION' ? '#FEE2E2' : '#EDE9FE',
                    color: assignmentStatus === 'AWAITING_OWNER_ATTENTION' ? '#DC2626' : '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    {assignmentStatus === 'AWAITING_OWNER_ATTENTION' ? '⚠️' : '⚡'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                      {assignmentStatus === 'OFFERED'
                        ? 'Waiting for professional acceptance...'
                        : assignmentStatus === 'AWAITING_OWNER_ATTENTION'
                        ? 'Operations desk prioritizing your booking'
                        : 'Finding your qualified professional...'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                      {assignmentStatus === 'OFFERED'
                        ? `Dispatch offer sent to a verified specialist nearby. Awaiting confirmation.`
                        : assignmentStatus === 'AWAITING_OWNER_ATTENTION'
                        ? 'Our operations desk is manually assigning a certified expert for your scheduled slot.'
                        : 'Matching with the highest-rated verified professional near your area.'}
                    </div>
                  </div>
                </div>

                {/* Disabled Call & Message Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    disabled
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#F1F5F9',
                      color: '#94A3B8',
                      border: '1px solid #E2E8F0',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'not-allowed'
                    }}
                  >
                    <MessageSquare size={13} />
                    <span>Chat (Available once assigned)</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: '#F1F5F9',
                      color: '#94A3B8',
                      border: '1px solid #E2E8F0',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'not-allowed'
                    }}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '12px 18px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                      alt={proName}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #6E42E5'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #FFFFFF'
                    }} title="Online" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {proName}
                      </span>
                      <span style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        Verified Pro
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#475569', marginTop: 2 }}>
                      {proRating > 0 ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#F59E0B', fontWeight: 800 }}>
                          <Star size={12} fill="#F59E0B" />
                          <span>{Number(proRating).toFixed(1)}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: 11 }}>★ New Professional</span>
                      )}
                      <span>• {proTrade}</span>
                      <span>• Live GPS Active</span>
                    </div>

                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {liveBooking?.serviceZone || liveBooking?.city || 'Direct Dispatch'} • Direct Home Service
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row: Message & Call */}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                      transition: 'opacity 0.15s'
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>Message Technician</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateCall}
                    title="Free Privacy-Protected WebRTC Voice Call (No phone number shared)"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: '#FFFFFF',
                      color: '#059669',
                      border: '1.5px solid #A7F3D0',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    <Phone size={14} />
                    <span>Call (Free)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. TABS (Live Tracker | Items & Invoice) */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              background: '#FFFFFF',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'tracker' ? 800 : 600,
                  color: activeTab === 'tracker' ? '#6E42E5' : '#64748B',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'tracker' ? '2px solid #6E42E5' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Live Tracking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('invoice')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'invoice' ? 800 : 600,
                  color: activeTab === 'invoice' ? '#6E42E5' : '#64748B',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'invoice' ? '2px solid #6E42E5' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Order Details & Invoice
              </button>
            </div>

            {/* 5. MAIN SCROLLABLE CONTENT BODY */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              {activeTab === 'tracker' ? (
                <>
                  {/* --- REAL-TIME STATUS HERO CARD --- */}
                  {stage === 3 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #DDD6FE'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 20 }}>🛵</span>
                          <strong style={{ fontSize: 14, color: '#5B21B6' }}>
                            Partner On The Way
                          </strong>
                        </div>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#6D28D9',
                          background: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: 20,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                          ⏱️ {formatTime(etaSeconds)}
                        </div>
                      </div>

                      <p style={{ fontSize: 12, color: '#6B21A8', margin: '0 0 10px 0' }}>
                        Estimated arrival at <strong>{booking.address ? booking.address.split(',')[1] || booking.address.split(',')[0] : 'your location'}</strong> ({distanceKm} km away)
                      </p>

                      {/* Animated Route Progress Bar */}
                      <div style={{ position: 'relative', width: '100%', height: 8, background: '#DDD6FE', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${routeProgressPercent}%`,
                          background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                          borderRadius: 4,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#7C3AED', marginTop: 4, fontWeight: 600 }}>
                        <span>Dispatched</span>
                        <span>{routeProgressPercent}% completed</span>
                        <span>Doorstep</span>
                      </div>

                      {/* Live GPS stream status */}
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(124, 58, 237, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6D28D9', fontWeight: 600 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                          <span>Live GPS Stream Connected</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {stage === 4 && (
                    <div style={{
                      background: '#FEF3C7',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #FDE68A'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>📍</span>
                        <div>
                          <strong style={{ fontSize: 14, color: '#92400E', display: 'block' }}>
                            Partner has arrived outside!
                          </strong>
                          <span style={{ fontSize: 12, color: '#B45309' }}>
                            {proName} is waiting at your doorstep with sanitized equipment.
                          </span>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 10,
                        padding: 10,
                        background: '#FFFFFF',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: 12, color: '#451A03', fontWeight: 600 }}>
                          Share Safety PIN: <strong style={{ letterSpacing: 2, fontSize: 14, color: '#1E40AF' }}>{activePin}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleVerifyPin}
                          style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Verify & Start Service
                        </button>
                      </div>
                    </div>
                  )}

                  {stage === 5 && (
                    <div style={{
                      background: '#F0FDF4',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #BBF7D0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 20 }}>⚡</span>
                          <strong style={{ fontSize: 14, color: '#166534' }}>
                            Service In Progress
                          </strong>
                        </div>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#15803D',
                          background: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontFamily: 'monospace',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                          ⏱️ {formatStopwatch(serviceElapsed)}
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>
                        {proName} is actively performing your service. All hygiene & safety protocols verified.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCompleteService(userRating)}
                        style={{
                          marginTop: 12,
                          background: '#15803D',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        Mark Job Completed ✓
                      </button>
                    </div>
                  )}

                  {stage === 6 && (
                    <div style={{
                      background: '#F0FDF4',
                      borderRadius: 14,
                      padding: 18,
                      border: '1px solid #BBF7D0',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: '#10B981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px'
                      }}>
                        <CheckCircle2 size={30} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#065F46', margin: '0 0 4px 0' }}>
                        Service Finished Successfully!
                      </h3>
                      <p style={{ fontSize: 12.5, color: '#047857', margin: '0 0 14px 0' }}>
                        Area thoroughly sanitized. Thank you for choosing Urban Company.
                      </p>

                      {/* Rating Stars */}
                      {!ratingSubmitted ? (
                        <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                            How was your experience with {proName}?
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setUserRating(star)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                              >
                                <Star
                                  size={24}
                                  fill={star <= userRating ? '#F59E0B' : '#E2E8F0'}
                                  color={star <= userRating ? '#F59E0B' : '#94A3B8'}
                                />
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCompleteService(userRating)}
                            style={{
                              background: '#6E42E5',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 16px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Submit {userRating}-Star Review
                          </button>
                        </div>
                      ) : (
                        <div style={{ background: '#ECFDF5', padding: 10, borderRadius: 8, fontSize: 12, color: '#065F46', fontWeight: 700 }}>
                          ✓ Thank you for rating {userRating} stars! {proName} appreciates your support.
                        </div>
                      )}
                    </div>
                  )}

                  {/* On Mobile Screens: Render Map Inline within Left/Main Column */}
                  {!isDesktop && (
                    <div style={{ marginBottom: 6 }}>
                      <LiveMapTracker
                        session={trackingData}
                        bookingId={booking?.id}
                        height={280}
                        showControls={false}
                        onStepAdvanced={(updated) => {
                          setTrackingData(updated);
                          if (updated?.status === 'arrived') {
                            setStage(4);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* --- DETAILED TIMELINE STAGES --- */}
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                      Live Status Updates
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Stage 1: Booking Placed */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#059669',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <CheckCircle2 size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                              Booking Placed & Slot Confirmed
                            </span>
                            <span style={{ fontSize: 11, color: '#64748B' }}>Done</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {booking.slot || 'Today, scheduled slot'}
                          </div>
                        </div>
                      </div>

                      {/* Stage 2: Partner Assigned */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: stage >= 2 ? '#059669' : '#E2E8F0',
                          color: stage >= 2 ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <UserCheck size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                              Master Partner Assigned
                            </span>
                            <span style={{ fontSize: 11, color: stage >= 2 ? '#059669' : '#94A3B8' }}>
                              {stage >= 2 ? 'Assigned' : 'Pending'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {proName} accepted this booking
                          </div>
                        </div>
                      </div>

                      {/* Stage 3: On The Way */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: stage >= 3 ? '#6E42E5' : '#E2E8F0',
                          color: stage >= 3 ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: stage === 3 ? '0 0 0 4px rgba(110, 66, 229, 0.2)' : 'none'
                        }}>
                          <Clock size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: stage >= 3 ? '#6E42E5' : '#0F172A' }}>
                              Partner On The Way 🛵
                            </span>
                            <span style={{ fontSize: 11, color: stage === 3 ? '#6E42E5' : stage > 3 ? '#059669' : '#94A3B8', fontWeight: 700 }}>
                              {stage === 3 ? `${formatTime(etaSeconds)}` : stage > 3 ? 'Arrived' : 'Upcoming'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {stage === 3 ? `En route (${distanceKm} km away)` : 'Dispatched to your address'}
                          </div>
                        </div>
                      </div>

                      {/* Stage 4: Arrived at Doorstep */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: stage >= 4 ? '#059669' : '#E2E8F0',
                          color: stage >= 4 ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <MapPin size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                              Arrived at Location
                            </span>
                            <span style={{ fontSize: 11, color: stage >= 4 ? '#059669' : '#94A3B8' }}>
                              {stage >= 4 ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {stage >= 4 ? 'Doorstep arrival verified' : 'Technician arrival at doorstep'}
                          </div>
                        </div>
                      </div>

                      {/* Stage 5: In Progress */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: stage >= 5 ? '#059669' : '#E2E8F0',
                          color: stage >= 5 ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Sparkles size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                              Service Execution
                            </span>
                            <span style={{ fontSize: 11, color: stage === 5 ? '#059669' : stage === 6 ? '#059669' : '#94A3B8', fontWeight: 700 }}>
                              {stage === 5 ? `Active (${formatStopwatch(serviceElapsed)})` : stage === 6 ? 'Done' : 'Upcoming'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            Senior partner executing requested services
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Box */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12,
                    color: '#475569'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <MapPin size={14} color="#6E42E5" />
                      <strong style={{ color: '#0F172A' }}>Service Location:</strong>
                    </div>
                    <div style={{ paddingLeft: 20 }}>{booking.address}</div>
                    {booking.notes && (
                      <div style={{ paddingLeft: 20, marginTop: 4, color: '#7C3AED', fontWeight: 600 }}>
                        Note: {booking.notes}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* --- INVOICE & ORDER SUMMARY TAB --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 12,
                    padding: 16,
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Services Booked</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>Qty & Price</span>
                    </div>

                    {booking.items && booking.items.length > 0 ? (
                      booking.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12.5 }}>
                          <span style={{ color: '#1E293B', fontWeight: 600 }}>{it.name} (x{it.qty})</span>
                          <strong style={{ color: '#0F172A' }}>₹{(it.price * it.qty).toLocaleString()}</strong>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12.5, color: '#64748B' }}>Urban Company Service Package</div>
                    )}

                    <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 14, color: '#0F172A' }}>Total Paid</strong>
                      <strong style={{ fontSize: 16, color: '#059669' }}>₹{booking.totalAmount}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#EFF6FF', borderRadius: 10, padding: 12, fontSize: 12, color: '#1E40AF' }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Payment Verified</div>
                    <div>Method: {booking.paymentMethod || 'ONLINE'} • Txn ID: {booking.transactionId || 'UC_TXN_98214'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. MODAL FOOTER ACTION (Docked at base of left column) */}
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              gap: 10,
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={onClose}
                className="proceed-checkout-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  fontSize: 13.5,
                  fontWeight: 800,
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9,
                  cursor: 'pointer'
                }}
              >
                Done & Return to Homepage
              </button>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN (Desktop Only): Dedicated Full-Height Live Map Tracker
             ========================================================================= */}
          {isDesktop && (
            <div style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              position: 'relative',
              background: '#F1F5F9',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <LiveMapTracker
                session={trackingData}
                bookingId={booking?.id}
                height="100%"
                showControls={false}
                onStepAdvanced={(updated) => {
                  setTrackingData(updated);
                  if (updated?.status === 'arrived') {
                    setStage(4);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* =========================================================================
            7. HIGH-FIDELITY FREE WEBRTC AUDIO CALL MODAL & INCOMING CALL PROMPT
           ========================================================================= */}
        <WebRtcCallModal
          callState={webrtcVoice.callState}
          callStatusText={webrtcVoice.callStatusText}
          callError={webrtcVoice.callError}
          callSeconds={webrtcVoice.callSeconds}
          formattedCallTime={webrtcVoice.formattedCallTime}
          isMuted={webrtcVoice.isMuted}
          isSpeaker={webrtcVoice.isSpeaker}
          activeCall={webrtcVoice.activeCall}
          incomingCall={webrtcVoice.incomingCall}
          onAccept={webrtcVoice.acceptCall}
          onReject={webrtcVoice.rejectCall}
          onToggleMute={webrtcVoice.toggleMute}
          onToggleSpeaker={webrtcVoice.toggleSpeaker}
          onEndCall={webrtcVoice.endCall}
          peerName={proName}
          peerRole="Verified Technician"
        />

        {/* =========================================================================
            8. RAPIDO-STYLE IN-APP CHAT (Real-Time SSE + MongoDB Persistence)
           ========================================================================= */}
        <RapidoChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          booking={booking}
          currentUser={{
            role: 'customer',
            id: booking?.userId || booking?.userPhone || 'cust-user',
            name: booking?.userName || 'Customer',
            phone: booking?.userPhone
          }}
        />
      </div>
    </div>
  );
}
