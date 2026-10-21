import React from 'react';
import { 
  X, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Plus, 
  Minus,
  Sparkles,
  Edit3,
  Trash2 
} from 'lucide-react';

export function ServiceDetailModal({
  service,
  onClose,
  qtyInCart,
  onAddToCart,
  onUpdateQty,
  onEditService,
  onDeleteService
}) {
  if (!service) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="detail-modal-card" onClick={(e) => e.stopPropagation()} style={{ borderRadius: 0 }}>
        {/* Media Top */}
        <div className="detail-modal-media" style={{ borderRadius: 0, overflow: 'hidden' }}>
          <img
            src={service.image}
            alt={service.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
          />
          <button
            type="button"
            className="detail-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            style={{ borderRadius: 0 }}
          >
            <X size={20} />
          </button>
          {service.badge && (
            <span className="service-floating-badge" style={{ borderRadius: 0 }}>{service.badge}</span>
          )}
          <span className="service-duration-badge" style={{ borderRadius: 0 }}>
            <Clock size={13} />
            <span>{service.duration}</span>
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="detail-modal-scroll">
          {/* Rating */}
          <div className="service-rating-row" style={{ marginBottom: 6 }}>
            <div className="rating-star-badge" style={{ borderRadius: 0 }}>
              <Star size={12} fill="currentColor" />
              <span>{service.rating}</span>
            </div>
            <span className="reviews-count-txt">({service.reviewsCount})</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8, lineHeight: 1.25 }}>
            {service.title}
          </h2>

          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5, marginBottom: 20 }}>
            {service.description}
          </p>

          {/* Pricing bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC',
            padding: '14px 18px',
            borderRadius: 0,
            border: '1px solid #E2E8F0',
            marginBottom: 24
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>₹{service.price}</span>
                {service.originalPrice && (
                  <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{service.originalPrice}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
                Inclusive of all taxes & single-use kit
              </span>
            </div>

            {qtyInCart > 0 ? (
              <div className="qty-counter-control" style={{ borderRadius: 0 }}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onUpdateQty(service.id, qtyInCart - 1)}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-val">{qtyInCart}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onUpdateQty(service.id, qtyInCart + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-service-btn"
                style={{ padding: '9px 24px', fontSize: 14, borderRadius: 0 }}
                onClick={() => onAddToCart(service)}
              >
                Add to Cart +
              </button>
            )}
          </div>

          {/* What's Included */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
              What's Included
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {service.inclusions?.map((inc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.4 }}>{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          {service.exclusions?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                What's Excluded
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {service.exclusions.map((exc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <XCircle size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.4 }}>{exc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {service.steps?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                How It Works
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {service.steps.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: 0,
                      background: '#F4F0FF',
                      color: '#6E42E5',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.45 }}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urban Company Promise Card */}
          <div style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
            border: '1px solid #E0E7FF',
            borderRadius: 0,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <ShieldCheck size={28} color="#6E42E5" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1E1B4B' }}>
                Urban Company 30-Day Assurance
              </div>
              <div style={{ fontSize: 12, color: '#4338CA', lineHeight: 1.35 }}>
                100% verified professionals, single-use sanitary packaging, and free re-work if not completely satisfied.
              </div>
            </div>
          </div>

          {/* Admin Catalogue CRUD Actions */}
          {(onEditService || onDeleteService) && (
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                Catalogue Controls:
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {onEditService && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditService(service);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 0,
                      background: '#F4F0FF',
                      border: '1px solid #E4DAFF',
                      color: '#6E42E5',
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                    title="Edit this service (CRUD Update)"
                  >
                    <Edit3 size={13} />
                    <span>Edit Service</span>
                  </button>
                )}
                {onDeleteService && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${service.title}" from catalogue?`)) {
                        onClose();
                        onDeleteService(service.id);
                      }
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 0,
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                    title="Delete this service (CRUD Delete)"
                  >
                    <Trash2 size={13} />
                    <span>Delete Service</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
