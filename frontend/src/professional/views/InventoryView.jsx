import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function InventoryView({ showToast }) {
  const [ownershipTab, setOwnershipTab] = useState('ALL');
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restock modal
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState('');
  const [restockQty, setRestockQty] = useState(2);
  const [hubName, setHubName] = useState('Bandra West Central Hub');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Return/Damaged modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState('');
  const [returnSerial, setReturnSerial] = useState('');
  const [returnReason, setReturnReason] = useState('damaged_in_transit');
  const [returnQty, setReturnQty] = useState(1);
  const [returnDesc, setReturnDesc] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = await professionalClient.getInventory();
      if (data.success) {
        if (data.inventory) setInventory(data.inventory);
        if (data.lowStockAlerts) setLowStockAlerts(data.lowStockAlerts);
        if (data.returns) setReturns(data.returns);
      }
    } catch (err) {
      console.warn('Inventory load warning:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedRestockItem) return;

    setSubmittingRestock(true);
    try {
      const res = await professionalClient.requestRestock({
        itemId: selectedRestockItem,
        requestedQty: restockQty,
        hub: hubName
      });

      if (res.success) {
        if (showToast) showToast(res.message || 'Restock request confirmed at central depot.');
        setShowRestockModal(false);
        loadInventory();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Restock request failed');
    } finally {
      setSubmittingRestock(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === returnItem);
    if (!item) return;

    if (returnQty > item.qty) {
      if (showToast) showToast(`Cannot return ${returnQty} units. Only ${item.qty} units available in stock.`);
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await professionalClient.reportDamagedItem({
        itemId: returnItem,
        serialNumber: returnSerial || item.serialNumber,
        reason: returnReason,
        quantity: returnQty,
        description: returnDesc
      });

      if (res.success) {
        if (showToast) showToast(`Damaged item report ${res.returnTicket?.returnId || ''} created.`);
        if (res.returnTicket) {
          setReturns(prev => [res.returnTicket, ...prev]);
        }
        setShowReturnModal(false);
        setReturnDesc('');
        loadInventory();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to submit return report');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const filteredInventory = inventory.filter(i => {
    if (ownershipTab === 'ALL') return true;
    return i.ownershipType === ownershipTab;
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Equipment, Consumables & Inventory
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Track technician-owned gear, business-assigned assets, and genuine platform consumable replenishments
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              if (inventory.length > 0) setReturnItem(inventory[0].id);
              setShowReturnModal(true);
            }}
            style={{
              background: '#ffffff',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚠️ Report Damaged / Return
          </button>
          <button
            onClick={() => {
              if (inventory.length > 0) setSelectedRestockItem(inventory[0].id);
              setShowRestockModal(true);
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Request Hub Restock
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {lowStockAlerts.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
              Low Consumable Alert: {lowStockAlerts.map(i => `${i.item} (${i.qty} ${i.unit} remaining)`).join(', ')}
            </div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
              Stock level has fallen below minimum replenishment threshold ({lowStockAlerts[0]?.minThreshold} {lowStockAlerts[0]?.unit}). Top-up at Bandra West Central Hub before starting afternoon bookings.
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs by Ownership Model */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Inventory Items' },
          { id: 'personal', label: 'Personal Stock (Technician Owned)' },
          { id: 'business_owned', label: 'Business-Owned Stock (Agency Assigned)' },
          { id: 'platform_order', label: 'Platform Supply Orders (Central Consumables)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setOwnershipTab(tab.id)}
            style={{
              background: ownershipTab === tab.id ? '#0f172a' : '#f8fafc',
              color: ownershipTab === tab.id ? '#ffffff' : '#475569',
              border: `1px solid ${ownershipTab === tab.id ? '#0f172a' : '#cbd5e1'}`,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>SKU & ITEM NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>OWNERSHIP & CUSTODY</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>SERIAL / ASSET ID</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>CURRENT QTY</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>THRESHOLD</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.item}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      background: item.ownershipType === 'personal' ? '#eff6ff' : item.ownershipType === 'business_owned' ? '#fef3c7' : '#ecfdf5',
                      color: item.ownershipType === 'personal' ? '#1d4ed8' : item.ownershipType === 'business_owned' ? '#b45309' : '#047857',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {item.ownershipLabel || item.ownershipType}
                    </span>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {item.assignedBy}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#475569', fontSize: 12 }}>
                    {item.serialNumber || '—'}
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                    {item.qty} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>{item.unit}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>
                    {item.minThreshold} {item.unit}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      background: item.status === 'Low Stock' ? '#fef2f2' : item.status === 'Assigned Equipment' ? '#f1f5f9' : '#ecfdf5',
                      color: item.status === 'Low Stock' ? '#b91c1c' : item.status === 'Assigned Equipment' ? '#334155' : '#047857',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {item.status === 'Low Stock' ? '⚠️ Low Stock' : item.status === 'Assigned Equipment' ? '🛡️ Assigned Tool' : '✓ In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return & Damaged Reports Register */}
      {returns.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Damaged Item & Defect Return Register
          </h3>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Logged return tickets undergoing physical inspection and warranty exchange at central logistics depots
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {returns.map(ret => (
              <div
                key={ret.returnId}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {ret.returnId} • {ret.itemName} ({ret.quantity} units)
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Reason: <strong>{ret.reason?.replace(/_/g, ' ')}</strong> • Serial: {ret.serialNumber} • Note: {ret.description}
                  </div>
                </div>
                <span style={{
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  ⏳ {ret.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Central Hub Restock
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Spares and chemicals reserved for same-day pickup at your regional dispatch depot.
            </p>

            <form onSubmit={handleRestock}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Select Item to Restock
                </label>
                <select
                  value={selectedRestockItem}
                  onChange={(e) => setSelectedRestockItem(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  {inventory.filter(i => i.ownershipType === 'platform_order').map(i => (
                    <option key={i.id} value={i.id}>{i.item} (Current: {i.qty} {i.unit})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Quantity to Replenish
                </label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Collection Logistics Depot
                </label>
                <select
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="Bandra West Central Hub">Bandra West Central Hub</option>
                  <option value="Andheri Central Logistics Depot">Andheri Central Logistics Depot</option>
                  <option value="Dadar South Logistics Hub">Dadar South Logistics Hub</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRestock}
                  style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingRestock ? 'Reserving...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return / Damaged Item Modal */}
      {showReturnModal && (
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
            maxWidth: 480,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Report Damaged Tool or Return Item
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
              Report defective spares or return broken equipment for depot inspection and warranty swap.
            </p>

            <form onSubmit={handleReturnSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Select Item
                </label>
                <select
                  value={returnItem}
                  onChange={(e) => setReturnItem(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.item} (Available: {i.qty} {i.unit})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Defect Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    <option value="damaged_in_transit">Damaged in Transit</option>
                    <option value="defective_out_of_box">Defective Out of Box</option>
                    <option value="normal_wear_and_tear">Normal Wear & Tear</option>
                    <option value="expired_chemical">Expired Chemical / Agent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Return Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={returnQty}
                    onChange={(e) => setReturnQty(parseFloat(e.target.value) || 1)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Serial Number / Asset Barcode
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN-FLK-88219"
                  value={returnSerial}
                  onChange={(e) => setReturnSerial(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Defect Description & Incident Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe crack, leak, or electrical malfunction..."
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  style={{ flex: 1.5, background: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingReturn ? 'Submitting...' : 'Register Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
