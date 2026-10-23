import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  X,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  History,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  Boxes,
  UserCheck
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function InventoryView({ showToast, staff }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders' | 'allocations' | 'movements'
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [supplyOrders, setSupplyOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderingItem, setOrderingItem] = useState(null);
  const [orderQty, setOrderQty] = useState(2);
  const [orderAddress, setOrderAddress] = useState('Bandra Central Depot, 18 Hill Road, Mumbai 400050');
  const [orderNotes, setOrderNotes] = useState('Standard operational restock');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Allocate Modal state
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocItem, setAllocItem] = useState(null);
  const [allocProId, setAllocProId] = useState('');
  const [allocQty, setAllocQty] = useState(1);
  const [allocPurpose, setAllocPurpose] = useState('');
  const [allocating, setAllocating] = useState(false);

  // Adjust Modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjItem, setAdjItem] = useState(null);
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Return Modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [retItem, setRetItem] = useState(null);
  const [retProId, setRetProId] = useState('');
  const [retQty, setRetQty] = useState(1);
  const [retCondition, setRetCondition] = useState('Good');
  const [retReason, setRetReason] = useState('');
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    loadAllInventoryData();
  }, []);

  async function loadAllInventoryData() {
    setLoading(true);
    try {
      const [invRes, ordersRes, movRes, teamRes] = await Promise.allSettled([
        partnerClient.getInventory(),
        partnerClient.getSupplyOrders(),
        partnerClient.getInventoryMovements(),
        partnerClient.getTeam()
      ]);

      if (invRes.status === 'fulfilled' && invRes.value?.success) {
        setInventory(invRes.value.items || invRes.value.inventory || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        setSupplyOrders(ordersRes.value.orders || []);
      }
      if (movRes.status === 'fulfilled' && movRes.value?.success) {
        setMovements(movRes.value.movements || []);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value?.success) {
        setTeamMembers(teamRes.value.team || []);
      }
    } catch (err) {
      showToast?.('Error loading inventory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle Placing Supply Order (Sandbox Demo Mode)
  async function handleConfirmSupplyOrder(e) {
    e.preventDefault();
    if (!orderingItem || orderQty < 1) return;

    setSubmittingOrder(true);
    try {
      const payload = {
        items: [
          {
            itemId: orderingItem.id,
            quantity: Number(orderQty)
          }
        ],
        deliveryAddress: orderAddress,
        notes: orderNotes
      };

      const res = await partnerClient.createSupplyOrder(payload);
      if (res && res.success) {
        showToast?.(res.message || 'Supply order placed in demo sandbox mode.');
        setOrderModalOpen(false);
        setOrderingItem(null);
        setOrderQty(2);
        loadAllInventoryData();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to place supply order');
    } finally {
      setSubmittingOrder(false);
    }
  }

  // Handle Goods Received Confirmation (Replenishes physical stock)
  async function handleConfirmGoodsReceived(order) {
    if (!window.confirm(`Confirm goods physical receipt for Order #${order.orderNumber}? Stock quantities will be automatically credited.`)) {
      return;
    }

    try {
      const res = await partnerClient.receiveSupplyOrderGoods(order.id);
      if (res && res.success) {
        showToast?.(res.message || 'Goods receipt confirmed. Stock quantities updated.');
        loadAllInventoryData();
      }
    } catch (err) {
      showToast?.(err.message || 'Goods receipt confirmation failed');
    }
  }

  // Handle Professional Stock Allocation
  async function handleAllocateStock(e) {
    e.preventDefault();
    if (!allocItem || !allocProId || allocQty < 1) {
      showToast?.('Select technician and valid allocation quantity.');
      return;
    }

    const available = allocItem.inStock - (allocItem.allocatedQuantity || 0);
    if (allocQty > available) {
      showToast?.(`Allocation exceeds available stock (${available} units available).`);
      return;
    }

    setAllocating(true);
    try {
      const res = await partnerClient.allocateInventory({
        itemId: allocItem.id,
        professionalId: allocProId,
        quantity: allocQty,
        purpose: allocPurpose || 'Field job toolkit provisioning'
      });

      if (res && res.success) {
        showToast?.(res.message || 'Stock allocated to professional.');
        setAllocateModalOpen(false);
        setAllocItem(null);
        setAllocProId('');
        setAllocQty(1);
        setAllocPurpose('');
        loadAllInventoryData();
      }
    } catch (err) {
      showToast?.(err.message || 'Stock allocation failed');
    } finally {
      setAllocating(false);
    }
  }

  // Handle Inventory Manual Adjustment
  async function handleAdjustStock(e) {
    e.preventDefault();
    if (!adjItem) return;
    if (!adjReason || adjReason.trim().length < 5) {
      showToast?.('Mandatory reason required for inventory adjustment (min 5 characters).');
      return;
    }

    const delta = Number(adjQty);
    if (isNaN(delta) || delta === 0) {
      showToast?.('Enter a valid non-zero adjustment amount.');
      return;
    }

    if (adjItem.inStock + delta < 0) {
      showToast?.('Adjustment rejected: Resulting stock cannot be negative.');
      return;
    }

    setAdjusting(true);
    try {
      const res = await partnerClient.adjustInventory({
        itemId: adjItem.id,
        adjustmentQty: delta,
        reason: adjReason.trim()
      });

      if (res && res.success) {
        showToast?.(res.message || 'Inventory adjusted.');
        setAdjustModalOpen(false);
        setAdjItem(null);
        setAdjQty(0);
        setAdjReason('');
        loadAllInventoryData();
      }
    } catch (err) {
      showToast?.(err.message || 'Stock adjustment failed');
    } finally {
      setAdjusting(false);
    }
  }

  // Handle Stock Return from Professional
  async function handleReturnStock(e) {
    e.preventDefault();
    if (!retItem || !retProId || retQty < 1) {
      showToast?.('Select item, technician, and return quantity.');
      return;
    }
    if (!retReason || retReason.trim().length < 5) {
      showToast?.('Mandatory return reason required (min 5 characters).');
      return;
    }

    setReturning(true);
    try {
      const res = await partnerClient.returnInventory({
        itemId: retItem.id,
        professionalId: retProId,
        quantity: retQty,
        condition: retCondition,
        reason: retReason.trim()
      });

      if (res && res.success) {
        showToast?.(res.message || 'Stock return recorded.');
        setReturnModalOpen(false);
        setRetItem(null);
        setRetProId('');
        setRetQty(1);
        setRetReason('');
        loadAllInventoryData();
      }
    } catch (err) {
      showToast?.(err.message || 'Stock return failed');
    } finally {
      setReturning(false);
    }
  }

  const canEdit = staff?.permissions?.editing !== false;

  // Filtered catalog
  const filteredCatalog = inventory.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockItems = inventory.filter(i => (i.inStock || 0) <= (i.reorderThreshold || i.minimumThreshold || 3));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Inventory, Tools & Supply Orders
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Multi-category stock management, reorder thresholds, field allocations, and chronological movement ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#475569', border: '1px solid #e2e8f0' }}>
            <Package size={16} color="#7c3aed" /> Depot: Bandra West Central
          </div>
          {canEdit && (
            <button
              onClick={() => {
                if (inventory.length > 0) {
                  setOrderingItem(inventory[0]);
                  setOrderQty(2);
                  setOrderModalOpen(true);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> New Supply Order
            </button>
          )}
        </div>
      </div>

      {/* Sandbox Demo Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        borderRadius: 12,
        padding: '14px 20px',
        border: '1px solid #a7f3d0',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#065f46', lineHeight: 1.5 }}>
          <strong>Local Sandbox Mode:</strong> Supply orders, shipments, and vendor restock workflows are managed in local demo mode. Negative stock, duplicate deductions, and cross-business inventory allocations are strictly blocked by server-side invariant rules.
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            color: activeTab === 'catalog' ? '#7c3aed' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Boxes size={16} /> Stock Inventory ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            color: activeTab === 'orders' ? '#7c3aed' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Truck size={16} /> Supply Orders ({supplyOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('allocations')}
          style={{
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            color: activeTab === 'allocations' ? '#7c3aed' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'allocations' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <UserCheck size={16} /> Technician Allocations
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          style={{
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            color: activeTab === 'movements' ? '#7c3aed' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'movements' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <History size={16} /> Movement History Ledger ({movements.length})
        </button>
      </div>

      {/* Low Stock Warning Banner if any items triggered reorder threshold */}
      {lowStockItems.length > 0 && activeTab === 'catalog' && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 10,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#d97706" />
            <span style={{ fontSize: 13, color: '#92400e' }}>
              <strong>Low Stock Threshold Alert:</strong> {lowStockItems.length} item(s) are at or below safety reorder threshold ({lowStockItems.map(i => i.itemName).join(', ')}).
            </span>
          </div>
          {canEdit && (
            <button
              onClick={() => {
                setOrderingItem(lowStockItems[0]);
                setOrderQty(Math.max(4, (lowStockItems[0].reorderThreshold || 3) * 2));
                setOrderModalOpen(true);
              }}
              style={{
                padding: '6px 14px',
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Restock {lowStockItems[0].itemName}
            </button>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: CATALOG & INVENTORY STOCKS                                 */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Controls: Search and Categories */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', width: 260 }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search items, tools, SKUs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL', 'Consumables', 'Hardware Tools', 'Products', 'Uniform & Gear'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    background: selectedCategory === cat ? '#7c3aed' : '#f1f5f9',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Loading inventory stocks...
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
              No inventory items matched your filter.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {filteredCatalog.map(item => {
                const available = (item.inStock || 0) - (item.allocatedQuantity || 0);
                const isLow = (item.inStock || 0) <= (item.reorderThreshold || item.minimumThreshold || 3);

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: isLow ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '3px 8px', borderRadius: 4 }}>
                          {item.category}
                        </span>
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: isLow ? '#fef3c7' : '#dcfce7',
                          color: isLow ? '#b45309' : '#16a34a'
                        }}>
                          {isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                        {item.itemName}
                      </h3>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
                        SKU: <strong style={{ color: '#475569' }}>{item.sku}</strong> • Rate: ₹{item.unitPrice}
                      </div>

                      {/* Stock Breakdown */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: 8,
                        gap: 8,
                        textAlign: 'center',
                        marginBottom: 14
                      }}>
                        <div>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Total Stock</span>
                          <strong style={{ fontSize: 14, color: '#0f172a' }}>{item.inStock}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Allocated</span>
                          <strong style={{ fontSize: 14, color: '#2563eb' }}>{item.allocatedQuantity || 0}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Available</span>
                          <strong style={{ fontSize: 14, color: available > 0 ? '#16a34a' : '#dc2626' }}>{available}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                        Reorder Threshold: <strong>{item.reorderThreshold || item.minimumThreshold || 3} units</strong>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    {canEdit && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                        <button
                          onClick={() => {
                            setOrderingItem(item);
                            setOrderQty(2);
                            setOrderModalOpen(true);
                          }}
                          style={{
                            padding: '8px 10px',
                            background: '#0f172a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <Plus size={13} /> Reorder
                        </button>

                        <button
                          onClick={() => {
                            setAllocItem(item);
                            setAllocQty(1);
                            setAllocateModalOpen(true);
                          }}
                          disabled={available <= 0}
                          style={{
                            padding: '8px 10px',
                            background: available > 0 ? '#7c3aed' : '#cbd5e1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: available > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <UserCheck size={13} /> Allocate
                        </button>

                        <button
                          onClick={() => {
                            setAdjItem(item);
                            setAdjQty(0);
                            setAdjReason('');
                            setAdjustModalOpen(true);
                          }}
                          style={{
                            gridColumn: 'span 2',
                            padding: '6px 10px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Manual Stock Adjustment / Audit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: SUPPLY ORDERS                                              */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Replenishment Supply Orders</h2>
              <span style={{ fontSize: 12.5, color: '#64748b' }}>Confirm receipt of goods to update depot physical inventory</span>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  if (inventory.length > 0) {
                    setOrderingItem(inventory[0]);
                    setOrderQty(4);
                    setOrderModalOpen(true);
                  }
                }}
                style={{ padding: '7px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                + Place Order
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Order Number</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Ordered At</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Items Included</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Shipping & Tracking</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {supplyOrders.map(ord => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {ord.orderNumber}
                      <span style={{ fontSize: 11, display: 'block', color: '#94a3b8' }}>Demo Sandbox PO</span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {new Date(ord.orderedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: 12 }}>
                          {it.quantity}x {it.itemName}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{ord.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      <div>{ord.shippingCarrier || 'Delhivery Cargo (Sandbox)'}</div>
                      <div style={{ color: '#94a3b8' }}>{ord.trackingNumber || 'TRK-SANDBOX-01'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: ord.status === 'Goods Received' ? '#dcfce7' : ord.status === 'In Transit' ? '#e0f2fe' : '#fef3c7',
                        color: ord.status === 'Goods Received' ? '#16a34a' : ord.status === 'In Transit' ? '#0284c7' : '#b45309'
                      }}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {canEdit && ord.status !== 'Goods Received' ? (
                        <button
                          onClick={() => handleConfirmGoodsReceived(ord)}
                          style={{
                            padding: '6px 12px',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <CheckCircle2 size={13} /> Goods Received
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Stock Credited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: ALLOCATIONS & RETURNS                                      */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'allocations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Fleet Hardware & Consumable Custody
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Tools and materials actively assigned to technicians. Ensure items are returned upon assignment completion.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {inventory.filter(i => (i.allocatedQuantity || 0) > 0).map(item => (
                <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{item.category}</span>
                    <strong style={{ fontSize: 14, color: '#2563eb' }}>{item.allocatedQuantity} in custody</strong>
                  </div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{item.itemName}</h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>SKU: {item.sku}</div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setRetItem(item);
                        setRetQty(1);
                        setReturnModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <RotateCcw size={13} /> Record Item Return
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: CHRONOLOGICAL MOVEMENT HISTORY LEDGER                     */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'movements' && (
        <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Audit-Protected Inventory Movement Ledger
            </h2>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Chronological log of all purchases, technician allocations, returns, and inventory adjustments
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Event Type</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Item & SKU</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Qty Change</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Resulting Stock</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Actor</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Reason / Details</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: m.type === 'PURCHASE' ? '#dcfce7' : m.type === 'ALLOCATION' ? '#e0f2fe' : m.type === 'RETURN' ? '#f3e8ff' : '#fef3c7',
                        color: m.type === 'PURCHASE' ? '#16a34a' : m.type === 'ALLOCATION' ? '#0284c7' : m.type === 'RETURN' ? '#7c3aed' : '#b45309'
                      }}>
                        {m.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#0f172a' }}>{m.itemName}</strong>
                      <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'block' }}>{m.itemSku}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: m.quantityChange > 0 ? '#16a34a' : '#dc2626' }}>
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                      {m.resultingStock} units
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12 }}>
                      {m.actor}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', maxWidth: 280, fontSize: 12 }}>
                      {m.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: NEW SUPPLY ORDER                                        */}
      {/* ----------------------------------------------------------------- */}
      {orderModalOpen && orderingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 480, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Place Replenishment Supply Order
              </h2>
              <button onClick={() => setOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSupplyOrder} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Stock Item</label>
                <select
                  value={orderingItem.id}
                  onChange={e => {
                    const sel = inventory.find(i => i.id === e.target.value);
                    if (sel) setOrderingItem(sel);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.itemName} (SKU: {i.sku}) — ₹{i.unitPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Replenishment Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Depot Delivery Address</label>
                <input
                  type="text"
                  required
                  value={orderAddress}
                  onChange={e => setOrderAddress(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimated Invoice Total:</span>
                <strong style={{ color: '#0f172a', fontSize: 15 }}>₹{(orderingItem.unitPrice * orderQty).toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ fontSize: 11.5, color: '#64748b', fontStyle: 'italic' }}>
                Note: Orders in sandbox demo mode generate simulated tracking and can be physically verified upon arrival via "Goods Received".
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submittingOrder ? 'Submitting...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: ALLOCATE TO PROFESSIONAL                                 */}
      {/* ----------------------------------------------------------------- */}
      {allocateModalOpen && allocItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 460, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Allocate Tools & Consumables to Technician
              </h2>
              <button onClick={() => setAllocateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAllocateStock} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{allocItem.itemName}</strong>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>
                  Available to allocate: <strong>{allocItem.inStock - (allocItem.allocatedQuantity || 0)} units</strong>
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Technician *</label>
                <select
                  required
                  value={allocProId}
                  onChange={e => setAllocProId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  <option value="">-- Choose fleet technician --</option>
                  {teamMembers.map(pro => (
                    <option key={pro.id} value={pro.id}>
                      {pro.name} ({pro.trade || 'Technician'}) - #{pro.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Allocation Quantity (Max: {allocItem.inStock - (allocItem.allocatedQuantity || 0)}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={allocItem.inStock - (allocItem.allocatedQuantity || 0)}
                  required
                  value={allocQty}
                  onChange={e => setAllocQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Operational Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to AC Power Jet maintenance kit"
                  value={allocPurpose}
                  onChange={e => setAllocPurpose(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setAllocateModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocating}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {allocating ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 3: MANUAL ADJUSTMENT                                        */}
      {/* ----------------------------------------------------------------- */}
      {adjustModalOpen && adjItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 460, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Adjust Inventory Stock (Audit Protected)
              </h2>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{adjItem.itemName}</strong>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Current In-Stock: <strong>{adjItem.inStock} units</strong></span>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Adjustment Quantity (+ for additions, - for write-offs) *
                </label>
                <input
                  type="number"
                  required
                  value={adjQty}
                  onChange={e => setAdjQty(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
                <span style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Resulting Stock: <strong>{adjItem.inStock + (Number(adjQty) || 0)} units</strong>
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Mandatory Audit Reason (Min 5 chars) *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Breakage during monsoon transit / Physical depot recount audit reconciliation"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  style={{ flex: 1, padding: '10px', background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {adjusting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 4: RECORD RETURN FROM PROFESSIONAL                          */}
      {/* ----------------------------------------------------------------- */}
      {returnModalOpen && retItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 460, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Record Item Return to Depot
              </h2>
              <button onClick={() => setReturnModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnStock} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{retItem.itemName}</strong>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Allocated in field: <strong>{retItem.allocatedQuantity} units</strong></span>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Returning Technician *</label>
                <select
                  required
                  value={retProId}
                  onChange={e => setRetProId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  <option value="">-- Select returning technician --</option>
                  {teamMembers.map(pro => (
                    <option key={pro.id} value={pro.id}>
                      {pro.name} - #{pro.id}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Quantity Returned *</label>
                  <input
                    type="number"
                    min="1"
                    max={retItem.allocatedQuantity || 1}
                    required
                    value={retQty}
                    onChange={e => setRetQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Physical Condition</label>
                  <select
                    value={retCondition}
                    onChange={e => setRetCondition(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  >
                    <option value="Good">Good / Like New</option>
                    <option value="Minor Wear">Minor Wear</option>
                    <option value="Damaged">Damaged / Servicing Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Return Reason (Min 5 chars) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Returned after completing Bandra commercial maintenance cycle"
                  value={retReason}
                  onChange={e => setRetReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returning}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {returning ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
