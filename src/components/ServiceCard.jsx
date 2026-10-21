import React from 'react';
import { Star, Clock, Plus, Minus, Check, Edit3, Trash2 } from 'lucide-react';

export function ServiceCard({
  service,
  qtyInCart,
  onAddToCart,
  onUpdateQty,
  onViewDetails,
  onEditService,
  onDeleteService
}) {
  const discountPercent = service.originalPrice && service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : null;

  // Single key highlight for compact display
  const keyHighlight = service.inclusions?.[0] || service.description;

  return (
    <div className="service-card" style={{ borderRadius: 0 }}>
      {/* Media section */}
      <div 
        className="service-card-media" 
        onClick={() => onViewDetails(service)} 
        title="Click to view full details"
        style={{ borderRadius: 0, overflow: 'hidden' }}
      >
        <img
          src={service.image}
          alt={service.title}
          className="service-card-img"
          loading="lazy"
          style={{ borderRadius: 0 }}
        />
        {service.badge && (
          <span className="service-floating-badge" style={{ borderRadius: 0 }}>{service.badge}</span>
        )}
        <span className="service-duration-badge" style={{ borderRadius: 0 }}>
          <Clock size={11} />
          <span>{service.duration}</span>
        </span>

        {/* Quick In-Place CRUD Buttons (Update & Delete) - Only rendered in Admin */}
        {(onEditService || onDeleteService) && (
          <div className="service-card-quick-crud">
            {onEditService && (
              <button
                type="button"
                className="card-crud-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditService(service);
                }}
                title="Edit service details (CRUD Update)"
                style={{ borderRadius: 0 }}
              >
                <Edit3 size={13} />
              </button>
            )}
            {onDeleteService && (
              <button
                type="button"
                className="card-crud-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${service.title}" from catalogue?`)) {
                    onDeleteService(service.id);
                  }
                }}
                title="Delete service from catalogue (CRUD Delete)"
                style={{ borderRadius: 0 }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body section */}
      <div className="service-card-body" style={{ borderRadius: 0 }}>
        {/* Rating and Reviews */}
        <div className="service-rating-row">
          <div className="rating-star-badge" style={{ borderRadius: 0 }}>
            <Star size={10} fill="currentColor" />
            <span>{service.rating}</span>
          </div>
          <span className="reviews-count-txt">({service.reviewsCount})</span>
        </div>

        {/* Title */}
        <h4 
          className="service-title" 
          onClick={() => onViewDetails(service)}
          title={service.title}
        >
          {service.title}
        </h4>

        {/* 1 Key Highlight Bullet */}
        {keyHighlight && (
          <div className="service-compact-highlight">
            <Check size={11} color="#059669" style={{ flexShrink: 0 }} />
            <span>{keyHighlight}</span>
          </div>
        )}

        {/* Footer with Pricing and Add Action */}
        <div className="service-card-footer">
          <div className="service-pricing-col">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span className="service-price-current">₹{service.price}</span>
              {service.originalPrice && (
                <span className="service-price-original">₹{service.originalPrice}</span>
              )}
            </div>
            {discountPercent && (
              <span className="service-discount-tag" style={{ borderRadius: 0 }}>
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="service-action-group">
            <button
              type="button"
              className="view-details-link-btn"
              onClick={() => onViewDetails(service)}
              title="View full inclusions & details"
              style={{ borderRadius: 0 }}
            >
              Details
            </button>

            {qtyInCart > 0 ? (
              <div className="qty-counter-control" style={{ borderRadius: 0 }}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onUpdateQty(service.id, qtyInCart - 1)}
                  aria-label="Decrease quantity"
                  style={{ borderRadius: 0 }}
                >
                  <Minus size={12} />
                </button>
                <span className="qty-val">{qtyInCart}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onUpdateQty(service.id, qtyInCart + 1)}
                  aria-label="Increase quantity"
                  style={{ borderRadius: 0 }}
                >
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-service-btn"
                onClick={() => onAddToCart(service)}
                style={{ borderRadius: 0 }}
              >
                Add +
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
