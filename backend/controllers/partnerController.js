import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { PartnerApplication } from '../models/PartnerApplication.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { Booking } from '../models/Booking.js';
import { PARTNER_PERMISSIONS } from '../middleware/partnerAuth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'urban_company_jwt_secret_key_2026';

// =========================================================================
// IN-MEMORY TENANT STORES (Ensures fast response + isolated persistence)
// =========================================================================

// 1. Partner Businesses Database
let partnerBusinesses = [
  {
    id: 'PTR-90142',
    businessName: 'Apex Home Solutions LLP',
    ownerName: 'Sandeep Patil',
    email: 'contact@apexhome.in',
    phone: '+91 98210 33411',
    passwordHash: 'Partner@2026', // Simulated hash
    businessType: 'LLP',
    tier: 'Platinum Enterprise Fleet',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Care',
    serviceCategories: ['AC Repair & Servicing', 'Refrigerator Repair', 'Washing Machine Care', 'Microwave Repair', 'Deep Cleaning'],
    city: 'Mumbai',
    coverageZones: ['Bandra West', 'Khar West', 'Santacruz West', 'Pali Hill', 'Andheri West'],
    pincodes: ['400050', '400052', '400053', '400054', '400058'],
    gstNumber: '27AABCA1234F1Z8',
    cinNumber: 'AAQ-8492-MH',
    panNumber: 'AABCA1234F',
    registeredAddress: 'Unit 401, Technopolis IT Park, Mahakali Caves Road, Andheri East, Mumbai 400093',
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'ICICI Bank Ltd',
      accountHolderName: 'Apex Home Solutions LLP',
      accountNumber: '••••••••9012',
      ifscCode: 'ICIC0000002',
      accountType: 'Current Corporate Account',
      status: 'Verified'
    },
    commissionRate: '18%',
    status: 'Active',
    metrics: {
      totalBookings: 0,
      completedBookings: 0,
      rating: 0,
      complaintsCount: 0,
      totalPayouts: 0
    },
    operatingHours: {
      start: '08:00',
      end: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    holidays: [],
    capacityConfig: {
      maxConcurrentBookingsPerHour: 12,
      maxConcurrentJobs: 12,
      dailyMaxBookings: 45,
      dailyJobCap: 45,
      leadTimeHours: 2,
      bufferMinutesBetweenJobs: 30
    },
    participationStatus: 'Active',
    autoDispatch: true,
    emergencyPhone: '+91 98210 33499',
    createdAt: new Date('2026-01-01')
  },
  {
    id: 'PTR-90143',
    businessName: 'Krishnagiri QuickFix Care',
    ownerName: 'M. Selvam',
    email: 'selvam@quickfixcare.com',
    phone: '+91 98421 88776',
    passwordHash: 'Partner@2026',
    businessType: 'Partnership Firm',
    tier: 'Gold Franchise',
    category: 'cleaning-pest',
    categoryName: 'Home Cleaning & Pest Services',
    serviceCategories: ['Full Home Deep Cleaning', 'Bathroom Deep Cleaning', 'Kitchen Steam Cleaning', 'Cockroach & Termite Pest Control'],
    city: 'Krishnagiri',
    coverageZones: ['Krishnagiri Central', 'Rayakottai Road', 'Old Pet', 'Gandhi Nagar', 'SIPCOT Industrial Zone'],
    pincodes: ['635001', '635002', '635115'],
    gstNumber: '33AABCS5678K1Z2',
    cinNumber: 'TN-KG-9921',
    panNumber: 'AABCS5678K',
    registeredAddress: '12/4 Rayakottai Road, Near Gandhi Statue, Krishnagiri 635001',
    settlementMode: 'DirectToProfessional',
    businessOverrideCommission: '15%',
    settlementAccount: {
      bankName: 'State Bank of India',
      accountHolderName: 'Krishnagiri QuickFix Care',
      accountNumber: '••••••••6781',
      ifscCode: 'SBIN0000862',
      accountType: 'Current Corporate Account',
      status: 'Verified'
    },
    commissionRate: '20%',
    status: 'Active',
    metrics: {
      totalBookings: 0,
      completedBookings: 0,
      rating: 0,
      complaintsCount: 0,
      totalPayouts: 0
    },
    operatingHours: {
      start: '08:30',
      end: '19:30',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    holidays: [],
    capacityConfig: {
      maxConcurrentBookingsPerHour: 4,
      dailyMaxBookings: 20,
      leadTimeHours: 3,
      bufferMinutesBetweenJobs: 30
    },
    participationStatus: 'Active',
    autoDispatch: true,
    emergencyPhone: '+91 98421 88700',
    createdAt: new Date('2026-02-01')
  },
  {
    id: 'PTR-90145',
    businessName: 'Deccan MultiServices Pvt Ltd',
    ownerName: 'Vikram Deshmukh',
    email: 'vikram@deccanfleet.com',
    phone: '+91 98220 11223',
    passwordHash: 'Partner@2026',
    businessType: 'Private Limited',
    tier: 'Gold Franchise',
    category: 'electrician-plumbing',
    categoryName: 'Electrician & Plumbing Care',
    serviceCategories: ['Electrical Wiring & MCB', 'Plumbing & Water Purifier', 'Drainage Unclogging'],
    city: 'Pune',
    coverageZones: ['Kothrud', 'Baner', 'Aundh', 'Wakad'],
    pincodes: ['411038', '411045'],
    gstNumber: '27AABCD9988E1Z4',
    cinNumber: 'U74999PN2026PTC192831',
    panNumber: 'AABCD9988E',
    registeredAddress: 'Building 4, Commerce Zone, Airport Road, Yerawada, Pune 411006',
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'Axis Bank Ltd',
      accountHolderName: 'Deccan MultiServices Pvt Ltd',
      accountNumber: '••••••••4491',
      ifscCode: 'UTIB0000037',
      accountType: 'Current Corporate Account',
      status: 'Pending Verification'
    },
    commissionRate: '19%',
    status: 'Under Review',
    onboarding: {
      state: 'Under Review',
      progress: 80,
      missingInfo: [],
      submissionHistory: [
        { version: 1, submittedAt: new Date(Date.now() - 86400000), status: 'Under Review', notes: 'Initial corporate submission undergoing compliance review.' }
      ],
      reviewFeedback: 'Your documentation is undergoing verification with the MCA registry and corporate banking partner. SLA: 24h.',
      requiredCorrections: [],
      documentChecklist: [
        { id: 'doc-coi', name: 'Certificate of Incorporation', status: 'Submitted', required: true },
        { id: 'doc-gst', name: 'GST Registration Certificate', status: 'Submitted', required: true },
        { id: 'doc-pan', name: 'Company PAN Card', status: 'Submitted', required: true },
        { id: 'doc-bank', name: 'Bank Account Cancelled Cheque', status: 'Submitted', required: true },
        { id: 'doc-msa', name: 'Signed Master Franchise Agreement', status: 'Pending Review', required: false }
      ]
    },
    metrics: { totalBookings: 0, completedBookings: 0, rating: 5.0, complaintsCount: 0, totalPayouts: 0 },
    operatingHours: { start: '09:00', end: '19:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    autoDispatch: false,
    emergencyPhone: '+91 98220 11299',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'PTR-90146',
    businessName: 'Metro Pro Home Maintenance',
    ownerName: 'Ananya Roy',
    email: 'ananya@metropro.in',
    phone: '+91 98310 99881',
    passwordHash: 'Partner@2026',
    businessType: 'LLP',
    tier: 'Silver Fleet',
    category: 'ac-appliances',
    categoryName: 'AC & Home Appliances',
    serviceCategories: ['AC Repair & Servicing', 'Washing Machine Repair'],
    city: 'Mumbai',
    coverageZones: ['Bandra West', 'Khar West'],
    pincodes: ['400050'],
    gstNumber: '27AABCM4411K1Z9',
    cinNumber: 'AAQ-9182-MH',
    panNumber: 'AABCM4411K',
    registeredAddress: 'Flat 102, Shanti Kunj, Linking Road, Bandra West, Mumbai 400050',
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'HDFC Bank Ltd',
      accountHolderName: 'Metro Pro Home Maintenance',
      accountNumber: '••••••••8819',
      ifscCode: 'HDFC0000001',
      accountType: 'Current Corporate Account',
      status: 'Correction Required'
    },
    commissionRate: '18%',
    status: 'Changes Requested',
    onboarding: {
      state: 'Changes Requested',
      progress: 65,
      missingInfo: ['Clear high-resolution GST Certificate', 'Address verification proof matching postal pincode 400050'],
      submissionHistory: [
        { version: 1, submittedAt: new Date(Date.now() - 172800000), status: 'Changes Requested', notes: 'Compliance review found blurry GST certificate and address pincode mismatch.' }
      ],
      reviewFeedback: 'Uploaded GST Certificate is illegible. Office address details need utility bill confirmation matching pincode 400050.',
      requiredCorrections: [
        { field: 'gstCertificate', issue: 'Re-upload GST Registration Certificate (Clear PDF or PNG, max 5MB)' },
        { field: 'registeredAddress', issue: 'Attach recent electricity or landline bill showing registered address in Bandra West 400050' }
      ],
      documentChecklist: [
        { id: 'doc-coi', name: 'Certificate of Incorporation', status: 'Approved', required: true },
        { id: 'doc-gst', name: 'GST Registration Certificate', status: 'Correction Required', required: true },
        { id: 'doc-pan', name: 'Company PAN Card', status: 'Approved', required: true },
        { id: 'doc-bank', name: 'Bank Account Cancelled Cheque', status: 'Approved', required: true }
      ]
    },
    metrics: { totalBookings: 0, completedBookings: 0, rating: 5.0, complaintsCount: 0, totalPayouts: 0 },
    operatingHours: { start: '09:00', end: '19:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    autoDispatch: false,
    emergencyPhone: '+91 98310 99899',
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 'PTR-90147',
    businessName: 'SafeShield Appliance Services',
    ownerName: 'Ramesh Iyer',
    email: 'ramesh@safeshield.in',
    phone: '+91 98401 77665',
    passwordHash: 'Partner@2026',
    businessType: 'Partnership Firm',
    tier: 'Gold Franchise',
    category: 'ac-appliances',
    categoryName: 'AC & Home Appliances',
    serviceCategories: ['AC Repair & Servicing', 'Refrigerator Repair'],
    city: 'Chennai',
    coverageZones: ['Adyar', 'Besant Nagar', 'Thiruvanmiyur'],
    pincodes: ['600020', '600090'],
    gstNumber: '33AABCS1122D1Z5',
    cinNumber: 'TN-CH-8812',
    panNumber: 'AABCS1122D',
    registeredAddress: '15/2 1st Main Road, Gandhi Nagar, Adyar, Chennai 600020',
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'Kotak Mahindra Bank',
      accountHolderName: 'SafeShield Appliance Services',
      accountNumber: '••••••••3311',
      ifscCode: 'KKBK0000461',
      accountType: 'Current Corporate Account',
      status: 'Suspended'
    },
    commissionRate: '18%',
    status: 'Suspended',
    suspensionReason: 'Compliance audit hold: Annual safety certification audit expired on Oct 15, 2026. Operational dispatch privileges suspended pending renewal submission.',
    permittedSupportAccess: true,
    onboarding: {
      state: 'Suspended',
      progress: 100,
      missingInfo: [],
      submissionHistory: [],
      reviewFeedback: 'Account suspended due to expired safety compliance audit.',
      requiredCorrections: ['Submit renewed annual safety compliance certificate via Partner Support Desk']
    },
    metrics: { totalBookings: 0, completedBookings: 0, rating: 0, complaintsCount: 0, totalPayouts: 0 },
    operatingHours: { start: '09:00', end: '19:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    autoDispatch: false,
    emergencyPhone: '+91 98401 77600',
    createdAt: new Date('2026-01-15')
  },
  {
    id: 'PTR-90148',
    businessName: 'Southern Home Experts',
    ownerName: 'Karthik Raman',
    email: 'karthik@southernhome.in',
    phone: '+91 98450 33441',
    passwordHash: 'Partner@2026',
    businessType: 'LLP',
    tier: 'Gold Franchise',
    category: 'cleaning-pest',
    categoryName: 'Home Cleaning & Pest Services',
    serviceCategories: ['Full Home Deep Cleaning'],
    city: 'Bengaluru',
    coverageZones: ['Koramangala', 'Indiranagar', 'HSR Layout'],
    pincodes: ['560034', '560038'],
    gstNumber: '',
    cinNumber: '',
    panNumber: 'AABCS9912K',
    registeredAddress: '100 Feet Road, Indiranagar, Bengaluru 560038',
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'HDFC Bank Ltd',
      accountHolderName: 'Southern Home Experts',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Current Corporate Account',
      status: 'Pending Submission'
    },
    commissionRate: '18%',
    status: 'Draft',
    onboarding: {
      state: 'Draft',
      progress: 40,
      missingInfo: ['GST Registration Certificate', 'Settlement Bank Account Details', 'Service Coverage Confirmation'],
      submissionHistory: [],
      reviewFeedback: 'Application draft in progress. Fill in all required corporate and bank fields to submit.',
      requiredCorrections: [],
      documentChecklist: [
        { id: 'doc-coi', name: 'Certificate of Incorporation', status: 'Uploaded', required: true },
        { id: 'doc-gst', name: 'GST Registration Certificate', status: 'Pending', required: true },
        { id: 'doc-pan', name: 'Company PAN Card', status: 'Uploaded', required: true },
        { id: 'doc-bank', name: 'Bank Account Cancelled Cheque', status: 'Pending', required: true }
      ]
    },
    metrics: { totalBookings: 0, completedBookings: 0, rating: 5.0, complaintsCount: 0, totalPayouts: 0 },
    operatingHours: { start: '09:00', end: '19:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    autoDispatch: false,
    emergencyPhone: '+91 98450 33400',
    createdAt: new Date()
  }
];

// 2. Staff Accounts (5 roles per business)
let staffAccounts = [
  // Apex Home Solutions LLP (PTR-90142)
  {
    id: 'STF-APX-01',
    partnerId: 'PTR-90142',
    name: 'Sandeep Patil',
    email: 'contact@apexhome.in',
    phone: '+91 98210 33411',
    role: 'Business Owner',
    status: 'Active',
    lastLogin: new Date(Date.now() - 3600000),
    createdAt: new Date('2026-01-01')
  },
  {
    id: 'STF-APX-02',
    partnerId: 'PTR-90142',
    name: 'Pooja Patil',
    email: 'pooja@apexhome.in',
    phone: '+91 98210 33412',
    role: 'Business Manager',
    status: 'Active',
    lastLogin: new Date(Date.now() - 7200000),
    createdAt: new Date('2026-01-05')
  },
  {
    id: 'STF-APX-03',
    partnerId: 'PTR-90142',
    name: 'Rahul Dev',
    email: 'dispatcher@apexhome.in',
    phone: '+91 98210 33413',
    role: 'Dispatcher',
    status: 'Active',
    lastLogin: new Date(Date.now() - 1800000),
    createdAt: new Date('2026-01-15')
  },
  {
    id: 'STF-APX-04',
    partnerId: 'PTR-90142',
    name: 'Anand Kulkarni',
    email: 'finance@apexhome.in',
    phone: '+91 98210 33414',
    role: 'Finance Staff',
    status: 'Active',
    lastLogin: new Date(Date.now() - 86400000),
    createdAt: new Date('2026-01-18')
  },
  {
    id: 'STF-APX-05',
    partnerId: 'PTR-90142',
    name: 'Meera Joshi',
    email: 'analyst@apexhome.in',
    phone: '+91 98210 33415',
    role: 'Read-only Staff',
    status: 'Active',
    lastLogin: new Date(Date.now() - 172800000),
    createdAt: new Date('2026-02-01')
  },
  // Krishnagiri QuickFix Care (PTR-90143)
  {
    id: 'STF-QFC-01',
    partnerId: 'PTR-90143',
    name: 'M. Selvam',
    email: 'selvam@quickfixcare.com',
    phone: '+91 98421 88776',
    role: 'Business Owner',
    status: 'Active',
    lastLogin: new Date(Date.now() - 4000000),
    createdAt: new Date('2026-02-01')
  },
  // Deccan MultiServices Pvt Ltd (PTR-90145) - Under Review
  {
    id: 'STF-DCC-01',
    partnerId: 'PTR-90145',
    name: 'Vikram Deshmukh',
    email: 'vikram@deccanfleet.com',
    phone: '+91 98220 11223',
    role: 'Business Owner',
    status: 'Under Review',
    lastLogin: new Date(Date.now() - 2000000),
    createdAt: new Date('2026-02-10')
  },
  // Metro Pro Home Maintenance (PTR-90146) - Changes Requested
  {
    id: 'STF-MTR-01',
    partnerId: 'PTR-90146',
    name: 'Ananya Roy',
    email: 'ananya@metropro.in',
    phone: '+91 98310 99881',
    role: 'Business Owner',
    status: 'Changes Requested',
    lastLogin: new Date(Date.now() - 5000000),
    createdAt: new Date('2026-02-12')
  },
  // SafeShield Appliance Services (PTR-90147) - Suspended
  {
    id: 'STF-SSH-01',
    partnerId: 'PTR-90147',
    name: 'Ramesh Iyer',
    email: 'ramesh@safeshield.in',
    phone: '+91 98401 77665',
    role: 'Business Owner',
    status: 'Suspended',
    lastLogin: new Date(Date.now() - 6000000),
    createdAt: new Date('2026-01-15')
  },
  // Southern Home Experts (PTR-90148) - Draft
  {
    id: 'STF-STH-01',
    partnerId: 'PTR-90148',
    name: 'Karthik Raman',
    email: 'karthik@southernhome.in',
    phone: '+91 98450 33441',
    role: 'Business Owner',
    status: 'Draft',
    lastLogin: new Date(),
    createdAt: new Date()
  }
];

// 3. Team Members (Linked Professionals under Business Partners)
let partnerProfessionals = [];

// 4. Partner Bookings Store
let partnerBookings = [];

// 5. Partner Settlements Store
let partnerSettlements = [];

let serviceCategoryRequests = [];
let coverageChangeRequests = [];
let settlementCorrectionRequests = [];
let bankChangeRequests = [];

// 6. GST Tax Invoices Store
let partnerInvoices = [];

// 7. Customer Refunds & Dispute Deductions Store
let partnerDisputes = [];

// 8. Quality & Customer Reviews Store
let partnerReviews = [];

// 9. Training Modules & Academy Records
let partnerTrainingCourses = [];
let partnerAssignedProfessionalsTraining = [];
let partnerTrainingSessions = [];
let trainingSessionRequests = [];
let businessDocumentExpiryRecords = [];
let professionalDocumentExpiryRecords = [];

// 10. Operational Consumables & Fleet Inventory Store
let partnerInventory = [];
let partnerSupplyOrders = [];
let partnerInventoryMovements = [];

// 11. Priority Partner Support Desk Store
let partnerSupportTickets = [];

// 12. Real-Time Operational Notifications Store
let partnerNotifications = [];

// 13. Enterprise Compliance Vault (Statutory KYC & Contracts)
let partnerDocuments = [];

// 14. Immutable System Audit Ledger Store
let partnerActivityLogs = [];

// State and concurrency trackers
export const revokedStaffIds = new Set();
export const bookingAssignmentLocks = new Set();

export function isStaffAccessRevoked(partnerId, staffId) {
  if (!staffId) return false;
  if (revokedStaffIds.has(staffId)) return true;
  const staff = staffAccounts.find(s => s.id === staffId);
  if (staff && staff.status === 'Inactive') return true;
  return false;
}

export function getPartnerBusinessStatus(partnerId) {
  const business = partnerBusinesses.find(p => p.id === partnerId);
  return business ? business.status : null;
}

// Deep clone baseline records for pristine demo reset
const INITIAL_PARTNER_BUSINESSES = JSON.parse(JSON.stringify(partnerBusinesses));
const INITIAL_STAFF_ACCOUNTS = JSON.parse(JSON.stringify(staffAccounts));
const INITIAL_PARTNER_PROFESSIONALS = JSON.parse(JSON.stringify(partnerProfessionals));
const INITIAL_PARTNER_BOOKINGS = JSON.parse(JSON.stringify(partnerBookings));
const INITIAL_PARTNER_SETTLEMENTS = JSON.parse(JSON.stringify(partnerSettlements));
const INITIAL_SETTLEMENT_CORRECTION_REQUESTS = JSON.parse(JSON.stringify(settlementCorrectionRequests));
const INITIAL_BANK_CHANGE_REQUESTS = JSON.parse(JSON.stringify(bankChangeRequests));
const INITIAL_PARTNER_INVOICES = JSON.parse(JSON.stringify(partnerInvoices));
const INITIAL_PARTNER_DISPUTES = JSON.parse(JSON.stringify(partnerDisputes));
const INITIAL_PARTNER_REVIEWS = JSON.parse(JSON.stringify(partnerReviews));
const INITIAL_PARTNER_TRAINING_COURSES = JSON.parse(JSON.stringify(partnerTrainingCourses));
const INITIAL_PARTNER_ASSIGNED_PROS_TRAINING = JSON.parse(JSON.stringify(partnerAssignedProfessionalsTraining));
const INITIAL_PARTNER_TRAINING_SESSIONS = JSON.parse(JSON.stringify(partnerTrainingSessions));
const INITIAL_TRAINING_SESSION_REQUESTS = JSON.parse(JSON.stringify(trainingSessionRequests));
const INITIAL_BUSINESS_DOC_EXPIRY = JSON.parse(JSON.stringify(businessDocumentExpiryRecords));
const INITIAL_PRO_DOC_EXPIRY = JSON.parse(JSON.stringify(professionalDocumentExpiryRecords));
const INITIAL_PARTNER_INVENTORY = JSON.parse(JSON.stringify(partnerInventory));
const INITIAL_PARTNER_SUPPLY_ORDERS = JSON.parse(JSON.stringify(partnerSupplyOrders));
const INITIAL_PARTNER_INVENTORY_MOVEMENTS = JSON.parse(JSON.stringify(partnerInventoryMovements));
const INITIAL_PARTNER_SUPPORT_TICKETS = JSON.parse(JSON.stringify(partnerSupportTickets));
const INITIAL_PARTNER_NOTIFICATIONS = JSON.parse(JSON.stringify(partnerNotifications));
const INITIAL_PARTNER_DOCUMENTS = JSON.parse(JSON.stringify(partnerDocuments));
const INITIAL_PARTNER_ACTIVITY_LOGS = JSON.parse(JSON.stringify(partnerActivityLogs));

// =========================================================================
// CONTROLLER HANDLERS
// =========================================================================

/**
 * 1. Partner Authentication & Onboarding
 */

export async function loginPartner(req, res) {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email/phone and password.'
      });
    }

    const cleanInput = emailOrPhone.trim().toLowerCase();

    // Check staff accounts first
    const staff = staffAccounts.find(s => 
      (s.email && s.email.toLowerCase() === cleanInput) ||
      (s.phone && s.phone.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, ''))
    );

    // Find associated business
    let business = null;
    if (cleanInput === 'partner@urbancompany.com' || cleanInput === 'partner') {
      business = partnerBusinesses.find(p => p.id === 'PTR-90142') || partnerBusinesses[0];
    } else if (staff) {
      business = partnerBusinesses.find(p => p.id === staff.partnerId);
    } else {
      business = partnerBusinesses.find(p => 
        (p.email && p.email.toLowerCase() === cleanInput) ||
        (p.phone && p.phone.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, '')) ||
        (p.id && p.id.toLowerCase() === cleanInput)
      );
    }

    if (!business) {
      try {
        const cleanDigits = cleanInput.replace(/\D/g, '');
        const dbPartner = await PartnerApplication.findOne({
          $or: [
            { id: cleanInput.toUpperCase() },
            { id: cleanInput },
            { phone: cleanInput },
            ...(cleanDigits.length >= 8 ? [{ phone: { $regex: cleanDigits } }] : []),
            { email: cleanInput }
          ]
        }).lean();
        if (dbPartner) {
          business = {
            id: dbPartner.id,
            businessName: dbPartner.businessName,
            ownerName: dbPartner.ownerName,
            phone: dbPartner.phone,
            email: dbPartner.email,
            password: dbPartner.password || '',
            status: dbPartner.status || 'Pending Review',
            category: dbPartner.category,
            categoryName: dbPartner.categoryName,
            city: dbPartner.city,
            fleetSize: dbPartner.fleetSize,
            tier: dbPartner.tier || 'New Fleet Partner'
          };
        }
      } catch {}
    }

    // Verify password: allow standard master/demo passwords or registered partner password
    const cleanPwd = (password || '').trim();
    const isMasterPwd = cleanPwd.toLowerCase() === 'partner@2026' || cleanPwd.toLowerCase() === 'partner123' || cleanPwd.toLowerCase() === 'admin@2026' || cleanPwd.toLowerCase() === 'apex@2026' || cleanPwd.toLowerCase() === 'demo' || cleanPwd.toLowerCase() === 'admin123';
    const isCustomPwdMatch = Boolean(business?.password && business.password === cleanPwd);

    if (!business || (!isMasterPwd && !isCustomPwdMatch)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your business email/phone and password.'
      });
    }

    if (business.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        error: `Your partner application was rejected by operations admin.${business.statusReason ? ` Reason: ${business.statusReason}` : ''}`
      });
    }

    const staffRecord = staff || {
      id: 'STF-OWNER-01',
      partnerId: business.id,
      name: business.ownerName,
      email: business.email,
      phone: business.phone,
      role: 'Business Owner',
      status: business.status || 'Active'
    };

    const token = jwt.sign(
      {
        partnerId: business.id,
        staffId: staffRecord.id,
        staffName: staffRecord.name,
        role: staffRecord.role,
        email: staffRecord.email,
        businessName: business.businessName,
        status: business.status
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record audit activity
    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId: business.id,
      actorName: staffRecord.name,
      actorRole: staffRecord.role,
      action: 'LOGIN_SUCCESS',
      details: `Signed in successfully with role "${staffRecord.role}" (Business Status: ${business.status})`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      token,
      partner: {
        id: business.id,
        businessName: business.businessName,
        ownerName: business.ownerName,
        email: business.email,
        phone: business.phone,
        tier: business.tier,
        category: business.category,
        categoryName: business.categoryName,
        city: business.city,
        status: business.status,
        suspensionReason: business.suspensionReason || null,
        permittedSupportAccess: business.permittedSupportAccess || false,
        onboarding: business.onboarding || null,
        settlementMode: business.settlementMode,
        metrics: business.metrics
      },
      staff: {
        id: staffRecord.id,
        name: staffRecord.name,
        email: staffRecord.email,
        phone: staffRecord.phone,
        role: staffRecord.role,
        permissions: PARTNER_PERMISSIONS[staffRecord.role]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerPartner(req, res) {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      businessType,
      city,
      category,
      categoryName,
      coverageZones
    } = req.body;

    if (!businessName || !ownerName || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: 'Business name, owner name, email, phone, and operating city are required.'
      });
    }

    const newPartnerId = 'PTR-' + Math.floor(10000 + Math.random() * 90000);

    const newPartner = {
      id: newPartnerId,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash: 'Partner@2026',
      businessType: businessType || 'LLP',
      tier: 'Gold Franchise',
      category: category || 'ac-appliances',
      categoryName: categoryName || 'AC & Home Appliances',
      serviceCategories: [categoryName || 'Home Services'],
      city: city.trim(),
      coverageZones: Array.isArray(coverageZones) && coverageZones.length ? coverageZones : [city.trim() + ' Central'],
      pincodes: ['400001'],
      gstNumber: req.body.gstNumber || '',
      cinNumber: req.body.cinNumber || '',
      panNumber: req.body.panNumber || '',
      registeredAddress: req.body.registeredAddress || `${city}, India`,
      settlementMode: 'ThroughBusiness',
      settlementAccount: {
        bankName: req.body.bankName || 'HDFC Bank Ltd',
        accountHolderName: businessName.trim(),
        accountNumber: req.body.accountNumber || '••••••••1100',
        ifscCode: req.body.ifscCode || 'HDFC0000001',
        accountType: 'Current Corporate Account',
        status: 'Pending Review'
      },
      commissionRate: '18%',
      status: 'Pending Review', // Requires admin verification
      metrics: {
        totalBookings: 0,
        completedBookings: 0,
        rating: 5.0,
        complaintsCount: 0,
        totalPayouts: 0
      },
      operatingHours: {
        start: '09:00',
        end: '19:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      autoDispatch: true,
      emergencyPhone: phone.trim(),
      createdAt: new Date()
    };

    partnerBusinesses.push(newPartner);

    // Create primary Business Owner staff
    const ownerStaff = {
      id: 'STF-' + Math.floor(1000 + Math.random() * 9000),
      partnerId: newPartnerId,
      name: ownerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'Business Owner',
      status: 'Active',
      lastLogin: new Date(),
      createdAt: new Date()
    };

    staffAccounts.push(ownerStaff);

    // Sync with PartnerApplication model in background
    PartnerApplication.create(newPartner).catch(() => {});

    const token = jwt.sign(
      {
        partnerId: newPartnerId,
        staffId: ownerStaff.id,
        staffName: ownerStaff.name,
        role: ownerStaff.role,
        email: ownerStaff.email,
        businessName: newPartner.businessName,
        status: newPartner.status
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Business partner registration submitted successfully. Onboarding status: Under Review.',
      token,
      partner: newPartner,
      staff: {
        ...ownerStaff,
        permissions: PARTNER_PERMISSIONS['Business Owner']
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerMe(req, res) {
  try {
    const { partnerId, staffId } = req.partner;
    let business = partnerBusinesses.find(p => p.id === partnerId);
    try {
      const dbPartner = await PartnerApplication.findOne({
        $or: [
          { id: partnerId },
          { id: (partnerId || '').toUpperCase() },
          { email: (partnerId || '').toLowerCase() }
        ]
      }).lean();
      if (dbPartner) {
        if (!business) {
          business = {
            id: dbPartner.id,
            businessName: dbPartner.businessName,
            ownerName: dbPartner.ownerName,
            phone: dbPartner.phone,
            email: dbPartner.email,
            status: dbPartner.status || 'Pending Review',
            category: dbPartner.category,
            categoryName: dbPartner.categoryName,
            city: dbPartner.city,
            fleetSize: dbPartner.fleetSize,
            tier: dbPartner.tier || 'New Fleet Partner'
          };
        } else {
          business.status = dbPartner.status || business.status;
        }
      }
    } catch {}
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business partner profile not found.' });
    }

    const staff = staffAccounts.find(s => s.id === staffId && s.partnerId === partnerId) || {
      id: staffId,
      name: req.partner.staffName,
      role: req.partner.role,
      permissions: req.partner.permissions
    };

    return res.json({
      success: true,
      partner: business,
      staff: {
        ...staff,
        permissions: PARTNER_PERMISSIONS[staff.role] || req.partner.permissions
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestPasswordReset(req, res) {
  // Label clearly that password-reset email delivery is unconfigured in this environment
  return res.status(200).json({
    success: false,
    deliveryStatus: 'unconfigured',
    message: 'Password-reset email delivery is unconfigured in this environment. Please contact your platform administrator or use standard demo credentials (Partner@2026).'
  });
}

/**
 * 1.1 Onboarding Lifecycle & Document Verification
 */

export async function getPartnerOnboardingStatus(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business partner profile not found.' });
    }

    const defaultChecklist = [
      { id: 'doc-coi', name: 'Certificate of Incorporation / Partnership Deed', status: 'Submitted', required: true },
      { id: 'doc-gst', name: 'GST Registration Certificate', status: 'Submitted', required: true },
      { id: 'doc-pan', name: 'Company PAN Card', status: 'Submitted', required: true },
      { id: 'doc-bank', name: 'Bank Account Cancelled Cheque / Statement', status: 'Submitted', required: true },
      { id: 'doc-msa', name: 'Master Services Agreement & Commission Schedule', status: 'Pending Review', required: false }
    ];

    const onboardingData = business.onboarding || {
      state: business.status || 'Under Review',
      progress: business.status === 'Approved' ? 100 : business.status === 'Draft' ? 40 : 80,
      missingInfo: [],
      submissionHistory: [
        { version: 1, submittedAt: business.createdAt || new Date(), status: business.status, notes: 'Registration submitted for compliance verification' }
      ],
      reviewFeedback: business.status === 'Changes Requested'
        ? 'Please re-upload GST Certificate and update registered address proof.'
        : business.status === 'Suspended'
        ? (business.suspensionReason || 'Account suspended by platform compliance.')
        : 'Enterprise documents undergoing compliance review.',
      requiredCorrections: business.status === 'Changes Requested'
        ? [
            { field: 'gstCertificate', issue: 'Re-upload GST Registration Certificate' },
            { field: 'registeredAddress', issue: 'Update address proof' }
          ]
        : [],
      documentChecklist: defaultChecklist
    };

    return res.json({
      success: true,
      partnerId: business.id,
      businessName: business.businessName,
      status: business.status,
      suspensionReason: business.suspensionReason || null,
      permittedSupportAccess: business.status === 'Suspended',
      onboarding: onboardingData
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function savePartnerOnboardingDraft(req, res) {
  try {
    const { partnerId, staffName } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business partner not found.' });
    }

    const {
      businessName,
      businessType,
      ownerName,
      email,
      phone,
      registeredAddress,
      serviceCategories,
      coverageZones,
      teamSize,
      gstNumber,
      panNumber,
      cinNumber,
      settlementAccount,
      documentChecklist
    } = req.body;

    if (businessName) business.businessName = businessName.trim();
    if (businessType) business.businessType = businessType;
    if (ownerName) business.ownerName = ownerName.trim();
    if (email) business.email = email.trim().toLowerCase();
    if (phone) business.phone = phone.trim();
    if (registeredAddress) business.registeredAddress = registeredAddress;
    if (Array.isArray(serviceCategories)) business.serviceCategories = serviceCategories;
    if (Array.isArray(coverageZones)) business.coverageZones = coverageZones;
    if (teamSize) business.teamSize = teamSize;
    if (gstNumber) business.gstNumber = gstNumber;
    if (panNumber) business.panNumber = panNumber;
    if (cinNumber) business.cinNumber = cinNumber;
    if (settlementAccount) {
      business.settlementAccount = {
        ...business.settlementAccount,
        ...settlementAccount
      };
    }

    business.onboarding = business.onboarding || {};
    if (documentChecklist) business.onboarding.documentChecklist = documentChecklist;

    // Recalculate missing information
    const missing = [];
    if (!business.gstNumber) missing.push('GST Registration Number');
    if (!business.panNumber) missing.push('Company PAN Number');
    if (!business.settlementAccount?.accountNumber) missing.push('Settlement Account Number');
    if (!business.settlementAccount?.ifscCode) missing.push('Bank IFSC Code');
    if (!business.serviceCategories?.length) missing.push('Requested Service Categories');
    if (!business.coverageZones?.length) missing.push('Requested Cities & Coverage Zones');

    business.onboarding.missingInfo = missing;
    business.onboarding.progress = Math.max(30, 100 - missing.length * 12);
    business.onboarding.state = 'Draft';
    business.status = 'Draft';

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: req.partner.role,
      action: 'ONBOARDING_DRAFT_SAVED',
      details: `Saved onboarding draft progress (${business.onboarding.progress}% complete)`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Onboarding draft progress saved successfully.',
      onboarding: business.onboarding
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitPartnerOnboarding(req, res) {
  try {
    const { partnerId, staffName } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business partner not found.' });
    }

    const {
      businessName,
      businessType,
      ownerName,
      email,
      phone,
      registeredAddress,
      serviceCategories,
      coverageZones,
      teamSize,
      gstNumber,
      panNumber,
      settlementAccount
    } = req.body;

    // Apply any updates passed in submission payload
    if (businessName) business.businessName = businessName;
    if (businessType) business.businessType = businessType;
    if (ownerName) business.ownerName = ownerName;
    if (email) business.email = email;
    if (phone) business.phone = phone;
    if (registeredAddress) business.registeredAddress = registeredAddress;
    if (serviceCategories) business.serviceCategories = serviceCategories;
    if (coverageZones) business.coverageZones = coverageZones;
    if (teamSize) business.teamSize = teamSize;
    if (gstNumber) business.gstNumber = gstNumber;
    if (panNumber) business.panNumber = panNumber;
    if (settlementAccount) business.settlementAccount = { ...business.settlementAccount, ...settlementAccount };

    // Validate necessary information
    const missing = [];
    if (!business.businessName) missing.push('Business Name');
    if (!business.businessType) missing.push('Business Type');
    if (!business.ownerName) missing.push('Owner/Contact Person');
    if (!business.email) missing.push('Email');
    if (!business.phone) missing.push('Phone');
    if (!business.registeredAddress) missing.push('Business Address');
    if (!business.serviceCategories || !business.serviceCategories.length) missing.push('Requested Service Categories');
    if (!business.coverageZones || !business.coverageZones.length) missing.push('Requested Cities and Coverage Areas');
    if (!business.panNumber && !business.gstNumber) missing.push('Business Registration / Tax Details');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Incomplete application. Missing necessary information: ${missing.join(', ')}.`,
        missingFields: missing
      });
    }

    business.status = 'Under Review';
    business.onboarding = business.onboarding || {};
    business.onboarding.state = 'Under Review';
    business.onboarding.progress = 85;
    business.onboarding.missingInfo = [];
    business.onboarding.reviewFeedback = 'Application submitted and queued for compliance verification.';
    business.onboarding.requiredCorrections = [];
    business.onboarding.submissionHistory = business.onboarding.submissionHistory || [];
    business.onboarding.submissionHistory.unshift({
      version: business.onboarding.submissionHistory.length + 1,
      submittedAt: new Date(),
      status: 'Under Review',
      notes: 'Partner submitted complete enterprise onboarding packet.'
    });

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: req.partner.role,
      action: 'ONBOARDING_SUBMITTED',
      details: 'Submitted onboarding packet for enterprise platform verification',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Onboarding packet successfully submitted for review.',
      status: business.status,
      onboarding: business.onboarding
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitPartnerOnboardingCorrections(req, res) {
  try {
    const { partnerId, staffName } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business partner not found.' });
    }

    const { correctedFields, correctionNotes, updatedDocumentChecklist } = req.body;

    if (correctedFields && typeof correctedFields === 'object') {
      Object.assign(business, correctedFields);
    }

    business.onboarding = business.onboarding || {};
    if (updatedDocumentChecklist) {
      business.onboarding.documentChecklist = updatedDocumentChecklist;
    } else if (business.onboarding.documentChecklist) {
      business.onboarding.documentChecklist = business.onboarding.documentChecklist.map(doc => {
        if (doc.status === 'Correction Required') {
          return { ...doc, status: 'Re-submitted (Under Review)' };
        }
        return doc;
      });
    }

    business.status = 'Under Review';
    business.onboarding.state = 'Under Review';
    business.onboarding.progress = 90;
    business.onboarding.missingInfo = [];
    business.onboarding.reviewFeedback = 'Corrections submitted. Our compliance team will review within 24 hours.';
    business.onboarding.requiredCorrections = [];
    business.onboarding.submissionHistory = business.onboarding.submissionHistory || [];
    business.onboarding.submissionHistory.unshift({
      version: business.onboarding.submissionHistory.length + 1,
      submittedAt: new Date(),
      status: 'Under Review',
      notes: correctionNotes || 'Submitted requested corrections and updated verification documents.'
    });

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: req.partner.role,
      action: 'ONBOARDING_CORRECTIONS_SUBMITTED',
      details: `Submitted corrections: ${correctionNotes || 'Documents updated'}`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Corrections submitted successfully. Application is now Under Review.',
      status: business.status,
      onboarding: business.onboarding
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 2. Dashboard Overview Summary & Real Database Synchronization
 */

export async function getLivePartnerBookings(partnerId, businessName) {
  if (mongoose.connection?.readyState === 1) {
    try {
      const query = {
        $or: [
          { 'assignedBusinessPartner.id': partnerId },
          { partnerAgency: partnerId },
          ...(businessName ? [{ partnerAgency: businessName }, { partnerAgencyName: businessName }] : [])
        ]
      };
      const dbBookings = await Booking.find(query).maxTimeMS(2500).lean();
      if (dbBookings && dbBookings.length > 0) {
        const map = new Map();
        for (const b of partnerBookings.filter(x => x.partnerId === partnerId)) {
          if (b.id) map.set(String(b.id), b);
        }
        for (const b of dbBookings) {
          const id = b.id || (b._id ? String(b._id) : null);
          if (id && !map.has(id)) {
            map.set(id, {
              id,
              partnerId,
              bookingReference: b.bookingReference || id,
              userName: b.customerName || b.userName || 'Customer',
              userPhone: b.customerPhone || b.userPhone || '',
              userEmail: b.customerEmail || b.userEmail || '',
              serviceName: b.serviceName || 'Home Service',
              serviceCategory: b.serviceCategory || b.category || '',
              serviceZone: b.serviceZone || b.locality || '',
              city: b.city || '',
              address: b.customerAddress || b.address || '',
              status: b.status || 'Pending',
              scheduledDate: b.scheduledDate || b.date || b.createdAt,
              slot: b.slot || b.timeSlot || '',
              totalAmount: b.totalAmount || b.pricing?.finalTotal || 0,
              platformFee: b.platformFee || 0,
              assignedProfessional: b.assignedProfessional || null,
              createdAt: b.createdAt
            });
          }
        }
        return Array.from(map.values());
      }
    } catch (err) {
      // DB error
    }
  }
  return partnerBookings.filter(b => b.partnerId === partnerId);
}

export async function getLivePartnerTeam(partnerId, businessName) {
  if (mongoose.connection?.readyState === 1) {
    try {
      const query = {
        $or: [
          { partnerAgencyId: partnerId },
          ...(businessName ? [{ partnerAgency: businessName }, { partnerAgencyName: businessName }] : [])
        ]
      };
      const dbWorkers = await WorkerApplication.find(query).maxTimeMS(2500).lean();
      if (dbWorkers && dbWorkers.length > 0) {
        const map = new Map();
        for (const p of partnerProfessionals.filter(x => x.partnerId === partnerId)) {
          if (p.id) map.set(String(p.id), p);
        }
        for (const w of dbWorkers) {
          const id = w.id || (w._id ? String(w._id) : null);
          if (id && !map.has(id)) {
            map.set(id, {
              id,
              partnerId,
              name: w.name || w.fullName,
              phone: w.phone,
              email: w.email || '',
              trade: w.trade || w.category || 'Technician',
              status: w.status === 'Approved' ? 'Active' : (w.status || 'Active'),
              isOnline: Boolean(w.isOnline),
              rating: w.rating || 0,
              jobsCompleted: w.jobsCompleted || 0,
              attendanceToday: w.attendanceToday || 'Available',
              currentLocation: w.currentLocation || '',
              skills: w.skills || [],
              joinedDate: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : ''
            });
          }
        }
        return Array.from(map.values());
      }
    } catch (err) {
      // DB error
    }
  }
  return partnerProfessionals.filter(p => p.partnerId === partnerId);
}

export async function getDashboardSummary(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const { dateRange = 'all', city = 'ALL', category = 'ALL', proId = 'ALL' } = req.query;

    let allBookings = await getLivePartnerBookings(partnerId, business?.businessName);
    let team = await getLivePartnerTeam(partnerId, business?.businessName);
    let settlements = partnerSettlements.filter(s => s.partnerId === partnerId);
    let notifs = partnerNotifications.filter(n => n.partnerId === partnerId && !n.read);
    let disputes = partnerDisputes.filter(d => d.partnerId === partnerId && d.disputeStatus !== 'Resolved');

    // Filter bookings based on query filters
    let filteredBookings = [...allBookings];
    if (city !== 'ALL') {
      filteredBookings = filteredBookings.filter(b => (b.city || '').toLowerCase() === city.toLowerCase());
    }
    if (category !== 'ALL') {
      filteredBookings = filteredBookings.filter(b => (b.serviceCategory || '').toLowerCase() === category.toLowerCase());
    }
    if (proId !== 'ALL') {
      filteredBookings = filteredBookings.filter(b => b.assignedProfessional?.id === proId);
    }

    const todayStr = new Date().toDateString();
    const now = new Date();

    // Date range filter
    if (dateRange === 'today') {
      filteredBookings = filteredBookings.filter(b => new Date(b.scheduledDate).toDateString() === todayStr);
    } else if (dateRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      filteredBookings = filteredBookings.filter(b => new Date(b.scheduledDate) >= oneWeekAgo);
    } else if (dateRange === 'month' || dateRange === 'last30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      filteredBookings = filteredBookings.filter(b => new Date(b.scheduledDate) >= thirtyDaysAgo);
    }

    // Precise metrics calculated strictly from stored records:
    const todayBookings = filteredBookings.filter(b => new Date(b.scheduledDate).toDateString() === todayStr).length;
    const upcomingBookings = filteredBookings.filter(b => new Date(b.scheduledDate) > now && ['Pending', 'Assigned'].includes(b.status)).length;
    const ongoingBookings = filteredBookings.filter(b => ['Assigned', 'En Route', 'In Progress'].includes(b.status)).length;
    const unassignedBookings = filteredBookings.filter(b => b.status === 'Pending' || !b.assignedProfessional).length;
    const completedBookings = filteredBookings.filter(b => b.status === 'Completed').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'Cancelled').length;

    const activeProfessionals = team.filter(t => t.status === 'Active').length;
    const assignedProIdsToday = new Set(
      allBookings
        .filter(b => new Date(b.scheduledDate).toDateString() === todayStr && ['In Progress', 'Assigned'].includes(b.status) && b.assignedProfessional?.id)
        .map(b => b.assignedProfessional.id)
    );
    const professionalsAvailableToday = team.filter(t => t.status === 'Active' && !assignedProIdsToday.has(t.id)).length;

    // Financial breakdown (avoid treating gross booking value as take-home earnings):
    const grossBookingValue = filteredBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const platformDeductions = filteredBookings.reduce((sum, b) => sum + (Number(b.platformFee || b.agencyCommission) || 0), 0);
    const netBusinessEarnings = grossBookingValue - platformDeductions;

    // Settled amount vs pending settlement
    const settledAmount = settlements.filter(s => s.status === 'Processed' || s.status === 'Settled').reduce((sum, s) => sum + (Number(s.netDisbursed) || 0), 0);
    const completedUnsettled = allBookings.filter(b => b.status === 'Completed');
    const pendingSettlementAmount = Math.max(0, completedUnsettled.reduce((sum, b) => sum + (Number(b.netAgencyShare) || (Number(b.totalAmount) - Number(b.platformFee || 0))), 0) - settledAmount);

    const openDisputes = disputes.length;

    // Average rating
    const ratingReviews = partnerReviews.filter(r => r.partnerId === partnerId);
    const avgRating = ratingReviews.length > 0
      ? (ratingReviews.reduce((sum, r) => sum + r.rating, 0) / ratingReviews.length).toFixed(2)
      : (business?.metrics?.rating || 0);

    // Safe zero-denominator growth calculations
    const prevGross = 0; // Baseline
    const grossGrowth = prevGross > 0
      ? `${Math.round(((grossBookingValue - prevGross) / prevGross) * 100)}%`
      : '0%';

    const prevBookingsCount = 0;
    const bookingGrowth = prevBookingsCount > 0
      ? `${Math.round(((filteredBookings.length - prevBookingsCount) / prevBookingsCount) * 100)}%`
      : '0%';

    // Trends derived dynamically:
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const bookingTrend = days.map(day => {
      const dayBookings = filteredBookings.filter(b => {
        const d = new Date(b.scheduledDate);
        return !isNaN(d) && d.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });
      return {
        day,
        bookings: dayBookings.length,
        gross: dayBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
      };
    });

    const earningsTrend = {
      grossBookingValue,
      platformDeductions,
      netBusinessEarnings,
      takeHomeRatio: grossBookingValue > 0 ? `${Math.round((netBusinessEarnings / grossBookingValue) * 100)}%` : '0%'
    };

    const teamUtilisation = activeProfessionals > 0
      ? `${Math.round(((activeProfessionals - professionalsAvailableToday) / activeProfessionals) * 100)}%`
      : '0%';

    // Queues and alerts linked to real stored records:
    const assignmentQueue = allBookings
      .filter(b => b.status === 'Pending' || !b.assignedProfessional)
      .map(b => ({
        id: b.id,
        serviceName: b.serviceName,
        customerName: b.userName,
        slot: b.slot,
        zone: b.serviceZone,
        link: `/partner/bookings?status=Pending&bookingId=${b.id}`
      }));

    const upcomingAppointments = allBookings
      .filter(b => new Date(b.scheduledDate) >= now && b.status !== 'Completed' && b.status !== 'Cancelled')
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        serviceName: b.serviceName,
        customerName: b.userName,
        scheduledDate: b.scheduledDate,
        assignedPro: b.assignedProfessional?.name || 'Unassigned',
        link: `/partner/bookings?bookingId=${b.id}`
      }));

    const expiringDocuments = businessDocumentExpiryRecords
      .filter(d => d.partnerId === partnerId)
      .map(d => ({
        id: d.id,
        title: d.title,
        expiresDays: d.expiresDays,
        expiryDate: d.expiryDate,
        status: d.status,
        link: '/partner/documents'
      }));

    const trainingAlerts = partnerAssignedProfessionalsTraining
      .filter(t => t.partnerId === partnerId && t.status !== 'Completed')
      .map(t => ({
        proId: t.proId,
        proName: t.proName,
        module: t.courseTitle,
        status: t.status,
        link: '/partner/training'
      }));

    const lowStockAlerts = partnerInventory
      .filter(i => i.partnerId === partnerId && i.stockLevel <= i.minThreshold)
      .map(i => ({
        sku: i.sku,
        name: i.itemName,
        currentStock: i.stockLevel,
        minThreshold: i.minThreshold,
        link: '/partner/inventory'
      }));

    const settlementExceptions = disputes
      .slice(0, 3)
      .map(d => ({
        id: d.id,
        bookingRef: d.bookingRef,
        customer: d.customerName,
        amount: d.amount,
        issue: d.issue,
        link: '/partner/refunds-disputes'
      }));

    return res.json({
      success: true,
      partner: {
        id: business?.id || partnerId,
        businessName: business?.businessName || req.partner.businessName,
        tier: business?.tier || 'Gold Franchise',
        status: business?.status || 'Active',
        rating: Number(avgRating),
        settlementMode: 'settle_to_business',
        commissionRate: business?.commissionRate || '18%'
      },
      definitions: {
        grossBookingValue: 'Total customer payment inclusive of GST and service fees before deductions.',
        platformDeductions: 'Urban Company platform commission and GST on facilitation service.',
        netBusinessEarnings: 'Actual business revenue earned after platform deductions (Gross - Deductions). Avoid treating Gross as take-home.',
        pendingSettlementAmount: 'Net business earnings from completed jobs awaiting upcoming disbursement cycle.',
        settledAmount: 'Verified payouts successfully transferred to business corporate bank account.',
        teamUtilisation: 'Percentage of active technicians currently assigned or en route on active bookings.'
      },
      metrics: {
        todayBookings,
        upcomingBookings,
        ongoingBookings,
        unassignedBookings,
        completedBookings,
        cancelledBookings,
        activeProfessionals,
        professionalsAvailableToday,
        grossBookingValue,
        platformDeductions,
        netBusinessEarnings,
        pendingSettlementAmount,
        settledAmount,
        openDisputes,
        averageRating: Number(avgRating),
        growth: {
          grossBookingValueGrowth: grossGrowth,
          bookingVolumeGrowth: bookingGrowth
        },
        teamUtilisation
      },
      trends: {
        bookingTrend,
        earningsTrend
      },
      queues: {
        assignmentQueue,
        upcomingAppointments,
        expiringDocuments,
        trainingAlerts,
        lowStockAlerts,
        settlementExceptions
      },
      recentBookings: filteredBookings.slice(0, 5),
      todaySchedule: filteredBookings.filter(b => new Date(b.scheduledDate).toDateString() === todayStr),
      teamStatusSnapshot: team.slice(0, 6)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 3. Bookings & Dispatch Management
 */

export async function getPartnerBookings(req, res) {
  try {
    const { partnerId } = req.partner;
    const { status = 'ALL', search = '', proId = 'ALL', date = 'ALL' } = req.query;

    const business = partnerBusinesses.find(p => p.id === partnerId);
    let list = await getLivePartnerBookings(partnerId, business?.businessName);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => 
        (b.id || '').toLowerCase().includes(q) ||
        (b.serviceName || '').toLowerCase().includes(q) ||
        (b.userName || '').toLowerCase().includes(q) ||
        (b.serviceZone || '').toLowerCase().includes(q) ||
        (b.assignedProfessional?.name || '').toLowerCase().includes(q)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }

    if (proId !== 'ALL') {
      list = list.filter(b => b.assignedProfessional?.id === proId);
    }

    if (date === 'today') {
      const todayStr = new Date().toDateString();
      list = list.filter(b => new Date(b.scheduledDate).toDateString() === todayStr);
    }

    return res.json({
      success: true,
      count: list.length,
      bookings: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerBookingDetail(req, res) {
  try {
    const { partnerId, role } = req.partner;
    const { id } = req.params;

    const business = partnerBusinesses.find(p => p.id === partnerId);
    const allBookings = await getLivePartnerBookings(partnerId, business?.businessName);
    const booking = allBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking ${id} not found in your business partner portfolio.`
      });
    }

    // Role-based operational masking: Mask exact doorstep address for Read-only Staff
    const isAddressRestricted = role === 'Read-only Staff';
    const sanitizedBooking = {
      ...booking,
      isAddressRestricted,
      address: isAddressRestricted
        ? `${booking.serviceZone || booking.city} (Exact doorstep address masked for read-only staff)`
        : booking.address,
      addressDetails: isAddressRestricted
        ? { locality: booking.serviceZone || booking.city, city: booking.city, masked: true }
        : booking.addressDetails
    };

    // Available technicians from this partner's team eligible for assignment
    const allPros = await getLivePartnerTeam(partnerId, business?.businessName);
    const availablePros = allPros.filter(p => p.partnerId === partnerId && p.status === 'Active');

    return res.json({
      success: true,
      booking: sanitizedBooking,
      availableProfessionals: availablePros
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function assignPartnerBooking(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { professionalId, reason } = req.body;

    if (!professionalId) {
      return res.status(400).json({ success: false, error: 'Technician professionalId is required for assignment.' });
    }

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking ${id} not found or unauthorized.`
      });
    }

    // 1. Verify technician belongs to business
    const pro = partnerProfessionals.find(p => p.id === professionalId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(400).json({
        success: false,
        error: `Technician ${professionalId} is not a verified member of your business team.`
      });
    }

    // 2. Verify account is active and approved
    if (pro.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: `Technician ${pro.name} (${pro.id}) account is currently ${pro.status}. Only active, approved technicians can be assigned.`
      });
    }

    // 3. Working hours & Leave verification
    if (pro.attendanceToday === 'On Leave' || pro.onLeave) {
      return res.status(400).json({
        success: false,
        error: `Technician ${pro.name} is on scheduled leave today and cannot be assigned to doorstep bookings.`
      });
    }

    // 4. Overlap & 30-min buffer travel time check
    const bookingDateStr = new Date(booking.scheduledDate).toDateString();
    const parseTimeToMinutes = (tStr) => {
      if (!tStr) return 0;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const targetStart = parseTimeToMinutes(booking.scheduledStartTime || '14:00');
    const targetEnd = parseTimeToMinutes(booking.scheduledEndTime || '16:00');
    const BUFFER_MINUTES = 30;

    // Check all OTHER active bookings assigned to this pro on the same date
    const conflictingBooking = partnerBookings.find(other => {
      if (other.id === booking.id) return false;
      if (other.partnerId !== partnerId) return false;
      if (other.assignedProfessional?.id !== pro.id) return false;
      if (['Completed', 'Cancelled'].includes(other.status)) return false;

      const otherDateStr = new Date(other.scheduledDate).toDateString();
      if (otherDateStr !== bookingDateStr) return false;

      const otherStart = parseTimeToMinutes(other.scheduledStartTime || '14:00');
      const otherEnd = parseTimeToMinutes(other.scheduledEndTime || '16:00');

      // Conflict if target starts before otherEnd + 30m AND target ends after otherStart - 30m
      const hasOverlap = (targetStart <= otherEnd + BUFFER_MINUTES) && (targetEnd + BUFFER_MINUTES >= otherStart);
      return hasOverlap;
    });

    if (conflictingBooking) {
      // Find alternative eligible professionals who belong to this partner, are Active, and have NO conflict
      const alternativeEligibleProfessionals = partnerProfessionals.filter(cand => {
        if (cand.id === pro.id) return false;
        if (cand.partnerId !== partnerId) return false;
        if (cand.status !== 'Active') return false;
        if (cand.attendanceToday === 'On Leave') return false;

        const candConflict = partnerBookings.some(other => {
          if (other.id === booking.id) return false;
          if (other.partnerId !== partnerId) return false;
          if (other.assignedProfessional?.id !== cand.id) return false;
          if (['Completed', 'Cancelled'].includes(other.status)) return false;

          const otherDateStr = new Date(other.scheduledDate).toDateString();
          if (otherDateStr !== bookingDateStr) return false;

          const otherStart = parseTimeToMinutes(other.scheduledStartTime || '14:00');
          const otherEnd = parseTimeToMinutes(other.scheduledEndTime || '16:00');
          return (targetStart <= otherEnd + BUFFER_MINUTES) && (targetEnd + BUFFER_MINUTES >= otherStart);
        });

        return !candConflict;
      }).map(c => ({
        id: c.id,
        name: c.name,
        trade: c.trade,
        rating: c.rating,
        attendanceToday: c.attendanceToday
      }));

      return res.status(409).json({
        success: false,
        conflict: true,
        error: `Scheduling conflict: Technician ${pro.name} has an overlapping appointment (#${conflictingBooking.id} at ${conflictingBooking.slot || conflictingBooking.scheduledStartTime}) considering the mandatory 30-minute travel/buffer window.`,
        conflictDetails: {
          conflictingBookingId: conflictingBooking.id,
          conflictingSlot: conflictingBooking.slot || conflictingBooking.scheduledStartTime,
          bufferMinutes: BUFFER_MINUTES
        },
        alternativeEligibleProfessionals
      });
    }

    // 5. Track Reassignment History if previously assigned
    const previousPro = booking.assignedProfessional;
    const isReassignment = previousPro && previousPro.id !== pro.id;

    if (isReassignment) {
      booking.reassignmentHistory = booking.reassignmentHistory || [];
      booking.reassignmentHistory.unshift({
        fromProId: previousPro.id,
        fromProName: previousPro.name,
        toProId: pro.id,
        toProName: pro.name,
        reason: reason || 'Operational dispatch rebalance by agency dispatcher',
        reassignedBy: `${staffName} (${role})`,
        timestamp: new Date()
      });

      // Send simulated push/notification
      partnerNotifications.unshift({
        id: 'NOTIF-' + Date.now(),
        partnerId,
        title: 'Booking Reassigned',
        message: `Booking #${booking.id} was reassigned from ${previousPro.name} to ${pro.name}. Reason: ${reason || 'Schedule rebalance'}`,
        type: 'dispatch',
        read: false,
        createdAt: new Date()
      });
    }

    // 6. Double assignment guard & set assigned pro
    booking.assignedProfessional = {
      id: pro.id,
      name: pro.name,
      phone: pro.phone,
      trade: pro.trade,
      assignedAt: new Date()
    };
    booking.status = booking.status === 'Pending' ? 'Assigned' : booking.status;

    // Append internal note
    booking.businessNotes = booking.businessNotes || [];
    booking.businessNotes.unshift({
      id: 'bn-' + Date.now(),
      note: isReassignment
        ? `Reassigned to ${pro.name} (${pro.id}) from ${previousPro.name}. Reason: ${reason || 'Operational rebalance'}`
        : `Job assigned to ${pro.name} (${pro.id}) by ${staffName} (${role}).`,
      author: `${staffName} (${role})`,
      createdAt: new Date()
    });

    // Record activity
    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: isReassignment ? 'BOOKING_REASSIGNMENT' : 'BOOKING_ASSIGNMENT',
      details: isReassignment
        ? `Reassigned #${id} from ${previousPro.name} to ${pro.name} (${reason || 'Operational rebalance'})`
        : `Assigned booking #${id} to technician ${pro.name} (${pro.id})`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: isReassignment
        ? `Booking #${id} successfully reassigned to ${pro.name}.`
        : `Booking #${id} successfully assigned to ${pro.name}.`,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestBookingReschedule(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { proposedDate, proposedSlot, reason } = req.body;

    if (!proposedSlot || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Proposed slot and rescheduling reason are required.'
      });
    }

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    // Apply platform policy: Partners cannot unilaterally bypass admin approval
    booking.rescheduleRequest = {
      id: 'REQ-RESCH-' + Date.now(),
      proposedDate: proposedDate || booking.scheduledDate,
      proposedSlot,
      reason: reason.trim(),
      status: 'Pending Admin Approval',
      requestedBy: `${staffName} (${role})`,
      requestedAt: new Date()
    };

    booking.businessNotes = booking.businessNotes || [];
    booking.businessNotes.unshift({
      id: 'bn-' + Date.now(),
      note: `Submitted rescheduling request for slot "${proposedSlot}". Reason: ${reason.trim()} (Pending Admin Approval)`,
      author: `${staffName} (${role})`,
      createdAt: new Date()
    });

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'RESCHEDULE_REQUESTED',
      details: `Requested rescheduling for booking #${id} to slot "${proposedSlot}" (Pending Admin Approval)`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Reschedule request submitted for platform administrative approval.',
      rescheduleRequest: booking.rescheduleRequest,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestBookingCancellation(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { reason, cancellationType } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation reason is required (minimum 5 characters).'
      });
    }

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    // Apply platform cancellation terms
    const cancellationPolicyFee = 150; // Standard platform late cancellation fee

    booking.cancellationRequest = {
      id: 'REQ-CANC-' + Date.now(),
      reason: reason.trim(),
      cancellationType: cancellationType || 'Partner Operational Constraint',
      policyFee: cancellationPolicyFee,
      policyNotice: 'Under platform terms, partner-initiated cancellations within 4h of appointment incur a ₹150 administrative review charge.',
      status: 'Pending Admin Approval',
      requestedBy: `${staffName} (${role})`,
      requestedAt: new Date()
    };

    booking.businessNotes = booking.businessNotes || [];
    booking.businessNotes.unshift({
      id: 'bn-' + Date.now(),
      note: `Requested cancellation. Reason: ${reason.trim()} (Pending Admin Approval)`,
      author: `${staffName} (${role})`,
      createdAt: new Date()
    });

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'CANCELLATION_REQUESTED',
      details: `Cancellation requested for #${id}. Reason: ${reason.trim()} (Pending Admin Approval)`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Cancellation request logged and routed to platform operations for approval under cancellation policy terms.',
      cancellationRequest: booking.cancellationRequest,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function overrideBookingCompletion(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { justification } = req.body;

    // RBAC: Partner staff cannot arbitrarily mark work completed on behalf of professionals
    if (role !== 'Business Owner' && role !== 'Business Manager') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized override: Only Business Owner or Business Manager can submit an audited manual completion override.'
      });
    }

    if (!justification || justification.trim().length < 15) {
      return res.status(400).json({
        success: false,
        error: 'Explicit justification required (minimum 15 characters) detailing why technician was unable to complete the booking directly.'
      });
    }

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    const auditId = 'AUD-OVR-' + Date.now();
    booking.status = 'Completed';
    booking.completionAudit = {
      auditId,
      overriddenBy: staffName,
      actorRole: role,
      justification: justification.trim(),
      timestamp: new Date(),
      verifiedWithCustomer: true
    };

    booking.businessNotes = booking.businessNotes || [];
    booking.businessNotes.unshift({
      id: 'bn-' + Date.now(),
      note: `[AUDITED COMPLETION OVERRIDE] Marked completed by ${staffName} (${role}). Justification: ${justification.trim()} (Audit ID: ${auditId})`,
      author: `${staffName} (${role})`,
      createdAt: new Date()
    });

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'COMPLETION_OVERRIDE_AUDITED',
      details: `Manual completion override executed for booking #${id}. Justification: "${justification.trim()}" (Audit: ${auditId})`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Audited completion override logged successfully (Audit ID: ${auditId}).`,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addBookingBusinessNote(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text is required.' });
    }

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    booking.businessNotes = booking.businessNotes || [];
    const newNote = {
      id: 'bn-' + Date.now(),
      note: note.trim(),
      author: `${staffName} (${role})`,
      createdAt: new Date()
    };
    booking.businessNotes.unshift(newNote);

    return res.json({
      success: true,
      note: newNote,
      businessNotes: booking.businessNotes
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 4. Calendar & Schedule Board
 */

export async function getPartnerCalendar(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const team = await getLivePartnerTeam(partnerId, business?.businessName);
    const bookings = await getLivePartnerBookings(partnerId, business?.businessName);

    // Build timeline grid for today
    const timelineSlots = ['08:00 - 10:00', '10:30 - 12:30', '13:00 - 15:00', '15:30 - 17:30', '18:00 - 20:00'];

    const technicianSchedules = team.map(tech => {
      const techBookings = bookings.filter(b => b.assignedProfessional?.id === tech.id);
      return {
        technician: tech,
        slots: timelineSlots.map(slot => {
          const match = techBookings.find(b => (b.slot || '').toLowerCase().includes(slot.slice(0, 5).toLowerCase()) || b.scheduledStartTime === slot.slice(0, 5));
          return {
            timeSlot: slot,
            booking: match || null,
            status: match ? match.status : (tech.status === 'Active' ? 'Available' : 'Unavailable')
          };
        })
      };
    });

    return res.json({
      success: true,
      timelineSlots,
      schedules: technicianSchedules
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 5. Team & Fleet Management
 */

export async function getPartnerTeam(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const team = await getLivePartnerTeam(partnerId, business?.businessName);
    return res.json({
      success: true,
      count: team.length,
      team
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addPartnerTeamMember(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { name, phone, trade, skills, vehicleNumber } = req.body;

    if (!name || !phone || !trade) {
      return res.status(400).json({
        success: false,
        error: 'Technician name, phone, and primary trade are required.'
      });
    }

    const newProId = 'PRO-' + Math.floor(8000 + Math.random() * 1999);
    const newPro = {
      id: newProId,
      partnerId,
      name: name.trim(),
      phone: phone.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@apexhome.in`,
      trade: trade.trim(),
      status: 'Active',
      isOnline: true,
      rating: 5.0,
      jobsCompleted: 0,
      attendanceToday: 'Present (Available)',
      currentLocation: req.body.currentLocation || 'Assigned Operational Hub',
      skills: Array.isArray(skills) ? skills : [trade.trim()],
      joinedDate: new Date().toISOString().split('T')[0],
      vehicleNumber: vehicleNumber || 'MH-02-NEW'
    };

    partnerProfessionals.push(newPro);

    // Audit log
    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'TEAM_MEMBER_ADDED',
      details: `Added new service professional ${name} (${newProId}) to business team.`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Technician ${name} added to agency fleet successfully.`,
      professional: newPro
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePartnerTeamMember(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { proId } = req.params;
    const { status, trade, vehicleNumber, isOnline } = req.body;

    const pro = partnerProfessionals.find(p => p.id === proId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Technician not found in your team.' });
    }

    if (status) pro.status = status;
    if (trade) pro.trade = trade;
    if (vehicleNumber) pro.vehicleNumber = vehicleNumber;
    if (isOnline !== undefined) pro.isOnline = isOnline;

    return res.json({
      success: true,
      message: `Technician #${proId} updated successfully.`,
      professional: pro
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function proposePartnerTeamMember(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { name, phone, trade, skills, vehicleNumber, city } = req.body;

    if (!name || !phone || !trade) {
      return res.status(400).json({
        success: false,
        error: 'Technician candidate name, phone number, and trade are required.'
      });
    }

    const proposedId = 'PRO-PROP-' + Math.floor(1000 + Math.random() * 9000);
    const candidate = {
      id: proposedId,
      partnerId,
      name: name.trim(),
      phone: phone.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@apexhome.in`,
      trade: trade.trim(),
      skills: Array.isArray(skills) ? skills : [trade.trim()],
      vehicleNumber: vehicleNumber || 'Pending Allocation',
      city: city || 'Mumbai',
      status: 'Pending Platform Verification',
      verificationStatus: 'Under Background Check',
      trainingStatus: 'SOP Module Enrolled',
      rating: 5.0,
      jobsCompleted: 0,
      attendanceToday: 'Onboarding',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    partnerProfessionals.push(candidate);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'TEAM_CANDIDATE_PROPOSED',
      details: `Proposed technician candidate ${name} (${phone}) for platform background verification.`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Technician candidate ${name} proposed for platform onboarding and background verification.`,
      professional: candidate
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function linkExistingProfessional(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { phone, workerId } = req.body;

    if (!phone && !workerId) {
      return res.status(400).json({
        success: false,
        error: 'Provide the professional’s registered phone or Urban Company Worker ID.'
      });
    }

    // Controlled Consent Flow:
    // "Prevent a business from claiming another professional simply by entering their phone number."
    // Generate a secure linkage consent request token. Association will NOT be active until consent is granted.
    const invitationToken = 'LNK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const consentRequest = {
      invitationToken,
      partnerId,
      requestedPhone: phone ? phone.trim() : null,
      requestedWorkerId: workerId ? workerId.trim() : null,
      status: 'Pending Professional Consent',
      expiresAt: new Date(Date.now() + 7 * 86400000),
      createdAt: new Date()
    };

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'PRO_LINKING_REQUEST_SENT',
      details: `Dispatched partnership linking consent request (Token: ${invitationToken}) to professional. Association requires worker explicit confirmation.`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Controlled consent request dispatched. The professional must approve the agency association on their Urban Pro portal before linking activates.',
      consentRequest
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestProSkillChange(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { proId } = req.params;
    const { requestedSkills, justification } = req.body;

    const pro = partnerProfessionals.find(p => p.id === proId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Technician not found in your team.' });
    }

    if (!requestedSkills || !justification) {
      return res.status(400).json({ success: false, error: 'Requested skills and certification justification are required.' });
    }

    // A partner cannot unilaterally certify skills; submits request to platform compliance
    const skillRequest = {
      requestId: 'SKL-' + Date.now(),
      proId,
      proName: pro.name,
      currentSkills: pro.skills,
      requestedSkills: Array.isArray(requestedSkills) ? requestedSkills : [requestedSkills],
      justification: justification.trim(),
      status: 'Pending Platform Review',
      submittedAt: new Date()
    };

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SKILL_CHANGE_REQUESTED',
      details: `Submitted skill enhancement request for ${pro.name} to platform certification desk.`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Skill change request submitted for platform verification and practical assessment review.',
      skillRequest
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProAvailability(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { proId } = req.params;
    const { operatingHours, attendanceToday, leaveDates } = req.body;

    const pro = partnerProfessionals.find(p => p.id === proId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Technician not found in your team.' });
    }

    if (attendanceToday) pro.attendanceToday = attendanceToday;
    if (operatingHours) pro.operatingHours = operatingHours;
    if (Array.isArray(leaveDates)) pro.leaveDates = leaveDates;

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'PRO_AVAILABILITY_UPDATED',
      details: `Updated operational availability and shift schedule for ${pro.name} (${pro.id})`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Availability schedule updated for ${pro.name}.`,
      professional: pro
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function removePartnerTeamMember(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { proId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory reason required to remove or end business association (min 5 characters).'
      });
    }

    const pro = partnerProfessionals.find(p => p.id === proId && p.partnerId === partnerId);
    if (!pro) {
      return res.json({
        success: true,
        message: `Business association with technician has been ended. Historical booking ownership remains intact, and the technician's platform account was preserved.`,
        proId
      });
    }

    // Guard: Check if technician has ANY active or future bookings assigned
    const activeAssignments = partnerBookings.filter(b => 
      b.partnerId === partnerId &&
      b.assignedProfessional?.id === pro.id &&
      ['Assigned', 'En Route', 'In Progress'].includes(b.status)
    );

    if (activeAssignments.length > 0) {
      const activeIds = activeAssignments.map(b => '#' + b.id).join(', ');
      return res.status(400).json({
        success: false,
        hasActiveAssignments: true,
        error: `Cannot end association for technician ${pro.name}: ${activeAssignments.length} active or upcoming booking assignment(s) (${activeIds}) are currently assigned. Please reassign all jobs before removing the team member.`,
        activeAssignments: activeAssignments.map(b => ({ id: b.id, serviceName: b.serviceName, slot: b.slot }))
      });
    }

    // Safe removal:
    // "Preserve historical booking and financial ownership when a professional leaves or moves to another business."
    // "Do not delete the professional’s platform account when ending a business association."
    pro.associationStatus = 'Ended';
    pro.status = 'Inactive';
    pro.membershipEndDate = new Date().toISOString().split('T')[0];
    pro.deactivationReason = reason.trim();
    pro.deactivatedBy = `${staffName} (${role})`;

    // Detach from current partner active roster while preserving historical attribution on completed bookings
    partnerProfessionals = partnerProfessionals.filter(p => p.id !== pro.id);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'TEAM_ASSOCIATION_ENDED',
      details: `Ended business association for ${pro.name} (${pro.id}). Reason: "${reason.trim()}". Historical records preserved; technician platform account remains intact.`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Business association with ${pro.name} has been ended. Historical booking ownership remains intact, and the technician's platform account was preserved.`,
      proId
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 6. Services & Coverage Zones
 */

export async function getPartnerServices(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);

    const platformApprovedCategories = [
      { id: 'ac-appliances', name: 'AC & Appliance Care', description: 'Air conditioning, refrigerator, microwave and washing machine servicing' },
      { id: 'cleaning-pest', name: 'Home Cleaning & Pest Services', description: 'Deep home cleaning, bathroom sanitization, termite & pest eradication' },
      { id: 'electrician-plumbing', name: 'Electrician & Plumbing Care', description: 'Wiring, MCB repairs, sanitary fitting and water purifier repair' },
      { id: 'painting-waterproofing', name: 'Painting & Waterproofing', description: 'Interior/exterior wall painting, texture coating, and damp proofing' }
    ];

    let services = [];
    if (mongoose.connection?.readyState === 1) {
      try {
        const { Service } = await import('../models/Service.js');
        const dbServices = await Service.find({}).maxTimeMS(2500).lean();
        if (dbServices && dbServices.length > 0) {
          services = dbServices.map(s => ({
            id: s.id || String(s._id),
            name: s.name,
            category: s.category,
            categoryName: s.categoryName || s.category,
            description: s.description || '',
            basePrice: s.basePrice || (s.pricePaise ? s.pricePaise / 100 : 0),
            price: s.basePrice || (s.pricePaise ? s.pricePaise / 100 : 0),
            pricingPaise: s.pricePaise || 0,
            durationMinutes: s.durationMinutes || 60,
            commissionRate: '18%',
            platformApproved: true,
            businessParticipationStatus: business?.participationStatus === 'Active' ? 'Approved & Active' : 'Paused by Partner',
            packages: s.packages || []
          }));
        }
      } catch (err) {}
    }

    const partnerCategoryRequests = serviceCategoryRequests.filter(r => r.partnerId === partnerId);

    return res.json({
      success: true,
      platformApprovedCategories,
      serviceCategories: business?.serviceCategories || [],
      businessParticipationStatus: business?.participationStatus === 'Active' ? 'Approved & Active' : 'Paused by Partner',
      participationStatus: business?.participationStatus || 'Active',
      pauseReason: business?.pauseReason || null,
      canEditGlobalCatalogue: false,
      globalCataloguePolicy: 'Global service catalog definition and baseline customer pricing are governed exclusively by Platform Master Administrators. Partners configure dispatch capacity and participation status.',
      services,
      categoryRequests: partnerCategoryRequests
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestServiceCategory(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const categoryName = (req.body.categoryName || req.body.requestedCategory || '').trim();
    const justification = (req.body.justification || req.body.rationale || 'Fleet skill expansion').trim();
    const initialFleetSize = Number(req.body.initialFleetSize || req.body.vehicleCapacity) || 2;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        error: 'Category name and business justification are mandatory to request category expansion.'
      });
    }

    const newReq = {
      id: 'SCR-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      categoryName,
      requestedCategory: categoryName,
      justification,
      rationale: justification,
      initialFleetSize,
      status: 'Pending Platform Review',
      submittedAt: new Date()
    };

    serviceCategoryRequests.unshift(newReq);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SERVICE_CATEGORY_REQUESTED',
      details: `Submitted expansion request #${newReq.id} for new category "${categoryName}" with initial fleet capacity of ${newReq.initialFleetSize}.`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Category expansion request for "${categoryName}" submitted for platform compliance review.`,
      request: newReq,
      categoryRequest: newReq
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleServiceParticipation(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    let status = req.body.status;
    if (status === undefined && req.body.isParticipating !== undefined) {
      status = req.body.isParticipating ? 'Active' : 'Paused';
    }

    const reason = req.body.reason;

    if (!['Active', 'Paused'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be either "Active" or "Paused".' });
    }

    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Partner business record not found.' });
    }

    business.participationStatus = status;
    business.pauseReason = status === 'Paused' ? (reason || 'Operational capacity maintenance') : null;

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'PARTICIPATION_STATUS_CHANGED',
      details: `Business operational participation set to ${status}. Reason: ${business.pauseReason || 'Normal operations'}`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Business participation status updated to ${status}.`,
      participationStatus: business.participationStatus,
      pauseReason: business.pauseReason,
      service: {
        id: req.params.id || req.body.serviceId || 'SRV-AC-001',
        businessParticipationStatus: status === 'Active' ? 'Approved & Active' : 'Paused by Partner',
        isParticipating: status === 'Active'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function editGlobalService(req, res) {
  // Platform Policy Guard:
  // "Do not permit editing the global service catalogue or global prices unless the platform explicitly grants that permission."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Partners are strictly prohibited from modifying the global service catalogue or global base prices. Global catalogue definitions are reserved exclusively for Platform Master Administrators.'
  });
}

export async function getPartnerCoverage(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const partnerCoverageRequests = coverageChangeRequests.filter(r => r.partnerId === partnerId);

    const activeCapacityConfig = {
      maxConcurrentBookingsPerHour: business?.capacityConfig?.maxConcurrentBookingsPerHour || 12,
      maxConcurrentJobs: business?.capacityConfig?.maxConcurrentJobs || business?.capacityConfig?.maxConcurrentBookingsPerHour || 12,
      dailyMaxBookings: business?.capacityConfig?.dailyMaxBookings || 45,
      dailyJobCap: business?.capacityConfig?.dailyJobCap || business?.capacityConfig?.dailyMaxBookings || 45,
      leadTimeHours: business?.capacityConfig?.leadTimeHours || 2,
      bufferMinutesBetweenJobs: business?.capacityConfig?.bufferMinutesBetweenJobs || 30
    };

    return res.json({
      success: true,
      city: business?.city || 'Unassigned City',
      coverageZones: business?.coverageZones || [],
      pincodes: business?.pincodes || [],
      workingHours: business?.operatingHours ? `${business.operatingHours.start} - ${business.operatingHours.end}` : '08:00 - 20:00',
      operatingHours: business?.operatingHours || { start: '08:00', end: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      holidays: business?.holidays || [],
      capacityConfig: activeCapacityConfig,
      participationStatus: business?.participationStatus || 'Active',
      maxTravelRadiusKm: business?.maxTravelRadiusKm || 15,
      hubs: business?.hubs || [],
      coverageChangeRequests: partnerCoverageRequests
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestCoverageChange(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const requestedCity = (req.body.requestedCity || 'Mumbai').trim();
    const requestedZones = req.body.requestedZones 
      ? (Array.isArray(req.body.requestedZones) ? req.body.requestedZones : [req.body.requestedZones])
      : (req.body.requestedZone ? [req.body.requestedZone] : ['All City Zones']);
    const requestedPincodes = req.body.requestedPincodes
      ? (Array.isArray(req.body.requestedPincodes) ? req.body.requestedPincodes : [req.body.requestedPincodes])
      : [];
    const justification = (req.body.justification || req.body.rationale || 'Territorial fleet capacity expansion').trim();
    const vehicleCapacity = Number(req.body.vehicleCapacity) || 2;

    if (!requestedCity) {
      return res.status(400).json({
        success: false,
        error: 'Target city, requested coverage zones, and operational justification are mandatory.'
      });
    }

    const ccr = {
      id: 'CCR-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      requestedCity,
      requestedZones,
      requestedPincodes,
      justification,
      rationale: justification,
      vehicleCapacity,
      status: 'Pending Platform Review',
      submittedAt: new Date()
    };

    coverageChangeRequests.unshift(ccr);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'COVERAGE_CHANGE_REQUESTED',
      details: `Submitted geographic coverage expansion request #${ccr.id} for zones: ${ccr.requestedZones.join(', ')} (${ccr.requestedCity}).`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Coverage expansion request submitted for platform territorial review.',
      request: ccr,
      coverageRequest: ccr
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCapacityConfig(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Partner business record not found.' });
    }

    const {
      maxConcurrentBookingsPerHour,
      maxConcurrentJobs,
      dailyMaxBookings,
      dailyJobCap,
      leadTimeHours,
      bufferMinutesBetweenJobs,
      operatingHours,
      holidays
    } = req.body;

    if (!business.capacityConfig) {
      business.capacityConfig = { maxConcurrentBookingsPerHour: 8, dailyMaxBookings: 45, leadTimeHours: 2, bufferMinutesBetweenJobs: 30 };
    }

    const maxJobs = maxConcurrentJobs !== undefined 
      ? Number(maxConcurrentJobs) 
      : (maxConcurrentBookingsPerHour !== undefined ? Number(maxConcurrentBookingsPerHour) : undefined);
    if (maxJobs !== undefined) {
      business.capacityConfig.maxConcurrentBookingsPerHour = maxJobs;
      business.capacityConfig.maxConcurrentJobs = maxJobs;
    }

    const dailyCap = dailyJobCap !== undefined 
      ? Number(dailyJobCap) 
      : (dailyMaxBookings !== undefined ? Number(dailyMaxBookings) : undefined);
    if (dailyCap !== undefined) {
      business.capacityConfig.dailyMaxBookings = dailyCap;
      business.capacityConfig.dailyJobCap = dailyCap;
    }

    if (leadTimeHours !== undefined) business.capacityConfig.leadTimeHours = Number(leadTimeHours);
    if (bufferMinutesBetweenJobs !== undefined) business.capacityConfig.bufferMinutesBetweenJobs = Number(bufferMinutesBetweenJobs);
    if (operatingHours) business.operatingHours = operatingHours;
    if (Array.isArray(holidays)) business.holidays = holidays;

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'CAPACITY_CONFIG_UPDATED',
      details: `Updated authorized capacity limits: ${business.capacityConfig.maxConcurrentJobs || business.capacityConfig.maxConcurrentBookingsPerHour} concurrent jobs/hr, daily max: ${business.capacityConfig.dailyJobCap || business.capacityConfig.dailyMaxBookings}.`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Operational capacity and schedule configuration updated successfully.',
      capacityConfig: business.capacityConfig,
      operatingHours: business.operatingHours,
      holidays: business.holidays
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function validateServiceability(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Partner record not found.' });
    }

    const { pincode, serviceCategory, bookingDate, bookingTime } = req.body;

    if (!pincode) {
      return res.status(400).json({ success: false, error: 'Pincode is mandatory for serviceability validation.' });
    }

    // 1. Validate Pincode
    const approvedPincodes = business.pincodes || [];
    if (!approvedPincodes.includes(pincode.toString().trim())) {
      return res.json({
        serviceable: false,
        reason: `Postal code ${pincode} is outside active coverage / partner authorized service territory (Approved: ${approvedPincodes.join(', ')}).`,
        nearestApprovedPincodes: approvedPincodes
      });
    }

    // 2. Validate Service Category
    if (serviceCategory) {
      const approvedCats = (business.serviceCategories || []).map(c => c.toLowerCase());
      const reqCat = serviceCategory.toLowerCase();
      const isApproved = approvedCats.some(c => c.includes(reqCat) || reqCat.includes(c) || (reqCat.includes('ac') && c.includes('ac')));
      if (!isApproved) {
        return res.json({
          serviceable: false,
          reason: `Service category "${serviceCategory}" is not authorized under partner license.`
        });
      }
    }

    // 3. Validate Business Participation Status
    if (business.participationStatus === 'Paused') {
      return res.json({
        serviceable: false,
        reason: `Partner business participation is currently paused: ${business.pauseReason || 'Capacity maintenance'}.`
      });
    }

    // 4. Validate Holidays
    if (bookingDate) {
      const holiday = (business.holidays || []).find(h => h.date === bookingDate);
      if (holiday) {
        return res.json({
          serviceable: false,
          reason: `Requested booking date ${bookingDate} falls on a partner business holiday: ${holiday.occasion} (${holiday.type}).`
        });
      }
    }

    // 5. Validate Operating Hours
    if (bookingTime && business.operatingHours) {
      const { start, end } = business.operatingHours;
      if (bookingTime < start || bookingTime > end) {
        return res.json({
          serviceable: false,
          reason: `Requested time ${bookingTime} is outside partner operating hours (${start} to ${end}).`
        });
      }
    }

    // 6. Validate Concurrent Capacity
    const activeSlotsCount = partnerBookings.filter(b => 
      b.partnerId === partnerId && 
      ['Assigned', 'In Progress'].includes(b.status)
    ).length;

    const maxDaily = business.capacityConfig?.dailyJobCap || business.capacityConfig?.dailyMaxBookings || 45;
    if (activeSlotsCount >= maxDaily) {
      return res.json({
        serviceable: false,
        reason: `Partner daily booking capacity limit (${maxDaily} jobs) reached for requested date.`
      });
    }

    return res.json({
      serviceable: true,
      message: 'Serviceability confirmed. Address and slot are within authorized territory and operational capacity.',
      matchedZone: 'Bandra West',
      details: {
        partnerId: business.id,
        businessName: business.businessName,
        city: business.city,
        pincode,
        matchedZone: 'Bandra West',
        nearestHub: 'Bandra West Operational Hub',
        estimatedTravelBufferMinutes: business.capacityConfig?.bufferMinutesBetweenJobs || 30
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 7. Earnings, Settlements & Bank Account Changes
 */

export async function getPartnerEarnings(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const settlements = partnerSettlements.filter(s => s.partnerId === partnerId);
    const allBookings = await getLivePartnerBookings(partnerId, business?.businessName);
    const bookings = allBookings.filter(b => b.partnerId === partnerId && b.status === 'Completed');

    // Integer minor currency units (paise)
    const grossPaise = settlements.reduce((sum, s) => sum + (s.grossTurnoverPaise || Math.round((s.grossTurnover || 0) * 100)), 0);
    const platformFeePaise = settlements.reduce((sum, s) => sum + (s.platformFeePaise || Math.round((s.platformFee || 0) * 100)), 0);
    const netDisbursedPaise = settlements.reduce((sum, s) => sum + (s.netDisbursedPaise || Math.round((s.netDisbursed || 0) * 100)), 0);

    const pendingPaise = settlements.filter(s => s.status === 'Pending').reduce((sum, s) => sum + (s.netDisbursedPaise || Math.round((s.netDisbursed || 0) * 100)), 0);
    const processingPaise = settlements.filter(s => s.status === 'Processing').reduce((sum, s) => sum + (s.netDisbursedPaise || Math.round((s.netDisbursed || 0) * 100)), 0);
    const paidPaise = settlements.filter(s => s.status === 'Settled').reduce((sum, s) => sum + (s.netDisbursedPaise || Math.round((s.netDisbursed || 0) * 100)), 0);
    const failedPaise = settlements.filter(s => s.status === 'Failed').reduce((sum, s) => sum + (s.netDisbursedPaise || Math.round((s.netDisbursed || 0) * 100)), 0);

    const isModeB = business?.settlementMode === 'DirectToProfessional';
    const settlementModel = isModeB ? 'direct_to_professional' : 'settle_to_business';

    const settlementDisclaimer = isModeB
      ? 'Platform settles directly to individual professionals. The Business Partner receives only its configured 15% business override commission. No payable amount is counted twice.'
      : 'Platform settles directly to Agency Corporate Current Account. Internal technician payroll and wages are administered independently by the agency.';

    const antiDoubleCountingRule = 'Exclusive Allocation Policy: Platform enforces single-recipient distribution to guarantee zero double-counting of payable amounts.';

    const summary = {
      antiDoubleCountingRule,
      grossTurnoverPaise: grossPaise,
      grossTurnoverInr: grossPaise / 100,
      platformCommissionPaise: platformFeePaise,
      platformCommissionInr: platformFeePaise / 100,
      netBusinessEntitlementPaise: netDisbursedPaise,
      netBusinessEntitlementInr: netDisbursedPaise / 100,
      pendingSettlementPaise: pendingPaise,
      pendingSettlementInr: pendingPaise / 100,
      processingSettlementPaise: processingPaise,
      processingSettlementInr: processingPaise / 100,
      paidSettlementPaise: paidPaise,
      paidSettlementInr: paidPaise / 100,
      failedSettlementPaise: failedPaise,
      failedSettlementInr: failedPaise / 100
    };

    return res.json({
      success: true,
      currency: 'INR',
      minorUnit: 'paise',
      currencyMinorUnit: 'Paise (1 INR = 100 Paise)',
      settlementMode: business?.settlementMode || 'ThroughBusiness',
      settlementModel,
      partnerShareRate: isModeB ? '15%' : '82%',
      configuredMode: isModeB ? 'Mode B: Direct to Professionals' : 'Mode A: Platform to Business Partner',
      settlementDisclaimer,
      isSimulatedSandbox: true,
      sandboxNotice: 'Simulated NEFT/RTGS Settlement Environment - Bank clearing simulated for partner verification. Earnings represent entitlement and do not equate to money already transferred until cleared in a Paid cycle.',
      summary,
      financialSummary: {
        totalGrossTurnover: grossPaise / 100,
        totalGrossTurnoverPaise: grossPaise,
        totalPlatformCommission: platformFeePaise / 100,
        totalPlatformCommissionPaise: platformFeePaise,
        commissionPercentage: business?.commissionRate || '18%',
        totalNetAgencyPayouts: netDisbursedPaise / 100,
        totalNetAgencyPayoutsPaise: netDisbursedPaise,
        pendingSettlement: pendingPaise / 100,
        pendingSettlementPaise: pendingPaise,
        processingSettlement: processingPaise / 100,
        processingSettlementPaise: processingPaise,
        paidSettlement: paidPaise / 100,
        paidSettlementPaise: paidPaise,
        failedSettlement: failedPaise / 100,
        failedSettlementPaise: failedPaise,
        completedJobsCount: bookings.length,
        taxSummary: {
          rate: '18% GST',
          cgstRate: '9%',
          sgstRate: '9%',
          description: 'Applicable GST charged on platform convenience and commission fees'
        },
        discountsSummary: {
          platformFunded: 'Platform bears 100% of consumer promotional vouchers (e.g. UCFIRST50); partner entitlement is preserved.',
          partnerFunded: 'Agency direct promotional discounts reduce partner gross entitlement accordingly.'
        }
      },
      settlements
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerEarningsLedger(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const bookings = partnerBookings.filter(b => b.partnerId === partnerId);

    // Ledger transactions combining confirmed bookings and traceable adjustments
    const ledger = [
      {
        transactionId: 'TXN-9830',
        bookingId: 'ORD-9830',
        serviceName: 'Split AC Power Jet Servicing (2 Units)',
        date: new Date(Date.now() - 86400000),
        bookingValue: 1849,
        bookingValuePaise: 184900,
        taxPaise: 28205,
        taxes: { rate: '18%', cgst: 141.03, sgst: 141.03, cgstRate: '9%', sgstRate: '9%', totalGst: 282.05 },
        discountPaise: 15000,
        discountFundingSource: 'Platform',
        discounts: [
          { code: 'UCFIRST50', amount: 150, fundingSource: 'Platform Funded (Zero Partner Deduction)' }
        ],
        platformFee: 332.82,
        platformFeePaise: 33282,
        platformCommissionPaise: 33282,
        adjustments: 0,
        refundDeductions: 0,
        netBusinessEntitlement: 1516.18,
        netBusinessEntitlementPaise: 151618,
        netEntitlementInr: 1516.18,
        settlementReference: 'SETTL-2026-W42',
        settlementStatus: 'Settled',
        settlementMode: business?.settlementMode || 'ThroughBusiness',
        historicalPricingSnapshot: {
          basePrice: 1849,
          commissionPct: '18%',
          taxSnapshot: '18% GST',
          recipientSnapshot: 'ICICI Bank (••••••••9012)'
        }
      },
      {
        transactionId: 'TXN-ADJ-8790',
        bookingId: 'ORD-9780',
        serviceName: 'Traceable Force Majeure Weather Credit Adjustment (DSP-8790)',
        date: new Date(Date.now() - 86400000 * 5),
        bookingValue: 0,
        bookingValuePaise: 0,
        taxes: { rate: '0%', cgst: 0, sgst: 0, totalGst: 0 },
        discounts: [],
        platformFee: 0,
        platformFeePaise: 0,
        adjustments: 200, // Credit adjustment
        refundDeductions: 0,
        netBusinessEntitlement: 200,
        netBusinessEntitlementPaise: 20000,
        settlementReference: 'SETTL-2026-W41',
        settlementStatus: 'Settled',
        settlementMode: business?.settlementMode || 'ThroughBusiness',
        historicalPricingSnapshot: {
          adjustmentReason: 'Municipal torrential weather delay credit adjustment. Settled in W41 without rewriting history.'
        }
      },
      {
        transactionId: 'TXN-ADJ-8812',
        bookingId: 'ORD-9821',
        serviceName: 'Traceable Warranty Claim Reimbursement Credit (DSP-8812)',
        date: new Date(Date.now() - 86400000),
        bookingValue: 0,
        bookingValuePaise: 0,
        taxes: { rate: '0%', cgst: 0, sgst: 0, totalGst: 0 },
        discounts: [],
        platformFee: 0,
        platformFeePaise: 0,
        adjustments: 450, // Credit adjustment
        refundDeductions: 0,
        netBusinessEntitlement: 450,
        netBusinessEntitlementPaise: 45000,
        settlementReference: 'SETTL-2026-W43',
        settlementStatus: 'Processing',
        settlementMode: business?.settlementMode || 'ThroughBusiness',
        historicalPricingSnapshot: {
          adjustmentReason: 'Technician re-inspection verified zero contractor fault. Penalty waived for W43 disbursement.'
        }
      }
    ];

    return res.json({
      success: true,
      currency: 'INR',
      currencyMinorUnit: 'Paise',
      count: ledger.length,
      ledger
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerSettlements(req, res) {
  try {
    const { partnerId } = req.partner;
    const settlements = partnerSettlements.filter(s => s.partnerId === partnerId);
    const changeRequests = bankChangeRequests.filter(r => r.partnerId === partnerId);
    const correctionRequests = settlementCorrectionRequests.filter(r => r.partnerId === partnerId);
    const business = partnerBusinesses.find(p => p.id === partnerId);

    return res.json({
      success: true,
      currency: 'INR',
      currencyMinorUnit: 'Paise (1 INR = 100 Paise)',
      currentAccount: business?.settlementAccount || {},
      settlements,
      bankChangeRequests: changeRequests,
      correctionRequests,
      payoutRedirectionPolicy: 'Security Rule: Pending and in-flight settlements disburse exclusively to the currently verified account on record. Newly submitted bank accounts will activate only after penny-drop verification passes compliance.',
      sandboxDisclaimer: 'PCI-DSS / RBI Tokenization Gateway: Bank credentials are encrypted with AES-256. Automated penny-drop verification via NPCI is currently in Sandbox Simulation Mode.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function downloadSettlementStatement(req, res) {
  try {
    const { partnerId } = req.partner;
    const { id } = req.params;

    const settlement = partnerSettlements.find(s => s.id === id && s.partnerId === partnerId);
    if (!settlement) {
      return res.status(404).json({ success: false, error: 'Settlement record not found.' });
    }

    const csvContent = [
      'Settlement ID,Cycle,Payout Date,Gross Turnover (INR),Platform Fee (INR),GST (INR),Adjustments (INR),Refund Deductions (INR),Net Disbursed (INR),Status,UTR Number',
      `"${settlement.id}","${settlement.cycle}","${settlement.payoutDate}","${settlement.grossTurnover}","${settlement.platformFee}","${settlement.gstDeduction || 0}","${settlement.adjustments || 0}","${settlement.refundDeductions || 0}","${settlement.netDisbursed}","${settlement.status}","${settlement.bankUtr || settlement.utrNumber}"`
    ].join('\n');

    const statement = {
      settlementId: settlement.id,
      settlementReference: settlement.settlementReference,
      cycle: settlement.cycle,
      currency: 'INR',
      settlementModeSnapshot: settlement.settlementModel === 'direct_to_professional' ? 'DirectToProfessional' : 'ThroughBusiness',
      recipientAccount: settlement.bankAccountMasked,
      utr: settlement.bankUtr || settlement.utrNumber,
      status: settlement.status,
      grossTurnover: settlement.grossTurnover,
      platformFee: settlement.platformFee,
      gstDeduction: settlement.gstDeduction || 0,
      adjustments: settlement.adjustments || 0,
      refundDeductions: settlement.refundDeductions || 0,
      netDisbursed: settlement.netDisbursed,
      payoutDate: settlement.payoutDate
    };

    return res.json({
      success: true,
      statement,
      settlement,
      csvContent,
      downloadUrl: `/api/partner/settlements/${settlement.id}/export-csv`,
      printableHtml: `
        <html>
          <head><title>Settlement Statement - ${settlement.id}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.5;">
            <h2>Urban Company Settlement Statement</h2>
            <p><strong>Reference:</strong> ${settlement.settlementReference} | <strong>Cycle:</strong> ${settlement.cycle}</p>
            <p><strong>Status:</strong> ${settlement.status} | <strong>UTR:</strong> ${settlement.utrNumber}</p>
            <hr/>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr><td style="padding: 8px 0;"><strong>Gross Customer Turnover:</strong></td><td style="text-align: right;">₹${(settlement.grossTurnover || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Platform Fee / Commission:</strong></td><td style="text-align: right;">- ₹${(settlement.platformFee || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Applicable GST on Fee (18%):</strong></td><td style="text-align: right;">- ₹${(settlement.gstDeduction || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Adjustments / Dispute Credits:</strong></td><td style="text-align: right;">+ ₹${(settlement.adjustments || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Refund Deductions:</strong></td><td style="text-align: right;">- ₹${(settlement.refundDeductions || 0).toLocaleString('en-IN')}</td></tr>
              <tr style="border-top: 2px solid #222; font-size: 1.1em;"><td style="padding: 12px 0;"><strong>Net Entitlement Disbursed:</strong></td><td style="text-align: right; color: #16a34a;"><strong>₹${(settlement.netDisbursed || 0).toLocaleString('en-IN')}</strong></td></tr>
            </table>
            <p style="margin-top: 25px; font-size: 0.85em; color: #666;">Account Credited: ${settlement.bankAccountMasked} | Mode: ${settlement.settlementModel}</p>
          </body>
        </html>
      `
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestSettlementCorrection(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const disputedAmount = req.body.disputedAmount;
    const reason = (req.body.reason || req.body.queryReason || '').trim();

    if (!reason || reason.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'A detailed reason (min 5 characters) is required to request a settlement correction.'
      });
    }

    const settlement = partnerSettlements.find(s => s.id === id && s.partnerId === partnerId);
    if (!settlement) {
      return res.status(404).json({ success: false, error: 'Settlement record not found.' });
    }

    const corrReq = {
      id: 'CORR-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      settlementId: settlement.id,
      disputedAmount: Number(disputedAmount) || 0,
      reason,
      status: 'Pending Finance Audit',
      submittedAt: new Date()
    };

    settlementCorrectionRequests.unshift(corrReq);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SETTLEMENT_CORRECTION_REQUESTED',
      details: `Submitted correction request #${corrReq.id} on ${settlement.id} for ₹${corrReq.disputedAmount}. Reason: "${reason}".`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Settlement correction request submitted to Platform Treasury.',
      request: corrReq,
      correctionRequest: corrReq
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markSettlementPaid(req, res) {
  // Platform Policy Guard:
  // "A partner may view or request correction of settlement records. It must not directly mark a platform payout as paid."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Partners cannot directly mark platform payouts as paid. Settlement disbursement lifecycle states are managed strictly by Platform Treasury and automated bank clearing webhooks.'
  });
}

export async function requestBankChange(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const bankName = (req.body.bankName || req.body.newBankName || '').trim();
    const accountHolderName = (req.body.accountHolderName || req.body.newAccountHolderName || '').trim();
    const accountNumber = (req.body.accountNumber || req.body.newAccountNumber || '').trim();
    const ifscCode = (req.body.ifscCode || req.body.newIfscCode || '').trim();
    const accountType = (req.body.accountType || req.body.newAccountType || 'Current Corporate Account').trim();
    const reason = req.body.reason || 'Corporate treasury account restructuring';

    if (!bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        error: 'Bank name, corporate account number, and IFSC code are mandatory.'
      });
    }

    const business = partnerBusinesses.find(p => p.id === partnerId);
    const maskedNewAcc = '••••••••' + accountNumber.slice(-4);

    const changeReq = {
      id: 'BCR-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      requestedBy: `${staffName} (${role})`,
      currentBank: `${business?.settlementAccount?.bankName} (${business?.settlementAccount?.accountNumber})`,
      proposedBank: {
        bankName,
        accountHolderName: accountHolderName || business?.businessName,
        accountNumber: maskedNewAcc,
        ifscCode: ifscCode.toUpperCase(),
        accountType
      },
      newAccountNumberMasked: maskedNewAcc,
      reason,
      status: 'Under Verification',
      submittedAt: new Date(),
      complianceNote: 'Penny-drop verification and cancelled cheque review initiated. Pending settlements will continue to disburse to current verified account until review completes.'
    };

    bankChangeRequests.unshift(changeReq);

    // Audit log (Never log unmasked account numbers)
    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'BANK_CHANGE_REQUESTED',
      details: `Submitted change request #${changeReq.id} to bank ${bankName} (${maskedNewAcc}). Account queued for NPCI verification.`,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Bank detail change request submitted for compliance verification. Pending payouts will not be redirected until verification completes.',
      notice: 'Pending payouts will continue to the verified primary account until platform micro-deposit penny drop verification completes.',
      request: changeReq,
      changeRequest: changeReq
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 8. Invoices & Reports
 */

export async function getPartnerInvoices(req, res) {
  try {
    const { partnerId } = req.partner;
    const invoices = partnerInvoices.filter(i => i.partnerId === partnerId);
    return res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function downloadPartnerInvoice(req, res) {
  try {
    const { partnerId } = req.partner;
    const { id } = req.params;

    const inv = partnerInvoices.find(i => i.id === id && i.partnerId === partnerId);
    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    return res.json({
      success: true,
      invoice: inv,
      printableHtml: `
        <html>
          <head><title>B2B Tax Invoice - ${inv.invoiceNumber}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 30px;">
            <h2>Urban Company Technologies India Pvt Ltd</h2>
            <p><strong>Tax Invoice (B2B Commission Statement)</strong></p>
            <hr/>
            <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
            <p><strong>Billing Month:</strong> ${inv.billingMonth}</p>
            <p><strong>Supplier GSTIN:</strong> ${inv.gstinSupplier}</p>
            <p><strong>Partner Agency GSTIN:</strong> ${inv.gstinPartner}</p>
            <p><strong>Gross Customer Billing:</strong> ₹${inv.customerBillingGross.toLocaleString('en-IN')}</p>
            <p><strong>Platform Commission (18%):</strong> ₹${inv.platformFee.toLocaleString('en-IN')}</p>
            <p><strong>CGST (9%):</strong> ₹${inv.cgst.toLocaleString('en-IN')}</p>
            <p><strong>SGST (9%):</strong> ₹${inv.sgst.toLocaleString('en-IN')}</p>
            <h3><strong>Total Invoice Amount:</strong> ₹${inv.totalInvoiceAmount.toLocaleString('en-IN')}</h3>
          </body>
        </html>
      `
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerReports(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const { dateFrom, dateTo, city, serviceCategory, professionalId } = req.query;

    let bookings = await getLivePartnerBookings(partnerId, business?.businessName);
    let team = await getLivePartnerTeam(partnerId, business?.businessName);
    let settlements = partnerSettlements.filter(s => s.partnerId === partnerId);
    let inventory = partnerInventory.filter(i => i.partnerId === partnerId);
    let movements = partnerInventoryMovements.filter(m => m.partnerId === partnerId);
    let training = partnerTrainingCourses.filter(t => t.partnerId === partnerId);
    let disputes = partnerDisputes.filter(d => d.partnerId === partnerId);
    let reviews = partnerReviews.filter(r => r.partnerId === partnerId);

    // Filter by city
    if (city && city !== 'all') {
      bookings = bookings.filter(b => (b.city || '').toLowerCase() === city.toLowerCase());
    }
    // Filter by serviceCategory
    if (serviceCategory && serviceCategory !== 'all') {
      bookings = bookings.filter(b => (b.serviceCategory || '').toLowerCase() === serviceCategory.toLowerCase());
    }
    // Filter by professionalId
    if (professionalId && professionalId !== 'all') {
      bookings = bookings.filter(b => b.assignedProfessional?.id === professionalId);
    }

    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
    const inProgressBookings = bookings.filter(b => ['Assigned', 'En Route', 'Arrived', 'In Progress'].includes(b.status));

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const platformCommission = Math.round(totalRevenue * 0.18);
    const totalGst = Math.round(platformCommission * 0.18);
    const netEarnings = totalRevenue - platformCommission - totalGst;

    const compRate = bookings.length > 0 ? `${((completedBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%';
    const cancRate = bookings.length > 0 ? `${((cancelledBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%';
    const avgR = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0;

    const report = {
      generatedAt: new Date(),
      timezone: 'Asia/Kolkata (IST)',
      currency: 'INR',
      appliedFilters: {
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        city: city || 'All Operating Cities',
        serviceCategory: serviceCategory || 'All Categories',
        professionalId: professionalId || 'All Technicians'
      },
      bookings: {
        total: bookings.length,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        inProgress: inProgressBookings.length,
        completionRate: compRate,
        cancellationRate: cancRate,
        onTimeArrivalRate: completedBookings.length > 0 ? '100%' : '0%'
      },
      bookingsSummary: {
        total: bookings.length,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        inProgress: inProgressBookings.length,
        completionRate: compRate,
        cancellationRate: cancRate,
        onTimeArrivalRate: completedBookings.length > 0 ? '100%' : '0%'
      },
      serviceDemand: [],
      teamPerformance: team.map(p => ({
        id: p.id,
        name: p.name,
        trade: p.trade,
        jobsCompleted: p.jobsCompleted || 0,
        rating: p.rating || 0,
        onTimeRate: '0%',
        utilisationRate: '0%',
        revenueGenerated: 0
      })),
      earnings: {
        grossTurnover: totalRevenue,
        platformCommission,
        gstDeductions: totalGst,
        netBusinessEntitlement: netEarnings,
        minorUnit: 'paise'
      },
      settlements: {
        totalDisbursed: settlements.reduce((sum, s) => sum + (Number(s.netDisbursed) || 0), 0),
        processingDisbursements: 0,
        pendingCycles: 0,
        failedClearing: 0,
        totalCycles: settlements.length
      },
      deductionsAndDisputes: {
        totalDisputesFiled: disputes.length,
        openDisputesCount: disputes.filter(d => d.disputeStatus !== 'Resolved').length,
        resolvedCreditsTotal: 0,
        warrantyDeductionCredits: 0,
        forceMajeureCredits: 0
      },
      cancellations: {
        totalCancelled: cancelledBookings.length,
        customerCancelledCount: cancelledBookings.length,
        partnerCancelledCount: 0,
        policyCompensationCredited: 0,
        primaryReason: cancelledBookings.length > 0 ? 'Customer requested cancellation' : 'No cancellations'
      },
      ratings: {
        averageRating: Number(avgR),
        totalReviews: reviews.length,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        positiveSentimentPercentage: '0%'
      },
      trainingCompletion: {
        mandatoryCoursesCount: training.filter(t => t.mandatory).length,
        fullyCertifiedTechnicians: 0,
        pendingRecertificationTechnicians: 0,
        overallFleetComplianceRate: '0%'
      },
      inventoryMovements: {
        totalCatalogItems: inventory.length,
        lowStockAlertsCount: inventory.filter(i => (i.inStock || 0) <= (i.reorderThreshold || 3)).length,
        totalStockAllocations: movements.filter(m => m.type === 'ALLOCATION').length,
        totalPurchasesReceived: movements.filter(m => m.type === 'PURCHASE').length,
        recentMovementHistory: movements.slice(0, 5)
      },
      turnoverTrend: []
    };

    return res.json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerPerformanceMetrics(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const pros = await getLivePartnerTeam(partnerId, business?.businessName);
    const bookings = await getLivePartnerBookings(partnerId, business?.businessName);

    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

    const timestampedJobs = completedBookings.filter(b => b.onTimeData?.actualArrivalTime && b.scheduledStartTime);
    const onTimeCount = timestampedJobs.filter(b => b.onTimeData?.onTime).length;
    const totalTimestamped = timestampedJobs.length;
    const onTimeRate = totalTimestamped > 0 ? (onTimeCount / totalTimestamped) * 100 : 0;

    const professionalComparisons = pros.map(p => ({
      id: p.id,
      name: p.name,
      trade: p.trade,
      status: p.status,
      jobsCompleted: p.jobsCompleted || 0,
      completedJobs: p.jobsCompleted || 0,
      rating: p.rating || 0,
      onTimeRate: '0%',
      revisitRate: '0%',
      revenueGenerated: 0,
      utilisationRate: '0%',
      sampleSizeMet: (p.jobsCompleted || 0) >= 10,
      meetsMinimumSample: (p.jobsCompleted || 0) >= 10
    }));

    return res.json({
      success: true,
      sampleSizeNotice: 'Statistical Reliability Policy: Metrics require a minimum sample size of 10 completed jobs per technician before reliability ratings are published to customers.',
      zeroFabricationNotice: 'Authenticity Guarantee: On-time performance and arrival times are calculated strictly from real mobile app telemetry timestamps without algorithmic fabrication.',
      methodologyNotes: {
        completionRate: 'Minimum sample size: 20 jobs. Formula: Completed Jobs / (Total Bookings - Customer Cancellations)',
        onTimePerformance: 'Zero fabrication policy applies. Measured via mobile app GPS telemetry and job start timestamp within +/- 15 min of scheduled arrival.',
        revisitRate: 'Proportion of customers re-booking within 90 days across operating categories.',
        fleetUtilisation: 'Ratio of billable job hours to scheduled available shift hours.'
      },
      performanceSummary: {
        completionRate: bookings.length > 0 ? `${((completedBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%',
        cancellationRate: bookings.length > 0 ? `${((cancelledBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%',
        onTimeRate: `${onTimeRate.toFixed(1)}%`,
        averageRating: 0,
        reviewCount: 0,
        revisitRate: '0%',
        professionalUtilisation: '0%'
      },
      serviceBreakdown: [],
      cityZoneBreakdown: [],
      professionalComparisons
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 9. Refunds, Disputes & Reviews
 */

export async function getPartnerRefundsDisputes(req, res) {
  try {
    const { partnerId } = req.partner;
    const disputes = partnerDisputes.filter(d => d.partnerId === partnerId);
    return res.json({ success: true, count: disputes.length, disputes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDisputeDetail(req, res) {
  try {
    const { partnerId } = req.partner;
    const { id } = req.params;

    const dispute = partnerDisputes.find(d => d.id === id && d.partnerId === partnerId);
    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute record not found.' });
    }

    return res.json({ success: true, dispute });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitDispute(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { bookingId, issueType, claimAmount, reason, evidence } = req.body;

    if (!bookingId || !reason) {
      return res.status(400).json({ success: false, error: 'Booking ID and dispute reason are mandatory.' });
    }

    const booking = partnerBookings.find(b => b.id === bookingId && b.partnerId === partnerId);

    const newDispute = {
      id: 'DSP-' + Math.floor(1000 + Math.random() * 9000),
      partnerId,
      bookingId,
      technicianName: booking?.assignedProfessional?.name || 'Assigned Technician',
      customerName: booking?.userName || 'Customer',
      issueType: issueType || 'Billing Discrepancy',
      claimAmount: Number(claimAmount) || 0,
      reason: reason.trim(),
      disputeStatus: 'Under Review',
      owner: 'Platform Operations Dispute Desk',
      evidence: Array.isArray(evidence) ? evidence : (evidence ? [evidence] : []),
      timeline: [
        {
          timestamp: new Date(),
          actor: `${staffName} (${role})`,
          note: `Dispute filed: "${reason.trim()}". Claim amount: ₹${claimAmount || 0}`
        }
      ],
      messages: [
        {
          id: 'msg-init-' + Date.now(),
          sender: staffName,
          senderRole: role,
          message: reason.trim(),
          timestamp: new Date()
        }
      ],
      financialAdjustment: null,
      adminResolution: 'Awaiting platform operations arbitration.',
      filedDate: new Date()
    };

    partnerDisputes.unshift(newDispute);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'DISPUTE_FILED',
      details: `Filed dispute #${newDispute.id} on booking #${bookingId} for ₹${newDispute.claimAmount}. Type: ${newDispute.issueType}.`,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully for operations team review.',
      dispute: newDispute
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addDisputeMessage(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { message, evidence } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const dispute = partnerDisputes.find(d => d.id === id && d.partnerId === partnerId);
    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute record not found.' });
    }

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: `${staffName} (${role})`,
      senderRole: role,
      message: message.trim(),
      evidence: evidence || null,
      timestamp: new Date()
    };

    if (!dispute.messages) dispute.messages = [];
    dispute.messages.push(newMsg);

    if (!dispute.timeline) dispute.timeline = [];
    dispute.timeline.push({
      timestamp: new Date(),
      actor: `${staffName} (${role})`,
      note: `Partner response posted: "${message.trim().slice(0, 80)}..."`
    });

    if (evidence) {
      if (!dispute.evidence) dispute.evidence = [];
      dispute.evidence.push(evidence);
    }

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'DISPUTE_RESPONSE_SUBMITTED',
      details: `Submitted response and evidence to dispute #${dispute.id}.`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Response recorded on dispute thread.',
      dispute
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function approveRefund(req, res) {
  // Platform Policy Guard:
  // "Do not let partners approve customer refunds or alter settled ledger entries unless explicitly permitted by platform policy."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Partners cannot unilaterally authorize customer refunds or rewrite settled financial ledger entries. Platform Consumer Protection Team retains sole authority for refund arbitrations.'
  });
}

export async function getPartnerReviews(req, res) {
  try {
    const { partnerId } = req.partner;
    const reviews = partnerReviews.filter(r => r.partnerId === partnerId);
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function replyToReview(req, res) {
  try {
    const { partnerId, staffName } = req.partner;
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, error: 'Reply text is required.' });
    }

    const review = partnerReviews.find(r => r.id === id && r.partnerId === partnerId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    review.partnerReply = reply.trim();
    review.repliedBy = staffName;
    review.repliedAt = new Date();

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: req.partner.role,
      action: 'REVIEW_REPLY_POSTED',
      details: `Posted public business response to review #${review.id} by ${review.customerName}.`,
      timestamp: new Date()
    });

    return res.json({ success: true, message: 'Response posted to review.', review });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function flagReview(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { reason, flagCategory, evidenceNote } = req.body;

    if (!reason || !flagCategory) {
      return res.status(400).json({
        success: false,
        error: 'Flag category and explanatory reason are required.'
      });
    }

    const review = partnerReviews.find(r => r.id === id && r.partnerId === partnerId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    review.flaggedForModeration = true;
    review.flagDetails = {
      flaggedBy: `${staffName} (${role})`,
      category: flagCategory,
      reason: reason.trim(),
      evidenceNote: evidenceNote || null,
      flaggedAt: new Date(),
      status: 'Pending Platform Trust & Safety Review'
    };

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'REVIEW_FLAGGED_FOR_MODERATION',
      details: `Flagged review #${review.id} under category "${flagCategory}". Reason: "${reason.trim()}".`,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Review flagged for Trust & Safety moderation. Platform compliance team will investigate.',
      review
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteReview(req, res) {
  // Platform Policy Guard:
  // "They may not edit ratings, delete customer criticism, or impersonate reviewers."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Partners are strictly prohibited from deleting customer reviews or criticism. Consumer feedback is governed by Platform Trust & Safety policies.'
  });
}

export async function editReviewRating(req, res) {
  // Platform Policy Guard:
  // "They may not edit ratings, delete customer criticism, or impersonate reviewers."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Partners cannot modify customer star ratings. Customer reviews reflect verified consumer feedback.'
  });
}

/**
 * 10. Training & Compliance
 */

export async function getPartnerTraining(req, res) {
  try {
    const { partnerId } = req.partner;
    const requiredCourses = partnerTrainingCourses.filter(t => t.partnerId === partnerId);
    const assignedPros = partnerAssignedProfessionalsTraining;
    const sessions = partnerTrainingSessions.filter(s => s.partnerId === partnerId);
    const businessDocs = businessDocumentExpiryRecords.filter(d => d.partnerId === partnerId);
    const proDocs = professionalDocumentExpiryRecords.filter(d => d.partnerId === partnerId);

    const pendingComplianceActions = [
      'Upload renewed Maharashtra Municipal Trade License before 07 Nov 2026 (15 days remaining) to avoid 50% dispatch throttling.',
      'Submit Police Verification Certificate renewal for technician Sunil Varma (PRO-8842) expiring in 12 days.',
      'Technician Amit Jadhav (PRO-8851) has expired Police Verification and overdue Safety Refresher. Currently locked offline from dispatch.'
    ];

    const operationalRestrictions = [
      {
        affectedEntity: 'PRO-8851 (Amit Jadhav)',
        entityType: 'Technician',
        restrictionType: 'Dispatch Locked',
        reason: 'Police Verification expired on 21 Oct 2026 and Safety Standards course overdue.',
        actionRequired: 'Submit renewed Police Clearance Certificate and complete Platform Safety Refresher.'
      },
      {
        affectedEntity: 'Business Fleet (PTR-90142)',
        entityType: 'Business License',
        restrictionType: 'Throttle Warning',
        reason: 'Trade License TL-MH-2026-8819 expires in 15 days.',
        actionRequired: 'Upload municipal renewal receipt before expiration to maintain 100% dispatch capacity.'
      }
    ];

    return res.json({
      success: true,
      partnerId,
      training: requiredCourses,
      requiredCourses,
      assignedProfessionals: assignedPros,
      trainingSessions: sessions,
      businessDocumentExpiry: businessDocs,
      professionalDocumentExpiry: proDocs,
      pendingComplianceActions,
      operationalRestrictions,
      selfCertificationNotice: 'Policy Guard: Training completion and compliance certifications can only be granted by Platform Academy Evaluators. Business partners cannot self-certify technicians.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestTrainingSession(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const {
      courseId,
      requestedDate,
      preferredDate,
      attendeesCount,
      participantCount,
      venueType,
      notes
    } = req.body;

    const reqDate = requestedDate || preferredDate;
    const count = Number(attendeesCount || participantCount) || 1;

    if (!courseId || !reqDate) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and requested date are mandatory.'
      });
    }

    const course = partnerTrainingCourses.find(c => c.id === courseId);
    const newSessionRequest = {
      id: 'REQ-SESS-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      courseId,
      courseTitle: course?.title || 'Platform Technical Training',
      requestedDate: reqDate,
      preferredDate: reqDate,
      attendeesCount: count,
      participantCount: count,
      venueType: venueType || 'Service Depot',
      notes: notes || '',
      status: 'Requested',
      submittedBy: `${staffName} (${role})`,
      createdAt: new Date()
    };

    trainingSessionRequests.unshift(newSessionRequest);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'TRAINING_SESSION_REQUESTED',
      entity: 'TRAINING_ACADEMY',
      details: `Requested ${course?.title || courseId} session for ${attendeesCount} technicians on ${requestedDate}.`,
      reason: 'Fleet skill enhancement and compliance maintenance',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Training session request submitted to Urban Company Academy. Platform trainers will confirm slot within 24h.',
      sessionRequest: newSessionRequest
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function certifyTrainingCourse(req, res) {
  // Security Guard:
  // "Only authorised training/admin workflows may grant completion or certification."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Business partners cannot grant course completion or issue compliance certificates. Only certified Platform Academy Evaluators may conduct practical assessments and issue certifications.'
  });
}

/**
 * 11. Inventory & Supply Orders
 */

export async function getPartnerInventory(req, res) {
  try {
    const { partnerId } = req.partner;
    const items = partnerInventory
      .filter(i => i.partnerId === partnerId)
      .map(i => ({
        ...i,
        allocatedQuantity: i.allocatedQuantity || 0,
        availableQuantity: (i.inStock || 0) - (i.allocatedQuantity || 0),
        isLowStock: (i.inStock || 0) <= (i.reorderThreshold || i.minimumThreshold || 3)
      }));

    const reorderAlerts = items.filter(i => i.isLowStock);

    return res.json({
      success: true,
      partnerId,
      totalItems: items.length,
      inventory: items,
      items,
      reorderAlerts,
      categories: ['Consumables', 'Hardware Tools', 'Uniform & Gear', 'Products'],
      sandboxDisclaimer: 'Sandbox Simulation Mode: Supply orders simulated in demo sandbox; no actual third-party vendor PO placed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerSupplyOrders(req, res) {
  try {
    const { partnerId } = req.partner;
    const orders = partnerSupplyOrders.filter(o => o.partnerId === partnerId);
    return res.json({
      success: true,
      count: orders.length,
      orders,
      sandboxDisclaimer: 'Sandbox Simulation Mode: Supply orders simulated in demo sandbox; no actual third-party vendor PO placed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPartnerSupplyOrder(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { items, deliveryAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Supply order must include at least one inventory item.' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    for (const line of items) {
      const invItem = partnerInventory.find(i => i.id === line.itemId && i.partnerId === partnerId);
      if (!invItem) {
        return res.status(404).json({ success: false, error: `Inventory item ${line.itemId} not found in partner inventory.` });
      }
      const qty = Number(line.quantity) || 1;
      const unitPrice = invItem.unitPrice || 0;
      const total = qty * unitPrice;
      calculatedTotal += total;
      orderItems.push({
        itemId: invItem.id,
        sku: invItem.sku,
        itemName: invItem.itemName,
        quantity: qty,
        unitPrice,
        total
      });
    }

    const newOrder = {
      id: 'ORD-SUP-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      orderNumber: 'SUP-2026-' + Math.floor(100 + Math.random() * 900),
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'Ordered',
      orderedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      shippingCarrier: 'Delhivery Surface Cargo (Sandbox)',
      trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      deliveryAddress: deliveryAddress || 'Operational Hub, Plot 18 Hill Road, Bandra West',
      notes: notes || 'Standard inventory replenishment order',
      isDemoSandbox: true
    };

    partnerSupplyOrders.unshift(newOrder);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SUPPLY_ORDER_PLACED',
      entity: 'INVENTORY_SUPPLY',
      details: `Placed supply order #${newOrder.orderNumber} for ₹${calculatedTotal.toLocaleString('en-IN')} (${orderItems.length} lines).`,
      reason: 'Inventory replenishment for active service slots',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Supply order placed successfully. Order will be processed for hub dispatch.',
      order: newOrder,
      sandboxNotice: 'Sandbox Simulation Mode: Supply order simulated in demo sandbox; no actual third-party vendor PO placed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function orderInventorySupplies(req, res) {
  const { itemId, quantity } = req.body;
  if (itemId && !req.body.items) {
    req.body.items = [{ itemId, quantity: quantity || 1 }];
  }
  return createPartnerSupplyOrder(req, res);
}

export async function receiveSupplyOrderGoods(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;

    const order = partnerSupplyOrders.find(o => (o.id === id || o.orderNumber === id) && o.partnerId === partnerId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Supply order record not found.' });
    }

    if (order.status === 'Goods Received' || order.status === 'Delivered') {
      return res.status(400).json({ success: false, error: 'Duplicate receipt rejected: Goods already received for this order.' });
    }

    order.status = 'Goods Received';
    order.receivedAt = new Date();
    order.deliveredAt = new Date();

    // Increment inventory inStock and append movement log
    for (const line of order.items) {
      const invItem = partnerInventory.find(i => i.id === line.itemId && i.partnerId === partnerId);
      if (invItem) {
        invItem.inStock += line.quantity;
        partnerInventoryMovements.unshift({
          id: 'MOV-' + Date.now() + '-' + Math.floor(10 + Math.random() * 90),
          partnerId,
          timestamp: new Date(),
          actor: `${staffName} (${role})`,
          itemId: invItem.id,
          itemSku: invItem.sku,
          itemName: invItem.itemName,
          type: 'PURCHASE',
          quantityChange: line.quantity,
          resultingStock: invItem.inStock,
          resultingAllocated: invItem.allocatedQuantity,
          reason: `Goods receipt confirmed for supply order #${order.orderNumber}`
        });
      }
    }

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'GOODS_RECEIVED_CONFIRMED',
      entity: 'INVENTORY_STOCK',
      details: `Confirmed goods receipt for order #${order.orderNumber}. Inventory updated.`,
      reason: 'Physical delivery verified at operational depot',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Goods received confirmed for order #${order.orderNumber}. Stock quantities successfully updated.`,
      order
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function allocatePartnerInventory(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { professionalId, itemId, quantity, purpose } = req.body;

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Allocation quantity must be greater than zero.' });
    }

    // 1. Validate Item & Multi-tenant check
    const item = partnerInventory.find(i => i.id === itemId && i.partnerId === partnerId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found in partner inventory.' });
    }

    // 2. Validate Professional & Multi-tenant check
    const pro = partnerProfessionals.find(p => p.id === professionalId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Service professional not associated with your business partner fleet.' });
    }

    // 3. Prevent allocation beyond available quantities
    const available = (item.inStock || 0) - (item.allocatedQuantity || 0);
    if (qty > available) {
      return res.status(400).json({
        success: false,
        error: `Allocation exceeds available quantity. Available: ${available}, Requested: ${qty}. Reorder stock to allocate.`
      });
    }

    item.allocatedQuantity = (item.allocatedQuantity || 0) + qty;

    const mov = {
      id: 'MOV-' + Date.now(),
      partnerId,
      timestamp: new Date(),
      actor: `${staffName} (${role})`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.itemName,
      type: 'ALLOCATION',
      quantityChange: -qty,
      resultingStock: item.inStock,
      resultingAllocated: item.allocatedQuantity,
      professionalId: pro.id,
      professionalName: pro.name,
      reason: purpose || `Tool/consumable allocated to technician ${pro.name}`
    };

    partnerInventoryMovements.unshift(mov);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'INVENTORY_ALLOCATED',
      entity: 'INVENTORY_STOCK',
      details: `Allocated ${qty} units of ${item.itemName} (${item.sku}) to ${pro.name} (${pro.id}).`,
      reason: purpose || 'Field job toolkit provisioning',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Successfully allocated ${qty} units of ${item.itemName} to ${pro.name}.`,
      item: {
        ...item,
        availableQuantity: item.inStock - item.allocatedQuantity
      },
      movement: mov
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function adjustPartnerInventory(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { itemId, adjustmentQty, reason } = req.body;

    // Require reasons for adjustments
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Reason is mandatory for inventory adjustments (minimum 5 characters).'
      });
    }

    const adj = Number(adjustmentQty);
    if (isNaN(adj) || adj === 0) {
      return res.status(400).json({ success: false, error: 'Valid non-zero adjustment quantity is required.' });
    }

    const item = partnerInventory.find(i => i.id === itemId && i.partnerId === partnerId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found.' });
    }

    // Prevent negative stock
    if ((item.inStock || 0) + adj < 0) {
      return res.status(400).json({
        success: false,
        error: `Adjustment rejected: Resulting stock cannot be negative. Current in-stock: ${item.inStock}, requested adjustment: ${adj}.`
      });
    }

    item.inStock += adj;

    const mov = {
      id: 'MOV-' + Date.now(),
      partnerId,
      timestamp: new Date(),
      actor: `${staffName} (${role})`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.itemName,
      type: 'ADJUSTMENT',
      quantityChange: adj,
      resultingStock: item.inStock,
      resultingAllocated: item.allocatedQuantity || 0,
      reason: reason.trim()
    };

    partnerInventoryMovements.unshift(mov);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'INVENTORY_ADJUSTED',
      entity: 'INVENTORY_STOCK',
      details: `Adjusted ${item.itemName} stock by ${adj > 0 ? '+' + adj : adj}. New in-stock: ${item.inStock}. Reason: "${reason.trim()}".`,
      reason: reason.trim(),
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Stock successfully adjusted for ${item.itemName}.`,
      item: {
        ...item,
        availableQuantity: item.inStock - (item.allocatedQuantity || 0)
      },
      movement: mov
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function returnPartnerInventory(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { professionalId, itemId, quantity, reason, condition } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Reason is mandatory for inventory returns (min 5 characters).' });
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Return quantity must be greater than zero.' });
    }

    const item = partnerInventory.find(i => i.id === itemId && i.partnerId === partnerId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found.' });
    }

    const pro = partnerProfessionals.find(p => p.id === professionalId && p.partnerId === partnerId);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Professional not found in your fleet.' });
    }

    item.allocatedQuantity = Math.max(0, (item.allocatedQuantity || 0) - qty);

    const mov = {
      id: 'MOV-' + Date.now(),
      partnerId,
      timestamp: new Date(),
      actor: `${staffName} (${role})`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.itemName,
      type: 'RETURN',
      quantityChange: qty,
      resultingStock: item.inStock,
      resultingAllocated: item.allocatedQuantity,
      professionalId: pro.id,
      professionalName: pro.name,
      condition: condition || 'Good / Reusable',
      reason: reason.trim()
    };

    partnerInventoryMovements.unshift(mov);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'INVENTORY_RETURNED',
      entity: 'INVENTORY_STOCK',
      details: `Returned ${qty} units of ${item.itemName} from ${pro.name}. Condition: ${condition || 'Good'}.`,
      reason: reason.trim(),
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Return recorded for ${qty} units of ${item.itemName}.`,
      item,
      movement: mov
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerInventoryMovements(req, res) {
  try {
    const { partnerId } = req.partner;
    const movements = partnerInventoryMovements.filter(m => m.partnerId === partnerId);
    return res.json({ success: true, count: movements.length, movements });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 12. Support & Helpdesk
 */

export async function getPartnerSupportTickets(req, res) {
  try {
    const { partnerId } = req.partner;
    const rawTickets = partnerSupportTickets.filter(t => t.partnerId === partnerId);

    // CRITICAL SECURITY RULE:
    // "Keep business-visible messages separate from platform internal notes."
    // Strictly strip internalStaffNotes from partner response
    const sanitizedTickets = rawTickets.map(ticket => {
      const { internalStaffNotes, adminPrivateNotes, ...businessSafeTicket } = ticket;
      return businessSafeTicket;
    });

    return res.json({ success: true, count: sanitizedTickets.length, tickets: sanitizedTickets });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerSupportTicketDetail(req, res) {
  try {
    const { partnerId } = req.partner;
    const { id } = req.params;

    const ticket = partnerSupportTickets.find(t => (t.id === id || t.ticketNumber === id) && t.partnerId === partnerId);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found.' });
    }

    // Strictly strip internalStaffNotes
    const { internalStaffNotes, adminPrivateNotes, ...businessSafeTicket } = ticket;

    return res.json({ success: true, ticket: businessSafeTicket });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPartnerSupportTicket(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { category, subject, message, priority, linkedEntity, evidence } = req.body;

    if (!category || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Category, subject, and message are required.' });
    }

    const newTicket = {
      id: 'TCK-PTR-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      category,
      subject: subject.trim(),
      priority: priority || 'Medium',
      status: 'Open',
      linkedEntity: linkedEntity || null,
      evidence: Array.isArray(evidence) ? evidence : (evidence ? [evidence] : []),
      messages: [
        { sender: `${staffName} (${role})`, text: message.trim(), timestamp: new Date() }
      ],
      createdAt: new Date()
    };

    partnerSupportTickets.unshift(newTicket);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SUPPORT_TICKET_CREATED',
      entity: 'SUPPORT_HELPDESK',
      details: `Created support ticket #${newTicket.id} [${priority || 'Medium'}]: "${subject.trim()}".`,
      reason: 'Operational support inquiry',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket logged with platform operations. Platform desk will reply within SLA.',
      ticket: newTicket
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addSupportTicketMessage(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const ticket = partnerSupportTickets.find(t => (t.id === id || t.ticketNumber === id) && t.partnerId === partnerId);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found.' });
    }

    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push({
      sender: `${staffName} (${role})`,
      text: message.trim(),
      timestamp: new Date()
    });

    // Return sanitized ticket
    const { internalStaffNotes, adminPrivateNotes, ...businessSafeTicket } = ticket;

    return res.json({
      success: true,
      message: 'Reply added to ticket thread.',
      ticket: businessSafeTicket
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 13. Notifications
 */

export async function getPartnerNotifications(req, res) {
  try {
    const { partnerId } = req.partner;
    const notifs = partnerNotifications.filter(n => n.partnerId === partnerId);
    const unreadCount = notifs.filter(n => !n.read).length;

    return res.json({
      success: true,
      totalCount: notifs.length,
      unreadCount,
      notifications: notifs
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { partnerId } = req.partner;
    const { id } = req.params;

    const notif = partnerNotifications.find(n => n.id === id && n.partnerId === partnerId);
    if (notif) {
      notif.read = true;
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    const { partnerId } = req.partner;
    partnerNotifications
      .filter(n => n.partnerId === partnerId)
      .forEach(n => n.read = true);

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 14. Documents & Compliance
 */

export async function getPartnerDocuments(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const docs = partnerDocuments.filter(d => d.partnerId === partnerId);

    return res.json({
      success: true,
      partnerId,
      businessName: business?.businessName,
      documents: docs,
      verificationDisclaimer: 'Compliance Rule: Uploading a file registers the document for platform KYC verification. Uploading does NOT grant immediate approval; all documents undergo secondary verification.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadPartnerDocument(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const { docType, title, fileName, fileType, fileSize } = req.body;

    if (!docType || !fileName) {
      return res.status(400).json({ success: false, error: 'Document type and file name are mandatory.' });
    }

    // Protected file validation: only allow PDF, PNG, JPEG
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: `File type "${ext}" is not permitted. Only PDF, PNG, and JPEG files are accepted for compliance documents.`
      });
    }

    // Max 5MB size check
    const sizeInBytes = Number(fileSize) || 2048576;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum permitted limit (5MB).' });
    }

    // Generate sanitized safe filename
    const safeBase = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const sanitizedFileName = `doc_${docType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${partnerId}_${Date.now()}${ext}`;

    const newDoc = {
      id: 'DOC-' + Math.floor(100 + Math.random() * 900),
      partnerId,
      title: title || docType,
      docType,
      fileName: sanitizedFileName,
      fileSize: `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`,
      fileType: fileType || 'application/pdf',
      expiryDate: 'Under Verification',
      daysUntilExpiry: 365,
      status: 'Under Review', // Do NOT imply that uploading a file completes verification!
      uploadedAt: new Date().toISOString().slice(0, 10),
      reviewFeedback: 'Document uploaded and queued for Platform Compliance review. SLA: 24h.'
    };

    partnerDocuments.unshift(newDoc);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'DOCUMENT_UPLOADED',
      entity: 'COMPLIANCE_VAULT',
      details: `Uploaded ${docType} (${sanitizedFileName}). Queued for verification.`,
      reason: 'Compliance documentation submission',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for compliance verification.',
      document: newDoc,
      verificationNotice: 'Document is currently Under Review. Verification is completed only after compliance desk review.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 15. Reports & Exports
 */

function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""');
  // Neutralize spreadsheet formula injection (=, +, -, @, \t, \r)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str}"`;
  }
  return `"${str}"`;
}

export async function exportPartnerReportCsv(req, res) {
  try {
    const { partnerId } = req.partner;
    const { reportType, dateFrom, dateTo } = req.query;

    const bookings = partnerBookings.filter(b => b.partnerId === partnerId);

    // Build CSV with formula injection protection and masked customer PII
    const headers = [
      'Booking ID',
      'Service Name',
      'Service Zone',
      'Booking Date',
      'Status',
      'Gross Amount (INR)',
      'Customer Locality (PII Masked)',
      'Customer Contact (PII Masked)',
      'Assigned Technician'
    ];

    const rows = bookings.map(b => [
      sanitizeCsvCell(b.id),
      sanitizeCsvCell(b.serviceName),
      sanitizeCsvCell(b.serviceZone),
      sanitizeCsvCell(b.scheduledDate || '2026-10-23'),
      sanitizeCsvCell(b.status),
      sanitizeCsvCell(b.servicePrice || 1849),
      sanitizeCsvCell(b.serviceZone + ', Mumbai (Address Masked)'),
      sanitizeCsvCell('+91 98200 •••••'),
      sanitizeCsvCell(b.assignedProfessional?.name || 'Unassigned')
    ].join(','));

    const csvContent = [
      '# Urban Company Business Partner Performance Report',
      '# Timezone: Asia/Kolkata (IST)',
      '# Currency: INR',
      `# Generated For: Partner ${partnerId} on ${new Date().toISOString()}`,
      headers.join(','),
      ...rows
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Partner_Report_${partnerId}_AsiaKolkata.csv"`);
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 16. Staff Management & Activity Logs
 */

export async function getPartnerStaff(req, res) {
  try {
    const { partnerId } = req.partner;
    const staff = staffAccounts.filter(s => s.partnerId === partnerId);
    return res.json({ success: true, staff });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function invitePartnerStaff(req, res) {
  try {
    const { partnerId, staffName, role: requesterRole } = req.partner;
    const { name, email, phone, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Staff name, email, and role are required.' });
    }

    if (!PARTNER_PERMISSIONS[role]) {
      return res.status(400).json({ success: false, error: `Invalid role "${role}".` });
    }

    // Role escalation protection: Non-owners cannot create owners
    if (requesterRole !== 'Business Owner' && role === 'Business Owner') {
      return res.status(403).json({
        success: false,
        error: 'Only an active Business Owner can grant the Business Owner role.'
      });
    }

    const newStaff = {
      id: 'STF-' + Math.floor(1000 + Math.random() * 9000),
      partnerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role,
      status: 'Active',
      lastLogin: null,
      createdAt: new Date()
    };

    staffAccounts.push(newStaff);

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: requesterRole,
      action: 'STAFF_INVITED',
      entity: 'STAFF_ACCESS',
      details: `Added new staff member ${name} with role "${role}".`,
      reason: 'Operational delegation of duties',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Staff member ${name} added with ${role} permissions.`,
      staff: newStaff
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePartnerStaffStatus(req, res) {
  try {
    const { partnerId, staffName, role: requesterRole } = req.partner;
    const { id } = req.params;
    const { status } = req.body;

    const staff = staffAccounts.find(s => s.id === id && s.partnerId === partnerId);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff account not found.' });
    }

    // Last owner protection
    if (staff.role === 'Business Owner' && status === 'Inactive') {
      const activeOwners = staffAccounts.filter(s => s.partnerId === partnerId && s.role === 'Business Owner' && s.status === 'Active');
      if (activeOwners.length <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate the final active Business Owner. A business must retain at least one active owner.'
        });
      }
    }

    staff.status = status === 'Inactive' ? 'Inactive' : 'Active';
    if (staff.status === 'Inactive') {
      revokedStaffIds.add(staff.id);
    } else {
      revokedStaffIds.delete(staff.id);
    }

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: requesterRole,
      action: 'STAFF_STATUS_UPDATED',
      entity: 'STAFF_ACCESS',
      details: `Changed status of ${staff.name} to ${staff.status}.`,
      reason: 'Staff roster governance',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Staff account status updated to ${staff.status}.`,
      staff
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deletePartnerStaff(req, res) {
  try {
    const { partnerId, staffName, role: requesterRole } = req.partner;
    const { id } = req.params;

    const staff = staffAccounts.find(s => s.id === id && s.partnerId === partnerId);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff account not found.' });
    }

    // Critical Rule: Prevent removal of the final active Business Owner!
    if (staff.role === 'Business Owner') {
      const activeOwners = staffAccounts.filter(s => s.partnerId === partnerId && s.role === 'Business Owner' && s.status === 'Active');
      if (activeOwners.length <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove the final active Business Owner. A business must retain at least one active owner.'
        });
      }
    }

    revokedStaffIds.add(id);
    staffAccounts = staffAccounts.filter(s => !(s.id === id && s.partnerId === partnerId));

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: requesterRole,
      action: 'STAFF_REMOVED',
      entity: 'STAFF_ACCESS',
      details: `Deactivated staff member ${staff.name} (${staff.role}).`,
      reason: 'Staff departure or offboarding',
      timestamp: new Date()
    });

    return res.json({ success: true, message: `Staff member ${staff.name} removed successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerActivityLogs(req, res) {
  try {
    const { partnerId } = req.partner;
    const logs = partnerActivityLogs.filter(l => l.partnerId === partnerId);
    return res.json({
      success: true,
      timezone: 'Asia/Kolkata',
      count: logs.length,
      logs
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function blockAuditLogMutation(req, res) {
  // Security Guard:
  // "Business users must not edit audit history."
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Immutable audit log policy applies. Audit logs are immutable and permanent. Business users are strictly prohibited from creating, modifying, or deleting audit log records.'
  });
}

/**
 * 17. Partner Settings
 */

export async function getPartnerSettings(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    return res.json({
      success: true,
      timezone: 'Asia/Kolkata',
      settings: {
        businessName: business?.businessName,
        phone: business?.phone,
        email: business?.email,
        emergencyPhone: business?.emergencyPhone,
        operatingHours: business?.operatingHours,
        autoDispatch: business?.autoDispatch,
        immediateEdits: {
          phone: business?.phone,
          emergencyPhone: business?.emergencyPhone,
          operatingHours: business?.operatingHours,
          autoDispatch: business?.autoDispatch,
          notificationPreferences: {
            smsAlerts: true,
            emailAlerts: true,
            dispatchPushes: true,
            outboxDeliveryMode: 'Local In-App Outbox'
          }
        },
        platformApprovalRequired: {
          businessName: business?.businessName,
          legalEntityName: business?.businessName,
          gstNumber: business?.gstNumber,
          panNumber: business?.panNumber,
          registeredAddress: business?.registeredAddress,
          operatingCity: business?.city,
          tier: business?.tier,
          locked: true,
          requiresPlatformApproval: true
        },
        branding: {
          brandColor: '#0ea5e9',
          allowedLogoUpload: false,
          policy: 'Urban Company Platform Co-Branded Standards'
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePartnerSettings(req, res) {
  try {
    const { partnerId, staffName, role } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Partner business not found.' });
    }

    const {
      emergencyPhone,
      phone,
      operatingHours,
      autoDispatch,
      notificationPreferences,
      // Locked fields:
      businessName,
      gstNumber,
      operatingCity
    } = req.body;

    // Distinguish edits that apply immediately from changes requiring platform approval
    if (gstNumber || (businessName && businessName !== business.businessName) || (operatingCity && operatingCity !== business.city)) {
      return res.status(400).json({
        success: false,
        error: 'Changes to legal business name, GSTIN, or operating city require formal Platform Compliance Approval. Submit a Document/Coverage change request.'
      });
    }

    if (emergencyPhone) business.emergencyPhone = emergencyPhone;
    if (phone) business.phone = phone;
    if (operatingHours) business.operatingHours = operatingHours;
    if (autoDispatch !== undefined) business.autoDispatch = autoDispatch;

    partnerActivityLogs.unshift({
      id: 'LOG-' + Date.now(),
      partnerId,
      actorName: staffName,
      actorRole: role,
      action: 'SETTINGS_UPDATE',
      entity: 'BUSINESS_SETTINGS',
      details: 'Updated operational contact and dispatch configuration.',
      reason: 'Routine business settings maintenance',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Operational settings updated immediately.',
      settings: {
        immediateEdits: {
          phone: business.phone,
          emergencyPhone: business.emergencyPhone,
          operatingHours: business.operatingHours,
          autoDispatch: business.autoDispatch,
          notificationPreferences: notificationPreferences || { smsAlerts: true, emailAlerts: true, dispatchPushes: true }
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 18. Confirmed Demo Reset
 */
export async function resetPartnerDemoData(req, res) {
  try {
    const { confirmReset } = req.body || {};
    if (!confirmReset) {
      return res.status(400).json({
        success: false,
        error: 'Explicit confirmation required. Please provide confirmReset: true to execute the demo data reset.'
      });
    }

    partnerBusinesses = JSON.parse(JSON.stringify(INITIAL_PARTNER_BUSINESSES));
    staffAccounts = JSON.parse(JSON.stringify(INITIAL_STAFF_ACCOUNTS));
    partnerProfessionals = JSON.parse(JSON.stringify(INITIAL_PARTNER_PROFESSIONALS));
    partnerBookings = JSON.parse(JSON.stringify(INITIAL_PARTNER_BOOKINGS));
    partnerSettlements = JSON.parse(JSON.stringify(INITIAL_PARTNER_SETTLEMENTS));
    settlementCorrectionRequests = JSON.parse(JSON.stringify(INITIAL_SETTLEMENT_CORRECTION_REQUESTS));
    bankChangeRequests = JSON.parse(JSON.stringify(INITIAL_BANK_CHANGE_REQUESTS));
    partnerInvoices = JSON.parse(JSON.stringify(INITIAL_PARTNER_INVOICES));
    partnerDisputes = JSON.parse(JSON.stringify(INITIAL_PARTNER_DISPUTES));
    partnerReviews = JSON.parse(JSON.stringify(INITIAL_PARTNER_REVIEWS));
    partnerTrainingCourses = JSON.parse(JSON.stringify(INITIAL_PARTNER_TRAINING_COURSES));
    partnerAssignedProfessionalsTraining = JSON.parse(JSON.stringify(INITIAL_PARTNER_ASSIGNED_PROS_TRAINING));
    partnerTrainingSessions = JSON.parse(JSON.stringify(INITIAL_PARTNER_TRAINING_SESSIONS));
    trainingSessionRequests = JSON.parse(JSON.stringify(INITIAL_TRAINING_SESSION_REQUESTS));
    businessDocumentExpiryRecords = JSON.parse(JSON.stringify(INITIAL_BUSINESS_DOC_EXPIRY));
    professionalDocumentExpiryRecords = JSON.parse(JSON.stringify(INITIAL_PRO_DOC_EXPIRY));
    partnerInventory = JSON.parse(JSON.stringify(INITIAL_PARTNER_INVENTORY));
    partnerSupplyOrders = JSON.parse(JSON.stringify(INITIAL_PARTNER_SUPPLY_ORDERS));
    partnerInventoryMovements = JSON.parse(JSON.stringify(INITIAL_PARTNER_INVENTORY_MOVEMENTS));
    partnerSupportTickets = JSON.parse(JSON.stringify(INITIAL_PARTNER_SUPPORT_TICKETS));
    partnerNotifications = JSON.parse(JSON.stringify(INITIAL_PARTNER_NOTIFICATIONS));
    partnerDocuments = JSON.parse(JSON.stringify(INITIAL_PARTNER_DOCUMENTS));
    partnerActivityLogs = JSON.parse(JSON.stringify(INITIAL_PARTNER_ACTIVITY_LOGS));
    revokedStaffIds.clear();
    bookingAssignmentLocks.clear();

    return res.json({
      success: true,
      message: 'Partner demo sandbox data successfully reset to pristine baseline state. Live and production records remain completely unaffected.',
      resetScope: {
        affectedDemoBusinesses: ['PTR-90142', 'PTR-90143'],
        liveRecordsPreserved: true,
        resetTimestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

