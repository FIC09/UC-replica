import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Building2, 
  Plus, 
  Users, 
  Percent, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Briefcase, 
  Star, 
  Clock, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  Ban, 
  MessageSquare, 
  Send,
  RefreshCw,
  Award,
  CreditCard
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function PartnersView({ onShowToast, onNavigate }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Active Detail Drawer & Drawer Sub-tab
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [drawerTab, setDrawerTab] = useState('profile'); // 'profile' | 'tax' | 'docs' | 'pros' | 'settlement' | 'notes'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [nextStatusAction, setNextStatusAction] = useState('Active');
  const [statusReason, setStatusReason] = useState('Corporate documentation and SLA contract verified');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [newSettlementMode, setNewSettlementMode] = useState('ThroughBusiness');
  const [newCommissionRate, setNewCommissionRate] = useState('18%');
  const [newPartnerNote, setNewPartnerNote] = useState('');

  // New Partner Form State
  const [newPartner, setNewPartner] = useState({
    businessName: '',
    ownerName: '',
    contactName: '',
    phone: '',
    email: '',
    city: 'Mumbai',
    coverageZones: 'Bandra West, Khar West, Santacruz',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Care',
    businessType: 'LLP',
    fleetSize: '10 Technicians',
    techniciansCount: 10,
    tier: 'Gold Franchise',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    commissionRate: '18%',
    settlementMode: 'ThroughBusiness'
  });

  const fetchPartnersList = () => {
    setLoading(true);
    adminClient.getPartners({
      search,
      status: statusFilter,
      city: cityFilter,
      page,
      limit: 10
    })
      .then(res => {
        setPartners(res.partners || []);
        if (res.pagination) setPagination(res.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartnersList();
  }, [search, statusFilter, cityFilter, page]);

  // Handle Partner Creation
  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newPartner.businessName || !newPartner.ownerName || !newPartner.phone) {
      onShowToast && onShowToast('Please fill in business name, owner name, and phone');
      return;
    }

    const payload = {
      ...newPartner,
      coverageZones: newPartner.coverageZones.split(',').map(s => s.trim()).filter(Boolean),
      contactPerson: {
        name: newPartner.contactName || newPartner.ownerName,
        phone: newPartner.phone,
        email: newPartner.email,
        designation: 'Authorized Managing Partner'
      }
    };

    adminClient.createPartner(payload)
      .then(res => {
        onShowToast && onShowToast(`✓ Agency Partner "${newPartner.businessName}" registered successfully!`);
        setIsCreateOpen(false);
        fetchPartnersList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Status Update (Approve, Reject, Suspend, Reactivate)
  function handleStatusSubmit() {
    if (!selectedPartner) return;
    adminClient.updatePartnerStatus(selectedPartner.id, nextStatusAction, statusReason)
      .then(() => {
        onShowToast && onShowToast(`✓ Partner ${selectedPartner.businessName} status set to ${nextStatusAction}`);
        setShowStatusModal(false);
        fetchPartnersList();
        setSelectedPartner(prev => ({
          ...prev,
          status: nextStatusAction,
          statusReason
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Document Verification
  function handleDocVerify(docType, status, reason = '') {
    if (!selectedPartner) return;
    adminClient.verifyPartnerDocument(selectedPartner.id, docType, status, reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Document ${docType} marked as ${status}`);
        setSelectedPartner(prev => ({
          ...prev,
          verificationDocs: {
            ...(prev.verificationDocs || {}),
            [docType]: {
              ...(prev.verificationDocs?.[docType] || {}),
              status,
              verifiedBy: 'Super Administrator',
              verifiedAt: new Date()
            }
          }
        }));
      });
  }

  // Handle Settlement Mode & Commission Rate Update
  function handleSettlementModeSubmit(e) {
    e.preventDefault();
    if (!selectedPartner) return;
    adminClient.updatePartnerSettlementMode(selectedPartner.id, newSettlementMode, newCommissionRate)
      .then(() => {
        onShowToast && onShowToast(`✓ Settlement mode updated to ${newSettlementMode} (Commission: ${newCommissionRate})`);
        setShowSettlementModal(false);
        setSelectedPartner(prev => ({
          ...prev,
          settlementMode: newSettlementMode,
          commissionRate: newCommissionRate
        }));
        fetchPartnersList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Internal Partner Note
  function handleAddNote(e) {
    e.preventDefault();
    if (!newPartnerNote.trim() || !selectedPartner) return;
    adminClient.addPartnerNote(selectedPartner.id, newPartnerNote)
      .then(res => {
        const noteObj = res.note || {
          id: 'nt-' + Date.now(),
          note: newPartnerNote,
          author: 'Operations Director',
          authorRole: 'Admin',
          createdAt: new Date()
        };
        setSelectedPartner(prev => ({
          ...prev,
          internalNotes: [noteObj, ...(prev.internalNotes || [])]
        }));
        setNewPartnerNote('');
        onShowToast && onShowToast('✓ Internal partner note recorded');
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  function renderStatusBadge(status) {
    const s = (status || 'Active').toLowerCase();
    let bg = '#F0FDF4'; let color = '#16A34A'; let border = '#BBF7D0';
    if (s === 'pending review') {
      bg = '#FFFBEB'; color = '#D97706'; border = '#FDE68A';
    } else if (s === 'suspended' || s === 'rejected') {
      bg = '#FEF2F2'; color = '#DC2626'; border = '#FECACA';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
        {status}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Policy & Governance Notice */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={22} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
              Business Partner Franchise & Fleet Agencies
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
              Multi-technician contractor agencies, company tax verification, settlement mode controls, and strict cross-tenant data privacy
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#6E42E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Register Agency Partner
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: 8,
          padding: '8px 14px',
          flex: '1 1 280px',
          minWidth: 260
        }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search partners by business name, owner, city, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: 13,
              color: '#0F172A'
            }}
          />
          {search && (
            <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Partner Statuses</option>
            <option value="Active">Active Franchisees</option>
            <option value="Pending Review">Pending Applications</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={cityFilter}
            onChange={e => { setCityFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Krishnagiri">Krishnagiri</option>
          </select>

          {(statusFilter !== 'ALL' || cityFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCityFilter('ALL');
                setSearch('');
                setPage(1);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6E42E5',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Partners Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Business Entity</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Contact & Owner</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>City & Coverage</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Technician Fleet</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Settlement Mode</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading business partners...
                    </div>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <Building2 size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No partner agencies match the selected criteria</div>
                  </td>
                </tr>
              ) : (
                partners.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    {/* Business Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: '#EDE9FE',
                          color: '#6E42E5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13
                        }}>
                          {p.businessName[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.businessName}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {p.id} • {p.businessType || 'LLP'} • Tier: <strong>{p.tier}</strong>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Owner */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.ownerName}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{p.phone} • {p.email}</div>
                    </td>

                    {/* City & Coverage */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.city}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {p.coverageZones?.slice(0, 2).join(', ') || p.locality || 'Central Hub'}
                        {p.coverageZones?.length > 2 && ` +${p.coverageZones.length - 2} zones`}
                      </div>
                    </td>

                    {/* Fleet */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#6E42E5" />
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {p.techniciansCount || p.fleetSize || 10} technicians
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Cap: {p.monthlyCapacity || '300 jobs/mo'}
                      </div>
                    </td>

                    {/* Settlement Mode */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: p.settlementMode === 'ThroughBusiness' ? '#EFF6FF' : '#F8FAFC',
                        color: p.settlementMode === 'ThroughBusiness' ? '#1E40AF' : '#475569',
                        border: '1px solid #CBD5E1'
                      }}>
                        <Lock size={11} />
                        {p.settlementMode === 'ThroughBusiness' ? 'Agency Payroll' : 'Individual Pro'}
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>
                        Take Rate: {p.commissionRate || '18%'}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {renderStatusBadge(p.status)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPartner(p);
                          }}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          Manage
                        </button>
                        <ChevronRight size={16} color="#94A3B8" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PARTNER DETAIL PROFILE DRAWER (RIGHT SLIDE-OVER)         */}
      {/* ======================================================== */}
      {selectedPartner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 680,
            backgroundColor: '#FFFFFF',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            borderLeft: '1px solid #E2E8F0'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedPartner.businessName}
                  </h3>
                  {renderStatusBadge(selectedPartner.status)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  ID: {selectedPartner.id} • Tier: {selectedPartner.tier} • City: {selectedPartner.city}
                </div>
              </div>

              <button
                onClick={() => setSelectedPartner(null)}
                style={{
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            {/* Sub-tabs in Drawer */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 20px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'profile', label: 'Company Profile' },
                { id: 'tax', label: 'Registration & Tax' },
                { id: 'docs', label: 'Verification Docs' },
                { id: 'pros', label: 'Linked Pros' },
                { id: 'settlement', label: 'Settlement & Payroll' },
                { id: 'notes', label: 'Notes & Contract' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id)}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: drawerTab === t.id ? '2px solid #6E42E5' : '2px solid transparent',
                    color: drawerTab === t.id ? '#6E42E5' : '#64748B',
                    fontSize: 12,
                    fontWeight: drawerTab === t.id ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Primary Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {selectedPartner.status !== 'Active' && (
                  <button
                    onClick={() => {
                      setNextStatusAction('Active');
                      setShowStatusModal(true);
                    }}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <CheckCircle2 size={14} /> Approve / Reactivate Agency
                  </button>
                )}

                {selectedPartner.status === 'Active' && (
                  <button
                    onClick={() => {
                      setNextStatusAction('Suspended');
                      setShowStatusModal(true);
                    }}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Ban size={14} /> Suspend Franchise
                  </button>
                )}

                <button
                  onClick={() => {
                    setNewSettlementMode(selectedPartner.settlementMode || 'ThroughBusiness');
                    setNewCommissionRate(selectedPartner.commissionRate || '18%');
                    setShowSettlementModal(true);
                  }}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Lock size={14} /> Configure Settlement Mode
                </button>
              </div>

              {/* TAB 1: PROFILE */}
              {drawerTab === 'profile' && (
                <>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Corporate Profile & Authorized Contact Person
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Owner / Managing Director:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPartner.ownerName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Contact Person:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                          {selectedPartner.contactPerson?.name || selectedPartner.ownerName} ({selectedPartner.contactPerson?.designation || 'Director'})
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Primary Mobile:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPartner.phone}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Official Email:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPartner.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage & Categories */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Service Categories & Coverage Zones
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 6 }}>Franchise Categories:</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(selectedPartner.serviceCategories || [selectedPartner.categoryName]).map((cat, i) => (
                          <span key={i} style={{ backgroundColor: '#EDE9FE', color: '#6E42E5', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 6 }}>Covered Service Zones:</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(selectedPartner.coverageZones || [selectedPartner.city]).map((zone, i) => (
                          <span key={i} style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>
                            📍 {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: REGISTRATION & TAX */}
              {drawerTab === 'tax' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  padding: '18px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
                    Statutory Corporate & Tax Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12 }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Entity Constitution:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {selectedPartner.registrationTax?.companyType || selectedPartner.businessType}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Corporate CIN / Reg Deed:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        <code>{selectedPartner.registrationTax?.cinNumber || 'AAQ-8492-MH'}</code>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>GSTIN Number:</span>
                      <div style={{ fontWeight: 600, color: '#16A34A', marginTop: 2 }}>
                        <code>{selectedPartner.gstNumber || selectedPartner.registrationTax?.gstNumber || '27AABCA1234F1Z8'}</code> ✓
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Company PAN Card:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        <code>{selectedPartner.registrationTax?.panNumber || 'AABCA1234F'}</code>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, borderTop: '1px solid #F1F5F9', paddingTop: 12, fontSize: 12 }}>
                    <span style={{ color: '#64748B' }}>Registered Corporate Office:</span>
                    <div style={{ color: '#1E293B', marginTop: 2 }}>
                      {selectedPartner.registrationTax?.registeredAddress || 'Unit 401, Technopolis IT Park, Mumbai 400093'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VERIFICATION DOCUMENTS */}
              {drawerTab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    fontSize: 12,
                    color: '#1E40AF'
                  }}>
                    <strong>Franchise Document Audit:</strong> Every legal certificate requires manual admin verification before dispatches commence.
                  </div>

                  {[
                    { key: 'incorporationCert', title: 'Certificate of Incorporation / Registration Deed' },
                    { key: 'gstCertificate', title: 'GST Registration Certificate (Form REG-06)' },
                    { key: 'companyPan', title: 'Company / Firm PAN Card' },
                    { key: 'franchiseAgreement', title: 'Executed Urban Services Franchise Agreement' }
                  ].map(d => {
                    const docInfo = selectedPartner.verificationDocs?.[d.key] || { status: 'Pending Review' };
                    const isVerified = docInfo.status === 'Verified';

                    return (
                      <div key={d.key} style={{
                        padding: '14px',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        border: isVerified ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 10
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: isVerified ? '#16A34A' : '#D97706', marginTop: 2, fontWeight: 600 }}>
                            {docInfo.status || 'Pending Review'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          {!isVerified ? (
                            <button
                              onClick={() => handleDocVerify(d.key, 'Verified')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: '#16A34A',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDocVerify(d.key, 'Pending Review')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 11,
                                cursor: 'pointer'
                              }}
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const r = prompt('Rejection reason:');
                              if (r) handleDocVerify(d.key, 'Rejected', r);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #FECACA',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: LINKED PROFESSIONALS */}
              {drawerTab === 'pros' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Employed Technician Fleet ({selectedPartner.linkedProfessionals?.length || selectedPartner.techniciansCount || 3})
                  </div>

                  {(selectedPartner.linkedProfessionals || [
                    { id: 'PRO-8841', name: 'Vikram Salvi', phone: '+91 98205 11982', trade: 'Master AC Specialist', status: 'Active' },
                    { id: 'PRO-8842', name: 'Sunil Varma', phone: '+91 98112 00991', trade: 'HVAC Duct Technician', status: 'Active' },
                    { id: 'PRO-8843', name: 'Ramesh Sawant', phone: '+91 98920 44551', trade: 'Appliance Diagnostics', status: 'Active' }
                  ]).map(w => (
                    <div key={w.id} style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{w.id} • {w.trade} • {w.phone}</div>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        backgroundColor: '#DCFCE7',
                        color: '#15803D'
                      }}>
                        {w.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: SETTLEMENT MODE & PAYOUT */}
              {drawerTab === 'settlement' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  padding: '18px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
                    Settlement Mode & Double-Counting Safeguard
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    fontSize: 12,
                    color: '#166534',
                    lineHeight: 1.5,
                    marginBottom: 16
                  }}>
                    <strong>Configured Mode: {selectedPartner.settlementMode || 'ThroughBusiness'}</strong>
                    <br />
                    All gross technician earnings under this agency are aggregated and settled exclusively into the corporate agency account. Individual technician direct platform payouts are disabled to prevent duplicate counting.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12, marginBottom: 14 }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Corporate Bank:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {selectedPartner.settlementAccount?.bankName || 'ICICI Bank Ltd'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Account Number:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {selectedPartner.settlementAccount?.accountNumber || '••••••••9012'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>IFSC Code:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {selectedPartner.settlementAccount?.ifscCode || 'ICIC0000002'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Contract Take-Rate:</span>
                      <div style={{ fontWeight: 600, color: '#6E42E5', marginTop: 2 }}>
                        {selectedPartner.commissionRate || '18%'} Commission
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CONTRACT & NOTES */}
              {drawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    padding: '14px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 12
                  }}>
                    <span style={{ color: '#64748B' }}>Franchise Agreement Reference:</span>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                      {selectedPartner.contractRef?.contractId || 'CTR-2026-APX-01'}
                    </div>
                    <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>
                      SLA Target: {selectedPartner.contractRef?.slaAgreementScore || '99.0% SLA target'}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Internal Operational Notes ({selectedPartner.internalNotes?.length || 0})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                    {(!selectedPartner.internalNotes || selectedPartner.internalNotes.length === 0) ? (
                      <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                        No internal notes recorded for this agency.
                      </div>
                    ) : (
                      selectedPartner.internalNotes.map((nt, idx) => (
                        <div key={idx} style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0'
                        }}>
                          <div style={{ fontSize: 12, color: '#1E293B' }}>{nt.note}</div>
                          <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>By <strong>{nt.author}</strong></span>
                            <span>{new Date(nt.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Add an internal note or franchise SLA comment..."
                      value={newPartnerNote}
                      onChange={e => setNewPartnerNote(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Save Note
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REGISTER NEW AGENCY MODAL                                 */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 580,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Register Business Partner Franchise Agency
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setIsCreateOpen(false)} />
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Care Services LLP"
                    value={newPartner.businessName}
                    onChange={e => setNewPartner(prev => ({ ...prev, businessName: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Managing Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandeep Patil"
                    value={newPartner.ownerName}
                    onChange={e => setNewPartner(prev => ({ ...prev, ownerName: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98210 33411"
                    value={newPartner.phone}
                    onChange={e => setNewPartner(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Corporate Email</label>
                  <input
                    type="email"
                    placeholder="contact@agency.com"
                    value={newPartner.email}
                    onChange={e => setNewPartner(prev => ({ ...prev, email: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>City</label>
                  <select
                    value={newPartner.city}
                    onChange={e => setNewPartner(prev => ({ ...prev, city: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Krishnagiri">Krishnagiri</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Fleet Size (Technicians)</label>
                  <input
                    type="number"
                    value={newPartner.techniciansCount}
                    onChange={e => setNewPartner(prev => ({ ...prev, techniciansCount: parseInt(e.target.value) || 10 }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCA1234F1Z8"
                  value={newPartner.gstNumber}
                  onChange={e => setNewPartner(prev => ({ ...prev, gstNumber: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SETTLEMENT MODE MODAL (DOUBLE-COUNTING PREVENTION)        */}
      {/* ======================================================== */}
      {showSettlementModal && selectedPartner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              Configure Settlement Mode & Payroll Routing
            </h3>

            <form onSubmit={handleSettlementModeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Payout Disbursement Routing:
                </label>
                <select
                  value={newSettlementMode}
                  onChange={e => setNewSettlementMode(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="ThroughBusiness">ThroughBusiness (Agency Receives Lump-Sum; Payroll Settles Pros)</option>
                  <option value="IndividualPro">IndividualPro (Platform Settles Each Technician Directly)</option>
                </select>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 4 }}>
                  Prevents duplicate accounting between agency settlements and individual technician bank accounts.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Platform Commission / Take-Rate:
                </label>
                <input
                  type="text"
                  value={newCommissionRate}
                  onChange={e => setNewCommissionRate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Apply Settlement Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATUS CHANGE MODAL                                       */}
      {/* ======================================================== */}
      {showStatusModal && selectedPartner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: nextStatusAction === 'Active' ? '#16A34A' : '#DC2626', margin: '0 0 14px 0' }}>
              {nextStatusAction === 'Active' ? 'Approve / Reactivate Agency Partner' : 'Suspend Agency Franchise'}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Mandatory Audit Reason:
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: nextStatusAction === 'Active' ? '#16A34A' : '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm {nextStatusAction}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
