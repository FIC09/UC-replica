import { AuditLog, sanitizeAuditPayload } from '../models/AuditLog.js';

// Audit ledger store
let mockAuditStore = [];

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

    if (!logs) {
      logs = [];
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
