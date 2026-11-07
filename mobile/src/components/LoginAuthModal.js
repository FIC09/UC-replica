import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal
} from 'react-native';
import mobileApi from '../services/apiClient';

export default function LoginAuthModal({
  visible,
  onSuccess,
  onClose,
  initialRole = 'customer'
}) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'create'
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'customer' | 'partner'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (str) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(str);
  };

  // 1. SIGN IN WITH EMAIL & PASSWORD
  const handleSignIn = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      Alert.alert('Email Required', 'Please enter your email address to sign in.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!cleanPassword) {
      Alert.alert('Password Required', 'Please enter your account password.');
      return;
    }

    setLoading(true);
    setStatusMessage('Authenticating credentials...');

    try {
      const result = await mobileApi.loginWithPassword({
        email: cleanEmail,
        password: cleanPassword,
        role: selectedRole
      });

      if (result.success && result.user) {
        Alert.alert(
          'Sign In Successful',
          `Welcome back, ${result.user.name}! Opening ${selectedRole === 'partner' ? 'Working Partner Dashboard' : 'Customer Dashboard'}.`
        );
        onSuccess(result.user);
      }
    } catch (err) {
      Alert.alert('Sign In Failed', err.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // 2. CREATE ACCOUNT - SEND REAL-TIME EMAIL OTP
  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      Alert.alert('Email Required', 'Please enter your email address to create an account.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      Alert.alert('Password Required', 'Please create a password of at least 6 characters for future sign-ins.');
      return;
    }

    setLoading(true);
    setStatusMessage('Dispatching real-time OTP to your email inbox...');

    try {
      const response = await mobileApi.sendEmailOtp({
        email: cleanEmail,
        name: name.trim() || (selectedRole === 'partner' ? 'Vikram Salvi' : 'Rahul Sharma'),
        role: selectedRole
      });

      setExpectedOtp(response.otp);
      setStep('otp');
      setCooldown(30);
      setStatusMessage(`✅ OTP dispatched! Please check your email inbox: ${cleanEmail}`);

      Alert.alert(
        'Verification Code Sent',
        `A 6-digit verification code has been dispatched to ${cleanEmail}.\n\n(Dev Test Hint: ${response.otp})`
      );
    } catch (err) {
      Alert.alert('Dispatch Error', err.message || 'Failed to dispatch email OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY OTP & FINALIZE ACCOUNT CREATION
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const result = await mobileApi.verifyEmailOtp({
        email,
        enteredOtp: otp.trim(),
        expectedOtp,
        role: selectedRole,
        name: name.trim() || (selectedRole === 'partner' ? 'Vikram Salvi' : 'Rahul Sharma'),
        password: password.trim()
      });

      if (result.success && result.user) {
        Alert.alert(
          'Account Created Successfully',
          `Your ${selectedRole === 'partner' ? 'Working Partner' : 'Customer'} account has been verified! You can now sign in anytime using your email and password.`
        );
        onSuccess(result.user);
      }
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification code. Please check your email inbox.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoPill}>
              <Text style={styles.logoPillText}>FIC</Text>
            </View>
            <Text style={styles.brandTitle}>Forge India Connect</Text>
            <Text style={styles.brandSubtitle}>
              India's Verified Doorstep Services Platform
            </Text>
          </View>

          {/* Role Switcher: Customer vs Working Partner */}
          <View style={styles.roleTabsContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.roleTab,
                selectedRole === 'customer' && styles.roleTabActiveCustomer
              ]}
              onPress={() => {
                setSelectedRole('customer');
                setStep('form');
                setOtp('');
              }}
            >
              <Text style={[
                styles.roleTabText,
                selectedRole === 'customer' && styles.roleTabTextActive
              ]}>
                👤 Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.roleTab,
                selectedRole === 'partner' && styles.roleTabActivePartner
              ]}
              onPress={() => {
                setSelectedRole('partner');
                setStep('form');
                setOtp('');
              }}
            >
              <Text style={[
                styles.roleTabText,
                selectedRole === 'partner' && styles.roleTabTextActive
              ]}>
                🛠️ Working Partner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Header info inside card */}
            <View style={styles.roleHeaderBox}>
              <Text style={styles.roleHeadline}>
                {authMode === 'signin'
                  ? `Sign In as ${selectedRole === 'partner' ? 'Working Partner' : 'Customer'}`
                  : `Create ${selectedRole === 'partner' ? 'Working Partner' : 'Customer'} Account`}
              </Text>
              <Text style={styles.roleDescription}>
                {authMode === 'signin'
                  ? 'Enter your registered email and password to access your dashboard.'
                  : 'Register your email and set a password. A 6-digit real-time OTP will be sent to your inbox.'}
              </Text>
            </View>

            {statusMessage ? (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            ) : null}

            {/* --- FORM DISPLAY --- */}
            {step === 'otp' ? (
              /* OTP VERIFICATION STEP (During Create Account) */
              <View style={styles.formSection}>
                <View style={styles.otpNoticeBox}>
                  <Text style={styles.otpNoticeTitle}>Check Your Email Inbox</Text>
                  <Text style={styles.otpNoticeEmail}>Dispatched to: {email}</Text>
                  <Text style={styles.otpNoticeSub}>
                    Please enter the 6-digit verification code sent to your inbox. Valid for 10 minutes.
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Enter 6-Digit Verification OTP *</Text>
                <TextInput
                  style={styles.otpBigInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleVerifyOtp}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      ✓ Verify OTP & Create Account
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {cooldown > 0 ? (
                    <Text style={styles.cooldownText}>Resend code in {cooldown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                      <Text style={styles.resendLinkText}>Didn't receive? Resend Email OTP</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setStep('form')}>
                    <Text style={styles.changeEmailText}>Edit Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : authMode === 'signin' ? (
              /* SIGN IN FORM (Only Email & Password) */
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />

                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleSignIn}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Sign In →
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.switchModeFooter}>
                  <Text style={styles.switchModePrompt}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setAuthMode('create');
                      setStep('form');
                    }}
                  >
                    <Text style={styles.switchModeLink}> Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* CREATE ACCOUNT FORM (Email, Name, Password - NO mobile number) */
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />

                <Text style={styles.inputLabel}>Full Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder={selectedRole === 'partner' ? 'e.g. Vikram Salvi' : 'e.g. Rahul Sharma'}
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Set Password *</Text>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Create password for future sign-ins"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Text style={styles.inputHelper}>
                  Use this password to sign in to your {selectedRole === 'partner' ? 'Partner' : 'Customer'} account in the future.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleSendOtp}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      📧 Send Real-Time Email OTP →
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.switchModeFooter}>
                  <Text style={styles.switchModePrompt}>Already have an account?</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setAuthMode('signin');
                      setStep('form');
                    }}
                  >
                    <Text style={styles.switchModeLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {onClose && (
              <TouchableOpacity style={styles.guestBtn} onPress={onClose}>
                <Text style={styles.guestBtnText}>Browse App as Guest →</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              🛡️ 100% Verified Quality • Aadhaar KYC Verified Specialists • Instant Bank IMPS
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 24 : 10,
  },
  logoPill: {
    backgroundColor: '#F04400',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoPillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleTabActiveCustomer: {
    backgroundColor: '#2563EB',
  },
  roleTabActivePartner: {
    backgroundColor: '#F04400',
  },
  roleTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  roleHeaderBox: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
  },
  roleHeadline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  roleDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  statusBox: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  statusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  showHideText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputHelper: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  otpBigInput: {
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#F04400',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
    marginVertical: 12,
  },
  otpNoticeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 12,
  },
  otpNoticeTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  otpNoticeEmail: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  otpNoticeSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#F04400',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  switchModeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchModePrompt: {
    color: '#94A3B8',
    fontSize: 13,
  },
  switchModeLink: {
    color: '#FFD91A',
    fontSize: 13,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  cooldownText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  resendLinkText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  changeEmailText: {
    color: '#94A3B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  guestBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerNoteText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
