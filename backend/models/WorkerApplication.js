import mongoose from 'mongoose';

const verificationDocSchema = new mongoose.Schema({
  docNumber: String,
  docType: String,
  fileUrl: String,
  fileName: String,
  fileSizeKb: Number,
  mimeType: String,
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Not Uploaded'],
    default: 'Pending',
  },
  rejectionReason: String,
  verifiedBy: String,
  verifiedAt: Date,
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: String,
  accountNumber: String,
  ifscCode: String,
  bankName: String,
  upiId: String,
  status: {
    type: String,
    enum: ['Pending Review', 'Verified', 'Rejected'],
    default: 'Pending Review',
  },
  rejectionReason: String,
  verifiedBy: String,
  verifiedAt: Date,
}, { _id: false });

const trainingRecordSchema = new mongoose.Schema({
  id: String,
  title: String,
  category: String,
  completedAt: Date,
  score: String,
  badgeAwarded: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Failed'],
    default: 'Completed',
  }
}, { _id: false });

const leaveRecordSchema = new mongoose.Schema({
  id: String,
  date: String,
  reason: String,
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved',
  }
}, { _id: false });

const settlementRecordSchema = new mongoose.Schema({
  id: String,
  amount: Number,
  period: String,
  status: {
    type: String,
    enum: ['Processed', 'Ready for Release', 'On Hold'],
    default: 'Processed',
  },
  batchId: String,
  paidAt: Date,
}, { _id: false });

const proNoteSchema = new mongoose.Schema({
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

const bankChangeRequestSchema = new mongoose.Schema({
  id: String,
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending Review', 'Verified', 'Rejected'],
    default: 'Pending Review'
  },
  reviewFeedback: String,
  oldDetailsMasked: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String,
  },
  newDetailsMasked: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    upiId: String,
    documentRef: String,
  },
  effectiveApplied: { type: Boolean, default: false },
  reason: String,
}, { _id: false });

const financialDisputeSchema = new mongoose.Schema({
  id: String,
  category: {
    type: String,
    enum: ['missing_earnings', 'incorrect_deduction', 'incorrect_incentive', 'settlement_mismatch'],
    required: true
  },
  sourceType: {
    type: String,
    enum: ['booking', 'transaction', 'payout_batch'],
    required: true
  },
  sourceRef: { type: String, required: true },
  disputedAmount: { type: Number, required: true },
  reason: String,
  description: String,
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Resolved', 'Rejected'],
    default: 'Open'
  },
  resolutionNotes: String,
  createdAt: { type: Date, default: Date.now },
  resolutionHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: String,
    actor: String,
    note: String
  }]
}, { _id: false });

const performanceAppealSchema = new mongoose.Schema({
  id: String,
  metric: String,
  incidentBookingRef: String,
  explanation: String,
  evidenceRef: String,
  status: {
    type: String,
    enum: ['Pending Audit', 'Under Review', 'Upheld', 'Overturned'],
    default: 'Pending Audit'
  },
  createdAt: { type: Date, default: Date.now },
  auditResolution: String
}, { _id: false });

const inventoryItemSchema = new mongoose.Schema({
  id: String,
  item: String,
  sku: String,
  ownershipType: {
    type: String,
    enum: ['personal', 'business_owned', 'platform_order'],
    default: 'personal'
  },
  assignedBy: String,
  qty: { type: Number, default: 0 },
  unit: String,
  minThreshold: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Assigned Equipment', 'Out of Stock'],
    default: 'In Stock'
  },
  serialNumber: String,
}, { _id: false });

const supportTicketMessageSchema = new mongoose.Schema({
  id: String,
  sender: String,
  senderRole: { type: String, enum: ['Professional', 'Support Agent', 'Safety Cell', 'Operations Lead'], default: 'Professional' },
  text: String,
  timestamp: { type: Date, default: Date.now },
  attachments: [{
    fileName: String,
    fileUrl: String,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { _id: false });

const supportTicketSchema = new mongoose.Schema({
  id: String,
  subject: String,
  category: {
    type: String,
    enum: ['booking_support', 'earnings_payout', 'account_onboarding', 'technical_issue', 'safety_incident'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  relatedBookingId: { type: String, default: '' },
  relatedPayoutRef: { type: String, default: '' },
  description: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Awaiting Professional', 'Resolved', 'Closed'],
    default: 'Open'
  },
  messages: [supportTicketMessageSchema],
  resolutionHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: String,
    updatedBy: String,
    note: String
  }],
  internalStaffNotes: [{
    id: String,
    staffId: String,
    staffName: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const proNotificationSchema = new mongoose.Schema({
  id: String,
  category: {
    type: String,
    enum: [
      'new_assignment', 'offer_expiry', 'booking_changes', 'customer_cancellation',
      'reassignment', 'training', 'document_review', 'expiry_reminders',
      'earnings_updates', 'payout_status', 'support_responses', 'policy_updates'
    ],
    required: true
  },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  deepLink: String,
  deliveryChannel: {
    type: String,
    enum: ['in_app', 'local_outbox_sms', 'local_outbox_email'],
    default: 'in_app'
  },
  deliveryStatus: {
    type: String,
    default: 'Delivered (In-App Verified)'
  },
  deduplicationKey: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const profileChangeRequestSchema = new mongoose.Schema({
  id: String,
  field: String,
  currentVal: String,
  requestedVal: String,
  reason: String,
  status: {
    type: String,
    enum: ['Pending KYC Review', 'Approved', 'Rejected'],
    default: 'Pending KYC Review'
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  feedback: String
}, { _id: false });

const accountClosureRequestSchema = new mongoose.Schema({
  requestedAt: { type: Date, default: Date.now },
  reason: String,
  detailedFeedback: String,
  status: {
    type: String,
    enum: ['Pending Compliance Audit', 'Rejected_Active_Bookings', 'Rejected_Unresolved_Disputes', 'Completed_Archived'],
    default: 'Pending Compliance Audit'
  },
  blockingJobs: [String],
  blockingDisputes: [String],
  pendingPayoutSettlement: { type: Number, default: 0 },
  resolutionNotes: String
}, { _id: false });

const workerApplicationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  applicantName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  trade: {
    type: String,
    required: true,
  },
  tradeName: {
    type: String,
    required: true,
  },
  categories: [String],
  skills: [String],
  experience: {
    type: String,
    default: '1-3 years',
  },
  city: {
    type: String,
    default: 'Krishnagiri',
  },
  locality: {
    type: String,
    required: true,
  },
  serviceAreas: [String],
  operationalHub: {
    type: String,
    default: 'Krishnagiri Town (Direct Service)',
  },
  toolsAvailable: {
    type: String,
    default: 'Yes',
  },
  hasSmartphone: {
    type: String,
    default: 'Yes',
  },
  expectedIncome: {
    type: String,
    default: '',
  },
  appliedAt: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Under Verification', 'Approved', 'Rejected', 'Suspended'],
    default: 'Pending Review',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  correctionRequestReason: {
    type: String,
    default: '',
  },
  suspendReason: {
    type: String,
    default: '',
  },
  partnerAgencyId: {
    type: String,
    default: '',
  },
  partnerAgencyName: {
    type: String,
    default: '',
  },
  employmentType: {
    type: String,
    enum: ['Direct Freelance', 'Agency Employed'],
    default: 'Direct Freelance',
  },
  settlementModel: {
    type: String,
    enum: ['direct_to_worker', 'settle_to_business', 'business_direct_override'],
    default: 'direct_to_worker'
  },
  rating: {
    type: Number,
    default: 0,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
  },
  cancellationRate: {
    type: Number,
    default: 0,
  },
  revisitRate: {
    type: Number,
    default: 0,
  },
  onTimeArrivalRate: {
    type: Number,
    default: 0,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  lifetimeEarnings: {
    type: Number,
    default: 0,
  },
  tier: {
    type: String,
    default: 'New Applicant',
  },
  documents: {
    aadhaar: verificationDocSchema,
    pan: verificationDocSchema,
    policeClearance: verificationDocSchema,
    tradeCertificate: verificationDocSchema,
  },
  bankDetails: bankDetailsSchema,
  workingHours: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '20:00' },
  },
  workingDays: {
    type: [String],
    default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  shiftBreaks: [{
    start: { type: String, default: '13:00' },
    end: { type: String, default: '14:00' },
    title: { type: String, default: 'Lunch & Transit Recharge Break' }
  }],
  workingSlots: {
    type: [String],
    default: ['08:00 - 10:00', '10:30 - 12:30', '14:00 - 16:00', '16:30 - 18:30']
  },
  dispatchState: {
    type: String,
    enum: ['Available', 'Busy on Booking', 'Offline', 'Suspended'],
    default: 'Available'
  },
  activeBookingId: { type: String, default: '' },
  timeZone: { type: String, default: 'Asia/Kolkata' },
  leaves: [leaveRecordSchema],
  trainings: [trainingRecordSchema],
  settlements: [settlementRecordSchema],
  internalNotes: [proNoteSchema],
  bankChangeRequests: [bankChangeRequestSchema],
  financialDisputes: [financialDisputeSchema],
  performanceAppeals: [performanceAppealSchema],
  inventoryItems: [inventoryItemSchema],
  supportTickets: [supportTicketSchema],
  notifications: [proNotificationSchema],
  profileChangeRequests: [profileChangeRequestSchema],
  accountClosureRequest: accountClosureRequestSchema,
  bio: { type: String, default: '' },
  spokenLanguages: { type: [String], default: ['English', 'Hindi'] },
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  notificationPreferences: {
    jobOffersInApp: { type: Boolean, default: true },
    jobOffersSms: { type: Boolean, default: true },
    earningsUpdatesPush: { type: Boolean, default: true },
    bookingChangesInApp: { type: Boolean, default: true },
    safetyAlertsUrgent: { type: Boolean, default: true }
  },
  appLanguage: { type: String, default: 'en' },
  availabilityPreferences: {
    autoAcceptRadiusKm: { type: Number, default: 5 },
    maxDailyJobs: { type: Number, default: 6 },
    preferredMap: { type: String, default: 'Google Maps' }
  },
}, {
  timestamps: true,
});

export const WorkerApplication = mongoose.model('WorkerApplication', workerApplicationSchema);
