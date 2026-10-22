import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, HelpCircle, X, Briefcase, Wrench, ExternalLink } from 'lucide-react';
import { adminClient } from './adminClient';

export function AdminLogin({ onLoginSuccess, onNavigateToMarketplace }) {
  const [email, setEmail] = useState('admin@urbancompany.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState('admin');

  // Forgot password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  function handleSelectDashboard(type) {
    setSelectedDashboard(type);
    if (type === 'admin') {
      setEmail('admin@urbancompany.com');
      setPassword('admin123');
      setError('');
    } else if (type === 'partner') {
      try {
        localStorage.setItem('uc_open_portal', 'partner');
      } catch {}
      if (onNavigateToMarketplace) {
        onNavigateToMarketplace();
      } else {
        window.location.href = '/?open=partner-dashboard';
      }
    } else if (type === 'professional') {
      window.location.href = '/professional';
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Invalid administrator credentials.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Invalid administrator credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminClient.login(cleanEmail, password);
      setLoading(false);
      if (onLoginSuccess && res.admin) {
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setLoading(false);
      // Generic error to prevent revealing account existence
      setError(err.message || 'Invalid administrator credentials.');
    }
  }

  function handleQuickLogin(roleEmail, rolePass) {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  }

  async function handlePasswordResetSubmit(e) {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    try {
      const res = await adminClient.requestPasswordReset(resetEmail.trim());
      setResetLoading(false);
      setResetSuccess(res.message || 'Reset instructions transmitted.');
    } catch (err) {
      setResetLoading(false);
      // Explicit error message identifying unconfigured email service (do NOT simulate success!)
      setResetError(err.message || 'Email delivery provider is unconfigured in server environment. Password reset cannot be dispatched.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: 28, maxWidth: 440 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#EDE9FE',
          color: '#6E42E5',
          padding: '6px 16px',
          borderRadius: 24,
          fontSize: 12.5,
          fontWeight: 700,
          marginBottom: 14,
          letterSpacing: 0.3
        }}>
          <ShieldCheck size={16} />
          <span>URBAN SERVICES OPERATIONS PORTAL</span>
        </div>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#0F172A',
          margin: '0 0 6px 0',
          letterSpacing: -0.5
        }}>
          Operations Command Center
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
          Authorized administrator credentials and multi-factor session validation required.
        </p>
      </div>

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '32px 36px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
      }}>
        {/* Unified 3 Dashboards Switcher */}
        <div style={{ marginBottom: 22, backgroundColor: '#F8FAFC', borderRadius: 12, padding: '14px 14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Platform Dashboards (3 Available)
            </span>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Select Dashboard</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 1. Admin Dashboard */}
            <button
              type="button"
              onClick={() => handleSelectDashboard('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 8,
                border: selectedDashboard === 'admin' ? '2px solid #6E42E5' : '1px solid #CBD5E1',
                backgroundColor: selectedDashboard === 'admin' ? '#F5F3FF' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={18} color="#6E42E5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>1. Admin Dashboard</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#6E42E5', backgroundColor: '#EDE9FE', padding: '1px 6px', borderRadius: 4 }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                  Full platform operations, services, dispatch & analytics
                </div>
              </div>
            </button>

            {/* 2. Partner Dashboard */}
            <button
              type="button"
              onClick={() => handleSelectDashboard('partner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Briefcase size={18} color="#2563EB" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>2. Partner Dashboard</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '1px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    OPEN PORTAL <ExternalLink size={9} />
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                  Franchise partner agency, fleet technicians & payout ledger
                </div>
              </div>
            </button>

            {/* 3. Professional Worker Dashboard */}
            <button
              type="button"
              onClick={() => handleSelectDashboard('professional')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Wrench size={18} color="#059669" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>3. Professional Worker Dashboard</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    OPEN PORTAL <ExternalLink size={9} />
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                  Technician companion hub, live job dispatches, OTP & earnings
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 14px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            color: '#DC2626'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Administrator Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '0 12px'
            }}>
              <Mail size={16} color="#64748B" style={{ flexShrink: 0 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@urbancompany.com"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '10px 10px',
                  fontSize: 13.5,
                  color: '#0F172A',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetError('');
                  setResetSuccess('');
                  setShowResetModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#6E42E5',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '0 12px'
            }}>
              <Lock size={16} color="#64748B" style={{ flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '10px 10px',
                  fontSize: 13.5,
                  color: '#0F172A',
                  outline: 'none',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#6E42E5' }}
              />
              <span>Keep administrator session active</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)',
              transition: 'background 0.15s ease'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Back to Marketplace Link */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 18, borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={onNavigateToMarketplace}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back to Customer Marketplace
          </button>
        </div>
      </div>

      {/* Password Reset Modal (Clearly communicates if SMTP unconfigured) */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: 440,
            maxWidth: '100%',
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Administrator Password Reset</h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Enter your corporate administrator email address to request a secure password reset token.
            </p>

            {resetError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: '#DC2626',
                fontSize: 12.5,
                lineHeight: 1.4,
                marginBottom: 14
              }}>
                <strong>Notice:</strong> {resetError}
              </div>
            )}

            {resetSuccess && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                color: '#15803D',
                fontSize: 12.5,
                lineHeight: 1.4,
                marginBottom: 14
              }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Administrator Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@urbancompany.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    marginTop: 4,
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: resetLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resetLoading ? 'Verifying...' : 'Dispatch Reset Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
