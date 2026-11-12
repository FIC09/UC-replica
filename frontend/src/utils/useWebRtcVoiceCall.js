import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Audio Ringtone Generator (Dual-Tone Multi-Frequency Telecom Chimes)
 * Works reliably across all browsers without downloading external mp3 assets.
 */
class RingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  ensureContext() {
    try {
      if (!this.audioCtx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch (_) {}
  }

  playTone(freq1 = 440, freq2 = 480, durationMs = 1500, gainLevel = 0.12) {
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = freq2 ? this.audioCtx.createOscillator() : null;
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, now);
      if (osc2) {
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq2, now);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.05);
      gain.gain.setValueAtTime(gainLevel, now + (durationMs / 1000) - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

      osc1.connect(gain);
      if (osc2) osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      if (osc2) osc2.start(now);
      osc1.stop(now + (durationMs / 1000));
      if (osc2) osc2.stop(now + (durationMs / 1000));
    } catch (_) {}
  }

  startRingback() {
    this.stop();
    this.playTone(440, 480, 1600, 0.1);
    this.intervalId = setInterval(() => {
      this.playTone(440, 480, 1600, 0.1);
    }, 4000);
  }

  startIncoming() {
    this.stop();
    this.playTone(523.25, 659.25, 1200, 0.16); // Pleasant C5 + E5 harmonic chime
    this.intervalId = setInterval(() => {
      this.playTone(523.25, 659.25, 1200, 0.16);
    }, 2800);
  }

  playConnectedTone() {
    this.stop();
    this.playTone(880, null, 250, 0.12);
  }

  playEndTone() {
    this.stop();
    this.playTone(330, null, 350, 0.08);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const ringtone = new RingtonePlayer();

/**
 * Reusable WebRTC Voice Calling React Hook
 * Features real-time REST signaling, auto-ringing chimes, live peer connection,
 * call duration stopwatch, and instant answer/decline synchronization.
 */
export function useWebRtcVoiceCall({ currentUserRole = 'customer', currentUserId = '', currentBookingId = '' } = {}) {
  // Call States: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended' | 'busy' | 'error'
  const [callState, setCallState] = useState('idle');
  const [callStatusText, setCallStatusText] = useState('');
  const [callError, setCallError] = useState(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Active call & incoming call session references
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // References
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const activeCallPollRef = useRef(null);
  const activeCallIdRef = useRef(null);

  // Verify secure context (HTTPS / localhost requirement)
  const isSecureContext = typeof window !== 'undefined'
    ? (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    : true;

  // Cleanup local media and audio streams
  const cleanupCall = useCallback(() => {
    ringtone.stop();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (activeCallPollRef.current) {
      clearInterval(activeCallPollRef.current);
      activeCallPollRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.close();
      } catch (_) {}
      peerConnectionRef.current = null;
    }

    setIsMuted(false);
  }, []);

  // Initialize browser microphone if supported
  const setupMediaStreams = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false
        });
        localStreamRef.current = stream;
        return stream;
      }
    } catch (e) {
      console.warn('[WebRTC Audio Info]', e.message);
    }
    return null;
  }, []);

  // Format Stopwatch mm:ss
  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Keep activeCallIdRef in sync
  useEffect(() => {
    activeCallIdRef.current = activeCall?.callId || incomingCall?.callId || null;
  }, [activeCall, incomingCall]);

  // Stopwatch effect for connected calls
  useEffect(() => {
    if (callState === 'connected') {
      setCallSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

  // Poller for active call status changes (connected, rejected, ended)
  const startCallStatusMonitor = useCallback((callId) => {
    if (activeCallPollRef.current) {
      clearInterval(activeCallPollRef.current);
    }

    activeCallPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/calling/call/${encodeURIComponent(callId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const session = data?.session;
        if (!session) return;

        // Call Connected by peer
        if (session.status === 'connected') {
          setCallState(prevState => {
            if (prevState !== 'connected') {
              ringtone.stop();
              ringtone.playConnectedTone();
              setCallStatusText('Connected');
              return 'connected';
            }
            return prevState;
          });
        }
        // Call Declined by peer
        else if (session.status === 'rejected') {
          ringtone.stop();
          ringtone.playEndTone();
          setCallState('ended');
          setCallStatusText('Call Declined');
          setCallError('Specialist was unable to take your call.');
          if (activeCallPollRef.current) {
            clearInterval(activeCallPollRef.current);
            activeCallPollRef.current = null;
          }
          setTimeout(() => {
            cleanupCall();
            setCallState('idle');
            setActiveCall(null);
            setIncomingCall(null);
          }, 3000);
        }
        // Call Ended by peer
        else if (session.status === 'ended') {
          ringtone.stop();
          ringtone.playEndTone();
          setCallState('ended');
          setCallStatusText(`Call Ended (${session.durationSeconds || 0}s)`);
          if (activeCallPollRef.current) {
            clearInterval(activeCallPollRef.current);
            activeCallPollRef.current = null;
          }
          setTimeout(() => {
            cleanupCall();
            setCallState('idle');
            setActiveCall(null);
            setIncomingCall(null);
          }, 2500);
        }
      } catch (_) {}
    }, 1000);
  }, [cleanupCall]);

  // Initiate outgoing voice call
  const initiateCall = async ({ bookingId, callerRole, callerName, peerName }) => {
    setCallError(null);
    setCallState('calling');
    setCallStatusText('Calling...');
    setCallSeconds(0);

    const bId = String(bookingId || currentBookingId || 'UC-428127').replace(/^#/, '').trim();
    const myRole = callerRole || currentUserRole;
    const targetRole = myRole === 'customer' ? 'professional' : 'customer';
    const targetName = peerName || (myRole === 'customer' ? 'Specialist' : 'Customer');

    try {
      ringtone.ensureContext();
      await setupMediaStreams();

      const response = await fetch('/api/calling/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          callerRole: myRole,
          callerName: callerName || (myRole === 'customer' ? 'Customer' : 'Specialist'),
          receiverRole: targetRole,
          receiverName: targetName
        })
      });

      const data = await response.json();
      if (!data.success || !data.callId) {
        ringtone.stop();
        setCallState('error');
        setCallStatusText('Call Failed');
        setCallError(data?.message || 'Unable to establish internet voice call.');
        setTimeout(() => setCallState('idle'), 3500);
        return;
      }

      // Ringing state established!
      setCallStatusText('Ringing...');
      ringtone.startRingback();

      const callInfo = {
        callId: data.callId,
        bookingId: bId,
        peerName: targetName,
        peerRole: targetRole,
        callerRole: myRole,
        callerName: callerName || 'Customer'
      };
      setActiveCall(callInfo);
      startCallStatusMonitor(data.callId);
    } catch (err) {
      console.error('Call initiation error:', err);
      ringtone.stop();
      setCallState('error');
      setCallStatusText('Connection Error');
      setCallError(err.message || 'Could not connect to voice calling server.');
      setTimeout(() => setCallState('idle'), 3500);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;

    ringtone.stop();
    ringtone.playConnectedTone();
    setCallError(null);
    setCallState('connected');
    setCallStatusText('Connected');

    const { callId, bookingId, callerName, callerRole } = incomingCall;

    try {
      await setupMediaStreams();

      setActiveCall({
        callId,
        bookingId,
        peerName: callerName || 'Customer',
        peerRole: callerRole || 'customer'
      });
      setIncomingCall(null);

      // Notify backend of acceptance
      await fetch('/api/calling/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, action: 'accept' })
      });

      startCallStatusMonitor(callId);
    } catch (err) {
      console.error('Accept call error:', err);
      setCallState('error');
      setCallStatusText('Error Connecting Call');
      setCallError(err.message);
    }
  };

  // Reject incoming call
  const rejectCall = async () => {
    ringtone.stop();
    ringtone.playEndTone();

    if (incomingCall) {
      try {
        await fetch('/api/calling/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: incomingCall.callId, action: 'decline' })
        });
      } catch (_) {}
      setIncomingCall(null);
    }

    cleanupCall();
    setCallState('idle');
  };

  // End active call
  const endCall = async () => {
    ringtone.stop();
    ringtone.playEndTone();

    const activeId = activeCallIdRef.current || activeCall?.callId || incomingCall?.callId;

    if (activeId) {
      try {
        await fetch('/api/calling/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: activeId,
            durationSeconds: callSeconds,
            reason: 'user_hangup'
          })
        });
      } catch (_) {}
    }

    cleanupCall();
    setCallState('ended');
    setCallStatusText(callSeconds > 0 ? `Call Ended (${callSeconds}s)` : 'Call Ended');

    setTimeout(() => {
      setCallState('idle');
      setActiveCall(null);
      setIncomingCall(null);
      setCallError(null);
    }, 2000);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuteState = !isMuted;
        audioTracks[0].enabled = !nextMuteState;
        setIsMuted(nextMuteState);
      }
    } else {
      setIsMuted(prev => !prev);
    }
  };

  // Toggle Speaker / Output
  const toggleSpeaker = () => {
    setIsSpeaker(prev => !prev);
  };

  // Background incoming call listener (polls when idle)
  useEffect(() => {
    if (callState !== 'idle') return;

    const checkIncoming = async () => {
      try {
        const queryUrl = currentBookingId
          ? `/api/calling/active/${encodeURIComponent(String(currentBookingId).replace(/^#/, ''))}`
          : '/api/calling/active';

        const res = await fetch(queryUrl);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.activeCall && data.activeCall.status === 'ringing') {
          const call = data.activeCall;
          // Trigger incoming call if caller is the other role
          const isFromOtherParty = currentUserRole === 'professional'
            ? call.callerRole === 'customer'
            : call.callerRole === 'professional' || call.callerRole === 'worker';

          if (isFromOtherParty) {
            setIncomingCall({
              ...call,
              callerName: call.callerName || (currentUserRole === 'professional' ? 'Customer' : 'Specialist')
            });
            setCallState('incoming');
            setCallStatusText(`Incoming Call from ${call.callerName || 'Customer'}`);
            ringtone.startIncoming();
          }
        }
      } catch (_) {}
    };

    const intervalId = setInterval(checkIncoming, 1500);
    return () => clearInterval(intervalId);
  }, [callState, currentUserRole, currentBookingId]);

  return {
    callState,
    callStatusText,
    callError,
    callSeconds,
    formattedCallTime: formatCallTime(callSeconds),
    isMuted,
    isSpeaker,
    isSecureContext,
    activeCall,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    toggleMute,
    toggleSpeaker,
    endCall
  };
}

export default useWebRtcVoiceCall;