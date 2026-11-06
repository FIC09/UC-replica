import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';

export type TabKey = 'home' | 'explore' | 'bookings' | 'offers' | 'profile';

export interface TabItem {
  key: TabKey;
  label: string;
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconUnfocused: keyof typeof Ionicons.glyphMap;
  badgeCount?: number;
}

interface BottomNavigationProps {
  currentTab: TabKey;
  onTabPress: (tabKey: TabKey) => void;
  style?: ViewStyle;
}

export const TABS: TabItem[] = [
  {
    key: 'home',
    label: 'Home',
    iconFocused: 'home',
    iconUnfocused: 'home-outline',
  },
  {
    key: 'explore',
    label: 'Explore',
    iconFocused: 'compass',
    iconUnfocused: 'compass-outline',
  },
  {
    key: 'bookings',
    label: 'Bookings',
    iconFocused: 'calendar',
    iconUnfocused: 'calendar-outline',
    badgeCount: 1,
  },
  {
    key: 'offers',
    label: 'Offers',
    iconFocused: 'pricetag',
    iconUnfocused: 'pricetag-outline',
  },
  {
    key: 'profile',
    label: 'Profile',
    iconFocused: 'person',
    iconUnfocused: 'person-outline',
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabPress,
  style,
}) => {
  return (
    <View style={[styles.navContainer, Shadows.bottomNav, style]}>
      {TABS.map((tab) => {
        const isFocused = currentTab === tab.key;
        const iconName = isFocused ? tab.iconFocused : tab.iconUnfocused;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
            style={styles.tabButton}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />

              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badgeCount}</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.label,
                isFocused && styles.labelFocused,
              ]}
            >
              {tab.label}
            </Text>

            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrapper: {
    position: 'relative',
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    ...Typography.tinyBold,
    color: Colors.textInverse,
    fontSize: 8.5,
  },
  label: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
});

export default BottomNavigation;

