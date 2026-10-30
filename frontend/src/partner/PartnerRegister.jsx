import React, { useState } from 'react';
import { Building2, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { partnerClient } from './partnerClient';

export function PartnerRegister({ onRegisterSuccess, onNavigate, onExitToMarketplace }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: 'LLP',
    category: 'ac-appliances',
    categoryName: 'AC & Home Appliances',
    city: 'Mumbai',
    coverageZones: 'Bandra West, Khar West, Santacruz West',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    registeredAddress: '',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '',
    ifscCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        coverageZones: formData.coverageZones.split(',').map(s => s.trim())
      };
      const res = await partnerClient.register(payload);
      if (res && res.success) {
        onRegisterSuccess(res.partner, res.staff);
      }
    } catch (err) {
      setError(err.message || 'Registration submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 640,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          color: '#fff',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.8, color: '#e9d5ff', fontWeight: 700 }}>
              Step {step} of 2 • Enterprise Application
            </span>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 0' }}>
              Partner Fleet Registration
            </h1>
          </div>
          <Building2 size={32} color="#ddd6fe" />
        </div>

        {/* Content */}
        <div style={{ padding: 28 }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  1. Company & Operating Details
                </h3>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Home Solutions LLP"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Authorized Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sandeep Patil"
                      value={formData.ownerName}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Legal Business Structure *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    >
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Partnership Firm">Partnership Firm</option>
                      <option value="Proprietorship">Sole Proprietorship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@agency.in"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Primary Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Operating City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Primary Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryName: e.target.value === 'ac-appliances' ? 'AC & Appliance Care' : 'Home Deep Cleaning'
                      })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    >
                      <option value="ac-appliances">AC & Home Appliances</option>
                      <option value="cleaning-pest">Home Cleaning & Pest Control</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Proceed to Tax & Banking <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  2. Statutory Tax & Corporate Settlement Account
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        GSTIN Number
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: (formData.gstNumber || '').length === 15 ? '#10b981' : '#64748b' }}>
                        {(formData.gstNumber || '').length}/15
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 27AABCA1234F1Z8"
                      value={formData.gstNumber}
                      onChange={e => setFormData({ ...formData, gstNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase() })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        Company PAN Card
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: (formData.panNumber || '').length === 10 ? '#10b981' : '#64748b' }}>
                        {(formData.panNumber || '').length}/10
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. AABCA1234F"
                      value={formData.panNumber}
                      onChange={e => setFormData({ ...formData, panNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase() })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Coverage Localities (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Bandra West, Khar West, Santacruz West"
                    value={formData.coverageZones}
                    onChange={e => setFormData({ ...formData, coverageZones: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Corporate Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ICICI Bank Ltd"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Account Number
                    </label>
                    <input
                      type="password"
                      placeholder="Corporate Account Number"
                      value={formData.accountNumber}
                      onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICIC0000002"
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '10px 16px',
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Submitting Application...' : 'Submit Franchise Application'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
            Already registered?{' '}
            <button
              onClick={() => onNavigate('/partner/login')}
              style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign In Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
