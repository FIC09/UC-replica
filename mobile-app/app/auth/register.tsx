import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import {
  PrimaryButton,
  CustomTextInput,
} from '../../components';

export default function RegisterScreen() {
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Field Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
    } else if (!emailRegex.test(emailAddress.trim())) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP screen for demo verification
      router.push({
        pathname: '/auth/otp',
        params: {
          flow: 'register',
          target: mobileNumber || emailAddress,
        },
      });
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>FIC</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Forge India Connect to enjoy verified home services and festive member perks.
            </Text>
          </View>

          {/* Registration Form Card */}
          <View style={[styles.formCard, Shadows.card]}>
            {/* Full Name */}
            <CustomTextInput
              label="Full Name"
              placeholder="e.g. Selvakumar Raman"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              leftIcon="person-outline"
              error={errors.fullName}
              autoCapitalize="words"
            />

            {/* Mobile Number */}
            <CustomTextInput
              label="Mobile Number"
              placeholder="e.g. 9840123456"
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
              }}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              error={errors.mobileNumber}
              maxLength={10}
            />

            {/* Email Address */}
            <CustomTextInput
              label="Email Address"
              placeholder="e.g. selvakumar@gmail.com"
              value={emailAddress}
              onChangeText={(text) => {
                setEmailAddress(text);
                if (errors.emailAddress) setErrors({ ...errors, emailAddress: '' });
              }}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.emailAddress}
            />

            {/* Password */}
            <CustomTextInput
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            {/* Confirm Password */}
            <CustomTextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry={!showConfirmPassword}
              leftIcon="shield-checkmark-outline"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
            />

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setAgreedToTerms(!agreedToTerms);
                if (errors.terms) setErrors({ ...errors, terms: '' });
              }}
              style={styles.termsRow}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxActive,
                  errors.terms ? styles.checkboxError : null,
                ]}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Terms & Conditions', 'Standard Forge India Connect platform service terms apply.')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Privacy Policy', 'Your personal details are encrypted and securely protected.')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {errors.terms ? (
              <Text style={styles.termsErrorText}>{errors.terms}</Text>
            ) : null}

            {/* Create Account Primary Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                size="large"
              />
            </View>
          </View>

          {/* Already have an account? Login */}
          <View style={styles.loginFooter}>
            <Text style={styles.loginTextPre}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginTextBold}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  brandBadgeText: {
    ...Typography.tinyBold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.display,
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxError: {
    borderColor: Colors.error,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  termsErrorText: {
    ...Typography.tiny,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  buttonWrapper: {
    marginTop: Spacing.lg,
  },
  loginFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  loginTextPre: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginTextBold: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontWeight: '800',
  },
});
