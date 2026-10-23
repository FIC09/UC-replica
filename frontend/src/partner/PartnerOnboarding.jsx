import React, { useState, useEffect } from 'react';
import { 
  Building2, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  FileText, ArrowRight, ArrowLeft, Save, Send, Upload, RefreshCw, 
  CreditCard, ShieldAlert, XCircle, Info, HelpCircle
} from 'lucide-react';
import { partnerClient } from './partnerClient';

export function PartnerOnboarding({ partner, onNavigate, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [statusData, setStatusData] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    businessName: partner?.businessName || '',
    businessType: partner?.businessType || 'LLP',
    ownerName: partner?.ownerName || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    registeredAddress: partner?.registeredAddress || '',
    serviceCategories: partner?.serviceCategories || ['AC Repair & Servicing', 'Refrigerator Repair'],
    city: partner?.city || 'Mumbai',
    coverageZones: (partner?.coverageZones || ['Bandra West', 'Khar West']).join(', '),
    teamSize: '6-15 professionals',
    gstNumber: partner?.gstNumber || '',
    panNumber: partner?.panNumber || '',
    cinNumber: partner?.cinNumber || '',
    bankName: partner?.settlementAccount?.bankName || 'HDFC Bank Ltd',
    accountHolderName: partner?.settlementAccount?.accountHolderName || partner?.businessName || '',
    accountNumber: partner?.settlementAccount?.accountNumber || '',
    ifscCode: partner?.settlementAccount?.ifscCode || '',
    accountType: 'Current Corporate Account'
  });

  const [documentChecklist, setDocumentChecklist] = useState([
    { id: 'doc-coi', name: 'Certificate of Incorporation / Partnership Deed', status: 'Submitted', required: true, fileName: 'coi_incorporation.pdf' },
    { id: 'doc-gst', name: 'GST Registration Certificate (GSTIN)', status: 'Submitted', required: true, fileName: 'gst_certificate.pdf' },
    { id: 'doc-pan', name: 'Company PAN Card', status: 'Submitted', required: true, fileName: 'company_pan.pdf' },
    { id: 'doc-bank', name: 'Cancelled Cheque / Bank Statement', status: 'Submitted', required: true, fileName: 'cancelled_cheque.pdf' },
    { id: 'doc-msa', name: 'Signed Master Franchise Agreement', status: 'Pending Review', required: false, fileName: 'franchise_sla_v1.pdf' }
  ]);

  const [correctionNotes, setCorrectionNotes] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await partnerClient.getOnboardingStatus();
      if (res && res.success) {
        setStatusData(res);
        if (res.onboarding?.documentChecklist) {
          setDocumentChecklist(res.onboarding.documentChecklist);
        }
      }
    } catch (err) {
      console.warn('Could not load onboarding status:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const onboarding = statusData?.onboarding || partner?.onboarding || {
    state: partner?.status || 'Under Review',
    progress: partner?.status === 'Approved' ? 100 : 75,
    missingInfo: [],
    submissionHistory: [
      { version: 1, submittedAt: new Date(Date.now() - 86400000), status: partner?.status || 'Under Review', notes: 'Application packet undergoing verification' }
    ],
    reviewFeedback: 'Your documentation is undergoing compliance check with platform administrators.',
    requiredCorrections: []
  };

  const currentState = statusData?.status || partner?.status || onboarding.state || 'Under Review';

  async function handleSaveDraft() {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        coverageZones: formData.coverageZones.split(',').map(s => s.trim()),
        documentChecklist
      };
      const res = await partnerClient.saveOnboardingDraft(payload);
      if (res && res.success) {
        showToast?.('Draft progress saved successfully!');
        loadStatus();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        coverageZones: formData.coverageZones.split(',').map(s => s.trim()),
        documentChecklist
      };
      const res = await partnerClient.submitOnboarding(payload);
      if (res && res.success) {
        showToast?.('Onboarding packet submitted successfully! Your application is now Under Review.');
        loadStatus();
      }
    } catch (err) {
      showToast?.(err.message || 'Submission failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitCorrections() {
    setSaving(true);
    try {
      const res = await partnerClient.submitOnboardingCorrections({
        correctedFields: {
          gstNumber: formData.gstNumber,
          registeredAddress: formData.registeredAddress
        },
        correctionNotes: correctionNotes || 'Re-uploaded high-resolution verification documents and corrected address.',
        updatedDocumentChecklist: documentChecklist.map(doc => ({
          ...doc,
          status: doc.status === 'Correction Required' ? 'Re-submitted (Under Review)' : doc.status
        }))
      });
      if (res && res.success) {
        showToast?.('Corrections submitted successfully! Application is now Under Review.');
        loadStatus();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit corrections');
    } finally {
      setSaving(false);
    }
  }

  function handleUploadSimulated(docId) {
    setDocumentChecklist(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'Uploaded (Ready)',
          fileName: `uploaded_${d.id}_${Date.now().toString().slice(-4)}.pdf`
        };
      }
      return d;
    }));
    showToast?.('File uploaded and staged for verification.');
  }

  const stateColors = {
    'Draft': { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569', badgeBg: '#e2e8f0', badgeText: '#334155' },
    'Submitted': { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', badgeBg: '#dbeafe', badgeText: '#1e40af' },
    'Under Review': { bg: '#fffbeb', border: '#fde68a', text: '#b45309', badgeBg: '#fef3c7', badgeText: '#92400e' },
    'Changes Requested': { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', badgeBg: '#ffedd5', badgeText: '#9a3412' },
    'Approved': { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', badgeBg: '#dcfce7', badgeText: '#166534' },
    'Rejected': { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', badgeBg: '#fee2e2', badgeText: '#991b1b' },
    'Suspended': { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badgeBg: '#fee2e2', badgeText: '#7f1d1d' }
  };

  const theme = stateColors[currentState] || stateColors['Under Review'];

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner with State & Progress */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '24px 28px',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: theme.badgeBg,
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentState === 'Approved' ? <CheckCircle2 size={28} /> :
               currentState === 'Suspended' ? <ShieldAlert size={28} /> :
               currentState === 'Changes Requested' ? <AlertTriangle size={28} /> :
               currentState === 'Rejected' ? <XCircle size={28} /> :
               <Clock size={28} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: theme.badgeBg,
                  color: theme.badgeText
                }}>
                  {currentState}
                </span>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Reference: #{partner?.id || statusData?.partnerId || 'PTR-90145'}
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '6px 0 0' }}>
                {partner?.businessName || formData.businessName || 'Business Partner Onboarding'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={loadStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Status
            </button>
            <button
              onClick={() => onNavigate('/partner/support')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#0f172a',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={14} /> Partner Support Desk
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
            <span>Application Completion Progress</span>
            <span>{onboarding.progress}%</span>
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${onboarding.progress}%`,
              height: '100%',
              background: currentState === 'Approved' ? '#16a34a' : currentState === 'Changes Requested' ? '#ea580c' : '#7c3aed',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Feedback / Review Alert Banner */}
        {onboarding.reviewFeedback && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 8,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            fontSize: 13.5,
            color: theme.text,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Compliance Review Notes:</strong> {onboarding.reviewFeedback}
            </div>
          </div>
        )}

        {/* Required Corrections Banner if Changes Requested */}
        {currentState === 'Changes Requested' && onboarding.requiredCorrections?.length > 0 && (
          <div style={{
            marginTop: 12,
            padding: '14px 18px',
            borderRadius: 8,
            background: '#fff7ed',
            border: '1px solid #fdba74',
            fontSize: 13.5
          }}>
            <strong style={{ color: '#9a3412', display: 'block', marginBottom: 6 }}>
              Required Corrections Before Approval:
            </strong>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#c2410c' }}>
              {onboarding.requiredCorrections.map((corr, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <strong>{corr.field}:</strong> {corr.issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suspended Notice Banner */}
        {currentState === 'Suspended' && (
          <div style={{
            marginTop: 14,
            padding: '14px 18px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            fontSize: 13.5,
            color: '#991b1b'
          }}>
            <strong>Operational Suspension Notice:</strong> {statusData?.suspensionReason || partner?.suspensionReason || 'Operational dispatch privileges temporarily suspended pending compliance audit review.'}
            <div style={{ marginTop: 8 }}>
              Permitted action: You may access Partner Support Desk to submit verification renewal documents.
            </div>
          </div>
        )}
      </div>

      {/* Multi-step Navigation Form */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {/* Step Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          overflowX: 'auto'
        }}>
          {[
            { num: 1, title: '1. Business Profile' },
            { num: 2, title: '2. Scope & Coverage' },
            { num: 3, title: '3. Registration & Tax' },
            { num: 4, title: '4. Document Checklist' },
            { num: 5, title: '5. Settlement Account' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              style={{
                flex: 1,
                padding: '14px 16px',
                border: 'none',
                background: activeStep === s.num ? '#ffffff' : 'transparent',
                borderBottom: activeStep === s.num ? '2px solid #7c3aed' : '2px solid transparent',
                color: activeStep === s.num ? '#7c3aed' : '#64748b',
                fontWeight: activeStep === s.num ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Step Body */}
        <div style={{ padding: 24 }}>
          {/* STEP 1: Business Profile */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                Business Entity & Primary Contact
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. Apex Home Solutions LLP"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  >
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
                    <option value="Partnership Firm">Registered Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Owner / Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. Sandeep Patil"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Official Business Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="contact@apexhome.in"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="+91 98210 33411"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Registered Business Office Address *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.registeredAddress}
                    onChange={e => setFormData({ ...formData, registeredAddress: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                    placeholder="Unit 401, Technopolis IT Park, Mahakali Caves Road, Andheri East, Mumbai 400093"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scope & Coverage */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                Requested Service Categories & Geographic Coverage
              </h2>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                  Requested Service Categories (Select All That Apply)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {[
                    'AC Repair & Servicing',
                    'Refrigerator Repair',
                    'Washing Machine Care',
                    'Full Home Deep Cleaning',
                    'Pest Control & Fumigation',
                    'Electrical & Wiring Diagnostics',
                    'Plumbing & Drainage Care'
                  ].map(cat => {
                    const isSelected = formData.serviceCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => {
                          const updated = isSelected
                            ? formData.serviceCategories.filter(c => c !== cat)
                            : [...formData.serviceCategories, cat];
                          setFormData({ ...formData, serviceCategories: updated });
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: isSelected ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                          background: isSelected ? '#f5f3ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 13
                        }}
                      >
                        <input type="checkbox" checked={isSelected} readOnly />
                        <span style={{ fontWeight: isSelected ? 600 : 400, color: '#0f172a' }}>{cat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Operating City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Team-Size Information *
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={e => setFormData({ ...formData, teamSize: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  >
                    <option value="1-5 professionals">1 - 5 field technicians</option>
                    <option value="6-15 professionals">6 - 15 field technicians</option>
                    <option value="16-50 professionals">16 - 50 field technicians (Fleet Tier)</option>
                    <option value="50+ professionals">50+ field technicians (Enterprise Master Tier)</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Requested Coverage Zones / Localities (Comma separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.coverageZones}
                    onChange={e => setFormData({ ...formData, coverageZones: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. Bandra West, Khar West, Santacruz West, Andheri West"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Registration & Tax */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                Corporate Registration & Tax Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Company PAN Number *
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. AABCA1234F"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    GSTIN / Tax Identification *
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. 27AABCA1234F1Z8"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    CIN / LLP Identification Number
                  </label>
                  <input
                    type="text"
                    value={formData.cinNumber}
                    onChange={e => setFormData({ ...formData, cinNumber: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. AAQ-8492-MH"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Document Checklist (Configurable) */}
          {activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                  Configurable Verification Document Checklist
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Upload clear corporate copies. Only necessary enterprise documents are requested.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {documentChecklist.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: doc.status === 'Correction Required' ? '#fff7ed' : '#f8fafc',
                      border: doc.status === 'Correction Required' ? '1px solid #fdba74' : '1px solid #e2e8f0',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileText size={20} color={doc.status === 'Correction Required' ? '#c2410c' : '#7c3aed'} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{doc.name}</strong>
                          {doc.required && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>*Required</span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          File: {doc.fileName || 'Not yet uploaded'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: doc.status === 'Approved' ? '#ecfdf5' : doc.status === 'Correction Required' ? '#fee2e2' : '#f1f5f9',
                        color: doc.status === 'Approved' ? '#16a34a' : doc.status === 'Correction Required' ? '#dc2626' : '#475569'
                      }}>
                        {doc.status}
                      </span>
                      <button
                        onClick={() => handleUploadSimulated(doc.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Upload size={13} /> {doc.fileName ? 'Replace' : 'Upload File'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Settlement Account Workflow */}
          {activeStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                  Restricted Settlement Account Details
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Bank account for agency commission settlements. Must match corporate incorporation deeds.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. HDFC Bank Ltd"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Account Holder Name (MCA Entity Match) *
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. Apex Home Solutions LLP"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Corporate Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. 5020008492019"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    placeholder="e.g. HDFC0000001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Changes Requested: Correction Notes input box */}
          {currentState === 'Changes Requested' && (
            <div style={{ marginTop: 24, padding: '16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
                Compliance Correction Response Notes:
              </label>
              <textarea
                rows={2}
                value={correctionNotes}
                onChange={e => setCorrectionNotes(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                placeholder="Explain the changes made (e.g. Re-uploaded clear 300dpi scan of GST Certificate, verified address pincode)."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(prev => prev - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={15} /> Previous Step
              </button>
            )}
            {activeStep < 5 && (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Next Step <ArrowRight size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                background: '#ffffff',
                border: '1px solid #7c3aed',
                color: '#7c3aed',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Save size={15} /> Save Progress (Draft)
            </button>

            {currentState === 'Changes Requested' ? (
              <button
                onClick={handleSubmitCorrections}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={15} /> Submit Required Corrections
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={15} /> Submit for Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submission History Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
          Onboarding Submission History
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', color: '#64748b' }}>Version</th>
                <th style={{ padding: '10px 14px', color: '#64748b' }}>Timestamp</th>
                <th style={{ padding: '10px 14px', color: '#64748b' }}>Resulting State</th>
                <th style={{ padding: '10px 14px', color: '#64748b' }}>Auditor / System Notes</th>
              </tr>
            </thead>
            <tbody>
              {(onboarding.submissionHistory || []).map((sh, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>v{sh.version || idx + 1}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>
                    {new Date(sh.submittedAt || Date.now()).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: sh.status === 'Approved' ? '#ecfdf5' : '#fef3c7',
                      color: sh.status === 'Approved' ? '#16a34a' : '#b45309'
                    }}>
                      {sh.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155' }}>
                    {sh.notes || 'Submitted for compliance assessment.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
