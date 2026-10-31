import React, { useState, useEffect } from 'react';
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
  Smartphone, 
  MapPin, 
  Check, 
  FileText, 
  UserCheck, 
  Wrench,
  AlertCircle,
  HardHat,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';
import { workerApi, authApi } from '../api/apiClient';

export function WorkerOnboardingModal({
  isOpen,
  onClose,
  onWorkerApplied,
  selectedCity = 'Mumbai'
}) {
  const [step, setStep] = useState(1); // 1: Personal & Trade, 2: Experience & KYC, 3: Success

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('ac-appliances');
  const [locality, setLocality] = useState('Bandra West');
  const [experienceYears, setExperienceYears] = useState('3-5 years');
  const [hasSmartphone, setHasSmartphone] = useState('Yes, Android 12+');
  const [hasTools, setHasTools] = useState('Yes, Full Kit Available');
  const [expectedIncome, setExpectedIncome] = useState('₹65,000 / month');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);
  const [error, setError] = useState('');

  // Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
        setError(res?.message || 'Failed to send verification code. Please check your email.');
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
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  function handleNext(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com) for worker login.');
      return;
    }
    if (!isEmailVerified) {
      setError('Please click the "Verify" button on your email address and enter the OTP before proceeding.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please create a password of at least 6 characters for worker dashboard login.');
      return;
    }
    setError('');
    setStep(2);
  }

  function handleSubmitApplication(e) {
    e.preventDefault();
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar && cleanAadhaar.length !== 16) {
      setError('Aadhaar / Virtual ID (VID) must be exactly 16 numeric digits.');
      return;
    }
    setError('');
    const tradeObj = CATEGORIES.find(c => c.id === selectedTrade);
    const newApp = {
      id: `WRK-${Date.now().toString().slice(-5)}`,
      applicantName: fullName.trim(),
      phone: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      trade: selectedTrade,
      tradeName: tradeObj ? tradeObj.name : 'Home Services Specialist',
      locality: `${locality}, ${selectedCity}`,
      experience: experienceYears,
      toolsAvailable: hasTools,
      hasSmartphone,
      expectedIncome,
      aadhaarNumber: aadhaarNumber.trim() || 'Pending Document Upload',
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
    // Also directly post to backend worker-applications to ensure instant persistence
    workerApi.submit(newApp).catch(err => console.warn('Direct workerApi submit sync:', err));
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setAadhaarNumber('');
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
        maxWidth: 760,
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
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 65%, #1E1B4B 120%)',
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
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10B981',
            color: '#10B981',
            padding: '3px 10px',
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 8
          }}>
            <HardHat size={13} />
            <span>DIRECT WORKER & TECHNICIAN RECRUITMENT</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: -0.5 }}>
            Worker Onboarding — Join as a Service Professional
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
            Earn ₹50,000–₹95,000/month with flexible gig work, weekly payouts & guaranteed customers.
          </p>

          {/* Stepper */}
          {step < 3 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{
                flex: 1,
                padding: '6px 12px',
                background: step === 1 ? '#059669' : '#1E293B',
                color: step === 1 ? '#fff' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>1. Personal & Trade</span>
              </div>
              <div style={{
                flex: 1,
                padding: '6px 12px',
                background: step === 2 ? '#059669' : '#1E293B',
                color: step === 2 ? '#fff' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>2. Experience & Verification</span>
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

          {/* STEP 1: PERSONAL & TRADE */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    Mobile Number (for OTP & Job Alerts) *
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
              </div>

              {/* Email and Password Credentials Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Mail size={14} color="#10B981" />
                    <span>Email Address (for Login & Communications) *</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: isEmailVerified ? 'rgba(16, 185, 129, 0.08)' : '#1E293B',
                    border: isEmailVerified ? '1.5px solid #10B981' : '1px solid #334155',
                    padding: '3px 6px 3px 12px',
                    gap: 8,
                    boxSizing: 'border-box'
                  }}>
                    <input
                      type="email"
                      required
                      disabled={isEmailVerified}
                      placeholder="e.g. ramesh.patil@urbanpro.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (isEmailVerified) setIsEmailVerified(false);
                        if (isOtpSent) setIsOtpSent(false);
                        if (error) setError('');
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: isEmailVerified ? '#A7F3D0' : '#FFFFFF',
                        fontSize: 13.5,
                        padding: '7px 0',
                        fontWeight: isEmailVerified ? 600 : 400
                      }}
                    />
                    {isEmailVerified ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34D399',
                        padding: '4px 8px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        <CheckCircle2 size={13} color="#34D399" />
                        <span>Verified</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailVerified(false);
                            setIsOtpSent(false);
                            setOtpCode('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 11,
                            color: '#94A3B8',
                            marginLeft: 4,
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isSendingOtp || !email.trim() || !email.includes('@')}
                        onClick={handleSendEmailOtp}
                        style={{
                          background: (isSendingOtp || !email.trim() || !email.includes('@')) ? '#334155' : '#10B981',
                          color: (isSendingOtp || !email.trim() || !email.includes('@')) ? '#64748B' : '#0F172A',
                          border: 'none',
                          padding: '6px 12px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: (isSendingOtp || !email.trim() || !email.includes('@')) ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSendingOtp ? (
                          <>
                            <div className="animate-spin" style={{ width: 11, height: 11, border: '2px solid #0F172A', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>{isOtpSent ? 'Resend' : 'Verify'}</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inline OTP Box when OTP is sent */}
                  {isOtpSent && !isEmailVerified && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1.5px solid #10B981',
                      padding: '10px 12px',
                      marginTop: 8,
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#34D399' }}>
                          Enter 6-Digit Email OTP
                        </span>
                        <span style={{ fontSize: 10.5, color: '#94A3B8' }}>
                          Sent to {email}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={otpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtpCode(val);
                            if (error) setError('');
                          }}
                          style={{
                            flex: 1,
                            background: '#1E293B',
                            border: '1px solid #475569',
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '3px',
                            textAlign: 'center',
                            padding: '6px 8px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          disabled={isVerifyingOtp || otpCode.length !== 6}
                          onClick={handleVerifyEmailOtp}
                          style={{
                            background: (isVerifyingOtp || otpCode.length !== 6) ? '#334155' : '#10B981',
                            color: (isVerifyingOtp || otpCode.length !== 6) ? '#64748B' : '#0F172A',
                            border: 'none',
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: (isVerifyingOtp || otpCode.length !== 6) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 10.5 }}>
                        <span style={{ color: '#94A3B8' }}>Didn't receive email? Check spam.</span>
                        {resendCooldown > 0 ? (
                          <span style={{ color: '#64748B' }}>Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            disabled={isSendingOtp}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#34D399',
                              cursor: 'pointer',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              padding: 0
                            }}
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Your primary login username on the worker portal
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Lock size={14} color={isEmailVerified ? '#10B981' : '#64748B'} />
                    <span>Create Password (min. 6 characters) *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={!isEmailVerified}
                      placeholder={isEmailVerified ? "Enter a secure password" : "🔒 Verify email first to create password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      style={{
                        width: '100%',
                        background: isEmailVerified ? '#1E293B' : '#0F172A',
                        border: isEmailVerified ? '1px solid #334155' : '1px dashed #334155',
                        opacity: isEmailVerified ? 1 : 0.6,
                        cursor: isEmailVerified ? 'text' : 'not-allowed',
                        padding: '10px 40px 10px 14px',
                        color: '#FFFFFF',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                    {isEmailVerified && (
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
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 11, 
                    color: isEmailVerified ? '#94A3B8' : '#F59E0B', 
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {isEmailVerified ? (
                      'Used along with your verified email to log in once approved'
                    ) : (
                      <>
                        <span>🔒</span>
                        <span>Verify your email on the left to set password</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                  Select Your Skill / Trade *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const isSelected = selectedTrade === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedTrade(cat.id)}
                        style={{
                          background: isSelected ? 'rgba(5, 150, 105, 0.2)' : '#1E293B',
                          border: isSelected ? '1.5px solid #10B981' : '1px solid #334155',
                          borderRadius: 0,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s'
                        }}
                      >
                        <Wrench size={16} color={isSelected ? '#10B981' : '#94A3B8'} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1' }}>
                            {cat.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Operating Locality / Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bandra West, Andheri, Powai"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
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
                    Experience in Trade
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
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
                    <option value="1-2 years">1-2 years experience</option>
                    <option value="3-5 years">3-5 years experience</option>
                    <option value="6-10 years">6-10 years experience</option>
                    <option value="10+ years">10+ years (Master Technician)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#059669',
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
                <span>Continue to Verification (Step 2 of 2)</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: EXPERIENCE & KYC VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleSubmitApplication}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Do you have a Smartphone?
                  </label>
                  <select
                    value={hasSmartphone}
                    onChange={(e) => setHasSmartphone(e.target.value)}
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
                    <option value="Yes, Android 12+">Yes, Android Phone (Android 12+)</option>
                    <option value="Yes, Apple iPhone">Yes, Apple iPhone</option>
                    <option value="Need UC Smartphone Support">Need Assistance / Basic Phone</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Professional Tools / Equipment
                  </label>
                  <select
                    value={hasTools}
                    onChange={(e) => setHasTools(e.target.value)}
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
                    <option value="Yes, Full Kit Available">Yes, I own a full professional tool set</option>
                    <option value="Partial Tools Available">Partial tools (Need UC specialized equipment)</option>
                    <option value="Need Full UC Toolkit">Need complete UC professional starter kit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                    Expected Monthly Earnings
                  </label>
                  <input
                    type="text"
                    value={expectedIncome}
                    onChange={(e) => setExpectedIncome(e.target.value)}
                    placeholder="e.g. ₹60,000 / month"
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
                      Aadhaar Number (16 Digits for Police & KYC Verification)
                    </label>
                    <span style={{ fontSize: 11, fontWeight: 700, color: aadhaarNumber.length === 16 ? '#10B981' : '#94A3B8' }}>
                      {aadhaarNumber.length}/16
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={16}
                      placeholder="Enter 16-digit Aadhaar / Virtual ID"
                      value={aadhaarNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setAadhaarNumber(digitsOnly);
                        if (error) setError('');
                      }}
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
                      style={{
                        width: '100%',
                        background: '#1E293B',
                        border: error && aadhaarNumber && aadhaarNumber.length !== 16 ? '1px solid #EF4444' : (aadhaarNumber.length === 16 ? '1px solid #10B981' : '1px solid #334155'),
                        borderRadius: 0,
                        padding: '10px 38px 10px 14px',
                        color: '#FFFFFF',
                        fontSize: 13.5,
                        letterSpacing: 1.2,
                        outline: 'none'
                      }}
                    />
                    {aadhaarNumber.length === 16 && (
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Only 16 numeric digits accepted (dots or letters are not permitted).
                  </div>
                </div>
              </div>

              {/* Quality Standards Guarantee */}
              <div style={{
                background: 'rgba(5, 150, 105, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px 16px',
                borderRadius: 0,
                marginBottom: 20,
                fontSize: 12.5,
                color: '#D1FAE5',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Forge India Connect Professional Guarantee</span>
                </div>
                By submitting this application, you agree to undergo criminal background verification, adhere to standard transparent pricing, and wear authentic FIC safety gear during home services.
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
                    background: '#059669',
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
                  <span>Submit Worker Application (Direct to Admin)</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 3 && submittedApp && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10B981',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} color="#10B981" />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 8 }}>
                Worker Application Received!
              </h3>
              <p style={{ fontSize: 13.5, color: '#94A3B8', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Thank you, <strong style={{ color: '#fff' }}>{submittedApp.applicantName}</strong>. Your worker application has been routed directly to the Forge India Connect Operations Admin Hub for background and skill verification.
              </p>

              {/* Application Details Summary Card */}
              <div style={{
                background: '#131D33',
                border: '1px solid #1E293B',
                borderRadius: 0,
                padding: '16px 20px',
                maxWidth: 480,
                margin: '0 auto 24px',
                textAlign: 'left',
                fontSize: 13
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Application ID:</span>
                  <strong style={{ color: '#A78BFA' }}>{submittedApp.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Login Email:</span>
                  <strong style={{ color: '#38BDF8' }}>{submittedApp.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Account Password:</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>•••••••• (Configured)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Selected Trade:</span>
                  <strong style={{ color: '#fff' }}>{submittedApp.tradeName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8' }}>Location:</span>
                  <span style={{ color: '#fff' }}>{submittedApp.locality}</span>
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

              {/* Approval Info Alert */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '12px 16px',
                borderRadius: 0,
                maxWidth: 480,
                margin: '0 auto 20px',
                textAlign: 'left',
                fontSize: 12.5,
                color: '#BAE6FD',
                lineHeight: 1.5
              }}>
                <strong>Admin Approval Workflow:</strong> Your credentials ({submittedApp.email}) have been forwarded to the Admin Verification desk. Once the Admin clicks <strong>Approve</strong>, you can log in directly and normally operate your worker dashboard.
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
                    borderRadius: 0,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <span>Go to Worker Dashboard</span>
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
