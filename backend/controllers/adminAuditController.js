import { AuditLog, sanitizeAuditPayload } from '../models/AuditLog.js';

// In-memory fallback audit ledger for demo / development persistence
let mockAuditStore = [
  {
    _id: 'LOG-88101',
    logId: 'LOG-88101',
    actor: {
      id: 'adm-super-01',
      name: 'Super Admin',
      email: 'admin@urbancompany.com',
      role: 'Super Admin',
      ipAddress: '106.51.78.21'
    },
    action: 'PRICE_SURGE_ENABLED',
    entityType: 'PlatformSettings',
    entityId: 'SETTINGS-GLOBAL',
    reason: 'Heavy monsoon storm alert in Mumbai Coastal Cluster',
    severity: 'Warning',
    beforeSummary: { monsoonSurgeActive: false, monsoonSurgeAmount: 0 },
    afterSummary: { monsoonSurgeActive: true, monsoonSurgeAmount: 49 },
    ipAddress: '106.51.78.21',
    timestamp: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: 'LOG-88102',
    logId: 'LOG-88102',
    actor: {
      id: 'adm-ops-02',
      name: 'Operations Manager',
      email: 'ops@urbancompany.com',
      role: 'Operations Manager',
      ipAddress: '49.207.198.11'
    },
    action: 'PARTNER_APPROVED',
    entityType: 'BusinessPartner',
    entityId: 'PTN-01',
    reason: 'All GSTIN and police verification documents verified and approved',
    severity: 'Info',
    beforeSummary: { status: 'Pending Verification', verifiedDocs: 2 },
    afterSummary: { status: 'Active', verifiedDocs: 3, settlementMode: 'BUSINESS_DIRECT' },
    ipAddress: '49.207.198.11',
    timestamp: new Date(Date.now() - 3600000 * 6)
  },
  {
    _id: 'LOG-88103',
    logId: 'LOG-88103',
    actor: {
      id: 'adm-fin-03',
      name: 'Finance Manager',
      email: 'finance@urbancompany.com',
      role: 'Finance Manager',
      ipAddress: '157.48.12.90'
    },
    action: 'PAYOUT_RELEASED',
    entityType: 'PayoutStatement',
    entityId: 'PAYOUT-2026-W42',
    reason: 'Scheduled weekly NEFT settlement to verified fleet bank accounts',
    severity: 'Critical',
    beforeSummary: { status: 'Pending Approval', grossAmount: 184500, bankAccount: '•••• 4821' },
    afterSummary: { status: 'Released', utrReference: 'CMS9823481289', grossAmount: 184500, bankAccount: '•••• 4821' },
    ipAddress: '157.48.12.90',
    timestamp: new Date(Date.now() - 3600000 * 18)
  },
  {
    _id: 'LOG-88104',
    logId: 'LOG-88104',
    actor: {
      id: 'adm-supp-04',
      name: 'Support Agent',
      email: 'support@urbancompany.com',
      role: 'Support Agent',
      ipAddress: '106.51.78.21'
    },
    action: 'REFUND_APPROVED',
    entityType: 'Booking',
    entityId: 'BK-8902',
    reason: 'Water heater service incomplete due to component shortage; goodwill instant reversal',
    severity: 'Critical',
    beforeSummary: { paymentStatus: 'Paid', amount: 849 },
    afterSummary: { paymentStatus: 'Refunded', refundAmount: 849, gatewayRefundId: 'rfnd_sim_91823' },
    ipAddress: '106.51.78.21',
    timestamp: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: 'LOG-88105',
    logId: 'LOG-88105',
    actor: {
      id: 'adm-super-01',
      name: 'Super Admin',
      email: 'admin@urbancompany.com',
      role: 'Super Admin',
      ipAddress: '127.0.0.1'
    },
    action: 'STAFF_SESSION_REVOKED',
    entityType: 'Admin',
    entityId: 'adm-ops-02',
    reason: 'Security rotation of active sessions requested by operations lead',
    severity: 'Warning',
    beforeSummary: { tokenVersion: 0 },
    afterSummary: { tokenVersion: 1, sessionStatus: 'Invalidated' },
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 3600000 * 30)
  }
];

// Reusable function to record audit entries across controllers
export async function recordAuditTrail({
  actor,
  action,
  entityType,
  entityId,
  reason = '',
  severity = 'Info',
  beforeSummary = null,
  afterSummary = null,
  ipAddress = '127.0.0.1'
}) {
  try {
    const safeBefore = sanitizeAuditPayload(beforeSummary);
    const safeAfter = sanitizeAuditPayload(afterSummary);

    const logEntry = {
      logId: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      actor: {
        id: actor?.id || actor?._id || 'SYSTEM',
        name: actor?.name || 'Administrator',
        email: actor?.email || 'admin@urbancompany.com',
        role: actor?.role || 'Administrator',
        ipAddress: ipAddress || '127.0.0.1'
      },
      action,
      entityType,
      entityId: String(entityId || 'N/A'),
      reason: String(reason || ''),
      severity: ['Info', 'Warning', 'Critical'].includes(severity) ? severity : 'Info',
      beforeSummary: safeBefore,
      afterSummary: safeAfter,
      ipAddress: ipAddress || '127.0.0.1',
      timestamp: new Date()
    };

    // Attempt MongoDB save
    try {
      await AuditLog.create(logEntry);
    } catch {
      // Fallback in-memory
    }

    mockAuditStore.unshift({ ...logEntry, _id: logEntry.logId });
    // Keep max 200 items in mock store
    if (mockAuditStore.length > 200) {
      mockAuditStore.pop();
    }

    return logEntry;
  } catch (err) {
    console.warn('Failed to record audit log:', err.message);
    return null;
  }
}

// 1. Get Audit Logs (Searchable, Filterable, Paginated)
export async function getAuditLogs(req, res) {
  try {
    const { action, entityType, severity, search, page = 1, limit = 50 } = req.query;

    let logs = [];
    try {
      const filter = {};
      if (action && action !== 'ALL') filter.action = action;
      if (entityType && entityType !== 'ALL') filter.entityType = entityType;
      if (severity && severity !== 'ALL') filter.severity = severity;
      if (search) {
        filter.$or = [
          { 'actor.name': { $regex: search, $options: 'i' } },
          { 'actor.email': { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { entityId: { $regex: search, $options: 'i' } },
          { reason: { $regex: search, $options: 'i' } }
        ];
      }

      logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    } catch {}

    if (!logs || logs.length === 0) {
      let filtered = [...mockAuditStore];
      if (action && action !== 'ALL') filtered = filtered.filter(l => l.action === action);
      if (entityType && entityType !== 'ALL') filtered = filtered.filter(l => l.entityType === entityType);
      if (severity && severity !== 'ALL') filtered = filtered.filter(l => l.severity === severity);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(l =>
          (l.actor?.name || '').toLowerCase().includes(q) ||
          (l.actor?.email || '').toLowerCase().includes(q) ||
          (l.action || '').toLowerCase().includes(q) ||
          (l.entityId || '').toLowerCase().includes(q) ||
          (l.reason || '').toLowerCase().includes(q)
        );
      }
      logs = filtered;
    }

    // Map for frontend consumption
    const formatted = logs.map(l => ({
      id: l.logId || l._id,
      logId: l.logId || l._id,
      timestamp: l.timestamp,
      actor: l.actor?.name || 'Administrator',
      actorEmail: l.actor?.email || '',
      role: l.actor?.role || 'Staff',
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      target: `${l.entityType} (${l.entityId})`,
      reason: l.reason || 'Standard operational procedure',
      severity: l.severity || 'Info',
      ipAddress: l.ipAddress || '127.0.0.1',
      beforeSummary: l.beforeSummary,
      afterSummary: l.afterSummary
    }));

    return res.json({
      success: true,
      count: formatted.length,
      auditLogs: formatted
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Export Audit Logs CSV with Formula Injection Protection
export async function exportAuditCsv(req, res) {
  try {
    const logs = mockAuditStore;

    // Helper to sanitize formula injection
    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = [
      'Log ID',
      'Timestamp (UTC/IST)',
      'Actor Name',
      'Actor Email',
      'Actor Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Severity',
      'IP Address',
      'Reason',
      'Before Summary',
      'After Summary'
    ];

    const rows = logs.map(l => [
      sanitizeCsvCell(l.logId),
      sanitizeCsvCell(new Date(l.timestamp).toISOString()),
      sanitizeCsvCell(l.actor?.name),
      sanitizeCsvCell(l.actor?.email),
      sanitizeCsvCell(l.actor?.role),
      sanitizeCsvCell(l.action),
      sanitizeCsvCell(l.entityType),
      sanitizeCsvCell(l.entityId),
      sanitizeCsvCell(l.severity),
      sanitizeCsvCell(l.ipAddress),
      sanitizeCsvCell(l.reason),
      sanitizeCsvCell(JSON.stringify(l.beforeSummary || {})),
      sanitizeCsvCell(JSON.stringify(l.afterSummary || {}))
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="urban_audit_trail_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
