import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Home, 
  Briefcase, 
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MUMBAI_LOCALITIES } from '../data/servicesData';

export function AddressManagerModal({
  isOpen,
  onClose,
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSelectDefaultAddress
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [label, setLabel] = useState('Home');
  const [flat, setFlat] = useState('');
  const [locality, setLocality] = useState(MUMBAI_LOCALITIES[0]);
  const [pincode, setPincode] = useState('400050');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function resetForm() {
    setIsEditing(false);
    setEditingId(null);
    setLabel('Home');
    setFlat('');
    setLocality(MUMBAI_LOCALITIES[0]);
    setPincode('400050');
    setLandmark('');
    setError('');
  }

  function handleStartAdd() {
    resetForm();
    setIsEditing(true);
  }

  function handleStartEdit(addr) {
    setEditingId(addr.id);
    setLabel(addr.label || 'Home');
    setFlat(addr.flat || '');
    setLocality(addr.locality || MUMBAI_LOCALITIES[0]);
    setPincode(addr.pincode || '400050');
    setLandmark(addr.landmark || '');
    setIsEditing(true);
    setError('');
  }

  function handleSaveAddress(e) {
    e.preventDefault();
    if (!flat.trim()) {
      setError('Please enter flat/house number and building name.');
      return;
    }
    if (!pincode.trim() || pincode.length < 6) {
      setError('Please enter a valid 6-digit Mumbai pincode.');
      return;
    }

    const payload = {
      label,
      flat: flat.trim(),
      locality,
      city: 'Mumbai',
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      formatted: `${flat.trim()}, ${locality}, Mumbai - ${pincode.trim()}${landmark ? ` (Near ${landmark.trim()})` : ''}`
    };

    if (editingId) {
      // UPDATE Operation
      onUpdateAddress(editingId, payload);
    } else {
      // CREATE Operation
      onAddAddress({
        id: 'ADDR-' + Date.now(),
        isDefault: addresses.length === 0,
        ...payload
      });
    }

    resetForm();
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this address?')) {
      onDeleteAddress(id);
    }
  }

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="checkout-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 580 }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={22} color="#6E42E5" />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                Manage Saved Addresses
              </h3>
              <p style={{ fontSize: 12, color: '#64748B' }}>
                Create, read, update, and delete service locations
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ color: '#6B7280' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: '72vh' }}>
          {/* CREATE / UPDATE FORM */}
          {isEditing ? (
            <form onSubmit={handleSaveAddress} style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1.5px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h4>
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ fontSize: 12.5, fontWeight: 700, color: '#64748B' }}
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontSize: 12.5,
                  marginBottom: 14,
                  fontWeight: 600
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Address Label Pills */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 6 }}>
                  Address Type
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLabel(type)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        border: `1.5px solid ${label === type ? '#6E42E5' : '#E2E8F0'}`,
                        background: label === type ? '#F4F0FF' : '#fff',
                        color: label === type ? '#6E42E5' : '#4B5563',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {type === 'Home' && <Home size={14} />}
                      {type === 'Work' && <Briefcase size={14} />}
                      {type === 'Other' && <MapPin size={14} />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat & Building */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  House / Flat No. & Building Name *
                </label>
                <input
                  type="text"
                  className="form-input-control"
                  placeholder="e.g. Flat 602, Sea Pearl Tower, Carter Road"
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  required
                />
              </div>

              {/* Locality */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  Mumbai Locality *
                </label>
                <select
                  className="form-input-control"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  style={{ background: '#fff' }}
                >
                  {MUMBAI_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Pincode & Landmark */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="400050"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="Near Starbucks"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748B'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="proceed-checkout-btn"
                  style={{ flex: 1, padding: '10px 20px', fontSize: 13.5, justifyContent: 'center' }}
                >
                  <span>{editingId ? 'Update Address' : 'Save Address'}</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Add New Address Trigger */}
              <button
                type="button"
                onClick={handleStartAdd}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '2px dashed #C7D2FE',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 20,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <Plus size={18} />
                <span>+ Add New Address</span>
              </button>

              {/* READ: List of Addresses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                    <MapPin size={36} style={{ margin: '0 auto 10px', color: '#CBD5E1' }} />
                    <p style={{ fontSize: 14, fontWeight: 600 }}>No saved addresses yet.</p>
                    <p style={{ fontSize: 12 }}>Add your home or office address for faster 1-click checkout.</p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: `1.5px solid ${addr.isDefault ? '#6E42E5' : '#E2E8F0'}`,
                        background: addr.isDefault ? '#FCFAFF' : '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: addr.label === 'Home' ? '#EFF6FF' : addr.label === 'Work' ? '#FEF3C7' : '#F3F4F6',
                            color: addr.label === 'Home' ? '#1D4ED8' : addr.label === 'Work' ? '#B45309' : '#374151',
                            fontSize: 11.5,
                            fontWeight: 800,
                            textTransform: 'uppercase'
                          }}>
                            {addr.label || 'Address'}
                          </span>

                          {addr.isDefault && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              color: '#059669',
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={13} />
                              Default
                            </span>
                          )}
                        </div>

                        {/* Actions (Update & Delete) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(addr)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: 6,
                              background: '#F1F5F9',
                              color: '#334155',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Edit Address"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(addr.id)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: 6,
                              background: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Delete Address"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600, lineHeight: 1.4 }}>
                        {addr.formatted || `${addr.flat}, ${addr.locality}, ${addr.city} - ${addr.pincode}`}
                      </div>

                      {!addr.isDefault && (
                        <div style={{ paddingTop: 6, borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => onSelectDefaultAddress(addr.id)}
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#6E42E5'
                            }}
                          >
                            Set as Default Address
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
