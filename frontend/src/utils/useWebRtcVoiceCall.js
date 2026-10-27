import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../api/socketClient';

/**
 * Web Audio Ringtone Generator (Dual-Tone Multi-Frequency Telecom Chimes)
 * Works reliably without downloading external mp3 assets.
 */
class RingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playRingTone(freq1 = 440, freq2 = 480, durationMs = 1500) {
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, now);
      osc2.frequency.setValueAtTime(freq2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
      gain.gain.setValueAtTime(0.12, now + (durationMs / 1000) - 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + (durationMs / 1000));
      osc2.stop(now + (durationMs / 1000));
    } catch (e) {
      // Audio context may require user gesture on some browsers
    }
  }

  startRingback() {
    this.stop();
    this.playRingTone(440, 480, 1600);
    this.intervalId = setInterval(() => {
      this.playRingTone(440, 480, 1600);
    }, 4000);
  }

  startIncoming() {
    this.stop();
    this.playRingTone(523.25, 659.25, 1200); // C5 & E5 pleasant chime
    this.intervalId = setInterval(() => {
      this.playRingTone(523.25, 659.25, 1200);
    }, 3000);
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
 * Handles peer connection, microphone permissions, signaling exchange,
 * ringing state, mute/unmute, and MongoDB session tracking.
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
  const iceCandidatesQueueRef = useRef([]);

  // Verify secure context (HTTPS requirement)
  const isSecureContext = typeof window !== 'undefined'
    ? (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    : true;

  // Cleanup helper
  const cleanupCall = useCallback(() => {
    ringtone.stop();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    iceCandidatesQueueRef.current = [];
    setIsMuted(false);
  }, []);

  // Fetch ICE server configuration from backend
  const fetchIceServers = useCallback(async () => {
    try {
      const res = await fetch('/api/calling/ice-servers');
      const data = await res.json();
      if (data.success && Array.isArray(data.iceServers)) {
        return data.iceServers;
      }
    } catch (err) {
      console.warn('[WebRTC] Falling back to default public STUN servers:', err.message);
    }
    return [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
    ];
  }, []);

  // Initialize RTCPeerConnection with local audio stream
  const createPeerConnection = useCallback(async (callId, bookingId) => {
    cleanupCall();

    if (!isSecureContext) {
      throw new Error('Microphone access requires HTTPS in production environments. Please access via HTTPS or localhost.');
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('WebRTC Voice Calling is not supported by your browser or microphone device.');
    }

    // 1. Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });
    localStreamRef.current = stream;

    // 2. Fetch ICE Servers configuration
    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 2
    });
    peerConnectionRef.current = pc;

    // 3. Attach local audio track to connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // 4. Handle incoming remote audio stream
    pc.ontrack = (event) => {
      console.log('🔊 [WebRTC] Remote audio track received!');
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(e => console.warn('Audio autoPlay notice:', e.message));
      }
    };

    // 5. Send ICE candidates via Socket.IO
    const socket = getSocket();
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && socket.connected) {
        socket.emit('webrtc_ice_candidate', {
          callId,
          bookingId,
          candidate: event.candidate
        });
      }
    };

    // 6. Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔗 [WebRTC] Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        ringtone.stop();
        setCallState('connected');
        setCallStatusText('Connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn('🔗 [WebRTC] Peer connection lost/disconnected');
      }
    };

    return pc;
  }, [cleanupCall, fetchIceServers, isSecureContext]);

  // Setup Remote Audio Element in DOM
  useEffect(() => {
    let audioEl = document.getElementById('webrtc-remote-audio-player');
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'webrtc-remote-audio-player';
      audioEl.autoplay = true;
      audioEl.playsInline = true;
      audioEl.style.display = 'none';
      document.body.appendChild(audioEl);
    }
    remoteAudioRef.current = audioEl;

    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

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

  // Socket.IO signaling event listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Incoming Call Notification
    const handleIncomingCall = (payload) => {
      console.log('📞 [WebRTC Hook] Received incoming call:', payload);
      // Only handle if currently idle and if matching booking or role
      if (callState === 'idle') {
        setIncomingCall(payload);
        setCallState('incoming');
        setCallStatusText(`Incoming Call from ${payload.callerName || 'Participant'}`);
        ringtone.startIncoming();
      }
    };

    // Call Initiated (Ringing) Confirmation
    const handleCallInitiated = (payload) => {
      console.log('🔔 [WebRTC Hook] Call initiated acknowledged by server:', payload);
      setCallState('calling');
      setCallStatusText('Ringing...');
      ringtone.startRingback();
    };

    // Call Accepted by Peer -> Initiator creates SDP Offer
    const handleCallAccepted = async (payload) => {
      console.log('🤝 [WebRTC Hook] Call accepted! Creating SDP offer...');
      ringtone.stop();
      setCallState('connected');
      setCallStatusText('Connecting Audio...');

      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            voiceActivityDetection: true
          });
          await pc.setLocalDescription(offer);

          socket.emit('webrtc_signal_offer', {
            callId: payload.callId,
            bookingId: payload.bookingId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('Error creating SDP offer:', err);
        setCallError('Audio negotiation failed: ' + err.message);
      }
    };

    // Peer Received SDP Offer -> Creates SDP Answer
    const handleSignalOffer = async (payload) => {
      console.log('📨 [WebRTC Hook] Received SDP Offer from peer');
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

          // Drain queued ICE candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const cand = iceCandidatesQueueRef.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc_signal_answer', {
            callId: payload.callId,
            bookingId: payload.bookingId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('Error answering SDP offer:', err);
      }
    };

    // Initiator Received SDP Answer -> WebRTC P2P Audio Ready
    const handleSignalAnswer = async (payload) => {
      console.log('📨 [WebRTC Hook] Received SDP Answer from peer');
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

          // Drain queued ICE candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const cand = iceCandidatesQueueRef.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error setting remote description:', err);
      }
    };

    // Incoming ICE Candidate
    const handleIceCandidate = async (payload) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else {
          iceCandidatesQueueRef.current.push(payload.candidate);
        }
      } catch (err) {
        console.warn('ICE candidate addition notice:', err.message);
      }
    };

    // Call Rejected
    const handleCallRejected = (payload) => {
      console.log('🚫 [WebRTC Hook] Call rejected:', payload.reason);
      ringtone.stop();
      setCallState('ended');
      setCallStatusText('Call Declined');
      setCallError(payload.reason === 'busy' ? 'User is busy on another call' : 'Technician was unable to take your call');
      setTimeout(() => {
        cleanupCall();
        setCallState('idle');
      }, 3500);
    };

    // Call Timeout (30s)
    const handleCallTimeout = () => {
      console.log('⏰ [WebRTC Hook] Call timed out (no answer)');
      ringtone.stop();
      setCallState('ended');
      setCallStatusText('No Answer (Missed Call)');
      setTimeout(() => {
        cleanupCall();
        setCallState('idle');
      }, 3500);
    };

    // Call Busy
    const handleCallBusy = () => {
      console.log('⚠️ [WebRTC Hook] Call busy');
      ringtone.stop();
      setCallState('busy');
      setCallStatusText('Line Busy');
      setCallError('The other party is currently in an active voice call.');
      setTimeout(() => {
        cleanupCall();
        setCallState('idle');
      }, 4000);
    };

    // Call Ended by Peer
    const handleCallEnded = (payload) => {
      console.log('📴 [WebRTC Hook] Call ended by peer:', payload);
      ringtone.stop();
      setCallState('ended');
      setCallStatusText(`Call Ended (${payload.durationSeconds || 0}s)`);
      setTimeout(() => {
        cleanupCall();
        setCallState('idle');
        setActiveCall(null);
        setIncomingCall(null);
      }, 2500);
    };

    socket.on('webrtc_incoming_call', handleIncomingCall);
    socket.on('webrtc_call_initiated', handleCallInitiated);
    socket.on('webrtc_call_accepted', handleCallAccepted);
    socket.on('webrtc_signal_offer', handleSignalOffer);
    socket.on('webrtc_signal_answer', handleSignalAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);
    socket.on('webrtc_call_rejected', handleCallRejected);
    socket.on('webrtc_call_timeout', handleCallTimeout);
    socket.on('webrtc_call_busy', handleCallBusy);
    socket.on('webrtc_call_ended', handleCallEnded);

    return () => {
      socket.off('webrtc_incoming_call', handleIncomingCall);
      socket.off('webrtc_call_initiated', handleCallInitiated);
      socket.off('webrtc_call_accepted', handleCallAccepted);
      socket.off('webrtc_signal_offer', handleSignalOffer);
      socket.off('webrtc_signal_answer', handleSignalAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      socket.off('webrtc_call_rejected', handleCallRejected);
      socket.off('webrtc_call_timeout', handleCallTimeout);
      socket.off('webrtc_call_busy', handleCallBusy);
      socket.off('webrtc_call_ended', handleCallEnded);
    };
  }, [callState, cleanupCall]);

  // Initiate outgoing call
  const initiateCall = async ({ bookingId, callerRole, callerName, peerName }) => {
    setCallError(null);
    setCallState('calling');
    setCallStatusText('Requesting Voice Channel...');
    setCallSeconds(0);

    const bId = bookingId || currentBookingId;
    const role = callerRole || currentUserRole;

    try {
      // 1. Pre-initialize RTCPeerConnection & capture microphone
      const pc = await createPeerConnection(`temp-${Date.now()}`, bId);

      // 2. Emit call initiation to server
      const socket = getSocket();
      socket.emit('webrtc_call_initiate', {
        bookingId: bId,
        callerRole: role,
        callerName: callerName || 'Customer'
      }, (ack) => {
        if (!ack || !ack.success) {
          ringtone.stop();
          setCallState('error');
          setCallStatusText('Call Unavailable');
          setCallError(ack?.message || 'Unable to establish internet voice call.');
          cleanupCall();
          return;
        }

        setActiveCall({
          callId: ack.callId,
          bookingId: bId,
          peerName: peerName || 'Technician',
          peerRole: role === 'customer' ? 'professional' : 'customer'
        });
      });
    } catch (err) {
      console.error('Call initiation error:', err);
      ringtone.stop();
      setCallState('error');
      setCallStatusText('Microphone Access Error');
      setCallError(err.message || 'Could not access device microphone for audio call.');
      cleanupCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;

    ringtone.stop();
    setCallError(null);
    setCallState('connected');
    setCallStatusText('Connecting Voice...');

    const { callId, bookingId, callerName, callerRole } = incomingCall;

    try {
      // Initialize peer connection & microphone
      await createPeerConnection(callId, bookingId);

      setActiveCall({
        callId,
        bookingId,
        peerName: callerName || 'Customer',
        peerRole: callerRole
      });
      setIncomingCall(null);

      // Emit accept to server
      const socket = getSocket();
      socket.emit('webrtc_call_accept', { callId, bookingId });
    } catch (err) {
      console.error('Accept call error:', err);
      setCallState('error');
      setCallStatusText('Microphone Error');
      setCallError(err.message || 'Could not access device microphone.');
      cleanupCall();
    }
  };

  // Reject incoming call
  const rejectCall = (reason = 'declined') => {
    ringtone.stop();
    if (incomingCall) {
      const socket = getSocket();
      socket.emit('webrtc_call_reject', {
        callId: incomingCall.callId,
        bookingId: incomingCall.bookingId,
        reason
      });
      setIncomingCall(null);
    }
    cleanupCall();
    setCallState('idle');
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuteState = !isMuted;
        audioTracks[0].enabled = !nextMuteState; // track enabled = false means muted
        setIsMuted(nextMuteState);
      }
    }
  };

  // Toggle Speaker / Output
  const toggleSpeaker = () => {
    setIsSpeaker(prev => !prev);
  };

  // End active call
  const endCall = () => {
    ringtone.stop();
    const active = activeCall || incomingCall;

    if (active) {
      const socket = getSocket();
      socket.emit('webrtc_call_end', {
        callId: active.callId,
        bookingId: active.bookingId,
        durationSeconds: callSeconds,
        reason: 'user_hangup',
        iceConnectionState: peerConnectionRef.current?.iceConnectionState || 'closed'
      });
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

  // Format Stopwatch mm:ss
  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
