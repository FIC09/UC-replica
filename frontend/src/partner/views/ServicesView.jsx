import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, ShieldCheck, Tag, DollarSign, ArrowUpRight, Plus, Pause, Play, AlertCircle, X } from 'lucide-react';
import { partnerClient } from '../partnerClient';
import { usePlatformSettings } from '../../utils/usePlatformSettings';

export function ServicesView({ showToast }) {
  const { agencyTakeRate } = usePlatformSettings();
  const effectiveAgencyTake = agencyTakeRate ?? 14;
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [platformApprovedCats, setPlatformApprovedCats] = useState([]);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [participationStatus, setParticipationStatus] = useState('Active');
  const [categoryRequests, setCategoryRequests] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ categoryName: '', justification: '', initialFleetSize: 2 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const res = await partnerClient.getServices();
      if (res && res.success) {
        setCategories(res.serviceCategories || []);
        setPlatformApprovedCats(res.platformApprovedCategories || []);
        setServices(res.services || []);
        setParticipationStatus(res.businessParticipationStatus || 'Active');
        setCategoryRequests(res.categoryRequests || []);
      }
    } catch (err) {
      showToast?.('Error loading services catalogue: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleParticipation() {
    const nextStatus = participationStatus === 'Active' ? 'Paused' : 'Active';
    const reason = nextStatus === 'Paused' ? 'Operational maintenance and fleet reorganization' : null;
    try {
      const res = await partnerClient.toggleServiceParticipation({ status: nextStatus, reason });
      if (res && res.success) {
        setParticipationStatus(res.participationStatus);
        showToast?.(`Business participation status updated to: ${res.participationStatus}`);
      }
    } catch (err) {
      showToast?.('Failed to toggle participation: ' + err.message);
    }
  }

  async function handleRequestCategory(e) {
    e.preventDefault();
    if (!catForm.categoryName || !catForm.justification) {
      showToast?.('Category name and justification are mandatory.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await partnerClient.requestServiceCategory(catForm);
      if (res && res.success) {
        showToast?.('Category expansion request submitted for platform compliance review.');
        setIsCategoryModalOpen(false);
        setCatForm({ categoryName: '', justification: '', initialFleetSize: 2 });
        loadServices();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit category request');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = activeCategory === 'ALL'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Authorised Service Catalogue & Rate Cards
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Verified platform services, structured package bundles, and contractor rate card payouts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleToggleParticipation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: participationStatus === 'Active' ? '#fef2f2' : '#f0fdf4',
              color: participationStatus === 'Active' ? '#dc2626' : '#16a34a',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {participationStatus === 'Active' ? <Pause size={14} /> : <Play size={14} />}
            {participationStatus === 'Active' ? 'Pause Participation' : 'Resume Participation'}
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Request Additional Category
          </button>
        </div>
      </div>

      {/* Participation Status Banner */}
      <div style={{
        background: participationStatus === 'Active' ? '#f0fdf4' : '#fffbeb',
        borderRadius: 12,
        padding: '14px 20px',
        border: `1px solid ${participationStatus === 'Active' ? '#bbf7d0' : '#fde68a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#1e293b' }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: participationStatus === 'Active' ? '#16a34a' : '#d97706'
          }} />
          <strong>Business Participation Status: {participationStatus}</strong>
          <span style={{ color: '#64748b' }}>
            {participationStatus === 'Active'
              ? 'Your fleet is currently actively receiving automated booking dispatches across approved pincodes.'
              : 'Dispatch is currently paused. New incoming customer orders will not be routed to your agency.'}
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
          Contract Terms: {effectiveAgencyTake}% Platform Fee | Direct Bank Settlements
        </span>
      </div>

      {/* Global Catalogue Policy Callout */}
      <div style={{
        padding: '14px 18px',
        background: '#f8fafc',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        fontSize: 13,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0 }} />
        <div>
          <strong>Platform Catalogue Governance:</strong> Baseline customer prices, service scopes, and warranties are governed strictly by Platform Master Administration. Partners configure authorized capacity and participation.
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          onClick={() => setActiveCategory('ALL')}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            fontSize: 13,
            fontWeight: activeCategory === 'ALL' ? 700 : 500,
            background: activeCategory === 'ALL' ? '#7c3aed' : '#ffffff',
            color: activeCategory === 'ALL' ? '#ffffff' : '#64748b',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          All Services ({services.length})
        </button>
        {platformApprovedCats.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: activeCategory === cat.id ? 700 : 500,
              background: activeCategory === cat.id ? '#7c3aed' : '#ffffff',
              color: activeCategory === cat.id ? '#ffffff' : '#64748b',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services and Packages Cards */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Loading authorized service catalogue...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(s => (
            <div
              key={s.id}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {s.name}
                    </h3>
                    <span style={{
                      padding: '2px 8px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600
                    }}>
                      Platform Approved
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                    {s.description}
                  </p>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Category: <strong>{s.categoryName || s.category}</strong> • Duration: ~{s.durationMinutes} mins • Minor Unit: {s.basePricePaise} paise
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Base Customer Price</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>₹{s.basePrice}</div>
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                    Net Agency Payout: ₹{s.partnerPayout}
                  </div>
                </div>
              </div>

              {/* Package Tiers */}
              {Array.isArray(s.packages) && s.packages.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Approved Package Tiers & Contract Payouts:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {s.packages.map(pkg => (
                      <div
                        key={pkg.id}
                        style={{
                          background: '#f8fafc',
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>{pkg.name}</strong>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>~{pkg.durationMinutes} mins</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>₹{pkg.price}</span>
                          <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>
                            Payout: ₹{pkg.partnerPayout || (pkg.price * 0.82).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submitted Category Expansion Requests */}
      {categoryRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
            Submitted Category Expansion Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryRequests.map(cr => (
              <div
                key={cr.id}
                style={{
                  padding: 14,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{cr.categoryName}</strong>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                    Justification: "{cr.justification}"
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    Requested Fleet Size: {cr.initialFleetSize} technicians • Submitted: {new Date(cr.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#fef3c7',
                  color: '#b45309'
                }}>
                  {cr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Request Modal */}
      {isCategoryModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Request Service Category Expansion
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestCategory} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Requested Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commercial HVAC & VRF Systems, Pest Eradication"
                  value={catForm.categoryName}
                  onChange={e => setCatForm({ ...catForm, categoryName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Initial Certified Fleet Size *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={catForm.initialFleetSize}
                  onChange={e => setCatForm({ ...catForm, initialFleetSize: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Operational Justification & Certifications *
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain your team's tooling, certifications, and readiness for this category..."
                  value={catForm.justification}
                  onChange={e => setCatForm({ ...catForm, justification: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
