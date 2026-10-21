import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export function AuthModal({ 
  isOpen, 
  onClose, 
  user, 
  onLogin, 
  onLogout,
  initialMode = 'login' // 'login' | 'signup'
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Validation / Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setErrorMsg('');
      setSuccessMsg('');
      // If user opened with empty fields, prefill demo helpers
      if (!loginEmail) {
        setLoginEmail('rahul.sharma@urbancompany.com');
        setLoginPassword('Password@123');
      }
    }
  }, [isOpen, initialMode]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleLoginSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setErrorMsg('Please enter your password (minimum 4 characters)');
      return;
    }

    // Determine user name from email or default
    const derivedName = cleanEmail.includes('rahul') ? 'Rahul Sharma' : (cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const authenticatedUser = {
      name: derivedName || 'Rahul Sharma',
      email: cleanEmail,
      phone: user?.phone || '+91 98201 44521',
      isPlusMember: false
    };

    try {
      localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
    } catch {}

    setSuccessMsg('Signing you in...');
    setTimeout(() => {
      onLogin(authenticatedUser);
      onClose();
    }, 400);
  }

  function handleSignupSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const newUser = {
      name: cleanName,
      email: cleanEmail,
      phone: '+91 98201 44521',
      isPlusMember: false
    };

    try {
      localStorage.setItem('uc_user', JSON.stringify(newUser));
    } catch {}

    setSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLogin(newUser);
      onClose();
    }, 450);
  }

  function handleFillDemo() {
    setLoginEmail('rahul.sharma@urbancompany.com');
    setLoginPassword('Password@123');
    setErrorMsg('');
  }

  return (
    <div 
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 14, 26, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div 
        className="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.28)',
          padding: '28px 28px',
          boxSizing: 'border-box',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: '#111827'
        }}
      >
        {/* Floating circular white close button with black X (Matches Urban Company screenshot) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: -44,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.22)',
            color: '#111827',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <X size={18} strokeWidth={2.6} />
        </button>

        {/* ======================================================== */}
        {/* IF ALREADY LOGGED IN: PROFILE VIEW                       */}
        {/* ======================================================== */}
        {user ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6E42E5 0%, #4F2CE0 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 24,
                margin: '0 auto 12px',
                boxShadow: '0 6px 18px rgba(110, 66, 229, 0.35)'
              }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                {user.name}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                {user.email || 'rahul.sharma@urbancompany.com'}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                marginTop: 8
              }}>
                <CheckCircle2 size={13} color="#10B981" />
                <span>Verified Customer</span>
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid #E2E8F0',
              marginBottom: 20,
              fontSize: 12.5,
              color: '#475569'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Account Status:</span>
                <strong style={{ color: '#059669' }}>Active &amp; Ready</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Associated Phone:</span>
                <strong>{user.phone || '+91 98201 44521'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMode('login');
                }}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  border: '1.5px solid #FCA5A5',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#5E3BEE',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* GUEST STATE: TABBED SIGN IN / CREATE ACCOUNT FORMS       */
          /* ======================================================== */
          <div>
            {/* Top Switcher Tabs: Sign In / Create Account */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E5E7EB',
              marginBottom: 22
            }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 0 12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === 'login' ? '2.5px solid #5E3BEE' : '2.5px solid transparent',
                  color: mode === 'login' ? '#5E3BEE' : '#6B7280',
                  fontSize: 15,
                  fontWeight: mode === 'login' ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 0 12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === 'signup' ? '2.5px solid #5E3BEE' : '2.5px solid transparent',
                  color: mode === 'signup' ? '#5E3BEE' : '#6B7280',
                  fontSize: 15,
                  fontWeight: mode === 'signup' ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ==================================================== */}
            {/* VIEW A: SIGN IN USING EMAIL & PASSWORD               */}
            {/* ==================================================== */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                    Sign In with Email
                  </h3>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                    Enter your email address and password to continue.
                  </p>
                </div>

                {/* Email Address Field */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 6
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 12px 11px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#5E3BEE';
                        e.target.style.boxShadow = '0 0 0 3px rgba(94, 59, 238, 0.12)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#D1D5DB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPassword('Password@123');
                        showToast('Password reset to: Password@123');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#5E3BEE',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 38px 11px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#5E3BEE';
                        e.target.style.boxShadow = '0 0 0 3px rgba(94, 59, 238, 0.12)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#D1D5DB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#4B5563' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#5E3BEE', borderRadius: 4 }}
                    />
                    <span>Remember me on this browser</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleFillDemo}
                    style={{
                      background: '#F5F3FF',
                      border: '1px solid #DDD6FE',
                      borderRadius: 6,
                      color: '#6E42E5',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    Auto-Fill Demo
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    backgroundColor: '#5E3BEE',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(94, 59, 238, 0.35)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4F2CE0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#5E3BEE'}
                >
                  Sign In
                </button>

                {/* Switch to Sign Up */}
                <div style={{
                  marginTop: 18,
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#6B7280'
                }}>
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5E3BEE',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            ) : (
              /* ==================================================== */
              /* VIEW B: CREATE ACCOUNT USING EMAIL & PASSWORD        */
              /* ==================================================== */
              <form onSubmit={handleSignupSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                    Create an Account
                  </h3>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                    Sign up using your email and password to book services.
                  </p>
                </div>

                {/* Full Name */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Create Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 38px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 11,
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={signupConfirmPassword}
                      onChange={e => setSignupConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        fontSize: 13.5,
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 18, lineHeight: 1.4 }}>
                  By signing up, you agree to our <strong>Terms of Service</strong> &amp; <strong>Privacy Policy</strong>.
                </div>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    backgroundColor: '#5E3BEE',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(94, 59, 238, 0.35)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4F2CE0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#5E3BEE'}
                >
                  Create Account
                </button>

                {/* Switch to Sign In */}
                <div style={{
                  marginTop: 18,
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#6B7280'
                }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5E3BEE',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default AuthModal;
