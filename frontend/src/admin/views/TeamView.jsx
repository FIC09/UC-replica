import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Key, 
  X, 
  RefreshCw, 
  AlertTriangle,
  UserCheck,
  Check,
  Building,
  MapPin
} from 'lucide-react';
import { adminClient } from '../adminClient';

const ROLES_LIST = [
  'Super Admin',
  'Operations Manager',
  'Support Agent',
  'Finance Manager',
  'Catalogue Manager',
  'Read-only Analyst'
];

export function TeamView({ onShowToast }) {
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [permissionMatrix, setPermissionMatrix] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [targetMember, setTargetMember] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Security credential rotation');
  const [revoking, setRevoking] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operations Manager',
    assignedZone: 'All India',
    department: 'Operations'
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    loadTeam();
    loadPermissions();
  }, []);

  function loadTeam() {
    adminClient.getTeam()
      .then(res => setTeam(res.team || []))
      .catch(() => {});
  }

  function loadPermissions() {
    adminClient.getPermissionMatrix()
      .then(res => {
        if (res.matrix) setPermissionMatrix(res.matrix);
      })
      .catch(() => {});
  }

  const filtered = team.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function handleInvite(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    adminClient.inviteTeamMember(formData)
      .then(res => {
        if (res.member) {
          setTeam(prev => [res.member, ...prev]);
        }
        if (res.temporaryCredentials) {
          setCreatedCredentials(res.temporaryCredentials);
        } else {
          setShowInviteModal(false);
          setFormData({ name: '', email: '', role: 'Operations Manager', assignedZone: 'All India', department: 'Operations' });
        }
        if (onShowToast) onShowToast(`Invitation created for ${formData.email}`);
      })
      .catch(err => {
        if (onShowToast) onShowToast(`Failed: ${err.message}`);
      });
  }

  function handleToggleStatus(member) {
    const nextStatus = member.status === 'Active' ? 'Suspended' : 'Active';
    const reason = nextStatus === 'Suspended' 
      ? prompt(`Enter reason for deactivating account ${member.name}:`, 'Administrative review') 
      : 'Account reactivated';

    if (nextStatus === 'Suspended' && reason === null) return; // User cancelled prompt

    adminClient.updateTeamMemberStatus(member.id || member._id, nextStatus, member.role)
      .then(() => {
        setTeam(prev => prev.map(m => (m.id === member.id || m._id === member._id) ? { ...m, status: nextStatus } : m));
        if (onShowToast) onShowToast(`${member.name} status updated to ${nextStatus}`);
      })
      .catch(err => {
        if (onShowToast) onShowToast(`Error: ${err.message}`);
      });
  }

  function confirmRevokeSessions() {
    if (!targetMember) return;
    setRevoking(true);
    adminClient.revokeTeamMemberSessions(targetMember.id || targetMember._id, revokeReason)
      .then(res => {
        setRevoking(false);
        setShowRevokeModal(false);
        setTargetMember(null);
        if (onShowToast) onShowToast(res.message || `Active sessions revoked for ${targetMember.name}`);
        loadTeam();
      })
      .catch(err => {
        setRevoking(false);
        if (onShowToast) onShowToast(`Revocation error: ${err.message}`);
      });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Team Accounts & Role-Based Access Control</h3>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0 0' }}>Manage staff access, session revocation, permissions matrix and administrative roles</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowMatrixModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Shield size={16} color="#6E42E5" /> Permissions Matrix
          </button>

          <button
            onClick={() => {
              setCreatedCredentials(null);
              setShowInviteModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <UserPlus size={16} /> Create Staff Account
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: '10px 16px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search team by name, corporate email, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', ...ROLES_LIST].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                border: roleFilter === r ? '1px solid #6E42E5' : '1px solid #E2E8F0',
                backgroundColor: roleFilter === r ? '#F5F3FF' : '#FFFFFF',
                color: roleFilter === r ? '#6E42E5' : '#475569'
              }}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Team Roster Table */}
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
              <th style={{ padding: '12px 18px' }}>Staff Member</th>
              <th style={{ padding: '12px 18px' }}>Role</th>
              <th style={{ padding: '12px 18px' }}>Department</th>
              <th style={{ padding: '12px 18px' }}>Territory</th>
              <th style={{ padding: '12px 18px' }}>Security (2FA)</th>
              <th style={{ padding: '12px 18px' }}>Status</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const memberId = m.id || m._id;
              const isSuper = m.role === 'Super Admin';
              return (
                <tr key={memberId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isSuper ? '#EDE9FE' : '#F1F5F9',
                        color: isSuper ? '#6E42E5' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13
                      }}>
                        {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11.5,
                      fontWeight: 700,
                      backgroundColor: isSuper ? '#EDE9FE' : '#F1F5F9',
                      color: isSuper ? '#6E42E5' : '#334155'
                    }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5 }}>
                    {m.department || 'Operations'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5 }}>
                    {m.assignedZone || 'All India'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: m.twoFactor ? '#16A34A' : '#DC2626'
                    }}>
                      {m.twoFactor ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      {m.twoFactor ? '2FA Active' : 'Unprotected'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: m.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                      color: m.status === 'Active' ? '#15803D' : '#DC2626'
                    }}>
                      {m.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setTargetMember(m);
                          setShowRevokeModal(true);
                        }}
                        title="Invalidate all active JWT bearer sessions for this staff member"
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: 11.5,
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Key size={12} color="#64748B" /> Revoke Sessions
                      </button>

                      <button
                        onClick={() => handleToggleStatus(m)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: 11.5,
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: m.status === 'Active' ? '#DC2626' : '#16A34A'
                        }}
                      >
                        {m.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permissions Matrix Modal */}
      {showMatrixModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: 820,
            maxWidth: '92vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color="#6E42E5" /> Roles & Permissions Access Matrix
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0 0' }}>Enforced on backend API middleware. Actions are strictly gated by authenticated JWT role.</p>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F172A', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Module / Resource</th>
                    {ROLES_LIST.map(r => (
                      <th key={r} style={{ padding: '10px 10px', textAlign: 'center', fontSize: 11 }}>
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { res: 'Bookings & Dispatches', super: 'All Actions', ops: 'View, Create, Edit, Reassign, Export', fin: 'View, Export', supp: 'View, Edit Notes', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Customer Data', super: 'All Actions', ops: 'View, Edit, Suspend, Export', fin: 'No Access', supp: 'View', cat: 'No Access', ana: 'View (Masked), Export' },
                    { res: 'Professionals & Fleets', super: 'All Actions', ops: 'View, Verify Docs, Approve, Suspend', fin: 'No Access', supp: 'View', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Business Partners', super: 'All Actions', ops: 'View, Approve, Suspend, Export', fin: 'No Access', supp: 'No Access', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Service Catalogue', super: 'All Actions', ops: 'View, Create, Edit', fin: 'No Access', supp: 'No Access', cat: 'View, Create, Edit, Export', ana: 'View, Export' },
                    { res: 'Payments & Transactions', super: 'All Actions', ops: 'No Access', fin: 'View, Export', supp: 'No Access', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Payouts & NEFT Batches', super: 'All Actions', ops: 'No Access', fin: 'View, Create, Approve, Release', supp: 'No Access', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Refunds & Disputes', super: 'All Actions', ops: 'No Access', fin: 'View, Approve, Process Refund', supp: 'View, Create Ticket', cat: 'No Access', ana: 'View, Export' },
                    { res: 'Support Tickets & Revisits', super: 'All Actions', ops: 'View, Create, Edit', fin: 'No Access', supp: 'View, Reply, Notes, Escalate', cat: 'No Access', ana: 'View' },
                    { res: 'Ratings & Reviews', super: 'All Actions', ops: 'View, Moderate', fin: 'No Access', supp: 'View', cat: 'View, Moderate', ana: 'View' },
                    { res: 'Inventory & Consumables', super: 'All Actions', ops: 'View, Adjust Stock', fin: 'No Access', supp: 'No Access', cat: 'View, Create, Edit', ana: 'View' },
                    { res: 'Training Academy', super: 'All Actions', ops: 'View, Assign Courses', fin: 'No Access', supp: 'No Access', cat: 'No Access', ana: 'View' },
                    { res: 'Promotions & Vouchers', super: 'All Actions', ops: 'No Access', fin: 'No Access', supp: 'No Access', cat: 'View, Create, Edit', ana: 'View' },
                    { res: 'Team & RBAC', super: 'All Actions', ops: 'View Only', fin: 'No Access', supp: 'No Access', cat: 'No Access', ana: 'View' },
                    { res: 'Platform Settings', super: 'All Actions', ops: 'Surge Toggle', fin: 'Tax/Rates Edit', supp: 'No Access', cat: 'No Access', ana: 'View' },
                    { res: 'System Audit Logs', super: 'All Actions (Immutable)', ops: 'View', fin: 'View', supp: 'View', cat: 'No Access', ana: 'View' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>{row.res}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6E42E5', fontWeight: 700, backgroundColor: '#FBF9FE' }}>Full Admin</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>{row.ops}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>{row.fin}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>{row.supp}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>{row.cat}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>{row.ana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMatrixModal(false)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Sessions Modal */}
      {showRevokeModal && targetMember && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: 440,
            maxWidth: '90vw',
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#DC2626', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#DC2626" /> Revoke All Active Sessions
            </h4>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              This will increment the security <code>tokenVersion</code> for <strong>{targetMember.name}</strong> ({targetMember.email}). All active web browsers, mobile apps, and JWT tokens will immediately be invalidated and forced to re-authenticate.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Reason for Session Invalidation</label>
              <input
                type="text"
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowRevokeModal(false);
                  setTargetMember(null);
                }}
                disabled={revoking}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRevokeSessions}
                disabled={revoking}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
              >
                {revoking ? 'Revoking...' : 'Confirm Session Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: 480,
            maxWidth: '90vw',
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {!createdCredentials ? (
              <>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>Create Administrator Account</h4>
                <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Staff Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Saxena"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Corporate Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@urbancompany.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Assigned Role</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4 }}
                      >
                        {ROLES_LIST.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Department</label>
                      <input
                        type="text"
                        placeholder="e.g. City Operations"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Territory / Hub</label>
                    <select
                      value={formData.assignedZone}
                      onChange={e => setFormData({ ...formData, assignedZone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4 }}
                    >
                      <option value="All India">All India</option>
                      <option value="Mumbai Metro & Coastal">Mumbai Metro & Coastal</option>
                      <option value="Bangalore Hub">Bangalore Hub</option>
                      <option value="Krishnagiri Cluster">Krishnagiri Cluster</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', marginBottom: 12 }}>
                  <CheckCircle2 size={20} />
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0F172A' }}>Administrator Account Provisioned</h4>
                </div>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  The administrator account has been created. Deliver these temporary credentials to the staff member over secure corporate communications:
                </p>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, margin: '14px 0', fontFamily: 'monospace', fontSize: 13 }}>
                  <div><strong>Email:</strong> {createdCredentials.email}</div>
                  <div style={{ marginTop: 6 }}><strong>Temporary Password:</strong> <span style={{ color: '#6E42E5', fontWeight: 800 }}>{createdCredentials.temporaryPassword}</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setCreatedCredentials(null);
                      setFormData({ name: '', email: '', role: 'Operations Manager', assignedZone: 'All India', department: 'Operations' });
                    }}
                    style={{ padding: '8px 18px', borderRadius: 6, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
