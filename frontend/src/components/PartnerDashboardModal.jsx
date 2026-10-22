import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  FileText, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  ChevronRight,
  HardHat,
  Star,
  Check
} from 'lucide-react';

export function PartnerDashboardModal({
  isOpen,
  onClose,
  onShowToast,
  onOpenPartnerOnboarding,
  user
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'fleet' | 'ledger' | 'dispatch'
  
  // Agency Partner profile
  const partnerProfile = {
    businessName: user?.agencyName || 'Apex Home Solutions LLP',
    ownerName: user?.name || 'Sandeep Patil',
    partnerId: 'PTR-90142',
    tier: 'Platinum Enterprise Fleet',
    gstNumber: '27AABCA1234F1Z8',
    zone: 'Bandra, Khar & Santacruz Cluster, Mumbai',
    monthlyCapacity: '350-400 jobs/month',
    activeTechniciansCount: 12,
    completedJobsThisMonth: 312,
    grossTurnover: 486500,
    netAgencyPayout: 389200
  };

  // Fleet list
  const [fleet, setFleet] = useState([
    { id: 'T-101', name: 'Vikram Salvi', trade: 'AC Master Specialist', rating: 4.94, jobsToday: 3, status: 'On Job' },
    { id: 'T-102', name: 'Ramesh Vishwakarma', trade: 'AC & Appliance Tech', rating: 4.88, jobsToday: 2, status: 'Available' },
    { id: 'T-103', name: 'Dilip Mistry', trade: 'Electrician & Quick Repairs', rating: 4.91, jobsToday: 4, status: 'On Job' },
    { id: 'T-104', name: 'Sunita Chauhan', trade: 'Deep Cleaning Specialist', rating: 4.86, jobsToday: 2, status: 'Available' },
    { id: 'T-105', name: 'Manoj Kamble', trade: 'Plumber & Sanitization', rating: 4.82, jobsToday: 1, status: 'Available' },
    { id: 'T-106', name: 'Rajesh Kumar', trade: 'Senior AC Technician', rating: 4.95, jobsToday: 3, status: 'On Job' }
  ]);

  if (!isOpen) return null;

  return (
    <div className="partner-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#0F172A',
        color: '#F8FAFC',
        width: '100%',
        maxWidth: 1000,
        height: '90vh',
        borderRadius: 20,
        border: '1px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Partner Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#090D16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}>
              <Building2 size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {partnerProfile.businessName}
                </h3>
                <span style={{
                  background: 'rgba(37, 99, 235, 0.2)',
                  color: '#60A5FA',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  {partnerProfile.tier}
                </span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <ShieldCheck size={12} />
                  GST Verified
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Managing Partner: {partnerProfile.ownerName} • 📍 {partnerProfile.zone} • ID: {partnerProfile.partnerId}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onOpenPartnerOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPartnerOnboarding();
                }}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#60A5FA',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plus size={14} />
                <span>Add Fleet Pro</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#94A3B8',
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Portal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '10px 24px',
          background: '#0B1120',
          borderBottom: '1px solid #1E293B'
        }}>
          {[
            { id: 'overview', label: 'Agency Overview & KPIs', icon: TrendingUp },
            { id: 'fleet', label: 'Technician Fleet (12 Active)', icon: Users, count: fleet.length },
            { id: 'ledger', label: 'Agency Payouts & Commission', icon: DollarSign, count: `₹${partnerProfile.netAgencyPayout.toLocaleString()}` },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: active ? '#1E293B' : 'transparent',
                  color: active ? '#60A5FA' : '#94A3B8',
                  border: active ? '1px solid #334155' : '1px solid transparent',
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span style={{
                    fontSize: 11,
                    background: active ? '#2563EB' : '#1E293B',
                    color: '#fff',
                    padding: '2px 7px',
                    borderRadius: 999,
                    fontWeight: 800
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Monthly GMV Handled', val: `₹${partnerProfile.grossTurnover.toLocaleString('en-IN')}`, sub: '+18% vs last month', color: '#60A5FA' },
                  { label: 'Agency Net Payout', val: `₹${partnerProfile.netAgencyPayout.toLocaleString('en-IN')}`, sub: 'Next settlement in 3 days', color: '#34D399' },
                  { label: 'Active Technicians', val: '12 Pros', sub: '98% attendance', color: '#FBBF24' },
                  { label: 'Monthly Jobs Executed', val: '312 Jobs', sub: 'Target: 350-400 jobs', color: '#C084FC' }
                ].map((s, idx) => (
                  <div key={idx} style={{
                    background: '#1E293B',
                    borderRadius: 14,
                    padding: '16px 18px',
                    border: '1px solid #334155'
                  }}>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>
                      {s.val}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cluster Zones & Performance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: '#1E293B', borderRadius: 16, padding: 22, border: '1px solid #334155' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 14px 0' }}>
                    🏢 Agency Franchise Details & Compliance
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #334155' }}>
                      <span style={{ color: '#94A3B8' }}>Entity Type</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>Limited Liability Partnership (LLP)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #334155' }}>
                      <span style={{ color: '#94A3B8' }}>GST Identification</span>
                      <span style={{ fontWeight: 700, color: '#60A5FA' }}>{partnerProfile.gstNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #334155' }}>
                      <span style={{ color: '#94A3B8' }}>Assigned City Hubs</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>Bandra, Khar, Santacruz (Mumbai)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #334155' }}>
                      <span style={{ color: '#94A3B8' }}>Dedicated Service Categories</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>AC, Appliances, Cleaning, Quick Repairs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94A3B8' }}>UC Account Relationship Lead</span>
                      <span style={{ fontWeight: 700, color: '#34D399' }}>Rakesh Verma (Ops Director)</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#1E293B', borderRadius: 16, padding: 22, border: '1px solid #334155' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 14px 0' }}>
                    ⚡ Real-Time Fleet Status
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {fleet.slice(0, 4).map(tech => (
                      <div key={tech.id} style={{
                        background: '#0F172A',
                        borderRadius: 10,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #334155'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <HardHat size={16} color="#60A5FA" />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{tech.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{tech.trade} • {tech.rating} ★</div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: tech.status === 'On Job' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: tech.status === 'On Job' ? '#60A5FA' : '#34D399'
                        }}>
                          {tech.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
                  Active Technicians in Agency Roster (12 Members)
                </h4>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  All technicians are 100% police verified with toolkits & Urban Company branded uniforms.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {fleet.map(tech => (
                  <div
                    key={tech.id}
                    style={{
                      background: '#1E293B',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{tech.name}</span>
                        <span style={{ fontSize: 11, background: '#0F172A', color: '#FBBF24', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                          {tech.rating} ★
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                        {tech.trade} • ID: {tech.id}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#34D399' }}>
                        ✓ {tech.jobsToday} dispatches completed today
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: tech.status === 'On Job' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: tech.status === 'On Job' ? '#60A5FA' : '#34D399',
                        display: 'inline-block',
                        marginBottom: 8
                      }}>
                        {tech.status}
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() => onShowToast && onShowToast(`📞 Calling ${tech.name}...`)}
                          style={{
                            background: '#0F172A',
                            border: '1px solid #334155',
                            color: '#CBD5E1',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Contact Pro
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
                borderRadius: 20,
                padding: 26,
                marginBottom: 24,
                border: '1px solid #3B82F6'
              }}>
                <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                  Total Monthly Net Commission Settled
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginBottom: 14 }}>
                  ₹{partnerProfile.netAgencyPayout.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12.5, color: '#BFDBFE' }}>
                  Automatic bi-weekly settlement to Kotak Mahindra Current A/C (IFSC: KKBK0000642)
                </div>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                Agency Payout Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { desc: 'Fortnight Payout Batch #FP-914 (Bandra Zone)', amount: '+₹1,94,600', date: '15 Oct 2026', status: 'Settled' },
                  { desc: 'Performance Incentive - High Monsoon Retention', amount: '+₹25,000', date: '12 Oct 2026', status: 'Settled' },
                  { desc: 'Fortnight Payout Batch #FP-902 (Santacruz Zone)', amount: '+₹1,69,600', date: '01 Oct 2026', status: 'Settled' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: '#1E293B',
                    borderRadius: 12,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #334155'
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{item.desc}</div>
                      <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{item.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#34D399' }}>{item.amount}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
