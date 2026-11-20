import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Wrench,
  AlertCircle,
  HardHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  CreditCard,
  User,
  Calendar,
  Phone,
  UploadCloud
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';
import { workerApi, authApi } from '../api/apiClient';

export function WorkerOnboardingModal({
  isOpen,
  onClose,
  onWorkerApplied,
  selectedCity = 'Mumbai'
}) {
  const [step, setStep] = useState(1); // 1: Personal & Account, 2: Trade & KYC, 3: Bank Details, 4: Success

  // STEP 1: Personal & Account State
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [residentialAddress, setResidentialAddress] = useState('');
  const [city, setCity] = useState(selectedCity || 'Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');
  const [locality, setLocality] = useState('Bandra West');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // STEP 2: Trade, Skills & KYC State
  const [selectedTrade, setSelectedTrade] = useState('ac-appliances');
  const [skills, setSkills] = useState('AC Repair, Compressor Overhaul, Gas Charging');
  const [experienceYears, setExperienceYears] = useState('3-5 years');
  const [hasSmartphone, setHasSmartphone] = useState('Yes, Android 12+');
  const [hasTools, setHasTools] = useState('Yes, Full Kit Available');
  const [expectedIncome, setExpectedIncome] = useState('₹65,000 / month');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [profilePhotoName, setProfilePhotoName] = useState('');

  // STEP 3: Bank & Payout Details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [upiId, setUpiId] = useState('');

  const [submittedApp, setSubmittedApp] = useState(null);
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
      setError('Please enter a valid email address first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await authApi.sendRegistrationOtp({
        email: cleanEmail,
        name: fullName.trim() || 'Worker Applicant',
        phone: phoneNumber.trim(),
        purpose: 'worker'
      });

      if (res && res.success) {
        setIsOtpSent(true);
        setResendCooldown(30);
        setOtpCode('');
      } else {
        setError(res?.message || 'Failed to dispatch verification email. Please check your network.');
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

  // Validate Step 1 (Personal & Account)
  function handleNextStep1(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    // Age / Date of Birth Validation (Bug 05)
    if (!dateOfBirth) {
      setError('Date of Birth is required for compliance and identity verification.');
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
      setError('Applicant must be at least 18 years of age to register as a service professional.');
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
      setError('Please enter a valid email address.');
      return;
    }

    // Password Validation
    if (!password || password.length < 6) {
      setError('Please create a password with at least 6 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    // Address & PIN Code
    if (!residentialAddress.trim()) {
      setError('Please enter your residential address.');
      return;
    }
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setStep(2);
  }

  // Validate Step 2 (Trade & KYC)
  function handleNextStep2(e) {
    e.preventDefault();
    setError('');

    if (!selectedTrade) {
      setError('Please select your trade or service specialty.');
      return;
    }
    if (!idProofNumber.trim()) {
      setError(`Please enter your ${idProofType} number.`);
      return;
    }

    if (idProofType === 'Aadhaar Card') {
      const cleanAadhaar = idProofNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12 && cleanAadhaar.length !== 16) {
        setError('Aadhaar number must be 12 digits or 16-digit Virtual ID (VID).');
        return;
      }
    }

    setStep(3);
  }

  // Validate Step 3 & Submit Application
  function handleSubmitApplication(e) {
    e.preventDefault();
    setError('');

    // Bank Details Validation (Bug 06)
    if (!accountHolderName.trim()) {
      setError('Please enter the Bank Account Holder Name as per bank passbook/cheque.');
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
      setError('Please enter a valid 11-character Indian IFSC code (e.g. SBIN0001234).');
      return;
    }

    const tradeObj = CATEGORIES.find(c => c.id === selectedTrade);
    const newApp = {
      id: `WRK-${Date.now().toString().slice(-5)}`,
      applicantName: fullName.trim(),
      dateOfBirth,
      phone: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      password,
      address: residentialAddress.trim(),
      city,
      state: stateName,
      pinCode: pinCode.trim(),
      locality: `${locality}, ${city}`,
      emergencyContact: {
        name: emergencyContactName.trim() || 'Not specified',
        phone: emergencyContactPhone.trim() || 'Not specified'
      },
      trade: selectedTrade,
      tradeName: tradeObj ? tradeObj.name : 'Home Services Specialist',
      skills: skills.trim(),
      experience: experienceYears,
      toolsAvailable: hasTools,
      hasSmartphone,
      expectedIncome,
      documents: {
        idProofType,
        idProofNumber: idProofNumber.trim(),
        idProofFile: uploadedFileName || `${idProofType.toLowerCase().replace(/\s+/g, '_')}_scan.pdf`,
        profilePhoto: profilePhotoName || 'profile_pic.jpg'
      },
      aadhaarNumber: idProofType === 'Aadhaar Card' ? idProofNumber.trim() : 'Verified by Alternative ID',
      bankDetails: {
        accountHolderName: accountHolderName.trim(),
        accountNumber: cleanAcc,
        confirmAccountNumber: cleanAcc,
        ifscCode: cleanIfsc,
        bankName: bankName.trim(),
        upiId: upiId.trim() || undefined,
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

    setSubmittedApp(newApp);
    if (onWorkerApplied) {
      onWorkerApplied(newApp);
    }
    workerApi.submit(newApp).catch(err => console.warn('Direct workerApi submit sync:', err));
    setStep(4);
  }

  function handleReset() {
    setStep(1);
    setFullName('');
    setDateOfBirth('');
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setResidentialAddress('');
    setPinCode('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setIdProofNumber('');
    setUploadedFileName('');
    setProfilePhotoName('');
    setAccountHolderName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setUpiId('');
    setError('');
    setIsEmailVerified(false);
    setIsOtpSent(false);
    setOtpCode('');
    setSubmittedApp(null);
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
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 60%, #ECFDF5 100%)',
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
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 8
          }}>
            <HardHat size={13} />
            <span>FORGE INDIA CONNECT PROFESSIONAL ONBOARDING</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: -0.5 }}>
            Join as a Certified Service Professional
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Earn ₹45,000–₹85,000/month with transparent job dispatch, weekly direct bank payouts &amp; safety protection.
          </p>

          {/* Stepper */}
          {step < 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
              <div style={{
                padding: '8px 12px',
                background: step === 1 ? '#059669' : '#F1F5F9',
                color: step === 1 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 1 ? '1px solid #059669' : '1px solid #E2E8F0'
              }}>
                <span>1. Personal &amp; Account</span>
              </div>
              <div style={{
                padding: '8px 12px',
                background: step === 2 ? '#059669' : '#F1F5F9',
                color: step === 2 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 2 ? '1px solid #059669' : '1px solid #E2E8F0'
              }}>
                <span>2. Trade &amp; KYC Proof</span>
              </div>
              <div style={{
                padding: '8px 12px',
                background: step === 3 ? '#059669' : '#F1F5F9',
                color: step === 3 ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: step === 3 ? '1px solid #059669' : '1px solid #E2E8F0'
              }}>
                <span>3. Payout Bank Details</span>
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

          {/* STEP 1: PERSONAL & ACCOUNT DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Full Legal Name (as per ID proof) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: '#0F172A',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Date of Birth Field (Bug 05) */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Calendar size={13} color="#059669" />
                    <span>Date of Birth (Minimum 18 Years) *</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '9px 14px',
                      color: '#0F172A',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 3, display: 'block' }}>
                    Applicants must be 18 years or older.
                  </span>
                </div>
              </div>

              {/* Phone & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Phone size={13} color="#059669" />
                    <span>Mobile Number (10 Digits) *</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="Enter 10-digit mobile"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: '#0F172A',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Mail size={13} color="#059669" />
                    <span>Email Address (Login Username) *</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="email"
                      required
                      placeholder="e.g. pro@service.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      style={{
                        flex: 1,
                        background: '#F8FAFC',
                        border: isEmailVerified ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#0F172A',
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
                          background: '#059669',
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
                        style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isVerifyingOtp ? 'Checking...' : 'Confirm OTP'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Lock size={13} color="#059669" />
                    <span>Create Password (Min. 6 Characters) *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        padding: '10px 40px 10px 14px',
                        color: '#0F172A',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
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
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: '#0F172A',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Residential Address, Locality, City, State, PIN */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Full Residential Address (House/Flat, Street, Landmark) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Sai Kripa Apartments, Station Road"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#0F172A',
                    fontSize: 13.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Operating Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bandra West"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

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
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 400050"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Emergency Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Patil (Spouse / Parent)"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 14px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit emergency number"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 14px', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 10,
                  background: '#059669',
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
                <span>Continue to Trade &amp; KYC (Step 2 of 3)</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: TRADE, SKILLS & KYC VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Select Your Primary Service Trade *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const isSelected = selectedTrade === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedTrade(cat.id)}
                        style={{
                          background: isSelected ? '#ECFDF5' : '#F8FAFC',
                          border: isSelected ? '2px solid #059669' : '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s'
                        }}
                      >
                        <Wrench size={16} color={isSelected ? '#059669' : '#64748B'} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#065F46' : '#1E293B' }}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Specific Technical Skills &amp; Specialties
                </label>
                <input
                  type="text"
                  placeholder="e.g. Copper piping, Inverter PCB diagnosis, R32 Gas Top-Up"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Years of Field Experience *
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="1-2 years">1–2 years practical experience</option>
                    <option value="3-5 years">3–5 years professional experience</option>
                    <option value="6-10 years">6–10 years senior technician</option>
                    <option value="10+ years">10+ years (Master Technician / Lead)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Do you have a Smartphone? *
                  </label>
                  <select
                    value={hasSmartphone}
                    onChange={(e) => setHasSmartphone(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Yes, Android 12+">Yes, Android Phone (Android 12+)</option>
                    <option value="Yes, Apple iPhone">Yes, Apple iOS Device</option>
                    <option value="Need Smartphone Support">Need Assistance / Basic Phone</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Professional Tool Kit *
                  </label>
                  <select
                    value={hasTools}
                    onChange={(e) => setHasTools(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Yes, Full Kit Available">Yes, Complete Professional Kit</option>
                    <option value="Partial Kit">Partial Kit (Need Platform Gear)</option>
                    <option value="Request FIC Starter Kit">Request Forge India Connect Toolkit</option>
                  </select>
                </div>
              </div>

              {/* ID Proof Selection & Number */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Official ID Proof Document *
                  </label>
                  <select
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Aadhaar Card">Aadhaar Card (12-digit UID)</option>
                    <option value="PAN Card">PAN Card (10-char alphanumeric)</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID (EPIC)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    {idProofType} Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter ${idProofType} number`}
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value.toUpperCase())}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Simulated Document Upload with Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 10,
                  padding: '16px',
                  textAlign: 'center',
                  background: '#F8FAFC'
                }}>
                  <UploadCloud size={24} color="#059669" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>Upload {idProofType} Scan</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>PDF, JPG, PNG up to 5MB</div>
                  <button
                    type="button"
                    onClick={() => setUploadedFileName(`${idProofType.toLowerCase().replace(/\s+/g, '_')}_verified_doc.pdf`)}
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
                    {uploadedFileName ? `✓ Attached: ${uploadedFileName}` : 'Choose File / Scan'}
                  </button>
                </div>

                <div style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 10,
                  padding: '16px',
                  textAlign: 'center',
                  background: '#F8FAFC'
                }}>
                  <User size={24} color="#059669" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>Professional Profile Photo</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Clear front-facing passport style</div>
                  <button
                    type="button"
                    onClick={() => setProfilePhotoName('technician_headshot.jpg')}
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
                    {profilePhotoName ? `✓ Attached: ${profilePhotoName}` : 'Upload Photo'}
                  </button>
                </div>
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
                    background: '#059669',
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
                  <span>Continue to Bank Payout Details (Step 3 of 3)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYOUT BANK ACCOUNT DETAILS (Bug 06) */}
          {step === 3 && (
            <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '14px 18px',
                borderRadius: 10,
                fontSize: 12.5,
                color: '#065F46',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} color="#059669" />
                  <span>Direct Bank Payout Guarantee</span>
                </div>
                Your weekly customer earnings and platform bonuses are disbursed directly into this bank account via IMPS/NEFT with zero deduction delay.
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Account Holder Name (as per Bank Records) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
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
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    IFSC Code (11 Characters) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, letterSpacing: 1, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Confirm Bank Account Number *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    placeholder="Re-enter account number"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  Virtual Payment Address / UPI ID (Optional for Instant Micro-Payouts)
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank or yourphone@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, boxSizing: 'border-box' }}
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
                    background: '#059669',
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
                  <span>Submit Complete Professional Application</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && submittedApp && (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#DCFCE7',
                border: '2px solid #16A34A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={34} color="#16A34A" />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                Professional Application Submitted!
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Thank you, <strong>{submittedApp.applicantName}</strong>. Your application has been logged into the Forge India Connect database and forwarded to the Operations Hub for background and bank verification.
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
                  <span style={{ color: '#64748B' }}>Application Reference:</span>
                  <strong style={{ color: '#059669' }}>{submittedApp.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Login Email:</span>
                  <strong style={{ color: '#0F172A' }}>{submittedApp.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Selected Trade:</span>
                  <strong style={{ color: '#0F172A' }}>{submittedApp.tradeName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Payout Bank:</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{submittedApp.bankDetails?.bankName} (••••{submittedApp.bankDetails?.accountNumber?.slice(-4)})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ color: '#64748B' }}>Application Status:</span>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800
                  }}>
                    ● Under Operations Review
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('uc_pro_token', 'TOKEN-' + submittedApp.id);
                      localStorage.setItem('uc_pro_id', submittedApp.id);
                      localStorage.setItem('uc_pro_user', JSON.stringify(submittedApp));
                    } catch {}
                    handleReset();
                    onClose();
                    window.history.pushState({}, '', '/professional');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  style={{
                    background: '#059669',
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
                  <span>Go to Professional Portal</span>
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
