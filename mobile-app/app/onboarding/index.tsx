import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: any;
  highlightTag: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    badge: 'ALL-IN-ONE HOME SERVICES',
    title: 'Home Services\nat Your Doorstep',
    description:
      'Book top-rated technicians for AC repair, plumbing, carpentry, deep cleaning, and appliance maintenance with zero hassle.',
    image: require('../../assets/images/hero_ac.jpg'),
    highlightTag: '45-Min Express Arrival Available',
  },
  {
    id: 'slide-2',
    badge: 'EFFORTLESS BOOKING',
    title: 'Convenient Booking\n& Live Pro Tracking',
    description:
      'Pick your convenient time slot, view verified ratings, and track your service professional right as they arrive at your gate.',
    image: require('../../assets/images/ceiling_fan_install.jpg'),
    highlightTag: 'Transparent Pricing & Digital Invoicing',
  },
  {
    id: 'slide-3',
    badge: 'UNCOMPROMISING QUALITY',
    title: '100% Verified Pros\n& Damage Guarantee',
    description:
      'Every expert undergoes thorough background checks and standardized skill audits, backed by 30-day service protection.',
    image: require('../../assets/images/beauty_arm_treatment.jpg'),
    highlightTag: '12M+ Satisfied Homes in India',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/auth/login');
    }
  };

  const handleSkip = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Bar: Progress & Skip button */}
      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>FIC</Text>
        </View>

        {!isLastSlide ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Horizontal Carousel Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* Visual Hero Card */}
            <View style={[styles.imageCard, Shadows.elevated]}>
              <Image
                source={slide.image}
                style={styles.slideImage}
                resizeMode="cover"
              />
              <View style={styles.highlightBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                <Text style={styles.highlightText}>{slide.highlightTag}</Text>
              </View>
            </View>

            {/* Text Information */}
            <View style={styles.textContainer}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{slide.badge}</Text>
              </View>

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Navigation Area */}
      <View style={styles.footerContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                ]}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        {!isLastSlide ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSkip}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Skip All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleNext}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.lastSlideActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRegister}
              style={styles.getStartedBtn}
            >
              <Text style={styles.getStartedText}>Get Started — Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/auth/login')}
              style={styles.loginLinkBtn}
            >
              <Text style={styles.loginLinkPre}>Already have an account? </Text>
              <Text style={styles.loginLinkBold}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
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
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  imageCard: {
    width: '100%',
    height: height * 0.38,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  highlightBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
  },
  highlightText: {
    ...Typography.tinyBold,
    color: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  badgePill: {
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  badgePillText: {
    ...Typography.tinyBold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    ...Typography.h1,
    fontSize: 25,
    lineHeight: 32,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs + 2,
    fontWeight: '800',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  footerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    width: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  secondaryBtn: {
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
  },
  lastSlideActions: {
    gap: Spacing.sm,
  },
  getStartedBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
  },
  loginLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  loginLinkPre: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontWeight: '800',
  },
});
