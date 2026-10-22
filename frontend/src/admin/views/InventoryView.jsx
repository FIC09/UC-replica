import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  History,
  ShieldCheck,
  Building2,
  HardHat,
  X,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function InventoryView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'supply-orders'
  const [items, setItems] = useState([]);
  const [supplyOrders, setSupplyOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Stock Adjustment Modal
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Restock Inward Delivery');
  const [adjusting, setAdjusting] = useState(false);

  // Stock Movement History Drawer
  const [historyItem, setHistoryItem] = useState(null);

  // Fulfilling Supply Order
  const [fulfillingId, setFulfillingId] = useState(null);

  useEffect(() => {
    loadInventory();
    loadSupplyOrders();
  }, []);

  function loadInventory() {
    adminClient.getInventory()
      .then(res => setItems(res.inventory || []))
      .catch(() => {});
  }

  function loadSupplyOrders() {
    adminClient.getSupplyOrders()
      .then(res => setSupplyOrders(res.orders || []))
      .catch(() => {});
  }

  // Handle stock adjustment with reason & negative stock guard
  async function handleConfirmAdjustment(e) {
    e.preventDefault();
    if (!adjustModalItem) return;
    setAdjusting(true);

    const deltaNum = parseInt(adjustDelta, 10);
    if (isNaN(deltaNum)) {
      setAdjusting(false);
      return;
    }

    // Client-side negative stock check
    if (adjustModalItem.currentStock + deltaNum < 0) {
      if (onShowToast) onShowToast(`Error: Stock cannot fall below 0. Max reduction is ${adjustModalItem.currentStock}.`);
      setAdjusting(false);
      return;
    }

    try {
      const res = await adminClient.adjustInventoryStock(adjustModalItem.id, deltaNum, adjustReason);
      if (res.success) {
        setItems(prev => prev.map(i => i.id === adjustModalItem.id ? res.item : i));
        setAdjustModalItem(null);
        if (onShowToast) onShowToast(res.message);
      } else {
        if (onShowToast) onShowToast(`Error: ${res.error || 'Failed to adjust stock'}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setAdjusting(false);
    }
  }

  // Handle supply order fulfillment with idempotency protection
  async function handleFulfillOrder(order) {
    if (order.status === 'Approved & Fulfilled') {
      if (onShowToast) onShowToast(`⚠️ Order #${order.id} has already been fulfilled.`);
      return;
    }

    setFulfillingId(order.id);
    const idemKey = `idem_supply_${order.id}_${Date.now()}`;

    try {
      const res = await adminClient.fulfillSupplyOrder(order.id, idemKey);
      if (res.success) {
        setSupplyOrders(prev => prev.map(o => o.id === order.id ? res.order : o));
        loadInventory(); // Refresh stock counts
        if (onShowToast) onShowToast(res.message);
      } else {
        if (onShowToast) onShowToast(`Error: ${res.error}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setFulfillingId(null);
    }
  }

  const filteredItems = items.filter(i => {
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (i.itemName || '').toLowerCase().includes(q) ||
        (i.sku || '').toLowerCase().includes(q) ||
        (i.supplier || '').toLowerCase().includes(q) ||
        (i.warehouse || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header and Controls */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Inventory, Toolkits & Consumables
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0'
              }}>
                Negative Stock Protected
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
              Track warehouse depot inventory, allocated technician kits, reorder thresholds, and partner supply orders.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', paddingBottom: 2 }}>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'inventory' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'inventory' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Package size={16} />
            <span>Warehouse Inventory & SKUs</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: activeTab === 'inventory' ? '#F3E8FF' : '#F1F5F9',
              color: activeTab === 'inventory' ? '#6E42E5' : '#64748B'
            }}>
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supply-orders')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'supply-orders' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'supply-orders' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Truck size={16} />
            <span>Pro & Partner Supply Orders</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontWeight: 700
            }}>
              {supplyOrders.filter(o => o.status === 'Requested').length} Pending
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTORY ITEMS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '14px 20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#F8FAFC',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '8px 12px',
                width: 280
              }}>
                <Search size={16} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search SKU, Item, Supplier..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Category:</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Equipment & Machines">Equipment & Machines</option>
                  <option value="Cleaning Chemicals">Cleaning Chemicals</option>
                  <option value="Protective Gear">Protective Gear</option>
                  <option value="Electrical Testing Tools">Electrical Testing Tools</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>SKU & Item Name</th>
                  <th style={{ padding: '12px 18px' }}>Category & Supplier</th>
                  <th style={{ padding: '12px 18px' }}>Warehouse Hub</th>
                  <th style={{ padding: '12px 18px' }}>In Stock</th>
                  <th style={{ padding: '12px 18px' }}>Reorder Threshold</th>
                  <th style={{ padding: '12px 18px' }}>Allocated to Pros</th>
                  <th style={{ padding: '12px 18px' }}>Unit Cost</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(i => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{i.itemName}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace', marginTop: 2 }}>
                        {i.sku}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#334155', fontWeight: 600 }}>{i.category}</div>
                      <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{i.supplier}</div>
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748B' }}>{i.warehouse}</td>

                    <td style={{ padding: '14px 18px', fontWeight: 800, color: i.currentStock <= i.minThreshold ? '#DC2626' : '#0F172A', fontSize: 14 }}>
                      {i.currentStock} units
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748B' }}>
                      Min: {i.minThreshold} units
                    </td>

                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      {i.allocatedToPros} deployed
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>
                      ₹{i.unitCost}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: i.status === 'In Stock' ? '#ECFDF5' : '#FEF2F2',
                        color: i.status === 'In Stock' ? '#059669' : '#DC2626'
                      }}>
                        {i.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setHistoryItem(i)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          Log
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustModalItem(i);
                            setAdjustDelta(10);
                            setAdjustReason('Restock Inward Delivery');
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: '#6E42E5',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            cursor: 'pointer'
                          }}
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRO & PARTNER SUPPLY ORDERS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'supply-orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Order Ref & Hub</th>
                  <th style={{ padding: '12px 18px' }}>Requested By</th>
                  <th style={{ padding: '12px 18px' }}>Item & SKU</th>
                  <th style={{ padding: '12px 18px' }}>Quantity & Value</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Fulfillment Action</th>
                </tr>
              </thead>
              <tbody>
                {supplyOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#6E42E5' }}>{o.orderNumber}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{o.targetHub}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {o.beneficiaryRole === 'Business Partner Agency' ? <Building2 size={14} color="#6E42E5" /> : <HardHat size={14} color="#059669" />}
                        <span>{o.requestedBy}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{o.beneficiaryRole}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{o.itemName}</div>
                      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>{o.sku}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{o.quantity} units</div>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>Total: ₹{o.totalCost} (₹{o.unitCost}/unit)</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: o.status === 'Approved & Fulfilled' ? '#ECFDF5' : '#FEF3C7',
                        color: o.status === 'Approved & Fulfilled' ? '#059669' : '#92400E'
                      }}>
                        {o.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {o.status === 'Requested' ? (
                        <button
                          type="button"
                          disabled={fulfillingId === o.id}
                          onClick={() => handleFulfillOrder(o)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: fulfillingId === o.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {fulfillingId === o.id ? 'Fulfilling...' : 'Fulfill & Deduct Stock'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                          ✓ Dispatched by {o.fulfilledBy || 'Warehouse Lead'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STOCK ADJUSTMENT WITH MANDATORY REASON                             */}
      {/* ========================================================================= */}
      {adjustModalItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={18} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Adjust Stock Level: {adjustModalItem.sku}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustment}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  fontSize: 13
                }}>
                  <div>Item: <strong style={{ color: '#0F172A' }}>{adjustModalItem.itemName}</strong></div>
                  <div style={{ marginTop: 2, color: '#64748B' }}>
                    Current Warehouse Balance: <strong style={{ color: '#059669' }}>{adjustModalItem.currentStock} units</strong>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Stock Delta Adjustment (+ or -)
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 6, boxSizing: 'border-box', fontSize: 15, fontWeight: 800 }}
                  />
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                    Projected New Balance: <strong>{adjustModalItem.currentStock + (parseInt(adjustDelta, 10) || 0)} units</strong>
                  </div>
                  {adjustModalItem.currentStock + (parseInt(adjustDelta, 10) || 0) < 0 && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 700 }}>
                      ⚠️ Error: Stock cannot drop below zero.
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Reason for Adjustment
                  </label>
                  <select
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 6, boxSizing: 'border-box' }}
                  >
                    <option value="Restock Inward Delivery">Restock Inward Delivery</option>
                    <option value="Damage / Breakage in Warehouse">Damage / Breakage in Warehouse</option>
                    <option value="Allocated to Pro Onboarding Kit">Allocated to Pro Onboarding Kit</option>
                    <option value="Physical Audit Reconciliation">Physical Audit Reconciliation</option>
                    <option value="Warranty Return / Replacement">Warranty Return / Replacement</option>
                  </select>
                </div>
              </div>

              <div style={{
                padding: '14px 24px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || adjustModalItem.currentStock + (parseInt(adjustDelta, 10) || 0) < 0}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: adjusting || adjustModalItem.currentStock + (parseInt(adjustDelta, 10) || 0) < 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {adjusting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: STOCK MOVEMENT HISTORY LOG                                        */}
      {/* ========================================================================= */}
      {historyItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            width: '100%',
            maxWidth: 500,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                  Stock Movement Ledger
                </h3>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {historyItem.itemName} ({historyItem.sku})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {historyItem.movements?.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748B', padding: '36px 0' }}>
                  No movement records logged yet for this item.
                </div>
              ) : (
                historyItem.movements?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{m.reason}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        By {m.actor} on {m.date}
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: m.delta > 0 ? '#059669' : '#DC2626'
                    }}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
