import React, { useState } from 'react';

export function ShopView({ profile, showToast }) {
  const [items, setItems] = useState([
    {
      id: 'SHP-01',
      title: 'Official Urban Pro Polo Uniform (Pack of 3)',
      category: 'Branded Workwear',
      price: 899,
      rating: 4.9,
      inStock: true,
      description: 'Breathable dry-fit polyester blend with embroidered Urban Company Pro partner emblem. Sweat-resistant.'
    },
    {
      id: 'SHP-02',
      title: 'Powerjet Commercial AC Foam Washer Unit (120 Bar)',
      category: 'Professional Machinery',
      price: 4499,
      rating: 5.0,
      inStock: true,
      description: 'High-pressure compact jet pump designed for indoor split AC coil deep servicing with variable spray nozzle.'
    },
    {
      id: 'SHP-03',
      title: 'Digital True-RMS Multimeter & Clamp Sensor',
      category: 'Diagnostic Tools',
      price: 1850,
      rating: 4.8,
      inStock: true,
      description: 'Accurately tests capacitor capacitance, compressor running amperage, and inverter communication voltages.'
    },
    {
      id: 'SHP-04',
      title: 'Waterproof Indoor Split AC Service Bag & Drain Hose',
      category: 'Spill Prevention',
      price: 650,
      rating: 4.9,
      inStock: true,
      description: 'Prevents wastewater splashing onto customer walls and wood floors during indoor powerjet deep cleans.'
    },
    {
      id: 'SHP-05',
      title: 'Full PPE Safety Kit (Goggles, Gloves, Shoe Covers)',
      category: 'Safety & Compliance',
      price: 499,
      rating: 4.9,
      inStock: true,
      description: '1000V electrical shock-insulated gloves, anti-fog polycarbonate goggles, and 50 pairs of reusable shoe covers.'
    }
  ]);

  const handleBuy = (item) => {
    showToast(`Order placed for ${item.title}! ₹${item.price} deducted from wallet balance.`);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Urban Pro Official Equipment & Uniform Store
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Certified tools, compliant workwear, and diagnostic gear approved for Level 5 service standards
        </div>
      </div>

      {/* Grid of Store Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
                  ★ {item.rating}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                {item.title}
              </h3>

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                {item.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Includes GST & delivery</div>
              </div>

              <button
                onClick={() => handleBuy(item)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Buy with Wallet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
