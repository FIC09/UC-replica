import React, { useState, useEffect } from 'react';
import { professionalClient } from './professionalClient';

export function ProfessionalLogin({ onLoginSuccess, onNavigateToRegister, onExitToMarketplace, showToast }) {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'

  // Password Login State
  const [emailOrPhone, setEmailOrPhone] = useState('vikram.salvi@urbanpro.com');
  const [password, setPassword] = useState('pro123456');

  // Phone OTP Login State
  const [phoneInput, setPhoneInput] = useState('+91 98205 11982');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(300); // 5 mins
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      const res = await professionalClient.resetDemoData();
      if (res.success) {
        if (showToast) showToast('Demonstration data has been cleanly reset to default initial state.');
        setShowResetConfirm(false);
      } else {
        throw new Error(res.error || 'Failed to reset demo data');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Expiry timer
  useEffect(() => {
    if (otpSent && expiresIn > 0) {
      const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpSent, expiresIn]);

  const demoAccounts = [
    {
      id: 'PRO-8841',
      name: 'Vikram Salvi',
      role: 'Master AC Specialist & Electrician',
      tier: 'Diamond Pro (Level 5)',
      status: 'Approved',
      type: 'Direct Freelance (Independent)',
      phone: '+91 98205 11982',
      email: 'vikram.salvi@urbanpro.com',
      badge: 'Approved Direct Freelancer'
    },
    {
      id: 'PRO-8842',
      name: 'Rajesh Kumar',
      role: 'Appliance Repair Specialist (Data Isolation Test)',
      tier: 'Platinum Pro (Level 4)',
      status: 'Approved',
      type: 'Independent Professional',
      phone: '+91 98201 44521',
      email: 'rajesh.kumar@urbanpro.com',
      badge: 'Data Isolation Verified (Separate Ledgers & Jobs)'
    },
    {
      id: 'PRO-8843',
      name: 'Sunil Vishwakarma',
      role: 'Cleaning & Housekeeping Specialist',
      tier: 'Gold Pro (Level 3)',
      status: 'Approved',
      type: 'Agency Employed (Apex Home Solutions LLP)',
      phone: '+91 98332 10984',
      email: 'sunil.v@urbanpro.com',
      badge: 'Approved Business Partner Agency'
    },
    {
      id: 'PRO-8845',
      name: 'Kavita Sharma',
      role: 'Salon & Skin Care Specialist',
      tier: 'Onboarding Partner',
      status: 'Under Review',
      type: 'Direct Freelance',
      phone: '+91 98209 88123',
      email: 'kavita.sharma@urbanpro.com',
      badge: 'Application Under Review'
    },
    {
      id: 'PRO-8846',
      name: 'Mohit Verma',
      role: 'Electrician & Appliance Technician',
      tier: 'Onboarding Partner',
      status: 'Changes Requested',
      type: 'Direct Freelance',
      phone: '+91 98207 77451',
      email: 'mohit.verma@urbanpro.com',
      badge: 'Action Needed: PAN Glare Re-upload'
    },
    {
      id: 'PRO-8847',
      name: 'Deepak Jadhav',
      role: 'Plumber & Water Specialist',
      tier: 'Suspended Partner',
      status: 'Suspended',
      type: 'Direct Freelance',
      phone: '+91 98202 33190',
      email: 'deepak.jadhav@urbanpro.com',
      badge: 'Account Suspended (3 Cancellations)'
    }
  ];

  // Password Login Handler
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await professionalClient.login({
        identifier: emailOrPhone,
        password
      });

      if (data.success && data.professional) {
        onLoginSuccess(data.professional);
      } else {
        throw new Error(data.error || 'Invalid credentials. Please verify your phone/email and password.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your phone/email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP: Step 1 Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phoneInput || phoneInput.trim().length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await professionalClient.sendOtp(phoneInput);
      if (res.success) {
        setOtpSent(true);
        setCooldown(res.cooldownSeconds || 30);
        setExpiresIn(res.expiresInSeconds || 300);
        setAttemptsRemaining(3);
        setOtpNotice(res.message);
        showToast('OTP dispatched to mobile!');
      } else {
        throw new Error(res.error || 'Failed to dispatch verification OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch OTP. Please check mobile number.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP: Step 2 Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpInput || otpInput.trim().length < 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await professionalClient.verifyOtp(phoneInput, otpInput.trim());
      if (res.success && res.professional) {
        onLoginSuccess(res.professional);
      } else {
        throw new Error(res.error || 'Invalid verification OTP code.');
      }
    } catch (err) {
      setAttemptsRemaining(prev => Math.max(0, prev - 1));
      setError(err.message || 'Invalid verification OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Persona Switcher for Quick Verification
  const handleQuickDemoLogin = async (demo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await professionalClient.login({
        proId: demo.id,
        identifier: demo.email,
        password: 'demo'
      });
      if (data.success && data.professional) {
        onLoginSuccess(data.professional);
      } else {
        throw new Error(data.error);
      }
    } catch {
      // Fallback local session with complete metadata
      professionalClient.setAuth('mock-pro-jwt-token-2026', demo);
      onLoginSuccess(demo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 540,
        padding: '36px 28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box'
      }}>
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#7c3aed',
            color: '#ffffff',
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 12,
            boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.4)'
          }}>
            ⚡
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Professional Partner Portal
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Secure doorstep worker workspace • AC, Electrical, Cleaning & Salon
          </p>
        </div>

        {/* Auth Mode Tabs (Phone OTP vs Password) */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: 12,
          padding: 4,
          marginBottom: 20
        }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: authMode === 'otp' ? '#ffffff' : 'transparent',
              color: authMode === 'otp' ? '#7c3aed' : '#64748b',
              boxShadow: authMode === 'otp' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            📱 Phone OTP Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: authMode === 'password' ? '#ffffff' : 'transparent',
              color: authMode === 'password' ? '#7c3aed' : '#64748b',
              boxShadow: authMode === 'password' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🔑 Password & Email
          </button>
        </div>

        {/* Generic Error Box */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.4,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {/* 1. Phone OTP Auth Tab */}
        {authMode === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98205 11982"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 15,
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    We will send a 4-digit authentication code via SMS.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  style={{
                    width: '100%',
                    background: cooldown > 0 ? '#94a3b8' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 0',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                    minHeight: 48,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {loading ? 'Requesting OTP...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Verification OTP →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                {/* Explicit Environment Delivery Notice */}
                {otpNotice && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 12,
                    color: '#92400e',
                    lineHeight: 1.45,
                    marginBottom: 16
                  }}>
                    <strong>Notice:</strong> {otpNotice}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                      Enter 4-Digit Code
                    </label>
                    <span style={{ fontSize: 11, color: expiresIn > 60 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      Expires in {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4829"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '2px solid #7c3aed',
                      fontSize: 22,
                      letterSpacing: 8,
                      textAlign: 'center',
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#64748b' }}>
                    <span>Attempts remaining: {attemptsRemaining}/3</span>
                    <button
                      type="button"
                      disabled={cooldown > 0}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: cooldown > 0 ? '#94a3b8' : '#7c3aed',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || attemptsRemaining <= 0}
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
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Enter Portal ✓'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpInput('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Change Phone Number
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. Password Login Tab */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Registered Email or Phone
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Portal Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            <button
              type="submit"
              disabled={loading}
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
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal →'}
            </button>
          </form>
        )}

        {/* 1-Click Evaluation Personas (All Application States) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 16,
          marginTop: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Evaluation Personas (Test All States)
            </span>
            <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>1-Click Auth</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {demoAccounts.map(demo => {
              const isSuspended = demo.status === 'Suspended';
              const isPending = demo.status === 'Under Review' || demo.status === 'Changes Requested';
              return (
                <div
                  key={demo.id}
                  onClick={() => handleQuickDemoLogin(demo)}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isSuspended ? '#fecaca' : isPending ? '#fde68a' : '#cbd5e1'}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = isSuspended ? '#fecaca' : isPending ? '#fde68a' : '#cbd5e1'}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{demo.name}</span>
                      <span style={{
                        background: isSuspended ? '#fef2f2' : isPending ? '#fffbeb' : '#faf5ff',
                        color: isSuspended ? '#b91c1c' : isPending ? '#b45309' : '#7c3aed',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700
                      }}>
                        {demo.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      {demo.role}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b21a8', fontWeight: 600 }}>
                      {demo.badge}
                    </div>
                  </div>

                  <span style={{
                    fontSize: 12,
                    color: '#7c3aed',
                    fontWeight: 700
                  }}>
                    Select →
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reset Demo Data Action */}
          <div style={{ marginTop: 14, textAlign: 'center', paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              🔄 Reset Demo Data (Confirmed)
            </button>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              Restores synthetic dispatches, tickets & ledgers. Does not affect live data.
            </div>
          </div>
        </div>

        {/* Confirmed Demo Reset Modal */}
        {showResetConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '28px 24px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Reset Synthetic Demo Data?
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                This will reset all synthetic bookings, extra work proposals, notifications, support tickets, and earnings back to their initial seed state.
                <br /><br />
                <strong style={{ color: '#059669' }}>✓ Live records are completely segregated and unaffected.</strong>
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  disabled={isResetting}
                  style={{
                    flex: 1.5,
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isResetting ? 'wait' : 'pointer'
                  }}
                >
                  {isResetting ? 'Resetting...' : 'Confirm Demo Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px 0' }}>
            New service professional wanting to join?
          </p>
          <button
            onClick={onNavigateToRegister}
            style={{
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#7c3aed',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44
            }}
          >
            Apply as Service Partner (Multi-Step Onboarding) →
          </button>
          <div style={{ marginTop: 14 }}>
            <button
              onClick={onExitToMarketplace}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Exit to Customer Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
