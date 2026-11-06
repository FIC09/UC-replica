import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface CustomHeaderProps {
  location?: string;
  subLocation?: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
  style?: ViewStyle;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  location = 'Chennai Central',
  subLocation = 'Tamil Nadu',
  onLocationPress,
  onNotificationPress,
  onProfilePress,
  notificationCount = 2,
  style,
}) => {
  return (
    <View style={[styles.headerContainer, style]}>
      {/* Brand & Location Selector */}
      <View style={styles.leftCol}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>FIC</Text>
          </View>
          <Text style={styles.brandName}>Forge India Connect</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLocationPress}
          style={styles.locationButton}
        >
          <Ionicons name="location-sharp" size={15} color={Colors.primary} />
          <Text style={styles.locationTitle} numberOfLines={1}>
            {location}
          </Text>
          <Text style={styles.subLocationText}>• {subLocation}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Right Actions: Notification & Profile */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          {notificationCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onProfilePress}
          style={styles.avatarButton}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>S</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  leftCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
    gap: Spacing.xs,
  },
  logoBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs,
  },
  logoBadgeText: {
    ...Typography.tinyBold,
    color: Colors.textInverse,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandName: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subLocationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    ...Typography.tinyBold,
    color: Colors.textInverse,
    fontSize: 9,
  },
  avatarButton: {
    padding: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontWeight: '800',
  },
});

export default CustomHeader;

