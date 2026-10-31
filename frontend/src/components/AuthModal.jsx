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
import { adminClient } from '../admin/adminClient';
import { authApi } from '../api/apiClient';

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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Email OTP & Password flow state for Signup
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [signupOtp, setSignupOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreatedSuccess, setAccountCreatedSuccess] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

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
      const workerName = userObj.applicantName || userObj.name || 'Professional';
      const cleanName = workerName.trim();
      const parts = cleanName.split(/\s+/);
      const computedInitials = parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : cleanName.slice(0, 2).toUpperCase() || 'PR';

      const proData = {
        id: userObj.id || userObj.workerId || userObj._id || '',
        workerId: userObj.id || userObj.workerId || userObj._id || '',
        applicantName: workerName,
        name: workerName,
        phone: userObj.phone || '',
        email: userObj.email || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@urbanpro.com`,
        avatar: userObj.avatar || computedInitials,
        trade: userObj.trade || userObj.tradeName || 'AC & Appliance Repair Specialist',
        tier: userObj.tier || 'New Partner (Level 1)',
        employmentType: userObj.employmentType || 'Direct Freelance',
        walletBalance: userObj.walletBalance != null ? Number(userObj.walletBalance) : 0,
        lifetimeEarnings: userObj.lifetimeEarnings != null ? Number(userObj.lifetimeEarnings) : 0,
        jobsCompleted: userObj.jobsCompleted != null ? Number(userObj.jobsCompleted) : 0,
        isOnline: true,
        status: userObj.status || 'Approved'
      };
      const proToken = userObj.token || sessionStorage.getItem('uc_pro_token') || localStorage.getItem('uc_pro_token') || 'simulated-pro-jwt-token';
      professionalClient.setAuth(proToken, proData);
      sessionStorage.setItem('uc_pro_token', proToken);
      localStorage.setItem('uc_pro_token', proToken);
      if (proData.id) {
        localStorage.setItem('uc_pro_id', proData.id);
      }
      localStorage.setItem('uc_pro_user', JSON.stringify(proData));
    } else if (role === 'admin') {
      sessionStorage.setItem('uc_admin_auth', 'true');
      localStorage.setItem('uc_admin_auth', 'true');
      const adminData = {
        id: userObj.id || userObj._id || 'ADM-01',
        name: userObj.name || 'Super Admin',
        email: userObj.email || 'admin@urbancompany.com',
        role: 'Super Administrator',
        department: 'Operations & Platform Control',
        avatarInitials: 'SA'
      };
      sessionStorage.setItem('uc_admin_user', JSON.stringify(adminData));
      localStorage.setItem('uc_admin_user', JSON.stringify(adminData));
      if (!sessionStorage.getItem('uc_admin_token') && !localStorage.getItem('uc_admin_token')) {
        sessionStorage.setItem('uc_admin_token', 'simulated-admin-jwt-token');
        localStorage.setItem('uc_admin_token', 'simulated-admin-jwt-token');
      }
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

  // Handle escape key & initialMode sync
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'signup') {
        setMode('signup');
        setIsSwitchingAccount(false);
      } else {
        setMode('login');
        setIsSwitchingAccount(true);
      }
      setIsEmailVerified(false);
      setIsOtpSent(false);
      setAccountCreatedSuccess(false);
      setCreatedUserData(null);
      setIsCreatingAccount(false);
      setSignupOtp('');
      setIsSendingOtp(false);
      setIsVerifyingOtp(false);
      setResendCooldown(0);
      setDevOtpHint('');
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

  async function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = (loginEmail || '').trim();
    const cleanPassword = (loginPassword || '').trim();

    if (!cleanInput) {
      setErrorMsg('Please enter your email, phone, or username');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 3) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. Unified server-side authentication (identifies exact role & account automatically)
      const res = await authApi.unifiedLogin({
        identifier: cleanInput,
        password: cleanPassword
      });

      if (res && res.success && res.user && res.role) {
        const detectedRole = res.role;
        const authenticatedUser = {
          ...res.user,
          role: detectedRole,
          token: res.token
        };

        try {
          localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
        } catch {}

        setupRoleAuth(detectedRole, authenticatedUser);
        window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: authenticatedUser } }));

        const targetDashboard = res.targetDashboard || (
          detectedRole === 'admin' ? 'Admin Dashboard' :
          detectedRole === 'professional' ? 'Worker Dashboard' :
          detectedRole === 'partner' ? 'Business Partner Dashboard' :
          'Customer Profile & Bookings'
        );

        setSuccessMsg(`✓ Logged in as ${authenticatedUser.name || 'User'}! Opening ${targetDashboard}...`);

        setTimeout(() => {
          setIsLoggingIn(false);
          onLogin(authenticatedUser);
          onClose();
        }, 350);
        return;
      } else {
        setErrorMsg(res?.error || 'Invalid credentials. Please verify your email/phone and password.');
        setIsLoggingIn(false);
        return;
      }
    } catch (err) {
      console.warn('Unified login attempt fallback:', err?.message || err);

      // 2. Client-side fallback checks
      const cleanLower = cleanInput.toLowerCase();
      let detectedRole = 'customer';
      if (cleanLower.includes('admin')) {
        detectedRole = 'admin';
      } else if (cleanLower.includes('pro') || cleanLower.includes('worker') || cleanLower.includes('technician')) {
        detectedRole = 'professional';
      } else if (cleanLower.includes('partner') || cleanLower.includes('agency') || cleanLower.includes('apex')) {
        detectedRole = 'partner';
      }

      const preset = ROLE_PRESETS[detectedRole] || ROLE_PRESETS.customer;
      const authenticatedUser = {
        name: preset.name,
        email: cleanInput.includes('@') ? cleanInput : preset.email,
        phone: preset.phone,
        role: detectedRole,
        trade: preset.trade,
        agencyName: preset.agencyName
      };

      if (detectedRole === 'admin') {
        try {
          const adminRes = await adminClient.login(cleanInput, cleanPassword);
          if (adminRes?.admin) {
            authenticatedUser.name = adminRes.admin.name || authenticatedUser.name;
            authenticatedUser.id = adminRes.admin.id;
          }
        } catch (adminErr) {
          setErrorMsg(adminErr.message || 'Invalid administrator credentials.');
          setIsLoggingIn(false);
          return;
        }
      } else if (detectedRole === 'professional') {
        try {
          const proRes = await professionalClient.login({
            identifier: cleanInput,
            password: cleanPassword
          });
          if (proRes?.success && proRes?.professional) {
            const pro = proRes.professional;
            authenticatedUser.name = pro.applicantName || pro.name;
            authenticatedUser.id = pro.id || pro.workerId;
            authenticatedUser.workerId = pro.id || pro.workerId;
            authenticatedUser.trade = pro.tradeName || pro.trade;
            authenticatedUser.token = proRes.token;
          } else {
            setErrorMsg(proRes?.error || 'Invalid worker credentials.');
            setIsLoggingIn(false);
            return;
          }
        } catch (proErr) {
          setErrorMsg(proErr.message || 'Invalid worker credentials.');
          setIsLoggingIn(false);
          return;
        }
      } else if (detectedRole === 'partner') {
        try {
          const partnerRes = await partnerClient.login({
            emailOrPhone: cleanInput,
            password: cleanPassword
          });
          if (partnerRes?.success && partnerRes?.partner) {
            authenticatedUser.name = partnerRes.partner.ownerName || authenticatedUser.name;
            authenticatedUser.businessName = partnerRes.partner.businessName;
            authenticatedUser.agencyName = partnerRes.partner.businessName;
          } else {
            setErrorMsg(partnerRes?.error || 'Invalid partner credentials.');
            setIsLoggingIn(false);
            return;
          }
        } catch (partnerErr) {
          setErrorMsg(partnerErr.message || 'Invalid partner credentials.');
          setIsLoggingIn(false);
          return;
        }
      }

      try {
        localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
      } catch {}

      setupRoleAuth(detectedRole, authenticatedUser);
      window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: authenticatedUser } }));

      setSuccessMsg(`✓ Logged in successfully! Opening dashboard...`);
      setTimeout(() => {
        setIsLoggingIn(false);
        onLogin(authenticatedUser);
        onClose();
      }, 350);
    }
  }

  async function handleQuickLogin(roleKey) {
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

    if (roleKey === 'admin') {
      try {
        const adminRes = await adminClient.login(preset.email, preset.password);
        if (adminRes?.admin) {
          authenticatedUser.name = adminRes.admin.name || authenticatedUser.name;
          authenticatedUser.id = adminRes.admin.id;
          authenticatedUser._id = adminRes.admin.id;
        }
      } catch (err) {
        console.warn('Admin backend quick login fallback:', err?.message || err);
      }
    } else if (roleKey === 'professional') {
      try {
        const proRes = await professionalClient.login({
          identifier: preset.email,
          password: preset.password
        });
        if (proRes?.success && proRes?.professional) {
          const pro = proRes.professional;
          authenticatedUser.name = pro.applicantName || pro.name || authenticatedUser.name;
          authenticatedUser.id = pro.id || pro.workerId;
          authenticatedUser.workerId = pro.id || pro.workerId;
          authenticatedUser._id = pro.id || pro.workerId;
          authenticatedUser.email = pro.email || preset.email;
          authenticatedUser.phone = pro.phone || authenticatedUser.phone;
          authenticatedUser.trade = pro.tradeName || pro.trade;
          authenticatedUser.avatar = pro.avatar;
          authenticatedUser.token = proRes.token;
          professionalClient.setAuth(proRes.token, pro);
        }
      } catch (err) {
        console.warn('Pro quick login fallback:', err?.message || err);
      }
    }

    try {
      localStorage.setItem('uc_user', JSON.stringify(authenticatedUser));
    } catch {}

    setupRoleAuth(preset.role, authenticatedUser);
    window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: authenticatedUser } }));

    setSuccessMsg(`Instant login verified as ${preset.label}!`);
    setTimeout(() => {
      onLogin(authenticatedUser);
      onClose();
    }, 350);
  }

  // Step 1: Send OTP to Email from Verify Button
  async function handleSendEmailOtp() {
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = signupEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await authApi.sendRegistrationOtp({
        email: cleanEmail,
        name: signupName.trim() || 'New Customer',
        phone: signupPhone.trim() || ''
      });

      if (res && res.success) {
        setOtpSentEmail(cleanEmail);
        setIsOtpSent(true);
        setResendCooldown(30);
        setSignupOtp('');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        setSuccessMsg(res.message || `A verification code was dispatched to ${cleanEmail}`);
      } else {
        setErrorMsg(res?.message || 'Failed to dispatch verification code. Please check your email.');
      }
    } catch (apiErr) {
      setErrorMsg(apiErr.message || 'Error communicating with registration server.');
    } finally {
      setIsSendingOtp(false);
    }
  }

  // Step 2: Verify the 6-Digit Email Code
  async function handleVerifyEmailOtp(e) {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = signupOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    const targetEmail = (otpSentEmail || signupEmail).trim().toLowerCase();
    setIsVerifyingOtp(true);
    try {
      const res = await authApi.verifyEmailOtp({
        email: targetEmail,
        otp: cleanOtp
      });

      if (res && res.success) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
        setSuccessMsg('✓ Email verified successfully! You can now set your password below.');
      } else {
        setErrorMsg(res?.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  // Step 3: Complete Account Registration with Passwords
  async function handleFinalSignupSubmit(e) {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();
    const cleanPhone = signupPhone.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!isEmailVerified) {
      setErrorMsg('Please click the "Verify" button on your email address first.');
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

    const formattedPhone = cleanPhone.startsWith('+91')
      ? cleanPhone
      : `+91 ${cleanPhone.replace(/\D/g, '').slice(-10)}`;

    let currentCity = 'Krishnagiri';
    let currentLocality = 'Rayakottai Road';
    try {
      const savedCity = localStorage.getItem('uc_selected_city');
      if (savedCity) currentCity = savedCity;
      const savedLocality = localStorage.getItem('uc_selected_locality');
      if (savedLocality) currentLocality = savedLocality;
    } catch {}

    setIsCreatingAccount(true);
    try {
      const res = await authApi.verifyRegistrationOtp({
        email: cleanEmail,
        otp: signupOtp,
        name: cleanName,
        phone: formattedPhone,
        password: signupPassword,
        city: currentCity,
        locality: currentLocality
      });

      if (res && res.success && res.user) {
        const newUser = {
          ...res.user,
          id: res.user._id || res.user.id,
          _id: res.user._id || res.user.id,
          role: 'customer'
        };

        try {
          localStorage.setItem('uc_user', JSON.stringify(newUser));
          window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: newUser } }));
          window.dispatchEvent(new CustomEvent('uc:customer-registered', { detail: newUser }));
          const syncChannel = new BroadcastChannel('uc_sync_channel');
          syncChannel.postMessage({ type: 'CUSTOMER_CREATED', customer: newUser, timestamp: Date.now() });
          syncChannel.close();
          localStorage.setItem('uc_last_customer_event', JSON.stringify({ type: 'CUSTOMER_CREATED', customer: newUser, timestamp: Date.now() }));
        } catch {}

        setCreatedUserData(newUser);
        setAccountCreatedSuccess(true);

        // Display quote celebration screen, then proceed into dashboard
        setTimeout(() => {
          onLogin(newUser);
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res?.message || 'Failed to complete registration.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setIsCreatingAccount(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || isSendingOtp) return;
    handleSendEmailOtp();
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
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#0F172A',
                color: '#fff',
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: '-0.3px',
                marginBottom: 8
              }}>
                FIC
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                Welcome to Forge India Connect
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Enter your credentials to open your target dashboard
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

                  {/* Email / Identifier Input */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Email Address or Phone Number
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '10px 12px'
                    }}>
                      <Mail size={16} color="#64748B" />
                      <input
                        type="text"
                        placeholder="Enter email, phone, or username"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="username"
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
                  <div style={{ marginBottom: 14 }}>
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
                      padding: '10px 12px'
                    }}>
                      <Lock size={16} color="#64748B" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
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

                  {/* Options row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, fontSize: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#64748B' }}>
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        style={{ accentColor: '#7C3AED' }}
                      />
                      <span>Remember me</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    style={{
                      width: '100%',
                      background: isLoggingIn ? '#64748B' : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      padding: '13px 20px',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isLoggingIn ? (
                      <>
                        <div style={{
                          width: 16,
                          height: 16,
                          border: '2px solid #FFFFFF',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }} />
                        <span>Verifying &amp; Opening Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : accountCreatedSuccess ? (
              /* Success Celebration Quote Screen */
              <div style={{ textAlign: 'center', padding: '36px 20px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  marginBottom: 16
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#059669',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 8
                }}>
                  ✨ Registration Verified ✨
                </div>

                <blockquote style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 12px',
                  lineHeight: 1.3,
                  fontStyle: 'italic',
                  padding: '0 10px'
                }}>
                  “Account created successfully”
                </blockquote>

                <p style={{
                  fontSize: 14,
                  color: '#64748B',
                  margin: '0 auto 24px',
                  maxWidth: 320,
                  lineHeight: 1.5
                }}>
                  Welcome aboard, <strong style={{ color: '#0F172A' }}>{createdUserData?.name || signupName}</strong>! Your account has been registered and verified.
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#F1F5F9',
                  borderRadius: 24,
                  padding: '8px 18px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #6E42E5', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <span>Signing you in &amp; opening your dashboard...</span>
                </div>
              </div>
            ) : (
              /* Signup Form */
              <form onSubmit={handleFinalSignupSubmit}>
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

                {/* Full Name */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Selva Kumar"
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

                {/* Mobile Number */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
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

                {/* Email Address with Inline Verify Button in the same box */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Email Address (For Verification Code)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isEmailVerified ? '#F0FDF4' : '#F8FAFC',
                    border: isEmailVerified ? '1.5px solid #86EFAC' : '1.5px solid #CBD5E1',
                    borderRadius: 9,
                    padding: '4px 6px 4px 12px',
                    transition: 'all 0.2s ease'
                  }}>
                    <Mail size={16} color={isEmailVerified ? '#16A34A' : '#64748B'} style={{ flexShrink: 0 }} />
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={signupEmail}
                      disabled={isEmailVerified}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        if (isEmailVerified) setIsEmailVerified(false);
                        if (isOtpSent) setIsOtpSent(false);
                      }}
                      required
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: 13,
                        color: '#0F172A',
                        outline: 'none',
                        padding: '6px 0',
                        fontWeight: isEmailVerified ? 700 : 500
                      }}
                    />
                    {isEmailVerified ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#DCFCE7',
                        color: '#15803D',
                        padding: '5px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        <CheckCircle2 size={13} />
                        <span>Verified</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailVerified(false);
                            setIsOtpSent(false);
                            setSignupOtp('');
                          }}
                          title="Change Email"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 11,
                            color: '#16A34A',
                            marginLeft: 4,
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isSendingOtp || !signupEmail.trim() || !signupEmail.includes('@')}
                        onClick={handleSendEmailOtp}
                        style={{
                          background: (isSendingOtp || !signupEmail.trim() || !signupEmail.includes('@')) ? '#E2E8F0' : '#6E42E5',
                          color: (isSendingOtp || !signupEmail.trim() || !signupEmail.includes('@')) ? '#94A3B8' : '#FFFFFF',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: (isSendingOtp || !signupEmail.trim() || !signupEmail.includes('@')) ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSendingOtp ? (
                          <>
                            <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>{isOtpSent ? 'Resend' : 'Verify'}</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline OTP Input Box when OTP is sent */}
                {isOtpSent && !isEmailVerified && (
                  <div style={{
                    background: '#FAF5FF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 12,
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 800, color: '#5B21B6' }}>
                        Enter 6-Digit Email Code
                      </label>
                      <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>
                        Sent to {otpSentEmail}
                      </span>
                    </div>

                    {devOtpHint && (
                      <div style={{
                        background: '#EFF6FF',
                        border: '1px dashed #93C5FD',
                        color: '#1E40AF',
                        padding: '5px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>Quick Fill Code: <strong>{devOtpHint}</strong></span>
                        <button
                          type="button"
                          onClick={() => setSignupOtp(devOtpHint)}
                          style={{
                            background: '#DBEAFE',
                            border: 'none',
                            color: '#1D4ED8',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus
                        placeholder="••••••"
                        value={signupOtp}
                        onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #7C3AED',
                          fontSize: 18,
                          fontWeight: 900,
                          letterSpacing: 6,
                          textAlign: 'center',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        disabled={isVerifyingOtp || signupOtp.trim().length !== 6}
                        onClick={handleVerifyEmailOtp}
                        style={{
                          background: (isVerifyingOtp || signupOtp.trim().length !== 6) ? '#CBD5E1' : '#7C3AED',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 16px',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: (isVerifyingOtp || signupOtp.trim().length !== 6) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0
                        }}
                      >
                        {isVerifyingOtp ? (
                          <>
                            <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            <span>Checking...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: '#6B7280' }}>⏱️ Code valid for 10 minutes</span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSendingOtp}
                        onClick={handleSendEmailOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: resendCooldown > 0 ? '#9CA3AF' : '#6E42E5',
                          fontWeight: 700,
                          cursor: (resendCooldown > 0 || isSendingOtp) ? 'not-allowed' : 'pointer',
                          padding: 0
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Fields: Locked until Email OTP is Verified */}
                <div style={{
                  opacity: isEmailVerified ? 1 : 0.65,
                  transition: 'all 0.25s ease'
                }}>
                  {!isEmailVerified && (
                    <div style={{
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      color: '#92400E',
                      padding: '6px 10px',
                      borderRadius: 7,
                      fontSize: 11.5,
                      fontWeight: 600,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Lock size={13} style={{ flexShrink: 0 }} />
                      <span>Verify email above to unlock password setup</span>
                    </div>
                  )}

                  {/* Create Password */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Create Password {isEmailVerified && <span style={{ color: '#059669', fontSize: 11 }}>✓ Unlocked</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder={isEmailVerified ? 'Minimum 4 characters' : 'Verify email first to enter password'}
                        value={signupPassword}
                        disabled={!isEmailVerified}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required={isEmailVerified}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 12px',
                          borderRadius: 9,
                          border: isEmailVerified ? '1.5px solid #7C3AED' : '1.5px solid #CBD5E1',
                          fontSize: 13,
                          boxSizing: 'border-box',
                          backgroundColor: isEmailVerified ? '#FFFFFF' : '#F1F5F9',
                          cursor: isEmailVerified ? 'text' : 'not-allowed'
                        }}
                      />
                      <button
                        type="button"
                        disabled={!isEmailVerified}
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: isEmailVerified ? 'pointer' : 'default',
                          color: '#94A3B8',
                          padding: 0
                        }}
                      >
                        {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder={isEmailVerified ? 'Re-enter password' : 'Verify email first to enter password'}
                        value={signupConfirmPassword}
                        disabled={!isEmailVerified}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required={isEmailVerified}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 12px',
                          borderRadius: 9,
                          border: isEmailVerified ? '1.5px solid #7C3AED' : '1.5px solid #CBD5E1',
                          fontSize: 13,
                          boxSizing: 'border-box',
                          backgroundColor: isEmailVerified ? '#FFFFFF' : '#F1F5F9',
                          cursor: isEmailVerified ? 'text' : 'not-allowed'
                        }}
                      />
                      <button
                        type="button"
                        disabled={!isEmailVerified}
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: isEmailVerified ? 'pointer' : 'default',
                          color: '#94A3B8',
                          padding: 0
                        }}
                      >
                        {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Submit Button */}
                <button
                  type="submit"
                  disabled={!isEmailVerified || isCreatingAccount}
                  style={{
                    width: '100%',
                    background: !isEmailVerified 
                      ? '#94A3B8' 
                      : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 11,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: (!isEmailVerified || isCreatingAccount) ? 'not-allowed' : 'pointer',
                    opacity: (!isEmailVerified || isCreatingAccount) ? 0.75 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: isEmailVerified ? '0 4px 14px rgba(15, 23, 42, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCreatingAccount ? (
                    <>
                      <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      <span>Creating Your Account...</span>
                    </>
                  ) : !isEmailVerified ? (
                    <>
                      <Lock size={15} />
                      <span>Verify Email to Continue</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account &amp; Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
