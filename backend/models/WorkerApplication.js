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
    default: 'Mumbai',
  },
  locality: {
    type: String,
    required: true,
  },
  serviceAreas: [String],
  operationalHub: {
    type: String,
    default: 'Bandra West Central Hub',
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
  rating: {
    type: Number,
    default: 4.88,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
  },
  cancellationRate: {
    type: Number,
    default: 1.2,
  },
  revisitRate: {
    type: Number,
    default: 0.8,
  },
  onTimeArrivalRate: {
    type: Number,
    default: 98.4,
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
    default: 'Gold Pro (Level 3)',
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
  leaves: [leaveRecordSchema],
  trainings: [trainingRecordSchema],
  settlements: [settlementRecordSchema],
  internalNotes: [proNoteSchema],
}, {
  timestamps: true,
});

export const WorkerApplication = mongoose.model('WorkerApplication', workerApplicationSchema);
