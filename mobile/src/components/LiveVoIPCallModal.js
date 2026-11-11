import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform
} from 'react-native';
import mobileApi from '../services/apiClient';

/**
 * Web Audio Ringtone & Sound Generator
 * Generates telecommunication ringtones, chime tones, and hangup tones directly in browser/device
 */
class VoIPSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
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

  playTone(freq1, freq2, durationMs = 1200, gainLevel = 0.08) {
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

  startOutgoingRinging() {
    this.stop();
    this.playTone(440, 480, 1500, 0.06); // Standard ringback
    this.ringInterval = setInterval(() => {
      this.playTone(440, 480, 1500, 0.06);
    }, 3800);
  }

  startIncomingRinging() {
    this.stop();
    this.playTone(523.25, 659.25, 1100, 0.1); // Melodic C5 + E5 chime
    this.ringInterval = setInterval(() => {
      this.playTone(523.25, 659.25, 1100, 0.1);
    }, 2800);
  }

  playConnectedTone() {
    this.stop();
    this.playTone(880, null, 250, 0.08);
  }

  playEndTone() {
    this.stop();
    this.playTone(330, null, 400, 0.06);
  }

  stop() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }
}

const voipSound = new VoIPSoundEngine();

export default function LiveVoIPCallModal({
  visible,
  onClose,
  callData,          // { callId, bookingId, callerRole, callerName, receiverRole, receiverName, service }
  isIncoming = false, // true if receiver, false if caller
  onCallEnded
}) {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [statusMessage, setStatusMessage] = useState(isIncoming ? 'Incoming Internet Call...' : 'Calling specialist over internet...');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollIntervalRef = useRef(null);
  const signalingIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const lastSignalTsRef = useRef(0);

  const activeCallId = callData?.callId || callData?.session?.callId;
  const displayBookingRef = callData?.bookingId
    ? (String(callData.bookingId).startsWith('UC-') ? callData.bookingId : `UC-${String(callData.bookingId).replace(/^(JOB|LEAD)[-_]?/i, '')}`)
    : 'UC-894558';

  const myRole = isIncoming
    ? (callData?.receiverRole || 'worker')
    : (callData?.callerRole || 'customer');

  const peerName = isIncoming
    ? (callData?.callerName || 'Customer')
    : (callData?.receiverName || 'Specialist');

  const peerRole = isIncoming
    ? (callData?.callerRole === 'customer' ? 'Service Customer' : 'Certified Specialist')
    : (callData?.receiverRole === 'customer' ? 'Service Customer' : 'Certified Doorstep Specialist');

  const serviceName = callData?.service || 'Doorstep Service';

  // Pulsing animation for avatar
  useEffect(() => {
    if (visible && (callStatus === 'ringing' || callStatus === 'incoming' || callStatus === 'connected')) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true
          })
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [visible, callStatus]);

  // Audio stream playback helper for WebRTC
  const playRemoteStream = (stream) => {
    try {
      if (typeof document !== 'undefined') {
        let el = document.getElementById('webrtc-remote-audio-player');
        if (!el) {
          el = document.createElement('audio');
          el.id = 'webrtc-remote-audio-player';
          el.autoplay = true;
          el.playsInline = true;
          el.style.display = 'none';
          document.body.appendChild(el);
        }
        el.srcObject = stream;
        el.volume = isSpeaker ? 1.0 : 0.4;
        el.play().catch(() => {});
        remoteAudioRef.current = el;
      }
    } catch (_) {}
  };

  // Get or create RTCPeerConnection with Google STUN servers
  const getPeerConnection = () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    if (typeof window === 'undefined') return null;

    const RTCPeerConnectionClass = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (!RTCPeerConnectionClass) return null;

    const pc = new RTCPeerConnectionClass({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && activeCallId) {
        mobileApi.sendWebRtcSignal({
          callId: activeCallId,
          senderRole: myRole,
          type: 'candidate',
          payload: event.candidate
        }).catch(() => {});
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        playRemoteStream(event.streams[0]);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Request browser microphone if supported, fallback to silent track
  const acquireLocalMedia = async (pc) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        if (pc) {
          stream.getTracks().forEach((track) => {
            try { pc.addTrack(track, stream); } catch (_) {}
          });
        }
        return stream;
      }
    } catch (e) {
      console.log('[WebRTC] Microphone access info:', e.message);
    }

    // Fallback: silent media track for headless/restricted webview
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const dst = ctx.createMediaStreamDestination ? ctx.createMediaStreamDestination() : null;
          if (dst && dst.stream) {
            osc.connect(dst);
            osc.start();
            localStreamRef.current = dst.stream;
            if (pc) {
              dst.stream.getTracks().forEach((track) => {
                try { pc.addTrack(track, dst.stream); } catch (_) {}
              });
            }
            return dst.stream;
          }
        }
      }
    } catch (_) {}
    return null;
  };

  // Start outgoing caller WebRTC flow (Offer generation)
  const startCallerWebRtcFlow = async () => {
    try {
      const pc = getPeerConnection();
      if (!pc) return;
      await acquireLocalMedia(pc);
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      if (activeCallId) {
        await mobileApi.sendWebRtcSignal({
          callId: activeCallId,
          senderRole: myRole,
          type: 'offer',
          payload: offer
        });
      }
    } catch (err) {
      console.warn('[WebRTC] startCallerWebRtcFlow:', err.message);
    }
  };

  // Start incoming receiver WebRTC flow (Offer pickup & Answer generation)
  const startReceiverWebRtcFlow = async () => {
    try {
      const pc = getPeerConnection();
      if (!pc) return;
      await acquireLocalMedia(pc);

      if (activeCallId) {
        const sigRes = await mobileApi.getWebRtcSignals({ callId: activeCallId, role: myRole, since: 0 });
        if (sigRes && sigRes.signals) {
          const offerSig = sigRes.signals.find((s) => s.type === 'offer');
          if (offerSig && offerSig.payload) {
            const RTCSessionDescriptionClass = window.RTCSessionDescription || window.webkitRTCSessionDescription;
            if (RTCSessionDescriptionClass) {
              await pc.setRemoteDescription(new RTCSessionDescriptionClass(offerSig.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await mobileApi.sendWebRtcSignal({
                callId: activeCallId,
                senderRole: myRole,
                type: 'answer',
                payload: answer
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[WebRTC] startReceiverWebRtcFlow:', err.message);
    }
  };

  // Periodic WebRTC Signaling poller (Answers & ICE candidates)
  const processWebRtcSignaling = async () => {
    if (!activeCallId) return;
    const pc = peerConnectionRef.current;
    try {
      const res = await mobileApi.getWebRtcSignals({
        callId: activeCallId,
        role: myRole,
        since: lastSignalTsRef.current
      });
      if (res && res.signals && res.signals.length > 0) {
        const RTCSessionDescriptionClass = window.RTCSessionDescription || window.webkitRTCSessionDescription;
        const RTCIceCandidateClass = window.RTCIceCandidate || window.webkitRTCIceCandidate;

        for (const sig of res.signals) {
          if (sig.timestamp > lastSignalTsRef.current) {
            lastSignalTsRef.current = sig.timestamp;
          }
          if (!pc) continue;

          if (sig.type === 'answer' && !isIncoming) {
            if (pc.signalingState !== 'stable' && RTCSessionDescriptionClass) {
              await pc.setRemoteDescription(new RTCSessionDescriptionClass(sig.payload)).catch(() => {});
              if (callStatus !== 'connected') {
                handleConnected();
              }
            }
          } else if (sig.type === 'offer' && isIncoming) {
            if (pc.signalingState !== 'have-local-offer' && RTCSessionDescriptionClass) {
              await pc.setRemoteDescription(new RTCSessionDescriptionClass(sig.payload)).catch(() => {});
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await mobileApi.sendWebRtcSignal({
                callId: activeCallId,
                senderRole: myRole,
                type: 'answer',
                payload: answer
              }).catch(() => {});
            }
          } else if (sig.type === 'candidate') {
            if (RTCIceCandidateClass && sig.payload) {
              await pc.addIceCandidate(new RTCIceCandidateClass(sig.payload)).catch(() => {});
            }
          }
        }
      }
    } catch (_) {}
  };

  // Main lifecycle
  useEffect(() => {
    if (!visible) {
      cleanupAndClose(0);
      return;
    }

    setCallDuration(0);
    setIsMuted(false);
    lastSignalTsRef.current = 0;

    if (isIncoming) {
      setCallStatus('incoming');
      setStatusMessage('Incoming Internet Voice Call...');
      voipSound.startIncomingRinging();
    } else {
      setCallStatus('ringing');
      setStatusMessage('Ringing specialist over internet...');
      voipSound.startOutgoingRinging();
      startCallerWebRtcFlow();
    }

    // Call status polling (checks if peer accepted, declined or ended)
    if (activeCallId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await mobileApi.getCallStatus(activeCallId);
          if (res && res.success && res.session) {
            const remoteStatus = res.session.status;
            if (remoteStatus === 'connected' && callStatus !== 'connected') {
              handleConnected();
            } else if (remoteStatus === 'rejected') {
              handleRemoteDeclined();
            } else if (remoteStatus === 'ended' && callStatus !== 'ended') {
              handleRemoteEnded(res.session.durationSeconds);
            }
          }
        } catch (_) {}
      }, 1000);

      // WebRTC SDP & ICE Candidate exchange loop
      signalingIntervalRef.current = setInterval(processWebRtcSignaling, 1000);
    }

    return () => {
      cleanupAndClose(0);
    };
  }, [visible, activeCallId, isIncoming]);

  const handleConnected = () => {
    voipSound.playConnectedTone();
    setCallStatus('connected');
    setStatusMessage('Connected • HD Voice Call');

    // Start live duration timer
    if (!timerIntervalRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleRemoteDeclined = () => {
    voipSound.playEndTone();
    setCallStatus('ended');
    setStatusMessage('Call Declined by ' + peerName);
    cleanupAndClose(1800);
  };

  const handleRemoteEnded = (seconds) => {
    voipSound.playEndTone();
    setCallStatus('ended');
    const finalSecs = seconds || callDuration;
    setStatusMessage(`Call Ended • Duration: ${formatTime(finalSecs)}`);
    cleanupAndClose(1800);
  };

  const handleAcceptCall = async () => {
    try {
      if (activeCallId) {
        await mobileApi.respondCall({ callId: activeCallId, action: 'accept' });
      }
      await startReceiverWebRtcFlow();
      handleConnected();
    } catch (e) {
      console.warn('Accept call error:', e);
      handleConnected();
    }
  };

  const handleDeclineCall = async () => {
    voipSound.playEndTone();
    setCallStatus('ended');
    setStatusMessage('Call Declined');
    try {
      if (activeCallId) {
        await mobileApi.respondCall({ callId: activeCallId, action: 'decline' });
      }
    } catch (_) {}
    cleanupAndClose(1200);
  };

  const handleEndCall = async () => {
    voipSound.playEndTone();
    setCallStatus('ended');
    setStatusMessage(`Call Ended • Duration: ${formatTime(callDuration)}`);
    try {
      if (activeCallId) {
        await mobileApi.endCall({ callId: activeCallId, durationSeconds: callDuration, reason: 'user_ended' });
      }
    } catch (_) {}
    cleanupAndClose(1500);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleSpeaker = () => {
    setIsSpeaker((prev) => {
      const next = !prev;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.volume = next ? 1.0 : 0.4;
      }
      return next;
    });
  };

  const cleanupAndClose = (delay = 1200) => {
    voipSound.stop();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (signalingIntervalRef.current) clearInterval(signalingIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch (_) {}
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (_) {}
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      try {
        remoteAudioRef.current.pause();
        remoteAudioRef.current.srcObject = null;
      } catch (_) {}
    }

    if (delay > 0) {
      setTimeout(() => {
        if (onCallEnded) onCallEnded({ duration: callDuration });
        onClose();
      }, delay);
    } else {
      if (onCallEnded) onCallEnded({ duration: callDuration });
      onClose();
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleEndCall}>
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

        {/* Top Header: Security & Service Indicator */}
        <View style={styles.topBar}>
          <View style={styles.secureBadge}>
            <Text style={styles.secureBadgeIcon}>🔒</Text>
            <Text style={styles.secureBadgeText}>End-to-End Encrypted WebRTC Voice</Text>
          </View>
          <Text style={styles.orderRefText}>Order #{displayBookingRef} • {serviceName}</Text>
        </View>

        {/* Center: Profile & Ringing Waveform */}
        <View style={styles.centerContent}>
          <Animated.View style={[styles.avatarGlow, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[
              styles.avatarCircle,
              callStatus === 'connected' ? styles.avatarConnected : styles.avatarRinging
            ]}>
              <Text style={styles.avatarInitial}>
                {(peerName || 'P').charAt(0).toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.peerNameText}>{peerName}</Text>
          <Text style={styles.peerRoleText}>{peerRole}</Text>

          {/* Status / Live Duration */}
          <View style={styles.statusBox}>
            {callStatus === 'connected' ? (
              <View style={styles.connectedRow}>
                <View style={styles.greenLiveDot} />
                <Text style={styles.liveTimerText}>{formatTime(callDuration)}</Text>
              </View>
            ) : (
              <Text style={styles.statusMessageText}>{statusMessage}</Text>
            )}
          </View>

          {/* Audio Waveform Simulation when connected */}
          {callStatus === 'connected' && (
            <View style={styles.waveformContainer}>
              <View style={[styles.waveBar, { height: 18 }]} />
              <View style={[styles.waveBar, { height: 28 }]} />
              <View style={[styles.waveBar, { height: 42, backgroundColor: '#10B981' }]} />
              <View style={[styles.waveBar, { height: 24 }]} />
              <View style={[styles.waveBar, { height: 36, backgroundColor: '#10B981' }]} />
              <View style={[styles.waveBar, { height: 20 }]} />
              <View style={[styles.waveBar, { height: 32 }]} />
            </View>
          )}
        </View>

        {/* Bottom Call Controls */}
        <View style={styles.controlsArea}>
          {callStatus === 'incoming' ? (
            /* Incoming Call Controls: Decline (Red) & Accept (Green) */
            <View style={styles.incomingBtnRow}>
              <TouchableOpacity
                style={[styles.circleBtn, styles.declineBtn]}
                onPress={handleDeclineCall}
                activeOpacity={0.85}
              >
                <Text style={styles.btnIcon}>✕</Text>
                <Text style={styles.btnLabel}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.circleBtn, styles.acceptBtn]}
                onPress={handleAcceptCall}
                activeOpacity={0.85}
              >
                <Text style={styles.btnIcon}>📞</Text>
                <Text style={styles.btnLabel}>Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Outgoing / Connected / Active Controls */
            <View style={styles.activeBtnRow}>
              {/* Mute Button */}
              <TouchableOpacity
                style={[styles.smallControlBtn, isMuted && styles.controlBtnActive]}
                onPress={toggleMute}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
                <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity
                style={[styles.circleBtn, styles.endCallBtn]}
                onPress={handleEndCall}
                activeOpacity={0.85}
              >
                <Text style={styles.btnIcon}>☎️</Text>
                <Text style={styles.btnLabel}>End</Text>
              </TouchableOpacity>

              {/* Speaker Button */}
              <TouchableOpacity
                style={[styles.smallControlBtn, isSpeaker && styles.controlBtnActive]}
                onPress={toggleSpeaker}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>{isSpeaker ? '🔊' : '🔈'}</Text>
                <Text style={styles.controlLabel}>{isSpeaker ? 'Speaker On' : 'Earpiece'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 20
  },
  topBar: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingHorizontal: 20
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 8
  },
  secureBadgeIcon: {
    fontSize: 12,
    marginRight: 6
  },
  secureBadgeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  orderRefText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500'
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 24
  },
  avatarGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10
  },
  avatarRinging: {
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.5)'
  },
  avatarConnected: {
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.6)'
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  peerNameText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center'
  },
  peerRoleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center'
  },
  statusBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  statusMessageText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  greenLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981'
  },
  liveTimerText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 26,
    height: 44
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8'
  },
  controlsArea: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'android' ? 24 : 16
  },
  incomingBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  activeBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  circleBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8
  },
  acceptBtn: {
    backgroundColor: '#10B981'
  },
  declineBtn: {
    backgroundColor: '#EF4444'
  },
  endCallBtn: {
    backgroundColor: '#EF4444'
  },
  btnIcon: {
    fontSize: 28,
    color: '#FFFFFF'
  },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  smallControlBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer'
  },
  controlBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA'
  },
  controlIcon: {
    fontSize: 22
  },
  controlLabel: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3
  }
});
