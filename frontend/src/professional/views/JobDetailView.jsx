import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';
import { RapidoChatDrawer } from '../../components/RapidoChatDrawer';

export function JobDetailView({ jobId, onNavigate, showToast }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'extra_work' | 'communication' | 'incidents' | 'financials'
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  // Start OTP verification modal
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Reassignment Modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignReason, setReassignReason] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

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

  // Lifecycle Transitions
  const handleUpdateStatus = async (newStatus, otp) => {
    try {
      await professionalClient.updateJobStatus(jobId, newStatus, otp);
      showToast(`Job status updated to "${newStatus}"`);
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter a 4-digit code provided by the customer.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await professionalClient.updateJobStatus(jobId, 'In Progress', otpInput.trim());
      showToast('Start OTP verified! Job is now In Progress.');
      setShowOtpModal(false);
      setOtpInput('');
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
        approvalMethod: action === 'approve' ? 'Customer App In-App Authorization (Demo Flow)' : 'Customer App Rejection',
        isDemo: true,
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

  // 4. Incident / Cancellation Report Handler
  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!consequencesAcknowledged) {
      showToast('Please review and acknowledge the platform consequence policy.');
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
      showToast(res.message || 'Incident reported to Dispatch Cell.');
      setIncidentReason('');
      setConsequencesAcknowledged(false);
      loadJob();
    } catch (err) {
      showToast(err.message || 'Incident filing failed');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  // Legacy Reassignment Submission
  const handleSubmitReassignment = async () => {
    if (!reassignReason || reassignReason.trim().length < 5) {
      showToast('Please enter a valid reason (min 5 characters).');
      return;
    }

    setIsSubmittingReassign(true);
    try {
      const res = await professionalClient.requestReassignment(jobId, reassignReason);
      showToast(res.message || 'Reassignment request submitted.');
      setShowReassignModal(false);
      setReassignReason('');
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Reassignment request failed.');
    } finally {
      setIsSubmittingReassign(false);
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
          {job.reassignmentRequest?.status === 'Pending' && (
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              ⚠️ Reassignment Pending Review
            </span>
          )}

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
        padding: '18px 24px',
        border: '1px solid #e2e8f0',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
          Service Execution Lifecycle (Verified Transition Engine)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {lifecycleSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCompleted ? '#059669' : isCurrent ? '#7c3aed' : '#f1f5f9',
                  color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : 'none'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#7c3aed' : isCompleted ? '#059669' : '#64748b',
                  marginTop: 6,
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
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              Booking Reference: <strong style={{ color: '#0f172a' }}>{job.bookingReference}</strong>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 6px 0' }}>
              {job.serviceName}
            </h1>
            <div style={{ fontSize: 14, color: '#334155' }}>
              Scheduled Slot: <strong>{job.slot}</strong> ({job.timeZone || 'Asia/Kolkata (IST)'})
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Estimated Duration: <strong>{job.estimatedDuration}</strong> • Operating Zone: <strong>{job.area}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
              ₹{job.payout}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Net Professional Payout (80%)
            </div>
            <div style={{
              display: 'inline-block',
              background: '#ecfdf5',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              marginTop: 4
            }}>
              Payment: {job.paymentMethod} ({job.paymentStatus})
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {job.status === 'Assigned' && (
            <button
              onClick={() => handleUpdateStatus('En Route')}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.2)'
              }}
            >
              🚗 Start Travel (Mark En Route) →
            </button>
          )}

          {job.status === 'En Route' && (
            <button
              onClick={() => handleUpdateStatus('Arrived')}
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              📍 Confirm Arrival at Doorstep →
            </button>
          )}

          {job.status === 'Arrived' && (
            <button
              onClick={() => setShowOtpModal(true)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              🔑 Enter Customer Start OTP & Begin Service →
            </button>
          )}

          {job.status === 'In Progress' && (
            <button
              onClick={() => handleUpdateStatus('Completed')}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
              }}
            >
              ✓ Complete Service & Credit Wallet (₹{job.payout})
            </button>
          )}

          {['Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed'].includes(job.status) && (
            <button
              type="button"
              onClick={() => setIsChatDrawerOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
              }}
            >
              💬 Chat with Customer
            </button>
          )}

          {['Assigned', 'En Route', 'Arrived'].includes(job.status) && (
            <button
              onClick={() => setActiveTab('incidents')}
              style={{
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '12px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⚠️ Report Incident / Delay / Reassign
            </button>
          )}

          <button
            onClick={() => onNavigate('/professional/support')}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '12px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🚨 SOS / Safety Dispatch
          </button>
        </div>
      </div>

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
          { id: 'incidents', label: '⚠️ Delays & Policy Actions', count: (job.incidentReports || []).length || null },
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
                <label style={{
                  flex: 1,
                  background: isUploadingPhoto ? '#94a3b8' : '#7c3aed',
                  color: '#ffffff',
                  textAlign: 'center',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isUploadingPhoto ? 'not-allowed' : 'pointer'
                }}>
                  {isUploadingPhoto ? 'Validating & Uploading...' : '📁 Choose & Upload Photo Evidence (Max 5MB)'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingPhoto}
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
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
                            🧪 Verifiable Customer Approval Workflow (Demo Flow)
                          </div>
                          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px 0' }}>
                            Simulate customer response on mobile app. Does not impersonate; explicitly tagged in audit history.
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
              Policy-Controlled Delay, Incident & Reassignment Hub
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Select the applicable platform incident category. Consequences and resolution workflows are governed strictly by Platform Policy SOP v4.2.
            </p>

            <form onSubmit={handleSubmitIncident} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  INCIDENT / POLICY ACTION CATEGORY:
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
                  <option value="reassignment_request">8. Dispatch Reassignment Request</option>
                  <option value="emergency_unavailability">9. Emergency Medical / Compassionate Unavailability</option>
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
                <span>Platform Commission ({job.commissionRate || 20}%):</span>
                <span>
                  - ₹{(job.platformCommission || Math.round((job.totalAmount || 548) * 0.2)).toLocaleString('en-IN')}
                </span>
              </div>

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
                  ₹{((job.payout || 438) + 50).toLocaleString('en-IN')}
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
                Primary UPI ID: vikramsalvi@okaxis • Mode: Direct IMPS / NEFT Batch
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
              marginBottom: 16
            }}>
              💡 <strong>Demo Code:</strong> Enter <strong>4829</strong> to simulate live customer authorization.
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

      {/* Legacy Reassignment Request Modal */}
      {showReassignModal && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Submit Reassignment Request
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Provide a clear reason why this booking ({job.bookingReference}) needs reassignment by the Dispatch Operations Cell.
            </p>

            <textarea
              rows={4}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Specialized 3-phase commercial multimeter needed / transit breakdown..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
                marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowReassignModal(false)}
                disabled={isSubmittingReassign}
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
                onClick={handleSubmitReassignment}
                disabled={isSubmittingReassign || !reassignReason.trim()}
                style={{
                  flex: 1.5,
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSubmittingReassign ? 'Submitting...' : 'Submit to Dispatch'}
              </button>
            </div>
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
    </div>
  );
}
