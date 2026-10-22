import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function InventoryView({ showToast }) {
  const [inventory, setInventory] = useState([
    { id: 'INV-01', item: 'R32 Refrigerant Gas Cylinder (7kg)', category: 'Gas & Chemicals', qty: 2.4, unit: 'kg', minThreshold: 3.0, status: 'Low Stock' },
    { id: 'INV-02', item: 'Powerjet Coil Cleaning Foam Spray', category: 'Cleaning Agents', qty: 3, unit: 'cans', minThreshold: 2, status: 'In Stock' },
    { id: 'INV-03', item: 'Universal Inverter Capacitors (45µF)', category: 'Electrical Spares', qty: 4, unit: 'units', minThreshold: 2, status: 'In Stock' },
    { id: 'INV-04', item: 'Flaring Copper Tubing & Flare Nuts (1/4")', category: 'Hardware', qty: 6, unit: 'sets', minThreshold: 3, status: 'In Stock' },
    { id: 'INV-05', item: 'Antibacterial Filter Disinfectant Fluid', category: 'Cleaning Agents', qty: 1.5, unit: 'litres', minThreshold: 1.0, status: 'In Stock' }
  ]);

  // Restock modal
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [restockQty, setRestockQty] = useState(1);
  const [hubName, setHubName] = useState('Bandra West Central Hub');

  useEffect(() => {
    professionalClient.getInventory().then(data => {
      if (data.success && data.inventory) {
        setInventory(data.inventory);
      }
    }).catch(() => {});
  }, []);

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await professionalClient.requestRestock({
        itemId: selectedItem,
        quantity: restockQty,
        hub: hubName
      });
      showToast(`Restock request sent to ${hubName}! Ready for collection today.`);
      setShowRestockModal(false);
    } catch (err) {
      showToast(err.message || 'Restock request failed');
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Technician Tool Kit & Consumables
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Track service parts on hand and order genuine Urban Company spares from your local hub
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedItem(inventory[0]?.item || '');
            setShowRestockModal(true);
          }}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Request Hub Restock
        </button>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {inventory.some(i => i.status === 'Low Stock') && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
              R32 Refrigerant Gas Below Minimum Threshold
            </div>
            <div style={{ fontSize: 12, color: '#b45309' }}>
              You have 2.4 kg remaining. Top-up at Bandra West Central Hub before starting afternoon AC gas leak bookings.
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>ITEM CODE</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>CONSUMABLE / PART NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>CURRENT STOCK</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#2563eb' }}>{item.id}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#0f172a' }}>{item.item}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0f172a' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      background: item.status === 'Low Stock' ? '#fef2f2' : '#ecfdf5',
                      color: item.status === 'Low Stock' ? '#dc2626' : '#059669',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedItem(item.item);
                        setShowRestockModal(true);
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
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
            padding: 24,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Consumable Restock
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Pick up at hub or have supplies dispatched to your mobile service kit.
            </p>

            <form onSubmit={handleRestock}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Item to Restock
                </label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.item}>{i.item}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Fulfillment Hub Location
                </label>
                <select
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Bandra West Central Hub">Bandra West Central Hub (0.8 km)</option>
                  <option value="Andheri East Logistics Hub">Andheri East Logistics Hub (4.2 km)</option>
                  <option value="Dadar South Mumbai Depot">Dadar South Mumbai Depot (6.1 km)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
