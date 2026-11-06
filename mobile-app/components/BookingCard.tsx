import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { Booking } from '../types';
import StatusBadge from './StatusBadge';
import PriceDisplay from './PriceDisplay';

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
  onTrackPress?: (booking: Booking) => void;
  onCancelPress?: (booking: Booking) => void;
  onRebookPress?: (booking: Booking) => void;
  style?: ViewStyle;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onTrackPress,
  onCancelPress,
  onRebookPress,
  style,
}) => {
  const getStatusVariant = () => {
    switch (booking.status) {
      case 'upcoming':
        return 'upcoming';
      case 'in_progress':
        return 'in_progress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = () => {
    switch (booking.status) {
      case 'upcoming':
        return 'Upcoming';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return booking.status;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(booking)}
      style={[styles.card, Shadows.card, style]}
    >
      {/* Top Header: Booking # & Status */}
      <View style={styles.headerRow}>
        <View style={styles.bookingNumberBox}>
          <Text style={styles.bookingNumberText}>#{booking.bookingNumber}</Text>
        </View>
        <StatusBadge label={getStatusLabel()} variant={getStatusVariant()} size="small" />
      </View>

      {/* Main Service Info */}
      <View style={styles.contentRow}>
        {booking.serviceImage && (
          <Image
            source={booking.serviceImage}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {booking.serviceTitle}
          </Text>
          <Text style={styles.categoryText}>{booking.category}</Text>

          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
            <Text style={styles.timeText}>{booking.date} • {booking.timeSlot}</Text>
          </View>
        </View>
      </View>

      {/* Professional Info (If assigned) */}
      {booking.professionalName && (
        <View style={styles.professionalRow}>
          <View style={styles.proAvatar}>
            <Ionicons name="person" size={12} color={Colors.primary} />
          </View>
          <Text style={styles.proName}>
            Expert: {booking.professionalName}
          </Text>
          {booking.professionalRating && (
            <Text style={styles.proRating}>★ {booking.professionalRating}</Text>
          )}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer: Price & Actions */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <PriceDisplay price={booking.amount} size="medium" />
        </View>

        <View style={styles.actionButtons}>
          {booking.status === 'upcoming' && (
            <>
              {onCancelPress && (
                <TouchableOpacity
                  onPress={() => onCancelPress(booking)}
                  style={styles.outlineBtn}
                >
                  <Text style={styles.outlineBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
              {onTrackPress && (
                <TouchableOpacity
                  onPress={() => onTrackPress(booking)}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Track</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {booking.status === 'completed' && onRebookPress && (
            <TouchableOpacity
              onPress={() => onRebookPress(booking)}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Rebook</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bookingNumberBox: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  bookingNumberText: {
    ...Typography.tinyBold,
    color: Colors.textSecondary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceImage: {
    width: 65,
    height: 65,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 2,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11.5,
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs + 2,
    gap: Spacing.xs,
  },
  proAvatar: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  proRating: {
    ...Typography.captionBold,
    color: Colors.amber,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  outlineBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  outlineBtnText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  primaryBtn: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.xs + 2,
    backgroundColor: Colors.primary,
  },
  primaryBtnText: {
    ...Typography.captionBold,
    color: Colors.textInverse,
  },
});

export default BookingCard;

