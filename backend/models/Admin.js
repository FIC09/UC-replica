import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ADMIN_ROLES = [
  'Super Admin',
  'Operations Manager',
  'Support Agent',
  'Finance Manager',
  'Catalogue Manager',
  'Read-only Analyst'
];

export const PERMISSION_MATRIX = {
  'Super Admin': {
    '*': ['view', 'create', 'edit', 'approve', 'export', 'suspend', 'refund', 'payout']
  },
  'Operations Manager': {
    overview: ['view'],
    bookings: ['view', 'create', 'edit', 'approve', 'export'],
    customers: ['view', 'create', 'edit', 'suspend', 'export'],
    professionals: ['view', 'create', 'edit', 'approve', 'suspend', 'export'],
    partners: ['view', 'create', 'edit', 'approve', 'suspend', 'export'],
    services: ['view', 'create', 'edit'],
    locations: ['view', 'create', 'edit'],
    inventory: ['view', 'create', 'edit'],
    notifications: ['view', 'create'],
    support: ['view', 'create', 'edit'],
    training: ['view', 'create', 'edit'],
    reviews: ['view', 'edit'],
    reports: ['view', 'export'],
    audit_logs: ['view'],
    team: ['view']
  },
  'Finance Manager': {
    overview: ['view'],
    bookings: ['view', 'export'],
    payments: ['view', 'export'],
    payouts: ['view', 'create', 'edit', 'approve', 'payout', 'export'],
    refunds: ['view', 'edit', 'approve', 'refund', 'export'],
    reports: ['view', 'export'],
    settings: ['view', 'edit'],
    audit_logs: ['view']
  },
  'Catalogue Manager': {
    overview: ['view'],
    services: ['view', 'create', 'edit', 'export'],
    inventory: ['view', 'create', 'edit', 'export'],
    promotions: ['view', 'create', 'edit', 'export'],
    content: ['view', 'create', 'edit'],
    reviews: ['view', 'edit']
  },
  'Support Agent': {
    overview: ['view'],
    bookings: ['view', 'edit'],
    customers: ['view'],
    professionals: ['view'],
    support: ['view', 'create', 'edit'],
    reviews: ['view', 'edit'],
    audit_logs: ['view']
  },
  'Read-only Analyst': {
    overview: ['view'],
    bookings: ['view', 'export'],
    customers: ['view', 'export'],
    professionals: ['view', 'export'],
    partners: ['view', 'export'],
    services: ['view', 'export'],
    locations: ['view'],
    payments: ['view', 'export'],
    payouts: ['view', 'export'],
    refunds: ['view', 'export'],
    support: ['view'],
    reviews: ['view'],
    training: ['view'],
    inventory: ['view'],
    promotions: ['view'],
    content: ['view'],
    notifications: ['view'],
    reports: ['view', 'export'],
    team: ['view'],
    audit_logs: ['view'],
    settings: ['view']
  }
};

export function checkAdminPermission(role, resource, action) {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized === 'superadmin' || normalized === 'admin') return true;

  // Exact match first
  let rolePermissions = PERMISSION_MATRIX[role];
  if (!rolePermissions) {
    // Case-insensitive match against PERMISSION_MATRIX keys
    const matchKey = Object.keys(PERMISSION_MATRIX).find(
      k => k.toLowerCase().replace(/[\s_-]+/g, '') === normalized
    );
    if (matchKey) rolePermissions = PERMISSION_MATRIX[matchKey];
  }

  if (!rolePermissions) return false;
  if (rolePermissions['*'] && rolePermissions['*'].includes(action)) return true;
  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;
  return resourceActions.includes(action);
}

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ADMIN_ROLES,
    default: 'Operations Manager',
  },
  assignedZone: {
    type: String,
    default: 'All India',
  },
  department: {
    type: String,
    default: 'Operations',
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active',
  },
  twoFactor: {
    type: Boolean,
    default: true,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  createdBy: {
    type: String,
    default: 'SYSTEM',
  }
}, {
  timestamps: true,
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (typeof this.password === 'string' && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = mongoose.model('Admin', adminSchema);
