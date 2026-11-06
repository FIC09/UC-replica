import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1100,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulse effect on brand icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Auto-transition to Onboarding after 2.8s
    const timer = setTimeout(() => {
      handleProceed();
    }, 2800);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  const handleProceed = () => {
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Decorative background radial glow */}
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      {/* Main Brand Container */}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Brand Logo Badge */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.logoInner}>
            <View style={styles.iconBackdrop}>
              <Ionicons name="home" size={38} color="#FFFFFF" />
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles" size={18} color="#FEF08A" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>FORGE INDIA</Text>
        <Text style={styles.brandSubtitle}>CONNECT</Text>

        {/* Animated Tagline */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
          <View style={styles.taglineBadge}>
            <Text style={styles.taglineText}>HOME SERVICES AT YOUR DOORSTEP</Text>
          </View>

          <Text style={styles.featureHighlights}>
            Appliances • Repairs • Cleaning • Native Devices • Grooming
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer Skip / Continue button */}
      <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleProceed}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.copyrightText}>
          Trusted by 12M+ Homes Across India
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E063D', // Deep Forge Royal Purple
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircleTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(79, 70, 229, 0.22)',
  },
  glowCircleBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(5, 150, 105, 0.16)',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
  },
  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackdrop: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -6,
    right: -8,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#DDD6FE',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  taglineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: Spacing.sm,
  },
  taglineText: {
    ...Typography.tinyBold,
    color: '#FEF08A',
    letterSpacing: 1.2,
  },
  featureHighlights: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: width * 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl + 10,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  continueText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
  },
  copyrightText: {
    ...Typography.tiny,
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.2,
  },
});
