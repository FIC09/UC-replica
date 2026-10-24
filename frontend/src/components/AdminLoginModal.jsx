import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, X, AlertCircle, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const DEMO_USER = 'admin';
  const DEMO_PASS = 'admin123';

  function handleAutoFill() {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const isValidUser = cleanUser === 'admin' || cleanUser === 'admin@urbancompany.com' || cleanUser === 'uc-admin';
      const isValidPass = password.trim() === 'admin123';

      if (isValidUser && isValidPass) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Invalid administrator credentials. Please check the demo username and password below.');
      }
    }, 350);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="admin-dashboard-modal" style={{
        background: '#0F172A',
        color: '#F8FAFC',
        width: '100%',
        maxWidth: 440,
        borderRadius: 18,
        border: '1px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #1E293B',
          background: 'linear-gradient(180deg, #131D33 0%, #0F172A 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #6E42E5 0%, #8B5CF6 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(110, 66, 229, 0.4)'
            }}>
              <ShieldCheck size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.3 }}>
                Admin Portal Login
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                Forge India Connect Operations & Control Hub
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 24px' }}>
          {/* Credentials Helper Box */}
          <div style={{
            background: 'rgba(110, 66, 229, 0.08)',
            border: '1px solid rgba(110, 66, 229, 0.3)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <KeyRound size={14} />
                <span>Admin Login Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 9px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Sparkles size={11} />
                <span>1-Click Fill</span>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
              <div style={{ background: '#1E293B', padding: '6px 10px', borderRadius: 8, border: '1px solid #334155' }}>
                <span style={{ color: '#94A3B8', fontSize: 10.5, display: 'block' }}>Username</span>
                <strong style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>admin</strong>
              </div>
              <div style={{ background: '#1E293B', padding: '6px 10px', borderRadius: 8, border: '1px solid #334155' }}>
                <span style={{ color: '#94A3B8', fontSize: 10.5, display: 'block' }}>Password</span>
                <strong style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>admin123</strong>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                Admin Username / Email *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  left: 12,
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 12px 10px 36px',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                Admin Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  left: 12,
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 40px 10px 36px',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 800,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#582AD1'}
              onMouseLeave={e => e.currentTarget.style.background = '#6E42E5'}
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Access Admin Hub'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Security footnote */}
          <div style={{
            fontSize: 11,
            color: '#64748B',
            textAlign: 'center',
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5
          }}>
            <ShieldCheck size={13} color="#10B981" />
            <span>Authorized Administrator Access Only • Forge India Connect Ops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
