import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles, X } from 'lucide-react';
import { partnerClient } from './partnerClient';

export function PartnerLogin({ onLoginSuccess, onNavigate, onExitToMarketplace }) {
  const [emailOrPhone, setEmailOrPhone] = useState('contact@apexhome.in');
  const [password, setPassword] = useState('Partner@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwdResetModal, setShowPwdResetModal] = useState(false);

  // Quick Demo Accounts
  const demoPresets = [
    { label: '👑 Business Owner', email: 'contact@apexhome.in', role: 'Business Owner' },
    { label: '⚡ Dispatcher', email: 'dispatcher@apexhome.in', role: 'Dispatcher' },
    { label: '💰 Finance Staff', email: 'finance@apexhome.in', role: 'Finance Staff' },
    { label: '👁️ Read-only Staff', email: 'analyst@apexhome.in', role: 'Read-only Staff' },
    { label: '🏢 Krishnagiri Partner', email: 'selvam@quickfixcare.com', role: 'Business Owner' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await partnerClient.login({ emailOrPhone, password });
      if (res && res.success) {
        onLoginSuccess(res.partner, res.staff);
        return;
      }
      setError(res?.error || 'Invalid credentials. Please verify your business email/phone and password.');
    } catch (err) {
      console.warn('Partner login error:', err.message);
      setError(err.message || 'Invalid login credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 18,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          color: '#fff',
          padding: '28px 28px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: 0.5 }}>
            Urban Partner Portal
          </h1>
          <p style={{ fontSize: 13.5, color: '#e9d5ff', margin: 0 }}>
            Enterprise Management for Agencies & Fleet Partners
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 18,
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Role Picker */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
              Quick Demo Staff Credentials:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {demoPresets.map(preset => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => {
                    setEmailOrPhone(preset.email);
                    setPassword('Partner@2026');
                    setError('');
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: emailOrPhone === preset.email ? '#ede9fe' : '#f8fafc',
                    color: emailOrPhone === preset.email ? '#6d28d9' : '#334155',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Business Email or Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  required
                  placeholder="name@apexhome.in or +91 98XXX"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPwdResetModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7c3aed',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 6
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Partner Portal'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration Link */}
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: '#64748b' }}>
            New service agency or franchise?{' '}
            <button
              onClick={() => onNavigate('/partner/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply to Become a Partner
            </button>
          </div>

          {onExitToMarketplace && (
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button
                onClick={onExitToMarketplace}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                ← Return to Customer Marketplace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showPwdResetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 440,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Password Reset Status
              </h2>
              <button
                onClick={() => setShowPwdResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '16px',
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  <AlertCircle size={16} /> Password Reset Email Unconfigured
                </div>
                <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5, margin: 0 }}>
                  Automated password-reset email delivery is currently <strong>unconfigured</strong> in this demonstration environment.
                  Do not expect an email dispatch.
                </p>
              </div>

              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                To sign in as an authorized partner staff member, please use the standard demo credentials:
                <br />
                Password: <strong>Partner@2026</strong>
              </p>

              <button
                onClick={() => setShowPwdResetModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer'
                }}
              >
                Understood, Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
