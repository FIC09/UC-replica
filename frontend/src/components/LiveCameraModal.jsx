import React, { useState, useEffect, useRef } from 'react';

/**
 * LiveCameraModal
 * Direct, live camera photo capture modal with:
 * 1. Front / Back camera switching (facingMode: 'environment' vs 'user' + deviceId cycling)
 * 2. Mirroring control (Normal vs Mirrored toggle with canvas parity)
 * 3. Prominent controls in header and floating HUD
 * 4. Watermark timestamp verification
 */
export function LiveCameraModal({
  isOpen,
  title = 'Capture Live Work Verification Photo',
  subtitle = 'Live camera capture only. Platform policy strictly requires live evidence.',
  onCapture,
  onClose
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // Camera Selection & Modes
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // Mirroring state: false = normal (true/unmirrored view, recommended for equipment/text), true = mirrored
  const [isMirrored, setIsMirrored] = useState(false);

  // Feedback toast banner
  const [feedbackToast, setFeedbackToast] = useState('');
  const toastTimeoutRef = useRef(null);

  function triggerToast(msg) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setFeedbackToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setFeedbackToast('');
    }, 2200);
  }

  // Enumerate cameras whenever modal opens or camera starts
  async function refreshDevices() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        return videoInputs;
      }
    } catch (e) {
      console.warn('Enumerate devices note:', e);
    }
    return [];
  }

  useEffect(() => {
    if (!isOpen) return;
    refreshDevices();
  }, [isOpen]);

  // Start / Stop camera stream when modal opens or camera target changes
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError('');
    }

    return () => {
      stopCamera();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [isOpen, facingMode, selectedDeviceId]);

  async function startCamera() {
    setIsStartingCamera(true);
    setCameraError('');
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser. Please use Chrome, Edge, or Safari.');
      }

      let stream = null;

      // Build video constraint based on selected deviceId or facingMode
      const videoConstraint = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : { facingMode: { ideal: facingMode } };

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...videoConstraint,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (errHighRes) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraint,
            audio: false
          });
        } catch (errBasicConstraint) {
          // Fallback to basic any available video
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(playErr => {
          console.warn('Video play warning:', playErr);
        });
      }

      setIsStreaming(true);

      // Re-enumerate devices now that camera permission is granted
      const refreshed = await refreshDevices();
      if (refreshed.length > 0) {
        // Track the current active track deviceId if available
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
          if (settings.deviceId) {
            const idx = refreshed.findIndex(d => d.deviceId === settings.deviceId);
            if (idx !== -1) {
              setCurrentDeviceIndex(idx);
            }
          }
        }
      }
    } catch (err) {
      console.error('Camera startup error:', err);
      let msg = 'Unable to access live camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please click the 🔒 lock icon in your browser address bar and grant Camera permission, then click Retry.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device detected on this system. Please connect a webcam or use a mobile device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently in use by another application. Please close other camera tabs and click Retry.';
      }
      setCameraError(msg);
      setIsStreaming(false);
    } finally {
      setIsStartingCamera(false);
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }

  // Switch between Front (user) and Back (environment) camera
  function handleSwitchCamera() {
    if (availableDevices.length > 1) {
      // Cycle to the next video device
      const nextIndex = (currentDeviceIndex + 1) % availableDevices.length;
      setCurrentDeviceIndex(nextIndex);
      const nextDevice = availableDevices[nextIndex];
      setSelectedDeviceId(nextDevice.deviceId);

      const label = (nextDevice.label || '').toLowerCase();
      if (label.includes('front') || label.includes('user') || label.includes('selfie')) {
        setFacingMode('user');
        triggerToast(`🤳 Switched to Front Camera (${nextDevice.label || 'Front'})`);
      } else if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
        setFacingMode('environment');
        setIsMirrored(false); // Back camera should naturally be unmirrored for equipment
        triggerToast(`📷 Switched to Back Camera (${nextDevice.label || 'Back'})`);
      } else {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        if (nextMode === 'environment') setIsMirrored(false);
        triggerToast(`🔄 Switched to Camera ${nextIndex + 1}: ${nextDevice.label || (nextMode === 'environment' ? 'Back' : 'Front')}`);
      }
    } else {
      // Toggle facingMode directly
      const nextMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextMode);
      setSelectedDeviceId('');
      if (nextMode === 'environment') {
        setIsMirrored(false); // Automatically unmirror back camera
        triggerToast('📷 Switched to Back / Environment Camera');
      } else {
        triggerToast('🤳 Switched to Front / User Camera');
      }
    }
  }

  // Toggle Mirror / Normal view
  function handleToggleMirror() {
    setIsMirrored(prev => {
      const next = !prev;
      triggerToast(next ? '🪞 Mirror Mode ON (Flipped)' : '👁️ Normal View (Unmirrored / True Text)');
      return next;
    });
  }

  function handleTakeSnapshot() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // Apply horizontal mirror flip if isMirrored is active so photo matches preview exactly
    if (isMirrored) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    // Watermark Platform Verification Badge
    const bannerHeight = Math.max(34, Math.round(height * 0.058));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(12, Math.round(bannerHeight * 0.4))}px sans-serif`;
    ctx.fillText(
      `✓ Urban Pro Verified Live Photo • ${facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'} • ${new Date().toLocaleString()}`,
      16,
      height - Math.round(bannerHeight * 0.35)
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  }

  function handleRetake() {
    setCapturedImage(null);
    startCamera();
  }

  function handleConfirm() {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
    }
    handleCloseModal();
  }

  function handleCloseModal() {
    stopCamera();
    setCapturedImage(null);
    setCameraError('');
    if (onClose) onClose();
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: 18,
        width: '100%',
        maxWidth: 580,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #334155'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0B132B',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📸</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                {title}
              </h3>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: 11.5, color: '#94A3B8' }}>
              {subtitle}
            </p>
          </div>

          {/* Quick Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!capturedImage && (
              <>
                {/* 1. Camera Switch Button (Always Visible) */}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={isStartingCamera}
                  title="Switch between Back (Environment) and Front (User) Camera"
                  style={{
                    background: '#1E293B',
                    border: '1px solid #475569',
                    color: '#F8FAFC',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: isStartingCamera ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
                >
                  <span>🔄</span>
                  <span>{facingMode === 'environment' ? 'Back Cam' : 'Front Cam'}</span>
                </button>

                {/* 2. Mirror Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleMirror}
                  title={isMirrored ? 'Mirror is ON. Click to unmirror (Normal View)' : 'Mirror is OFF (Normal View). Click to mirror'}
                  style={{
                    background: isMirrored ? '#3B82F6' : '#1E293B',
                    border: isMirrored ? '1px solid #60A5FA' : '1px solid #475569',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMirrored) e.currentTarget.style.backgroundColor = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    if (!isMirrored) e.currentTarget.style.backgroundColor = '#1E293B';
                  }}
                >
                  <span>🪞</span>
                  <span>{isMirrored ? 'Mirrored' : 'Normal'}</span>
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              title="Cancel and close camera"
              style={{
                backgroundColor: '#1E293B',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Screen */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 390,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {capturedImage ? (
            /* Snapshot Review View */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                ✓ Photo Captured Successfully
              </div>
            </div>
          ) : cameraError ? (
            /* Error State View */
            <div style={{
              padding: 24,
              textAlign: 'center',
              color: '#F87171',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 44 }}>🚫</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FCA5A5' }}>
                Camera Access Needed
              </div>
              <div style={{ fontSize: 12, color: '#CBD5E1', maxWidth: 380, lineHeight: 1.5 }}>
                {cameraError}
              </div>
              <button
                type="button"
                onClick={startCamera}
                style={{
                  marginTop: 6,
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Retry Camera Access
              </button>
            </div>
          ) : (
            /* Live Camera Stream View */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  // Horizontal mirror flip control
                  transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                  transition: 'transform 0.2s ease'
                }}
              />

              {/* HUD Top Left: LIVE CAMERA ONLY */}
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.92)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                zIndex: 2
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite'
                }} />
                LIVE CAMERA ONLY
              </div>

              {/* HUD Top Right: Floating 1-Tap Flip & Mirror Buttons */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 2
              }}>
                {/* 1-Tap Camera Flip Pill */}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={isStartingCamera}
                  title="Switch to Back / Front Camera"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <span>🔄</span>
                  <span>{facingMode === 'environment' ? '📷 Back' : '🤳 Front'}</span>
                </button>

                {/* 1-Tap Mirror Pill */}
                <button
                  type="button"
                  onClick={handleToggleMirror}
                  title={isMirrored ? 'Mirrored (Flipped). Click to make normal' : 'Normal view. Click to mirror'}
                  style={{
                    backgroundColor: isMirrored ? 'rgba(59, 130, 246, 0.85)' : 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    border: isMirrored ? '1px solid #93C5FD' : '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <span>🪞</span>
                  <span>{isMirrored ? 'Mirrored' : 'Normal'}</span>
                </button>
              </div>

              {/* Viewfinder Target Framing Reticle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '78%',
                height: '75%',
                border: '2px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: 14,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <span style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  backdropFilter: 'blur(2px)'
                }}>
                  Frame equipment / clean area
                </span>
              </div>

              {/* Toast Feedback Notification */}
              {feedbackToast && (
                <div style={{
                  position: 'absolute',
                  bottom: 18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '6px 16px',
                  borderRadius: 24,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                  zIndex: 10,
                  animation: 'fadeIn 0.15s ease-out',
                  whiteSpace: 'nowrap'
                }}>
                  {feedbackToast}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #1E293B',
          backgroundColor: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          {capturedImage ? (
            /* Review Action Buttons */
            <>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: '1px solid #475569',
                  backgroundColor: '#1E293B',
                  color: '#CBD5E1',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
              >
                🔄 Retake Photo
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1.4,
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
              >
                ✓ Use This Photo
              </button>
            </>
          ) : (
            /* Live Camera Shutter Controls */
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: '11px 18px',
                  borderRadius: 10,
                  border: '1px solid #475569',
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTakeSnapshot}
                disabled={!isStreaming || isStartingCamera}
                style={{
                  flex: 1,
                  padding: '13px 20px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: isStreaming ? '#7C3AED' : '#475569',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: isStreaming ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isStreaming ? '0 4px 14px rgba(124, 58, 237, 0.4)' : 'none',
                  transition: 'transform 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (isStreaming) e.currentTarget.style.backgroundColor = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  if (isStreaming) e.currentTarget.style.backgroundColor = '#7C3AED';
                }}
              >
                <span style={{ fontSize: 18 }}>📸</span>
                {isStartingCamera ? 'Opening Camera...' : 'Take Live Photo'}
              </button>
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
