import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  DollarSign, 
  Briefcase, 
  Award, 
  Sparkles, 
  Building2, 
  MapPin, 
  Check, 
  FileText, 
  Users, 
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';
import { partnerApi } from '../api/apiClient';

export function PartnerOnboardingModal({
  isOpen,
  onClose,
  onPartnerApplied,
  selectedCity = 'Mumbai'
}) {
  const [step, setStep] = useState(1); // 1: Business Details, 2: Fleet & Documentation, 3: Success

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [businessType, setBusinessType] = useState('Partnership / LLP');
  const [selectedCategory, setSelectedCategory] = useState('ac-appliances');
  const [fleetSize, setFleetSize] = useState('6-15 Technicians');
  const [coverageLocalities, setCoverageLocalities] = useState('Bandra, Andheri, Powai');
  const [gstNumber, setGstNumber] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState('150-300 jobs/month');
  const [submittedPartnerApp, setSubmittedPartnerApp] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleNext(e) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please provide your registered Company / Business Name.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter the Managing Partner / Director name.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit business phone number.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid official business email address (e.g. operations@agency.in) for partner login.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please create a secure password of at least 6 characters for your partner portal login.');
      return;
    }
    setError('');
    setStep(2);
  }

  function handleSubmitPartner(e) {
    e.preventDefault();
    const cleanGst = gstNumber.trim().toUpperCase();
    if (cleanGst && cleanGst.length !== 10 && cleanGst.length !== 15) {
      setError('Please provide a valid 10-character Company PAN (e.g. AABCB1234K) or 15-character Business GSTIN (e.g. 27AABCA1234F1Z5).');
      return;
    }
    setError('');
    const catObj = CATEGORIES.find(c => c.id === selectedCategory);
    const newPartnerApp = {
      id: `PTR-${Date.now().toString().slice(-5)}`,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      phone: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      businessType,
      category: selectedCategory,
      categoryName: catObj ? catObj.name : 'Multi-Service Fleet',
      fleetSize,
      city: `${coverageLocalities}, ${selectedCity}`,
      gstNumber: gstNumber.trim() || 'GST Pending Verification',
      monthlyCapacity,
      appliedAt: new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: 'Pending Review'
    };

    setSubmittedPartnerApp(newPartnerApp);
    if (onPartnerApplied) {
      onPartnerApplied(newPartnerApp);
    }
    // Also dispatch directly to partnerApi for immediate backend persistence
    partnerApi.submit(newPartnerApp).catch(err => console.warn('Direct partnerApi submit sync:', err));
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setBusinessName('');
    setOwnerName('');
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setGstNumber('');
    setError('');
    setSubmittedPartnerApp(null);
  }

  return (
    <div className="onboarding-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#0F172A',
        color: '#F8FAFC',
        width: '100%',
        maxWidth: 780,
        maxHeight: '92vh',
        borderRadius: 0,
        border: '1px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 65%, #064E3B 120%)',
          padding: '20px 24px',
          borderBottom: '1px solid #1E293B',
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              width: 32,
              height: 32,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(110, 66, 229, 0.2)',
            border: '1px solid #A78BFA',
            color: '#A78BFA',
            padding: '3px 10px',
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 8
          }}>
            <Building2 size={13} />
            <span>ENTERPRISE & FLEET PARTNER NETWORK</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: -0.5 }}>
            Partner Onboarding — Register Service Business or Fleet
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
            Scale your service company, agency or technician fleet with guaranteed Urban Company enterprise order dispatch.
          </p>

          {/* Stepper */}
          {step < 3 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{
                flex: 1,
                padding: '6px 12px',
                background: step === 1 ? '#6E42E5' : '#1E293B',
                color: step === 1 ? '#fff' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>1. Business Details</span>
              </div>
              <div style={{
                flex: 1,
                padding: '6px 12px',
                background: step === 2 ? '#6E42E5' : '#1E293B',
                color: step === 2 ? '#fff' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>2. Fleet Capacity & Compliance</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 0,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#FCA5A5',
              fontSize: 12.5,
              fontWeight: 700,
              marginBottom: 16
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS & FOUNDER DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              {/* Partner Business Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                background: '#131D33',
                border: '1px solid #1E293B',
                padding: '14px 18px',
                borderRadius: 0,
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>Order Dispatch</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#A78BFA' }}>High-Volume</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Direct API booking routing</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>Fleet Dashboard</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981' }}>Live Tracking</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Real-time technician GPS</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>Payout Frequency</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#FBBF24' }}>Weekly Direct</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>T+2 automated settlement</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Company / Business / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Multi-Services Fleet LLP"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Managing Partner / Director Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Khurana"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Business Contact Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(digits);
                      if (error) setError('');
                    }}
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
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: error && phoneNumber.length !== 10 ? '1px solid #EF4444' : '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                      Only 10 digits allowed
                    </span>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 600,
                      color: phoneNumber.length === 10 ? '#10B981' : '#94A3B8' 
                    }}>
                      {phoneNumber.length}/10
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Mail size={14} color="#8B5CF6" />
                    <span>Official Email Address (for Portal Login) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operations@apexservices.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Your enterprise login username on the partner portal
                  </div>
                </div>
              </div>

              {/* Password and Entity Structure Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Lock size={14} color="#8B5CF6" />
                    <span>Create Portal Password (min. 6 characters) *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter a secure password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      style={{
                        width: '100%',
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: 0,
                        padding: '10px 40px 10px 14px',
                        color: '#FFFFFF',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Used along with your official email to log in once approved
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Entity Structure / Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Partnership / LLP">Partnership / LLP</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Franchise Operator">Franchise Operator</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                  Primary Business Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 0,
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: 13.5
                  }}
                >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 0,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.15s'
                }}
              >
                <span>Continue to Fleet & Compliance (Step 2 of 2)</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: FLEET CAPACITY & COMPLIANCE */}
          {step === 2 && (
            <form onSubmit={handleSubmitPartner}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Fleet / Technician Team Size
                  </label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  >
                    <option value="1-5 Technicians">1–5 Technicians (Small Fleet)</option>
                    <option value="6-15 Technicians">6–15 Technicians (Growing Agency)</option>
                    <option value="16-50 Technicians">16–50 Technicians (Established Enterprise)</option>
                    <option value="50+ Technicians">50+ Technicians (Large Multi-hub Partner)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Monthly Order Capacity
                  </label>
                  <select
                    value={monthlyCapacity}
                    onChange={(e) => setMonthlyCapacity(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  >
                    <option value="50-150 jobs/month">50–150 jobs / month</option>
                    <option value="150-300 jobs/month">150–300 jobs / month</option>
                    <option value="300-600 jobs/month">300–600 jobs / month</option>
                    <option value="600+ jobs/month">600+ jobs / month</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    City & Coverage Localities
                  </label>
                  <input
                    type="text"
                    value={coverageLocalities}
                    onChange={(e) => setCoverageLocalities(e.target.value)}
                    placeholder="e.g. Bandra, Andheri, Powai, Juhu"
                    style={{
                      width: '100%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 0,
                      padding: '10px 14px',
                      color: '#FFFFFF',
                      fontSize: 13.5
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>
                      Business GSTIN or Company PAN
                    </label>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: (gstNumber.length === 10 || gstNumber.length === 15) ? '#10B981' : '#94A3B8'
                    }}>
                      {gstNumber.length === 10 ? '✓ 10-char PAN' : (gstNumber.length === 15 ? '✓ 15-char GSTIN' : `${gstNumber.length}/15`)}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      maxLength={15}
                      autoCapitalize="characters"
                      placeholder="e.g. 27AABCA1234F1Z5 or AABCB1234K"
                      value={gstNumber}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                        setGstNumber(clean);
                        if (error) setError('');
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[a-zA-Z0-9]/.test(e.key) &&
                          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: '100%',
                        background: '#1E293B',
                        border: error && gstNumber && gstNumber.length !== 10 && gstNumber.length !== 15 ? '1px solid #EF4444' : ((gstNumber.length === 10 || gstNumber.length === 15) ? '1px solid #10B981' : '1px solid #334155'),
                        borderRadius: 0,
                        padding: '10px 38px 10px 14px',
                        color: '#FFFFFF',
                        fontSize: 13.5,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        outline: 'none'
                      }}
                    />
                    {(gstNumber.length === 10 || gstNumber.length === 15) && (
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Max 15 characters. Enter 10-char PAN (e.g. AABCB1234K) or 15-char GSTIN (e.g. 27AABCA1234F1Z5).
                  </div>
                </div>
              </div>

              {/* B2B Partner SLA Agreement */}
              <div style={{
                background: 'rgba(110, 66, 229, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '14px 16px',
                borderRadius: 0,
                marginBottom: 20,
                fontSize: 12.5,
                color: '#EDE9FE',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#A78BFA" />
                  <span>Urban Company Enterprise Partner Agreement</span>
                </div>
                Registered business partners receive bulk dispatch orders, priority settlement, access to the Partner Pro ERP dashboard, and dedicated Urban Company account manager assistance.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 0,
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#94A3B8',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 0,
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.15s'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Submit Partner Registration (Direct to Admin)</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 3 && submittedPartnerApp && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'rgba(110, 66, 229, 0.2)',
                border: '2px solid #8B5CF6',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} color="#A78BFA" />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 8 }}>
                Partner Registration Received!
              </h3>
              <p style={{ fontSize: 13.5, color: '#94A3B8', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Thank you, <strong style={{ color: '#fff' }}>{submittedPartnerApp.businessName}</strong>. Your partner fleet registration has been routed directly to the Urban Company Operations Admin Hub for enterprise verification and order allocation.
              </p>

              {/* Application Details Summary Card */}
              <div style={{
                background: '#131D33',
                border: '1px solid #1E293B',
                borderRadius: 0,
                padding: '16px 20px',
                maxWidth: 480,
                margin: '0 auto 18px',
                textAlign: 'left',
                fontSize: 13
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Partner ID:</span>
                  <strong style={{ color: '#A78BFA' }}>{submittedPartnerApp.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Official Login Email:</span>
                  <strong style={{ color: '#38BDF8' }}>{submittedPartnerApp.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Account Password:</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>•••••••• (Configured & Saved)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Managing Director:</span>
                  <span style={{ color: '#fff' }}>{submittedPartnerApp.ownerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Category & Fleet:</span>
                  <strong style={{ color: '#fff' }}>{submittedPartnerApp.categoryName} ({submittedPartnerApp.fleetSize})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ color: '#94A3B8' }}>Current Status:</span>
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#F59E0B',
                    border: '1px solid #F59E0B',
                    padding: '2px 8px',
                    borderRadius: 0,
                    fontSize: 11,
                    fontWeight: 800
                  }}>
                    ● Awaiting Admin Approval
                  </span>
                </div>
              </div>

              {/* Admin Verification Notice */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '12px 16px',
                maxWidth: 480,
                margin: '0 auto 20px',
                textAlign: 'left',
                fontSize: 12.5,
                color: '#D1FAE5',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, color: '#34D399', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} />
                  <span>Submitted to Admin Operations Dashboard</span>
                </div>
                Your agency profile and credentials have been forwarded to the Admin Dashboard. Once the operations team verifies and clicks <strong>Approve Agency</strong>, your full Partner ERP dashboard will be unlocked.
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('uc_partner_token', 'TOKEN-' + submittedPartnerApp.id);
                      localStorage.setItem('uc_partner_id', submittedPartnerApp.id);
                      localStorage.setItem('uc_partner_profile', JSON.stringify(submittedPartnerApp));
                      localStorage.setItem('uc_partner_staff', JSON.stringify({
                        id: 'STF-OWNER-01',
                        partnerId: submittedPartnerApp.id,
                        name: submittedPartnerApp.ownerName,
                        role: 'Business Owner',
                        status: 'Pending Review'
                      }));
                    } catch {}
                    handleReset();
                    onClose();
                    window.history.pushState({}, '', '/partner');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  style={{
                    background: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 0,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(110, 66, 229, 0.3)'
                  }}
                >
                  <span>Go to Partner Dashboard (Awaiting Approval)</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  style={{
                    background: '#1E293B',
                    color: '#CBD5E1',
                    border: '1px solid #334155',
                    borderRadius: 0,
                    padding: '12px 20px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Done & Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
