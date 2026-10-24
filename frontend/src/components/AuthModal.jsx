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
  AlertCircle,
  HardHat,
  Briefcase,
  Building2,
  Zap,
  KeyRound
} from 'lucide-react';
import { partnerClient } from '../partner/partnerClient';
import { professionalClient } from '../professional/professionalClient';

export function AuthModal({ 
  isOpen, 
  onClose, 
  user, 
  onLogin, 
  onLogout,
  onOpenAdminDashboard,
  onOpenProfessionalDashboard,
  onOpenPartnerDashboard,
  initialRole = 'customer',
  initialMode = 'login'
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(initialMode === 'login');
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'customer' | 'admin' | 'professional' | 'partner'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('customer@urbancompany.com');
  const [loginPassword, setLoginPassword] = useState('customer123');
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

  // Role preset credentials map
  const ROLE_PRESETS = {
    customer: {
      role: 'customer',
      label: 'Customer',
      icon: User,
      color: '#6E42E5',
      email: 'customer@urbancompany.com',
      password: 'customer123',
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      desc: 'Book home & salon services, track live orders, and manage saved addresses.',
      targetDashboard: 'Customer Profile & Bookings'
    },
    admin: {
      role: 'admin',
      label: 'Administrator',
      icon: ShieldCheck,
      color: '#7C3AED',
      email: 'admin@urbancompany.com',
      password: 'admin123',
      name: 'Executive Admin (Ops Lead)',
      phone: '+91 99999 99999',
      desc: 'Access Operations Hub, weather surge toggle (+₹49), broadcast alerts, & catalogue CRUD.',
      targetDashboard: 'Admin Dashboard'
    },
    professional: {
      role: 'professional',
      label: 'Professional / Pro',
      icon: HardHat,
      color: '#059669',
      email: 'pro@urbancompany.com',
      password: 'pro123',
      name: 'Vikram Salvi (Master Pro)',
      phone: '+91 98205 11982',
      trade: 'Master AC Specialist & Electrician',
      desc: 'Field technician portal, live job dispatches, customer OTP verification, and wallet payouts.',
      targetDashboard: 'Professional Field Hub'
    },
    partner: {
      role: 'partner',
      label: 'Business Partner',
      icon: Building2,
      color: '#2563EB',
      email: 'contact@apexhome.in',
      password: 'Partner@2026',
      name: 'Sandeep Patil (Agency Owner)',
      phone: '+91 98210 33411',
      agencyName: 'Apex Home Solutions LLP',
      desc: 'Agency fleet management, 12 verified technicians, monthly capacity, and GST payouts.',
      targetDashboard: 'Partner Fleet Dashboard'
    }
  };

  function setupRoleAuth(role, userObj) {
    if (role === 'partner') {
      const partnerData = {
        id: 'PTR-90142',
        businessName: userObj.agencyName || 'Apex Home Solutions LLP',
        ownerName: userObj.name || 'Sandeep Patil',
        email: userObj.email || 'contact@apexhome.in',
        phone: userObj.phone || '+91 98210 33411',
        tier: 'Platinum Enterprise Fleet',
        status: 'Active',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        city: 'Mumbai',
        settlementMode: 'settle_to_business',
        metrics: {
          totalBookings: 840,
          completedBookings: 820,
          rating: 4.88,
          complaintsCount: 2,
          totalPayouts: 389200
        }
      };
      const staffData = {
        id: 'STF-APX-01',
        name: userObj.name || 'Sandeep Patil',
        email: userObj.email || 'contact@apexhome.in',
        phone: userObj.phone || '+91 98210 33411',
        role: 'Business Owner',
        permissions: {
          viewing: true,
          editing: true,
          assigning_jobs: true,
          managing_team: true,
          viewing_finances: true,
          exporting: true,
          managing_staff: true,
          updating_documents: true,
          requesting_bank_changes: true
        }
      };
      partnerClient.setAuth('simulated-partner-jwt-token', partnerData, staffData);
      sessionStorage.setItem('uc_partner_token', 'simulated-partner-jwt-token');
      localStorage.setItem('uc_partner_token', 'simulated-partner-jwt-token');
    } else if (role === 'professional') {
      const proData = {
        id: 'PRO-8841',
        applicantName: userObj.name || 'Vikram Salvi',
        phone: userObj.phone || '+91 98205 11982',
        email: userObj.email || 'vikram.salvi@urbanpro.com',
        avatar: 'VS',
        trade: userObj.trade || 'Master AC Specialist & Electrician',
        tier: 'Diamond Pro Partner (Level 5)',
        employmentType: 'Direct Freelance',
        walletBalance: 15450,
        isOnline: true,
        status: 'Active'
      };
      professionalClient.setAuth('simulated-pro-jwt-token', proData);
      sessionStorage.setItem('uc_pro_token', 'simulated-pro-jwt-token');
      localStorage.setItem('uc_pro_token', 'simulated-pro-jwt-token');
    } else if (role === 'admin') {
      sessionStorage.setItem('uc_admin_auth', 'true');
      localStorage.setItem('uc_admin_token', 'simulated-admin-jwt-token');
    }
  }

  // Sync preset when role changes
  function selectRole(roleKey) {
    setSelectedRole(roleKey);
    const preset = ROLE_PRESETS[roleKey];
    if (preset) {
      setLoginEmail(preset.email);
      setLoginPassword(preset.password);
    }
    setErrorMsg('');
  }

  // Handle escape key & initialMode sync
  useEffect(() => {
    if (isOpen && initialMode === 'login') {
      setIsSwitchingAccount(true);
      setMode('login');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

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
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setErrorMsg('Please enter your password (minimum 4 characters)');
      return;
    }

    // Auto-detect role from credentials or selection
    let detectedRole = selectedRole;
    if (cleanEmail.includes('admin')) {
      detectedRole = 'admin';
    } else if (cleanEmail.includes('pro') || cleanEmail.includes('worker') || cleanEmail.includes('technician')) {
      detectedRole = 'professional';
    } else if (cleanEmail.includes('partner') || cleanEmail.includes('agency') || cleanEmail.includes('apex')) {
      detectedRole = 'partner';
    }

    const preset = ROLE_PRESETS[detectedRole] || ROLE_PRESETS.customer;

    const authenticatedUser = {
      name: cleanEmail.includes(preset.email.split('@')[0]) ? preset.name : (cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      email: cleanEmail,
      phone: preset.phone || '+91 98201 44521',
      role: detectedRole,
      trade: preset.trade,
      agencyName: preset.agencyName,
      isPlusMember: false
    };

    try {
      localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
    } catch {}

    setupRoleAuth(detectedRole, authenticatedUser);

    setSuccessMsg(`Signing in as ${preset.label}... Opening ${preset.targetDashboard}`);
    setTimeout(() => {
      onLogin(authenticatedUser);
      onClose();
    }, 450);
  }

  function handleQuickLogin(roleKey) {
    selectRole(roleKey);
    const preset = ROLE_PRESETS[roleKey];
    const authenticatedUser = {
      name: preset.name,
      email: preset.email,
      phone: preset.phone,
      role: preset.role,
      trade: preset.trade,
      agencyName: preset.agencyName,
      isPlusMember: false
    };

    try {
      localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
    } catch {}

    setupRoleAuth(preset.role, authenticatedUser);

    setSuccessMsg(`Instant login verified as ${preset.label}!`);
    setTimeout(() => {
      onLogin(authenticatedUser);
      onClose();
    }, 350);
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
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
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
      role: 'customer',
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

  const activePreset = ROLE_PRESETS[selectedRole] || ROLE_PRESETS.customer;

  return (
    <div 
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 14, 26, 0.72)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: 480,
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          padding: '28px 28px 24px',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4B5563',
            transition: 'all 0.15s ease'
          }}
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        {/* User is already logged in: View Profile & Quick Dashboard Switcher */}
        {user && !isSwitchingAccount ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: user.role === 'admin' 
                  ? 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
                  : user.role === 'professional'
                  ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                  : user.role === 'partner'
                  ? 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
                  : 'linear-gradient(135deg, #6E42E5 0%, #4F2CE0 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 26,
                margin: '0 auto 12px',
                boxShadow: '0 8px 20px rgba(110, 66, 229, 0.3)'
              }}>
                {(user.name || 'U')[0].toUpperCase()}
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                {user.name}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 10px' }}>
                {user.email || user.phone}
              </p>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: user.role === 'admin' ? '#F5F3FF' : user.role === 'professional' ? '#ECFDF5' : user.role === 'partner' ? '#EFF6FF' : '#F1F5F9',
                color: user.role === 'admin' ? '#7C3AED' : user.role === 'professional' ? '#047857' : user.role === 'partner' ? '#1D4ED8' : '#334155',
                border: `1px solid ${user.role === 'admin' ? '#DDD6FE' : user.role === 'professional' ? '#A7F3D0' : user.role === 'partner' ? '#BFDBFE' : '#E2E8F0'}`,
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {user.role === 'admin' && '🛡️ Administrator'}
                {user.role === 'professional' && '⚡ Professional Technician'}
                {user.role === 'partner' && '💼 Business Agency Partner'}
                {(!user.role || user.role === 'customer') && '👤 Verified Customer'}
              </span>
            </div>

            {/* Direct Dashboard Launch Button */}
            <div style={{ marginBottom: 18 }}>
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAdminDashboard) onOpenAdminDashboard();
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Open Executive Admin Dashboard</span>
                </button>
              )}

              {user.role === 'professional' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenProfessionalDashboard) onOpenProfessionalDashboard();
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <HardHat size={18} />
                  <span>Open Professional Technician Hub</span>
                </button>
              )}

              {user.role === 'partner' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenPartnerDashboard) onOpenPartnerDashboard();
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  <Building2 size={18} />
                  <span>Open Partner Agency Fleet Dashboard</span>
                </button>
              )}
            </div>

            {/* Switch Account Quick Actions */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 14,
              padding: 16,
              border: '1px solid #E2E8F0',
              marginBottom: 18
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 10 }}>
                Switch Account / Login with Another Role
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {Object.entries(ROLE_PRESETS).map(([key, item]) => {
                  if (item.role === user.role) return null;
                  const Icon = item.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleQuickLogin(key)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 10,
                        padding: '8px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={14} color={item.color} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSwitchingAccount(true)}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: 10,
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: 13.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: 10
              }}
            >
              <KeyRound size={16} />
              <span>Log in with Different Credentials / Role</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '11px 0',
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
          </div>
        ) : (
          /* ======================================================== */
          /* GUEST / LOGIN VIEW WITH ROLE-BASED DASHBOARD ROUTING     */
          /* ======================================================== */
          <div>
            {user && (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '9px 14px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12.5,
                color: '#475569'
              }}>
                <span>Signed in: <strong>{user.name}</strong> ({user.role || 'customer'})</span>
                <button 
                  type="button" 
                  onClick={() => setIsSwitchingAccount(false)}
                  style={{ background: 'none', border: 'none', color: '#6E42E5', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                >
                  View Profile →
                </button>
              </div>
            )}
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#0F172A',
                color: '#fff',
                fontWeight: 900,
                fontSize: 18,
                marginBottom: 8
              }}>
                UC
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                Welcome to Urban Company
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Select your role or enter credentials to open your dashboard
              </p>
            </div>

            {/* Mode Switcher: Login / Signup */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: 12,
              padding: 4,
              marginBottom: 16
            }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 9,
                  border: 'none',
                  background: mode === 'login' ? '#FFFFFF' : 'transparent',
                  color: mode === 'login' ? '#0F172A' : '#64748B',
                  fontWeight: mode === 'login' ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 9,
                  border: 'none',
                  background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                  color: mode === 'signup' ? '#0F172A' : '#64748B',
                  fontWeight: mode === 'signup' ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: mode === 'signup' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <div>
                {/* 4 Role Selector Tabs */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Select Role &amp; Target Dashboard:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {Object.entries(ROLE_PRESETS).map(([key, item]) => {
                      const Icon = item.icon;
                      const active = selectedRole === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => selectRole(key)}
                          style={{
                            background: active ? '#F5F3FF' : '#F8FAFC',
                            border: `1.5px solid ${active ? '#7C3AED' : '#E2E8F0'}`,
                            borderRadius: 10,
                            padding: '8px 4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Icon size={16} color={active ? '#7C3AED' : item.color} />
                          <span style={{
                            fontSize: 11,
                            fontWeight: active ? 800 : 600,
                            color: active ? '#7C3AED' : '#334155',
                            whiteSpace: 'nowrap'
                          }}>
                            {key === 'customer' ? 'Customer' : key === 'admin' ? 'Admin' : key === 'professional' ? 'Pro Field' : 'Partner'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role Description Card */}
                <div style={{
                  background: 'rgba(124, 58, 237, 0.06)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: 10,
                  padding: '9px 12px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Sparkles size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.35 }}>
                    <strong>{activePreset.label}:</strong> {activePreset.desc} (Opens <strong>{activePreset.targetDashboard}</strong>)
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit}>
                  {errorMsg && (
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#DC2626',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div style={{
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#059669',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Email Address or Username
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '9px 12px'
                    }}>
                      <Mail size={16} color="#64748B" />
                      <input
                        type="email"
                        placeholder="e.g. admin@urbancompany.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          width: '100%',
                          fontSize: 13,
                          color: '#0F172A',
                          fontWeight: 600
                        }}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Password
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '9px 12px'
                    }}>
                      <Lock size={16} color="#64748B" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          width: '100%',
                          fontSize: 13,
                          color: '#0F172A',
                          fontWeight: 600
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      padding: '13px 20px',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 10,
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)'
                    }}
                  >
                    <span>Log In as {activePreset.label}</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* 1-Click Instant Demo Login Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(selectedRole)}
                    style={{
                      width: '100%',
                      background: '#F5F3FF',
                      color: '#7C3AED',
                      border: '1.5px solid #DDD6FE',
                      borderRadius: 12,
                      padding: '10px 20px',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Zap size={14} color="#7C3AED" />
                    <span>Instant 1-Click Login &amp; Open {activePreset.targetDashboard}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignupSubmit}>
                {errorMsg && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    marginBottom: 12
                  }}>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    marginBottom: 12
                  }}>
                    {successMsg}
                  </div>
                )}

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 9,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 9,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Create Password
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Minimum 4 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 9,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Confirm Password
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 9,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 11,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Create Customer Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
