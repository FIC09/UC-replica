import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import { AddressCard, StatusBadge, ConfirmationModal } from '../../components';
import { DEMO_USER } from '../../data';
import { Address } from '../../types';

export default function ProfileScreen() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);

  const menuItems = [
    { id: 'wallet', title: 'FIC Wallet & Credits', icon: 'wallet-outline', badge: '₹250' },
    { id: 'payment', title: 'Payment Methods & UPI', icon: 'card-outline' },
    { id: 'notifications', title: 'Notification Settings', icon: 'notifications-outline' },
    { id: 'support', title: 'Help & Customer Support', icon: 'help-circle-outline' },
    { id: 'about', title: 'About Forge India Connect', icon: 'information-circle-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{DEMO_USER.name}</Text>
              <StatusBadge label={`${DEMO_USER.membershipStatus} Member`} variant="upcoming" size="small" />
            </View>
            <Text style={styles.userContact}>{DEMO_USER.phone}</Text>
            <Text style={styles.userContact}>{DEMO_USER.email}</Text>
          </View>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Saved Addresses</Text>
          <TouchableOpacity onPress={() => Alert.alert('Add Address', 'Add new home or office address')}>
            <Text style={styles.addText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressList}>
          {DEMO_USER.savedAddresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              isSelected={selectedAddressId === addr.id}
              onSelect={(a: Address) => setSelectedAddressId(a.id)}
              onEdit={(a: Address) => Alert.alert('Edit Address', `Editing ${a.label}`)}
            />
          ))}
        </View>

        {/* Menu Options */}
        <Text style={styles.sectionHeadingMargin}>Account & Settings</Text>
        <View style={[styles.menuCard, Shadows.card]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => Alert.alert(item.title, `Opening ${item.title}`)}
              style={[
                styles.menuItem,
                idx < menuItems.length - 1 && styles.menuItemBorder,
              ]}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={20} color={Colors.textPrimary} />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>

              <View style={styles.menuRight}>
                {item.badge && (
                  <StatusBadge label={item.badge} variant="sale" size="small" />
                )}
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setLogoutModalVisible(true)}
          style={styles.signOutButton}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of Forge India Connect?"
        confirmText="Sign Out"
        cancelText="Stay"
        confirmVariant="dark"
        iconName="log-out"
        iconColor={Colors.error}
        onConfirm={() => {
          setLogoutModalVisible(false);
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  userContact: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sectionHeadingMargin: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  addressList: {
    paddingHorizontal: Spacing.lg,
  },
  menuCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: Spacing.xs,
  },
  signOutText: {
    ...Typography.bodyBold,
    color: Colors.error,
  },
});

