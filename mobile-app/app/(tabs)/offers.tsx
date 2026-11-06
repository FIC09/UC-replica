import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { CouponCard, PromotionalBanner } from '../../components';
import { DEMO_COUPONS, DEMO_PROMOTIONS } from '../../data';
import { Coupon, Promotion } from '../../types';

export default function OffersScreen() {
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>('c-1');

  const handleApplyCoupon = (coupon: Coupon) => {
    if (appliedCouponId === coupon.id) {
      setAppliedCouponId(null);
      Alert.alert('Coupon Removed', `Removed coupon code ${coupon.code}`);
    } else {
      setAppliedCouponId(coupon.id);
      Alert.alert('Coupon Applied', `Code ${coupon.code} applied! Enjoy ${coupon.title}`);
    }
  };

  const handlePromotionPress = (promo: Promotion) => {
    Alert.alert(promo.title, `Promo code: ${promo.code}\n${promo.subtitle}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Discounts</Text>
        <Text style={styles.headerSubtitle}>
          Save big with promo codes, seasonal discounts, and partner vouchers.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Exclusive Coupons</Text>
        <View style={styles.couponsList}>
          {DEMO_COUPONS.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              isApplied={appliedCouponId === coupon.id}
              onApply={handleApplyCoupon}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Seasonal Campaigns</Text>
        <View style={styles.promotionsList}>
          {DEMO_PROMOTIONS.map((promo) => (
            <PromotionalBanner
              key={promo.id}
              promotion={promo}
              onPress={handlePromotionPress}
              style={styles.promoCard}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  couponsList: {
    paddingHorizontal: Spacing.lg,
  },
  promotionsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  promoCard: {
    marginBottom: Spacing.sm,
  },
});

