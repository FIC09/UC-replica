import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bookingId: {
    type: String,
    default: '',
    trim: true
  },
  serviceTitle: {
    type: String,
    default: '',
    trim: true
  },
  callerName: {
    type: String,
    required: true,
    trim: true
  },
  callerRole: {
    type: String,
    enum: ['Customer', 'Professional', 'Business Partner'],
    default: 'Customer'
  },
  workerId: {
    type: String,
    default: '',
    trim: true
  },
  partnerId: {
    type: String,
    default: '',
    trim: true
  },
  callerPhone: {
    type: String,
    default: '',
    trim: true
  },
  callerEmail: {
    type: String,
    default: '',
    trim: true
  },
  issueCategory: {
    type: String,
    default: 'General Service Inquiry',
    trim: true
  },
  category: {
    type: String,
    default: 'General Service Inquiry',
    trim: true
  },
  subject: {
    type: String,
    default: '',
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'Normal', 'High', 'Urgent', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  assignedAgent: {
    type: String,
    default: 'Unassigned',
    trim: true
  },
  assignedOwner: {
    type: String,
    default: 'Unassigned',
    trim: true
  },
  slaDeadline: {
    type: Date
  },
  slaStatus: {
    type: String,
    default: 'Within SLA'
  },
  messages: [{
    id: { type: String },
    sender: { type: String, required: true },
    senderRole: { type: String, default: 'User' },
    text: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    attachments: { type: Array, default: [] },
    timestamp: { type: Date, default: Date.now }
  }],
  evidence: [{
    type: String
  }],
  closureReason: {
    type: String,
    default: ''
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-calculate SLA status based on deadline and status
supportTicketSchema.pre('save', function (next) {
  if (!this.category && this.issueCategory) {
    this.category = this.issueCategory;
  }
  if (!this.issueCategory && this.category) {
    this.issueCategory = this.category;
  }
  if (!this.slaDeadline) {
    const hours = this.priority === 'Urgent' ? 2 : this.priority === 'High' ? 6 : 24;
    this.slaDeadline = new Date(Date.now() + hours * 3600 * 1000);
  }
  if (this.status === 'Resolved' || this.status === 'Closed') {
    this.slaStatus = 'Resolved within SLA';
  } else if (new Date() > this.slaDeadline) {
    this.slaStatus = 'SLA Breached';
  } else {
    this.slaStatus = 'Within SLA';
  }
  next();
});

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;

