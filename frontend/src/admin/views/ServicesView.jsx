import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Wrench, 
  X, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Archive, 
  RotateCcw, 
  Layers, 
  HelpCircle, 
  Tag, 
  Percent, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image,
  Upload,
  Camera
} from 'lucide-react';
import { CATEGORIES } from '../../data/servicesData';
import { adminClient } from '../adminClient';

const PRESET_PHOTOS = [
  { label: 'AC Service', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80' },
  { label: 'Plumbing & Faucets', url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&q=80' },
  { label: 'Deep Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80' },
  { label: 'Electrical Wiring', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80' },
  { label: 'Salon & Grooming', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80' },
  { label: 'Appliance Repair', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80' }
];

export function ServicesView({ onShowToast, onNavigate }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Draft' | 'Archived'

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Care',
    subcategory: 'AC Service & Repair',
    displayOrder: 1,
    price: 699,
    originalPrice: 899,
    durationMins: 60,
    rating: 4.85,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    description: '',
    includedWork: '',
    excludedWork: '',
    prepInstructions: '',
    applicableCities: 'Mumbai, Bengaluru, Delhi NCR, Krishnagiri',
    taxRate: 18,
    commissionRate: 20,
    warrantyDays: 30,
    status: 'Active'
  });

  const fetchServicesList = () => {
    setLoading(true);
    adminClient.getServices({
      search,
      category: selectedCat,
      status: statusFilter
    })
      .then(res => {
        setServices(res.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchServicesList();
  }, [search, selectedCat, statusFilter]);

  // Open Create Modal
  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      id: '',
      title: '',
      category: 'ac-appliances',
      categoryName: 'AC & Appliance Care',
      subcategory: 'AC Service & Repair',
      displayOrder: services.length + 1,
      price: 699,
      originalPrice: 899,
      durationMins: 60,
      rating: 4.85,
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
      description: 'High-performance doorstep service with certified technician safety check.',
      includedWork: 'High-pressure wash, Safety check, Anti-bacterial sanitization',
      excludedWork: 'Spare parts replacement, Structural alteration',
      prepInstructions: 'Keep the work area clean and ensure running water & electricity access',
      applicableCities: 'Mumbai, Bengaluru, Delhi NCR, Krishnagiri',
      taxRate: 18,
      commissionRate: 20,
      warrantyDays: 30,
      status: 'Active'
    });
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(srv) {
    setIsEditing(true);
    setFormData({
      id: srv.id,
      title: srv.title,
      category: srv.category,
      categoryName: srv.categoryName || '',
      subcategory: srv.subcategory || '',
      displayOrder: srv.displayOrder || 1,
      price: srv.price,
      originalPrice: srv.originalPrice || Math.round(srv.price * 1.25),
      durationMins: srv.durationMins || 60,
      rating: srv.rating || 4.8,
      badge: srv.badge || '',
      image: srv.image || '',
      description: srv.description || '',
      includedWork: (srv.includedWork || []).join(', '),
      excludedWork: (srv.excludedWork || []).join(', '),
      prepInstructions: (srv.prepInstructions || []).join(', '),
      applicableCities: (srv.applicableCities || ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri']).join(', '),
      taxRate: srv.taxRate || 18,
      commissionRate: srv.commissionRate || 20,
      warrantyDays: srv.warrantyDays || 30,
      status: srv.status || 'Active'
    });
    setIsModalOpen(true);
  }

  // Handle local photo file upload
  function handleImageFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast && onShowToast('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setFormData(prev => ({ ...prev, image: dataUrl }));
      onShowToast && onShowToast('Photo loaded into service specification');
    };
    reader.readAsDataURL(file);
  }

  // Submit Form
  function handleSave(e) {
    e.preventDefault();
    if (parseFloat(formData.price) <= 0) {
      onShowToast && onShowToast('Price must be greater than zero');
      return;
    }
    if (parseInt(formData.durationMins) < 5) {
      onShowToast && onShowToast('Duration must be at least 5 minutes');
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      durationMins: parseInt(formData.durationMins),
      includedWork: formData.includedWork.split(',').map(s => s.trim()).filter(Boolean),
      excludedWork: formData.excludedWork.split(',').map(s => s.trim()).filter(Boolean),
      prepInstructions: formData.prepInstructions.split(',').map(s => s.trim()).filter(Boolean),
      applicableCities: formData.applicableCities.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (isEditing && formData.id) {
      adminClient.updateService(formData.id, payload)
        .then(() => {
          onShowToast && onShowToast(`✓ Service "${formData.title}" updated (historical bookings preserved)`);
          setIsModalOpen(false);
          fetchServicesList();
        })
        .catch(err => {
          onShowToast && onShowToast(`Error: ${err.message}`);
        });
    } else {
      adminClient.createService(payload)
        .then(() => {
          onShowToast && onShowToast(`🎉 Service "${formData.title}" added to catalogue!`);
          setIsModalOpen(false);
          fetchServicesList();
        })
        .catch(err => {
          onShowToast && onShowToast(`Error: ${err.message}`);
        });
    }
  }

  // Soft Archival (Preserves historical bookings)
  function handleArchive(id, title) {
    if (window.confirm(`Archive service "${title}"? This soft-archives the service from the active catalogue while strictly preserving historical booking references.`)) {
      adminClient.archiveService(id)
        .then(() => {
          onShowToast && onShowToast(`✓ Service "${title}" soft-archived`);
          fetchServicesList();
          if (selectedService?.id === id) setSelectedService(null);
        })
        .catch(err => {
          onShowToast && onShowToast(`Error archiving service: ${err.message}`);
        });
    }
  }

  // Restore Service
  function handleRestore(id, title) {
    adminClient.restoreService(id)
      .then(() => {
        onShowToast && onShowToast(`✓ Service "${title}" restored to Active catalogue`);
        fetchServicesList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error restoring service: ${err.message}`);
      });
  }

  // Permanent Delete
  function handleDeleteService(id, title) {
    if (window.confirm(`Permanently delete service "${title}"? This will delete the service record from the catalogue.`)) {
      adminClient.deleteService(id)
        .then(() => {
          onShowToast && onShowToast(`✓ Service "${title}" permanently removed from catalogue`);
          fetchServicesList();
          if (selectedService?.id === id) setSelectedService(null);
        })
        .catch(err => {
          onShowToast && onShowToast(`Error deleting service: ${err.message}`);
        });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header & Policy Notice */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0', lineHeight: 1.25 }}>
            Service Catalogue &amp; SKU Specifications
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.2 }}>
            Configure categories, subcategories, pricing, durations, add-ons, commission take-rates &amp; soft-archival
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleOpenCreate}
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
            <Plus size={16} /> Add Catalogue Service
          </button>

          <button
            onClick={fetchServicesList}
            title="Refresh Catalogue"
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
        {/* Snapshot Protection Notice */}
      <div style={{
        padding: '12px 18px',
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        fontSize: 12,
        color: '#1E40AF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#2563EB" />
          <span>
            <strong>Historical Snapshot Protection:</strong> Booked prices and service descriptions are permanently locked onto existing bookings and invoices. Editing service catalogue items updates future purchases without mutating historical tax ledgers.
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>Soft-Archival Enforced</span>
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
            placeholder="Search catalogue by title, subcategory, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
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
            <option value="ALL">All Categories</option>
            <option value="ac-appliances">AC & Appliances</option>
            <option value="cleaning-pest">Cleaning & Pest Control</option>
            <option value="womens-salon">Salon for Women</option>
            <option value="mens-salon">Men's Grooming & Spa</option>
            <option value="quick-repairs">Electrician, Plumber & Repairs</option>
            <option value="native-ro">Native RO & Water Purifiers</option>
            <option value="painting-decor">Painting & Wall Decor</option>
          </select>

          {/* Lifecycle State Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
            <option value="ALL">All Lifecycle States</option>
            <option value="Active">Active Live</option>
            <option value="Draft">Draft / Inactive</option>
            <option value="Archived">Archived Services</option>
          </select>

          {(selectedCat !== 'ALL' || statusFilter !== 'ALL' || search) && (
            <button
              onClick={() => { setSelectedCat('ALL'); setStatusFilter('ALL'); setSearch(''); }}
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

      {/* Services Grid Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            <RefreshCw size={20} className="animate-spin" style={{ display: 'inline-block', marginBottom: 8 }} />
            <div>Loading service catalogue SKUs...</div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748B', backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <Layers size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
            <div style={{ fontWeight: 600, color: '#334155' }}>No services match the criteria</div>
            <div style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>Try clearing search keywords or filter dropdowns.</div>
            <button
              type="button"
              onClick={() => { setSelectedCat('ALL'); setStatusFilter('ALL'); setSearch(''); }}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(110,66,229,0.25)'
              }}
            >
              Reset All Filters & Show All Services
            </button>
          </div>
        ) : (
          services.map(srv => {
            const isArchived = srv.isArchived || srv.status === 'Archived';

            return (
              <div
                key={srv.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: isArchived ? '1px dashed #CBD5E1' : '1px solid #E2E8F0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  opacity: isArchived ? 0.75 : 1
                }}
              >
                <div>
                  {/* Category & Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {srv.subcategory || srv.categoryName || srv.category}
                    </span>

                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: isArchived ? '#F1F5F9' : srv.status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                      color: isArchived ? '#64748B' : srv.status === 'Active' ? '#15803D' : '#92400E'
                    }}>
                      {isArchived ? 'Archived' : srv.status || 'Active'}
                    </span>
                  </div>

                  {/* Photo & Title Block */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {srv.image ? (
                        <img
                          src={srv.image}
                          alt={srv.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80';
                          }}
                        />
                      ) : (
                        <Wrench size={20} color="#94A3B8" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {srv.title}
                      </h4>
                      <p style={{
                        fontSize: 12,
                        color: '#64748B',
                        margin: 0,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {srv.description || 'Doorstep execution by verified technicians.'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 12,
                    color: '#475569',
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="#6E42E5" />
                      <span>{srv.durationMins || 60} mins</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="#EAB308" color="#EAB308" />
                      <span>{srv.rating || 4.85}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={13} color="#16A34A" />
                      <span>{srv.warrantyDays || 30}d warranty</span>
                    </div>
                  </div>

                  {/* Pricing and Commission */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>Selling Price:</span>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                        ₹{srv.price}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: '#64748B' }}>Platform Take Rate:</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#6E42E5' }}>
                        {srv.commissionRate || 20}% + 18% GST
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <button
                    onClick={() => handleOpenEdit(srv)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={14} /> Edit Specs
                  </button>

                  {!isArchived ? (
                    <button
                      onClick={() => handleArchive(srv.id, srv.title)}
                      title="Soft Archive SKU"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Archive size={14} /> Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(srv.id, srv.title)}
                      title="Restore SKU to Active"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteService(srv.id, srv.title)}
                    title="Permanently Delete SKU"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* CREATE / EDIT SERVICE MODAL                               */}
      {/* ======================================================== */}
      {isModalOpen && (
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
            maxWidth: 640,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {isEditing ? `Edit Service SKU: ${formData.title}` : 'Add New Catalogue Service'}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Powerjet AC Servicing (Split)"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {/* Service Photo / Thumbnail */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Image size={14} color="#6E42E5" />
                    Service Photo / Thumbnail Image
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      style={{ background: 'none', border: 'none', fontSize: 11, color: '#EF4444', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Photo Preview Thumbnail */}
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Service Thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80';
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                        <Camera size={20} style={{ display: 'block', margin: '0 auto 2px' }} />
                        <span style={{ fontSize: 9 }}>No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* URL Input, Upload Button, and Presets */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Paste image URL (https://... or /images/...)"
                        value={formData.image}
                        onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #CBD5E1',
                          fontSize: 12.5,
                          boxSizing: 'border-box'
                        }}
                      />
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}>
                        <Upload size={13} color="#6E42E5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>

                    {/* Quick Preset Photos */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#64748B' }}>Presets:</span>
                      {PRESET_PHOTOS.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: p.url }))}
                          style={{
                            fontSize: 10.5,
                            padding: '2px 7px',
                            borderRadius: 4,
                            border: formData.image === p.url ? '1px solid #6E42E5' : '1px solid #E2E8F0',
                            backgroundColor: formData.image === p.url ? '#EDE9FE' : '#FFFFFF',
                            color: formData.image === p.url ? '#6E42E5' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Primary Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    <option value="ac-appliances">AC & Appliances</option>
                    <option value="cleaning-pest">Cleaning & Pest</option>
                    <option value="salon-women">Salon for Women</option>
                    <option value="mens-grooming">Men's Salon</option>
                    <option value="electrician-plumber">Electrician & Plumber</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. AC Service & Repair"
                    value={formData.subcategory}
                    onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={formData.durationMins}
                    onChange={e => setFormData(prev => ({ ...prev, durationMins: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description for customers"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Included Work (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. High-pressure wash, Drain flush"
                    value={formData.includedWork}
                    onChange={e => setFormData(prev => ({ ...prev, includedWork: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Excluded Work (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Spare parts replacement"
                    value={formData.excludedWork}
                    onChange={e => setFormData(prev => ({ ...prev, excludedWork: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Platform Take (%)</label>
                  <input
                    type="number"
                    value={formData.commissionRate}
                    onChange={e => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={e => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Warranty (Days)</label>
                  <input
                    type="number"
                    value={formData.warrantyDays}
                    onChange={e => setFormData(prev => ({ ...prev, warrantyDays: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {isEditing ? 'Save Specification Updates' : 'Add to Catalogue'}
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
