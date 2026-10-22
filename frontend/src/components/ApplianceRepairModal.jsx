import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function ApplianceRepairModal({ isOpen, onClose, onSelectAppliance }) {
  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 9 Appliance items exactly matching the official Urban Company modal screenshot
  const APPLIANCES = [
    {
      id: 'ac',
      name: 'AC',
      image: '/images/appliance_ac.jpg',
      category: 'ac-appliances',
      subcategory: 'AC Service & Repair',
      searchQuery: 'AC'
    },
    {
      id: 'chimney',
      name: 'Chimney Repair',
      image: '/images/appliance_chimney.jpg',
      category: 'ac-appliances',
      subcategory: 'Chimney',
      searchQuery: 'Chimney'
    },
    {
      id: 'geyser',
      name: 'Geyser Service & Repair',
      image: '/images/appliance_geyser.jpg',
      category: 'ac-appliances',
      subcategory: 'Geyser',
      searchQuery: 'Geyser'
    },
    {
      id: 'laptop',
      name: 'Laptop Repair',
      image: '/images/appliance_laptop.jpg',
      category: 'ac-appliances',
      subcategory: 'Laptop',
      searchQuery: 'Laptop'
    },
    {
      id: 'refrigerator',
      name: 'Refrigerator',
      image: '/images/appliance_fridge.jpg',
      category: 'ac-appliances',
      subcategory: 'Refrigerator',
      searchQuery: 'Refrigerator'
    },
    {
      id: 'washing-machine',
      name: 'Washing Machine Repair',
      image: '/images/appliance_washer.jpg',
      category: 'ac-appliances',
      subcategory: 'Washing Machine',
      searchQuery: 'Washing Machine'
    },
    {
      id: 'microwave',
      name: 'Microwave',
      image: '/images/appliance_microwave.jpg',
      category: 'ac-appliances',
      subcategory: 'Microwave',
      searchQuery: 'Microwave'
    },
    {
      id: 'television',
      name: 'Television Repair',
      image: '/images/appliance_tv.jpg',
      category: 'ac-appliances',
      subcategory: 'Television',
      searchQuery: 'Television'
    },
    {
      id: 'water-purifier',
      name: 'Water Purifier Service & Installation',
      image: '/images/appliance_water_purifier.jpg?v=4',
      category: 'native-ro',
      subcategory: 'Water Purifier',
      searchQuery: 'Water Purifier'
    }
  ];

  return (
    <div 
      className="appliance-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Main White Modal Card */}
      <div
        className="appliance-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: 580,
          padding: '28px 28px 32px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header with Title & Cancel Button on Right Side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            Appliance Repair & Service
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="appliance-modal-close"
            title="Close"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              border: 'none',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
              e.currentTarget.style.color = '#111827';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* 3x3 Grid of 9 Appliances */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          columnGap: 14,
          rowGap: 18
        }}>
          {APPLIANCES.map((appliance) => (
            <div
              key={appliance.id}
              onClick={() => onSelectAppliance(appliance)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                textAlign: 'center'
              }}
            >
              {/* Light Gray Rounded Tile Box */}
              <div
                className="appliance-tile-box"
                style={{
                  width: '100%',
                  height: 86,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease, box-shadow 0.18s ease',
                  border: '1px solid #F1F3F5'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.backgroundColor = '#F0F3F6';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#F1F3F5';
                }}
              >
                <img
                  src={appliance.image}
                  alt={appliance.name}
                  style={{
                    maxWidth: 72,
                    maxHeight: 52,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>

              {/* Text Label Below Tile */}
              <span style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#1F2937',
                textAlign: 'center',
                lineHeight: 1.25,
                minHeight: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {appliance.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
