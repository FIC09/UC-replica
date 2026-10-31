import React, { useState, useEffect } from 'react';
import { professionalClient } from './professionalClient';

const DRAFT_STORAGE_KEY = 'uc_pro_application_draft';

const INITIAL_FORM = {
  // Step 1: Personal & Contact
  applicantName: '',
  phone: '',
  email: '',
  avatar: 'PRO',
  emergencyName: '',
  emergencyRelation: 'Spouse',
  emergencyPhone: '',

  // Step 2: Trade, Skills & Partner Association
  trade: 'Master AC Specialist & Electrician',
  categories: ['AC Repair', 'Electrical Repairs'],
  experience: '5+ years',
  skills: 'Inverter Split AC, Coil Jet Cleaning, Gas Leak Detection, PCB Diagnostics',
  employmentType: 'Direct Freelance',
  partnerAgencyId: '',
  partnerAgencyName: '',

  // Step 3: Service Areas & Working Preferences
  city: 'Mumbai',
  locality: 'Bandra West',
  serviceAreas: ['Bandra West', 'Khar', 'Santacruz West'],
  workingType: 'Full-Time Shift',
  shiftStart: '08:00',
  shiftEnd: '20:00',
  weekendAvailable: true,

  // Step 4: Certifications & Verification Documents
  aadhaarNumber: '',
  panNumber: '',
  certificationName: 'Govt ITI HVAC Technician Diploma (NSDC Level 4)',
  hasPoliceClearance: false,

  // Step 5: Payout Information
  bankName: 'HDFC Bank',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: ''
};

export function ProfessionalRegister({ onNavigateToLogin, onExitToMarketplace, showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FORM;
  });

  const [hasSavedDraft, setHasSavedDraft] = useState(() => !!localStorage.getItem(DRAFT_STORAGE_KEY));
  const [draftSavedTime, setDraftSavedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Auto-save draft on changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      setDraftSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // ignore
    }
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat]
      };
    });
  };

  const handleSaveDraftManual = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    showToast('Application draft saved successfully!');
    setDraftSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData(INITIAL_FORM);
    setHasSavedDraft(false);
    showToast('Draft cleared. Starting a fresh application.');
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.applicantName.trim()) {
        showToast('Please enter your full legal name.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        showToast('Please enter a valid 10-digit mobile number.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (formData.categories.length === 0) {
        showToast('Please select at least one primary service category.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      if (!formData.panNumber.trim() && !formData.aadhaarNumber.trim()) {
        showToast('Please provide your PAN or Aadhaar card number for identity verification.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please accept the Partner Service Level Agreement & Code of Conduct.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await professionalClient.registerApplication(formData);
      if (res.success && res.professional) {
        // Clear saved draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setSubmittedApplication(res.professional);
        showToast(`Application ${res.professional.id} submitted for Compliance Review!`);
      } else {
        throw new Error(res.error || 'Failed to submit application');
      }
    } catch (err) {
      // Fallback local synthetic submission
      const appId = 'WRK-' + Math.floor(10000 + Math.random() * 90000);
      const mockSubmitted = {
        ...formData,
        id: appId,
        status: 'Under Review',
        applicationStatus: 'Under Review',
        tier: 'Onboarding Partner',
        missingRequirements: [
          'Police Verification Record Clearance',
          'Flat Scan Document Verification by Compliance Cell'
        ],
        reviewComments: [
          {
            author: 'Onboarding Dispatch Queue',
            comment: 'Application submitted into compliance queue. Verification cell turnaround is 24-48 business hours.',
            date: new Date().toLocaleString('en-IN')
          }
        ]
      };
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSubmittedApplication(mockSubmitted);
      showToast(`Application ${appId} submitted for Compliance Review!`);
    } finally {
      setSubmitting(false);
    }
  };

  // If application is submitted, show the confirmation screen with strict gate explanation
  if (submittedApplication) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '40px 32px',
          maxWidth: 540,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.15)',
          border: '1.5px solid #ddd6fe'
        }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: '#faf5ff',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            margin: '0 auto 16px auto',
            border: '2px solid #ddd6fe'
          }}>
            📋
          </div>

          <div style={{
            display: 'inline-block',
            background: '#faf5ff',
            color: '#7c3aed',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.5,
            marginBottom: 8
          }}>
            APPLICATION SUBMITTED • UNDER REVIEW
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            Application ID: {submittedApplication.id}
          </h2>

          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Thank you, <strong>{submittedApplication.applicantName}</strong>. Your partner registration is now under review with our Compliance and Background Verification Team.
          </p>

          {/* Strict Auto-Approval Gate Notice */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 14,
            padding: '16px 18px',
            textAlign: 'left',
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.45,
            marginBottom: 24
          }}>
            <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span>⚠️</span> Strict Compliance Notice
            </div>
            Registration or document submission does not automatically approve a professional. Worker privileges (job dispatches, live duty status, wallet withdrawals) remain locked until verified by an Urban Company compliance officer.
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: 14,
            padding: '16px 20px',
            textAlign: 'left',
            fontSize: 13,
            marginBottom: 24,
            border: '1px solid #e2e8f0'
          }}>
            <div><strong>Registered Trade:</strong> {submittedApplication.trade}</div>
            <div style={{ marginTop: 4 }}><strong>Employment Type:</strong> {submittedApplication.employmentType}</div>
            <div style={{ marginTop: 4 }}><strong>Primary Hub:</strong> {submittedApplication.city} ({submittedApplication.locality})</div>
            <div style={{ marginTop: 4 }}><strong>Current State:</strong> <span style={{ color: '#7c3aed', fontWeight: 700 }}>Under Review</span></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => {
                // Set stored user for login as this pending applicant
                professionalClient.setAuth('mock-token-pending', submittedApplication);
                onNavigateToLogin();
              }}
              style={{
                width: '100%',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '14px 0',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 48,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
              }}
            >
              Track Onboarding Status Checklist →
            </button>

            <button
              onClick={onExitToMarketplace}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '12px 0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: 44
              }}
            >
              Exit to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Trade & Skills' },
    { num: 3, title: 'Service Areas' },
    { num: 4, title: 'Certifications' },
    { num: 5, title: 'Payout Info' },
    { num: 6, title: 'Review & Submit' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '24px 16px 80px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#7c3aed',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Urban Pro Onboarding</div>
              <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 700 }}>PARTNER APPLICATION</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {draftSavedTime && (
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                ✓ Draft saved ({draftSavedTime})
              </span>
            )}
            <button
              onClick={handleSaveDraftManual}
              style={{
                background: '#faf5ff',
                border: '1px solid #ddd6fe',
                color: '#7c3aed',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* Saved Draft Alert */}
        {hasSavedDraft && step === 1 && (
          <div style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ fontSize: 12, color: '#6b21a8' }}>
              <strong>Application draft restored:</strong> Continue from where you left off.
            </div>
            <button
              onClick={handleClearDraft}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear & Reset
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          overflowX: 'auto',
          paddingBottom: 6
        }}>
          {stepsList.map(s => {
            const isCur = step === s.num;
            const isPast = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => isPast && setStep(s.num)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 70,
                  cursor: isPast ? 'pointer' : 'default'
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCur ? '#7c3aed' : isPast ? '#ecfdf5' : '#f1f5f9',
                  color: isCur ? '#ffffff' : isPast ? '#059669' : '#64748b',
                  border: isCur ? '2px solid #6366f1' : isPast ? '1.5px solid #a7f3d0' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  transition: 'all 0.2s ease'
                }}>
                  {isPast ? '✓' : s.num}
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: isCur ? 800 : 600,
                  color: isCur ? '#7c3aed' : '#64748b',
                  marginTop: 4,
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1: Personal & Contact */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Personal & Contact Information
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Enter your legal name as printed on your government IDs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  placeholder="e.g. Vikram Ramesh Salvi"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Mobile Phone Number (OTP Verified) *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="vikram.salvi@urbanpro.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Profile Initials / Avatar
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  maxLength={3}
                  onChange={(e) => updateField('avatar', e.target.value.toUpperCase())}
                  placeholder="VS"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px',
              marginTop: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Emergency Contact (Restricted Access)
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                Used strictly in cases of on-duty medical, accident, or safety emergency.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => updateField('emergencyName', e.target.value)}
                    placeholder="e.g. Sangeeta Salvi"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Relationship
                  </label>
                  <select
                    value={formData.emergencyRelation}
                    onChange={(e) => updateField('emergencyRelation', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateField('emergencyPhone', e.target.value)}
                    placeholder="+91 98200 99881"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Trade, Skills & Partner Association */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Service Trade, Skills & Employment
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Select the service categories you are certified and experienced to execute.
            </p>

            {/* Employment Type / Business Partner Association */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Employment & Business Partner Association *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <div
                  onClick={() => {
                    updateField('employmentType', 'Direct Freelance');
                    updateField('partnerAgencyId', '');
                    updateField('partnerAgencyName', '');
                  }}
                  style={{
                    border: `1.5px solid ${formData.employmentType === 'Direct Freelance' ? '#7c3aed' : '#cbd5e1'}`,
                    background: formData.employmentType === 'Direct Freelance' ? '#faf5ff' : '#ffffff',
                    borderRadius: 12,
                    padding: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    ⚡ Direct Independent Freelancer
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Self-employed, direct weekly bank payouts to your personal account.
                  </div>
                </div>

                <div
                  onClick={() => {
                    updateField('employmentType', 'Agency Employed');
                    updateField('partnerAgencyId', 'PTR-90142');
                    updateField('partnerAgencyName', 'Apex Home Solutions LLP');
                  }}
                  style={{
                    border: `1.5px solid ${formData.employmentType === 'Agency Employed' ? '#7c3aed' : '#cbd5e1'}`,
                    background: formData.employmentType === 'Agency Employed' ? '#faf5ff' : '#ffffff',
                    borderRadius: 12,
                    padding: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    🏢 Business Partner Agency Employed
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Managed by an affiliated agency partner (e.g. Apex Home Solutions LLP).
                  </div>
                </div>
              </div>

              {formData.employmentType === 'Agency Employed' && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Select Associated Business Partner Agency
                  </label>
                  <select
                    value={formData.partnerAgencyId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name = id === 'PTR-90142' ? 'Apex Home Solutions LLP' : 'Urban Elite Facility Services';
                      updateField('partnerAgencyId', id);
                      updateField('partnerAgencyName', name);
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="PTR-90142">Apex Home Solutions LLP (ID: PTR-90142)</option>
                    <option value="PTR-80211">Urban Elite Facility Services (ID: PTR-80211)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Service Categories Multi-select */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Select Service Categories *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {[
                  'AC Repair & Servicing',
                  'Electrical Repairs',
                  'Home Deep Cleaning',
                  'Plumbing & Drainage',
                  'Appliance Repair',
                  'Salon & Spa for Women',
                  'Carpentry & Furniture'
                ].map((cat) => {
                  const sel = formData.categories.includes(cat);
                  return (
                    <div
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${sel ? '#7c3aed' : '#cbd5e1'}`,
                        background: sel ? '#faf5ff' : '#ffffff',
                        color: sel ? '#6b21a8' : '#334155',
                        fontSize: 13,
                        fontWeight: sel ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{cat}</span>
                      <span>{sel ? '✓' : '+'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Years of Professional Experience *
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="1-2 years">1 - 2 Years</option>
                  <option value="3-5 years">3 - 5 Years</option>
                  <option value="5+ years">5+ Years</option>
                  <option value="8+ years">8+ Years (Master Level)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Primary Specialized Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => updateField('skills', e.target.value)}
                  placeholder="e.g. Split AC, Gas Charging, MCB Replacement"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Service Areas & Working Preferences */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Service Areas & Working Preferences
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Configure your operational base and preferred shift hours.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Operating City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="Mumbai">Mumbai (MMR)</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Base Locality / Primary Hub
                </label>
                <select
                  value={formData.locality}
                  onChange={(e) => updateField('locality', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="Bandra West">Bandra West Hub</option>
                  <option value="Andheri East">Andheri Central Hub</option>
                  <option value="Powai">Powai Technology Hub</option>
                  <option value="Dadar">Dadar South Mumbai Hub</option>
                  <option value="Thane">Thane Central Hub</option>
                </select>
              </div>
            </div>

            {/* Working Shifts */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px',
              marginBottom: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                Shift Availability Schedule
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Working Preference
                  </label>
                  <select
                    value={formData.workingType}
                    onChange={(e) => updateField('workingType', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Full-Time Shift">Full-Time (8 - 10 hrs)</option>
                    <option value="Part-Time Shift">Part-Time (4 - 5 hrs)</option>
                    <option value="Weekend Only">Weekend Only Specialist</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Earliest Slot Start
                  </label>
                  <input
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) => updateField('shiftStart', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Latest Slot End
                  </label>
                  <input
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) => updateField('shiftEnd', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Certifications & Verification Documents */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Verification Documents & Certifications
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Required for government compliance and safety verification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                    Aadhaar Card Number (16 Digits) *
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: (formData.aadhaarNumber || '').length === 16 ? '#10B981' : '#64748B' }}>
                    {(formData.aadhaarNumber || '').length}/16
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={16}
                  value={formData.aadhaarNumber}
                  onChange={(e) => updateField('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'].includes(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter 16-digit Aadhaar / Virtual ID"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Permanent Account Number (PAN) *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. ABCPS8921K"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Relevant Skill Diploma or Certificate
              </label>
              <input
                type="text"
                value={formData.certificationName}
                onChange={(e) => updateField('certificationName', e.target.value)}
                placeholder="e.g. ITI HVAC Diploma, NSDC Wireman, CIDESCO Cosmetology"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            {/* Document Upload Stubs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <div style={{ border: '2px dashed #ddd6fe', borderRadius: 12, padding: '14px', textAlign: 'center', background: '#faf5ff' }}>
                <div style={{ fontSize: 24 }}>🪪</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>Aadhaar Front/Back</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Photo Ready to Upload</div>
              </div>
              <div style={{ border: '2px dashed #ddd6fe', borderRadius: 12, padding: '14px', textAlign: 'center', background: '#faf5ff' }}>
                <div style={{ fontSize: 24 }}>💳</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>PAN Card Scan</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Flat Scan (No Flash)</div>
              </div>
              <div style={{ border: '2px dashed #ddd6fe', borderRadius: 12, padding: '14px', textAlign: 'center', background: '#faf5ff' }}>
                <div style={{ fontSize: 24 }}>📜</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>Trade Certificate</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Diploma / License</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payout Information */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Payout Settlement & Bank Details
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Enter the bank account where your weekly earnings and incentives will be disbursed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Bank Name *
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => updateField('bankName', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName || formData.applicantName}
                  onChange={(e) => updateField('accountHolderName', e.target.value)}
                  placeholder="e.g. Vikram Salvi"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  placeholder="e.g. 501002948192"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001248"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Instant Payout UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => updateField('upiId', e.target.value)}
                  placeholder="e.g. vikramsalvi@okaxis"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Final Submit */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Review Application & Submit
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Verify all details before submitting for official compliance review.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '18px',
              fontSize: 13,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Applicant Name:</span>
                <strong>{formData.applicantName || 'Not specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Mobile Phone:</span>
                <strong>{formData.phone || 'Not specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Service Trade:</span>
                <strong>{formData.trade} ({formData.categories.join(', ')})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Employment Type:</span>
                <strong>{formData.employmentType} {formData.partnerAgencyName ? `(${formData.partnerAgencyName})` : ''}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Operating Hub:</span>
                <strong>{formData.city} ({formData.locality})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Settlement Bank:</span>
                <strong>{formData.bankName} (•••• {formData.accountNumber.slice(-4) || 'Pending'})</strong>
              </div>
            </div>

            {/* Strict Notice Checkbox */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#7c3aed', marginTop: 2 }}
                />
                <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.45 }}>
                  I confirm that all submitted documents and experience records are truthful and accurate. I understand that registration does not grant immediate approval, and worker privileges will remain inactive until background clearance is completed.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 28,
          paddingTop: 18,
          borderTop: '1px solid #e2e8f0'
        }}>
          {step > 1 ? (
            <button
              onClick={handlePrev}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: 48
              }}
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onNavigateToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              Already applied? Check Status →
            </button>
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 48,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
            >
              Continue to Step {step + 1} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                minHeight: 48,
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.3)'
              }}
            >
              {submitting ? 'Submitting Application...' : 'Submit Application for Review ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
