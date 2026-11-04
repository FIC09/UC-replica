import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { mobileApi } from './src/services/apiClient';

const { width } = Dimensions.get('window');

// Available Cities
const CITIES = [
  { id: 'krishnagiri', name: 'Krishnagiri', state: 'Tamil Nadu' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' }
];

// Service Categories
const CATEGORIES = [
  { id: 'ac-repair', title: 'AC & Appliance', icon: '❄️', color: '#EFF6FF' },
  { id: 'cleaning', title: 'Home Cleaning', icon: '✨', color: '#ECFDF5' },
  { id: 'electrician', title: 'Electrician', icon: '⚡', color: '#FEF3C7' },
  { id: 'plumber', title: 'Plumber', icon: '🔧', color: '#F3E8FF' },
  { id: 'salon-women', title: 'Salon Women', icon: '💅', color: '#FDF2F8' },
  { id: 'men-grooming', title: 'Men\'s Salon', icon: '✂️', color: '#F0FDFA' },
  { id: 'painting', title: 'Painting & Waterproofing', icon: '🎨', color: '#FFF7ED' },
  { id: 'pest-control', title: 'Pest Control', icon: '🛡️', color: '#FEF2F2' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // Auto-check backend connection via shared REST API
  useEffect(() => {
    mobileApi.checkHealth()
      .then(data => {
        if (data.status === 'ok') {
          setBackendStatus('Live MongoDB Connected 🟢');
        } else {
          setBackendStatus('Connected');
        }
      })
      .catch(() => {
        setBackendStatus('Ready (Standby)');
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header with Location & Search */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <TouchableOpacity
            style={styles.locationPill}
            onPress={() => {
              const nextIndex = (CITIES.findIndex(c => c.id === selectedCity.id) + 1) % CITIES.length;
              setSelectedCity(CITIES[nextIndex]);
            }}
          >
            <Text style={styles.locationPin}>📍</Text>
            <View>
              <Text style={styles.locationLabel}>Current Location ▾</Text>
              <Text style={styles.locationCity}>
                {selectedCity.name}, {selectedCity.state}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{backendStatus}</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for AC repair, cleaning, salon..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      {activeTab === 'home' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTag}>VERIFIED PROFESSIONALS</Text>
              <Text style={styles.heroTitle}>Expert Home Services at your Doorstep</Text>
              <Text style={styles.heroSubtitle}>Standardized pricing & 30-day warranty</Text>
            </View>
          </View>

          {/* Quick Categories Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore All Services</Text>
            <Text style={styles.sectionBadge}>8 Categories</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: cat.color }]}
                onPress={() => Alert.alert(cat.title, `Selected ${cat.title} in ${selectedCity.name}.`)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Native Spotlight Purifier */}
          <View style={styles.nativeCard}>
            <View style={styles.nativeBadge}>
              <Text style={styles.nativeBadgeText}>⭐ NATIVE BY UC</Text>
            </View>
            <Text style={styles.nativeTitle}>Native M2 Copper RO</Text>
            <Text style={styles.nativeSubtitle}>
              Needs no filter change for 2 years. 10-stage RO+UV+Copper water purification.
            </Text>
            <View style={styles.nativeFooter}>
              <Text style={styles.nativePrice}>₹13,499</Text>
              <TouchableOpacity
                style={styles.nativeButton}
                onPress={() => Alert.alert('Native Purifier', 'Free VIP installation included within 2 hours.')}
              >
                <Text style={styles.nativeButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* UC Promise Grid */}
          <View style={styles.promiseContainer}>
            <Text style={styles.promiseTitle}>The Urban Company Promise</Text>
            <View style={styles.promiseRow}>
              <View style={styles.promiseItem}>
                <Text style={styles.promiseIcon}>🛡️</Text>
                <Text style={styles.promiseHeading}>Verified Pros</Text>
                <Text style={styles.promiseText}>Police KYC & background checked</Text>
              </View>
              <View style={styles.promiseItem}>
                <Text style={styles.promiseIcon}>⚡</Text>
                <Text style={styles.promiseHeading}>Instant Slot</Text>
                <Text style={styles.promiseText}>Doorstep service in 60 mins</Text>
              </View>
              <View style={styles.promiseItem}>
                <Text style={styles.promiseIcon}>💳</Text>
                <Text style={styles.promiseHeading}>Transparent</Text>
                <Text style={styles.promiseText}>Fixed rates, no hidden charges</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <ScrollView style={styles.content}>
          <View style={styles.bookingsContainer}>
            <Text style={styles.pageTitle}>My Bookings</Text>
            <Text style={styles.pageSubtitle}>Active dispatches & service history</Text>

            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingService}>Deep Home & Bathroom Cleaning</Text>
                <View style={styles.bookingStatusBadge}>
                  <Text style={styles.bookingStatusText}>Confirmed</Text>
                </View>
              </View>
              <Text style={styles.bookingRef}>Ref: UC-849201</Text>
              <Text style={styles.bookingAddress}>📍 {selectedCity.name}, {selectedCity.state}</Text>
              <Text style={styles.bookingTime}>📅 Tomorrow, 10:00 AM - 11:30 AM</Text>
              <View style={styles.bookingDivider} />
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingAmount}>Total: ₹1,299</Text>
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => Alert.alert('Live Tracking', 'Technician assignment confirmed. Live GPS tracking active 30 mins before scheduled slot.')}
                >
                  <Text style={styles.trackButtonText}>Track Partner</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Plus Membership Tab */}
      {activeTab === 'plus' && (
        <ScrollView style={styles.content}>
          <View style={styles.plusContainer}>
            <View style={styles.plusHeader}>
              <Text style={styles.plusBadge}>UC PLUS</Text>
              <Text style={styles.plusTitle}>Save 15% on every booking</Text>
              <Text style={styles.plusSubtitle}>Free delivery & cancellation protection</Text>
            </View>
            <View style={styles.plusPerks}>
              <Text style={styles.plusPerkItem}>✓ 15% flat discount on 500+ services</Text>
              <Text style={styles.plusPerkItem}>✓ Top-rated 4.8★+ verified pros assigned</Text>
              <Text style={styles.plusPerkItem}>✓ Zero cancellation fees anytime</Text>
              <Text style={styles.plusPerkItem}>✓ Free ₹500 voucher on renewal</Text>
            </View>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => Alert.alert('UC Plus', 'Join UC Plus for ₹299 for 12 months.')}
            >
              <Text style={styles.plusButtonText}>Join Plus for ₹299/year</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <ScrollView style={styles.content}>
          <View style={styles.accountContainer}>
            <View style={styles.accountProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>UC</Text>
              </View>
              <View>
                <Text style={styles.accountName}>Urban Customer</Text>
                <Text style={styles.accountPhone}>+91 98765 43210</Text>
              </View>
            </View>

            <View style={styles.accountMenu}>
              {[
                { title: 'Saved Addresses', icon: '📍' },
                { title: 'Payment Methods & UPI', icon: '💳' },
                { title: 'Help & 24x7 Customer Support', icon: '💬' },
                { title: 'Partner / Technician Portal', icon: '💼' },
                { title: 'App Settings & Language', icon: '⚙️' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.menuItem}
                  onPress={() => Alert.alert(item.title, `${item.title} opened.`)}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'bookings', label: 'Bookings', icon: '📋' },
          { id: 'plus', label: 'UC Plus', icon: '👑' },
          { id: 'account', label: 'Account', icon: '👤' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.navTab}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPin: {
    fontSize: 20,
  },
  locationLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  locationCity: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  clearText: {
    fontSize: 14,
    color: '#64748B',
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 20,
    marginTop: 14,
    marginBottom: 18,
  },
  heroContent: {
    gap: 4,
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A78BFA',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: (width - 42) / 2,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  nativeCard: {
    backgroundColor: '#09090B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 20,
  },
  nativeBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nativeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
  },
  nativeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nativeSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  nativeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nativePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nativeButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nativeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promiseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  promiseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  promiseItem: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  promiseIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  promiseHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    textAlign: 'center',
  },
  promiseText: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  navLabelActive: {
    fontWeight: '800',
    color: '#7C3AED',
  },
  // Bookings View
  bookingsContainer: {
    paddingVertical: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingService: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  bookingStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  bookingRef: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#64748B',
    marginBottom: 6,
  },
  bookingAddress: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 3,
  },
  bookingTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 12,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trackButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Plus View
  plusContainer: {
    paddingVertical: 16,
  },
  plusHeader: {
    backgroundColor: '#FDF4FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0ABFC',
    marginBottom: 16,
  },
  plusBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A21CAF',
    marginBottom: 4,
  },
  plusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#701A75',
    marginBottom: 4,
  },
  plusSubtitle: {
    fontSize: 12,
    color: '#86198F',
  },
  plusPerks: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 20,
  },
  plusPerkItem: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  plusButton: {
    backgroundColor: '#701A75',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  plusButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Account View
  accountContainer: {
    paddingVertical: 16,
  },
  accountProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  accountPhone: {
    fontSize: 12,
    color: '#64748B',
  },
  accountMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuArrow: {
    fontSize: 18,
    color: '#94A3B8',
  },
});

