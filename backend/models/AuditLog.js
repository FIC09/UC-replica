import mongoose from 'mongoose';

// Helper to sanitize sensitive keys from objects before storing in audit trail
export function sanitizeAuditPayload(data) {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeAuditPayload(item));
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Completely strip credentials and secrets
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('jwt') ||
      lowerKey.includes('auth') ||
      lowerKey.includes('cvv') ||
      lowerKey.includes('otp')
    ) {
      continue;
    }

    // Mask bank accounts and card numbers to last 4 digits
    if (
      lowerKey.includes('bank') ||
      lowerKey.includes('accountnumber') ||
      lowerKey.includes('cardnumber') ||
      lowerKey.includes('accnum')
    ) {
      if (typeof val === 'string' && val.length > 4) {
        sanitized[key] = '•••• ' + val.slice(-4);
      } else {
        sanitized[key] = '•••• Masked';
      }
      continue;
    }

    if (val !== null && typeof val === 'object') {
      sanitized[key] = sanitizeAuditPayload(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

const auditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'LOG-' + Math.floor(100000 + Math.random() * 900000)
  },
  actor: {
    id: { type: String, default: 'SYSTEM' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'Administrator' },
    ipAddress: { type: String, default: '127.0.0.1' }
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['Info', 'Warning', 'Critical'],
    default: 'Info',
    index: true
  },
  beforeSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  afterSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  versionKey: false
});

// Guard against modifications: logs are strictly append-only
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('IMMUTABLE_LOG_VIOLATION: Audit logs cannot be updated once created.'));
  }
  next();
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
