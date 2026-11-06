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

export default function LoginScreen() {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState('9840198765');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & UI State
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setIdentifierError('');
    setPasswordError('');

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setIdentifierError('Please enter your mobile number or email address');
      isValid = false;
    } else if (trimmedId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) {
        setIdentifierError('Please enter a valid email address');
        isValid = false;
      }
    } else {
      const cleanPhone = trimmedId.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setIdentifierError('Please enter a valid 10-digit mobile number');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to Home Tab
      router.replace('/(tabs)');
    }, 1000);
  };

  const handleQuickDemoFill = () => {
    setIdentifier('9840198765');
    setPassword('demo123');
    setIdentifierError('');
    setPasswordError('');
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

          {/* Title & Introduction */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage bookings, track experts, and access festive discounts.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, Shadows.card]}>
            {/* Demo Notice Banner */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleQuickDemoFill}
              style={styles.demoNotice}
            >
              <Ionicons name="flash" size={14} color="#7E22CE" />
              <Text style={styles.demoNoticeText}>
                Demo Account Pre-filled: <Text style={{ fontWeight: '800' }}>Tap to reset</Text>
              </Text>
            </TouchableOpacity>

            {/* Identifier Input (Mobile / Email) */}
            <CustomTextInput
              label="Mobile Number or Email"
              placeholder="e.g. 9840123456 or name@gmail.com"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (identifierError) setIdentifierError('');
              }}
              leftIcon="person-outline"
              error={identifierError}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <CustomTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={passwordError}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rowBetween}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.rememberMeRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Login Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Login to Account"
                onPress={handleLogin}
                isLoading={isLoading}
                size="large"
              />
            </View>
          </View>

          {/* Register / Sign Up Link */}
          <View style={styles.registerFooter}>
            <Text style={styles.registerTextPre}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.registerTextBold}>Create Account</Text>
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
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
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
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: 6,
  },
  demoNoticeText: {
    ...Typography.tiny,
    color: '#6B21A8',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberMeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  forgotPasswordText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  buttonWrapper: {
    marginTop: Spacing.xs,
  },
  registerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  registerTextPre: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  registerTextBold: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontWeight: '800',
  },
});
