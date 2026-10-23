import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, X, AlertTriangle, Check, Lock, Info } from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function StaffView({ showToast, staff: currentUserStaff }) {
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Invite form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Dispatcher'
  });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await partnerClient.getStaff();
      if (res && res.success) {
        setStaffList(res.staff || []);
      }
    } catch (err) {
      showToast?.('Error loading staff accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) {
      showToast?.('Name, email and role are required.');
      return;
    }

    // Role escalation guard
    if (currentUserStaff?.role !== 'Business Owner' && form.role === 'Business Owner') {
      showToast?.('Only an active Business Owner can grant the Business Owner role.');
      return;
    }

    setInviting(true);
    try {
      const res = await partnerClient.inviteStaff(form);
      if (res && res.success) {
        showToast?.(res.message);
        setIsInviteModalOpen(false);
        setForm({ name: '', email: '', phone: '', role: 'Dispatcher' });
        loadStaff();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to invite staff member');
    } finally {
      setInviting(false);
    }
  }

  async function handleDeleteStaff(member) {
    if (member.role === 'Business Owner') {
      const owners = staffList.filter(s => s.role === 'Business Owner');
      if (owners.length <= 1) {
        showToast?.('Cannot remove the final active Business Owner. A business must retain at least one active owner.');
        return;
      }
    }

    if (!window.confirm(`Are you sure you want to deactivate staff account for ${member.name} (${member.role})?`)) {
      return;
    }

    try {
      const res = await partnerClient.deleteStaff(member.id);
      if (res && res.success) {
        showToast?.(res.message);
        loadStaff();
      }
    } catch (err) {
      showToast?.(err.message || 'Staff deletion failed');
    }
  }

  async function handleToggleStaffStatus(member) {
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    if (member.role === 'Business Owner' && newStatus === 'Inactive') {
      const activeOwners = staffList.filter(s => s.role === 'Business Owner' && s.status === 'Active');
      if (activeOwners.length <= 1) {
        showToast?.('Cannot deactivate the final active Business Owner.');
        return;
      }
    }
    try {
      const res = await partnerClient.updateStaffStatus(member.id, newStatus);
      if (res && res.success) {
        showToast?.(`Staff member marked as ${newStatus}.`);
        loadStaff();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to update staff status');
    }
  }

  const canManageStaff = currentUserStaff?.permissions?.managing_staff === true;

  const roleColors = {
    'Business Owner': { bg: '#ede9fe', text: '#6d28d9' },
    'Business Manager': { bg: '#e0f2fe', text: '#0284c7' },
    'Dispatcher': { bg: '#fef3c7', text: '#b45309' },
    'Finance Staff': { bg: '#dcfce7', text: '#16a34a' },
    'Read-only Staff': { bg: '#f1f5f9', text: '#475569' }
  };

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
            Staff Accounts & Role-Based Access Control (RBAC)
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Authorized team members, operational dispatchers, and finance staff managing your business
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowMatrixModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Info size={15} /> View Permission Matrix
          </button>

          {canManageStaff && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={16} /> Add Staff Account
            </button>
          )}
        </div>
      </div>

      {/* Staff Roster Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading staff accounts...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Staff Member</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Business Role</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Contact Info</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Last Login</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(member => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>#{member.id}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: roleColors[member.role]?.bg || '#f1f5f9',
                        color: roleColors[member.role]?.text || '#475569'
                      }}>
                        {member.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      <div>{member.email}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{member.phone}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: member.status === 'Active' ? '#dcfce7' : '#fee2e2',
                          color: member.status === 'Active' ? '#16a34a' : '#dc2626',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {member.status}
                        </span>
                        {canManageStaff && (
                          <button
                            onClick={() => handleToggleStaffStatus(member)}
                            title={`Toggle to ${member.status === 'Active' ? 'Inactive' : 'Active'}`}
                            style={{
                              fontSize: 11,
                              padding: '2px 6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: 4,
                              cursor: 'pointer',
                              color: '#475569'
                            }}
                          >
                            {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12.5 }}>
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'Never'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {canManageStaff ? (
                        <button
                          onClick={() => handleDeleteStaff(member)}
                          title="Deactivate staff account"
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            borderRadius: 6,
                            padding: '5px 8px',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission Matrix Modal */}
      {showMatrixModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise Partner RBAC Permission Matrix
              </h2>
              <button
                onClick={() => setShowMatrixModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>Capability</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Owner</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Manager</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Dispatcher</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Finance</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Read-only</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: 'View Core Operations', o: true, m: true, d: true, f: true, r: true },
                    { cap: 'Edit Operational Settings', o: true, m: true, d: false, f: false, r: false },
                    { cap: 'Assign Jobs to Technicians', o: true, m: true, d: true, f: false, r: false },
                    { cap: 'Manage Fleet Team Members', o: true, m: true, d: false, f: false, r: false },
                    { cap: 'View Business Finances', o: true, m: true, d: false, f: true, r: false },
                    { cap: 'Export Operational/Tax Reports', o: true, m: true, d: false, f: true, r: false },
                    { cap: 'Manage Staff Accounts', o: true, m: false, d: false, f: false, r: false },
                    { cap: 'Update Compliance Documents', o: true, m: true, d: false, f: false, r: false },
                    { cap: 'Request Corporate Bank Changes', o: true, m: false, d: false, f: false, r: false }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155' }}>{row.cap}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.o ? '✅' : '❌'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.m ? '✅' : '❌'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.d ? '✅' : '❌'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.f ? '✅' : '❌'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.r ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, color: '#64748b' }}>
                <strong>Critical Security Rule:</strong> Server enforces all permissions on every API request. A staff member cannot grant a role with higher permissions than their own. The final active Business Owner cannot be deleted.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 480,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Add Partner Staff Account
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@apexhome.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98XXX XXXXX"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Assigned Role *
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  {currentUserStaff?.role === 'Business Owner' && (
                    <option value="Business Owner">Business Owner (Full Rights & Bank Change)</option>
                  )}
                  <option value="Business Manager">Business Manager (Fleet, Ops & Reviews)</option>
                  <option value="Dispatcher">Dispatcher (Scheduling & Assignment)</option>
                  <option value="Finance Staff">Finance Staff (Earnings & Invoices)</option>
                  <option value="Read-only Staff">Read-only Staff (Operational Oversight)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {inviting ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
