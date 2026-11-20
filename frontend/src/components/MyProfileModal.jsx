import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  BookmarkCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { authApi } from '../api/apiClient';

export function MyProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenBookings,
  onOpenAddresses,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bank' | 'security'

  // Personal Info Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Bank Details Form
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankError, setBankError] = useState('');

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setCity(currentUser.city || 'Krishnagiri');
      setLocality(currentUser.locality || 'Rayakottai Road');
      setDateOfBirth(currentUser.dateOfBirth || '');

      if (currentUser.bankDetails) {
        setAccountHolderName(currentUser.bankDetails.accountHolderName || '');
        setAccountNumber(currentUser.bankDetails.accountNumber || '');
        setConfirmAccountNumber(currentUser.bankDetails.accountNumber || '');
        setIfscCode(currentUser.bankDetails.ifscCode || '');
        setBankName(currentUser.bankDetails.bankName || '');
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast && showToast('⚠️ Full Name is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await authApi.updateProfile({
        id: currentUser?._id || currentUser?.id,
        phone: currentUser?.phone,
        email: currentUser?.email,
        name: name.trim(),
        city: city.trim(),
        locality: locality.trim(),
        dateOfBirth: dateOfBirth.trim()
      });

      if (res && res.success && res.user) {
        onUpdateUser && onUpdateUser(res.user);
        showToast && showToast('✅ Profile information updated successfully!');
      } else {
        throw new Error(res?.message || 'Failed to update profile');
      }
    } catch (err) {
      showToast && showToast(`⚠️ ${err.message || 'Error updating profile'}`);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveBankDetails(e) {
    e.preventDefault();
    setBankError('');

    if (!accountHolderName.trim()) {
      setBankError('Account holder name is required');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      setBankError('Valid bank account number (at least 8 digits) is required');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setBankError('Bank account numbers do not match');
      return;
    }
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setBankError('Invalid IFSC format. Example: HDFC0001234, SBIN0004567');
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await authApi.updateProfile({
        id: currentUser?._id || currentUser?.id,
        phone: currentUser?.phone,
        email: currentUser?.email,
        bankDetails: {
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: cleanIfsc,
          bankName: bankName.trim() || 'Scheduled Indian Bank'
        }
      });

      if (res && res.success && res.user) {
        onUpdateUser && onUpdateUser(res.user);
        showToast && showToast('✅ Bank details saved securely for instant refunds!');
      } else {
        throw new Error(res?.message || 'Failed to save bank details');
      }
    } catch (err) {
      setBankError(err.message || 'Error saving bank account');
    } finally {
      setIsSavingBank(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await authApi.changePassword({
        id: currentUser?._id || currentUser?.id,
        email: currentUser?.email,
        phone: currentUser?.phone,
        currentPassword,
        newPassword
      });

      if (res && res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast && showToast('🔒 Password changed successfully!');
      } else {
        throw new Error(res?.message || 'Password update failed');
      }
    } catch (err) {
      setPasswordError(err.message || 'Could not change password');
    } finally {
      setIsSavingPassword(false);
    }
  }

  const maskedAccount = accountNumber && accountNumber.length > 4
    ? `••••••••${accountNumber.slice(-4)}`
    : 'Not added yet';

  return (
    <div 
      className="modal-backdrop-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 16
      }}
      onClick={onClose}
    >
      <div 
        className="profile-modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#0B57D0',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18
            }}>
              {(name || currentUser?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {currentUser?.name || 'Customer Account'}
              </h2>
              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{currentUser?.phone || 'Customer Profile'}</span>
                {currentUser?.hasUCPlus && (
                  <span style={{ fontSize: 10, background: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                    FIC PLUS MEMBER
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          backgroundColor: '#FFFFFF',
          gap: 20,
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '14px 4px',
              fontSize: 13.5,
              fontWeight: activeTab === 'profile' ? 800 : 600,
              color: activeTab === 'profile' ? '#0B57D0' : '#64748B',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2.5px solid #0B57D0' : '2.5px solid transparent',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <User size={15} />
            <span>Personal Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            style={{
              padding: '14px 4px',
              fontSize: 13.5,
              fontWeight: activeTab === 'bank' ? 800 : 600,
              color: activeTab === 'bank' ? '#0B57D0' : '#64748B',
              border: 'none',
              borderBottom: activeTab === 'bank' ? '2.5px solid #0B57D0' : '2.5px solid transparent',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <CreditCard size={15} />
            <span>Bank &amp; Refunds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '14px 4px',
              fontSize: 13.5,
              fontWeight: activeTab === 'security' ? 800 : 600,
              color: activeTab === 'security' ? '#0B57D0' : '#64748B',
              border: 'none',
              borderBottom: activeTab === 'security' ? '2.5px solid #0B57D0' : '2.5px solid transparent',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <Lock size={15} />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: Personal Details */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="e.g. Ramesh Kumar"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <User size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      disabled
                      placeholder="e.g. ramesh@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        color: '#64748B',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Date of Birth
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Calendar size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Default Locality
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    backgroundColor: '#0B57D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 22px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(11, 87, 208,0.25)'
                  }}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

              {/* Quick Navigation Shortcuts */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
                  Account Shortcuts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenBookings && onOpenBookings(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BookmarkCheck size={18} color="#0B57D0" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>My Bookings</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>View active &amp; completed orders</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAddresses && onOpenAddresses(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MapPin size={18} color="#059669" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Manage Addresses</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Saved homes &amp; delivery locations</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Bank Details for Refunds (Bug 11) */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSaveBankDetails} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, color: '#065F46', lineHeight: 1.4 }}>
                  <strong>Direct Payout &amp; Instant Refund Guarantee:</strong> Any cancelled or refunded bookings will be credited directly to this bank account within 2 hours via IMPS.
                </div>
              </div>

              {bankError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#B91C1C',
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span>{bankError}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                  Account Holder Name (as per Bank passbook) *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={e => setAccountHolderName(e.target.value)}
                  required
                  placeholder="e.g. RAMESH KUMAR"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Bank Account Number *
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="Enter account number"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                      letterSpacing: 1.5
                    }}
                  />
                  {currentUser?.bankDetails?.accountNumber && (
                    <span style={{ fontSize: 11, color: '#64748B', marginTop: 3, display: 'block' }}>
                      Current saved: <strong>{maskedAccount}</strong>
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Confirm Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={e => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="Re-enter account number"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    maxLength={11}
                    required
                    placeholder="e.g. HDFC0001234"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  style={{
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 22px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.25)'
                  }}
                >
                  {isSavingBank ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Security & Password (Bug 12) */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 12.5,
                color: '#475569',
                lineHeight: 1.4
              }}>
                To ensure account protection, please enter your existing password followed by your new password. Passwords must be at least 6 characters long.
              </div>

              {passwordError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#B91C1C',
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                  Current Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      style={{
                        width: '100%',
                        padding: '10px 38px 10px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 22px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.2)'
                  }}
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

