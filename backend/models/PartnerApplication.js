import mongoose from 'mongoose';

const linkedWorkerSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  trade: String,
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended'],
    default: 'Active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const partnerNoteSchema = new mongoose.Schema({
  id: String,
  note: {
    type: String,
    required: true
  },
  author: String,
  authorRole: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const statusEventSchema = new mongoose.Schema({
  status: String,
  reason: String,
  changedBy: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const partnerApplicationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String,
    designation: {
      type: String,
      default: 'Authorized Representative'
    }
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
  businessType: {
    type: String,
    enum: ['Proprietorship', 'LLP', 'Private Limited', 'Partnership Firm'],
    default: 'LLP',
  },
  tier: {
    type: String,
    enum: ['Silver Franchise', 'Gold Franchise', 'Diamond Fleet Partner', 'Platinum Enterprise Fleet'],
    default: 'Gold Franchise',
  },
  category: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  serviceCategories: [{
    type: String
  }],
  fleetSize: {
    type: String,
    default: '6-15 Technicians',
  },
  techniciansCount: {
    type: Number,
    default: 10
  },
  city: {
    type: String,
    required: true,
  },
  coverageZones: [{
    type: String
  }],
  registrationTax: {
    companyType: String,
    cinNumber: String,
    gstNumber: String,
    panNumber: String,
    registeredAddress: String
  },
  gstNumber: {
    type: String,
    default: '',
  },
  verificationDocs: {
    incorporationCert: {
      docName: { type: String, default: 'Certificate of Incorporation / Registration' },
      status: { type: String, enum: ['Verified', 'Pending Review', 'Rejected'], default: 'Pending Review' },
      verifiedBy: String,
      verifiedAt: Date
    },
    gstCertificate: {
      docName: { type: String, default: 'GST Registration Certificate (Form REG-06)' },
      status: { type: String, enum: ['Verified', 'Pending Review', 'Rejected'], default: 'Pending Review' },
      verifiedBy: String,
      verifiedAt: Date
    },
    companyPan: {
      docName: { type: String, default: 'Company / Partnership PAN Card' },
      status: { type: String, enum: ['Verified', 'Pending Review', 'Rejected'], default: 'Pending Review' },
      verifiedBy: String,
      verifiedAt: Date
    },
    franchiseAgreement: {
      docName: { type: String, default: 'Signed Urban Services Franchise Agreement' },
      status: { type: String, enum: ['Verified', 'Pending Review', 'Rejected'], default: 'Pending Review' },
      verifiedBy: String,
      verifiedAt: Date
    }
  },
  settlementMode: {
    type: String,
    enum: ['ThroughBusiness', 'IndividualPro'],
    default: 'ThroughBusiness',
    // Defines whether technician earnings are paid out directly to individual pros or through the agency payroll, preventing double-counting!
  },
  settlementAccount: {
    bankName: { type: String, default: 'HDFC Bank Ltd' },
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    accountType: { type: String, default: 'Current Corporate Account' },
    status: { type: String, enum: ['Verified', 'Pending Review', 'Rejected'], default: 'Verified' }
  },
  commissionRate: {
    type: String,
    default: '18%'
  },
  monthlyCapacity: {
    type: String,
    default: '350-400 jobs/mo',
  },
  contractRef: {
    contractId: { type: String, default: 'CTR-2026-APX' },
    startDate: { type: Date, default: () => new Date('2026-01-01') },
    endDate: { type: Date, default: () => new Date('2027-12-31') },
    slaAgreementScore: { type: String, default: '99.0% SLA target' }
  },
  linkedProfessionals: [linkedWorkerSchema],
  internalNotes: [partnerNoteSchema],
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Active', 'Rejected', 'Suspended'],
    default: 'Pending Review',
  },
  statusReason: {
    type: String,
    default: ''
  },
  statusHistory: [statusEventSchema],
  metrics: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    complaintsCount: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
});

export const PartnerApplication = mongoose.model('PartnerApplication', partnerApplicationSchema);
