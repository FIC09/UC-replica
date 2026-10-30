import mongoose from 'mongoose';

export const VALID_LIFECYCLE_TRANSITIONS = {
  'Pending': ['Confirmed', 'Cancelled', 'Failed'],
  'Confirmed': ['Assigned', 'Cancelled', 'Failed'],
  'Assigned': ['En Route', 'Arrived', 'In Progress', 'Assigned', 'Confirmed', 'Cancelled', 'Failed'], // Allows En Route travel, direct arrival, or OTP start
  'En Route': ['Arrived', 'In Progress', 'Cancelled', 'Failed'],
  'Arrived': ['In Progress', 'Cancelled', 'Failed'], // On-site arrival awaiting start OTP
  'In Progress': ['Completed', 'Failed', 'Cancelled'],
  'Completed': [], // Terminal
  'Cancelled': [], // Terminal
  'Failed': ['Pending', 'Cancelled'] // Recovery or terminal
};

export function canTransitionLifecycle(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_LIFECYCLE_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

const bookingItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  qty: {
    type: Number,
    default: 1,
  },
  price: Number,
  durationMins: {
    type: Number,
    default: 60,
  },
  image: String,
}, { _id: false });

const internalNoteSchema = new mongoose.Schema({
  id: String,
  note: {
    type: String,
    required: true,
  },
  author: String,
  authorRole: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  id: String,
  status: String,
  title: String,
  description: String,
  actor: String,
  actorRole: String,
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const rescheduleEventSchema = new mongoose.Schema({
  previousSlot: String,
  newSlot: String,
  reason: String,
  rescheduledBy: String,
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  bookingReference: {
    type: String,
    trim: true,
  },
  customerId: {
    type: String,
    default: '',
  },
  userName: {
    type: String,
    default: 'Customer',
  },
  customerName: {
    type: String,
    default: 'Customer',
  },
  userPhone: {
    type: String,
    default: '',
  },
  userEmail: {
    type: String,
    default: '',
  },
  serviceName: {
    type: String,
    default: 'Home Service',
  },
  serviceCategory: {
    type: String,
    default: 'All Services',
  },
  items: [bookingItemSchema],
  pricingBreakdown: {
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    convenienceFee: { type: Number, default: 49 },
    taxes: { type: Number, default: 0 },
    surgeFee: { type: Number, default: 0 },
    total: { type: Number, default: function() { return this.totalAmount || 0; } },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    default: 'Krishnagiri',
  },
  serviceZone: {
    type: String,
    default: 'Rayakottai Road',
  },
  address: {
    type: String,
    required: true,
  },
  addressDetails: {
    fullAddress: String,
    landmark: String,
    locality: String,
    city: String,
    pincode: String,
    contactPhone: String,
  },
  slot: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
  },
  scheduledStartTime: {
    type: String,
    default: '14:00',
  },
  scheduledEndTime: {
    type: String,
    default: '15:30',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed', 'Cancelled', 'Failed'],
    default: 'Pending',
    set: function(val) {
      if (!val) return 'Pending';
      const map = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'placed': 'Confirmed',
        'booked': 'Confirmed',
        'assigned': 'Assigned',
        'en route': 'En Route',
        'enroute': 'En Route',
        'arrived': 'Arrived',
        'in progress': 'In Progress',
        'inprogress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'canceled': 'Cancelled',
        'failed': 'Failed'
      };
      return map[String(val).toLowerCase()] || val;
    }
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Refunded', 'Partially Refunded', 'Failed'],
    default: 'Paid',
    set: function(val) {
      if (!val) return 'Paid';
      const map = {
        'paid': 'Paid',
        'success': 'Paid',
        'captured': 'Paid',
        'completed': 'Paid',
        'pending': 'Pending',
        'cod': 'Pending',
        'unpaid': 'Pending',
        'refunded': 'Refunded',
        'partially refunded': 'Partially Refunded',
        'failed': 'Failed'
      };
      return map[String(val).toLowerCase()] || val;
    }
  },
  paymentMethod: {
    type: String,
    default: 'UPI',
  },
  paymentDetails: {
    gatewayRef: String,
    transactionId: String,
    paidAt: Date,
    refundAmount: Number,
    refundReason: String,
    refundGatewayRef: String,
    refundedAt: Date,
  },
  assignedPartner: {
    type: String,
    default: '',
  },
  assignedProfessional: {
    id: String,
    name: String,
    phone: String,
    trade: String,
    avatar: String,
    assignedAt: Date,
  },
  partnerAgency: {
    type: String,
    default: '',
  },
  assignedBusinessPartner: {
    id: String,
    name: String,
  },
  safetyPin: {
    type: String,
    default: '4829',
  },
  customerInstructions: {
    type: String,
    default: '',
  },
  // Notes Separation: Internal notes (Admin/Partner only, never sent to worker) vs Professional Private Notes
  internalNotes: [internalNoteSchema],
  businessNotes: [internalNoteSchema],
  professionalNotes: [internalNoteSchema],
  serviceChecklist: [{
    id: String,
    text: String,
    completed: { type: Boolean, default: false },
    required: { type: Boolean, default: true }
  }],
  serviceOutcomes: [{
    title: String,
    value: String,
    recordedAt: { type: Date, default: Date.now }
  }],
  requiredTools: [String],
  addons: [{
    title: String,
    price: Number,
    qty: { type: Number, default: 1 }
  }],
  allocationModel: {
    type: String,
    enum: ['automatic', 'offer_accept'],
    default: 'automatic'
  },
  assignmentMode: {
    type: String,
    enum: ['MANUAL', 'AUTO'],
    default: 'AUTO',
    set: function(val) {
      return String(val || 'AUTO').toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO';
    }
  },
  assignmentStatus: {
    type: String,
    enum: ['UNASSIGNED', 'OFFERED', 'ASSIGNED', 'EXPIRED', 'REJECTED', 'AWAITING_OWNER_ATTENTION'],
    default: 'UNASSIGNED',
    set: function(val) {
      const u = String(val || 'UNASSIGNED').toUpperCase();
      const valid = ['UNASSIGNED', 'OFFERED', 'ASSIGNED', 'EXPIRED', 'REJECTED', 'AWAITING_OWNER_ATTENTION'];
      return valid.includes(u) ? u : 'UNASSIGNED';
    }
  },
  offeredTo: {
    proId: { type: String, default: '' },
    proName: { type: String, default: '' },
    proPhone: { type: String, default: '' },
    offeredAt: Date,
    expiresAt: Date,
    mode: { type: String, enum: ['MANUAL', 'AUTO'], default: 'AUTO' },
    attemptCount: { type: Number, default: 0 }
  },
  assignmentAttempts: [{
    proId: String,
    proName: String,
    status: { type: String, enum: ['offered', 'accepted', 'rejected', 'expired'] },
    attemptedAt: { type: Date, default: Date.now },
    respondedAt: Date,
    reason: { type: String, default: '' }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [78.2090, 12.5200] // [lng, lat]
    }
  },
  offerExpiry: Date,
  offerStatus: {
    type: String,
    enum: ['unoffered', 'offered', 'accepted', 'declined', 'expired'],
    default: 'unoffered'
  },
  // Structured SOP Checklists & Evidence
  structuredChecklists: {
    beforeService: [{
      id: String,
      text: String,
      completed: { type: Boolean, default: false },
      required: { type: Boolean, default: true },
      notes: { type: String, default: '' }
    }],
    safetyChecks: [{
      id: String,
      text: String,
      completed: { type: Boolean, default: false },
      required: { type: Boolean, default: true }
    }],
    workPerformed: [{
      id: String,
      text: String,
      completed: { type: Boolean, default: false },
      required: { type: Boolean, default: true }
    }],
    partsMaterials: [{
      id: String,
      name: String,
      qty: { type: Number, default: 1 },
      unit: { type: String, default: 'pcs' },
      cost: { type: Number, default: 0 },
      serialNo: { type: String, default: '' }
    }],
    photos: [{
      id: String,
      phase: { type: String, enum: ['before', 'after'], default: 'before' },
      photoType: { type: String, enum: ['equipment', 'part', 'serial_plate', 'work_area'], default: 'equipment' },
      url: String,
      cloudinaryPublicId: String,
      fileName: String,
      fileSizeKb: Number,
      mimeType: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    completionNotes: { type: String, default: '' }
  },
  // Work Verification Evidence Photos (Pre-work & Post-work)
  beforeWorkPhoto: {
    url: String,
    fileName: String,
    fileSizeKb: Number,
    cloudinaryPublicId: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String
  },
  afterWorkPhoto: {
    url: String,
    fileName: String,
    fileSizeKb: Number,
    cloudinaryPublicId: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String
  },
  // Extra Work / Parts with Customer Approval
  extraWorkRequests: [{
    id: String,
    title: String,
    category: String,
    scope: String,
    amount: Number,
    priceRule: String,
    status: { type: String, enum: ['Pending Customer Approval', 'Approved', 'Rejected'], default: 'Pending Customer Approval' },
    requestedAt: { type: Date, default: Date.now },
    approvalDetails: {
      approvedBy: String,
      approvedAt: Date,
      approvalMethod: String,
      rejectionReason: String,
      isDemoFlow: { type: Boolean, default: false }
    },
    history: [{
      action: String,
      by: String,
      timestamp: { type: Date, default: Date.now },
      notes: String
    }]
  }],
  // Cancellation, Delay & Incident Reports
  incidentReports: [{
    id: String,
    bookingId: String,
    category: {
      type: String,
      enum: [
        'unable_to_attend',
        'running_late',
        'customer_unavailable',
        'unsafe_situation',
        'address_issue',
        'outside_scope',
        'equipment_failure',
        'reassignment_request',
        'emergency_unavailability'
      ]
    },
    reason: String,
    details: String,
    delayMinutes: Number,
    evidencePhotos: [String],
    status: { type: String, default: 'Logged' },
    resolution: String,
    reportedAt: { type: Date, default: Date.now },
    consequencesAcknowledged: Boolean,
    policyRuleApplied: String
  }],
  // Booking-Scoped In-App Messages
  messages: [{
    id: String,
    senderRole: { type: String, enum: ['customer', 'professional', 'dispatch_system'], default: 'customer' },
    senderName: String,
    senderId: String,
    text: String,
    attachments: [{
      url: String,
      name: String,
      sizeKb: Number,
      mimeType: String
    }],
    deliveryStatus: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    createdAt: { type: Date, default: Date.now }
  }],
  // Itemized Financial Ledger (Integer minor currency units in Paisa)
  financialLedger: {
    grossAmountPaisa: { type: Number, default: 0 },
    platformCommissionPaisa: { type: Number, default: 0 },
    professionalEntitlementPaisa: { type: Number, default: 0 },
    approvedTipsPaisa: { type: Number, default: 0 },
    incentivesPaisa: { type: Number, default: 0 },
    adjustmentsPaisa: { type: Number, default: 0 },
    refundDeductionsPaisa: { type: Number, default: 0 },
    netEarningsPaisa: { type: Number, default: 0 },
    settlementEligibility: { type: String, default: 'Eligible for next settlement cycle' },
    settlementStatus: {
      type: String,
      enum: ['Earned', 'Pending Confirmation', 'Available for Settlement', 'Processing', 'Paid', 'Disputed'],
      default: 'Earned'
    },
    recipientSnapshot: {
      accountHolderName: String,
      accountNumberMasked: String,
      bankName: String,
      ifscCode: String,
      upiId: String
    }
  },
  reassignmentRequest: {
    requestedBy: String,
    reason: String,
    status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
    timestamp: Date
  },
  timeline: [timelineEventSchema],
  cancelReason: {
    type: String,
    default: '',
  },
  cancelDetails: {
    reason: String,
    cancelledBy: String,
    feeCharged: Number,
    timestamp: Date,
  },
  rescheduleHistory: [rescheduleEventSchema],
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
  },
  reviewIsPublished: {
    type: Boolean,
    default: true,
  },
  reviewFlagged: {
    type: Boolean,
    default: false,
  },
  reviewFlaggedReason: {
    type: String,
    default: '',
  },
  supportTicketIds: [String],
  invoiceNumber: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAtFormatted: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Sync bookingReference and totalAmount
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = this.id;
  }
  if (!this.pricingBreakdown || !this.pricingBreakdown.total) {
    this.pricingBreakdown = {
      subtotal: this.totalAmount || 0,
      discount: 0,
      convenienceFee: 49,
      taxes: Math.round((this.totalAmount || 0) * 0.18),
      surgeFee: 0,
      total: this.totalAmount || 0,
    };
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${this.id.replace(/\D/g, '').slice(-5) || '10492'}`;
  }
  if (!this.assignmentStatus) {
    if (this.assignedPartner || this.assignedProfessional?.id) {
      this.assignmentStatus = 'ASSIGNED';
    } else {
      this.assignmentStatus = 'UNASSIGNED';
    }
  }
  next();
});

bookingSchema.index({ location: '2dsphere' });
bookingSchema.index({ status: 1, assignmentStatus: 1 });
bookingSchema.index({ 'offeredTo.proId': 1, offerStatus: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);

