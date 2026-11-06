import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
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
import {
  PriceDisplay,
  RatingComponent,
  StatusBadge,
  ServiceCard,
  FAQAccordion,
  ReviewCard,
  StickyBookNowButton,
} from '../../components';
import { ALL_SERVICES } from '../../data';
import { Service } from '../../types';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const serviceId = params.id || 'srv-1';
  const service =
    ALL_SERVICES.find((s) => s.id === serviceId) || ALL_SERVICES[0];

  // Cart / Book State
  const [isBooked, setIsBooked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Related services in the same category or popular services
  const relatedServices = ALL_SERVICES.filter(
    (s) => s.id !== service.id && s.categorySlug === service.categorySlug
  );

  const fallbackRelated =
    relatedServices.length > 0
      ? relatedServices
      : ALL_SERVICES.filter((s) => s.id !== service.id).slice(0, 4);

  const handleBookNow = () => {
    setIsBooked(!isBooked);
    Alert.alert(
      !isBooked ? 'Service Booked! 🎉' : 'Service Removed',
      !isBooked
        ? `${service.title} has been added to your appointment cart. You can choose your date and slot on checkout.`
        : `${service.title} was removed from your cart.`
    );
  };

  const handleRelatedPress = (rel: Service) => {
    router.push({
      pathname: '/services/detail',
      params: { id: rel.id },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* SECTION A: LARGE HERO IMAGE & FLOATING BUTTONS              */}
        {/* ============================================================ */}
        <View style={styles.heroContainer}>
          <Image source={service.image} style={styles.heroImage} resizeMode="cover" />

          {/* Floating Action Top Bar */}
          <SafeAreaView edges={['top']} style={styles.floatingTopBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={styles.floatingIconBtn}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.floatingRightActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFavorite(!isFavorite)}
                style={styles.floatingIconBtn}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? Colors.error : '#FFFFFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert('Share Service', `Share ${service.title} with your friends on WhatsApp!`)
                }
                style={styles.floatingIconBtn}
              >
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Badge on Hero */}
          {service.badge && (
            <View style={styles.heroBadge}>
              <StatusBadge label={service.badge} variant="sale" size="small" />
            </View>
          )}
        </View>

        {/* Main Details Card */}
        <View style={[styles.mainDetailsCard, Shadows.card]}>
          <View style={styles.categoryRatingRow}>
            <StatusBadge label={service.category} variant="time" size="small" />
            <RatingComponent
              rating={service.rating}
              reviewsCount={service.reviewsCount}
              size="medium"
            />
          </View>

          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.shortDescription}>{service.description}</Text>

          {/* Price & Duration Row */}
          <View style={styles.priceDurationRow}>
            <PriceDisplay
              price={service.price}
              originalPrice={service.originalPrice}
              size="large"
            />

            {service.duration && (
              <View style={styles.durationPill}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.durationPillText}>{service.duration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================================ */}
        {/* SECTION B: DETAILED SERVICE DESCRIPTION & SCOPE             */}
        {/* ============================================================ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About this Service</Text>
          <Text style={styles.detailedDescText}>
            {service.detailedDescription || service.description}
          </Text>

          {/* What's Included */}
          {service.includes && service.includes.length > 0 && (
            <View style={styles.scopeBox}>
              <View style={styles.scopeHeaderRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.emerald} />
                <Text style={styles.scopeHeading}>What is Included</Text>
              </View>
              {service.includes.map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-sharp" size={15} color={Colors.emerald} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* What's NOT Included */}
          {service.excludes && service.excludes.length > 0 && (
            <View style={[styles.scopeBox, { borderColor: '#FEE2E2', backgroundColor: '#FFFBFB' }]}>
              <View style={styles.scopeHeaderRow}>
                <Ionicons name="close-circle" size={18} color={Colors.error} />
                <Text style={[styles.scopeHeading, { color: Colors.error }]}>What is Excluded</Text>
              </View>
              {service.excludes.map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="close-sharp" size={15} color={Colors.error} />
                  <Text style={[styles.checkText, { color: Colors.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ============================================================ */}
        {/* SECTION C: SERVICE BENEFITS HIGHLIGHTS                      */}
        {/* ============================================================ */}
        {service.benefits && service.benefits.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Key Benefits</Text>
            <View style={styles.benefitsGrid}>
              {service.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitCard}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* SECTION D: REVIEWS & RATINGS                                */}
        {/* ============================================================ */}
        <View style={styles.sectionContainer}>
          <View style={styles.ratingHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <Text style={styles.sectionSubtext}>
                Verified ratings from authenticated bookings
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>★ {service.rating}</Text>
              <Text style={styles.scoreSubtext}>{service.reviewsCount || '1.8M'} reviews</Text>
            </View>
          </View>

          {/* Rating Breakdown Bars */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>5 Stars</Text>
              <View style={styles.breakdownTrack}>
                <View style={[styles.breakdownFill, { width: '86%' }]} />
              </View>
              <Text style={styles.breakdownPercent}>86%</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4 Stars</Text>
              <View style={styles.breakdownTrack}>
                <View style={[styles.breakdownFill, { width: '10%' }]} />
              </View>
              <Text style={styles.breakdownPercent}>10%</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3 Stars</Text>
              <View style={styles.breakdownTrack}>
                <View style={[styles.breakdownFill, { width: '3%' }]} />
              </View>
              <Text style={styles.breakdownPercent}>3%</Text>
            </View>
          </View>

          {/* Review Cards */}
          {service.reviews && service.reviews.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              {service.reviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </View>
          )}
        </View>

        {/* ============================================================ */}
        {/* SECTION E: FREQUENTLY ASKED QUESTIONS (FAQ Accordion)       */}
        {/* ============================================================ */}
        {service.faqs && service.faqs.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtext}>Everything you need to know before booking</Text>
            <FAQAccordion faqs={service.faqs} style={{ marginTop: Spacing.sm }} />
          </View>
        )}

        {/* ============================================================ */}
        {/* SECTION F: RELATED SERVICES CAROUSEL                        */}
        {/* ============================================================ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Related Services</Text>
          <Text style={styles.sectionSubtext}>Customers also booked these services</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedScroll}
          >
            {fallbackRelated.map((rel) => (
              <ServiceCard
                key={rel.id}
                service={rel}
                onPress={handleRelatedPress}
                onAddPress={() =>
                  Alert.alert('Added', `${rel.title} added to appointment cart.`)
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Space for sticky bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================ */}
      {/* SECTION G: STICKY BOOK NOW BUTTON                           */}
      {/* ============================================================ */}
      <StickyBookNowButton
        price={service.price}
        originalPrice={service.originalPrice}
        duration={service.duration}
        isAdded={isBooked}
        onBookPress={handleBookNow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  heroContainer: {
    width: width,
    height: 280,
    position: 'relative',
    backgroundColor: Colors.secondary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  floatingIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
  },
  mainDetailsCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: -24,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  serviceTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: Spacing.xs,
  },
  shortDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  priceDurationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationPillText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  sectionContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sectionSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  detailedDescText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  scopeBox: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  scopeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  scopeHeading: {
    ...Typography.bodyMedium,
    color: Colors.emeraldDark,
    fontWeight: '700',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  checkText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    width: '48%',
  },
  benefitText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 11,
  },
  ratingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  scoreBox: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  scoreText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
  },
  scoreSubtext: {
    ...Typography.tiny,
    color: Colors.textSecondary,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.xs + 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breakdownLabel: {
    ...Typography.tinyBold,
    color: Colors.textSecondary,
    width: 48,
  },
  breakdownTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: Colors.amber,
    borderRadius: 3,
  },
  breakdownPercent: {
    ...Typography.tiny,
    color: Colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  relatedScroll: {
    paddingTop: Spacing.sm,
  },
});

