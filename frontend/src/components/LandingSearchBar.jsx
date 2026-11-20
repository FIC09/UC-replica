import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, ArrowRight, Flame } from 'lucide-react';

export function LandingSearchBar({
  isOpen,
  onClose,
  services = [],
  selectedCity = '',
  activeNavTab = 'homes',
  onSelectService
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(true);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const queryTokens = trimmedQuery.split(/\s+/).filter(Boolean);

  const filteredServices = trimmedQuery
    ? services.filter(s => {
        const title = (s.title || '').toLowerCase();
        const subcategory = (s.subcategory || '').toLowerCase();
        const category = (s.category || '').toLowerCase();
        const description = (s.description || '').toLowerCase();
        const tag = (s.tag || '').toLowerCase();
        const inclusions = Array.isArray(s.inclusions) ? s.inclusions.join(' ').toLowerCase() : '';
        const combined = `${title} ${subcategory} ${category} ${description} ${tag} ${inclusions}`;

        if (combined.includes(trimmedQuery)) return true;
        if (queryTokens.every(token => combined.includes(token))) return true;
        if (queryTokens.some(token => title.includes(token) || subcategory.includes(token) || category.includes(token))) {
          return true;
        }
        return false;
      }).slice(0, 8)
    : [];

  const handleExecuteSearch = (override) => {
    const q = (typeof override === 'string' ? override : searchQuery).trim();
    if (!q) return;
    const qTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = services.filter(s => {
      const title = (s.title || '').toLowerCase();
      const subcategory = (s.subcategory || '').toLowerCase();
      const category = (s.category || '').toLowerCase();
      const description = (s.description || '').toLowerCase();
      const combined = `${title} ${subcategory} ${category} ${description}`;
      if (combined.includes(q.toLowerCase())) return true;
      if (qTokens.every(token => combined.includes(token))) return true;
      return false;
    });

    if (matches.length > 0 && onSelectService) {
      onSelectService(matches[0]);
      onClose();
    }
  };

  const placeholderText =
    activeNavTab === 'beauty'
      ? "Search for 'Ayurvedic massage', 'Facial', 'Waxing'..."
      : activeNavTab === 'native'
        ? "Search for 'Water Purifier', 'Smart Locks'..."
        : "Search for 'Electricians', 'AC Repair', 'Cleaning'...";

  return (
    <div
      ref={containerRef}
      id="landing-search-card"
      className="uc-landing-search-card"
      style={{
        maxWidth: 820,
        margin: '18px auto 20px auto',
        padding: '0 16px',
        position: 'relative',
        zIndex: 90
      }}
    >
      {/* Search Input Box */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1.5px solid #0B57D0',
          boxShadow: '0 8px 30px rgba(11, 87, 208, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 18px',
            gap: 12
          }}
        >
          <Search size={22} color="#0B57D0" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            id="landing-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleExecuteSearch();
              }
            }}
            placeholder={placeholderText}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: '#152238',
              backgroundColor: 'transparent'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{
                background: '#F4F7FC',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#667085'
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close search"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E4E7EC',
              backgroundColor: '#F4F7FC',
              color: '#667085',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8F1FF';
              e.currentTarget.style.color = '#0B57D0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F7FC';
              e.currentTarget.style.color = '#667085';
            }}
          >
            <X size={14} />
            <span>Close</span>
          </button>
        </div>

        {/* Autocomplete / Trending Results */}
        {showDropdown && (
          <div
            style={{
              borderTop: '1px solid #E4E7EC',
              background: '#FFFFFF',
              maxHeight: 360,
              overflowY: 'auto'
            }}
          >
            {trimmedQuery ? (
              filteredServices.length > 0 ? (
                <div>
                  <div
                    style={{
                      padding: '10px 18px 6px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#667085',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Services matching "{searchQuery}"
                  </div>
                  {filteredServices.map(service => (
                    <div
                      key={service.id}
                      onClick={() => {
                        if (onSelectService) {
                          onSelectService(service);
                        }
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 18px',
                        borderBottom: '1px solid #F4F7FC',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8F1FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={service.image}
                          alt={service.title}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid #E4E7EC'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#152238' }}>
                            {service.title}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginTop: 2,
                              fontSize: 12,
                              color: '#667085'
                            }}
                          >
                            <span style={{ color: '#16A34A', fontWeight: 700 }}>₹{service.price}</span>
                            <span>•</span>
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                color: '#D97706',
                                fontWeight: 600
                              }}
                            >
                              <Star size={12} fill="#D97706" /> {service.rating}
                            </span>
                            {service.subcategory && (
                              <>
                                <span>•</span>
                                <span>{service.subcategory}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 14px',
                          borderRadius: 8,
                          backgroundColor: '#0B57D0',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '28px 18px', textAlign: 'center', color: '#667085', fontSize: 13.5 }}>
                  No matching services found for "{searchQuery}". Try searching for 'AC', 'Plumber', or 'Cleaning'.
                </div>
              )
            ) : (
              <div>
                <div
                  style={{
                    padding: '12px 18px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#667085',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Trending Searches in {selectedCity || 'Your City'}
                </div>
                <div style={{ padding: '0 18px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    'Kitchen Cleaning',
                    'Powerjet AC Service',
                    'Electrician Repair',
                    'Bathroom Deep Cleaning',
                    'Water Purifier RO',
                    'Men Haircut & Beard Grooming'
                  ].map(trend => (
                    <button
                      key={trend}
                      type="button"
                      onClick={() => {
                        setSearchQuery(trend);
                        handleExecuteSearch(trend);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '7px 13px',
                        backgroundColor: '#F4F7FC',
                        border: '1px solid #E4E7EC',
                        borderRadius: 20,
                        cursor: 'pointer',
                        color: '#152238',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E8F1FF';
                        e.currentTarget.style.borderColor = '#0B57D0';
                        e.currentTarget.style.color = '#0B57D0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F4F7FC';
                        e.currentTarget.style.borderColor = '#E4E7EC';
                        e.currentTarget.style.color = '#152238';
                      }}
                    >
                      <Flame size={13} color="#EA580C" />
                      <span>{trend}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

