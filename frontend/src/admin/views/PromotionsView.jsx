import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Percent,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  X,
  Users,
  MapPin
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function PromotionsView({ onShowToast }) {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // New Promotion Form
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 499,
    maxDiscount: 150,
    validTill: '2026-12-31',
    eligibleUsers: 'All Users',
    eligibleCategories: ['All Services'],
    eligibleCities: ['All Cities'],
    usageLimitTotal: 1000,
    usageLimitPerCustomer: 1,
    description: ''
  });

  // Server-side Validation Tester Sandbox
  const [testCode, setTestCode] = useState('AUTO100');
  const [testOrderValue, setTestOrderValue] = useState(899);
  const [testPriorRedemptions, setTestPriorRedemptions] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, []);

  function loadPromotions() {
    adminClient.getPromotions()
      .then(res => setPromotions(res.promotions || []))
      .catch(() => {});
  }

  function handleCopy(code) {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    if (onShowToast) onShowToast(`Coupon code ${code} copied!`);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.code.trim()) return;

    try {
      const res = await adminClient.createPromotion(formData);
      if (res.success) {
        setPromotions(prev => [res.promotion, ...prev]);
        setShowAddModal(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 499,
          maxDiscount: 150,
          validTill: '2026-12-31',
          eligibleUsers: 'All Users',
          eligibleCategories: ['All Services'],
          eligibleCities: ['All Cities'],
          usageLimitTotal: 1000,
          usageLimitPerCustomer: 1,
          description: ''
        });
        if (onShowToast) onShowToast(`Promotion ${res.promotion.code} created with server rules!`);
      } else {
        if (onShowToast) onShowToast(`Error: ${res.error}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  }

  // Run server-side validation test
  async function handleRunServerValidation(e) {
    e.preventDefault();
    setValidating(true);
    setValidationResult(null);

    try {
      const res = await adminClient.validatePromotion({
        code: testCode,
        orderValue: parseFloat(testOrderValue) || 0,
        priorRedemptionCount: parseInt(testPriorRedemptions, 10) || 0
      });
      setValidationResult(res);
      if (onShowToast) {
        onShowToast(res.valid ? `✓ Valid: Eligible for ₹${res.discount} discount` : `✕ Rejected: ${res.reason}`);
      }
    } catch (err) {
      setValidationResult({ valid: false, reason: err.message });
    } finally {
      setValidating(false);
    }
  }

  const filtered = promotions.filter(p => {
    const matchesSearch = (p.code || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || p.discountType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: '0 0 12px 12px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Promotions, Vouchers & Coupon Rules
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #C7D2FE'
            }}>
              Server-Enforced Redemption Guard
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Configure percentage/flat discounts, minimum order value, category & city eligibility, and per-customer redemption limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#6E42E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      {/* SERVER-SIDE VALIDATION TESTER SANDBOX */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={18} color="#6E42E5" />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Server-Side Eligibility & Redemption Verification Tester
          </h3>
        </div>
        <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
          Simulate customer checkout payloads to test server-side validation against minimum order values, expiration dates, and per-user limits before customer use.
        </p>

        <form onSubmit={handleRunServerValidation} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>TEST CODE</label>
            <input
              type="text"
              value={testCode}
              onChange={e => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g. AUTO100"
              style={{ display: 'block', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 2, width: 140 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>CART VALUE (₹)</label>
            <input
              type="number"
              value={testOrderValue}
              onChange={e => setTestOrderValue(e.target.value)}
              placeholder="899"
              style={{ display: 'block', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 2, width: 120 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>PRIOR REDEMPTIONS</label>
            <input
              type="number"
              value={testPriorRedemptions}
              onChange={e => setTestPriorRedemptions(e.target.value)}
              placeholder="0"
              style={{ display: 'block', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 2, width: 140 }}
            />
          </div>

          <button
            type="submit"
            disabled={validating}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: validating ? 'not-allowed' : 'pointer',
              marginTop: 16
            }}
          >
            {validating ? 'Verifying...' : 'Validate on Server'}
          </button>

          {validationResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 6,
              marginTop: 16,
              backgroundColor: validationResult.valid ? '#ECFDF5' : '#FEF2F2',
              color: validationResult.valid ? '#059669' : '#DC2626',
              fontSize: 12.5,
              fontWeight: 700
            }}>
              {validationResult.valid ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Eligible! Discount of ₹{validationResult.discount} calculated</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Rejected: {validationResult.reason}</span>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Promotions Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>Promo Code</th>
              <th style={{ padding: '12px 18px' }}>Discount & Threshold</th>
              <th style={{ padding: '12px 18px' }}>Eligible Audience & Scope</th>
              <th style={{ padding: '12px 18px' }}>Usage Limits (Total / Per User)</th>
              <th style={{ padding: '12px 18px' }}>Validity Period</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, color: '#6E42E5', fontSize: 14 }}>{p.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(p.code)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      title="Copy Code"
                    >
                      <Copy size={12} color={copiedCode === p.code ? '#10B981' : '#94A3B8'} />
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    {p.description}
                  </div>
                </td>

                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>
                    {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} Flat OFF`}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    Min Order: ₹{p.minOrderValue} {p.maxDiscount > 0 && `(Capped at ₹${p.maxDiscount})`}
                  </div>
                </td>

                <td style={{ padding: '14px 18px' }}>
                  <div style={{ color: '#0F172A', fontWeight: 600 }}>{p.eligibleUsers}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    {Array.isArray(p.eligibleCategories) ? p.eligibleCategories.join(', ') : p.eligibleCategories}
                  </div>
                </td>

                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {p.usedCount} / {p.usageLimitTotal} redeemed
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Max {p.usageLimitPerCustomer} time(s) per customer
                  </div>
                </td>

                <td style={{ padding: '14px 18px', color: '#64748B', fontSize: 12 }}>
                  Valid till: <strong style={{ color: '#0F172A' }}>{p.validTill}</strong>
                </td>

                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: p.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                    color: p.status === 'Active' ? '#059669' : '#DC2626'
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE PROMOTION WITH FULL ELIGIBILITY RULES                       */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 560,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Tag size={18} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Create Promotional Voucher Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Promo Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DIWALI20"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box', fontWeight: 800 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    >
                      <option value="percentage">Percentage (%) Discount</option>
                      <option value="fixed">Fixed (₹) Cash Discount</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Discount Value</label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Min Order (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Max Cap (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Eligible Users</label>
                    <select
                      value={formData.eligibleUsers}
                      onChange={e => setFormData({ ...formData, eligibleUsers: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    >
                      <option value="All Users">All Customers</option>
                      <option value="New Users Only">New Users Only (First Booking)</option>
                      <option value="UC Plus Members Only">UC Plus Members Only</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Max Per Customer</label>
                    <input
                      type="number"
                      value={formData.usageLimitPerCustomer}
                      onChange={e => setFormData({ ...formData, usageLimitPerCustomer: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Description / Terms</label>
                  <input
                    type="text"
                    placeholder="Short campaign description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{
                padding: '14px 24px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
