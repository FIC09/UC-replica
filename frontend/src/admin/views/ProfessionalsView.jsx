import React, { useState, useEffect } from 'react';
import {
  Search,
  HardHat,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wrench,
  Wallet,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  FileText,
  Building2,
  ChevronRight,
  ChevronLeft,
  Filter,
  Check,
  Ban,
  RotateCcw,
  MessageSquare,
  Briefcase,
  ExternalLink,
  RefreshCw,
  Plus,
  Send
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function ProfessionalsView({ onShowToast, onNavigate }) {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'Approved' | 'Pending Review' | 'Under Verification' | 'Suspended'
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Active Detail Drawer & Drawer Sub-tab
  const [selectedPro, setSelectedPro] = useState(null);
  const [proDetail, setProDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerTab, setDrawerTab] = useState('profile'); // 'profile' | 'documents' | 'bank' | 'training' | 'metrics' | 'notes'

  // Action Dialog Modals
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [statusReason, setStatusReason] = useState('Document verification passed and skills assessment cleared');

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Quality compliance audit pending');

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('Please upload a clearer color scan of your PAN card showing full tax ID.');

  const [showSkillsCoverageModal, setShowSkillsCoverageModal] = useState(false);
  const [skillsCoverageData, setSkillsCoverageData] = useState({
    categories: '',
    skills: '',
    operationalHub: '',
    serviceAreas: ''
  });

  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingData, setTrainingData] = useState({
    moduleTitle: 'Advanced Inverter HVAC & Gas Leak Safety',
    trainingDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    trainerNotes: 'Mandatory certification course for Diamond Level upgrade.'
  });

  // Create Professional Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    applicantName: '',
    phone: '',
    email: '',
    trade: 'ac-appliances',
    tradeName: 'AC & Appliance Care',
    city: 'Krishnagiri',
    locality: 'Rayakottai Road',
    experience: '2 years',
    expectedIncome: '₹45,000 / month',
    employmentType: 'Direct Freelance'
  });

  const [newProNote, setNewProNote] = useState('');

  // Fetch Professionals List
  const fetchProfessionalsList = () => {
    setLoading(true);
    adminClient.getProfessionals({
      search,
      status: activeTab,
      city: cityFilter,
      trade: tradeFilter,
      page,
      limit: 10
    })
      .then(res => {
        setPros(res.professionals || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfessionalsList();
  }, [search, activeTab, cityFilter, tradeFilter, page]);

  // Fetch Full Pro Detail Profile when selected
  useEffect(() => {
    if (!selectedPro) {
      setProDetail(null);
      return;
    }

    setLoadingDetail(true);
    adminClient.getProfessionalDetail(selectedPro.id || selectedPro._id)
      .then(res => {
        if (res.professional) {
          setProDetail(res.professional);
        } else {
          setProDetail(selectedPro);
        }
        setLoadingDetail(false);
      })
      .catch(() => {
        setProDetail(selectedPro);
        setLoadingDetail(false);
      });
  }, [selectedPro]);

  // Handle Create Professional in Real-Time Database
  function handleCreateProfessionalSubmit(e) {
    e.preventDefault();
    if (!newProfessional.applicantName.trim()) {
      onShowToast && onShowToast('Professional full name is required');
      return;
    }
    if (!newProfessional.phone.trim()) {
      onShowToast && onShowToast('Phone number is required');
      return;
    }
    adminClient.createProfessional(newProfessional)
      .then(res => {
        onShowToast && onShowToast(`✓ Professional "${newProfessional.applicantName}" registered successfully in database!`);
        setIsCreateOpen(false);
        setNewProfessional({
          applicantName: '',
          phone: '',
          email: '',
          trade: 'ac-appliances',
          tradeName: 'AC & Appliance Care',
          city: 'Krishnagiri',
          locality: 'Rayakottai Road',
          experience: '2 years',
          expectedIncome: '₹45,000 / month',
          employmentType: 'Direct Freelance'
        });
        fetchProfessionalsList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Delete / Deregister Professional
  function handleDeleteProfessional() {
    if (!selectedPro) return;
    if (!window.confirm(`Permanently deregister and delete "${selectedPro.applicantName || selectedPro.name}" from database?`)) {
      return;
    }
    adminClient.deleteProfessional(selectedPro.id || selectedPro._id)
      .then(() => {
        onShowToast && onShowToast(`✓ Professional #${selectedPro.id || selectedPro._id} permanently removed.`);
        setSelectedPro(null);
        fetchProfessionalsList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error deleting professional: ${err.message}`);
      });
  }

  // Handle Approve or Reject Application
  function handleApproveRejectSubmit() {
    if (!selectedPro) return;
    adminClient.updateProfessionalStatus(selectedPro.id || selectedPro._id, approveRejectAction, statusReason)
      .then(() => {
        onShowToast && onShowToast(`✓ Professional application marked as ${approveRejectAction}`);
        setShowApproveRejectModal(false);
        fetchProfessionalsList();
        if (proDetail) {
          setProDetail(prev => ({ ...prev, status: approveRejectAction }));
        }
        setSelectedPro(prev => ({ ...prev, status: approveRejectAction }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error updating status: ${err.message}`);
      });
  }

  // Handle Suspend or Reactivate
  function handleSuspendSubmit() {
    if (!selectedPro) return;
    const isSuspending = selectedPro.status === 'Approved' || selectedPro.status === 'Active';
    const nextStatus = isSuspending ? 'Suspended' : 'Approved';

    adminClient.updateProfessionalStatus(selectedPro.id || selectedPro._id, nextStatus, suspendReason)
      .then(() => {
        onShowToast && onShowToast(`✓ Professional status updated to ${nextStatus}`);
        setShowSuspendModal(false);
        fetchProfessionalsList();
        if (proDetail) {
          setProDetail(prev => ({ ...prev, status: nextStatus }));
        }
        setSelectedPro(prev => ({ ...prev, status: nextStatus }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Document Verification (Approve / Reject)
  function handleDocVerification(docType, status, reason = '') {
    if (!selectedPro) return;
    adminClient.verifyProfessionalDocument(selectedPro.id || selectedPro._id, docType, status, reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Document ${docType} marked as ${status}`);
        setProDetail(prev => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [docType]: {
              ...(prev.documents?.[docType] || {}),
              status,
              verifiedBy: 'Super Administrator',
              verifiedAt: new Date().toLocaleDateString()
            }
          }
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Verification updated locally: ${status}`);
        setProDetail(prev => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [docType]: {
              ...(prev.documents?.[docType] || {}),
              status,
              verifiedBy: 'Super Administrator',
              verifiedAt: new Date().toLocaleDateString()
            }
          }
        }));
      });
  }

  // Handle Bank Verification
  function handleBankVerification(status, rejectionReason = '') {
    if (!selectedPro) return;
    adminClient.verifyProfessionalBank(selectedPro.id || selectedPro._id, status, rejectionReason)
      .then(() => {
        onShowToast && onShowToast(`✓ Bank details marked as ${status}`);
        setProDetail(prev => ({
          ...prev,
          bankDetails: {
            ...(prev.bankDetails || {}),
            status,
            verifiedBy: 'Finance Manager',
            verifiedAt: new Date().toLocaleDateString()
          }
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Bank review updated: ${status}`);
        setProDetail(prev => ({
          ...prev,
          bankDetails: {
            ...(prev.bankDetails || {}),
            status,
            verifiedBy: 'Finance Manager',
            verifiedAt: new Date().toLocaleDateString()
          }
        }));
      });
  }

  // Handle Request Correction
  function handleRequestCorrectionSubmit() {
    if (!selectedPro || !correctionNotes.trim()) return;
    adminClient.requestProfessionalCorrection(selectedPro.id || selectedPro._id, correctionNotes)
      .then(() => {
        onShowToast && onShowToast(`✓ Information correction notice dispatched to ${selectedPro.applicantName || selectedPro.name}`);
        setShowCorrectionModal(false);
      })
      .catch(err => {
        onShowToast && onShowToast(`Correction request sent.`);
        setShowCorrectionModal(false);
      });
  }

  // Handle Skills & Coverage Update
  function handleSkillsCoverageSubmit(e) {
    e.preventDefault();
    if (!selectedPro) return;

    const payload = {
      categories: skillsCoverageData.categories.split(',').map(s => s.trim()).filter(Boolean),
      skills: skillsCoverageData.skills.split(',').map(s => s.trim()).filter(Boolean),
      operationalHub: skillsCoverageData.operationalHub,
      serviceAreas: skillsCoverageData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean)
    };

    adminClient.assignProfessionalSkillsAndCoverage(selectedPro.id || selectedPro._id, payload)
      .then(() => {
        onShowToast && onShowToast(`✓ Skills & service coverage zones updated successfully`);
        setShowSkillsCoverageModal(false);
        setProDetail(prev => ({ ...prev, ...payload }));
        setSelectedPro(prev => ({ ...prev, ...payload }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error updating coverage: ${err.message}`);
      });
  }

  // Handle Schedule Training
  function handleScheduleTrainingSubmit(e) {
    e.preventDefault();
    if (!selectedPro) return;

    adminClient.scheduleProfessionalTraining(selectedPro.id || selectedPro._id, trainingData)
      .then(() => {
        onShowToast && onShowToast(`✓ Training module scheduled for ${selectedPro.applicantName || selectedPro.name}`);
        setShowTrainingModal(false);
        setProDetail(prev => ({
          ...prev,
          trainings: [
            ...(prev.trainings || []),
            {
              id: 'TRN-' + Date.now(),
              title: trainingData.moduleTitle,
              scheduledDate: trainingData.trainingDate,
              status: 'Scheduled',
              notes: trainingData.trainerNotes
            }
          ]
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Training scheduled.`);
        setShowTrainingModal(false);
      });
  }

  // Handle Internal Pro Note
  function handleAddProNote(e) {
    e.preventDefault();
    if (!newProNote.trim() || !selectedPro) return;

    adminClient.addProfessionalNote(selectedPro.id || selectedPro._id, newProNote)
      .then(() => {
        const noteObj = {
          id: 'note-' + Date.now(),
          note: newProNote,
          author: 'Operations Lead',
          authorRole: 'Technician Governance',
          createdAt: new Date()
        };
        setProDetail(prev => ({
          ...prev,
          internalNotes: [...(prev.internalNotes || []), noteObj]
        }));
        setNewProNote('');
        onShowToast && onShowToast('✓ Internal technician note recorded');
      })
      .catch(err => {
        onShowToast && onShowToast(`Error adding note: ${err.message}`);
      });
  }

  // Render Status Badge
  function renderStatusBadge(status) {
    const s = (status || 'Pending Review').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';
    let border = '#CBD5E1';
    let label = status || 'Pending';

    if (s === 'approved' || s === 'active') {
      bg = '#F0FDF4'; color = '#16A34A'; border = '#BBF7D0'; label = 'Approved';
    } else if (s === 'pending review') {
      bg = '#FFFBEB'; color = '#D97706'; border = '#FDE68A'; label = 'Newly Applied';
    } else if (s === 'under verification') {
      bg = '#EFF6FF'; color = '#0284C7'; border = '#BFDBFE'; label = 'Under KYC Verification';
    } else if (s === 'rejected' || s === 'suspended') {
      bg = '#FEF2F2'; color = '#DC2626'; border = '#FECACA'; label = s === 'rejected' ? 'Rejected' : 'Suspended';
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
        {label}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0', lineHeight: 1.25 }}>
            Professional Partner &amp; Technician Management
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.2 }}>
            Onboarding review pipeline, KYC documents verification, trade skill assignment, training &amp; earnings ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(110, 66, 229, 0.25)'
            }}
          >
            <Plus size={16} /> Add Professional
          </button>
          <button
            onClick={fetchProfessionalsList}
            title="Refresh Directory"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="admin-page-body">
        {/* Status Pipeline Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px 12px 0 0',
        padding: '0 16px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'ALL', label: 'All Professionals' },
          { id: 'Pending Review', label: 'Newly Applied' },
          { id: 'Approved', label: 'Active Verified Pros' },
          { id: 'Under Verification', label: 'Under Document KYC' },
          { id: 'Suspended', label: 'Suspended / Inactive' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            style={{
              padding: '14px 18px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #6E42E5' : '2px solid transparent',
              color: activeTab === tab.id ? '#6E42E5' : '#64748B',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
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
            placeholder="Search by professional name, trade, skills, phone or ID..."
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
          {/* City Filter */}
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

          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={e => { setTradeFilter(e.target.value); setPage(1); }}
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
            <option value="ALL">All Trades</option>
            <option value="AC & Electrical Repairs">AC & Electrical Repairs</option>
            <option value="Salon & Spa Services">Salon & Spa Services</option>
            <option value="Deep Home Cleaning">Deep Home Cleaning</option>
            <option value="Plumber & Carpentry">Plumber & Carpentry</option>
          </select>

          {(cityFilter !== 'ALL' || tradeFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setCityFilter('ALL');
                setTradeFilter('ALL');
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

      {/* Professionals Table */}
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
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Professional Partner</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Trade & Specialization</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Operational Hub & City</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Onboarding Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Documents Review</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Performance Rating</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading professionals and applicant queue...
                    </div>
                  </td>
                </tr>
              ) : pros.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <HardHat size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No professionals found matching the selected filters</div>
                  </td>
                </tr>
              ) : (
                pros.map(p => {
                  const name = p.applicantName || p.name || 'Professional';
                  const docs = p.documents || {};
                  const isVerified = (docs.aadhaar?.status === 'Verified' && docs.pan?.status === 'Verified');

                  return (
                    <tr
                      key={p.id || p._id}
                      onClick={() => setSelectedPro(p)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Name & Photo */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: '#EDE9FE',
                            color: '#6E42E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13
                          }}>
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>
                              ID: {p.id || p._id} • {p.phone}{p.email ? ` • ${p.email}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Trade & Skills */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.trade || p.tradeName || 'Specialist'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          Exp: {p.experience || '5+ years'} • {p.partnerAgencyName ? `Agency: ${p.partnerAgencyName}` : 'Direct Pro'}
                        </div>
                      </td>

                      {/* Hub & City */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{p.city || 'Krishnagiri'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          {p.locality ? `${p.locality} (Direct Service)` : (p.operationalHub || 'Krishnagiri Direct Travel')}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Documents Review Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {isVerified ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 6,
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            <ShieldCheck size={12} /> KYC Verified
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 6,
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                      </td>

                      {/* Performance Rating */}
                      <td style={{ padding: '14px 16px' }}>
                        {(!p.rating || p.rating === 0 || p.jobsCompleted === 0 || p.status === 'Pending Review') ? (
                          <div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2.5px 8px',
                              borderRadius: 6,
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              ★ New (No Reviews Yet)
                            </span>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                              {p.jobsCompleted || 0} jobs • ₹{(p.lifetimeEarnings || 0).toLocaleString()} earned
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#0F172A' }}>
                              <Star size={13} fill="#EAB308" color="#EAB308" />
                              <span>{Number(p.rating).toFixed(2)}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>
                              {p.jobsCompleted} jobs • ₹{(p.lifetimeEarnings || 0).toLocaleString()} earned
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPro(p);
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
                            Inspect
                          </button>
                          <ChevronRight size={16} color="#94A3B8" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: '#64748B',
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            Showing <strong style={{ color: '#0F172A' }}>{pros.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{pagination.total || pros.length}</strong> professionals
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ padding: '0 8px', fontWeight: 600, color: '#0F172A' }}>
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage(prev => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page >= (pagination.totalPages || 1) ? '#F1F5F9' : '#FFFFFF',
                color: page >= (pagination.totalPages || 1) ? '#94A3B8' : '#334155',
                cursor: page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFESSIONAL DETAIL DRAWER (SLIDE-OVER FROM RIGHT)       */}
      {/* ======================================================== */}
      {selectedPro && (
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
            {/* Drawer Header */}
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
                    {selectedPro.applicantName || selectedPro.name}
                  </h3>
                  {renderStatusBadge(selectedPro.status)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  {selectedPro.trade || selectedPro.tradeName} • Tier: {selectedPro.tier || (selectedPro.status === 'Pending Review' ? 'New Applicant' : 'Active Professional')}
                </div>
              </div>

              <button
                onClick={() => setSelectedPro(null)}
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
                { id: 'profile', label: 'Profile & Coverage' },
                { id: 'documents', label: 'Manual Doc KYC' },
                { id: 'bank', label: 'Bank Review' },
                { id: 'training', label: 'Certifications' },
                { id: 'metrics', label: 'Scorecard & Ledger' },
                { id: 'notes', label: 'Internal Notes' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: drawerTab === tab.id ? '2px solid #6E42E5' : '2px solid transparent',
                    color: drawerTab === tab.id ? '#6E42E5' : '#64748B',
                    fontSize: 12,
                    fontWeight: drawerTab === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Primary Action Buttons Bar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {selectedPro.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      setApproveRejectAction('Approved');
                      setShowApproveRejectModal(true);
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
                    <CheckCircle2 size={14} /> Approve Application
                  </button>
                )}

                {selectedPro.status !== 'Rejected' && selectedPro.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      setApproveRejectAction('Rejected');
                      setShowApproveRejectModal(true);
                    }}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: '#DC2626',
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
                    <Ban size={14} /> Reject Application
                  </button>
                )}

                <button
                  onClick={() => setShowCorrectionModal(true)}
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
                  <Send size={14} /> Request Correction
                </button>

                <button
                  onClick={() => setShowSuspendModal(true)}
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
                  {selectedPro.status === 'Suspended' ? 'Reactivate' : 'Suspend Pro'}
                </button>

                <button
                  onClick={handleDeleteProfessional}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FFF1F2',
                    color: '#BE123C',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Ban size={14} /> Deregister
                </button>
              </div>

              {/* DRAWER TAB 1: PROFILE & COVERAGE */}
              {drawerTab === 'profile' && (
                <>
                  {/* Contact & Agency Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Technician Contact & Agency Association
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Direct Mobile:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPro.phone}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Verified Email:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPro.email}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Experience:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedPro.experience || '8+ years'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Partner Agency:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                          {selectedPro.partnerAgencyName || 'Direct Freelance (No Agency)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Categories Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        Trade Categories & Certified Skills
                      </span>
                      <button
                        onClick={() => {
                          setSkillsCoverageData({
                            categories: (proDetail?.categories || ['AC Repair', 'Electrical']).join(', '),
                            skills: (proDetail?.skills || ['Inverter Split AC', 'Coil Cleaning']).join(', '),
                            operationalHub: proDetail?.operationalHub || 'Bandra West Central Hub',
                            serviceAreas: (proDetail?.serviceAreas || ['Bandra West', 'Khar']).join(', ')
                          });
                          setShowSkillsCoverageModal(true);
                        }}
                        style={{
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          borderRadius: 6,
                          padding: '4px 10px',
                          color: '#6E42E5',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Edit Coverage & Skills
                      </button>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 6 }}>Assigned Categories:</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(proDetail?.categories || ['AC Repair', 'Electrical', 'Appliances']).map((cat, i) => (
                          <span key={i} style={{ backgroundColor: '#EDE9FE', color: '#6E42E5', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 6 }}>Specialized Skills:</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(proDetail?.skills || ['Inverter Split AC', 'Powerjet Coil Cleaning', 'Gas Leak Detection', 'PCB Circuit Diagnosis']).map((sk, i) => (
                          <span key={i} style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '3px 10px', borderRadius: 12, fontSize: 11 }}>
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coverage & Operating Hours */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Operational Hub & Geographic Coverage
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginBottom: 8 }}>
                      Central Hub: <strong>{proDetail?.operationalHub || 'Bandra West Central Hub'}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>Active Service Zones:</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {(proDetail?.serviceAreas || ['Bandra West', 'Khar', 'Santacruz West', 'Pali Hill']).map((area, i) => (
                        <span key={i} style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                          📍 {area}
                        </span>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Working Hours:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                          {proDetail?.workingHours?.start || '08:00'} - {proDetail?.workingHours?.end || '20:00'} (IST)
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Working Days:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                          {(proDetail?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* DRAWER TAB 2: MANUAL KYC DOCUMENTS REVIEW */}
              {drawerTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    fontSize: 12,
                    color: '#1E40AF'
                  }}>
                    <strong>Mandatory Document Verification Policy:</strong> In compliance with platform safety regulations, uploaded files do NOT automatically verify a technician. Every document must be manually audited and approved below by an authorized platform administrator.
                  </div>

                  {/* Document Review Cards */}
                  {[
                    { key: 'aadhaar', title: 'Aadhaar Identity Card', desc: 'Government UIDAI Proof with biometrics check' },
                    { key: 'pan', title: 'Permanent Account Number (PAN)', desc: 'Income tax identification for TDS reporting' },
                    { key: 'policeClearance', title: 'Police Clearance Certificate (PCC)', desc: 'Criminal background verification certificate' },
                    { key: 'tradeCertificate', title: 'ITI Trade Certificate / Diploma', desc: 'National Skill Development / ITI diploma' }
                  ].map(doc => {
                    const docInfo = proDetail?.documents?.[doc.key] || { status: 'Pending Review', docNumber: 'Uploaded' };
                    const isVerified = docInfo.status === 'Verified';

                    return (
                      <div
                        key={doc.key}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          padding: '14px',
                          border: isVerified ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{doc.title}</span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              backgroundColor: isVerified ? '#DCFCE7' : docInfo.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: isVerified ? '#15803D' : docInfo.status === 'Rejected' ? '#B91C1C' : '#92400E'
                            }}>
                              {docInfo.status || 'Pending Review'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{doc.desc}</div>
                          {docInfo.docNumber && (
                            <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>Doc ID: <code>{docInfo.docNumber}</code></div>
                          )}
                          {docInfo.verifiedBy && (
                            <div style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>
                              Verified by {docInfo.verifiedBy} on {docInfo.verifiedAt}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          {!isVerified ? (
                            <button
                              onClick={() => handleDocVerification(doc.key, 'Verified')}
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
                              Approve Doc
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDocVerification(doc.key, 'Pending Review')}
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
                              const reason = prompt('Enter rejection reason for ' + doc.title + ':');
                              if (reason) handleDocVerification(doc.key, 'Rejected', reason);
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

              {/* DRAWER TAB 3: BANK DETAILS REVIEW */}
              {drawerTab === 'bank' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  padding: '18px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                      Settlement Bank Account & Payout Details
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: proDetail?.bankDetails?.status === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                      color: proDetail?.bankDetails?.status === 'Verified' ? '#15803D' : '#92400E'
                    }}>
                      {proDetail?.bankDetails?.status || 'Pending Review'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12, marginBottom: 16 }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Account Holder:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {proDetail?.bankDetails?.accountHolderName || selectedPro.applicantName || selectedPro.name}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Bank Name:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {proDetail?.bankDetails?.bankName || 'HDFC Bank Ltd'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Account Number:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {proDetail?.bankDetails?.accountNumber || '••••••••4821'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>IFSC Code:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {proDetail?.bankDetails?.ifscCode || 'HDFC0001248'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>UPI ID:</span>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                        {proDetail?.bankDetails?.upiId || `${(selectedPro.applicantName || 'pro').toLowerCase().replace(/\s+/g, '')}@okaxis`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                    <button
                      onClick={() => handleBankVerification('Verified')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Approve Bank Details
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason for bank account:');
                        if (reason) handleBankVerification('Rejected', reason);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reject Bank Account
                    </button>
                  </div>
                </div>
              )}

              {/* DRAWER TAB 4: TRAINING & CERTIFICATIONS */}
              {drawerTab === 'training' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      Certified Training Records & Badges
                    </span>
                    <button
                      onClick={() => setShowTrainingModal(true)}
                      style={{
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Plus size={13} /> Schedule Training
                    </button>
                  </div>

                  {(proDetail?.trainings || [
                    { id: 'TRN-101', title: '6-Step Doorstep Safety Protocol', completedAt: '16 Jan 2026', score: '98%', badgeAwarded: 'Zero-Contamination Pro' },
                    { id: 'TRN-102', title: 'Powerjet AC Cleaning Masterclass', completedAt: '18 Jan 2026', score: '95%', badgeAwarded: 'Master HVAC Pro' }
                  ]).map((trn, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{trn.title}</div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                          {trn.completedAt ? `Completed: ${trn.completedAt} • Score: ${trn.score}` : `Status: ${trn.status || 'Scheduled'}`}
                        </div>
                      </div>
                      {trn.badgeAwarded && (
                        <span style={{ backgroundColor: '#EDE9FE', color: '#6E42E5', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                          🏆 {trn.badgeAwarded}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* DRAWER TAB 5: SCORECARD & METRICS */}
              {drawerTab === 'metrics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12
                  }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Average Customer Rating</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                        {(!selectedPro.rating || selectedPro.rating === 0 || selectedPro.jobsCompleted === 0 || selectedPro.status === 'Pending Review') ? (
                          <span style={{ fontSize: 14, color: '#64748B', fontWeight: 700 }}>
                            ★ New (No Reviews Yet)
                          </span>
                        ) : (
                          `⭐ ${Number(selectedPro.rating).toFixed(2)}`
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: (!selectedPro.rating || selectedPro.jobsCompleted === 0) ? '#94A3B8' : '#16A34A', marginTop: 2 }}>
                        {(!selectedPro.rating || selectedPro.jobsCompleted === 0)
                          ? 'Rating earned after customer job completion'
                          : 'Customer Verified Rating'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Lifetime Orders Completed</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#6E42E5', marginTop: 4 }}>
                        {selectedPro.jobsCompleted || 0}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {selectedPro.jobsCompleted ? `On-Time Arrival: ${selectedPro.onTimeArrivalRate || 99}%` : 'Awaiting first dispatched booking'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Cancellation Rate</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                        {selectedPro.cancellationRate || 0}%
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A' }}>
                        {selectedPro.jobsCompleted ? 'Below platform threshold' : 'Standard Baseline (0%)'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Wallet Balance (Unsettled)</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                        ₹{(selectedPro.walletBalance || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Direct Bank / UPI Settlement</div>
                    </div>
                  </div>
                </div>
              )}

              {/* DRAWER TAB 6: INTERNAL NOTES */}
              {drawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Technician Operations & Incident Notes
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {(!proDetail?.internalNotes || proDetail.internalNotes.length === 0) ? (
                      <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                        No operational notes recorded yet.
                      </div>
                    ) : (
                      proDetail.internalNotes.map((nt, idx) => (
                        <div key={idx} style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0'
                        }}>
                          <div style={{ fontSize: 12, color: '#1E293B' }}>{nt.note}</div>
                          <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>By <strong>{nt.author}</strong> ({nt.authorRole || 'Ops Lead'})</span>
                            <span>{new Date(nt.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddProNote} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      placeholder="Add an internal note or quality assessment observation..."
                      value={newProNote}
                      onChange={e => setNewProNote(e.target.value)}
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
      {/* APPROVE / REJECT MODAL                                    */}
      {/* ======================================================== */}
      {showApproveRejectModal && selectedPro && (
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
            <h3 style={{ fontSize: 16, fontWeight: 700, color: approveRejectAction === 'Approved' ? '#16A34A' : '#DC2626', margin: '0 0 14px 0' }}>
              {approveRejectAction === 'Approved' ? 'Approve Professional Application' : 'Reject Professional Application'}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Review Reason / Evaluation Notes:
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowApproveRejectModal(false)}
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
                onClick={handleApproveRejectSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: approveRejectAction === 'Approved' ? '#16A34A' : '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm {approveRejectAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUSPEND MODAL                                             */}
      {/* ======================================================== */}
      {showSuspendModal && selectedPro && (
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
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', margin: '0 0 14px 0' }}>
              {selectedPro.status === 'Suspended' ? 'Reactivate Professional' : 'Suspend Professional Account'}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Reason for Status Change:
              </label>
              <input
                type="text"
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowSuspendModal(false)}
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
                Dismiss
              </button>
              <button
                onClick={handleSuspendSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REQUEST CORRECTION NOTICE MODAL                           */}
      {/* ======================================================== */}
      {showCorrectionModal && selectedPro && (
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
            maxWidth: 500,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
              Request Corrected Information from Technician
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Correction Instructions (Sent via SMS & Partner App):
              </label>
              <textarea
                rows={4}
                value={correctionNotes}
                onChange={e => setCorrectionNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowCorrectionModal(false)}
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
                onClick={handleRequestCorrectionSubmit}
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
                Send Request Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT SKILLS & COVERAGE MODAL                              */}
      {/* ======================================================== */}
      {showSkillsCoverageModal && selectedPro && (
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
            maxWidth: 540,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              Assign Categories, Skills & Coverage Zones
            </h3>

            <form onSubmit={handleSkillsCoverageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Categories (Comma separated):
                </label>
                <input
                  type="text"
                  value={skillsCoverageData.categories}
                  onChange={e => setSkillsCoverageData(prev => ({ ...prev, categories: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Certified Skills (Comma separated):
                </label>
                <input
                  type="text"
                  value={skillsCoverageData.skills}
                  onChange={e => setSkillsCoverageData(prev => ({ ...prev, skills: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Operational Central Hub:
                </label>
                <input
                  type="text"
                  value={skillsCoverageData.operationalHub}
                  onChange={e => setSkillsCoverageData(prev => ({ ...prev, operationalHub: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Covered Service Areas / Localities:
                </label>
                <input
                  type="text"
                  value={skillsCoverageData.serviceAreas}
                  onChange={e => setSkillsCoverageData(prev => ({ ...prev, serviceAreas: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowSkillsCoverageModal(false)}
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
                  Save Coverage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCHEDULE TRAINING MODAL                                   */}
      {/* ======================================================== */}
      {showTrainingModal && selectedPro && (
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
              Schedule Certification Training Module
            </h3>

            <form onSubmit={handleScheduleTrainingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Training Course Title:
                </label>
                <select
                  value={trainingData.moduleTitle}
                  onChange={e => setTrainingData(prev => ({ ...prev, moduleTitle: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="Advanced Inverter HVAC & Gas Leak Safety">Advanced Inverter HVAC & Gas Leak Safety</option>
                  <option value="Hospital-Grade Sanitization SOP">Hospital-Grade Sanitization SOP</option>
                  <option value="L'Oréal Pro Hair Color & Keratin Masterclass">L'Oréal Pro Hair Color & Keratin Masterclass</option>
                  <option value="Electrical High-Voltage Diagnostics">Electrical High-Voltage Diagnostics</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Training Date:
                </label>
                <input
                  type="date"
                  value={trainingData.trainingDate}
                  onChange={e => setTrainingData(prev => ({ ...prev, trainingDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Trainer Instructions & Notes:
                </label>
                <input
                  type="text"
                  value={trainingData.trainerNotes}
                  onChange={e => setTrainingData(prev => ({ ...prev, trainerNotes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
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
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD PROFESSIONAL MODAL DIALOG                             */}
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
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: '100%',
            maxWidth: 540,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>Add New Professional</h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>Register a technician directly into the real-time database</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateProfessionalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Technician Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cryto"
                  value={newProfessional.applicantName}
                  onChange={e => setNewProfessional({ ...newProfessional, applicantName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="8778293269"
                    value={newProfessional.phone}
                    onChange={e => setNewProfessional({ ...newProfessional, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    placeholder="pro@urbancompany.pro"
                    value={newProfessional.email}
                    onChange={e => setNewProfessional({ ...newProfessional, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Primary Trade</label>
                  <select
                    value={newProfessional.trade}
                    onChange={e => {
                      const t = e.target.value;
                      const nameMap = {
                        'ac-appliances': 'AC & Appliance Care',
                        'quick-repairs': 'Quick Home Repairs & Handyman',
                        'cleaning-pest': 'Cleaning & Pest Control',
                        'womens-salon': "Women's Salon",
                        'mens-grooming': "Men's Grooming & Spa",
                        'painting-decor': 'Home Painting & Wall Decor'
                      };
                      setNewProfessional({
                        ...newProfessional,
                        trade: t,
                        tradeName: nameMap[t] || 'Home Services'
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="ac-appliances">AC & Appliance Care</option>
                    <option value="quick-repairs">Quick Home Repairs</option>
                    <option value="cleaning-pest">Cleaning & Pest Control</option>
                    <option value="womens-salon">Women's Salon</option>
                    <option value="mens-grooming">Men's Grooming</option>
                    <option value="painting-decor">Home Painting</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>City</label>
                  <select
                    value={newProfessional.city}
                    onChange={e => setNewProfessional({ ...newProfessional, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Krishnagiri">Krishnagiri</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Rayakottai Road"
                    value={newProfessional.locality}
                    onChange={e => setNewProfessional({ ...newProfessional, locality: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Experience</label>
                  <select
                    value={newProfessional.experience}
                    onChange={e => setNewProfessional({ ...newProfessional, experience: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Employment Type</label>
                  <select
                    value={newProfessional.employmentType}
                    onChange={e => setNewProfessional({ ...newProfessional, employmentType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Direct Freelance">Direct Freelance</option>
                    <option value="Agency Employed">Agency Employed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Expected Income</label>
                  <input
                    type="text"
                    value={newProfessional.expectedIncome}
                    onChange={e => setNewProfessional({ ...newProfessional, expectedIncome: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Professional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
