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
  
  // Sign In / Common Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

  // 1. SIGN IN (Email, Phone, or Username + Password)
  const handleSignIn = async () => {
    const cleanId = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanId) {
      Alert.alert('Required Field', 'Please enter your email address or phone number.');
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
        identifier: cleanId,
        password: cleanPassword,
        role: selectedRole
      });

      if (result.success && result.user) {
        Alert.alert(
          'Sign In Successful',
          `Welcome back, ${result.user.name || 'User'}!`
        );
        onSuccess(result.user);
      }
    } catch (err) {
      const errMsg = err.message || 'Incorrect credentials. Please verify your email/phone and password.';
      const isUnregistered = errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('register first');
      const displayMsg = isUnregistered
        ? "You've not registered, register first."
        : errMsg;

      setStatusMessage(`⚠️ ${displayMsg}`);

      if (isUnregistered) {
        Alert.alert(
          'Registration Required',
          "You've not registered, register first.",
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register First →',
              onPress: () => {
                setAuthMode('create');
                setStatusMessage('');
                if (cleanId.includes('@')) {
                  setEmail(cleanId);
                } else {
                  const digits = cleanId.replace(/\D/g, '').slice(-10);
                  if (digits) setPhone(digits);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Sign In Failed', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE ACCOUNT - SEND REAL-TIME EMAIL OTP
  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      Alert.alert('Password Required', 'Please create a password of at least 6 characters.');
      return;
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      Alert.alert('Mobile Number Required', 'Please enter your 10-digit mobile number.');
      return;
    }
    if (!/^[6-9]/.test(phoneDigits)) {
      Alert.alert('Invalid Mobile Number', 'Mobile number must start with 6, 7, 8, or 9. Numbers starting with 0–5 are invalid.');
      return;
    }
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid Mobile Number', `Mobile number must contain exactly 10 digits (received ${phoneDigits.length} digits).`);
      return;
    }

    setLoading(true);
    setStatusMessage('Sending 6-digit OTP to your email...');

    try {
      const response = await mobileApi.sendEmailOtp({
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        role: selectedRole
      });

      setExpectedOtp(response.otp);
      setStep('otp');
      setCooldown(30);
      setStatusMessage(`✅ OTP sent! Please check your email inbox: ${cleanEmail}`);

      Alert.alert(
        'Verification Code Sent',
        `A 6-digit verification code has been dispatched to ${cleanEmail}.\n\n(Dev Hint: ${response.otp})`
      );
    } catch (err) {
      Alert.alert('Dispatch Error', err.message || 'Failed to dispatch verification email. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY OTP & COMPLETE REGISTRATION
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const result = await mobileApi.verifyEmailOtp({
        email: email.trim(),
        enteredOtp: otp.trim(),
        expectedOtp,
        role: selectedRole,
        name: name.trim() || 'User',
        phone: phone.trim(),
        password: password.trim()
      });

      if (result.success && result.user) {
        Alert.alert(
          'Account Created Successfully',
          `Welcome to Forge India Connect, ${result.user.name || 'User'}!`
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
    <Modal visible={visible} animationType="fade" transparent={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Card Container */}
          <View style={styles.card}>
            {/* Top Close Button */}
            {onClose ? (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}

            {/* Top Center Logo Badge */}
            <View style={styles.logoBadgeContainer}>
              <View style={styles.ficLogoBadge}>
                <Text style={styles.ficLogoText}>FIC</Text>
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.cardTitle}>Welcome to Forge India Connect</Text>
            <Text style={styles.cardSubtitle}>
              {step === 'otp'
                ? `Enter the 6-digit verification code sent to ${email || 'your email'}`
                : authMode === 'signin'
                  ? 'Enter your credentials to open your target dashboard'
                  : 'Enter your details to create your verified account'}
            </Text>

            {/* Segmented Pill Tabs (Sign In vs Create Account) */}
            {step !== 'otp' && (
              <View style={styles.pillTabBar}>
                <TouchableOpacity
                  style={[
                    styles.pillTabItem,
                    authMode === 'signin' && styles.pillTabItemActive
                  ]}
                  onPress={() => {
                    setAuthMode('signin');
                    setStatusMessage('');
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.pillTabText,
                      authMode === 'signin' && styles.pillTabTextActive
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pillTabItem,
                    authMode === 'create' && styles.pillTabItemActive
                  ]}
                  onPress={() => {
                    setAuthMode('create');
                    setStatusMessage('');
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.pillTabText,
                      authMode === 'create' && styles.pillTabTextActive
                    ]}
                  >
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Status Feedback Message */}
            {statusMessage && step !== 'otp' ? (
              <View style={[
                styles.statusBox,
                (statusMessage.toLowerCase().includes('register') || statusMessage.toLowerCase().includes('not registered')) && {
                  backgroundColor: '#FEF2F2',
                  borderColor: '#F87171'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  (statusMessage.toLowerCase().includes('register') || statusMessage.toLowerCase().includes('not registered')) && {
                    color: '#DC2626',
                    fontWeight: '800'
                  }
                ]}>
                  {statusMessage}
                </Text>
                {(statusMessage.toLowerCase().includes('register first') || statusMessage.toLowerCase().includes('not registered')) && (
                  <TouchableOpacity
                    style={{
                      marginTop: 8,
                      backgroundColor: '#DC2626',
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      alignSelf: 'center'
                    }}
                    onPress={() => {
                      setAuthMode('create');
                      setStatusMessage('');
                      if (identifier.includes('@')) {
                        setEmail(identifier.trim());
                      } else {
                        const digits = identifier.replace(/\D/g, '').slice(-10);
                        if (digits) setPhone(digits);
                      }
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                      Register First →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {/* ==================== 1. SIGN IN VIEW ==================== */}
            {step !== 'otp' && authMode === 'signin' && (
              <View style={styles.formContainer}>
                {/* Account Type Option for Sign In */}
                <View style={[styles.roleSubtleRow, { marginBottom: 12 }]}>
                  <Text style={styles.roleSubtleLabel}>Sign In As:</Text>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'customer' && styles.roleChipActive
                    ]}
                    onPress={() => setSelectedRole('customer')}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'customer' && styles.roleChipTextActive
                      ]}
                    >
                      👤 Customer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'partner' && styles.roleChipActive
                    ]}
                    onPress={() => setSelectedRole('partner')}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'partner' && styles.roleChipTextActive
                      ]}
                    >
                      👷 Working Partner
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Email or Phone */}
                <Text style={styles.fieldLabel}>
                  {selectedRole === 'partner' ? 'Partner Email or Phone Number' : 'Customer Email or Phone Number'}
                </Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>✉</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder={selectedRole === 'partner' ? 'Enter partner email or phone' : 'Enter customer email or phone'}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={identifier}
                    onChangeText={setIdentifier}
                  />
                </View>

                {/* Password */}
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>🔒</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.inputTrailingBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Remember Me Checkbox */}
                <TouchableOpacity
                  style={styles.rememberMeRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      rememberMe && styles.checkboxBoxChecked
                    ]}
                  >
                    {rememberMe ? <Text style={styles.checkboxCheck}>✓</Text> : null}
                  </View>
                  <Text style={styles.rememberMeLabel}>Remember me</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleSignIn}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.mainSubmitBtnText}>
                      Sign In as {selectedRole === 'partner' ? 'Partner' : 'Customer'} →
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ==================== 2. CREATE ACCOUNT VIEW ==================== */}
            {step !== 'otp' && authMode === 'create' && (
              <View style={styles.formContainer}>
                {/* Full Name */}
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>👤</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Email Address */}
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>✉</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder="Enter email address"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Mobile Number */}
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>📞</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(val) => {
                      let clean = (val || '').replace(/\D/g, '');
                      if (clean.length > 10 && clean.startsWith('91')) clean = clean.slice(2);
                      else if (clean.length > 10 && clean.startsWith('0')) clean = clean.slice(1);
                      clean = clean.slice(0, 10);
                      if (clean.length === 1 && !/^[6-9]/.test(clean)) return;
                      setPhone(clean);
                    }}
                  />
                </View>

                {/* Password */}
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWithIconBox}>
                  <Text style={styles.inputLeadingIcon}>🔒</Text>
                  <TextInput
                    style={styles.innerTextInput}
                    placeholder="Create password (min 6 characters)"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.inputTrailingBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Account Type Option */}
                <View style={styles.roleSubtleRow}>
                  <Text style={styles.roleSubtleLabel}>Account Type:</Text>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'customer' && styles.roleChipActive
                    ]}
                    onPress={() => setSelectedRole('customer')}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'customer' && styles.roleChipTextActive
                      ]}
                    >
                      Customer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'partner' && styles.roleChipActive
                    ]}
                    onPress={() => setSelectedRole('partner')}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'partner' && styles.roleChipTextActive
                      ]}
                    >
                      Working Partner
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleSendOtp}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.mainSubmitBtnText}>Create Account →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ==================== 3. OTP VERIFICATION VIEW ==================== */}
            {step === 'otp' && (
              <View style={styles.formContainer}>
                <Text style={styles.fieldLabel}>Enter 6-Digit Email OTP</Text>
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
                  style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                  disabled={loading}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.mainSubmitBtnText}>
                      ✓ Verify & Complete Registration →
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {cooldown > 0 ? (
                    <Text style={styles.cooldownText}>Resend code in {cooldown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                      <Text style={styles.resendLinkText}>Resend Email OTP</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setStep('form')}>
                    <Text style={styles.changeEmailText}>Edit Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0F172A',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  logoBadgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  ficLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ficLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  pillTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  pillTabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  pillTabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pillTabText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  pillTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  formContainer: {
    width: '100%',
  },
  fieldLabel: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  inputWithIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  inputLeadingIcon: {
    fontSize: 15,
    marginRight: 8,
    color: '#64748B',
  },
  innerTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  inputTrailingBtn: {
    padding: 6,
  },
  eyeIconText: {
    fontSize: 16,
    color: '#64748B',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxBoxChecked: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  rememberMeLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  mainSubmitBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  mainSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  roleSubtleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    gap: 8,
  },
  roleSubtleLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
  },
  roleChipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  otpBigInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
    marginVertical: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  cooldownText: {
    color: '#64748B',
    fontSize: 12,
  },
  resendLinkText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  changeEmailText: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  statusBox: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  statusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
