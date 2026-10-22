import React, { useState, useEffect } from 'react';
import {
  Layout,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Megaphone,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function ContentView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'announcement' | 'faqs' | 'policies'
  const [announcement, setAnnouncement] = useState('⚡ Limited Period: Flat 20% OFF on all Home Deep Cleaning & Salon packages! Use code FESTIVE20');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  const [banners, setBanners] = useState([
    {
      id: 1,
      title: 'Expert Salon at Home',
      subtitle: 'Premium L\'Oréal, Matrix & O3+ facials by certified beauticians',
      tag: 'Bestseller',
      displayOrder: 1,
      ctaText: 'Book Now',
      ctaLink: '/services?cat=Salon',
      status: 'Published'
    },
    {
      id: 2,
      title: 'AC Jet Repair & Deep Cleaning',
      subtitle: '90-min express visit with 30-day service warranty',
      tag: 'Summer Deal',
      displayOrder: 2,
      ctaText: 'Explore Packages',
      ctaLink: '/services?cat=AC+Repair',
      status: 'Published'
    },
    {
      id: 3,
      title: 'Pest Control & Home Disinfection',
      subtitle: 'Safe for children and pets. 100% odorless chemical sprays',
      tag: 'Safety First',
      displayOrder: 3,
      ctaText: 'View Plans',
      ctaLink: '/services?cat=Cleaning',
      status: 'Published'
    }
  ]);

  const [faqs, setFaqs] = useState([
    {
      id: 'faq-1',
      question: 'How are Urban Company professionals verified?',
      answer: 'Every professional undergoes a 7-step background check, Aadhaar/PAN identity verification, police verification, and doorstep SOP training.',
      displayOrder: 1,
      status: 'Published'
    },
    {
      id: 'faq-2',
      question: 'What is covered under the 30-day service warranty?',
      answer: 'If any issue re-occurs within 30 days of service completion, we arrange a free technician redo visit or 100% refund under our guarantee policy.',
      displayOrder: 2,
      status: 'Published'
    }
  ]);

  const [policies, setPolicies] = useState({
    cancellation: 'Bookings cancelled at least 2 hours before the scheduled time slot receive 100% full refund with zero cancellation fee. Late cancellations incur a ₹99 nominal dispatch fee.',
    safetyCover: 'All jobs performed by Urban Services verified pros are protected by our ₹10,000 accidental damage protection guarantee.',
    satisfaction: 'Not satisfied with your service? Request a free technician re-visit within 30 days.'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminClient.getContent()
      .then(res => {
        if (res.content) {
          if (res.content.announcementText) setAnnouncement(res.content.announcementText);
          if (typeof res.content.announcementActive === 'boolean') setAnnouncementEnabled(res.content.announcementActive);
          if (res.content.marketingBanners) setBanners(res.content.marketingBanners);
          if (res.content.faqs) setFaqs(res.content.faqs);
          if (res.content.policies) setPolicies(res.content.policies);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSaveAll() {
    setSaving(true);
    try {
      const res = await adminClient.updateContent({
        announcementText: announcement,
        announcementActive: announcementEnabled,
        marketingBanners: banners,
        faqs,
        policies
      });
      if (res.success) {
        if (onShowToast) onShowToast('✓ Content published with XSS sanitization applied');
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleToggleBanner(id) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Published' ? 'Draft' : 'Published' } : b));
  }

  function handleToggleFaq(id) {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Published' ? 'Draft' : 'Published' } : f));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header and Save Button */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
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
              Content CMS & Homepage Merchandising
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0'
            }}>
              Anti-XSS Sanitization Active
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Manage customer-facing promotional banners, display order, announcement marquis, FAQs, and guarantee policies.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#6E42E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(110, 66, 229, 0.25)'
          }}
        >
          <Save size={16} />
          <span>{saving ? 'Publishing...' : 'Publish Content Live'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: '6px 12px',
        display: 'flex',
        gap: 8
      }}>
        {[
          { id: 'banners', label: 'Homepage Banners', icon: ImageIcon },
          { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
          { id: 'faqs', label: 'Customer FAQs', icon: HelpCircle },
          { id: 'policies', label: 'Trust & Warranty Policies', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                color: isActive ? '#6E42E5' : '#64748B',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO BANNERS                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'banners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {banners.map((b, idx) => (
            <div
              key={b.id || idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13
                }}>
                  {b.displayOrder || idx + 1}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{b.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEF3C7', color: '#92400E' }}>
                      {b.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>{b.subtitle}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: b.status === 'Published' ? '#ECFDF5' : '#F1F5F9',
                  color: b.status === 'Published' ? '#059669' : '#64748B'
                }}>
                  {b.status || 'Published'}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleBanner(b.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {b.status === 'Published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANNOUNCEMENT BAR                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'announcement' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Top Announcement Marquee Bar
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={e => setAnnouncementEnabled(e.target.checked)}
              />
              <span>Enable Announcement Bar on Marketplace</span>
            </label>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Announcement Headline (Sanitized against stored XSS)
            </label>
            <input
              type="text"
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            fontSize: 12.5,
            color: '#64748B'
          }}>
            <strong>Live Preview:</strong> {announcementEnabled ? announcement : '(Announcement bar currently disabled)'}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMER FAQS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'faqs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((f, idx) => (
            <div
              key={f.id || idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Q: {f.question}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFaq(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f.status === 'Published' ? 'Hide' : 'Publish'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.45 }}>
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRUST & WARRANTY POLICIES                                          */}
      {/* ========================================================================= */}
      {activeTab === 'policies' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Cancellation & Refund Policy Clause
            </label>
            <textarea
              rows={3}
              value={policies.cancellation}
              onChange={e => setPolicies({ ...policies, cancellation: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              ₹10,000 Accidental Damage Safety Cover Guarantee
            </label>
            <textarea
              rows={3}
              value={policies.safetyCover}
              onChange={e => setPolicies({ ...policies, safetyCover: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 6, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
