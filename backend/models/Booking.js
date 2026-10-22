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
    total: { type: Number, required: true },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    default: 'Mumbai',
  },
  serviceZone: {
    type: String,
    default: 'Bandra West',
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
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Refunded', 'Partially Refunded', 'Failed'],
    default: 'Paid',
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
  offerExpiry: Date,
  offerStatus: {
    type: String,
    enum: ['unoffered', 'offered', 'accepted', 'declined', 'expired'],
    default: 'unoffered'
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
  next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
