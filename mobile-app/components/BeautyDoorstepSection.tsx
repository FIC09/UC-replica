import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { Service } from '../types';

const { width } = Dimensions.get('window');

interface BeautyTile {
  id: string;
  title: string;
  badge?: string | null;
  badgeType?: 'purple' | 'green' | null;
  type: 'image' | 'hair-dryer' | 'grid-dots';
  image?: any;
  searchQuery: string;
}

interface BeautyDoorstepSectionProps {
  onSelectTile: (tile: BeautyTile) => void;
  onSelectService?: (service: Service) => void;
  onToggleCart?: (service: Service) => void;
  cartServiceIds?: string[];
  onSwitchToHomes?: () => void;
}

export const BeautyDoorstepSection: React.FC<BeautyDoorstepSectionProps> = ({
  onSelectTile,
  onSelectService,
  onToggleCart,
  cartServiceIds = [],
  onSwitchToHomes,
}) => {
  const beautyTiles: BeautyTile[] = [
    {
      id: 'salon-prime',
      title: 'Salon Prime',
      badge: null,
      type: 'image',
      image: require('../assets/images/icon_salon_women_avatar.jpg'),
      searchQuery: 'Salon Prime',
    },
    {
      id: 'hair-studio',
      title: 'Hair Studio for Women',
      badge: '74 mins',
      badgeType: 'purple',
      type: 'hair-dryer',
      image: require('../assets/images/icon_hair_dryer.jpg'),
      searchQuery: 'Hair Studio for Women',
    },
    {
      id: 'salon-men',
      title: 'Salon for Men',
      badge: null,
      type: 'image',
      image: require('../assets/images/icon_salon_men_avatar.jpg'),
      searchQuery: 'Salon for Men',
    },
    {
      id: 'beard-hair',
      title: 'Beard & Hair Grooming',
      badge: '30 mins',
      badgeType: 'green',
      type: 'image',
      image: require('../assets/images/icon_salon_men_avatar.jpg'),
      searchQuery: 'Beard & Hair Grooming',
    },
    {
      id: 'all-services',
      title: 'All services',
      badge: null,
      type: 'grid-dots',
      searchQuery: 'all',
    },
  ];

  // Spotlights
  const spotlights = [
    {
      id: 'spot-1',
      title: 'Japanese glow rituals',
      subtitle: 'Now at your doorstep',
      badge: 'New launch',
      badgeBg: '#F3E8FF',
      badgeColor: '#7E22CE',
      image: require('../assets/images/spotlight_japanese_glow.jpg'),
      searchQuery: 'Japanese glow rituals',
    },
    {
      id: 'spot-2',
      title: 'Korean Glass Skin Facial',
      subtitle: '10-step hydration ritual',
      badge: 'Bestseller',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      image: require('../assets/images/beauty_korean_glow_facial.jpg'),
      searchQuery: 'Korean Glass Skin Facial',
    },
    {
      id: 'spot-3',
      title: "Men's Fade & Beard Craft",
      subtitle: 'Precision barber styling',
      badge: 'Express 30 mins',
      badgeBg: '#DCFCE7',
      badgeColor: '#15803D',
      image: require('../assets/images/beauty_mens_haircut.jpg'),
      searchQuery: "Men's Haircut and Beard",
    },
  ];

  // Demo popular beauty services
  const popularBeautyServices: Service[] = [
    {
      id: 'srv-beauty-1',
      title: 'Salon Prime Hydra Glow Facial',
      category: "Women's Salon",
      categorySlug: 'womens-salon',
      price: 999,
      originalPrice: 1499,
      rating: 4.89,
      reviewsCount: '840k',
      duration: '60 mins',
      image: require('../assets/images/beauty_hero_kglow.jpg'),
      badge: 'Bestseller',
      description: 'Multi-stage deep extraction, antioxidant hydration serum infusion, and chilled jade stone contouring.',
      isPopular: true,
    },
    {
      id: 'srv-beauty-2',
      title: 'Roll-on Honey Waxing (Full Arms + Legs)',
      category: "Women's Salon",
      categorySlug: 'womens-salon',
      price: 549,
      originalPrice: 799,
      rating: 4.86,
      reviewsCount: '1.2M',
      duration: '45 mins',
      image: require('../assets/images/beauty_arm_treatment.jpg'),
      badge: 'Pain-Free',
      description: 'Single-use hygienic roll-on cartridges with soothing aloe vera after-wax nourishment.',
      isPopular: true,
    },
    {
      id: 'srv-beauty-3',
      title: "Men's Precision Haircut & Beard Shaping",
      category: "Men's Salon",
      categorySlug: 'mens-salon',
      price: 299,
      originalPrice: 449,
      rating: 4.88,
      reviewsCount: '950k',
      duration: '40 mins',
      image: require('../assets/images/beauty_mens_haircut.jpg'),
      badge: 'Top Stylist',
      description: 'Tailored fade haircut, hot towel beard contouring, and organic mint aftershave splash.',
      isPopular: true,
    },
    {
      id: 'srv-beauty-4',
      title: 'Anti-Frizz Hair Spa & Blowdry Styling',
      category: 'Hair Studio',
      categorySlug: 'womens-salon',
      price: 799,
      originalPrice: 1199,
      rating: 4.84,
      reviewsCount: '410k',
      duration: '50 mins',
      image: require('../assets/images/beauty_blowdry.jpg'),
      badge: 'Salon Finish',
      description: 'Deep conditioning keratin moisture therapy followed by high-gloss blowout styling.',
      isPopular: true,
    },
  ];

  const renderTileIcon = (tile: BeautyTile) => {
    if (tile.type === 'grid-dots') {
      return (
        <View style={styles.gridDotsBox}>
          {[0, 1, 2].map((r) => (
            <View key={r} style={styles.gridDotsRow}>
              {[0, 1, 2].map((c) => (
                <View key={c} style={styles.gridDot} />
              ))}
            </View>
          ))}
        </View>
      );
    }

    if (tile.image) {
      return (
        <Image
          source={tile.image}
          style={styles.tileImage}
          resizeMode="cover"
        />
      );
    }

    return <Ionicons name="sparkles" size={28} color={Colors.primary} />;
  };

  return (
    <View style={styles.container}>
      {/* 1. Headline */}
      <View style={styles.headlineContainer}>
        <Text style={styles.doorstepHeadline}>
          Beauty services at your{'\n'}doorstep
        </Text>
      </View>

      {/* 2. White Category Card with 5 tiles matching screenshot */}
      <View style={[styles.categoryCard, Shadows.elevated]}>
        <View style={styles.tilesGrid}>
          {beautyTiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              activeOpacity={0.75}
              onPress={() => {
                if (tile.id === 'all-services' && onSwitchToHomes) {
                  onSwitchToHomes();
                } else {
                  onSelectTile(tile);
                }
              }}
              style={styles.tileItem}
            >
              <View style={styles.tileIconContainer}>
                {renderTileIcon(tile)}
              </View>

              {/* Arrival badge */}
              {tile.badge ? (
                <View
                  style={[
                    styles.arrivalBadge,
                    tile.badgeType === 'purple' && styles.arrivalBadgePurple,
                    tile.badgeType === 'green' && styles.arrivalBadgeGreen,
                  ]}
                >
                  <Text
                    style={[
                      styles.arrivalBadgeText,
                      tile.badgeType === 'purple' && styles.arrivalBadgeTextPurple,
                      tile.badgeType === 'green' && styles.arrivalBadgeTextGreen,
                    ]}
                  >
                    {tile.badge}
                  </Text>
                </View>
              ) : (
                <View style={styles.badgePlaceholder} />
              )}

              <Text style={styles.tileTitle} numberOfLines={2}>
                {tile.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. 2x2 Photo Mosaic Collage */}
      <View style={styles.mosaicSection}>
        <View style={styles.mosaicRow}>
          {/* Left Sub-column */}
          <View style={styles.mosaicColumn}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                onSelectTile({
                  id: 'arm-treatment',
                  title: 'Skincare & Waxing',
                  type: 'image',
                  searchQuery: 'Waxing',
                })
              }
              style={[styles.mosaicImageWrapper, { height: 160 }]}
            >
              <Image
                source={require('../assets/images/beauty_arm_treatment.jpg')}
                style={styles.mosaicImage}
                resizeMode="cover"
              />
              <View style={styles.mosaicImageOverlay}>
                <Text style={styles.mosaicImageTag}>Skin & Waxing</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                onSelectTile({
                  id: 'mens-haircut',
                  title: "Men's Grooming",
                  type: 'image',
                  searchQuery: "Men's Haircut",
                })
              }
              style={[styles.mosaicImageWrapper, { height: 130 }]}
            >
              <Image
                source={require('../assets/images/beauty_mens_haircut.jpg')}
                style={styles.mosaicImage}
                resizeMode="cover"
              />
              <View style={styles.mosaicImageOverlay}>
                <Text style={styles.mosaicImageTag}>Men's Grooming</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Right Sub-column */}
          <View style={styles.mosaicColumn}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                onSelectTile({
                  id: 'hair-blowdry',
                  title: 'Hair Styling',
                  type: 'image',
                  searchQuery: 'Hair Styling',
                })
              }
              style={[styles.mosaicImageWrapper, { height: 130 }]}
            >
              <Image
                source={require('../assets/images/beauty_blowdry.jpg')}
                style={styles.mosaicImage}
                resizeMode="cover"
              />
              <View style={styles.mosaicImageOverlay}>
                <Text style={styles.mosaicImageTag}>Hair Studio</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                onSelectTile({
                  id: 'glow-facial',
                  title: 'Hydra Glow Facial',
                  type: 'image',
                  searchQuery: 'Facial',
                })
              }
              style={[styles.mosaicImageWrapper, { height: 160 }]}
            >
              <Image
                source={require('../assets/images/beauty_hero_kglow.jpg')}
                style={styles.mosaicImage}
                resizeMode="cover"
              />
              <View style={styles.mosaicImageOverlay}>
                <Text style={styles.mosaicImageTag}>Facial & Glow</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. Social Proof & Ratings Row */}
      <View style={styles.ratingsCard}>
        <View style={styles.ratingStatItem}>
          <View style={styles.statIconBox}>
            <Ionicons name="star" size={24} color="#0F172A" />
          </View>
          <View>
            <Text style={styles.ratingValue}>4.8</Text>
            <Text style={styles.ratingLabel}>Service Rating*</Text>
          </View>
        </View>

        <View style={styles.ratingDivider} />

        <View style={styles.ratingStatItem}>
          <View style={styles.statIconBox}>
            <Ionicons name="people" size={24} color="#0F172A" />
          </View>
          <View>
            <Text style={styles.ratingValue}>12M+</Text>
            <Text style={styles.ratingLabel}>Customers Globally*</Text>
          </View>
        </View>
      </View>

      {/* 5. In the spotlight Section */}
      <View style={styles.spotlightSection}>
        <View style={styles.spotlightHeader}>
          <Text style={styles.spotlightTitle}>In the spotlight</Text>
          <Text style={styles.spotlightSub}>Trending treatments crafted for you</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotlightScroll}
        >
          {spotlights.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() =>
                onSelectTile({
                  id: item.id,
                  title: item.title,
                  type: 'image',
                  searchQuery: item.searchQuery,
                })
              }
              style={[styles.spotlightCard, Shadows.card]}
            >
              <Image source={item.image} style={styles.spotlightImage} />
              <View style={styles.spotlightContent}>
                <View
                  style={[
                    styles.spotlightBadge,
                    { backgroundColor: item.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.spotlightBadgeText,
                      { color: item.badgeColor },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
                <Text style={styles.spotlightHeading} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.spotlightCardSub} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 6. Popular Doorstep Beauty Services */}
      <View style={styles.servicesSection}>
        <View style={styles.servicesHeader}>
          <Text style={styles.servicesTitle}>Popular in Beauty & Grooming</Text>
          <Text style={styles.servicesSub}>Book top rated salon experts</Text>
        </View>

        {popularBeautyServices.map((srv) => {
          const isAdded = cartServiceIds.includes(srv.id);
          return (
            <TouchableOpacity
              key={srv.id}
              activeOpacity={0.85}
              onPress={() => onSelectService && onSelectService(srv)}
              style={[styles.serviceListItem, Shadows.card]}
            >
              <Image source={srv.image} style={styles.serviceListImage} />
              <View style={styles.serviceListDetails}>
                <View style={styles.serviceBadgeRow}>
                  {srv.badge && (
                    <View style={styles.miniBadge}>
                      <Text style={styles.miniBadgeText}>{srv.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.serviceDurationText}>• {srv.duration}</Text>
                </View>
                <Text style={styles.serviceListTitle} numberOfLines={2}>
                  {srv.title}
                </Text>
                <View style={styles.serviceRatingRow}>
                  <Ionicons name="star" size={13} color={Colors.amber} />
                  <Text style={styles.serviceRatingText}>{srv.rating}</Text>
                  <Text style={styles.serviceReviewsCount}>
                    ({srv.reviewsCount})
                  </Text>
                </View>
                <View style={styles.servicePriceBottomRow}>
                  <Text style={styles.serviceListPrice}>₹{srv.price}</Text>
                  {srv.originalPrice && (
                    <Text style={styles.serviceListOrigPrice}>
                      ₹{srv.originalPrice}
                    </Text>
                  )}
                </View>
              </View>

              {/* Add / Added Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onToggleCart && onToggleCart(srv)}
                style={[
                  styles.addCartButton,
                  isAdded && styles.addCartButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.addCartButtonText,
                    isAdded && styles.addCartButtonTextActive,
                  ]}
                >
                  {isAdded ? 'Added ✓' : 'Add +'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  headlineContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  doorstepHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tileItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 16,
  },
  tileIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  gridDotsBox: {
    width: 28,
    height: 28,
    justifyContent: 'space-between',
  },
  gridDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  arrivalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  arrivalBadgePurple: {
    backgroundColor: '#F3E8FF',
  },
  arrivalBadgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  arrivalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  arrivalBadgeTextPurple: {
    color: '#7E22CE',
  },
  arrivalBadgeTextGreen: {
    color: '#15803D',
  },
  badgePlaceholder: {
    height: 18,
    marginTop: 6,
    marginBottom: 4,
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 16,
  },
  mosaicSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  mosaicRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mosaicColumn: {
    flex: 1,
    gap: 12,
  },
  mosaicImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  mosaicImage: {
    width: '100%',
    height: '100%',
  },
  mosaicImageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mosaicImageTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingsCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  ratingStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  spotlightSection: {
    marginTop: Spacing.xl,
  },
  spotlightHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  spotlightSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  spotlightScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 14,
  },
  spotlightCard: {
    width: 200,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  spotlightImage: {
    width: '100%',
    height: 120,
  },
  spotlightContent: {
    padding: 12,
  },
  spotlightBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  spotlightBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  spotlightHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  spotlightCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  servicesSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  servicesHeader: {
    marginBottom: Spacing.md,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  servicesSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  serviceListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  serviceListImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  serviceListDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  serviceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  miniBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6D28D9',
  },
  serviceDurationText: {
    fontSize: 11,
    color: '#64748B',
  },
  serviceListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  serviceRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  serviceReviewsCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  servicePriceBottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  serviceListPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceListOrigPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addCartButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  addCartButtonActive: {
    backgroundColor: Colors.primary,
  },
  addCartButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  addCartButtonTextActive: {
    color: '#FFFFFF',
  },
});
