import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Tag, 
  Plus, 
  Minus, 
  Check, 
  Percent, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Phone
} from 'lucide-react';
import { MUMBAI_LOCALITIES, CITY_LOCALITIES, COUPONS } from '../data/servicesData';
import { PaymentGatewayModal } from './PaymentGatewayModal';

export function UrbanCheckoutPage({
  onBackHome,
  cart = {},
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  selectedCity = 'Mumbai',
  selectedLocality = 'Bandra West',
  user,
  onOpenAuth,
  savedAddresses = [],
  onConfirmOrder,
  showToast = () => {},
  hasUCPlus = false,
  onToggleUCPlus
}) {
  const [avoidCalling, setAvoidCalling] = useState(true);
  const [showBreakup, setShowBreakup] = useState(false);
  const currentUser = user;

  // Address selection state
  const cityKey = Object.keys(CITY_LOCALITIES).find(
    k => k.toLowerCase() === (selectedCity || '').trim().toLowerCase()
  );
  const currentLocalities = (cityKey && CITY_LOCALITIES[cityKey]) || MUMBAI_LOCALITIES;
  const matchingSaved = savedAddresses.find(a => a.isDefault && a.city?.toLowerCase() === (selectedCity || '').toLowerCase())
    || savedAddresses.find(a => a.city?.toLowerCase() === (selectedCity || '').toLowerCase())
    || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState(matchingSaved ? matchingSaved.id : 'custom');
  const [flatNumber, setFlatNumber] = useState(matchingSaved?.flat || 'Flat 402, Sea Green Heights');
  const [locality, setLocality] = useState(matchingSaved?.locality || selectedLocality || currentLocalities[0] || 'Bandra West');

  // Slot selection state
  const [selectedDate, setSelectedDate] = useState('Today (21 Oct)');
  const [selectedTime, setSelectedTime] = useState('02:00 PM - 03:00 PM');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'AUTO100', discountAmount: 100 });
  const [couponError, setCouponError] = useState('');

  const cartItems = Object.values(cart || {}).filter(item => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return q > 0;
  });
  const itemsCount = cartItems.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + q;
  }, 0);

  // Calculate pricing
  const itemsSubtotal = cartItems.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + ((item.price || 0) * q);
  }, 0);
  const originalSubtotal = cartItems.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    const orig = item.originalPrice || Math.round((item.price || 0) * 1.15);
    return sum + (orig * q);
  }, 0);

  const itemSavings = Math.max(0, originalSubtotal - itemsSubtotal);
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const ucPlusDiscount = hasUCPlus ? Math.min(150, Math.round(itemsSubtotal * 0.1)) : 0;
  const totalSavings = itemSavings + couponDiscount + ucPlusDiscount;

  const hygieneFee = itemsSubtotal > 0 ? (hasUCPlus ? 0 : 39) : 0;
  const taxesFee = itemsSubtotal > 0 ? Math.round(itemsSubtotal * 0.05) : 0;
  const finalPayable = Math.max(0, itemsSubtotal - couponDiscount - ucPlusDiscount + hygieneFee + taxesFee);

  // Determine Category Name for right column header (e.g. AC, Electrician, Plumber)
  const categoryName = React.useMemo(() => {
    if (cartItems.length === 0) return 'Services';
    const firstSub = cartItems[0].subcategory;
    if (firstSub) return firstSub;
    const firstCat = cartItems[0].category;
    if (firstCat === 'ac-repair' || firstCat === 'ac-appliances') return 'AC';
    if (firstCat === 'quick-repairs') return 'Quick Repairs';
    if (firstCat === 'cleaning-pest' || firstCat === 'cleaning-home') return 'Cleaning';
    return 'Services';
  }, [cartItems]);

  function handleApplyCoupon(code) {
    setCouponError('');
    const target = (code || couponCode).trim().toUpperCase();
    const found = COUPONS.find(c => c.code === target);
    if (!found) {
      if (target === 'AUTO100' || target === 'SAVE100') {
        setAppliedCoupon({ code: target, discountAmount: 100 });
        showToast('🎉 Applied coupon: Saved ₹100!');
        return;
      }
      setCouponError('Invalid coupon code. Try MUMBAI100 or SUPERUC');
      return;
    }
    if (itemsSubtotal < found.minOrder) {
      setCouponError(`Min order of ₹${found.minOrder} required for ${found.code}`);
      return;
    }
    setAppliedCoupon(found);
    showToast(`🎉 Applied ${found.code}: Saved ₹${found.discountAmount}!`);
  }

  function handleBookServiceClick() {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      showToast('🔐 Please login or create an account with email to complete your booking');
      return;
    }
    if (cartItems.length === 0) {
      showToast('⚠️ Your cart is empty. Add services first.');
      return;
    }
    setIsPaymentGatewayOpen(true);
  }

  function handleGatewayPaymentSuccess(paymentDetails) {
    setIsPaymentGatewayOpen(false);

    const bookingId = `UC-${Date.now().toString().slice(-6)}`;
    const fullAddress = selectedAddressId === 'custom' 
      ? `${flatNumber}, ${locality}, ${selectedCity}`
      : (matchingSaved ? `${matchingSaved.flat}, ${matchingSaved.locality}, ${matchingSaved.city} - ${matchingSaved.pincode}` : `${flatNumber}, ${locality}, ${selectedCity}`);

    const bookingPayload = {
      id: bookingId,
      items: cartItems.map(i => ({
        id: i.id,
        name: i.title,
        price: i.price,
        qty: i.qty,
        image: i.image
      })),
      totalAmount: finalPayable,
      address: fullAddress,
      slot: `${selectedDate}, ${selectedTime}`,
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      paymentMethod: paymentDetails?.methodLabel || paymentMethod.toUpperCase(),
      transactionId: paymentDetails?.transactionId || `UC_TXN_${Date.now()}`,
      paidAt: paymentDetails?.paidAt,
      notes: avoidCalling ? 'Avoid calling before reaching location' : '',
      avoidCalling: avoidCalling,
      savings: totalSavings
    };

    if (onConfirmOrder) {
      onConfirmOrder(bookingPayload);
    }
  }

  return (
    <div className="urban-checkout-page-root" style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#111827',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER (EXACT MATCH TO SCREENSHOT)                */}
      {/* ======================================================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F1F3F5',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo & Checkout title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              title="Return to home"
              style={{
                background: '#F8F9FA',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#374151',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            >
              <ArrowLeft size={17} />
            </button>

            {/* UC Square Badge */}
            <div style={{
              width: 32,
              height: 32,
              backgroundColor: '#000000',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 14.5,
              letterSpacing: -0.5,
              userSelect: 'none'
            }}>
              UC
            </div>

            {/* Checkout Title */}
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1
            }}>
              Checkout
            </h1>
          </div>

          {/* Secure Safe Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
            color: '#059669',
            background: '#ECFDF5',
            padding: '5px 10px',
            borderRadius: 999,
            border: '1px solid #A7F3D0'
          }}>
            <ShieldCheck size={14} />
            <span>100% Safe &amp; Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN CHECKOUT BODY (2-COLUMN MATCHING SCREENSHOT)     */}
      {/* ======================================================== */}
      <main style={{
        flex: 1,
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
        padding: '28px 24px 60px 24px',
        boxSizing: 'border-box'
      }}>
        {cartItems.length === 0 || itemsSubtotal <= 0 ? (
          /* Empty Cart State */
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            maxWidth: 420,
            margin: '0 auto'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <ShoppingBag size={32} color="#9CA3AF" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Your cart is empty
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>
              Explore our wide range of verified home and repair services to add items.
            </p>
            <button
              type="button"
              onClick={onBackHome}
              style={{
                background: '#5E3BEE',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 36,
            alignItems: 'start'
          }}>
            {/* ==================================================== */}
            {/* LEFT COLUMN: SAVINGS PILL, ACCOUNT & ADDRESS         */}
            {/* ==================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Savings Pill matching screenshot */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
                userSelect: 'none'
              }}>
                <div style={{
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A'
                }}>
                  <Tag size={17} fill="#16A34A" color="#16A34A" />
                </div>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  Saving ₹{totalSavings} on this order
                </span>
              </div>

              {/* Account Card matching screenshot */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h2 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.2px'
                }}>
                  Account
                </h2>

                {!currentUser ? (
                  /* Guest / Logged Out state matching screenshot */
                  <div>
                    <p style={{
                      fontSize: 13.5,
                      color: '#6B7280',
                      margin: '0 0 18px 0',
                      lineHeight: 1.4
                    }}>
                      To book the service, please login or sign up
                    </p>

                    <button
                      type="button"
                      onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        backgroundColor: '#5E3BEE',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        boxShadow: '0 2px 8px rgba(94, 59, 238, 0.25)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4F2CE0'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#5E3BEE'}
                    >
                      Login
                    </button>

                    <div style={{
                      marginTop: 14,
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#6B7280'
                    }}>
                      Don’t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5E3BEE',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Create Account / Sign Up
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Logged In state */
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16
                      }}>
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
                            {currentUser.name}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#059669',
                            background: '#ECFDF5',
                            padding: '1px 6px',
                            borderRadius: 4
                          }}>
                            ✓ Verified
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                          {currentUser.email || 'rahul.sharma@urbancompany.com'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6E42E5',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Address Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={17} color="#4B5563" />
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>
                      Delivery Address
                    </h2>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 999 }}>
                    {selectedCity}
                  </span>
                </div>

                <div style={{
                  padding: '12px 14px',
                  background: '#F9FAFB',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}>
                  <input
                    type="radio"
                    name="checkoutAddress"
                    checked={true}
                    readOnly
                    style={{ marginTop: 3, accentColor: '#5E3BEE' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                      Home / Primary
                    </div>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                      {flatNumber}, {locality}, {selectedCity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slot Selection Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Clock size={17} color="#4B5563" />
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>
                    Select Service Slot
                  </h2>
                </div>

                {/* Date options */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {['Today (21 Oct)', 'Tomorrow (22 Oct)', 'Thu (23 Oct)'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 8,
                        border: selectedDate === d ? '1.5px solid #5E3BEE' : '1px solid #E5E7EB',
                        backgroundColor: selectedDate === d ? '#F5F3FF' : '#FFFFFF',
                        color: selectedDate === d ? '#5E3BEE' : '#374151',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Time slot chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {['10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM', '06:30 PM - 07:30 PM'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: selectedTime === t ? '1.5px solid #5E3BEE' : '1px solid #E5E7EB',
                        backgroundColor: selectedTime === t ? '#F5F3FF' : '#FFFFFF',
                        color: selectedTime === t ? '#5E3BEE' : '#4B5563',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CreditCard size={17} color="#4B5563" />
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>
                    Payment Mode
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'gpay', label: 'Google Pay (GPay UPI)', badge: 'Recommended & Fastest' },
                    { id: 'phonepe', label: 'PhonePe UPI', badge: 'Instant' },
                    { id: 'paytm', label: 'Paytm (Wallet & UPI)', badge: null },
                    { id: 'card', label: 'Credit / Debit Card (Visa, MasterCard, RuPay)', badge: null },
                    { id: 'wallet', label: 'Digital Wallets (Amazon Pay, Mobikwik)', badge: null },
                    { id: 'cod', label: 'Cash on Delivery (Pay After Service)', badge: 'Cash or Online' }
                  ].map(m => (
                    <label
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: paymentMethod === m.id ? '1.5px solid #5E3BEE' : '1px solid #E5E7EB',
                        background: paymentMethod === m.id ? '#FAF5FF' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="checkoutPayment"
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id)}
                          style={{ accentColor: '#5E3BEE' }}
                        />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                          {m.label}
                        </span>
                      </div>
                      {m.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 6 }}>
                          {m.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN: ITEMS CARD, COUPONS & PAYMENT SUMMARY  */}
            {/* ==================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 1. Category & Cart Items Card matching screenshot */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                marginBottom: 18,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {/* Category Title matching screenshot header (e.g. AC) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '-0.3px'
                  }}>
                    {categoryName}
                  </h3>
                  {onClearCart && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      style={{
                        background: '#FEE2E2',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: 6
                      }}
                      title="Remove all items from cart"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {/* Items rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {cartItems.map((item) => {
                    const originalItemPrice = item.originalPrice || Math.round(item.price * 1.15);
                    return (
                      <div 
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        {/* Service Title */}
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111827',
                          lineHeight: 1.35,
                          flex: 1
                        }}>
                          {item.title}
                        </div>

                        {/* Quantity Stepper matching screenshot's lavender pill */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          borderRadius: 8,
                          padding: '4px 10px',
                          userSelect: 'none'
                        }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#6E42E5',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span style={{
                            fontSize: 13.5,
                            fontWeight: 800,
                            color: '#6E42E5',
                            minWidth: 12,
                            textAlign: 'center'
                          }}>
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#6E42E5',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Price Column matching screenshot */}
                        <div style={{
                          textAlign: 'right',
                          minWidth: 70
                        }}>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#111827'
                          }}>
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            textDecoration: 'line-through',
                            marginTop: 1
                          }}>
                            ₹{(originalItemPrice * item.qty).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dotted divider matching screenshot */}
                <div style={{
                  borderBottom: '1px dotted #E5E7EB',
                  margin: '18px 0 16px 0'
                }} />

                {/* Checkbox matching screenshot */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      setAvoidCalling(!avoidCalling);
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: avoidCalling ? '#111827' : '#FFFFFF',
                      border: avoidCalling ? 'none' : '1.5px solid #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                  >
                    {avoidCalling && <Check size={13} strokeWidth={3} color="#FFFFFF" />}
                  </div>
                  <span style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#1F2937'
                  }}>
                    Avoid calling before reaching the location
                  </span>
                </label>
              </div>

              {/* 2. Coupons and Offers Card matching screenshot */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '16px 20px',
                marginBottom: 18,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Green Circular % Icon matching screenshot */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Percent size={15} strokeWidth={2.8} />
                  </div>

                  {/* Texts */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: '#111827'
                    }}>
                      Coupons and offers
                    </div>
                    <div style={{
                      fontSize: 12.5,
                      color: appliedCoupon ? '#059669' : '#6B7280',
                      fontWeight: appliedCoupon ? 700 : 500,
                      marginTop: 2
                    }}>
                      {appliedCoupon 
                        ? `Applied "${appliedCoupon.code}" (Saved ₹${appliedCoupon.discountAmount})`
                        : (currentUser ? 'Choose from available savings below' : 'Login/Sign up to view offers')
                      }
                    </div>
                  </div>

                  {/* Quick coupon toggle */}
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        showToast('Removed coupon');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('MUMBAI100')}
                      style={{
                        background: '#F5F3FF',
                        border: '1px solid #DDD6FE',
                        borderRadius: 6,
                        color: '#6E42E5',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Payment Summary Card matching screenshot */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: '24px 26px',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 16px 0',
                  letterSpacing: '-0.2px'
                }}>
                  Payment summary
                </h3>

                {/* Item total row matching screenshot */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14
                }}>
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    Item total
                  </span>
                  <div>
                    <span style={{
                      fontSize: 13,
                      color: '#9CA3AF',
                      textDecoration: 'line-through',
                      marginRight: 8
                    }}>
                      ₹{originalSubtotal.toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#111827'
                    }}>
                      ₹{itemsSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Optional Expandable Breakup */}
                {showBreakup && (
                  <div style={{
                    padding: '10px 0',
                    borderTop: '1px dashed #E5E7EB',
                    borderBottom: '1px dashed #E5E7EB',
                    margin: '10px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: 13,
                    color: '#4B5563'
                  }}>
                    {itemSavings > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                        <span>Item catalog discount</span>
                        <span style={{ fontWeight: 700 }}>-₹{itemSavings}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                        <span>Coupon discount ({appliedCoupon?.code})</span>
                        <span style={{ fontWeight: 700 }}>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hygiene &amp; Safety fee</span>
                      <span>{hygieneFee === 0 ? 'FREE' : `₹${hygieneFee}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Taxes and government levies</span>
                      <span>₹{taxesFee}</span>
                    </div>
                  </div>
                )}

                {/* Bottom Total & "View breakup" matching screenshot */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingTop: showBreakup ? 6 : 14,
                  borderTop: showBreakup ? 'none' : '1px solid #F1F3F5'
                }}>
                  <div>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#111827'
                    }}>
                      Amount to pay
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBreakup(!showBreakup)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#111827',
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <span>View breakup</span>
                      {showBreakup ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <div style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#111827',
                    letterSpacing: '-0.3px'
                  }}>
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="button"
                onClick={handleBookServiceClick}
                style={{
                  width: '100%',
                  padding: '15px 0',
                  backgroundColor: '#5E3BEE',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(94, 59, 238, 0.35)',
                  transition: 'background-color 0.15s, transform 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#4F2CE0';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#5E3BEE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Book Service • ₹{finalPayable.toLocaleString('en-IN')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 100% Safe & Secure Payment Gateway Modal (GPay, PhonePe, Paytm, COD, Card, Wallets) */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        amount={finalPayable}
        initialMethod={paymentMethod}
        user={currentUser}
        slot={`${selectedDate}, ${selectedTime}`}
        address={selectedAddressId === 'custom' ? `${flatNumber}, ${locality}, ${selectedCity}` : (matchingSaved ? `${matchingSaved.flat}, ${matchingSaved.locality}` : `${flatNumber}, ${locality}`)}
        items={cartItems}
        onPaymentSuccess={handleGatewayPaymentSuccess}
      />
    </div>
  );
}
export default UrbanCheckoutPage;
