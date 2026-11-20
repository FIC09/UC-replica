import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  CreditCard,
  Calendar,
  Phone,
  UploadCloud,
  FileText
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';
import { partnerApi, authApi } from '../api/apiClient';

export function PartnerOnboardingModal({
  isOpen,
  onClose,
  onPartnerApplied,
  selectedCity = 'Mumbai'
}) {
  const [step, setStep] = useState(1); // 1: Business & Owner, 2: Fleet & Verification, 3: Payout Bank Account, 4: Success

  // STEP 1: Business & Authorized Owner Details
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Partnership / LLP');
  const [ownerName, setOwnerName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [city, setCity] = useState(selectedCity || 'Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonPhone, setContactPersonPhone] = useState('');

  // Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // STEP 2: Fleet & Operations State
  const [selectedCategory, setSelectedCategory] = useState('ac-appliances');
  const [fleetSize, setFleetSize] = useState('6-15 Technicians');
  const [coverageLocalities, setCoverageLocalities] = useState('Bandra, Andheri, Powai');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState('150-300 jobs/month');
  const [attachedCertName, setAttachedCertName] = useState('');

  // STEP 3: Settlement Bank Account State (Bug 06)
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountType, setAccountType] = useState('Current Corporate Account');

  const [submittedPartnerApp, setSubmittedPartnerApp] = useState(null);
  const [error, setError] = useState('');

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  async function handleSendEmailOtp() {
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid official business email address first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await authApi.sendRegistrationOtp({
        email: cleanEmail,
        name: ownerName.trim() || businessName.trim() || 'Partner Applicant',
        phone: phoneNumber.trim(),
        purpose: 'partner'
      });

      if (res && res.success) {
        setIsOtpSent(true);
        setResendCooldown(30);
        setOtpCode('');
      } else {
        setError(res?.message || 'Failed to dispatch verification code. Please check your network.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with verification service.');
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyEmailOtp() {
    setError('');
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await authApi.verifyEmailOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp
      });

      if (res && res.success) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
      } else {
        setError(res?.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with verification service.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  // Validate Step 1 (Business & Owner)
  function handleNextStep1(e) {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError('Please enter your registered Business / Company Name.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter the Authorized Director / Owner Name.');
      return;
    }

    // Date of Birth Validation (Bug 05)
    if (!dateOfBirth) {
      setError('Date of Birth of authorized representative is required.');
      return;
    }
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (isNaN(dob.getTime()) || dob > today) {
      setError('Please enter a valid past Date of Birth.');
      return;
    }
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      setError('Authorized representative must be at least 18 years of age.');
      return;
    }

    // Mobile Validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    // Email Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid official business email address.');
      return;
    }

    // Password Validation
    if (!password || password.length < 6) {
      setError('Please create a password of at least 6 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    // Address & PIN Code
    if (!registeredAddress.trim()) {
      setError('Please enter your registered corporate/office address.');
      return;
    }
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setStep(2);
  }

  // Validate Step 2 (Fleet & Operations)
  function handleNextStep2(e) {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Please select primary service fleet domain.');
      return;
    }

    // GST / PAN validation
    const cleanGst = gstNumber.trim().toUpperCase();
    if (cleanGst && cleanGst.length !== 15) {
      setError('GSTIN must be exactly 15 characters (e.g. 27AABCA1234F1Z5).');
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setError('PAN number must follow standard 10-character Indian format (e.g. AABCB1234K).');
      return;
    }

    setStep(3);
  }

  // Validate Step 3 & Submit Application (Bug 06)
  function handleSubmitPartner(e) {
    e.preventDefault();
    setError('');

    if (!accountHolderName.trim()) {
      setError('Please enter the Corporate Bank Account Holder Name.');
      return;
    }
    const cleanAcc = accountNumber.replace(/\D/g, '');
    if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      setError('Bank account number must be between 9 and 18 digits.');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setError('Bank Account Number and Confirm Account Number do not match.');
      return;
    }
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setError('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0000002).');
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === selectedCategory);
    const newPartnerApp = {
      id: `PTR-${Date.now().toString().slice(-5)}`,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      dateOfBirth,
      phone: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      password,
      businessType,
      category: selectedCategory,
      categoryName: catObj ? catObj.name : 'Multi-Service Fleet',
      fleetSize,
      city: `${coverageLocalities}, ${city}`,
      registeredAddress: registeredAddress.trim(),
      state: stateName,
      pinCode: pinCode.trim(),
      gstNumber: gstNumber.trim() || 'GST Pending Verification',
      panNumber: panNumber.trim() || undefined,
      monthlyCapacity,
      contactPerson: {
        name: contactPersonName.trim() || ownerName.trim(),
        phone: contactPersonPhone.trim() || phoneNumber.trim()
      },
      settlementAccount: {
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: cleanAcc,
        ifscCode: cleanIfsc,
        accountType,
        status: 'Pending Review'
      },
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
    partnerApi.submit(newPartnerApp).catch(err => console.warn('Direct partnerApi submit sync:', err));
    setStep(4);
  }

  function handleReset() {
    setStep(1);
    setBusinessName('');
    setOwnerName('');
    setDateOfBirth('');
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setRegisteredAddress('');
    setPinCode('');
    setContactPersonName('');
    setContactPersonPhone('');
    setGstNumber('');
    setPanNumber('');
    setAttachedCertName('');
    setAccountHolderName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setError('');
    setIsEmailVerified(false);
    setIsOtpSent(false);
    setOtpCode('');
    setSubmittedPartnerApp(null);
  }

  return (
    <div className="onboarding-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#FFFFFF',
        color: '#0F172A',
        width: '100%',
        maxWidth: 780,
        maxHeight: '92vh',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Banner - High contrast Forge India Connect Light Theme */}
        <div style={{
          background: 'linear-gradient(135deg, #E8F1FF 0%, #FFFFFF 60%, #E8F1FF 100%)',
          padding: '22px 28px',
          borderBottom: '1px solid #E2E8F0',
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
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#475569',
              width: 32,
              height: 32,
              borderRadius: 8,
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
            background: '#E8F1FF',
            border: '1px solid #E8F1FF',
            color: '#0849B1',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 8
          }}>
            <Building2 size={13} />
            <span>ENTERPRISE &amp; FLEET PARTNER NETWORK</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: -0.5 }}>
            Partner Onboarding — Agency &amp; Fleet Registration
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Scale your service company or agency fleet with guaranteed Forge India Connect enterprise dispatch &amp; unified settlements.
          </p>

          {/* Stepper */}
          {step < 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
              <div style={{
                padding: '8px 12px',
                background: step === 1 ? '#0B57D0' : '#F1F5F9',
                color: step === 1 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 1 ? '1px solid #0B57D0' : '1px solid #E2E8F0'
              }}>
                <span>1. Business &amp; Owner</span>
              </div>
              <div style={{
                padding: '8px 12px',
                background: step === 2 ? '#0B57D0' : '#F1F5F9',
                color: step === 2 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 2 ? '1px solid #0B57D0' : '1px solid #E2E8F0'
              }}>
                <span>2. Fleet &amp; Capacity</span>
              </div>
              <div style={{
                padding: '8px 12px',
                background: step === 3 ? '#0B57D0' : '#F1F5F9',
                color: step === 3 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 3 ? '1px solid #0B57D0' : '1px solid #E2E8F0'
              }}>
                <span>3. Settlement Account</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', backgroundColor: '#FFFFFF' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 18
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS & OWNER DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Registered Business / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Home Solutions LLP"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Business Entity Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Partnership / LLP">Partnership / LLP</option>
                    <option value="Private Limited Company">Private Limited (Pvt Ltd)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship Agency</option>
                    <option value="Authorized Franchise">Authorized Franchise Partner</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Authorized Director / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                {/* Date of Birth Field (Bug 05) */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Calendar size={13} color="#0B57D0" />
                    <span>Owner / Representative Date of Birth *</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 3, display: 'block' }}>
                    Age must be at least 18 years.
                  </span>
                </div>
              </div>

              {/* Mobile and Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Phone size={13} color="#0B57D0" />
                    <span>Business Contact Mobile *</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="10-digit mobile"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Mail size={13} color="#0B57D0" />
                    <span>Corporate Email Address *</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="email"
                      required
                      placeholder="e.g. operations@agency.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      style={{
                        flex: 1,
                        background: '#F8FAFC',
                        border: isEmailVerified ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                    {!isEmailVerified && (
                      <button
                        type="button"
                        disabled={isSendingOtp || !email.includes('@')}
                        onClick={handleSendEmailOtp}
                        style={{
                          background: '#0B57D0',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          padding: '0 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {isSendingOtp ? 'Sending...' : (isOtpSent ? 'Resend' : 'Verify')}
                      </button>
                    )}
                  </div>
                  {isOtpSent && !isEmailVerified && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        style={{ background: '#0B57D0', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isVerifyingOtp ? 'Checking...' : 'Confirm OTP'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Lock size={13} color="#0B57D0" />
                    <span>Create Portal Password (Min. 6 Characters) *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter portal password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 40px 10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Confirm Portal Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm portal password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Registered Corporate Address */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Registered Corporate / Office Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 402, Trade Square, Senapati Bapat Marg"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 400013"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 10,
                  background: '#0B57D0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '13px 20px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>Continue to Fleet &amp; Operations (Step 2 of 3)</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: FLEET & OPERATIONS */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Primary Fleet Service Category *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          background: isSelected ? '#E8F1FF' : '#F8FAFC',
                          border: isSelected ? '2px solid #0B57D0' : '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s'
                        }}
                      >
                        <Building2 size={16} color={isSelected ? '#0B57D0' : '#64748B'} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#0849B1' : '#1E293B' }}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Active Technician Fleet Size *
                  </label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="1-5 Technicians">1–5 Dedicated Technicians</option>
                    <option value="6-15 Technicians">6–15 Technicians (Standard Fleet)</option>
                    <option value="16-30 Technicians">16–30 Technicians (Regional Agency)</option>
                    <option value="30+ Technicians">30+ Technicians (Enterprise Contractor)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Monthly Order Fulfilment Capacity *
                  </label>
                  <select
                    value={monthlyCapacity}
                    onChange={(e) => setMonthlyCapacity(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="50-150 jobs/month">50–150 jobs / month</option>
                    <option value="150-300 jobs/month">150–300 jobs / month</option>
                    <option value="300-600 jobs/month">300–600 jobs / month</option>
                    <option value="600+ jobs/month">600+ jobs / month (High-Volume)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Target Coverage Localities / Zones *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra, Andheri, Powai, Kurla"
                  value={coverageLocalities}
                  onChange={(e) => setCoverageLocalities(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              {/* Tax & Legal Identifiers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Business GSTIN (15 Characters)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 27AABCA1234F1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, letterSpacing: 1, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Company / Firm PAN (10 Characters)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. AABCB1234K"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, letterSpacing: 1, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Certificate Upload Simulation */}
              <div style={{
                border: '1.5px dashed #CBD5E1',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'center',
                background: '#F8FAFC'
              }}>
                <UploadCloud size={24} color="#0B57D0" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>Upload Incorporation / GST Certificate</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>PDF / Scanned certificate up to 10MB</div>
                <button
                  type="button"
                  onClick={() => setAttachedCertName('business_incorporation_cert.pdf')}
                  style={{
                    marginTop: 8,
                    padding: '5px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {attachedCertName ? `✓ Attached: ${attachedCertName}` : 'Select Document File'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 8,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
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
                    background: '#0B57D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <span>Continue to Settlement Account (Step 3 of 3)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SETTLEMENT BANK ACCOUNT (Bug 06) */}
          {step === 3 && (
            <form onSubmit={handleSubmitPartner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#E8F1FF',
                border: '1px solid #E4E7EC',
                padding: '14px 18px',
                borderRadius: 10,
                fontSize: 12.5,
                color: '#0849B1',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} color="#0B57D0" />
                  <span>Corporate Payout &amp; Settlement Account</span>
                </div>
                All aggregated customer payouts for jobs completed by your fleet will be transferred exclusively into this corporate account. Individual technician payouts under agency fleets are routed through your agency payroll.
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Corporate Account Holder Name (as per Bank Records) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Home Solutions LLP"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Bank Name *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                    <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank Ltd">Axis Bank Ltd</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Current Corporate Account">Current Corporate Account</option>
                    <option value="Business Account">Business Current Account</option>
                    <option value="LLP Special Account">LLP Special Account</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Corporate Account Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Enter corporate account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Confirm Account Number *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    placeholder="Re-enter corporate account number"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Bank IFSC Code (11 Characters) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="e.g. HDFC0000002"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, letterSpacing: 1, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 8,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
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
                    background: '#0B57D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Submit Partner &amp; Fleet Application</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && submittedPartnerApp && (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#E8F1FF',
                border: '2px solid #0B57D0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={34} color="#0B57D0" />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                Partner Application Submitted!
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Thank you, <strong>{submittedPartnerApp.ownerName}</strong> ({submittedPartnerApp.businessName}). Your fleet onboarding request has been logged and assigned to the Enterprise Compliance Desk.
              </p>

              {/* Summary Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '18px 22px',
                maxWidth: 480,
                margin: '0 auto 24px',
                textAlign: 'left',
                fontSize: 13
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Partner Reference:</span>
                  <strong style={{ color: '#0B57D0' }}>{submittedPartnerApp.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Corporate Email:</span>
                  <strong style={{ color: '#0F172A' }}>{submittedPartnerApp.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Fleet Size:</span>
                  <strong style={{ color: '#0F172A' }}>{submittedPartnerApp.fleetSize}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Settlement Bank:</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{submittedPartnerApp.settlementAccount?.bankName} (••••{submittedPartnerApp.settlementAccount?.accountNumber?.slice(-4)})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ color: '#64748B' }}>Compliance Status:</span>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800
                  }}>
                    ● Awaiting Agreement Verification
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('uc_partner_token', 'TOKEN-' + submittedPartnerApp.id);
                      localStorage.setItem('uc_partner_token', 'TOKEN-' + submittedPartnerApp.id);
                      localStorage.setItem('uc_partner_id', submittedPartnerApp.id);
                      localStorage.setItem('uc_partner_user', JSON.stringify(submittedPartnerApp));
                    } catch {}
                    handleReset();
                    onClose();
                    window.history.pushState({}, '', '/partner');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  style={{
                    background: '#0B57D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>Go to Partner Portal</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  style={{
                    background: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Done &amp; Return to Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
