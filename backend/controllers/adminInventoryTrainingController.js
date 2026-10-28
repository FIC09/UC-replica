import { WorkerApplication } from '../models/WorkerApplication.js';

let mockTrainingModules = [
  {
    id: 'TRN-101',
    title: 'Standard Operating Procedure (SOP): 6-Step Safety Protocol',
    category: 'Safety & Hygiene',
    durationMins: 45,
    mandatory: true,
    certificationRequired: true,
    validityMonths: 12,
    passingScore: 90,
    badgeAwarded: 'Zero-Contamination Certified',
    materials: [
      { type: 'PDF', title: '6-Step Doorstep Safety SOP.pdf', url: '/docs/sop_safety_v2.pdf' },
      { type: 'Video', title: 'Sanitization & Shoe Covers Demonstration', url: 'https://cdn.urban.example/vids/safety.mp4' }
    ],
    assignedProfessionals: [],
    completionRate: '100%'
  },
  {
    id: 'TRN-102',
    title: 'High-Pressure Powerjet AC Coil Cleaning & Gas Leak Test',
    category: 'Technical Specialization',
    durationMins: 90,
    mandatory: true,
    certificationRequired: true,
    validityMonths: 12,
    passingScore: 85,
    badgeAwarded: 'Master HVAC Technician',
    materials: [
      { type: 'PDF', title: 'Powerjet 140-Bar Pressure Operating Manual.pdf', url: '/docs/powerjet_hvac.pdf' },
      { type: 'Checklist', title: 'Freon R32 Gas Pressure Chart & Leak Probe Test', url: '/docs/freon_checklist.pdf' }
    ],
    assignedProfessionals: [],
    completionRate: '100%'
  },
  {
    id: 'TRN-103',
    title: 'Customer Communication, Politeness & OTP Verification SOP',
    category: 'Soft Skills & Customer Delight',
    durationMins: 30,
    mandatory: true,
    certificationRequired: true,
    validityMonths: 12,
    passingScore: 95,
    badgeAwarded: '5-Star Hospitality Pro',
    materials: [
      { type: 'Interactive Guide', title: 'Handling Difficult Situations & Delays', url: '/docs/hospitality_guide.pdf' }
    ],
    assignedProfessionals: [],
    completionRate: '100%'
  }
];

let mockInventoryItems = [
  {
    id: 'INV-501',
    sku: 'TOOL-PJ-140',
    itemName: 'High-Pressure Powerjet Machine (140 Bar)',
    category: 'Equipment & Machines',
    supplier: 'Bosch Professional India Pvt Ltd',
    warehouse: 'Bandra Hub Central Warehouse',
    currentStock: 142,
    minThreshold: 30,
    unitCost: 4850,
    allocatedToPros: 120,
    status: 'In Stock',
    movements: [
      { date: '2026-10-18', delta: +20, reason: 'Restock Inward PO #9481', actor: 'Storekeeper' },
      { date: '2026-10-20', delta: -4, reason: 'Allocated to new AC onboarding batch', actor: 'Fleet Manager' }
    ]
  },
  {
    id: 'INV-502',
    sku: 'CHEM-ECO-05L',
    itemName: 'Eco-Degreaser Chemical Solution (5 Litres)',
    category: 'Cleaning Chemicals',
    supplier: '3M India Industrial Chemicals',
    warehouse: 'Krishnagiri Logistics Store',
    currentStock: 38,
    minThreshold: 50,
    unitCost: 420,
    allocatedToPros: 310,
    status: 'Low Stock Alert',
    movements: [
      { date: '2026-10-15', delta: -12, reason: 'Weekly distribution to Cleaning fleet', actor: 'Depot Supervisor' }
    ]
  },
  {
    id: 'INV-503',
    sku: 'ACC-BAG-AC01',
    itemName: 'Universal AC Split Servicing Waterproof Jacket Bag',
    category: 'Protective Gear',
    supplier: 'CarePro Tooling Solutions',
    warehouse: 'Mumbai Central Depot',
    currentStock: 280,
    minThreshold: 60,
    unitCost: 280,
    allocatedToPros: 240,
    status: 'In Stock',
    movements: []
  },
  {
    id: 'INV-504',
    sku: 'TOOL-MM-DIGI',
    itemName: 'Digital Multimeter & Continuity Tester Kit',
    category: 'Electrical Testing Tools',
    supplier: 'Fluke Electrical Distribution',
    warehouse: 'Krishnagiri Logistics Store',
    currentStock: 95,
    minThreshold: 25,
    unitCost: 750,
    allocatedToPros: 88,
    status: 'In Stock',
    movements: []
  }
];

// Supply Orders placed by Technicians & Franchise Partners
let mockSupplyOrders = [];

// ==========================================
// 1. TRAINING CONTROLLERS
// ==========================================
export async function getTrainingModules(req, res) {
  try {
    const workers = await WorkerApplication.find({ status: { $in: ['Approved', 'Active'] } }).lean().catch(() => []);
    const realPros = workers.map(w => ({
      id: w.id || w.applicationNumber,
      name: w.applicantName || w.name,
      trade: w.trade || w.tradeCategory || 'Technician',
      status: 'Certified',
      completedAt: '2026-10-01',
      expiresAt: '2027-10-01',
      fieldScore: String(w.rating || '4.95')
    }));

    const enrichedModules = mockTrainingModules.map(m => ({
      ...m,
      assignedProfessionals: realPros,
      completionRate: realPros.length > 0 ? '100%' : '0%'
    }));

    return res.json({
      success: true,
      count: enrichedModules.length,
      modules: enrichedModules
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function assignTraining(req, res) {
  try {
    const { id } = req.params;
    const { professionalId, professionalName, trade } = req.body;

    const mod = mockTrainingModules.find(m => m.id === id);
    if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });

    const existing = mod.assignedProfessionals.find(p => p.id === professionalId);
    if (existing) {
      return res.status(400).json({ success: false, error: `Professional is already assigned (${existing.status})` });
    }

    mod.assignedProfessionals.push({
      id: professionalId,
      name: professionalName,
      trade: trade || 'All Trades',
      status: 'Mandatory Enrolled',
      completedAt: null,
      expiresAt: null,
      fieldScore: 'Pending'
    });

    return res.json({ success: true, message: `Assigned ${professionalName} to ${mod.title}`, module: mod });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 2. INVENTORY CONTROLLERS
// ==========================================
export async function getInventory(req, res) {
  try {
    return res.json({
      success: true,
      count: mockInventoryItems.length,
      inventory: mockInventoryItems
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Adjust stock with reason & negative stock guard
export async function adjustInventoryStock(req, res) {
  try {
    const { id } = req.params;
    const { delta, reason = 'Audit reconciliation' } = req.body;

    const item = mockInventoryItems.find(i => i.id === id);
    if (!item) return res.status(404).json({ success: false, error: 'Inventory item not found' });

    const newStock = item.currentStock + parseInt(delta, 10);

    // Negative stock prevention
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: `Adjustment rejected: Cannot reduce stock below 0. Current stock is ${item.currentStock}.`
      });
    }

    item.currentStock = newStock;
    item.status = item.currentStock <= item.minThreshold ? 'Low Stock Alert' : 'In Stock';
    item.movements.unshift({
      date: new Date().toISOString().slice(0, 10),
      delta: parseInt(delta, 10),
      reason,
      actor: req.admin?.name || 'Inventory Controller'
    });

    return res.json({
      success: true,
      message: `Stock for ${item.itemName} adjusted by ${delta > 0 ? '+' + delta : delta} to ${item.currentStock}`,
      item
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 3. SUPPLY ORDERS CONTROLLERS
// ==========================================
export async function getSupplyOrders(req, res) {
  try {
    return res.json({
      success: true,
      count: mockSupplyOrders.length,
      orders: mockSupplyOrders
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function fulfillSupplyOrder(req, res) {
  try {
    const { id } = req.params;
    const { idempotencyKey } = req.body;

    const order = mockSupplyOrders.find(o => o.id === id);
    if (!order) return res.status(404).json({ success: false, error: 'Supply order not found' });

    // Idempotency check: prevent duplicate deduction
    if (order.status === 'Approved & Fulfilled') {
      return res.status(400).json({
        success: false,
        error: `Supply order #${id} has ALREADY been fulfilled. Double stock deduction prevented.`
      });
    }

    // Check inventory stock availability
    const invItem = mockInventoryItems.find(i => i.sku === order.sku);
    if (invItem) {
      if (invItem.currentStock < order.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient warehouse stock. Needed ${order.quantity}, available ${invItem.currentStock}.`
        });
      }
      invItem.currentStock -= order.quantity;
      invItem.allocatedToPros += order.quantity;
      invItem.status = invItem.currentStock <= invItem.minThreshold ? 'Low Stock Alert' : 'In Stock';
      invItem.movements.unshift({
        date: new Date().toISOString().slice(0, 10),
        delta: -order.quantity,
        reason: `Dispatched for Supply Order #${order.id} (${order.requestedBy})`,
        actor: req.admin?.name || 'Storekeeper'
      });
    }

    order.status = 'Approved & Fulfilled';
    order.fulfilledAt = new Date();
    order.fulfilledBy = req.admin?.name || 'Warehouse Lead';

    return res.json({
      success: true,
      message: `Supply order #${id} fulfilled and stock deducted safely`,
      order
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
