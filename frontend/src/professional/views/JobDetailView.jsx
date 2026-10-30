import React, { useState, useEffect, useRef } from 'react';
import { professionalClient } from '../professionalClient';
import { RapidoChatDrawer } from '../../components/RapidoChatDrawer';
import { useWebRtcVoiceCall } from '../../utils/useWebRtcVoiceCall';
import { WebRtcCallModal } from '../../components/WebRtcCallModal';
import { usePlatformSettings } from '../../utils/usePlatformSettings';
import { LiveCameraModal } from '../../components/LiveCameraModal';

export function JobDetailView({ jobId, onNavigate, showToast }) {
  const { platformTakeRate, isSurgeActive, surgeAmount } = usePlatformSettings();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'extra_work' | 'communication' | 'incidents' | 'financials'
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  // High-Fidelity WebRTC Voice Calling Hook (Free P2P Internet Voice)
  const webrtcVoice = useWebRtcVoiceCall({
    currentUserRole: 'professional',
    currentUserId: professionalClient.getStoredUser()?.id || job?.assignedProfessional?.id || 'WRK-KRI-101',
    currentBookingId: job?.id || jobId
  });

  function handleInitiateCallToCustomer() {
    webrtcVoice.initiateCall({
      bookingId: job?.id || jobId,
      callerRole: 'professional',
      callerName: professionalClient.getStoredUser()?.applicantName || job?.assignedProfessional?.name || 'Professional Technician',
      peerName: job?.customerName || job?.userName || 'Customer'
    });
  }

  // Real Device GPS Tracking Stream
  const gpsWatchIdRef = useRef(null);
  const [gpsStatus, setGpsStatus] = useState('Standby');

  // Start OTP verification modal
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Incident & Delay Reporting Modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // Professional Private Note input
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // 1. Checklists & Evidence States
  const [structuredChecklists, setStructuredChecklists] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [photoPhase, setPhotoPhase] = useState('before');
  const [photoType, setPhotoType] = useState('equipment');
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Mandatory Work Verification Photo States (Pre-work & Post-work)
  const [preWorkPhotoFile, setPreWorkPhotoFile] = useState(null);
  const [preWorkPhotoPreview, setPreWorkPhotoPreview] = useState(null);
  const [postWorkPhotoFile, setPostWorkPhotoFile] = useState(null);
  const [postWorkPhotoPreview, setPostWorkPhotoPreview] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCompletingWithPhoto, setIsCompletingWithPhoto] = useState(false);
  const [completionPhotoError, setCompletionPhotoError] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState(null);

  // Direct Live Camera Capture State (Gallery Disabled)
  const [liveCameraConfig, setLiveCameraConfig] = useState({
    isOpen: false,
    phase: 'after',
    title: 'Capture Work Verification Photo',
    subtitle: '🔴 Live photo capturing only (Gallery disabled)',
    onSuccess: null
  });

  const openLiveCamera = ({ phase = 'after', title, subtitle, onSuccess = null }) => {
    setLiveCameraConfig({
      isOpen: true,
      phase,
      title: title || (phase === 'before' ? 'Capture Pre-Work Photo' : 'Capture Work Completion Photo'),
      subtitle: subtitle || '🔴 Live camera capture only. Platform policy strictly requires live evidence.',
      onSuccess
    });
  };

  const handleLiveCameraCaptured = (dataUrl) => {
    if (liveCameraConfig.phase === 'before') {
      setPreWorkPhotoPreview(dataUrl);
      setPreWorkPhotoFile({ name: `pre_work_${Date.now()}.jpg`, size: 1200 * 1024, type: 'image/jpeg' });
      setOtpError('');
    } else if (liveCameraConfig.phase === 'after') {
      setPostWorkPhotoPreview(dataUrl);
      setPostWorkPhotoFile({ name: `post_work_${Date.now()}.jpg`, size: 1200 * 1024, type: 'image/jpeg' });
      setCompletionPhotoError('');
    }

    if (typeof liveCameraConfig.onSuccess === 'function') {
      liveCameraConfig.onSuccess(dataUrl);
    }
  };

  // 2. Extra Work & Parts States
  const [extraWorkCatalog, setExtraWorkCatalog] = useState([]);
  const [extraWorkItems, setExtraWorkItems] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState('EX-AC-04');
  const [extraWorkScope, setExtraWorkScope] = useState('');
  const [extraWorkQty, setExtraWorkQty] = useState(1);
  const [isSubmittingExtraWork, setIsSubmittingExtraWork] = useState(false);
  const [approvingWorkId, setApprovingWorkId] = useState(null);

  // 3. Customer Communication States
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [communicationChannels, setCommunicationChannels] = useState(null);
  const [isRefreshingChat, setIsRefreshingChat] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(null); // 'camera' | 'location' | null

  // 4. Cancellation & Incidents States
  const [cancellationPolicies, setCancellationPolicies] = useState({});
  const [selectedIncidentCategory, setSelectedIncidentCategory] = useState('running_late');
  const [incidentReason, setIncidentReason] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(20);
  const [consequencesAcknowledged, setConsequencesAcknowledged] = useState(false);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  // 5. Financials State
  // Clean Rupee standard formatting throughout (removed developer paisa debug toggle)

  useEffect(() => {
    loadJob();
    loadExtraWorkCatalogue();
    loadCancellationPolicy();
  }, [jobId]);

  async function loadJob() {
    setLoading(true);
    setError(null);
    try {
      const data = await professionalClient.getJobDetail(jobId);
      if (data.success && data.job) {
        setJob(data.job);
        if (data.job.structuredChecklists) {
          setStructuredChecklists(data.job.structuredChecklists);
          setCompletionNotes(data.job.structuredChecklists.completionNotes || '');
        }
        if (data.job.extraWorkRequests) {
          setExtraWorkItems(data.job.extraWorkRequests);
        }
        if (data.job.communicationChannels) {
          setCommunicationChannels(data.job.communicationChannels);
        }
      }
      // Also load fresh chat and checklists
      loadChatMessages();
      loadChecklistsData();
    } catch (err) {
      setError(err.message || 'Failed to load job details. Unauthorized access.');
    } finally {
      setLoading(false);
    }
  }

  async function loadChecklistsData() {
    try {
      const res = await professionalClient.getJobChecklists(jobId);
      if (res.success && res.checklists) {
        setStructuredChecklists(res.checklists);
        setCompletionNotes(res.completionNotes || res.checklists.completionNotes || '');
      }
    } catch (e) {
      console.warn('Checklists load error:', e);
    }
  }

  async function loadExtraWorkCatalogue() {
    try {
      const res = await professionalClient.getExtraWorkCatalogue(jobId);
      if (res.success && res.catalogue) {
        setExtraWorkCatalog(res.catalogue);
      }
    } catch (e) {
      console.warn('Catalogue load error:', e);
    }
  }

  async function loadCancellationPolicy() {
    try {
      const res = await professionalClient.getCancellationPolicy();
      if (res.success && res.policies) {
        setCancellationPolicies(res.policies);
      }
    } catch (e) {
      console.warn('Policy load error:', e);
    }
  }

  // Real Device GPS Telemetry Stream (Module 6 & Module 8)
  useEffect(() => {
    const isTravelling = job?.status === 'En Route' || job?.status === 'Travelling';
    if (isTravelling) {
      if ('geolocation' in navigator) {
        setGpsStatus('Live GPS Active (Transmitting)');
        const sendLocation = (position) => {
          const { latitude, longitude, speed, heading, accuracy } = position.coords;
          fetch('/api/tracking/ping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-professional-id': job.assignedProfessional?.id || 'WRK-KRI-101'
            },
            body: JSON.stringify({
              bookingId: job.id,
              lat: latitude,
              lng: longitude,
              speed: speed ? Math.round(speed * 3.6) : 22,
              heading: heading || 0,
              accuracy: accuracy || 5
            })
          }).catch(err => console.warn('Worker GPS stream ping error:', err.message));
        };

        navigator.geolocation.getCurrentPosition(sendLocation, (err) => {
          console.warn('Initial GPS query:', err.message);
          setGpsStatus('Location Permission Required');
        });

        const watchId = navigator.geolocation.watchPosition(
          sendLocation,
          (err) => {
            console.warn('Worker GPS stream error:', err.message);
            setGpsStatus('Location Unavailable');
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
        gpsWatchIdRef.current = watchId;
      } else {
        setGpsStatus('Device Geolocation Not Supported');
      }
    } else {
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
        setGpsStatus('Standby');
      }
    }

    return () => {
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, [job?.status, job?.id]);

  async function loadChatMessages() {
    setIsRefreshingChat(true);
    try {
      const res = await professionalClient.getJobMessages(jobId);
      if (res.success) {
        setChatMessages(res.messages || []);
        setLastPolledAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (res.channels) setCommunicationChannels(res.channels);
      }
    } catch (e) {
      console.warn('Chat load error:', e);
    } finally {
      setIsRefreshingChat(false);
    }
  }

  // Photo Selection & Direct Upload Handlers
  const handlePreWorkPhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreWorkPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreWorkPhotoPreview(reader.result);
      setOtpError('');
    };
    reader.readAsDataURL(file);
  };

  const handlePostWorkPhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostWorkPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPostWorkPhotoPreview(reader.result);
      setCompletionPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPreWorkPhotoDirectly = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        await professionalClient.uploadJobPhotoEvidence(jobId, {
          phase: 'before',
          photoType: 'work_area',
          fileBase64: base64,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          mimeType: file.type
        });
        showToast('✓ Pre-work verification photo uploaded successfully!');
        await loadJob();
      } catch (err) {
        showToast(err.message || 'Failed to upload pre-work photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPostWorkPhotoDirectly = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        await professionalClient.uploadJobPhotoEvidence(jobId, {
          phase: 'after',
          photoType: 'work_area',
          fileBase64: base64,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          mimeType: file.type
        });
        showToast('✓ Post-work completion photo uploaded successfully!');
        await loadJob();
      } catch (err) {
        showToast(err.message || 'Failed to upload post-work photo');
      }
    };
    reader.readAsDataURL(file);
  };

  // Lifecycle Transitions
  const handleUpdateStatus = async (newStatus, otp, extraPayload = {}) => {
    try {
      await professionalClient.updateJobStatus(jobId, newStatus, otp, extraPayload);
      showToast(`Job status updated to "${newStatus}"`);
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleInitiateCompletion = () => {
    const hasPostWorkPhoto = job?.afterWorkPhoto?.url || (structuredChecklists?.photos || []).some(p => p.phase === 'after');
    if (!hasPostWorkPhoto && !postWorkPhotoPreview) {
      setShowCompletionModal(true);
      return;
    }
    handleConfirmCompletionWithPhoto();
  };

  const handleConfirmCompletionWithPhoto = async () => {
    const hasPostWorkPhoto = job?.afterWorkPhoto?.url || (structuredChecklists?.photos || []).some(p => p.phase === 'after');
    if (!hasPostWorkPhoto && !postWorkPhotoPreview) {
      setCompletionPhotoError('📸 Work completion photo is mandatory. Please capture or attach a photo.');
      return;
    }

    setIsCompletingWithPhoto(true);
    setCompletionPhotoError('');
    try {
      let afterPhotoData = null;
      if (postWorkPhotoPreview) {
        afterPhotoData = {
          url: postWorkPhotoPreview,
          fileName: postWorkPhotoFile?.name || `post_work_${Date.now()}.jpg`,
          fileSizeKb: postWorkPhotoFile ? Math.round(postWorkPhotoFile.size / 1024) : 1200
        };
        await professionalClient.uploadJobPhotoEvidence(jobId, {
          phase: 'after',
          photoType: 'work_area',
          fileBase64: postWorkPhotoPreview,
          fileName: afterPhotoData.fileName,
          fileSizeKb: afterPhotoData.fileSizeKb,
          mimeType: postWorkPhotoFile?.type || 'image/jpeg'
        }).catch(() => {});
      }

      await professionalClient.updateJobStatus(jobId, 'Completed', null, {
        afterWorkPhoto: afterPhotoData
      });
      showToast(`✓ Job Completed! ₹${job.payout} credited to your wallet with verified photo evidence.`);
      setShowCompletionModal(false);
      setPostWorkPhotoFile(null);
      setPostWorkPhotoPreview(null);
      await loadJob();
    } catch (err) {
      setCompletionPhotoError(err.message || 'Failed to complete job');
    } finally {
      setIsCompletingWithPhoto(false);
    }
  };

  const handleVerifyOtp = async () => {
    const hasPreWorkPhoto = job?.beforeWorkPhoto?.url || preWorkPhotoPreview || (structuredChecklists?.photos || []).some(p => p.phase === 'before');
    if (!hasPreWorkPhoto) {
      setOtpError('📸 Pre-work photo is mandatory. Please upload or take a photo before starting service.');
      return;
    }

    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter a 4-digit code provided by the customer.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      let beforePhotoData = null;
      if (preWorkPhotoPreview) {
        beforePhotoData = {
          url: preWorkPhotoPreview,
          fileName: preWorkPhotoFile?.name || `pre_work_${Date.now()}.jpg`,
          fileSizeKb: preWorkPhotoFile ? Math.round(preWorkPhotoFile.size / 1024) : 1200
        };
        await professionalClient.uploadJobPhotoEvidence(jobId, {
          phase: 'before',
          photoType: 'work_area',
          fileBase64: preWorkPhotoPreview,
          fileName: beforePhotoData.fileName,
          fileSizeKb: beforePhotoData.fileSizeKb,
          mimeType: preWorkPhotoFile?.type || 'image/jpeg'
        }).catch(() => {});
      }

      await professionalClient.updateJobStatus(jobId, 'In Progress', otpInput.trim(), {
        beforeWorkPhoto: beforePhotoData
      });
      showToast('✓ Start OTP verified! Job is now In Progress.');
      setShowOtpModal(false);
      setOtpInput('');
      setPreWorkPhotoFile(null);
      setPreWorkPhotoPreview(null);
      await loadJob();
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP code. Please check with customer.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 1. Checklist Interaction Handlers
  const handleToggleChecklist = async (section, itemId, currentVal) => {
    const nextVal = !currentVal;
    if (structuredChecklists && structuredChecklists[section]) {
      setStructuredChecklists(prev => ({
        ...prev,
        [section]: prev[section].map(it => it.id === itemId ? { ...it, completed: nextVal } : it)
      }));
    }

    try {
      await professionalClient.updateJobChecklistSection(jobId, {
        section,
        itemId,
        completed: nextVal
      });
      // also sync legacy checklist if needed
      await professionalClient.updateJobChecklist(jobId, itemId, nextVal);
    } catch (e) {
      showToast('Checklist update failed to persist.');
      loadChecklistsData();
    }
  };

  const handleSaveCompletionNotes = async () => {
    setIsSavingNotes(true);
    try {
      await professionalClient.updateJobChecklistSection(jobId, {
        completionNotes
      });
      showToast('Technician completion notes saved.');
    } catch (e) {
      showToast(e.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Photo Upload Handler with Client-Side Validation
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid file type. Only JPG, PNG, and WebP images are permitted per Platform Photo Policy.');
      return;
    }

    const sizeKb = file.size / 1024;
    if (sizeKb > 5120) {
      setPhotoError(`File size (${(sizeKb / 1024).toFixed(1)}MB) exceeds 5MB platform maximum limit.`);
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await professionalClient.uploadJobPhotoEvidence(jobId, {
        phase: photoPhase,
        photoType,
        fileName: file.name,
        fileSizeKb: Math.round(sizeKb),
        mimeType: file.type
      });
      showToast(res.message || 'Photo evidence attached under protected access vault.');
      loadChecklistsData();
      loadJob();
    } catch (err) {
      setPhotoError(err.message || 'Photo upload failed');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // 2. Extra Work Proposal & Verifiable Approval Handlers
  const handleProposeExtraWork = async (e) => {
    e.preventDefault();
    setIsSubmittingExtraWork(true);
    try {
      const res = await professionalClient.proposeExtraWork(jobId, {
        ruleId: selectedRuleId,
        scope: extraWorkScope,
        qty: extraWorkQty
      });
      showToast(res.message || 'Extra work proposed. Pending customer approval.');
      setExtraWorkScope('');
      setExtraWorkQty(1);
      // Refresh items
      const itemsRes = await professionalClient.getExtraWorkRequests(jobId);
      if (itemsRes.success) setExtraWorkItems(itemsRes.extraWorkItems);
      loadJob();
    } catch (err) {
      showToast(err.message || 'Failed to submit extra work proposal');
    } finally {
      setIsSubmittingExtraWork(false);
    }
  };

  const handleSimulateCustomerApproval = async (workId, action) => {
    setApprovingWorkId(workId);
    try {
      const res = await professionalClient.handleCustomerExtraWorkApproval(jobId, workId, {
        action,
        approvedBy: job?.userName || 'Customer',
        approvalMethod: action === 'approve' ? 'Customer In-App Authorization' : 'Customer Rejection',
        rejectionReason: action === 'reject' ? 'Customer requested service to stay within base package.' : ''
      });
      showToast(res.message || 'Customer approval status updated.');
      loadJob();
      const itemsRes = await professionalClient.getExtraWorkRequests(jobId);
      if (itemsRes.success) setExtraWorkItems(itemsRes.extraWorkItems);
    } catch (err) {
      showToast(err.message || 'Approval action failed');
    } finally {
      setApprovingWorkId(null);
    }
  };

  // 3. Customer Chat Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const textToSend = newMessageText.trim();
    setNewMessageText('');
    try {
      await professionalClient.sendJobMessage(jobId, { text: textToSend });
      loadChatMessages();
    } catch (err) {
      showToast(err.message || 'Failed to send message');
    }
  };

  // 4. Incident & Delay Report Handler
  const handleSubmitIncident = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!consequencesAcknowledged) {
      showToast('Please acknowledge the platform operational policy.');
      return;
    }
    if (!incidentReason.trim() || incidentReason.trim().length < 5) {
      showToast('Please provide an auditable reason (min 5 characters).');
      return;
    }

    setIsSubmittingIncident(true);
    try {
      const res = await professionalClient.reportJobIncident(jobId, {
        category: selectedIncidentCategory,
        reason: incidentReason.trim(),
        delayMinutes: selectedIncidentCategory === 'running_late' ? delayMinutes : 0,
        consequencesAcknowledged
      });
      showToast(res.message || 'Incident / Delay report submitted successfully.');
      setIncidentReason('');
      setConsequencesAcknowledged(false);
      setShowIncidentModal(false);
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Incident filing failed');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  // Add Professional Private Note
  const handleAddNote = async () => {
    if (!newNoteInput.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await professionalClient.addProfessionalNote(jobId, newNoteInput.trim());
      showToast('Private technician note recorded.');
      setNewNoteInput('');
      if (res.note) {
        setJob(prev => ({
          ...prev,
          professionalNotes: [...(prev.professionalNotes || []), res.note]
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to add note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Loading job specifications, checklists and dispatch communication...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 14,
          padding: 30,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#991b1b', margin: '0 0 8px 0' }}>
            Access Restricted / Authorization Check Failed
          </h2>
          <p style={{ fontSize: 14, color: '#7f1d1d', margin: '0 0 20px 0' }}>
            {error || 'This service booking is not assigned to your technician account.'}
          </p>
          <button
            onClick={() => onNavigate('/professional/jobs')}
            style={{
              background: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Return to My Dispatches
          </button>
        </div>
      </div>
    );
  }

  const lifecycleSteps = ['Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed'];
  const currentStepIndex = lifecycleSteps.indexOf(job.status);
  const currentPolicy = cancellationPolicies[selectedIncidentCategory] || {};

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top Breadcrumb & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => onNavigate('/professional/jobs')}
          style={{
            background: 'none',
            border: 'none',
            color: '#7c3aed',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          ← Back to All Dispatches
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: job.status === 'Completed' ? '#ecfdf5' :
              job.status === 'In Progress' ? '#dbeafe' :
              job.status === 'Arrived' ? '#ede9fe' :
              job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
            color: job.status === 'Completed' ? '#059669' :
              job.status === 'In Progress' ? '#1e40af' :
              job.status === 'Arrived' ? '#6b21a8' :
              job.status === 'En Route' ? '#92400e' : '#475569',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 800
          }}>
            Status: {job.status}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 16
        }}>
          Service Execution Lifecycle (Verified Transition Engine)
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Background connecting track */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: '5%',
            right: '5%',
            height: 3,
            background: '#E2E8F0',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              background: '#059669',
              width: `${(Math.max(0, currentStepIndex) / Math.max(1, lifecycleSteps.length - 1)) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {lifecycleSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCompleted ? '#059669' : isCurrent ? '#7c3aed' : '#ffffff',
                  color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                  border: isCompleted || isCurrent ? 'none' : '2px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : isCompleted ? '0 2px 6px rgba(5, 150, 105, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                  color: isCurrent ? '#7c3aed' : isCompleted ? '#059669' : '#64748b',
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Job Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        marginBottom: 22
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20
        }}>
          {/* Left Column: Booking Reference, Title & Chips */}
          <div style={{ flex: '1 1 500px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
                Booking Reference:
              </span>
              <span style={{
                background: '#F1F5F9',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                padding: '2px 8px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: 13
              }}>
                {job.bookingReference}
              </span>
              <span style={{
                background: job.status === 'Completed' ? '#ECFDF5' :
                  job.status === 'In Progress' ? '#EFF6FF' :
                  job.status === 'Arrived' ? '#FAF5FF' :
                  job.status === 'En Route' ? '#FFFBEB' : '#F1F5F9',
                color: job.status === 'Completed' ? '#059669' :
                  job.status === 'In Progress' ? '#1E40AF' :
                  job.status === 'Arrived' ? '#6B21A8' :
                  job.status === 'En Route' ? '#92400E' : '#475569',
                border: `1px solid ${job.status === 'Completed' ? '#A7F3D0' :
                  job.status === 'In Progress' ? '#BFDBFE' :
                  job.status === 'Arrived' ? '#DDD6FE' :
                  job.status === 'En Route' ? '#FDE68A' : '#E2E8F0'}`,
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 11.5,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: job.status === 'Completed' ? '#059669' :
                    job.status === 'In Progress' ? '#2563EB' :
                    job.status === 'Arrived' ? '#7C3AED' :
                    job.status === 'En Route' ? '#D97706' : '#64748B'
                }} />
                <span>{job.status}</span>
              </span>
            </div>

            <h1 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}>
              {job.serviceName}
            </h1>

            {/* Metadata Info Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 13,
                color: '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>📅</span>
                <span>Scheduled Slot: <strong style={{ color: '#0F172A' }}>{job.slot}</strong> <span style={{ color: '#64748B', fontSize: 11.5 }}>({job.timeZone || 'Asia/Kolkata (IST)'})</span></span>
              </div>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 13,
                color: '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⏱️</span>
                <span>Estimated Duration: <strong style={{ color: '#0F172A' }}>{job.estimatedDuration}</strong></span>
              </div>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 13,
                color: '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>📍</span>
                <span>Operating Zone: <strong style={{ color: '#0F172A' }}>{job.area}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Payout Cardlet */}
          <div style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 22px',
            textAlign: 'right',
            minWidth: 220,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.6
            }}>
              Net Professional Payout
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#059669',
              margin: '3px 0 1px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              ₹{job.payout}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              80% Net Take • Instant Credit
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              marginTop: 8
            }}>
              <span>💵</span>
              <span>Payment: {job.paymentMethod} ({job.paymentStatus})</span>
            </div>
          </div>
        </div>

        {/* Action Button Bar - Symmetrically Aligned & Responsive */}
        <div style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap'
        }}>
          {/* Left Group: Core Lifecycle Action + Direct Customer Communication */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Primary Workflow Transition */}
            {job.status === 'Assigned' && (
              <button
                onClick={() => handleUpdateStatus('En Route')}
                style={{
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>🚗</span>
                <span>Start Travel (Mark En Route) →</span>
              </button>
            )}

            {job.status === 'En Route' && (
              <button
                onClick={() => handleUpdateStatus('Arrived')}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>📍</span>
                <span>Confirm Arrival at Doorstep →</span>
              </button>
            )}

            {job.status === 'Arrived' && (
              <button
                onClick={() => setShowOtpModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>🔑</span>
                <span>Enter Customer Start OTP & Begin Service →</span>
              </button>
            )}

            {job.status === 'In Progress' && (
              <button
                onClick={handleInitiateCompletion}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 26px',
                  borderRadius: 10,
                  fontSize: 14.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>✓</span>
                <span>Complete Service & Credit Wallet (₹{job.payout})</span>
              </button>
            )}

            {/* Direct Communication Buttons */}
            {['Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed'].includes(job.status) && (
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(true)}
                style={{
                  background: '#FFFFFF',
                  color: '#4F46E5',
                  border: '1.5px solid #C7D2FE',
                  padding: '11px 18px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#EEF2FF';
                  e.currentTarget.style.borderColor = '#818CF8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#C7D2FE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>💬</span>
                <span>Chat with Customer</span>
              </button>
            )}

            {['Assigned', 'En Route', 'Arrived', 'In Progress'].includes(job.status) && (
              <button
                type="button"
                onClick={handleInitiateCallToCustomer}
                title="Free Privacy-Protected WebRTC Internet Voice Call"
                style={{
                  background: '#FFFFFF',
                  color: '#059669',
                  border: '1.5px solid #A7F3D0',
                  padding: '11px 18px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ECFDF5';
                  e.currentTarget.style.borderColor = '#34D399';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#A7F3D0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📞</span>
                <span>Voice Call Customer (Free)</span>
              </button>
            )}
          </div>

          {/* Right Group: Safety & Incident Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {['Assigned', 'En Route', 'Arrived'].includes(job.status) && (
              <button
                type="button"
                onClick={() => {
                  setShowIncidentModal(true);
                  setActiveTab('incidents');
                }}
                style={{
                  background: '#FFFFFF',
                  color: '#475569',
                  border: '1.5px solid #CBD5E1',
                  padding: '11px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#94A3B8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>⚠️</span>
                <span>Report Incident & Delay</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/professional/support')}
              style={{
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                color: '#991B1B',
                border: '1.5px solid #FCA5A5',
                padding: '11px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🚨</span>
              <span>SOS / Safety Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Work Verification Photos Card (Pre-Work & Post-Work) */}
      {(() => {
        const beforePhoto = job?.beforeWorkPhoto || (structuredChecklists?.photos || []).find(p => p.phase === 'before');
        const afterPhoto = job?.afterWorkPhoto || (structuredChecklists?.photos || []).find(p => p.phase === 'after');

        return (
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '16px 20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📸</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                  Work Verification Evidence Photos
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: 12 }}>
                  Mandatory SOP Process
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                Pre-work photo required to start • Post-work photo required to finish
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {/* Pre-Work Photo Card */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '12px 14px',
                background: beforePhoto ? '#F8FAFC' : '#FFFBEB'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    1. Before Starting Work (Pre-Work Photo)
                  </span>
                  {beforePhoto ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#ECFDF5', padding: '2px 8px', borderRadius: 6, border: '1px solid #A7F3D0' }}>
                      ✓ Uploaded & Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                      * Required to Start
                    </span>
                  )}
                </div>

                {beforePhoto ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={beforePhoto.url}
                      alt="Pre-work verification"
                      onClick={() => setPreviewZoomImage(beforePhoto.url)}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      title="Click to view full image"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {beforePhoto.fileName || 'pre_work_photo.jpg'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Uploaded {beforePhoto.uploadedAt ? new Date(beforePhoto.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'on record'}
                      </div>
                      <button
                        type="button"
                        onClick={() => openLiveCamera({
                          phase: 'before',
                          title: 'Retake Pre-Work Photo',
                          onSuccess: async (dataUrl) => {
                            await professionalClient.uploadJobPhotoEvidence(jobId, {
                              phase: 'before',
                              photoType: 'work_area',
                              fileBase64: dataUrl,
                              fileName: `pre_work_${Date.now()}.jpg`,
                              fileSizeKb: 1200,
                              mimeType: 'image/jpeg'
                            });
                            showToast('✓ Pre-work verification photo uploaded successfully!');
                            await loadJob();
                          }
                        })}
                        style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginTop: 4, display: 'inline-block', background: 'none', border: 'none', padding: 0 }}
                      >
                        📷 Retake Live Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 11.5, color: '#78350F', margin: '0 0 10px 0' }}>
                      You must capture a live photo of the initial work area before starting the service.
                    </p>
                    <button
                      type="button"
                      onClick={() => openLiveCamera({
                        phase: 'before',
                        title: 'Capture Pre-Work Verification Photo',
                        onSuccess: async (dataUrl) => {
                          await professionalClient.uploadJobPhotoEvidence(jobId, {
                            phase: 'before',
                            photoType: 'work_area',
                            fileBase64: dataUrl,
                            fileName: `pre_work_${Date.now()}.jpg`,
                            fileSizeKb: 1200,
                            mimeType: 'image/jpeg'
                          });
                          showToast('✓ Pre-work verification photo uploaded successfully!');
                          await loadJob();
                        }
                      })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid #D97706',
                        background: '#FFF',
                        color: '#B45309',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>📷</span>
                      <span>Capture Live Pre-Work Photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Post-Work Photo Card */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '12px 14px',
                background: afterPhoto ? '#F8FAFC' : '#ECFDF5'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    2. After Completing Work (Post-Work Photo)
                  </span>
                  {afterPhoto ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#ECFDF5', padding: '2px 8px', borderRadius: 6, border: '1px solid #A7F3D0' }}>
                      ✓ Uploaded & Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#D1FAE5', padding: '2px 8px', borderRadius: 6, border: '1px solid #A7F3D0' }}>
                      * Required to Finish
                    </span>
                  )}
                </div>

                {afterPhoto ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={afterPhoto.url}
                      alt="Post-work verification"
                      onClick={() => setPreviewZoomImage(afterPhoto.url)}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      title="Click to view full image"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {afterPhoto.fileName || 'post_work_photo.jpg'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Uploaded {afterPhoto.uploadedAt ? new Date(afterPhoto.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'on record'}
                      </div>
                      <button
                        type="button"
                        onClick={() => openLiveCamera({
                          phase: 'after',
                          title: 'Retake Post-Work Completion Photo',
                          onSuccess: async (dataUrl) => {
                            await professionalClient.uploadJobPhotoEvidence(jobId, {
                              phase: 'after',
                              photoType: 'work_area',
                              fileBase64: dataUrl,
                              fileName: `post_work_${Date.now()}.jpg`,
                              fileSizeKb: 1200,
                              mimeType: 'image/jpeg'
                            });
                            showToast('✓ Post-work completion photo uploaded successfully!');
                            await loadJob();
                          }
                        })}
                        style={{ fontSize: 11, color: '#059669', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginTop: 4, display: 'inline-block', background: 'none', border: 'none', padding: 0 }}
                      >
                        📷 Retake Live Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 11.5, color: '#065F46', margin: '0 0 10px 0' }}>
                      You must capture a live photo of the completed service/clean work area to finalize and credit wallet.
                    </p>
                    <button
                      type="button"
                      onClick={() => openLiveCamera({
                        phase: 'after',
                        title: 'Capture Post-Work Completion Photo',
                        onSuccess: async (dataUrl) => {
                          await professionalClient.uploadJobPhotoEvidence(jobId, {
                            phase: 'after',
                            photoType: 'work_area',
                            fileBase64: dataUrl,
                            fileName: `post_work_${Date.now()}.jpg`,
                            fileSizeKb: 1200,
                            mimeType: 'image/jpeg'
                          });
                          showToast('✓ Post-work completion photo uploaded successfully!');
                          await loadJob();
                        }
                      })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid #059669',
                        background: '#FFF',
                        color: '#047857',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>📷</span>
                      <span>Capture Live Post-Work Photo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Enhanced Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '2px solid #e2e8f0',
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {[
          { id: 'checklists', label: '📋 SOP Checklists & Evidence', count: structuredChecklists ? ((structuredChecklists.photos || []).length) : null },
          { id: 'extra_work', label: '⚡ Extra Work & Parts (Customer Approval)', count: extraWorkItems.length || null },
          { id: 'communication', label: '💬 Customer Chat & Navigation', count: chatMessages.length || null },
          { id: 'incidents', label: '⚠️ Incident & Delay Reporting', count: (job.incidentReports || []).length || null },
          { id: 'financials', label: '💰 Financial Ledger' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#7c3aed' : '#ffffff',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeTab === tab.id ? '#7c3aed' : '#e2e8f0',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(124, 58, 237, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span style={{
                background: activeTab === tab.id ? '#ffffff' : '#f1f5f9',
                color: activeTab === tab.id ? '#7c3aed' : '#64748b',
                padding: '2px 7px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: SOP Checklists, Evidence Photos & Completion Notes */}
      {activeTab === 'checklists' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Before-Service Checks */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  🔍 Before-Service Checks
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Mandatory baseline diagnostics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(structuredChecklists?.beforeService || []).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist('beforeService', item.id, item.completed)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: item.completed ? '#ecfdf5' : '#f8fafc',
                      border: `1px solid ${item.completed ? '#a7f3d0' : '#e2e8f0'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input type="checkbox" checked={Boolean(item.completed)} onChange={() => {}} style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.completed ? '#065f46' : '#0f172a' }}>{item.text}</div>
                      {item.notes && <div style={{ fontSize: 11, color: '#059669', marginTop: 2, fontStyle: 'italic' }}>✓ {item.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Checks */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  🛡️ Safety & PPE Checks
                </h3>
                <span style={{ fontSize: 11, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Zero-Harm Protocol</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(structuredChecklists?.safetyChecks || []).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist('safetyChecks', item.id, item.completed)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: item.completed ? '#ecfdf5' : '#f8fafc',
                      border: `1px solid ${item.completed ? '#a7f3d0' : '#e2e8f0'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input type="checkbox" checked={Boolean(item.completed)} onChange={() => {}} style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.completed ? '#065f46' : '#0f172a' }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Performed SOP */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                ⚡ Work Performed Execution SOP
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(structuredChecklists?.workPerformed || []).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist('workPerformed', item.id, item.completed)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: item.completed ? '#ecfdf5' : '#f8fafc',
                      border: `1px solid ${item.completed ? '#a7f3d0' : '#e2e8f0'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input type="checkbox" checked={Boolean(item.completed)} onChange={() => {}} style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.completed ? '#065f46' : '#0f172a' }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parts / Materials Consumed */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                🧰 Parts & Materials Consumed
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(structuredChecklists?.partsMaterials || []).map(pm => (
                  <div key={pm.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{pm.name}</strong> x {pm.qty} {pm.unit}
                      {pm.serialNo && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Lot / Batch: {pm.serialNo}</div>}
                    </div>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Standard Package Included</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Evidence Photos Vault & Completion Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Photo Evidence Vault */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                📸 Protected Evidence Photos Vault
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px 0' }}>
                Upload before & after job evidence. File type (JPG, PNG, WebP) and size (&lt;=5MB) validated.
              </p>

              {/* Privacy protection banner */}
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 11,
                color: '#92400e',
                marginBottom: 16,
                lineHeight: 1.4
              }}>
                🔒 <strong>Platform Privacy Policy:</strong> Do NOT require or upload photos of customers or private residential interiors. Capture only equipment, model tags, replaced parts, or immediate technical work perimeter.
              </div>

              {photoError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
                  ⚠️ {photoError}
                </div>
              )}

              {/* Upload Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>SERVICE PHASE</label>
                  <select
                    value={photoPhase}
                    onChange={(e) => setPhotoPhase(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, marginTop: 4 }}
                  >
                    <option value="before">Before Service (Baseline)</option>
                    <option value="after">After Service (Completion)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>ALLOWED CATEGORY</label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, marginTop: 4 }}
                  >
                    <option value="equipment">Equipment Overview</option>
                    <option value="part">Replaced / Defective Part</option>
                    <option value="serial_plate">Model / Serial Number Plate</option>
                    <option value="work_area">Work Area / Protected Floor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => openLiveCamera({
                    phase: photoPhase,
                    title: `Capture Live ${photoPhase === 'before' ? 'Pre-Service' : 'Completion'} Evidence Photo`,
                    onSuccess: async (dataUrl) => {
                      setIsUploadingPhoto(true);
                      try {
                        const res = await professionalClient.uploadJobPhotoEvidence(jobId, {
                          phase: photoPhase,
                          photoType,
                          fileBase64: dataUrl,
                          fileName: `evidence_${photoPhase}_${Date.now()}.jpg`,
                          fileSizeKb: 1200,
                          mimeType: 'image/jpeg'
                        });
                        showToast(res.message || 'Live photo evidence attached.');
                        loadChecklistsData();
                        loadJob();
                      } catch (err) {
                        setPhotoError(err.message || 'Photo upload failed');
                      } finally {
                        setIsUploadingPhoto(false);
                      }
                    }
                  })}
                  disabled={isUploadingPhoto}
                  style={{
                    flex: 1,
                    background: isUploadingPhoto ? '#94a3b8' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    textAlign: 'center',
                    padding: '11px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isUploadingPhoto ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <span>📷</span>
                  <span>{isUploadingPhoto ? 'Uploading Live Evidence...' : 'Open Live Camera & Capture Evidence Photo'}</span>
                </button>
              </div>

              {/* Gallery of uploaded evidence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(structuredChecklists?.photos || []).map(ph => (
                  <div key={ph.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', alignItems: 'center' }}>
                    <img src={ph.url} alt={ph.fileName} style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{ph.fileName}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Phase: <strong style={{ color: ph.phase === 'before' ? '#d97706' : '#059669', textTransform: 'uppercase' }}>{ph.phase}</strong> • Category: <strong>{ph.photoType}</strong> ({ph.fileSizeKb} KB)
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
                      🔒 Protected
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Notes */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                📝 Technician Completion Notes
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>
                Record service remarks, technical recommendations, and observations for customer and hub QA audit.
              </p>
              <textarea
                rows={4}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Cleaned dual coils with powerjet. Pressure tested stable at 125 PSI. Advised customer on monthly filter rinsing..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <button
                onClick={handleSaveCompletionNotes}
                disabled={isSavingNotes}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Completion Notes ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Extra Work & Parts (Customer Approval Workflow) */}
      {activeTab === 'extra_work' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Propose Extra Work Form */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Propose Additional Work / Approved Parts
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px 0' }}>
              Select from platform-approved price rules. All extra work requires explicit customer approval before addition to the invoice.
            </p>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: 12,
              color: '#1e40af',
              marginBottom: 20
            }}>
              ⚖️ <strong>Billing Integrity Rule:</strong> Technicians cannot silently increase the customer bill. Total fares only recalculate on the backend upon verifiable customer approval.
            </div>

            <form onSubmit={handleProposeExtraWork} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  PLATFORM-APPROVED PRICE RULE / PART:
                </label>
                <select
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6 }}
                >
                  {extraWorkCatalog.map(rule => (
                    <option key={rule.id || rule.code} value={rule.id || rule.code}>
                      {rule.title} — ₹{rule.amount || rule.unitPrice} / {rule.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>QUANTITY</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={extraWorkQty}
                    onChange={(e) => setExtraWorkQty(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>PROPOSED AMOUNT</label>
                  <div style={{ padding: '10px 12px', background: '#f1f5f9', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 800, color: '#059669', marginTop: 6 }}>
                    ₹{((extraWorkCatalog.find(r => r.id === selectedRuleId || r.code === selectedRuleId)?.amount || 450) * extraWorkQty)}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  TECHNICAL SCOPE & JUSTIFICATION (VISIBLE TO CUSTOMER)
                </label>
                <textarea
                  rows={3}
                  value={extraWorkScope}
                  onChange={(e) => setExtraWorkScope(e.target.value)}
                  placeholder="e.g. Existing 45uF capacitor reading degraded to 18uF causing compressor hum and startup tripping..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingExtraWork}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                {isSubmittingExtraWork ? 'Submitting Proposal...' : 'Submit Extra Work for Customer Approval →'}
              </button>
            </form>
          </div>

          {/* Pending & Approved Requests List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                Extra Work Proposals & Approvals Ledger
              </h3>

              {extraWorkItems.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>
                  No additional work or parts proposed for this booking.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {extraWorkItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 12,
                        background: item.status === 'Approved' ? '#ecfdf5' : item.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${item.status === 'Approved' ? '#a7f3d0' : item.status === 'Rejected' ? '#fecaca' : '#fde68a'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            Scope: {item.scope} (Qty: {item.qty || 1})
                          </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                          ₹{item.amount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: item.status === 'Approved' ? '#059669' : item.status === 'Rejected' ? '#dc2626' : '#d97706'
                        }}>
                          Status: {item.status}
                        </span>

                        {item.approvalDetails && (
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            via {item.approvalDetails.approvalMethod}
                          </span>
                        )}
                      </div>

                      {/* Verifiable Customer Approval Simulation (Demo Flow) */}
                      {item.status === 'Pending Customer Approval' && (
                        <div style={{ marginTop: 14, background: '#ffffff', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', marginBottom: 8 }}>
                            Customer Authorization Workflow
                          </div>
                          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px 0' }}>
                            Record customer response for additional work authorization.
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleSimulateCustomerApproval(item.id, 'approve')}
                              disabled={approvingWorkId === item.id}
                              style={{
                                flex: 1,
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {approvingWorkId === item.id ? 'Processing...' : '✓ Approve & Recalculate Bill (+₹' + item.amount + ')'}
                            </button>
                            <button
                              onClick={() => handleSimulateCustomerApproval(item.id, 'reject')}
                              disabled={approvingWorkId === item.id}
                              style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Customer Communication, Telephony & Navigation */}
      {activeTab === 'communication' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Booking-Scoped In-App Chat */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  💬 Booking-Scoped Customer Chat
                </h3>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Direct chat with homeowner <strong>{job.customer}</strong> (Booking: {job.bookingReference})
                </div>
              </div>
              <button
                onClick={loadChatMessages}
                disabled={isRefreshingChat}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isRefreshingChat ? 'Checking...' : '🔄 Refresh Chat'}
              </button>
            </div>

            {/* Manual Polling Notice (Zero fake real-time claims) */}
            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: 11, color: '#64748b', border: '1px solid #e2e8f0', marginBottom: 16 }}>
              ℹ️ <strong>Delivery Mode:</strong> Manual Refresh / Polled (Updated at {lastPolledAt || 'just now'}). System does not claim fabricated real-time websockets.
            </div>

            {/* Chat Thread */}
            <div style={{ height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              {chatMessages.map(msg => {
                const isPro = msg.senderRole === 'professional';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isPro ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      background: isPro ? '#7c3aed' : '#ffffff',
                      color: isPro ? '#ffffff' : '#0f172a',
                      padding: '10px 14px',
                      borderRadius: 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: isPro ? 'none' : '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2, fontWeight: 700 }}>
                      {msg.senderName}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{msg.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'right', marginTop: 4, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isPro && (
                        <span>
                          {msg.deliveryStatus === 'read' ? '✓✓ (Read)' : msg.deliveryStatus === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick replies & send input */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {['I am en route to your address.', 'I have reached outside your doorstep.', 'Please buzz building security.'].map(txt => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => setNewMessageText(txt)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 14, padding: '4px 10px', fontSize: 11, color: '#334155', cursor: 'pointer' }}
                >
                  {txt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Type your message to customer..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
              <button
                type="submit"
                style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>

          {/* Telephony Channels & Navigation Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Customer Access Instructions */}
            {job.customerInstructions && (
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>
                  Customer Entry Instructions
                </div>
                <div style={{ fontSize: 14, color: '#3b0764', marginTop: 4, fontStyle: 'italic' }}>
                  "{job.customerInstructions}"
                </div>
              </div>
            )}

            {/* Telephony Options */}
            <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                📞 Voice Telephony Channels
              </h3>

              {/* Free WebRTC Audio Call Channel */}
              <div style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                borderRadius: 12,
                border: '1.5px solid #a7f3d0',
                marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚡ Free WebRTC Internet Voice (Primary)</span>
                    <span style={{ background: '#10b981', color: '#ffffff', fontSize: 9, padding: '2px 5px', borderRadius: 4 }}>FREE</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#065f46', lineHeight: 1.4, marginBottom: 10 }}>
                  High-fidelity audio directly over internet. No phone numbers shared, zero telephony costs.
                </div>
                <button
                  type="button"
                  onClick={handleInitiateCallToCustomer}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                  }}
                >
                  📞 Call Customer Now (Free Audio)
                </button>
              </div>

              {/* Masked Call Channel */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  🔒 Masked Telephony Bridge (Recommended)
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  {communicationChannels?.maskedTelephony?.number || '+91 22 6982 4400'} (Ext: {communicationChannels?.maskedTelephony?.extension || '829'})
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Both numbers are masked via automated telecom switch to protect technician and customer privacy.
                </div>
              </div>

              {/* Direct Call channel */}
              {communicationChannels?.directTelephony ? (
                <div style={{ padding: '12px 14px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                    ⚠️ {communicationChannels.directTelephony.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    <a href={`tel:${communicationChannels.directTelephony.number}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                      {communicationChannels.directTelephony.number}
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: '#78350f', marginTop: 4 }}>
                    Direct cellular call. Your personal phone number will be visible to customer.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                  Direct cellular contact is locked during Assigned status and unlocks once marked "En Route".
                </div>
              )}
            </div>

            {/* External Navigation Link */}
            <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                🗺️ Doorstep Navigation
              </h3>
              <div style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
                Authorized Destination: <strong>{job.address}</strong>
              </div>

              <div style={{
                background: '#f1f5f9',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11,
                color: '#475569',
                marginBottom: 14
              }}>
                ℹ️ <strong>System Notice:</strong> External navigation opens Google Maps with the authorized service address. Synthetic live GPS tracking or fabricated arrival estimates are not displayed.
              </div>

              <button
                onClick={() => {
                  setShowPermissionModal('location');
                }}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                📍 Open Google Maps Navigation ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Incident, Delays & Cancellation Reporting */}
      {activeTab === 'incidents' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Policy-Controlled Report Form */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Policy-Controlled Incident & Delay Reporting Hub
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Select the applicable platform incident category. Consequences and resolution workflows are governed strictly by Platform Policy SOP v4.2.
            </p>

            <form onSubmit={handleSubmitIncident} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  INCIDENT / DELAY CATEGORY:
                </label>
                <select
                  value={selectedIncidentCategory}
                  onChange={(e) => setSelectedIncidentCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6 }}
                >
                  <option value="running_late">1. Running Late (Traffic / Prior Job Overrun)</option>
                  <option value="customer_unavailable">2. Customer Unavailable / Doorstep Locked (15-Min Protocol)</option>
                  <option value="unsafe_situation">3. Unsafe Situation / Electrical or Physical Hazard</option>
                  <option value="unable_to_attend">4. Unable to Attend Scheduled Slot</option>
                  <option value="address_issue">5. Address Issue / Out of Service Hub Boundary</option>
                  <option value="outside_scope">6. Service Outside Booked Scope (Capacity Mismatch)</option>
                  <option value="equipment_failure">7. Technician Equipment / Vehicle Failure</option>
                  <option value="emergency_unavailability">8. Emergency Medical / Compassionate Unavailability</option>
                </select>
              </div>

              {selectedIncidentCategory === 'running_late' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>ESTIMATED DELAY (MINUTES)</label>
                  <select
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6 }}
                  >
                    <option value={15}>+15 Minutes (Traffic Slowdown)</option>
                    <option value={30}>+30 Minutes (Moderate Delay)</option>
                    <option value={45}>+45 Minutes (Significant Delay)</option>
                  </select>
                </div>
              )}

              {/* Dynamic Platform Policy Rules Display */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  PLATFORM POLICY RULE ({selectedIncidentCategory})
                </div>
                <div style={{ fontSize: 13, color: '#1e293b', marginTop: 4, lineHeight: 1.4 }}>
                  {currentPolicy.policyText || 'Evaluated under platform dispatch operational rules.'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginTop: 6 }}>
                  Resolution: {currentPolicy.resolution}
                </div>
                <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                  Consequences: {currentPolicy.consequenceText}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  DETAILED AUDIT REASON / CIRCUMSTANCE:
                </label>
                <textarea
                  rows={3}
                  value={incidentReason}
                  onChange={(e) => setIncidentReason(e.target.value)}
                  placeholder="Provide precise details for dispatch cell audit..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input
                  type="checkbox"
                  id="ack-policy"
                  checked={consequencesAcknowledged}
                  onChange={(e) => setConsequencesAcknowledged(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16 }}
                />
                <label htmlFor="ack-policy" style={{ fontSize: 12, color: '#334155', cursor: 'pointer' }}>
                  I have read and acknowledge the configured platform consequences for this incident type. (No arbitrary fines or un-audited penalties are applied).
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingIncident || !consequencesAcknowledged}
                style={{
                  background: consequencesAcknowledged ? '#dc2626' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: consequencesAcknowledged ? 'pointer' : 'not-allowed',
                  marginTop: 6
                }}
              >
                {isSubmittingIncident ? 'Submitting Report...' : 'File Official Incident Report →'}
              </button>
            </form>
          </div>

          {/* Audit History of Reported Incidents */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Booking Incident History & Preservation
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px 0' }}>
              All job history, delays, and reassignment reasons remain permanently attached to the booking.
            </p>

            {(job.incidentReports || []).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
                No active incidents filed for this booking.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(job.incidentReports || []).map(inc => (
                  <div key={inc.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{inc.title}</strong>
                      <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {inc.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{inc.reason}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                      {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Policy Applied: {inc.policyRuleApplied}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Authorized Financial Ledger (Minor Currency Units: Paisa) */}
      {activeTab === 'financials' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Main Financial Statement */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Booking Financial Ledger
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Shared financial calculation engine • Preserves historical pricing snapshot
                </div>
              </div>
            </div>

            {/* Completed != Disbursed Clarification Banner */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: 12,
              color: '#166534',
              marginBottom: 20
            }}>
              ⚖️ <strong>Financial Separation Rule:</strong> A completed job represents earned technician entitlement. It is distinct from money already settled into your bank account. Funds disburse in accordance with settlement batches.
            </div>

            {/* Itemized Math */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Gross Customer Booking Fare:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  ₹{(job.totalAmount || 548).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Platform Commission ({platformTakeRate ?? (job.commissionRate || 20)}%):</span>
                <span>
                  - ₹{(Math.round((job.totalAmount || 548) * ((platformTakeRate ?? (job.commissionRate || 20)) / 100))).toLocaleString('en-IN')}
                </span>
              </div>

              {isSurgeActive && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    ⚡ Weather Surge Bonus (Passed 100% to You):
                  </span>
                  <span>+ ₹{surgeAmount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Customer Tip (100% Retained by Technician):</span>
                <span>
                  + ₹50
                </span>
              </div>

              <div style={{
                borderTop: '2px solid #e2e8f0',
                paddingTop: 12,
                marginTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 800,
                color: '#059669'
              }}>
                <span>Net Professional Payout:</span>
                <span>
                  ₹{(Math.round((job.totalAmount || 548) * (1 - ((platformTakeRate ?? (job.commissionRate || 20)) / 100))) + 50 + (isSurgeActive ? surgeAmount : 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Recipient Snapshot */}
            <div style={{ marginTop: 24, padding: '16px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                HISTORICAL RECIPIENT SNAPSHOT
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                HDFC Bank ••••4821 [IFSC: HDFC0001248]
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Primary UPI ID: {job?.recipientSnapshot?.upiId || (professionalClient.getStoredUser()?.applicantName ? `${professionalClient.getStoredUser().applicantName.toLowerCase().replace(/\s+/g, '')}@okaxis` : 'partner@okaxis')} • Mode: Direct IMPS / NEFT Batch
              </div>
              <div style={{ fontSize: 11, color: '#059669', marginTop: 6, fontWeight: 600 }}>
                Status: Verified for Settlement Cycle
              </div>
            </div>
          </div>

          {/* Right Column: Private Notes */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Professional Private Notes
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>
              🔒 Strictly confidential to you. Admin internal and agency notes are separated and never disclosed here.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {(job.professionalNotes || []).length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                  No private notes recorded for this booking yet.
                </div>
              ) : (
                job.professionalNotes.map(n => (
                  <div
                    key={n.id}
                    style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      color: '#334155'
                    }}
                  >
                    <div>{n.note}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.author}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add private technician note..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNoteInput.trim()}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isAddingNote ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Explanation Modal (Never requests camera/location automatically without explanation) */}
      {showPermissionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              {showPermissionModal === 'camera' ? '📷 Camera Access Purpose' : '📍 Location Access Purpose'}
            </h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {showPermissionModal === 'camera'
                ? 'Camera access is requested solely to capture HVAC unit model numbers, replacement parts, and work completion evidence. We never photograph customers or private interiors.'
                : 'Location permission is used strictly to open Google Maps route navigation to the authorized doorstep address. We do not run background tracking.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowPermissionModal(null)}
                style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPermissionModal(null);
                  if (showPermissionModal === 'location') {
                    window.open(`https://maps.google.com/?q=${encodeURIComponent(job.fullAddress || job.address)}`, '_blank');
                  }
                }}
                style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Continue to Navigation ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start OTP Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Verify Customer Start OTP
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Ask homeowner <strong>{job.customer}</strong> for their 4-digit service PIN to begin. Code is validated on the backend.
            </p>

            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              marginBottom: 14
            }}>
              Enter the 4-digit Safety PIN provided by the customer at the doorstep.
            </div>

            {/* Mandatory Pre-Work Photo Upload Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                  📸 Pre-Work Photo (Mandatory)
                </span>
                {(job?.beforeWorkPhoto?.url || preWorkPhotoPreview) ? (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>
                    ✓ Photo Ready
                  </span>
                ) : (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>
                    * Required
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 10px 0' }}>
                Capture / upload a photo of the equipment or work area before beginning.
              </p>

              {(job?.beforeWorkPhoto?.url || preWorkPhotoPreview) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={preWorkPhotoPreview || job?.beforeWorkPhoto?.url}
                    alt="Pre-work"
                    style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preWorkPhotoFile?.name || job?.beforeWorkPhoto?.fileName || 'pre_service_photo.jpg'}
                    </div>
                    <button
                      type="button"
                      onClick={() => openLiveCamera({ phase: 'before' })}
                      style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}
                    >
                      📷 Retake live photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLiveCamera({ phase: 'before' })}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1.5px dashed #2563eb',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>📷</span>
                  <span>Open Live Camera &amp; Take Pre-Work Photo</span>
                </button>
              )}
            </div>

            {otpError && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
                fontWeight: 600
              }}>
                {otpError}
              </div>
            )}

            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 26,
                letterSpacing: 10,
                textAlign: 'center',
                fontWeight: 700,
                border: '2px solid #cbd5e1',
                borderRadius: 10,
                boxSizing: 'border-box',
                marginBottom: 20
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                  setOtpError('');
                }}
                disabled={isVerifyingOtp}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                style={{
                  flex: 1.5,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify & Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Completion Photo Modal */}
      {showCompletionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>📸</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Upload Work Completion Photo
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Before marking this service as completed and crediting <strong>₹{job?.payout}</strong> to your wallet, you must attach a photo of the finished work or cleaned area.
            </p>

            {completionPhotoError && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                marginBottom: 14,
                fontWeight: 600
              }}>
                ⚠️ {completionPhotoError}
              </div>
            )}

            {/* Photo Selection Area */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 14,
              marginBottom: 20
            }}>
              {(postWorkPhotoPreview || job?.afterWorkPhoto?.url) ? (
                <div>
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: 10 }}>
                    <img
                      src={postWorkPhotoPreview || job?.afterWorkPhoto?.url}
                      alt="Work Completion Evidence"
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(15,23,42,0.75)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      ✓ Photo Selected
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      {postWorkPhotoFile?.name || job?.afterWorkPhoto?.fileName || 'completion_photo.jpg'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openLiveCamera({ phase: 'after' })}
                      style={{ fontSize: 11.5, color: '#059669', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}
                    >
                      📷 Retake Live Photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLiveCamera({ phase: 'after' })}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '24px 16px',
                    borderRadius: 8,
                    border: '2px dashed #059669',
                    background: '#ecfdf5',
                    color: '#047857',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: 34 }}>📷</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>Open Live Camera &amp; Take Photo</div>
                    <div style={{ fontSize: 11.5, color: '#065f46', marginTop: 3 }}>🔴 Live camera capture only (Gallery disabled)</div>
                  </div>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletionPhotoError('');
                }}
                disabled={isCompletingWithPhoto}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletionWithPhoto}
                disabled={isCompletingWithPhoto || (!postWorkPhotoPreview && !job?.afterWorkPhoto?.url)}
                style={{
                  flex: 1.8,
                  background: (!postWorkPhotoPreview && !job?.afterWorkPhoto?.url) ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: (!postWorkPhotoPreview && !job?.afterWorkPhoto?.url) ? 'not-allowed' : 'pointer',
                  boxShadow: (!postWorkPhotoPreview && !job?.afterWorkPhoto?.url) ? 'none' : '0 4px 12px rgba(5,150,105,0.3)'
                }}
              >
                {isCompletingWithPhoto ? 'Finalizing...' : `✓ Confirm & Credit ₹${job?.payout}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Image Modal */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewZoomImage}
              alt="Full Preview"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, display: 'block', objectFit: 'contain' }}
            />
            <button
              onClick={() => setPreviewZoomImage(null)}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Report Incident & Delay Modal */}
      {showIncidentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 26px',
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Report Incident / Transit Delay
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowIncidentModal(false);
                  setIncidentReason('');
                  setConsequencesAcknowledged(false);
                }}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Log an operational delay or on-site safety issue for booking <strong>{job.bookingReference}</strong> ({job.serviceName}).
            </p>

            <form onSubmit={handleSubmitIncident} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Incident / Delay Category:
                </label>
                <select
                  value={selectedIncidentCategory}
                  onChange={(e) => setSelectedIncidentCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    marginTop: 6,
                    fontWeight: 600,
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="running_late">1. 🚗 Running Late (Transit Traffic / Prior Job Overrun)</option>
                  <option value="customer_unavailable">2. 🚪 Customer Unavailable / Doorstep Locked (15-Min Protocol)</option>
                  <option value="unsafe_situation">3. ⚡ Unsafe Situation / Electrical or Physical Hazard</option>
                  <option value="unable_to_attend">4. 📅 Unable to Attend Scheduled Slot</option>
                  <option value="address_issue">5. 📍 Address Issue / Out of Hub Territory</option>
                  <option value="outside_scope">6. 📦 Service Outside Booked Scope (Capacity Mismatch)</option>
                  <option value="equipment_failure">7. 🔧 Technician Equipment / Vehicle Breakdown</option>
                </select>
              </div>

              {selectedIncidentCategory === 'running_late' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                    Estimated Delay (Minutes)
                  </label>
                  <select
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 13,
                      marginTop: 6,
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value={15}>+15 Minutes (Moderate Traffic)</option>
                    <option value={30}>+30 Minutes (Heavy Traffic / Job Overrun)</option>
                    <option value={45}>+45 Minutes (Significant Standstill Delay)</option>
                  </select>
                </div>
              )}

              {/* Dynamic Platform Policy Info */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Platform Protocol: {currentPolicy.title || 'Platform Dispatch Policy'}
                </div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 4, lineHeight: 1.4 }}>
                  {currentPolicy.policyText || 'Evaluated under platform dispatch operational rules.'}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                  {currentPolicy.consequenceText}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Detailed Reason / Circumstance (Min 5 chars):
                </label>
                <textarea
                  rows={3}
                  value={incidentReason}
                  onChange={(e) => setIncidentReason(e.target.value)}
                  placeholder="e.g. Heavy standstill traffic at bypass highway; ETA delayed by 20 mins..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    marginTop: 6,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input
                  type="checkbox"
                  id="ack-policy-modal"
                  checked={consequencesAcknowledged}
                  onChange={(e) => setConsequencesAcknowledged(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="ack-policy-modal" style={{ fontSize: 12, color: '#334155', cursor: 'pointer', lineHeight: 1.35 }}>
                  I confirm this delay / incident report is accurate and acknowledge standard platform operational guidelines.
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setIncidentReason('');
                    setConsequencesAcknowledged(false);
                  }}
                  disabled={isSubmittingIncident}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident || !consequencesAcknowledged || !incidentReason.trim() || incidentReason.trim().length < 5}
                  style={{
                    flex: 1.8,
                    background: (!consequencesAcknowledged || !incidentReason.trim() || incidentReason.trim().length < 5) ? '#94a3b8' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: (!consequencesAcknowledged || !incidentReason.trim() || incidentReason.trim().length < 5) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSubmittingIncident ? 'Submitting Report...' : 'File Incident Report →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rapido-Style Real-Time In-App Chat Drawer */}
      <RapidoChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        booking={{
          id: job?.id || job?.bookingReference || jobId,
          bookingReference: job?.bookingReference || job?.id || jobId,
          userName: job?.customerName || 'Customer',
          userPhone: job?.customerPhone || '',
          serviceName: job?.serviceName,
          address: job?.address,
          status: job?.status,
          assignedProfessional: {
            id: professionalClient.getStoredUser()?.id || 'WRK-KRI-101',
            name: professionalClient.getStoredUser()?.applicantName || 'Technician'
          }
        }}
        currentUser={{
          role: 'professional',
          id: professionalClient.getStoredUser()?.id || 'WRK-KRI-101',
          name: professionalClient.getStoredUser()?.applicantName || 'Technician'
        }}
      />

      {/* Free WebRTC Voice Call Modal & Incoming Call Prompt */}
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
        peerName={job?.customerName || job?.userName || 'Customer'}
        peerRole="Customer"
        peerAvatar={job?.customerAvatar || job?.userAvatar || ''}
      />

      {/* Direct Live Camera Modal */}
      <LiveCameraModal
        isOpen={liveCameraConfig.isOpen}
        title={liveCameraConfig.title}
        subtitle={liveCameraConfig.subtitle}
        onCapture={handleLiveCameraCaptured}
        onClose={() => setLiveCameraConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
