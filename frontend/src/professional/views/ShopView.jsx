import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function ShopView({ profile, showToast }) {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buy Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('direct_courier');
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    loadShop();
  }, []);

  async function loadShop() {
    setLoading(true);
    try {
      const data = await professionalClient.getShopItems();
      if (data.success) {
        if (data.items) setItems(data.items);
        if (data.orderHistory) setOrders(data.orderHistory);
      }
    } catch (err) {
      console.warn('Shop load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsOrdering(true);
    try {
      const res = await professionalClient.placeShopOrder({
        itemId: selectedItem.id,
        quantity: orderQty,
        deliveryMethod
      });

      if (res.success) {
        if (showToast) showToast(res.message || 'Order placed successfully!');
        if (res.order) {
          setOrders(prev => [res.order, ...prev]);
        }
        setSelectedItem(null);
        setOrderQty(1);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Order failed');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title & Sandbox Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Urban Pro Equipment & Uniform Store
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Certified diagnostic tools, compliant workwear, and specialized high-pressure machinery
          </div>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          color: '#92400e',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🛡️</span>
          <span>Sandbox Mode • Simulated Orders Only</span>
        </div>
      </div>

      {/* Grid of Store Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20, marginBottom: 32 }}>
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

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                {item.specs || item.description}
              </p>

              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginBottom: 16 }}>
                ✓ {item.availableStock || 25} units in stock for Krishnagiri Town direct delivery
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Includes GST & delivery</div>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(item);
                  setOrderQty(1);
                }}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Order Item
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order History Table */}
      {orders.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
            Equipment & Uniform Order History
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>ORDER ID</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>ITEM</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>QTY</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>TOTAL AMOUNT</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>DELIVERY / PICKUP</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>FULFILMENT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: '#2563eb' }}>{ord.orderId}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f172a' }}>{ord.item}</td>
                    <td style={{ padding: '10px 8px', color: '#475569' }}>{ord.qty}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>₹{ord.amount}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{ord.deliveryMethod}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        ✓ {ord.fulfilmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buy Order Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Confirm Equipment Order
            </h3>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              {selectedItem.title}
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Order Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Fulfilment Method
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="direct_courier">Direct Doorstep Courier to Krishnagiri Base</option>
                  <option value="express_courier">Express Service Base Courier (24h)</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                <span>Total Amount:</span>
                <span style={{ fontWeight: 800, fontSize: 15 }}>₹{(selectedItem.price * orderQty).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOrdering}
                  style={{ flex: 1.5, background: '#0f172a', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {isOrdering ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
