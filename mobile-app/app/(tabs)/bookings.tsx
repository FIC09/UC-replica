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
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BookingCard, EmptyState } from '../../components';
import { DEMO_BOOKINGS } from '../../data';
import { Booking, BookingStatus } from '../../types';

export default function BookingsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | BookingStatus>('all');

  const filteredBookings = DEMO_BOOKINGS.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const filterTabs: Array<{ key: 'all' | BookingStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleBookingPress = (booking: Booking) => {
    Alert.alert(
      `Booking #${booking.bookingNumber}`,
      `Service: ${booking.serviceTitle}\nSlot: ${booking.date} • ${booking.timeSlot}\nAmount: ₹${booking.amount}`
    );
  };

  const handleTrackPress = (booking: Booking) => {
    Alert.alert(
      'Live Tracking',
      `Expert ${booking.professionalName} is en route.\nArriving in ~25 minutes.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          Track upcoming appointments, service history and receipts.
        </Text>

        <View style={styles.filterRow}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.key)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          <View style={styles.bookingList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={handleBookingPress}
                onTrackPress={handleTrackPress}
                onCancelPress={(b) => Alert.alert('Cancel Booking', `Cancel appointment for ${b.serviceTitle}?`)}
                onRebookPress={(b) => Alert.alert('Rebook', `Schedule another session of ${b.serviceTitle}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Bookings Found"
            description="You don't have any appointments matching this status filter."
            iconName="calendar-outline"
            buttonTitle="Book a Service"
            onButtonPress={() => Alert.alert('Explore Services', 'Browse top services on Home screen')}
          />
        )}
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
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  bookingList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});

