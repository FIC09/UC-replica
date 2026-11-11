import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';

export default function CartViewModal({
  visible,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) {
  const totalCount = cartItems.reduce((acc, it) => acc + (it.qty || 1), 0);
  const itemsSubtotal = cartItems.reduce((acc, it) => acc + (it.price || 0) * (it.qty || 1), 0);
  const itemsOrigSubtotal = cartItems.reduce(
    (acc, it) => acc + (it.originalPrice || Math.round((it.price || 0) * 1.3)) * (it.qty || 1),
    0
  );
  const totalDiscount = Math.max(0, itemsOrigSubtotal - itemsSubtotal);
  const convenienceFee = itemsSubtotal > 0 ? 49 : 0;
  const finalPayable = itemsSubtotal + convenienceFee;

  const handleClearWithConfirm = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Empty your cart?')) {
        if (onClearCart) onClearCart();
      } else if (typeof window === 'undefined') {
        if (onClearCart) onClearCart();
      }
    } else {
      Alert.alert('Empty Cart', 'Are you sure you want to remove all items from your cart?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Empty Cart', style: 'destructive', onPress: onClearCart }
      ]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* 1. TOP HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>My Cart</Text>
              {totalCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{totalCount} {totalCount === 1 ? 'service' : 'services'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSub}>Krishnagiri • Rayakottai Road</Text>
          </View>

          {cartItems.length > 0 && (
            <TouchableOpacity
              style={styles.clearCartBtn}
              activeOpacity={0.7}
              onPress={handleClearWithConfirm}
            >
              <Text style={styles.clearCartText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. BODY CONTENT */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyHeadline}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Looks like you haven't added any services yet. Explore our top-rated doorstep home and beauty services!
            </Text>
            <TouchableOpacity
              style={styles.emptyExploreBtn}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={styles.emptyExploreBtnText}>Explore Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Savings Banner */}
              {totalDiscount > 0 && (
                <View style={styles.savingsBanner}>
                  <Text style={styles.savingsBannerIcon}>🎉</Text>
                  <Text style={styles.savingsBannerText}>
                    You are saving <Text style={{ fontWeight: '800' }}>₹{totalDiscount.toLocaleString('en-IN')}</Text> on this booking!
                  </Text>
                </View>
              )}

              {/* Specialist Dispatch Info Banner */}
              <View style={styles.dispatchBanner}>
                <Text style={styles.dispatchBannerIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dispatchBannerTitle}>Doorstep Specialist Dispatch</Text>
                  <Text style={styles.dispatchBannerSub}>
                    Certified doorstep specialist team available for fast service in Krishnagiri.
                  </Text>
                </View>
              </View>

              {/* Items in Cart Section */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Products & Services in Cart ({totalCount})</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
                  <Text style={styles.addMoreLink}>+ Add More</Text>
                </TouchableOpacity>
              </View>

              {cartItems.map((item, idx) => {
                const itemPrice = (item.price || 0) * (item.qty || 1);
                const itemOrigPrice = (item.originalPrice || Math.round((item.price || 0) * 1.3)) * (item.qty || 1);

                return (
                  <View key={`cart-item-${item.id || idx}`} style={styles.cartCard}>
                    <View style={styles.cartCardTopRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.cartItemTitle}>{item.title}</Text>
                        {item.category && (
                          <View style={styles.categoryPill}>
                            <Text style={styles.categoryPillText}>{item.category}</Text>
                          </View>
                        )}
                        {item.duration && (
                          <Text style={styles.cartItemDuration}>⏱ {item.duration}</Text>
                        )}
                      </View>

                      {/* Remove Button */}
                      <TouchableOpacity
                        style={styles.removeItemBtn}
                        activeOpacity={0.7}
                        onPress={() => onRemoveItem && onRemoveItem(item.id)}
                      >
                        <Text style={styles.removeItemIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cartCardDivider} />

                    <View style={styles.cartCardBottomRow}>
                      {/* Price Section */}
                      <View style={styles.cartCardPriceCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                          <Text style={styles.cartItemPrice}>₹{itemPrice.toLocaleString('en-IN')}</Text>
                          {itemOrigPrice > itemPrice && (
                            <Text style={styles.cartItemOrigPrice}>₹{itemOrigPrice.toLocaleString('en-IN')}</Text>
                          )}
                        </View>
                        {item.qty > 1 && (
                          <Text style={styles.unitPriceText}>
                            (₹{item.price} × {item.qty})
                          </Text>
                        )}
                      </View>

                      {/* Quantity Stepper */}
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.7}
                          onPress={() => onUpdateQty && onUpdateQty(item.id, -1)}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.stepperCount}>{item.qty || 1}</Text>

                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.7}
                          onPress={() => onUpdateQty && onUpdateQty(item.id, 1)}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Add More Services Button */}
              <TouchableOpacity
                style={styles.addMoreBtn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.addMoreBtnIcon}>➕</Text>
                <Text style={styles.addMoreBtnText}>Add More Services to Cart</Text>
              </TouchableOpacity>

              {/* Coupons Info Card */}
              <View style={styles.couponCard}>
                <Text style={styles.couponIcon}>🎟️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.couponHeadline}>Coupons & Offers Available</Text>
                  <Text style={styles.couponSub}>
                    Apply promo codes like <Text style={{ fontWeight: '700' }}>FIRST50</Text> or <Text style={{ fontWeight: '700' }}>UCPREMIUM</Text> in checkout to get up to ₹150 OFF.
                  </Text>
                </View>
              </View>

              {/* Bill Details Summary Card */}
              <View style={styles.billCard}>
                <Text style={styles.billHeadline}>Bill Details</Text>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total ({totalCount} {totalCount === 1 ? 'service' : 'services'})</Text>
                  <Text style={styles.billVal}>₹{itemsSubtotal.toLocaleString('en-IN')}</Text>
                </View>

                {totalDiscount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={[styles.billLabel, { color: '#16A34A' }]}>Item Discount</Text>
                    <Text style={[styles.billVal, { color: '#16A34A', fontWeight: '700' }]}>
                      − ₹{totalDiscount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                <View style={styles.billRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.billLabel}>Taxes & Convenience Fee</Text>
                    <Text style={styles.feeInfoIcon}>ⓘ</Text>
                  </View>
                  <Text style={styles.billVal}>₹{convenienceFee}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Sterile Safety Packaging</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={[styles.billVal, { textDecorationLine: 'line-through', color: '#94A3B8' }]}>₹39</Text>
                    <Text style={[styles.billVal, { color: '#16A34A', fontWeight: '700' }]}>FREE</Text>
                  </View>
                </View>

                <View style={styles.billDivider} />

                <View style={styles.billRow}>
                  <Text style={styles.billTotalLabel}>Grand Total</Text>
                  <Text style={styles.billTotalVal}>₹{finalPayable.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              {/* Urban Company Assurance Card */}
              <View style={styles.assuranceCard}>
                <Text style={styles.assuranceIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assuranceTitle}>Urban Company 100% Assurance</Text>
                  <Text style={styles.assurancePoint}>• 30-Day service warranty & free rework guarantee</Text>
                  <Text style={styles.assurancePoint}>• Background-verified specialist with safety kit</Text>
                  <Text style={styles.assurancePoint}>• Free cancellation up to 2 hours before chosen slot</Text>
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>

            {/* 3. STICKY BOTTOM ACTION BAR */}
            <View style={styles.bottomBar}>
              <View style={styles.bottomPriceCol}>
                <Text style={styles.bottomPayableLabel}>TO PAY</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={styles.bottomPayablePrice}>₹{finalPayable.toLocaleString('en-IN')}</Text>
                  {itemsOrigSubtotal > itemsSubtotal && (
                    <Text style={styles.bottomOrigPrice}>₹{(itemsOrigSubtotal + convenienceFee).toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                activeOpacity={0.88}
                onPress={onProceedToCheckout}
              >
                <Text style={styles.checkoutBtnText}>Proceed to Checkout  ›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBackText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  clearCartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  clearCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  savingsBannerIcon: {
    fontSize: 16,
  },
  savingsBannerText: {
    fontSize: 12.5,
    color: '#166534',
    flex: 1,
  },
  dispatchBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 10,
  },
  dispatchBannerIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  dispatchBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  dispatchBannerSub: {
    fontSize: 11.5,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  addMoreLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cartCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cartItemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cartItemDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  removeItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeItemIcon: {
    fontSize: 14,
  },
  cartCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cartCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartCardPriceCol: {},
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cartItemOrigPrice: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  unitPriceText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 34,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepperCount: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  addMoreBtnIcon: {
    fontSize: 13,
  },
  addMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
  },
  couponIcon: {
    fontSize: 22,
  },
  couponHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  couponSub: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billHeadline: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: '#475569',
  },
  feeInfoIcon: {
    fontSize: 11,
    color: '#94A3B8',
  },
  billVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  billTotalLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  billTotalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  assuranceCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  assuranceIcon: {
    fontSize: 24,
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  assurancePoint: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPriceCol: {},
  bottomPayableLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bottomPayablePrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  bottomOrigPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  checkoutBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 38,
  },
  emptyHeadline: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  emptyExploreBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  emptyExploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});


