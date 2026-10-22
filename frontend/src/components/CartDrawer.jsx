import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Crown, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { COUPONS } from '../data/servicesData';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  hasUCPlus,
  onToggleUCPlus
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const cartItems = Object.values(cart);
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Discounts
  const ucPlusDiscount = hasUCPlus ? Math.min(150, Math.round(itemsSubtotal * 0.1)) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Fees
  const hygieneFee = itemsSubtotal > 0 ? (hasUCPlus ? 0 : 39) : 0;
  const taxesFee = itemsSubtotal > 0 ? Math.round(itemsSubtotal * 0.05) : 0;

  // Final Total
  const finalTotal = Math.max(0, itemsSubtotal - ucPlusDiscount - couponDiscount + hygieneFee + taxesFee);

  function handleApplyCoupon(code) {
    setCouponError('');
    const targetCode = (code || couponCode).trim().toUpperCase();
    const found = COUPONS.find(c => c.code === targetCode);

    if (!found) {
      setCouponError('Invalid coupon code. Try MUMBAI100 or SUPERUC');
      return;
    }

    if (itemsSubtotal < found.minOrder) {
      setCouponError(`Min. order of ₹${found.minOrder} required for this coupon`);
      return;
    }

    setAppliedCoupon(found);
    setCouponCode(found.code);
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  }

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="#6E42E5" />
            <h3 className="cart-header-title">
              My Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)} items)
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all items from your cart?')) {
                    onClearCart();
                  }
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Clear entire cart"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              style={{ color: '#6B7280', padding: 4 }}
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#F4F0FF',
                color: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: 13, marginBottom: 20 }}>
                Explore Mumbai's top-rated home salon, AC repair & cleaning services.
              </p>
              <button
                type="button"
                className="add-service-btn"
                onClick={onClose}
                style={{ padding: '10px 24px' }}
              >
                Explore Services
              </button>
            </div>
          ) : (
            <>
              {/* Items List (READ, UPDATE qty, DELETE item) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className="cart-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div className="cart-item-price">₹{item.price * item.qty}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Quantity Stepper (UPDATE) */}
                      <div className="qty-counter-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.qty - 1)}
                          title="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.qty}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.qty + 1)}
                          title="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Individual Delete Button (DELETE) */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          color: '#9CA3AF',
                          cursor: 'pointer'
                        }}
                        title="Remove item from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* UC Plus Membership Upsell Box */}
              <div className="cart-plus-upsell-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#EA580C',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Crown size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#7C2D12' }}>
                      {hasUCPlus ? 'UC Plus Active' : 'Join UC Plus & Save ₹150'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9A3412' }}>
                      {hasUCPlus ? '10% discount applied + ₹0 hygiene fee' : 'Save on this order + top-rated experts'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleUCPlus}
                  style={{
                    background: hasUCPlus ? '#7C2D12' : '#EA580C',
                    color: '#fff',
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {hasUCPlus ? 'Active' : '+ Add ₹299'}
                </button>
              </div>

              {/* Coupons Section */}
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Tag size={15} color="#6E42E5" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Coupons & Offers</span>
                </div>

                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '8px 12px',
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#065F46' }}>
                      🎉 '{appliedCoupon.code}' applied (-₹{appliedCoupon.discountAmount})
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ fontSize: 12, color: '#DC2626', fontWeight: 700 }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        className="coupon-input"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button
                        type="button"
                        className="apply-coupon-btn"
                        onClick={() => handleApplyCoupon()}
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 6, fontWeight: 600 }}>
                        {couponError}
                      </div>
                    )}

                    {/* Quick suggestion pills */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {COUPONS.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 8px',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            borderRadius: 6,
                            border: '1px dashed #93C5FD'
                          }}
                        >
                          {c.code} (-₹{c.discountAmount})
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className="bill-breakdown-card">
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                  Payment Summary
                </div>
                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{itemsSubtotal}</span>
                </div>
                {hasUCPlus && (
                  <div className="bill-row savings">
                    <span>UC Plus 10% Discount</span>
                    <span>-₹{ucPlusDiscount}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="bill-row savings">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="bill-row">
                  <span>Safety, PPE & Hygiene Fee</span>
                  <span>{hasUCPlus ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${hygieneFee}`}</span>
                </div>
                <div className="bill-row">
                  <span>Taxes & Platform Charges</span>
                  <span>₹{taxesFee}</span>
                </div>
                <div className="bill-row total">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Safety guarantee badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 12, fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>Zero cancellation fee anytime before arrival</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <button
              type="button"
              className="proceed-checkout-btn"
              onClick={onProceedToCheckout}
            >
              <div>
                <span style={{ fontSize: 12, opacity: 0.9, display: 'block', fontWeight: 600 }}>
                  Total to pay
                </span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>₹{finalTotal}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Select Slot & Address</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
