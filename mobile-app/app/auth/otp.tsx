import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import { PrimaryButton, ConfirmationModal } from '../../components';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ flow?: string; target?: string }>();

  const flow = params.flow || 'register';
  const target = params.target || '+91 98401 98765';

  // 6-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resetSuccessModal, setResetSuccessModal] = useState(false);

  // Input refs for auto-focus
  const inputRefs = useRef<any[]>([]);

  // Countdown timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (error) setError('');
    const newOtp = [...otp];

    // Handling pasted code
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = chars[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendTimer(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Resent', `A new verification code has been sent to ${target}`);
  };

  const handleFillDemoCode = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setError('');
  };

  const handleVerify = () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (flow === 'reset') {
        setResetSuccessModal(true);
      } else {
        // Successful verification for registration or login
        Alert.alert(
          'Verification Successful! 🎉',
          'Welcome to Forge India Connect. Enjoy verified home services at your doorstep.',
          [
            {
              text: 'Go to Home',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    }, 900);
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

          {/* Icon & Title */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={34} color={Colors.emerald} />
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
              We have sent a 6-digit verification code to
            </Text>
            <View style={styles.targetRow}>
              <Text style={styles.targetText}>{target}</Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.changeBtn}
              >
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* OTP Card */}
          <View style={[styles.formCard, Shadows.card]}>
            {/* Demo Helper Banner */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleFillDemoCode}
              style={styles.demoHelper}
            >
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.demoHelperText}>
                Demo Mode: Tap here to auto-fill code <Text style={{ fontWeight: '800' }}>123456</Text>
              </Text>
            </TouchableOpacity>

            {/* 6 Input Boxes */}
            <View style={styles.otpInputsContainer}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref: any) => {
                    inputRefs.current[idx] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={idx === 0}
                />
              ))}
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Resend Timer Row */}
            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResend}
                  style={styles.resendBtn}
                >
                  <Ionicons name="refresh" size={14} color={Colors.primary} />
                  <Text style={styles.resendBtnText}>Resend OTP Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Didn't receive code? Resend in{' '}
                  <Text style={styles.timerCount}>{resendTimer}s</Text>
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Verify & Continue"
                onPress={handleVerify}
                isLoading={isLoading}
                size="large"
              />
            </View>
          </View>

          {/* Security Guarantee */}
          <View style={styles.guaranteeRow}>
            <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
            <Text style={styles.guaranteeText}>
              End-to-end encrypted verification with Forge India Connect
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Password Reset Confirmation Modal */}
      <ConfirmationModal
        visible={resetSuccessModal}
        title="Password Reset Successful"
        message="Your credentials have been securely verified. Please sign in with your new password."
        confirmText="Proceed to Login"
        cancelText="Close"
        confirmVariant="primary"
        iconName="checkmark-circle"
        iconColor={Colors.emerald}
        onConfirm={() => {
          setResetSuccessModal(false);
          router.replace('/auth/login');
        }}
        onCancel={() => {
          setResetSuccessModal(false);
          router.replace('/auth/login');
        }}
      />
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.display,
    fontSize: 27,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginTop: 4,
  },
  targetText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  changeBtn: {
    paddingHorizontal: Spacing.xs,
  },
  changeBtnText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  demoHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: 6,
    width: '100%',
  },
  demoHelperText: {
    ...Typography.tiny,
    color: Colors.primary,
    flex: 1,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.md,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAFF',
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.tiny,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  resendRow: {
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  timerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  timerCount: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  resendBtnText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  guaranteeText: {
    ...Typography.tiny,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
