import React from 'react';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Wifi
} from 'lucide-react';

export function WebRtcCallModal({
  callState,
  callStatusText,
  callError,
  callSeconds,
  formattedCallTime,
  isMuted,
  isSpeaker,
  activeCall,
  incomingCall,
  onAccept,
  onReject,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
  peerName = 'Partner',
  peerRole = 'Technician',
  peerAvatar = ''
}) {
  // 1. INCOMING CALL PROMPT (Ringing)
  if (callState === 'incoming' && incomingCall) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 380,
          background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)',
          borderRadius: 24,
          padding: '36px 28px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Animated Pulsing Ring */}
          <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 20 }}>
            {peerAvatar && peerAvatar.startsWith('http') && !peerAvatar.includes('unsplash.com/photo-1506794778202') ? (
              <img
                src={peerAvatar}
                alt={incomingCall.callerName || peerName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #10B981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
                border: '3px solid #10B981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
              }}>
                {(incomingCall.callerName || peerName || 'PR').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(16, 185, 129, 0.6)',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34D399',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 10
          }}>
            <Wifi size={13} />
            <span>Incoming WebRTC Voice Call</span>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: -0.5 }}>
            {incomingCall.callerName || peerName}
          </h3>

          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 28px 0', lineHeight: 1.4 }}>
            Forge India Connect Free P2P Audio • Privacy Masked
          </p>

          {/* Action Buttons: Reject & Accept */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onReject('declined')}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)',
                transition: 'transform 0.15s ease'
              }}
              title="Decline Call"
            >
              <PhoneOff size={26} />
            </button>

            <button
              type="button"
              onClick={onAccept}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.5)',
                animation: 'bounce 1s infinite',
                transition: 'transform 0.15s ease'
              }}
              title="Accept Call"
            >
              <PhoneCall size={28} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE OUTGOING / CONNECTED CALL OVERLAY
  if (callState !== 'idle' && callState !== 'incoming') {
    const isConnected = callState === 'connected';
    const isEnded = callState === 'ended';
    const isBusy = callState === 'busy';
    const isError = callState === 'error';

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)',
          borderRadius: 24,
          padding: '36px 28px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Top Privacy Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#E2E8F0',
            marginBottom: 20
          }}>
            <ShieldCheck size={13} color="#10B981" />
            <span>End-to-End P2P WebRTC • Zero Phone Numbers Exposed</span>
          </div>

          {/* Participant Avatar */}
          <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 16 }}>
            {peerAvatar && peerAvatar.startsWith('http') && !peerAvatar.includes('unsplash.com/photo-1506794778202') ? (
              <img
                src={peerAvatar}
                alt={peerName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isConnected ? '3px solid #10B981' : '3px solid #6366F1'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 800,
                border: isConnected ? '3px solid #10B981' : '3px solid #6366F1'
              }}>
                {(peerName || 'PR').slice(0, 2).toUpperCase()}
              </div>
            )}
            {isConnected && (
              <span style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                animation: 'pulse 2s infinite'
              }} />
            )}
          </div>

          {/* Participant Title */}
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: -0.5 }}>
            {peerName}
          </h3>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 14px 0' }}>
            {peerRole} • High-Fidelity Internet Audio
          </p>

          {/* Call Status Badge & Stopwatch */}
          <div style={{
            display: 'inline-block',
            background: isConnected ? 'rgba(16, 185, 129, 0.2)' : isError || isBusy ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: isConnected ? '#34D399' : isError || isBusy ? '#F87171' : '#FBBF24',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20
          }}>
            {isConnected ? `Connected • ${formattedCallTime}` : callStatusText || 'Calling...'}
          </div>

          {/* Audio Waveform Animation (Connected state) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, marginBottom: 28 }}>
            {[14, 30, 18, 38, 22, 34, 16, 28, 12].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: isConnected ? (isMuted ? 6 : h) : 6,
                  background: isConnected ? (isMuted ? '#EF4444' : '#10B981') : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  transition: 'height 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Error / Busy Notice Box */}
          {callError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: 12,
              marginBottom: 20,
              textAlign: 'left',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{callError}</div>
            </div>
          )}

          {/* Call Controls: Mute, End Call, Speaker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Mute Button */}
            <button
              type="button"
              onClick={onToggleMute}
              disabled={!isConnected}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isConnected ? 'pointer' : 'default',
                opacity: isConnected ? 1 : 0.4,
                transition: 'all 0.15s ease'
              }}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={onEndCall}
              style={{
                width: 66,
                height: 66,
                borderRadius: '50%',
                background: '#DC2626',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(220, 38, 38, 0.45)',
                transition: 'transform 0.15s ease'
              }}
              title="End Voice Call"
            >
              <PhoneOff size={28} />
            </button>

            {/* Speaker Button */}
            <button
              type="button"
              onClick={onToggleSpeaker}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: isSpeaker ? '#10B981' : 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
            >
              {isSpeaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default WebRtcCallModal;
