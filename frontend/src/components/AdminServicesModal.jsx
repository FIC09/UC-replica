import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Wrench, 
  Tag, 
  Image as ImageIcon,
  Clock,
  Sparkles,
  AlertCircle,
  Upload
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';

const SAMPLE_IMAGES = [
  { label: '❄️ AC Repair', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80' },
  { label: '💇‍♀️ Salon & Beauty', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80' },
  { label: '🧼 Deep Clean', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { label: '🔧 Plumber/Electric', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80' },
  { label: '🎨 Painting', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80' },
  { label: '💧 Native RO', url: '/images/native_purifier.jpg' },
];

export function AdminServicesModal({
  isOpen,
  onClose,
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  onResetServices,
  initialEditingService,
  defaultCategory = 'ac-appliances'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory !== 'all' ? defaultCategory : 'ac-appliances');
  const [subcategory, setSubcategory] = useState('General Service');
  const [price, setPrice] = useState(499);
  const [originalPrice, setOriginalPrice] = useState(799);
  const [duration, setDuration] = useState('45 mins');
  const [badge, setBadge] = useState('POPULAR');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
  const [manualPhotoName, setManualPhotoName] = useState('');
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState('');
  const [inclusionsText, setInclusionsText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialEditingService === 'NEW') {
      resetForm();
      if (defaultCategory && defaultCategory !== 'all') {
        setCategory(defaultCategory);
      }
      setIsEditing(true);
    } else if (initialEditingService && typeof initialEditingService === 'object') {
      handleStartEdit(initialEditingService);
    }
  }, [initialEditingService, isOpen, defaultCategory]);

  if (!isOpen) return null;

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Please choose an image file under 8MB.');
      return;
    }

    setManualPhotoName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to load image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  }

  function handleClearManualPhoto() {
    setImage('');
    setManualPhotoName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function resetForm() {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setCategory('ac-appliances');
    setSubcategory('General Service');
    setPrice(499);
    setOriginalPrice(799);
    setDuration('45 mins');
    setBadge('POPULAR');
    setImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
    setManualPhotoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDescription('');
    setInclusionsText('');
    setError('');
  }

  function handleStartAdd() {
    resetForm();
    setIsEditing(true);
  }

  function handleStartEdit(svc) {
    setEditingId(svc.id);
    setTitle(svc.title || '');
    setCategory(svc.category || 'ac-appliances');
    setSubcategory(svc.subcategory || 'General Service');
    setPrice(svc.price || 499);
    setOriginalPrice(svc.originalPrice || 799);
    setDuration(svc.duration || '45 mins');
    setBadge(svc.badge || '');
    setImage(svc.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
    setManualPhotoName(svc.image && svc.image.startsWith('data:') ? 'Custom uploaded photo' : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDescription(svc.description || '');
    setInclusionsText(svc.inclusions ? svc.inclusions.join('\n') : '');
    setIsEditing(true);
    setError('');
  }

  function handleSaveService(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Service title is required.');
      return;
    }
    if (!price || price <= 0) {
      setError('Please provide a valid price greater than ₹0.');
      return;
    }

    const inclusionsArray = inclusionsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      category,
      subcategory: subcategory.trim() || 'General Service',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      duration: duration.trim() || '45 mins',
      badge: badge.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      description: description.trim() || 'Professional home service delivered by verified experts.',
      inclusions: inclusionsArray.length > 0 ? inclusionsArray : [
        'Complete inspection and diagnosis',
        'Standard equipment and single-use sanitary materials',
        'Post-service quality checklist and cleanup'
      ],
      rating: 4.85,
      reviewsCount: '12K reviews'
    };

    if (editingId) {
      // UPDATE Operation
      const existing = services.find(s => s.id === editingId);
      onUpdateService(editingId, {
        ...payload,
        rating: existing?.rating || 4.85,
        reviewsCount: existing?.reviewsCount || '12K reviews'
      });
    } else {
      // CREATE Operation
      onAddService({
        id: 'svc-' + Date.now(),
        ...payload
      });
    }

    resetForm();
    onClose();
  }

  function handleDelete(id, sTitle) {
    if (window.confirm(`Are you sure you want to delete "${sTitle}" from the catalogue?`)) {
      onDeleteService(id);
    }
  }

  // Filtered Services (READ)
  const filtered = services.filter((s) => {
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    const matchSearch = !searchTerm.trim() || 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="checkout-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, maxHeight: '90vh', borderRadius: 0 }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0F172A',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench size={22} color="#A78BFA" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                Service Catalogue Management (CRUD)
              </h3>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>
                Create, Read, Update & Delete services across Urban Company Mumbai
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, overflowY: 'auto' }}>
          {/* CREATE / UPDATE FORM */}
          {isEditing ? (
            <form onSubmit={handleSaveService} style={{ background: '#F8FAFC', padding: 24, borderRadius: 0, border: '1.5px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                    {editingId ? '✏️ Edit Service Details (Update)' : '✨ Create New Service (Create)'}
                  </h4>
                  <p style={{ fontSize: 12, color: '#64748B' }}>
                    {editingId ? 'Modify fields below and save to update live catalogue' : 'Fill details below to publish directly into catalogue'}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ fontSize: 13, fontWeight: 700, color: '#64748B', cursor: 'pointer' }}
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
                  borderRadius: 0,
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Service Title *
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="e.g. Powerjet AC Servicing or Bridal Glow Facial"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Category *
                  </label>
                  <select
                    className="form-input-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: '#fff' }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Current Price (₹) *
                  </label>
                  <input
                    type="number"
                    className="form-input-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    className="form-input-control"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="45 mins"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="e.g. BESTSELLER"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>
              </div>

              {/* Photo Input: Manual Upload from Device + URL + Presets */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <ImageIcon size={14} color="#6E42E5" />
                    <span>Service Photo (Upload Manually from Device or Use URL) *</span>
                  </label>
                  {manualPhotoName && (
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                      ✓ {manualPhotoName}
                    </span>
                  )}
                </div>

                {/* Hidden File Input for Manual Photo Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {/* Manual Photo & URL Row */}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  background: '#FFFFFF',
                  padding: '10px 12px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 0,
                  marginBottom: 8
                }}>
                  {/* Manual File Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '8px 14px',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 0,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.15s ease'
                    }}
                    title="Click to browse and upload photo manually from your device"
                  >
                    <Upload size={14} color="#A78BFA" />
                    <span>Upload Photo Manually</span>
                  </button>

                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>or</span>

                  {/* URL Text Input */}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input-control"
                      placeholder="Paste image URL (https://... or data:...)"
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        setManualPhotoName('');
                      }}
                      style={{
                        margin: 0,
                        width: '100%',
                        paddingRight: image ? 28 : 10,
                        borderRadius: 0,
                        fontSize: 12.5
                      }}
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={handleClearManualPhoto}
                        style={{
                          position: 'absolute',
                          right: 6,
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: 4
                        }}
                        title="Clear photo"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Live Photo Preview */}
                  {image ? (
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: '1.5px solid #CBD5E1',
                      background: '#F1F5F9',
                      flexShrink: 0
                    }} title="Live Photo Preview">
                      <img 
                        src={image} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      border: '1.5px dashed #CBD5E1',
                      background: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      flexShrink: 0
                    }} title="No photo selected">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                {/* Quick Sample Presets */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Presets:</span>
                  {SAMPLE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImage(sample.url);
                        setManualPhotoName('');
                      }}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        background: image === sample.url ? '#EDE9FE' : '#fff',
                        border: `1px solid ${image === sample.url ? '#8B5CF6' : '#E2E8F0'}`,
                        borderRadius: 0,
                        cursor: 'pointer',
                        color: image === sample.url ? '#6E42E5' : '#475569'
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  Description Snippet
                </label>
                <textarea
                  rows={2}
                  className="form-input-control"
                  placeholder="Describe the procedure, equipment, and customer benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ borderRadius: 0 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  Key Inclusions (One per line)
                </label>
                <textarea
                  rows={3}
                  className="form-input-control"
                  placeholder="Deep high-pressure water pump cleaning&#10;Anti-bacterial foam spray&#10;Drain pipe unclogging"
                  value={inclusionsText}
                  onChange={(e) => setInclusionsText(e.target.value)}
                  style={{ borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: '10px 18px', borderRadius: 0, border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 700, color: '#64748B', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="proceed-checkout-btn"
                  style={{ flex: 1, padding: '10px 20px', fontSize: 13.5, justifyContent: 'center', cursor: 'pointer', borderRadius: 0 }}
                >
                  <span>{editingId ? 'Save & Update Service (Update)' : 'Create & Publish Service (Create)'}</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Top Controls: Add Button, Search, Category Filter, Reset */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                {/* CREATE Button */}
                <button
                  type="button"
                  onClick={handleStartAdd}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 0,
                    background: '#6E42E5',
                    color: '#fff',
                    fontSize: 13.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  <span>+ Create New Service (Create)</span>
                </button>

                {/* Reset to Default */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset catalogue to original default preset services?')) {
                      onResetServices();
                    }
                  }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 0,
                    border: '1.5px solid #E2E8F0',
                    background: '#fff',
                    color: '#64748B',
                    fontSize: 12.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                  title="Restore original preset services"
                >
                  <RotateCcw size={14} />
                  <span>Reset Default Catalogue</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 0,
                  padding: '8px 14px'
                }}>
                  <Search size={16} color="#6B7280" />
                  <input
                    type="text"
                    placeholder="Search catalogue by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 13.5 }}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 0,
                    border: '1.5px solid #E2E8F0',
                    background: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  <option value="all">All Categories ({services.length})</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* READ & Actions Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 0, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 2fr 1.2fr 100px 140px',
                  background: '#F1F5F9',
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  <span>Photo</span>
                  <span>Service Title</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span style={{ textAlign: 'right' }}>CRUD Actions</span>
                </div>

                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                      No services match your search filter.
                    </div>
                  ) : (
                    filtered.map((s) => (
                      <div 
                        key={s.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 2fr 1.2fr 100px 140px',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom: '1px solid #F1F5F9',
                          fontSize: 13
                        }}
                      >
                        <div>
                          <img
                            src={s.image}
                            alt={s.title}
                            style={{ width: 44, height: 44, borderRadius: 0, objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.title}</div>
                          <div style={{ fontSize: 11.5, color: '#64748B' }}>{s.duration} • {s.badge || 'Standard'}</div>
                        </div>

                        <div>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 0,
                            background: '#F1F5F9',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#475569'
                          }}>
                            {CATEGORIES.find(c => c.id === s.category)?.shortName || s.category}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>₹{s.price}</div>
                          {s.originalPrice && (
                            <div style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through' }}>
                              ₹{s.originalPrice}
                            </div>
                          )}
                        </div>

                        {/* UPDATE & DELETE Buttons */}
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(s)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 0,
                              background: '#F4F0FF',
                              color: '#6E42E5',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              border: '1px solid #E4DAFF',
                              cursor: 'pointer'
                            }}
                            title="Edit this service (CRUD Update)"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.title)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 0,
                              background: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              border: '1px solid #FECACA',
                              cursor: 'pointer'
                            }}
                            title="Delete this service (CRUD Delete)"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
