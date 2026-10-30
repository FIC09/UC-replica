import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Users,
  Award,
  Smartphone,
  Sparkles,
  Building2,
  HelpCircle,
  Send,
  QrCode,
  Download,
  CheckCircle2,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';

export function FooterModals({ activeModal, onClose, selectedCity = 'Mumbai', onSelectCity }) {
  // Local state for callback request form
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('ongoing-service');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // Local state for app download SMS link
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  if (!activeModal) return null;

  function handleCallbackSubmit(e) {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setCallbackSubmitted(true);
  }

  function handleSmsSubmit(e) {
    e.preventDefault();
    if (!smsPhone || smsPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSmsSent(true);
  }

  return (
    <div
      className="footer-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="footer-modal-container"
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: activeModal === 'reviews' || activeModal === 'about' ? 780 : 640,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          animation: 'scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            background: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: -0.5
              }}
            >
              FIC
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#64748B'
                }}
              >
                Forge India Connect
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#0F172A',
                  lineHeight: 1.2
                }}
              >
                {activeModal === 'about' && 'About Forge India Connect'}
                {activeModal === 'investor' && 'Investor Relations & Scale'}
                {activeModal === 'terms' && 'Terms & Conditions'}
                {activeModal === 'privacy' && 'Privacy Policy & Data Security'}
                {activeModal === 'anti-discrimination' && 'Anti-Discrimination Policy'}
                {activeModal === 'careers' && 'Careers at Forge India Connect'}
                {activeModal === 'reviews' && 'Verified Customer Reviews'}
                {activeModal === 'contact' && '24x7 Customer Support & Help'}
                {activeModal === 'app-download' && 'Download the FIC Mobile App'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 'none',
              background: '#E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#CBD5E1';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E2E8F0';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 140px)',
            color: '#334155',
            lineHeight: 1.6,
            fontSize: 14
          }}
        >
          {/* ======================================================== */}
          {/* 1. ABOUT US                                              */}
          {/* ======================================================== */}
          {activeModal === 'about' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  color: '#FFFFFF',
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 10
                  }}
                >
                  <ShieldCheck size={14} /> Certified Home Services Platform
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 19, fontWeight: 800 }}>
                  Empowering Bharat’s Skilled Tradespeople, Delivering 5-Star Home Services.
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
                  Forge India Connect is India's leading technology-driven on-demand home services
                  marketplace. Founded to bridge the gap between skilled blue-collar professionals
                  and modern households seeking punctuality, transparent pricing, and guaranteed safety.
                </p>
              </div>

              {/* 4 Key Pillars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  marginBottom: 24
                }}
              >
                <div
                  style={{
                    background: '#F8FAFC',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <ShieldCheck size={18} color="#059669" />
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>100% Background-Checked</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
                    Every technician undergoes mandatory Aadhaar-based KYC, criminal court verification, and trade skill tests.
                  </p>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Sparkles size={18} color="#2563EB" />
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>30-Day Service Guarantee</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
                    Comprehensive warranty on appliance repairs, electrical fixes, and cleanings with zero-cost reworks.
                  </p>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Clock size={18} color="#D97706" />
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Live GPS Arrival Tracking</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
                    Know exactly when your technician arrives with live street-level routing and verified OTP entry.
                  </p>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <HeartHandshake size={18} color="#7C3AED" />
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Fair Real-Time Pay</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
                    Direct payout architecture ensuring partner technicians earn dignified, transparent, and prompt incomes.
                  </p>
                </div>
              </div>

              {/* Statistics Band */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '16px 12px',
                  background: '#F1F5F9',
                  borderRadius: 10,
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>50,000+</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Trained Partners</div>
                </div>
                <div style={{ width: 1, background: '#CBD5E1' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>2.4M+</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Happy Bookings</div>
                </div>
                <div style={{ width: 1, background: '#CBD5E1' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>4.87 ★</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Average Rating</div>
                </div>
                <div style={{ width: 1, background: '#CBD5E1' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>18+</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Indian Hubs</div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. INVESTOR RELATIONS                                    */}
          {/* ======================================================== */}
          {activeModal === 'investor' && (
            <div>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '18px 20px',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={20} color="#2563EB" />
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                    Financial Overview & Scale Metrics
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                  Forge India Connect is building India's most capital-efficient, high-margin service network
                  with automated hyper-local dispatch, proprietary worker training pipelines, and real-time escrow settlement.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ANNUALIZED GMV</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: '4px 0' }}>₹180 Cr+</div>
                  <div style={{ fontSize: 11.5, color: '#10B981' }}>▲ 142% Year-over-Year Growth</div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>PARTNER RETENTION</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', margin: '4px 0' }}>94.2%</div>
                  <div style={{ fontSize: 11.5, color: '#3B82F6' }}>6-Month Worker Cohort Stickiness</div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>AVG. TECHNICIAN DISPATCH</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706', margin: '4px 0' }}>14.8 Mins</div>
                  <div style={{ fontSize: 11.5, color: '#F59E0B' }}>Micro-locality Routing Efficiency</div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>CONTRIBUTION MARGIN</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED', margin: '4px 0' }}>Positive</div>
                  <div style={{ fontSize: 11.5, color: '#8B5CF6' }}>Unit-Economics Validated Across Top Hubs</div>
                </div>
              </div>

              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong style={{ color: '#1E3A8A', fontSize: 13.5 }}>Institutional Investor Enquiries</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#2563EB' }}>
                    Access quarterly audits, growth deck, and governance filings: ir@forgeindiaconnect.com
                  </p>
                </div>
                <a
                  href="mailto:ir@forgeindiaconnect.com"
                  style={{
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Contact IR
                </a>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. TERMS & CONDITIONS                                    */}
          {/* ======================================================== */}
          {activeModal === 'terms' && (
            <div>
              <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 0 }}>
                Effective Date: October 2026 • By using the Forge India Connect marketplace, you agree to the following terms:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    1. 30-Day Service Warranty & Free Rework
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    All repairs and maintenance jobs carry an automatic 30-day coverage protection. If an issue recurs
                    within 30 days of service completion, a senior technician is dispatched at ₹0 cost.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    2. Standardized Rate Card & Extra Parts Approval
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    Our labor rates are strictly fixed. No partner is permitted to charge above the catalog price.
                    If genuine replacement parts are required, the customer must approve the digital quotation in-app
                    before parts are fitted.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    3. Cancellation & Rescheduling Rights
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    Customers can cancel or reschedule bookings free of charge up to 2 hours prior to the scheduled slot.
                    Emergency cancellations are evaluated fairly without penalty fees.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    4. Property Damage Protection
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    In the exceptional event of accidental physical damage during work, our platform insurance covers
                    rectification or compensation up to ₹10,000 subject to inspection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. PRIVACY POLICY                                        */}
          {/* ======================================================== */}
          {activeModal === 'privacy' && (
            <div>
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <ShieldCheck size={20} color="#16A34A" />
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  We do not sell, rent, or trade your personal data with third-party advertising brokers.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: 13.5 }}>1. Ephemeral Location Tracking</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#475569' }}>
                    Technician GPS coordinates and customer address coordinates are used strictly while a booking is actively
                    in-transit and in-progress. GPS broadcasting stops automatically upon job completion.
                  </p>
                </div>

                <div>
                  <strong style={{ color: '#0F172A', fontSize: 13.5 }}>2. Number Masking & Private Calls</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#475569' }}>
                    Direct phone numbers are masked using encrypted WebRTC voice calls and secure communication relays
                    so your personal number is never exposed to service contractors.
                  </p>
                </div>

                <div>
                  <strong style={{ color: '#0F172A', fontSize: 13.5 }}>3. Bank-Grade Payment Security</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#475569' }}>
                    Payment processing is compliant with RBI tokenization rules. We never store CVVs or card PINs on our servers.
                  </p>
                </div>

                <div>
                  <strong style={{ color: '#0F172A', fontSize: 13.5 }}>4. Right to Data Erasure</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#475569' }}>
                    Users have the right to request deletion of account records, addresses, and transaction histories by emailing
                    privacy@forgeindiaconnect.com.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. ANTI-DISCRIMINATION POLICY                            */}
          {/* ======================================================== */}
          {activeModal === 'anti-discrimination' && (
            <div>
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  padding: '14px 18px',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <AlertCircle size={18} color="#DC2626" />
                  <strong style={{ color: '#991B1B', fontSize: 14 }}>Zero-Tolerance for Discrimination</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#B91C1C' }}>
                  Forge India Connect is committed to building an inclusive and safe environment for both
                  service partners and customers across all regions of India.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Equal Access for All Customers
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    Service requests may never be denied or deprioritized on grounds of race, religion, caste, gender,
                    sexual orientation, marital status, disability, or mother tongue.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Dignity & Respect for Service Professionals
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    All customers agree to treat visiting professionals with common courtesy and respect. Any verbal abuse,
                    harassment, or refusal of basic courtesy (like drinking water during hot weather repairs) results in
                    an immediate permanent platform ban.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Grievance Escalation
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    Any breach of this charter is reviewed within 24 hours by our dedicated Ethics & Compliance Committee:
                    ethics@forgeindiaconnect.com.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. CAREERS                                               */}
          {/* ======================================================== */}
          {activeModal === 'careers' && (
            <div>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  marginBottom: 18
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Briefcase size={20} color="#2563EB" />
                  <strong style={{ color: '#0F172A', fontSize: 15 }}>Build the Future of Indian Work</strong>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                  We are hiring across engineering, operations, and partner excellence to power the livelihoods
                  of millions of Indian technicians.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Senior Full-Stack Engineer</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>React 19 • Node.js • WebRTC • Bengaluru / Hybrid</div>
                  </div>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12
                    }}
                  >
                    Open
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>City Operations Manager</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Supply Growth • Krishnagiri / Chennai / Mumbai</div>
                  </div>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12
                    }}
                  >
                    Open
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Technical Training Lead (Appliance & AC)</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Curriculum & Simulation Labs • Krishnagiri Hub</div>
                  </div>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12
                    }}
                  >
                    Open
                  </span>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  background: '#F1F5F9',
                  padding: '16px',
                  borderRadius: 10
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Interested in joining our team?
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                  Send your CV and a brief note about yourself to:
                </div>
                <a
                  href="mailto:careers@forgeindiaconnect.com?subject=Job%20Application%20at%20Forge%20India%20Connect"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#0F172A',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '8px 18px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 700
                  }}
                >
                  <Mail size={15} /> Apply via careers@forgeindiaconnect.com
                </a>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. FIC REVIEWS                                           */}
          {/* ======================================================== */}
          {activeModal === 'reviews' && (
            <div>
              {/* Overall Ratings Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  color: '#FFFFFF',
                  marginBottom: 20
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#FACC15' }}>4.87</span>
                    <span style={{ fontSize: 16, color: '#94A3B8' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, margin: '4px 0 6px 0' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#FACC15" color="#FACC15" />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#CBD5E1' }}>
                    Based on 2,410,000+ verified customer reviews across India
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={14} /> 100% Genuine Reviews
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    Only verified customers with completed bookings can review
                  </div>
                </div>
              </div>

              {/* Review Testimonials */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Sundaramoorthy K.</strong>
                      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>Krishnagiri (Gandhi Nagar)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#FACC15" color="#FACC15" />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginBottom: 6 }}>
                    ✓ AC Deep Clean & Jet Pump Service
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    "Technician arrived on a bike right on time. Used high pressure foam and jet wash pump with protective
                    wall plastic cover. My split AC cooling is back to freezing cold! Zero mess left behind."
                  </p>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Priya Sharma</strong>
                      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>Mumbai (Bandra West)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#FACC15" color="#FACC15" />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginBottom: 6 }}>
                    ✓ Salon Prime & Facial Package
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    "The aesthetician used sealed disposable kits and opened mono-dose packs in front of me. Such a luxurious
                    and relaxing salon session without stepping out into Mumbai traffic."
                  </p>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Rajesh Raman</strong>
                      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>Bengaluru (Indiranagar)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#FACC15" color="#FACC15" />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginBottom: 6 }}>
                    ✓ Chimney Deep Clean & Degreasing
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    "The suction of my Faber chimney had dropped drastically due to heavy oil sludge. The specialist dismantled
                    the baffles, soaked in hot ultrasonic degreaser, and cleaned the motor. Excellent service!"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. CONTACT US                                            */}
          {/* ======================================================== */}
          {activeModal === 'contact' && (
            <div>
              {/* Helplines Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    padding: 16,
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    background: '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Phone size={18} color="#2563EB" />
                    <strong style={{ color: '#0F172A', fontSize: 13 }}>24x7 Customer Helpline</strong>
                  </div>
                  <a
                    href="tel:18004193322"
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#2563EB',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: 4
                    }}
                  >
                    1800-419-3322
                  </a>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>Toll-Free • Available in 6 languages</div>
                </div>

                <div
                  style={{
                    padding: 16,
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    background: '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <MessageSquare size={18} color="#059669" />
                    <strong style={{ color: '#0F172A', fontSize: 13 }}>WhatsApp Direct Help</strong>
                  </div>
                  <a
                    href="https://wa.me/919443288124?text=Hi%20Forge%20India%20Connect,%20I%20need%20help%20with%20a%20service"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#059669',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: 4
                    }}
                  >
                    +91 94432 88124
                  </a>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>Instant response under 2 mins</div>
                </div>
              </div>

              {/* Fast Callback Form */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Request an Instant Callback
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: 12.5, color: '#64748B' }}>
                  Our customer care specialist will call you back on your registered phone within 5 minutes.
                </p>

                {callbackSubmitted ? (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 8,
                      padding: '16px',
                      textAlign: 'center',
                      color: '#065F46'
                    }}
                  >
                    <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 800, fontSize: 15 }}>Callback Requested!</div>
                    <div style={{ fontSize: 12.5, marginTop: 4 }}>
                      We are calling {callbackPhone} shortly. Reference ID: #CB-{Date.now().toString().slice(-4)}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCallbackSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                          YOUR NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={callbackName}
                          onChange={(e) => setCallbackName(e.target.value)}
                          placeholder="e.g. Sundaramoorthy"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: 6,
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                          10-DIGIT MOBILE
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={callbackPhone}
                          onChange={(e) => setCallbackPhone(e.target.value)}
                          placeholder="9876543210"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: 6,
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        HOW CAN WE HELP YOU?
                      </label>
                      <select
                        value={callbackTopic}
                        onChange={(e) => setCallbackTopic(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          fontSize: 13,
                          background: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="ongoing-service">Help with Ongoing / Active Service Booking</option>
                        <option value="reschedule">Reschedule or Change Date/Time Slot</option>
                        <option value="billing">Invoice / Billing & Payment Clarification</option>
                        <option value="warranty">30-Day Service Warranty Claim</option>
                        <option value="partner-support">Join as Service Partner / Technician</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        padding: '11px',
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <Phone size={15} /> Request Instant Callback
                    </button>
                  </form>
                )}
              </div>

              {/* Registered Addresses */}
              <div style={{ marginTop: 16, fontSize: 11.5, color: '#64748B', lineHeight: 1.5 }}>
                <strong>Registered Headquarters:</strong> Forge India Connect Tech Hub, Rayakottai Road, Krishnagiri, Tamil Nadu 635001 • Regional Hub: 100ft Rd, Indiranagar, Bengaluru, Karnataka 560038.
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. APP DOWNLOAD MODAL                                    */}
          {/* ======================================================== */}
          {activeModal === 'app-download' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
                  borderRadius: 12,
                  padding: '24px',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#FFFFFF',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 20,
                    margin: '0 auto 12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                >
                  FIC
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 800 }}>
                  Experience Seamless Home Services on the Go
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1' }}>
                  Track your technician with live GPS, get instant OTP dispatch alerts, and enjoy app-exclusive offers.
                </p>
              </div>

              {/* QR Code and Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 24,
                  background: '#F8FAFC',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  marginBottom: 20,
                  flexWrap: 'wrap'
                }}
              >
                {/* Visual QR Code simulation */}
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      background: 'repeating-conic-gradient(#000000 0% 25%, #FFFFFF 0% 50%) 50% / 12px 12px',
                      borderRadius: 4,
                      marginBottom: 8
                    }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Scan to Install</div>
                </div>

                {/* App Store Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a
                    href="#download-ios"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Redirecting to Apple App Store for Forge India Connect iOS app...');
                    }}
                    className="footer-uc-store-btn"
                    style={{ minWidth: 170 }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-1 .04-2.17.67-2.84 1.44-.57.65-1.07 1.71-.94 2.74 1.13.09 2.21-.57 2.77-1.31z"/>
                    </svg>
                    <div className="footer-uc-store-text">
                      <span className="store-sub">Download on the</span>
                      <span className="store-main">App Store</span>
                    </div>
                  </a>

                  <a
                    href="#download-android"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Redirecting to Google Play Store for Forge India Connect Android app...');
                    }}
                    className="footer-uc-store-btn"
                    style={{ minWidth: 170 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 0 1-1.61-.954V2.768c0-.39.117-.75.32-1.054l1.289.1zM15.207 13.414l2.122 2.122-12.72 7.234 10.598-9.356zm0-2.828L4.61 1.23l12.72 7.234-2.123 2.122zM16.621 12l4.89-2.772c.983-.557.983-1.464 0-2.02L16.621 12z"/>
                    </svg>
                    <div className="footer-uc-store-text">
                      <span className="store-sub">GET IT ON</span>
                      <span className="store-main">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Send SMS download link */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '16px 20px'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Get the Direct Download Link on your phone
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                  Enter your mobile number and we'll send a direct installation link via SMS immediately.
                </div>

                {smsSent ? (
                  <div
                    style={{
                      background: '#ECFDF5',
                      color: '#065F46',
                      padding: '10px 14px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <CheckCircle2 size={16} color="#059669" />
                    SMS Link sent to +91 {smsPhone}! Check your messages.
                  </div>
                ) : (
                  <form onSubmit={handleSmsSubmit} style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#64748B'
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="Enter 10-digit number"
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 44px',
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '9px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Send SMS Link
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#059669" />
            <span>ISO 9001:2015 Quality Assured • Safe & Transparent</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
