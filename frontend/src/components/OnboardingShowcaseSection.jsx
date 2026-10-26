import React from 'react';
import { HardHat, Building2, ArrowRight, CheckCircle2, TrendingUp, Users, ShieldCheck, DollarSign } from 'lucide-react';

export function OnboardingShowcaseSection({
  onOpenWorkerOnboarding,
  onOpenPartnerOnboarding
}) {
  return (
    <section className="onboarding-showcase-section" style={{
      padding: '40px 0',
      background: '#F8FAFC',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0'
    }}>
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 800,
            color: '#6E42E5',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 6
          }}>
            <ShieldCheck size={14} />
            <span>GROW WITH URBAN COMPANY MUMBAI</span>
          </div>
          <h2 style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#0F172A',
            margin: '0 0 8px 0',
            letterSpacing: -0.5
          }}>
            Onboarding Opportunities: Workers & Business Partners
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Choose whether you are applying as an individual skilled service technician or registering a business fleet.
          </p>
        </div>

        {/* Dual Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20
        }}>
          {/* Card 1: Worker Onboarding (For Individual Technicians & Pros) */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #BBF7D0',
            borderTop: '4px solid #059669',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <HardHat size={22} />
                </div>
                <span style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 20
                }}>
                  FOR INDIVIDUAL SPECIALISTS
                </span>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                Worker Onboarding
              </h3>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                Join as an individual service technician (AC repair, electrician, plumber, cleaner, salon professional, or painter).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#059669" />
                  <span><strong>₹50,000–₹95,000</strong> average monthly income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#059669" />
                  <span>Flexible gig hours & guaranteed weekly bank payout</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#059669" />
                  <span>Free technical training & police KYC verification</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenWorkerOnboarding}
              style={{
                width: '100%',
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '12px 18px',
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
            >
              <span>Apply for Worker Onboarding</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Partner Onboarding (For Businesses, Agencies & Fleets) */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E9D5FF',
            borderTop: '4px solid #6E42E5',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(110, 66, 229, 0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: '#F4F0FF',
                  border: '1px solid #E9D5FF',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6E42E5'
                }}>
                  <Building2 size={22} />
                </div>
                <span style={{
                  background: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#6E42E5',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 20
                }}>
                  FOR AGENCIES & FLEET OWNERS
                </span>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                Partner Onboarding
              </h3>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                Register your service enterprise, agency, or technician fleet for high-volume enterprise dispatch across Mumbai.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#6E42E5" />
                  <span>Guaranteed high-volume enterprise booking dispatch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#6E42E5" />
                  <span>Partner Pro Fleet ERP software for live technician tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                  <CheckCircle2 size={15} color="#6E42E5" />
                  <span>Dedicated corporate account manager & priority settlements</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPartnerOnboarding}
              style={{
                width: '100%',
                background: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '12px 18px',
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5829D6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6E42E5'}
            >
              <span>Apply for Partner Onboarding</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
