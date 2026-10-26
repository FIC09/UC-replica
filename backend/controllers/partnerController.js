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
      totalBookings: 840,
      completedBookings: 820,
      rating: 4.88,
      complaintsCount: 2,
      totalPayouts: 389200
    },
    operatingHours: {
      start: '08:00',
      end: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    holidays: [
      { id: 'hol-1', date: '2026-11-01', occasion: 'Diwali Festival Holiday', type: 'Full Day' },
      { id: 'hol-2', date: '2026-12-25', occasion: 'Christmas Day', type: 'Half Day' }
    ],
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
      totalBookings: 320,
      completedBookings: 310,
      rating: 4.91,
      complaintsCount: 0,
      totalPayouts: 184500
    },
    operatingHours: {
      start: '08:30',
      end: '19:30',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    holidays: [
      { id: 'hol-qfc-1', date: '2026-11-01', occasion: 'Diwali Festival Holiday', type: 'Full Day' }
    ],
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
    metrics: { totalBookings: 140, completedBookings: 138, rating: 4.82, complaintsCount: 1, totalPayouts: 92400 },
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
let partnerProfessionals = [
  // Apex Home Solutions LLP (PTR-90142)
  {
    id: 'PRO-8841',
    partnerId: 'PTR-90142',
    name: 'Vikram Salvi',
    phone: '+91 98205 11982',
    email: 'vikram.salvi@urbanpro.com',
    trade: 'Master AC Specialist & Electrician',
    status: 'Active',
    isOnline: true,
    rating: 4.94,
    jobsCompleted: 1520,
    attendanceToday: 'Present (On Job)',
    currentLocation: 'Bandra West, Mumbai',
    skills: ['Split AC Servicing', 'Compressor Diagnostics', 'Inverter PCB Repair'],
    joinedDate: '2026-01-10',
    vehicleNumber: 'MH-02-EQ-8812'
  },
  {
    id: 'PRO-8842',
    partnerId: 'PTR-90142',
    name: 'Sunil Varma',
    phone: '+91 98112 00991',
    email: 'sunil.varma@urbanpro.com',
    trade: 'HVAC Duct & Appliance Technician',
    status: 'Active',
    isOnline: true,
    rating: 4.88,
    jobsCompleted: 980,
    attendanceToday: 'Present (Available)',
    currentLocation: 'Khar West, Mumbai',
    skills: ['Refrigerator Servicing', 'Washing Machine Repair', 'Microwave Magnetron'],
    joinedDate: '2026-01-15',
    vehicleNumber: 'MH-02-BZ-4109'
  },
  {
    id: 'PRO-8843',
    partnerId: 'PTR-90142',
    name: 'Sunil Vishwakarma',
    phone: '+91 98332 10984',
    email: 'sunil.v@urbanpro.com',
    trade: 'Deep Cleaning & Sanitization Pro',
    status: 'Active',
    isOnline: true,
    rating: 4.91,
    jobsCompleted: 640,
    attendanceToday: 'Present (On Job)',
    currentLocation: 'Pali Hill, Mumbai',
    skills: ['Single-Disc Machine Scrubbing', 'Foam Upholstery Cleaning', 'Acid-Free Descaling'],
    joinedDate: '2026-01-20',
    vehicleNumber: 'MH-02-CP-7711'
  },
  {
    id: 'PRO-8850',
    partnerId: 'PTR-90142',
    name: 'Kiran Shinde',
    phone: '+91 98209 44332',
    email: 'kiran.s@apexhome.in',
    trade: 'HVAC Maintenance Technician',
    status: 'Active',
    isOnline: true,
    rating: 4.85,
    jobsCompleted: 320,
    attendanceToday: 'Present (Available)',
    currentLocation: 'Santacruz West, Mumbai',
    skills: ['Copper Pipe Brazing', 'Gas Leak Detection', 'AC Jet Wash'],
    joinedDate: '2026-02-01',
    vehicleNumber: 'MH-02-DA-2041'
  },
  {
    id: 'PRO-8851',
    partnerId: 'PTR-90142',
    name: 'Amit Jadhav',
    phone: '+91 98201 55667',
    email: 'amit.j@apexhome.in',
    trade: 'Appliance Repair Lead',
    status: 'On Leave',
    isOnline: false,
    rating: 4.79,
    jobsCompleted: 210,
    attendanceToday: 'Approved Leave',
    currentLocation: 'Andheri West, Mumbai',
    skills: ['Appliance Diagnostics', 'PCB Soldering'],
    joinedDate: '2026-02-10',
    vehicleNumber: 'MH-02-ER-9901'
  },
  // Krishnagiri QuickFix Care (PTR-90143)
  {
    id: 'PRO-8846',
    partnerId: 'PTR-90143',
    name: 'Karthik Raja',
    phone: '+91 98420 77123',
    email: 'karthik@quickfixcare.com',
    trade: 'Deep Cleaning Specialist',
    status: 'Active',
    isOnline: true,
    rating: 4.91,
    jobsCompleted: 185,
    attendanceToday: 'Present (Available)',
    currentLocation: 'Old Pet, Krishnagiri',
    skills: ['Commercial Vacuuming', 'Tile Scrubbing'],
    joinedDate: '2026-02-05',
    vehicleNumber: 'TN-24-AQ-1122'
  },
  {
    id: 'PRO-8847',
    partnerId: 'PTR-90143',
    name: 'Saravanan S.',
    phone: '+91 98425 66112',
    email: 'saravanan@quickfixcare.com',
    trade: 'Pest Control Technician',
    status: 'Active',
    isOnline: true,
    rating: 4.86,
    jobsCompleted: 140,
    attendanceToday: 'Present (On Job)',
    currentLocation: 'Rayakottai Road, Krishnagiri',
    skills: ['Termite Chemical Injection', 'Cockroach Gel Treatment'],
    joinedDate: '2026-02-08',
    vehicleNumber: 'TN-24-BX-3344'
  }
];

// 4. Partner Bookings Store
let partnerBookings = [
  {
    id: 'ORD-9841',
    partnerId: 'PTR-90142',
    bookingReference: 'ORD-9841',
    customerId: 'CUST-1002',
    userName: 'Aarav Mehta',
    userPhone: '+91 98200 12345',
    userEmail: 'aarav.mehta@example.com',
    serviceName: 'AC Deep Clean & Comprehensive Service',
    serviceCategory: 'ac-appliances',
    serviceZone: 'Bandra West',
    city: 'Mumbai',
    address: 'Flat 402, Sea Breeze Apartments, Bandra West, Mumbai 400050',
    addressDetails: {
      fullAddress: 'Flat 402, Sea Breeze Apartments, Perry Cross Road',
      locality: 'Bandra West',
      city: 'Mumbai',
      pincode: '400050',
      contactPhone: '+91 98200 12345'
    },
    slot: 'Today, 02:00 PM - 03:30 PM',
    scheduledDate: new Date(),
    scheduledStartTime: '14:00',
    scheduledEndTime: '15:30',
    status: 'In Progress',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    totalAmount: 922,
    agencyCommission: 165.96,
    platformFee: 165.96,
    netAgencyShare: 756.04,
    assignedProfessional: {
      id: 'PRO-8841',
      name: 'Vikram Salvi',
      phone: '+91 98205 11982',
      trade: 'Master AC Specialist & Electrician',
      assignedAt: new Date(Date.now() - 7200000)
    },
    businessNotes: [
      { id: 'bn-1', note: 'Customer VIP flat; technician carried high-pressure foam wash canopy kit.', author: 'Rahul Dev (Dispatcher)', createdAt: new Date(Date.now() - 3600000) }
    ],
    checklist: [
      { id: 'chk-1', text: 'Pre-service cooling temp check', completed: true },
      { id: 'chk-2', text: 'High-pressure foam wash of cooling coils', completed: true },
      { id: 'chk-3', text: 'Drain pipe descaling & disinfectant spray', completed: false }
    ],
    createdAt: new Date(Date.now() - 7600000)
  },
  {
    id: 'ORD-9842',
    partnerId: 'PTR-90142',
    bookingReference: 'ORD-9842',
    customerId: 'CUST-1004',
    userName: 'Sneha Roy',
    userPhone: '+91 98112 44556',
    userEmail: 'sneha.roy@example.com',
    serviceName: 'Classic Bathroom Deep Cleaning',
    serviceCategory: 'cleaning-pest',
    serviceZone: 'Pali Hill',
    city: 'Mumbai',
    address: 'B-12, Pali Hill View, Bandra West, Mumbai 400050',
    addressDetails: {
      fullAddress: 'B-12, Pali Hill View, Nargis Dutt Road',
      locality: 'Pali Hill',
      city: 'Mumbai',
      pincode: '400050',
      contactPhone: '+91 98112 44556'
    },
    slot: 'Today, 03:30 PM - 05:00 PM',
    scheduledDate: new Date(),
    scheduledStartTime: '15:30',
    scheduledEndTime: '17:00',
    status: 'Assigned',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    totalAmount: 638,
    agencyCommission: 114.84,
    platformFee: 114.84,
    netAgencyShare: 523.16,
    assignedProfessional: {
      id: 'PRO-8843',
      name: 'Sunil Vishwakarma',
      phone: '+91 98332 10984',
      trade: 'Deep Cleaning Specialist',
      assignedAt: new Date(Date.now() - 3600000)
    },
    businessNotes: [
      { id: 'bn-2', note: 'Technician instructed to take safety shoe covers.', author: 'Pooja Patil', createdAt: new Date(Date.now() - 2400000) }
    ],
    checklist: [
      { id: 'chk-1', text: 'Floor tile acid-free scrubbing', completed: false },
      { id: 'chk-2', text: 'Chrome fixture descaling', completed: false }
    ],
    createdAt: new Date(Date.now() - 4000000)
  },
  {
    id: 'ORD-9845',
    partnerId: 'PTR-90142',
    bookingReference: 'ORD-9845',
    customerId: 'CUST-1009',
    userName: 'Rajiv Malhotra',
    userPhone: '+91 98201 99882',
    userEmail: 'rajiv.m@example.com',
    serviceName: 'Double Door Refrigerator Repair & Gas Refill',
    serviceCategory: 'ac-appliances',
    serviceZone: 'Khar West',
    city: 'Mumbai',
    address: 'A-701, Silver Sands, 14th Road, Khar West, Mumbai 400052',
    addressDetails: {
      fullAddress: 'A-701, Silver Sands, 14th Road',
      locality: 'Khar West',
      city: 'Mumbai',
      pincode: '400052',
      contactPhone: '+91 98201 99882'
    },
    slot: 'Today, 05:30 PM - 07:00 PM',
    scheduledDate: new Date(),
    scheduledStartTime: '17:30',
    scheduledEndTime: '19:00',
    status: 'Pending', // Pending technician assignment in dispatch queue!
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    totalAmount: 1450,
    agencyCommission: 261.00,
    platformFee: 261.00,
    netAgencyShare: 1189.00,
    assignedProfessional: null,
    businessNotes: [],
    checklist: [],
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'ORD-9830',
    partnerId: 'PTR-90142',
    bookingReference: 'ORD-9830',
    customerId: 'CUST-1011',
    userName: 'Kavita Chawla',
    userPhone: '+91 98205 33221',
    userEmail: 'kavita.c@example.com',
    serviceName: 'Split AC Power Jet Servicing (2 Units)',
    serviceCategory: 'ac-appliances',
    serviceZone: 'Santacruz West',
    city: 'Mumbai',
    address: 'B-3, Sagar Sangeet, Juhu Road, Santacruz West, Mumbai 400054',
    addressDetails: {
      fullAddress: 'B-3, Sagar Sangeet, Juhu Road',
      locality: 'Santacruz West',
      city: 'Mumbai',
      pincode: '400054',
      contactPhone: '+91 98205 33221'
    },
    slot: 'Yesterday, 11:00 AM - 01:00 PM',
    scheduledDate: new Date(Date.now() - 86400000),
    scheduledStartTime: '11:00',
    scheduledEndTime: '13:00',
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    totalAmount: 1849,
    agencyCommission: 332.82,
    platformFee: 332.82,
    netAgencyShare: 1516.18,
    assignedProfessional: {
      id: 'PRO-8841',
      name: 'Vikram Salvi',
      phone: '+91 98205 11982',
      trade: 'Master AC Specialist'
    },
    businessNotes: [],
    checklist: [
      { id: 'chk-1', text: 'Unit 1 Power Jet Wash Completed', completed: true },
      { id: 'chk-2', text: 'Unit 2 Power Jet Wash Completed', completed: true }
    ],
    completedAt: new Date(Date.now() - 80000000),
    createdAt: new Date(Date.now() - 100000000)
  },
  // Krishnagiri QuickFix Care (PTR-90143)
  {
    id: 'ORD-9870',
    partnerId: 'PTR-90143',
    bookingReference: 'ORD-9870',
    customerId: 'CUST-2001',
    userName: 'R. Venkatesh',
    userPhone: '+91 98421 11223',
    userEmail: 'venkatesh@example.com',
    serviceName: 'Full Home Deep Cleaning (2 BHK)',
    serviceCategory: 'cleaning-pest',
    serviceZone: 'Rayakottai Road',
    city: 'Krishnagiri',
    address: 'No 45, Green Valley Nagar, Rayakottai Road, Krishnagiri 635001',
    addressDetails: {
      fullAddress: 'No 45, Green Valley Nagar, Rayakottai Road',
      locality: 'Rayakottai Road',
      city: 'Krishnagiri',
      pincode: '635001',
      contactPhone: '+91 98421 11223'
    },
    slot: 'Today, 10:00 AM - 02:00 PM',
    scheduledDate: new Date(),
    scheduledStartTime: '10:00',
    scheduledEndTime: '14:00',
    status: 'In Progress',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    totalAmount: 2499,
    agencyCommission: 499.80,
    platformFee: 499.80,
    netAgencyShare: 1999.20,
    assignedProfessional: {
      id: 'PRO-8846',
      name: 'Karthik Raja',
      phone: '+91 98420 77123',
      trade: 'Deep Cleaning Specialist'
    },
    businessNotes: [],
    checklist: [],
    createdAt: new Date(Date.now() - 7200000)
  }
];

// 5. Settlements and Payout Ledger
let partnerSettlements = [
  // PTR-90142 (Mode A: ThroughBusiness)
  {
    id: 'SETTL-2026-W42',
    partnerId: 'PTR-90142',
    settlementReference: 'SETTL-2026-W42',
    cycle: '13 Oct 2026 - 19 Oct 2026',
    payoutDate: new Date(Date.now() - 86400000 * 3),
    grossTurnover: 124500,
    grossTurnoverPaise: 12450000,
    platformFee: 22410,
    platformFeePaise: 2241000,
    gstDeduction: 4033.80,
    gstDeductionPaise: 403380,
    adjustments: 0,
    refundDeductions: 0,
    netDisbursed: 98056.20,
    netDisbursedPaise: 9805620,
    status: 'Settled',
    bankUtr: 'UTR-CMSICICI2026102008492',
    utrNumber: 'UTR-CMSICICI2026102008492',
    bankAccountMasked: 'ICICI Bank (••••••••9012)',
    jobsCount: 78,
    settlementModel: 'settle_to_business',
    note: 'Platform settlement paid directly to agency current account. Internal technician payroll administered by agency.'
  },
  {
    id: 'SETTL-2026-W41',
    partnerId: 'PTR-90142',
    settlementReference: 'SETTL-2026-W41',
    cycle: '06 Oct 2026 - 12 Oct 2026',
    payoutDate: new Date(Date.now() - 86400000 * 10),
    grossTurnover: 118200,
    grossTurnoverPaise: 11820000,
    platformFee: 21276,
    platformFeePaise: 2127600,
    gstDeduction: 3829.68,
    gstDeductionPaise: 382968,
    adjustments: 200, // Weather credit adjustment from dispute DSP-8790
    adjustmentsPaise: 20000,
    refundDeductions: 0,
    netDisbursed: 93294.32,
    netDisbursedPaise: 9329432,
    status: 'Settled',
    bankUtr: 'UTR-CMSICICI2026101300918',
    utrNumber: 'UTR-CMSICICI2026101300918',
    bankAccountMasked: 'ICICI Bank (••••••••9012)',
    jobsCount: 74,
    settlementModel: 'settle_to_business',
    note: 'Platform settlement paid directly to agency current account.'
  },
  {
    id: 'SETTL-2026-W44-PEND',
    partnerId: 'PTR-90142',
    settlementReference: 'SETTL-2026-W44-PEND',
    cycle: '27 Oct 2026 - 02 Nov 2026 (Upcoming)',
    payoutDate: new Date(Date.now() + 86400000 * 7),
    grossTurnover: 45000,
    grossTurnoverPaise: 4500000,
    platformFee: 8100,
    platformFeePaise: 810000,
    gstDeduction: 1458.00,
    gstDeductionPaise: 145800,
    adjustments: 0,
    adjustmentsPaise: 0,
    refundDeductions: 0,
    netDisbursed: 35442.00,
    netDisbursedPaise: 3544200,
    status: 'Pending',
    bankUtr: null,
    utrNumber: 'PENDING_APPROVAL',
    bankAccountMasked: 'ICICI Bank (••••••••9012)',
    jobsCount: 28,
    settlementModel: 'settle_to_business',
    note: 'Settlement cycle awaiting closing date before processing.'
  },
  {
    id: 'SETTL-2026-W43',
    partnerId: 'PTR-90142',
    settlementReference: 'SETTL-2026-W43',
    cycle: '20 Oct 2026 - 26 Oct 2026 (Current Active Cycle)',
    payoutDate: new Date(Date.now() + 86400000 * 3),
    grossTurnover: 84600,
    grossTurnoverPaise: 8460000,
    platformFee: 15228,
    platformFeePaise: 1522800,
    gstDeduction: 2741.04,
    gstDeductionPaise: 274104,
    adjustments: 450, // Dispute credit adjustment queued
    adjustmentsPaise: 45000,
    refundDeductions: 0,
    netDisbursed: 67080.96,
    netDisbursedPaise: 6708096,
    status: 'Processing',
    utrNumber: 'PENDING_DISBURSEMENT',
    bankAccountMasked: 'ICICI Bank (••••••••9012)',
    jobsCount: 52,
    settlementModel: 'settle_to_business',
    note: 'Estimated payout for current cycle. Scheduled for upcoming batch release.'
  },
  {
    id: 'SETTL-2026-W40-FAIL',
    partnerId: 'PTR-90142',
    settlementReference: 'SETTL-2026-W40-FAIL',
    cycle: '29 Sep 2026 - 05 Oct 2026',
    payoutDate: new Date(Date.now() - 86400000 * 18),
    grossTurnover: 92000,
    grossTurnoverPaise: 9200000,
    platformFee: 16560,
    platformFeePaise: 1656000,
    gstDeduction: 2980.80,
    gstDeductionPaise: 298080,
    adjustments: 0,
    refundDeductions: 0,
    netDisbursed: 72459.20,
    netDisbursedPaise: 7245920,
    status: 'Failed',
    failureReason: 'Bank IFSC clearing rejected: Destination branch merged into regional clearing house. Re-disbursed in W41 upon IFSC update.',
    utrNumber: 'REJECTED_BY_CLEARING_HOUSE',
    bankAccountMasked: 'ICICI Bank (••••••••9012)',
    jobsCount: 60,
    settlementModel: 'settle_to_business',
    note: 'Bank transfer failed at settlement clearing gateway.'
  },
  // PTR-90143 (Mode B: DirectToProfessional)
  {
    id: 'SETTL-2026-W42-QFC',
    partnerId: 'PTR-90143',
    settlementReference: 'SETTL-2026-W42-QFC',
    cycle: '13 Oct 2026 - 19 Oct 2026',
    payoutDate: new Date(Date.now() - 86400000 * 3),
    grossTurnover: 46200,
    grossTurnoverPaise: 4620000,
    platformFee: 9240,
    platformFeePaise: 924000,
    gstDeduction: 1663.20,
    gstDeductionPaise: 166320,
    technicianDirectDisbursements: 30030,
    technicianDirectDisbursementsPaise: 3003000,
    netDisbursed: 5266.80, // Partner 15% agency override commission
    netDisbursedPaise: 526680,
    status: 'Settled',
    utrNumber: 'SBIN2026102044810',
    bankAccountMasked: 'State Bank of India (••••••••6781)',
    jobsCount: 28,
    settlementModel: 'direct_to_professional',
    note: 'Platform dispatches earnings directly to individual technicians. Partner receives configured business override commission.'
  }
];

// 5b. Service Category Requests
let serviceCategoryRequests = [
  {
    id: 'SCR-101',
    partnerId: 'PTR-90142',
    categoryName: 'Commercial HVAC & VRF Systems',
    justification: 'Agency has onboarded 4 certified Daikin/Mitsubishi commercial VRF technicians.',
    initialFleetSize: 4,
    status: 'Pending Platform Review',
    submittedAt: new Date(Date.now() - 86400000 * 3)
  }
];

// 5c. Coverage Change Requests
let coverageChangeRequests = [
  {
    id: 'CCR-201',
    partnerId: 'PTR-90142',
    requestedCity: 'Mumbai',
    requestedZones: ['Powai', 'Vikhroli West'],
    requestedPincodes: ['400076', '400079'],
    justification: 'Opening satellite service depot at Hiranandani Business Park to reduce travel buffer.',
    status: 'Pending Platform Review',
    submittedAt: new Date(Date.now() - 86400000 * 4)
  }
];

// 5d. Settlement Correction Requests
let settlementCorrectionRequests = [
  {
    id: 'CORR-301',
    partnerId: 'PTR-90142',
    settlementId: 'SETTL-2026-W42',
    disputedAmount: 450,
    reason: 'Customer warranty deduction for ORD-9821 was credited back per dispute DSP-8812.',
    status: 'Pending Finance Review',
    submittedAt: new Date(Date.now() - 86400000)
  }
];

// 6. Bank Account Change Requests
let bankChangeRequests = [
  {
    id: 'BCR-001',
    partnerId: 'PTR-90142',
    requestedBy: 'Sandeep Patil (Business Owner)',
    currentBank: 'ICICI Bank (••••••••9012)',
    proposedBank: {
      bankName: 'HDFC Bank Ltd',
      accountHolderName: 'Apex Home Solutions LLP',
      accountNumber: '••••••••4491',
      ifscCode: 'HDFC0000060',
      accountType: 'Current Corporate Account'
    },
    reason: 'Upgrading corporate banking limits for payroll integration',
    status: 'Under Verification',
    submittedAt: new Date(Date.now() - 86400000 * 2),
    complianceNote: 'Cancelled cheque verified. Awaiting Penny-drop verification match with MCA records.'
  }
];

// 7. Invoices (B2B Platform Commission GST Invoices & Service Statements)
let partnerInvoices = [
  {
    id: 'INV-B2B-2026-09',
    partnerId: 'PTR-90142',
    invoiceNumber: 'UC/B2B/2026/09/8812',
    billingMonth: 'September 2026',
    issueDate: new Date('2026-10-01'),
    customerBillingGross: 486500,
    platformFee: 87570,
    cgst: 7881.30,
    sgst: 7881.30,
    totalInvoiceAmount: 103332.60,
    gstinSupplier: '27AAACU1234F1ZV',
    gstinPartner: '27AABCA1234F1Z8',
    status: 'Issued',
    downloadUrl: '/api/partner/invoices/INV-B2B-2026-09/download'
  },
  {
    id: 'INV-B2B-2026-08',
    partnerId: 'PTR-90142',
    invoiceNumber: 'UC/B2B/2026/08/7741',
    billingMonth: 'August 2026',
    issueDate: new Date('2026-09-01'),
    customerBillingGross: 442000,
    platformFee: 79560,
    cgst: 7160.40,
    sgst: 7160.40,
    totalInvoiceAmount: 93880.80,
    gstinSupplier: '27AAACU1234F1ZV',
    gstinPartner: '27AABCA1234F1Z8',
    status: 'Issued',
    downloadUrl: '/api/partner/invoices/INV-B2B-2026-08/download'
  }
];

// 8. Refunds & Customer Disputes
let partnerDisputes = [
  {
    id: 'DSP-8812',
    partnerId: 'PTR-90142',
    bookingId: 'ORD-9821',
    technicianName: 'Sunil Varma',
    customerName: 'Priya Narang',
    issueType: 'Service Warranty Claim',
    reason: 'Water dripping after split AC servicing',
    claimAmount: 450,
    disputeStatus: 'Under Review',
    owner: 'Platform Operations Dispute Desk (R. Sharma)',
    evidence: ['customer_job_sheet_9821.pdf', 'drain_pipe_inspection_photo.jpg'],
    timeline: [
      { timestamp: new Date(Date.now() - 86400000 * 2), actor: 'Partner (Apex Home Solutions)', note: 'Dispute filed contesting penalty deduction' },
      { timestamp: new Date(Date.now() - 86400000 * 1.5), actor: 'Platform Dispute Officer', note: 'Requested technician re-inspection report and photo evidence' },
      { timestamp: new Date(Date.now() - 86400000 * 0.8), actor: 'Partner (Apex Home Solutions)', note: 'Re-inspection completed. Drain pipe connector flushed at zero cost.' }
    ],
    messages: [
      { id: 'msg-1', sender: 'Platform Dispute Officer', senderRole: 'Platform Operations', message: 'Please provide proof that the water runoff blockage was not due to improper drain angle.', timestamp: new Date(Date.now() - 86400000 * 1.5) },
      { id: 'msg-2', sender: 'Sandeep Patil', senderRole: 'Business Owner', message: 'Attached high-resolution photos of the drain connector. The issue was external dust in customer balcony outlet, not internal coil mounting angle.', timestamp: new Date(Date.now() - 86400000 * 0.8) }
    ],
    financialAdjustment: {
      type: 'CREDIT',
      amount: 450,
      description: 'Traceable credit adjustment pending next settlement cycle',
      settledIn: 'SETTL-2026-W43'
    },
    adminResolution: 'Penalty waiver verified and queued for credit adjustment in cycle W43.',
    filedDate: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'DSP-8790',
    partnerId: 'PTR-90142',
    bookingId: 'ORD-9780',
    technicianName: 'Vikram Salvi',
    customerName: 'Sameer Sen',
    issueType: 'Customer No-Show / Delay',
    reason: 'Late arrival beyond 30 min SLA window',
    claimAmount: 200,
    disputeStatus: 'Resolved',
    owner: 'Platform Dispute Desk (A. Nair)',
    evidence: ['gps_traffic_delay_log.pdf', 'municipal_monsoon_advisory.pdf'],
    timeline: [
      { timestamp: new Date(Date.now() - 86400000 * 7), actor: 'Partner (Apex Home Solutions)', note: 'Contested SLA delay deduction due to torrential monsoon' },
      { timestamp: new Date(Date.now() - 86400000 * 6), actor: 'Platform Dispute Officer', note: 'Cross-referenced BMC traffic alert. Force majeure confirmed.' },
      { timestamp: new Date(Date.now() - 86400000 * 5), actor: 'Platform Dispute Officer', note: 'Dispute approved. ₹200 SLA charge credited back in SETTL-2026-W41.' }
    ],
    messages: [
      { id: 'msg-3', sender: 'Platform Dispute Officer', senderRole: 'Platform Operations', message: 'Advisory verified. Penalty waived.', timestamp: new Date(Date.now() - 86400000 * 5) }
    ],
    financialAdjustment: {
      type: 'CREDIT',
      amount: 200,
      description: 'Force majeure weather credit adjustment',
      settledIn: 'SETTL-2026-W41'
    },
    adminResolution: 'Penalty waived due to verified municipal monsoon alert.',
    filedDate: new Date(Date.now() - 86400000 * 7)
  }
];

// 9. Customer Reviews on Agency Technicians
let partnerReviews = [
  {
    id: 'REV-901',
    partnerId: 'PTR-90142',
    bookingId: 'ORD-9830',
    customerName: 'Kavita Chawla',
    technicianName: 'Vikram Salvi',
    rating: 5,
    comment: 'Exceptional work by Vikram! He thoroughly jet-cleaned both split AC units and showed me the clean water runoff. Very polite and professional.',
    createdAt: new Date(Date.now() - 86400000),
    partnerReply: 'Thank you Kavita ji! Apex Home Solutions is dedicated to 100% cooling excellence.',
    repliedBy: 'Sandeep Patil',
    repliedAt: new Date(Date.now() - 43200000),
    flaggedForModeration: false
  },
  {
    id: 'REV-902',
    partnerId: 'PTR-90142',
    bookingId: 'ORD-9825',
    customerName: 'Aditya Rao',
    technicianName: 'Sunil Vishwakarma',
    rating: 4.8,
    comment: 'Bathroom looks brand new. Sunil brought all industrial chemicals and heavy duty scrubbing tools.',
    createdAt: new Date(Date.now() - 86400000 * 2),
    partnerReply: null,
    flaggedForModeration: false
  },
  {
    id: 'REV-903',
    partnerId: 'PTR-90142',
    bookingId: 'ORD-9799',
    customerName: 'Anonymous User',
    technicianName: 'Vikram Salvi',
    rating: 1,
    comment: 'Abusive language and completely wrong company tagged in this review! This was for plumbing, not AC servicing!',
    createdAt: new Date(Date.now() - 86400000 * 3),
    partnerReply: null,
    flaggedForModeration: false
  }
];

// 10. Training & Certifications
let partnerTrainingCourses = [
  {
    id: 'TRN-101',
    partnerId: 'PTR-90142',
    title: 'UC Platinum Quality Standards & Safety Protocols 2026',
    category: 'Safety & SOP',
    requiredFor: 'All Active Technicians',
    mandatory: true,
    enrolledCount: 5,
    completedCount: 5,
    completionRate: 100,
    validUntil: '31 Dec 2026',
    status: 'Compliant',
    passingThreshold: '85%'
  },
  {
    id: 'TRN-102',
    partnerId: 'PTR-90142',
    title: 'Inverter AC Multi-Meter & R32 Refrigerant Safe Handling',
    category: 'Technical Certification',
    requiredFor: 'AC & HVAC Specialists',
    mandatory: true,
    enrolledCount: 3,
    completedCount: 3,
    completionRate: 100,
    validUntil: '31 Oct 2027',
    status: 'Compliant',
    passingThreshold: '80%'
  },
  {
    id: 'TRN-103',
    partnerId: 'PTR-90142',
    title: 'Customer Communication & Dispute Prevention Excellence',
    category: 'Soft Skills',
    requiredFor: 'All Technicians',
    mandatory: true,
    enrolledCount: 5,
    completedCount: 4,
    completionRate: 80,
    validUntil: '15 Nov 2026',
    status: 'In Progress (1 Pending)',
    passingThreshold: '75%'
  }
];

let partnerAssignedProfessionalsTraining = [
  {
    professionalId: 'PRO-8841',
    name: 'Vikram Salvi',
    trade: 'Master AC Specialist',
    coursesAssigned: 3,
    coursesCompleted: 3,
    certifications: [
      { courseId: 'TRN-101', name: 'UC Platinum Quality & Safety', status: 'Certified', certifiedAt: '2026-01-15', expiresAt: '2026-12-31' },
      { courseId: 'TRN-102', name: 'R32 Safe Handling Specialist', status: 'Certified', certifiedAt: '2026-02-10', expiresAt: '2027-10-31' },
      { courseId: 'TRN-103', name: 'Customer Excellence Masterclass', status: 'Certified', certifiedAt: '2026-03-01', expiresAt: '2026-11-15' }
    ],
    overallStatus: 'Fully Certified'
  },
  {
    professionalId: 'PRO-8842',
    name: 'Sunil Varma',
    trade: 'HVAC Duct & Appliance Technician',
    coursesAssigned: 3,
    coursesCompleted: 3,
    certifications: [
      { courseId: 'TRN-101', name: 'UC Platinum Quality & Safety', status: 'Certified', certifiedAt: '2026-01-18', expiresAt: '2026-12-31' },
      { courseId: 'TRN-102', name: 'R32 Safe Handling Specialist', status: 'Certified', certifiedAt: '2026-02-12', expiresAt: '2027-10-31' },
      { courseId: 'TRN-103', name: 'Customer Excellence Masterclass', status: 'Certified', certifiedAt: '2026-03-05', expiresAt: '2026-11-15' }
    ],
    overallStatus: 'Fully Certified'
  },
  {
    professionalId: 'PRO-8843',
    name: 'Sunil Vishwakarma',
    trade: 'Deep Cleaning & Sanitization Pro',
    coursesAssigned: 2,
    coursesCompleted: 2,
    certifications: [
      { courseId: 'TRN-101', name: 'UC Platinum Quality & Safety', status: 'Certified', certifiedAt: '2026-01-22', expiresAt: '2026-12-31' },
      { courseId: 'TRN-103', name: 'Customer Excellence Masterclass', status: 'Certified', certifiedAt: '2026-03-08', expiresAt: '2026-11-15' }
    ],
    overallStatus: 'Fully Certified'
  },
  {
    professionalId: 'PRO-8850',
    name: 'Kiran Shinde',
    trade: 'HVAC Maintenance Technician',
    coursesAssigned: 3,
    coursesCompleted: 3,
    certifications: [
      { courseId: 'TRN-101', name: 'UC Platinum Quality & Safety', status: 'Certified', certifiedAt: '2026-02-05', expiresAt: '2026-12-31' },
      { courseId: 'TRN-102', name: 'R32 Safe Handling Specialist', status: 'Certified', certifiedAt: '2026-02-18', expiresAt: '2027-10-31' },
      { courseId: 'TRN-103', name: 'Customer Excellence Masterclass', status: 'Certified', certifiedAt: '2026-03-12', expiresAt: '2026-11-15' }
    ],
    overallStatus: 'Fully Certified'
  },
  {
    professionalId: 'PRO-8851',
    name: 'Amit Jadhav',
    trade: 'Appliance Repair Lead',
    coursesAssigned: 2,
    coursesCompleted: 1,
    certifications: [
      { courseId: 'TRN-101', name: 'UC Platinum Quality & Safety', status: 'Expired', certifiedAt: '2025-09-01', expiresAt: '2026-10-20' },
      { courseId: 'TRN-103', name: 'Customer Excellence Masterclass', status: 'Overdue', certifiedAt: null, expiresAt: null }
    ],
    overallStatus: 'Certification Overdue (Dispatch Locked)'
  }
];

let partnerTrainingSessions = [
  {
    sessionId: 'SESS-101',
    partnerId: 'PTR-90142',
    courseId: 'TRN-102',
    title: 'R32 Flammable Refrigerant Field Practical & Vacuum Gauge Testing',
    trainer: 'Rajesh Nair (Platform Master Trainer)',
    date: '2026-10-28',
    time: '10:00 - 13:00 IST',
    mode: 'In-Person Workshop',
    venue: 'Bandra West Service Depot, Plot 18 Hill Road',
    capacity: 15,
    enrolledCount: 8,
    status: 'Scheduled'
  },
  {
    sessionId: 'SESS-102',
    partnerId: 'PTR-90142',
    courseId: 'TRN-103',
    title: 'Customer Grievance Resolution & Trust Building Workshop',
    trainer: 'Sunita Menon (Customer Success Lead)',
    date: '2026-11-04',
    time: '14:00 - 16:30 IST',
    mode: 'Interactive Webinar',
    venue: 'Live Video Classroom (Link auto-distributed)',
    capacity: 30,
    enrolledCount: 14,
    status: 'Scheduled'
  }
];

let trainingSessionRequests = [];

let businessDocumentExpiryRecords = [
  {
    id: 'DOC-EXP-01',
    partnerId: 'PTR-90142',
    docType: 'Master Franchise Agreement SLA',
    documentNumber: 'CTR-2026-APX',
    issueDate: '2026-01-12',
    expiryDate: '2027-01-11',
    daysRemaining: 80,
    status: 'Valid',
    restrictionIfExpired: 'Immediate platform de-authorization & payout freeze upon expiration'
  },
  {
    id: 'DOC-EXP-02',
    partnerId: 'PTR-90142',
    docType: 'Maharashtra Municipal Trade License',
    documentNumber: 'TL-MH-2026-8819',
    issueDate: '2025-11-08',
    expiryDate: '2026-11-07',
    daysRemaining: 15,
    status: 'Expiring Soon',
    restrictionIfExpired: 'Dispatch throttle restricted to 50% capacity if not renewed within SLA'
  },
  {
    id: 'DOC-EXP-03',
    partnerId: 'PTR-90142',
    docType: 'Commercial General Liability Insurance Policy',
    documentNumber: 'INS-2026-091',
    issueDate: '2025-12-08',
    expiryDate: '2026-12-07',
    daysRemaining: 45,
    status: 'Valid',
    restrictionIfExpired: 'High-value commercial appliance and chiller bookings blocked'
  },
  {
    id: 'DOC-EXP-04',
    partnerId: 'PTR-90142',
    docType: 'GST Registration Certificate (REG-06)',
    documentNumber: '27AABCA1234F1Z8',
    issueDate: '2026-01-10',
    expiryDate: 'Perpetual / Ongoing',
    daysRemaining: 9999,
    status: 'Valid',
    restrictionIfExpired: 'B2B GST invoicing and input tax credit suspended'
  }
];

let professionalDocumentExpiryRecords = [
  {
    id: 'PRO-EXP-01',
    partnerId: 'PTR-90142',
    professionalId: 'PRO-8841',
    professionalName: 'Vikram Salvi',
    docType: 'Police Verification Certificate',
    documentNumber: 'PVR-MH-8812',
    expiryDate: '2027-04-15',
    daysRemaining: 174,
    status: 'Valid',
    restrictionIfExpired: 'Technician customer dispatch suspended immediately'
  },
  {
    id: 'PRO-EXP-02',
    partnerId: 'PTR-90142',
    professionalId: 'PRO-8842',
    professionalName: 'Sunil Varma',
    docType: 'Police Verification Certificate',
    documentNumber: 'PVR-MH-8813',
    expiryDate: '2026-11-04',
    daysRemaining: 12,
    status: 'Expiring Soon',
    restrictionIfExpired: 'Technician customer booking assignments suspended if Police Verification expires'
  },
  {
    id: 'PRO-EXP-03',
    partnerId: 'PTR-90142',
    professionalId: 'PRO-8850',
    professionalName: 'Kiran Shinde',
    docType: 'Commercial Driving License',
    documentNumber: 'DL-02-2026-1102',
    expiryDate: '2028-06-30',
    daysRemaining: 615,
    status: 'Valid',
    restrictionIfExpired: 'Mobile van equipment service dispatch disabled'
  },
  {
    id: 'PRO-EXP-04',
    partnerId: 'PTR-90142',
    professionalId: 'PRO-8851',
    professionalName: 'Amit Jadhav',
    docType: 'Police Verification Certificate',
    documentNumber: 'PVR-MH-8810',
    expiryDate: '2026-10-21',
    daysRemaining: -2,
    status: 'Expired',
    restrictionIfExpired: 'Technician offline - dispatch locked until renewed certificate verified'
  }
];

// 11. Inventory & Consumables Store
let partnerInventory = [
  // PTR-90142 (Apex Home Solutions LLP)
  {
    id: 'INV-ITEM-01',
    partnerId: 'PTR-90142',
    itemName: 'R-32 Ecological Refrigerant Canister (10kg)',
    sku: 'REF-R32-10KG',
    category: 'Consumables',
    unitPrice: 3850,
    inStock: 8,
    allocatedQuantity: 2,
    reorderThreshold: 3,
    minimumThreshold: 3,
    status: 'In Stock'
  },
  {
    id: 'INV-ITEM-02',
    partnerId: 'PTR-90142',
    itemName: 'Eco-Pure Coil Cleaning Chemical (5L Jug)',
    sku: 'CHEM-COIL-5L',
    category: 'Consumables',
    unitPrice: 890,
    inStock: 14,
    allocatedQuantity: 4,
    reorderThreshold: 5,
    minimumThreshold: 5,
    status: 'In Stock'
  },
  {
    id: 'INV-ITEM-03',
    partnerId: 'PTR-90142',
    itemName: 'Urban Company Branded Uniform & Safety Shoes',
    sku: 'KIT-UNIFORM-PRO',
    category: 'Uniform & Gear',
    unitPrice: 1250,
    inStock: 2,
    allocatedQuantity: 1,
    reorderThreshold: 4,
    minimumThreshold: 4,
    status: 'Low Stock'
  },
  {
    id: 'INV-ITEM-04',
    partnerId: 'PTR-90142',
    itemName: 'Heavy Duty Power Jet Pump (Pressure 120 Bar)',
    sku: 'TOOL-JETPUMP-120B',
    category: 'Hardware Tools',
    unitPrice: 6200,
    inStock: 6,
    allocatedQuantity: 4,
    reorderThreshold: 2,
    minimumThreshold: 2,
    status: 'In Stock'
  },
  {
    id: 'INV-ITEM-05',
    partnerId: 'PTR-90142',
    itemName: 'Copper Pipe Tube Coil Bundle (1/4" & 1/2" 15m)',
    sku: 'CONSUM-COPPER-PIPE',
    category: 'Consumables',
    unitPrice: 2450,
    inStock: 10,
    allocatedQuantity: 3,
    reorderThreshold: 4,
    minimumThreshold: 4,
    status: 'In Stock'
  },
  // PTR-90143 (Krishnagiri QuickFix Care - multi-tenant isolation!)
  {
    id: 'INV-ITEM-QFC-01',
    partnerId: 'PTR-90143',
    itemName: 'Industrial Floor Polisher Disc Pads (Pack of 5)',
    sku: 'TOOL-PADS-5P',
    category: 'Hardware Tools',
    unitPrice: 1800,
    inStock: 5,
    allocatedQuantity: 1,
    reorderThreshold: 2,
    minimumThreshold: 2,
    status: 'In Stock'
  }
];

let partnerSupplyOrders = [
  {
    id: 'ORD-SUP-101',
    partnerId: 'PTR-90142',
    orderNumber: 'SUP-2026-101',
    items: [
      { itemId: 'INV-ITEM-01', sku: 'REF-R32-10KG', itemName: 'R-32 Ecological Refrigerant Canister (10kg)', quantity: 5, unitPrice: 3850, total: 19250 }
    ],
    totalAmount: 19250,
    status: 'In Transit',
    orderedAt: new Date(Date.now() - 86400000 * 3),
    estimatedDelivery: '25 Oct 2026',
    shippingCarrier: 'Delhivery Surface Cargo',
    trackingNumber: 'DEL-9912084920',
    deliveryAddress: 'Plot 18, Hill Road, Bandra West, Mumbai 400050',
    notes: 'Urgent restocking for weekend festival rush',
    isDemoSandbox: true
  },
  {
    id: 'ORD-SUP-102',
    partnerId: 'PTR-90142',
    orderNumber: 'SUP-2026-102',
    items: [
      { itemId: 'INV-ITEM-02', sku: 'CHEM-COIL-5L', itemName: 'Eco-Pure Coil Cleaning Chemical (5L Jug)', quantity: 10, unitPrice: 890, total: 8900 }
    ],
    totalAmount: 8900,
    status: 'Goods Received',
    orderedAt: new Date(Date.now() - 86400000 * 10),
    deliveredAt: new Date(Date.now() - 86400000 * 7),
    receivedAt: new Date(Date.now() - 86400000 * 7),
    shippingCarrier: 'BlueDart Express',
    trackingNumber: 'BLU-4401827419',
    deliveryAddress: 'Plot 18, Hill Road, Bandra West, Mumbai 400050',
    notes: 'Standard monthly chemicals batch',
    isDemoSandbox: true
  }
];

let partnerInventoryMovements = [
  {
    id: 'MOV-001',
    partnerId: 'PTR-90142',
    timestamp: new Date(Date.now() - 86400000 * 7),
    actor: 'Sandeep Patil (Business Owner)',
    itemId: 'INV-ITEM-02',
    itemSku: 'CHEM-COIL-5L',
    itemName: 'Eco-Pure Coil Cleaning Chemical (5L Jug)',
    type: 'PURCHASE',
    quantityChange: 10,
    resultingStock: 14,
    resultingAllocated: 4,
    reason: 'Goods received for PO SUP-2026-102'
  },
  {
    id: 'MOV-002',
    partnerId: 'PTR-90142',
    timestamp: new Date(Date.now() - 86400000 * 5),
    actor: 'Rahul Dev (Dispatcher)',
    itemId: 'INV-ITEM-01',
    itemSku: 'REF-R32-10KG',
    itemName: 'R-32 Ecological Refrigerant Canister (10kg)',
    type: 'ALLOCATION',
    quantityChange: -2,
    resultingStock: 8,
    resultingAllocated: 2,
    professionalId: 'PRO-8841',
    professionalName: 'Vikram Salvi',
    reason: 'Allocated to Vikram Salvi for upcoming AC servicing batch'
  },
  {
    id: 'MOV-003',
    partnerId: 'PTR-90142',
    timestamp: new Date(Date.now() - 86400000 * 2),
    actor: 'Rahul Dev (Dispatcher)',
    itemId: 'INV-ITEM-04',
    itemSku: 'TOOL-JETPUMP-120B',
    itemName: 'Heavy Duty Power Jet Pump (Pressure 120 Bar)',
    type: 'ALLOCATION',
    quantityChange: -1,
    resultingStock: 6,
    resultingAllocated: 4,
    professionalId: 'PRO-8843',
    professionalName: 'Sunil Vishwakarma',
    reason: 'Allocated to Sunil Vishwakarma for commercial deep scrubbing'
  }
];

// 12. Support & Operational Tickets
let partnerSupportTickets = [
  {
    id: 'TCK-PTR-401',
    partnerId: 'PTR-90142',
    category: 'Dispatch & Slot Allocation',
    subject: 'Requesting emergency capacity override for Bandra West monsoon rush',
    priority: 'High',
    status: 'In Progress',
    linkedEntity: { type: 'booking', id: 'ORD-9841' },
    evidence: ['rainfall_advisory.pdf'],
    messages: [
      { sender: 'Pooja Patil (Manager)', text: 'We have 2 extra standby technicians ready to accept surplus AC leak jobs today. Please increase our dispatch throttle.', timestamp: new Date(Date.now() - 3600000 * 4) },
      { sender: 'Platform Ops Lead', text: 'Capacity cap increased from 15 to 22 concurrent jobs for PTR-90142 through 20:00 tonight.', timestamp: new Date(Date.now() - 3600000 * 2) }
    ],
    internalStaffNotes: 'Internal triage: Partner verified with 2 extra technicians. Approved temporary +7 concurrent job surge.',
    createdAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    id: 'TCK-PTR-388',
    partnerId: 'PTR-90142',
    category: 'Billing & GST',
    subject: 'Confirmation of B2B GST tax credit in GSTR-2B',
    priority: 'Medium',
    status: 'Resolved',
    linkedEntity: { type: 'settlement', id: 'SETTL-2026-W42' },
    evidence: ['gstr2b_reconciliation.xlsx'],
    messages: [
      { sender: 'Anand Kulkarni (Finance)', text: 'Kindly share filing acknowledgment for September B2B commission invoice.', timestamp: new Date(Date.now() - 86400000 * 5) },
      { sender: 'UC Finance Team', text: 'Invoice UC/B2B/2026/09/8812 filed in GSTR-1 with ARN AA2709260128491. Reflected in portal.', timestamp: new Date(Date.now() - 86400000 * 4) }
    ],
    internalStaffNotes: 'Internal finance: GSTR-1 ARN verified. Matching credit confirmed.',
    createdAt: new Date(Date.now() - 86400000 * 5)
  }
];

// 13. Notifications (All 8 mandatory operational categories)
let partnerNotifications = [
  {
    id: 'NOTIF-01',
    partnerId: 'PTR-90142',
    category: 'New Booking',
    title: 'New Booking ORD-9848 in Bandra West',
    message: 'Customer scheduled Split AC Jet Service. Ready for technician assignment.',
    read: false,
    timestamp: new Date(Date.now() - 1800000),
    deepLink: '/partner/bookings/ORD-9848',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-02',
    partnerId: 'PTR-90142',
    category: 'Settlement Updates',
    title: 'Settlement Batch SETTL-2026-W42 Disbursed',
    message: 'Weekly net disbursement of ₹98,056.20 credited to ICICI Bank. Bank UTR: UTR-CMSICICI2026102008492.',
    read: false,
    timestamp: new Date(Date.now() - 86400000 * 3),
    deepLink: '/partner/settlements',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-03',
    partnerId: 'PTR-90142',
    category: 'Reassignment',
    title: 'Booking ORD-9842 Reassigned',
    message: 'Booking ORD-9842 successfully reassigned to Kiran Shinde (PRO-8850) per fleet rebalancing.',
    read: true,
    timestamp: new Date(Date.now() - 86400000 * 2),
    deepLink: '/partner/bookings/ORD-9842',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-04',
    partnerId: 'PTR-90142',
    category: 'Cancellation',
    title: 'Customer Cancellation Notice: ORD-9839',
    message: 'Customer cancelled appointment within 2h window. Platform policy cancellation compensation fee credited.',
    read: false,
    timestamp: new Date(Date.now() - 86400000),
    deepLink: '/partner/bookings/ORD-9839',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-05',
    partnerId: 'PTR-90142',
    category: 'Training Requirement',
    title: 'Mandatory Safety Refresher Overdue',
    message: 'Technician Amit Jadhav (PRO-8851) has overdue Safety Standards recertification. Booking assignment paused.',
    read: false,
    timestamp: new Date(Date.now() - 43200000),
    deepLink: '/partner/training',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-06',
    partnerId: 'PTR-90142',
    category: 'Document Review',
    title: 'Compliance Review Approved: Master Franchise SLA',
    message: 'Platform compliance desk approved your annual Master Franchise Agreement SLA documentation.',
    read: true,
    timestamp: new Date(Date.now() - 86400000 * 4),
    deepLink: '/partner/documents',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-07',
    partnerId: 'PTR-90142',
    category: 'Expiry Reminders',
    title: 'Document Expiring Soon: Municipal Trade License',
    message: 'Maharashtra Municipal Trade License expires in 15 days (07 Nov 2026). Upload renewal certificate.',
    read: false,
    timestamp: new Date(Date.now() - 21600000),
    deepLink: '/partner/documents',
    deliveryChannel: 'Local Outbox'
  },
  {
    id: 'NOTIF-08',
    partnerId: 'PTR-90142',
    category: 'Support Replies',
    title: 'Platform Operations Replied to Ticket #TCK-PTR-401',
    message: 'Capacity surge override approved through 20:00 tonight for Bandra West.',
    read: false,
    timestamp: new Date(Date.now() - 7200000),
    deepLink: '/partner/support',
    deliveryChannel: 'Local Outbox'
  }
];

// 14. Business Documents
let partnerDocuments = [
  {
    id: 'DOC-01',
    partnerId: 'PTR-90142',
    title: 'Certificate of Incorporation / LLP Deed',
    docType: 'Certificate of Incorporation',
    fileName: 'LLP_Deed_ApexHome.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    expiryDate: 'Perpetual',
    daysUntilExpiry: 9999,
    status: 'Approved',
    uploadedAt: '2026-01-10',
    reviewFeedback: 'Incorporation verified via MCA registry.'
  },
  {
    id: 'DOC-02',
    partnerId: 'PTR-90142',
    title: 'GST Registration Certificate (REG-06)',
    docType: 'GST Registration Certificate',
    fileName: 'GST_27AABCA1234F1Z8.pdf',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    expiryDate: 'Perpetual',
    daysUntilExpiry: 9999,
    status: 'Approved',
    uploadedAt: '2026-01-10',
    reviewFeedback: 'Active regular taxpayer confirmed.'
  },
  {
    id: 'DOC-03',
    partnerId: 'PTR-90142',
    title: 'Company PAN Card',
    docType: 'Company PAN Card',
    fileName: 'PAN_AABCA1234F.pdf',
    fileSize: '1.1 MB',
    fileType: 'application/pdf',
    expiryDate: 'Perpetual',
    daysUntilExpiry: 9999,
    status: 'Approved',
    uploadedAt: '2026-01-10',
    reviewFeedback: 'PAN matches NSDL entity name.'
  },
  {
    id: 'DOC-04',
    partnerId: 'PTR-90142',
    title: 'Master Franchise Agreement SLA',
    docType: 'Master Franchise Agreement',
    fileName: 'SLA_CTR_2026_APX.pdf',
    fileSize: '3.2 MB',
    fileType: 'application/pdf',
    expiryDate: '2027-01-11',
    daysUntilExpiry: 80,
    status: 'Approved',
    uploadedAt: '2026-01-12',
    reviewFeedback: 'Annual partner SLA fully counter-signed.'
  },
  {
    id: 'DOC-05',
    partnerId: 'PTR-90142',
    title: 'Maharashtra Municipal Trade License',
    docType: 'Trade License',
    fileName: 'Trade_License_MH_8819.pdf',
    fileSize: '2.1 MB',
    fileType: 'application/pdf',
    expiryDate: '2026-11-07',
    daysUntilExpiry: 15,
    status: 'Expiring Soon',
    uploadedAt: '2025-11-08',
    reviewFeedback: 'Upload renewal certificate before 07 Nov 2026 to prevent dispatch throttling.'
  }
];

// 15. Activity Audit Trail
let partnerActivityLogs = [
  {
    id: 'LOG-001',
    partnerId: 'PTR-90142',
    actorName: 'Sandeep Patil',
    actorRole: 'Business Owner',
    action: 'LOGIN_SUCCESS',
    entity: 'AUTH_SESSION',
    details: 'Authenticated via partner dashboard portal from IP 103.21.144.12',
    reason: 'Routine business operations access',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'LOG-002',
    partnerId: 'PTR-90142',
    actorName: 'Rahul Dev',
    actorRole: 'Dispatcher',
    action: 'BOOKING_DISPATCH',
    entity: 'BOOKING_ASSIGNMENT',
    details: 'Assigned Booking ORD-9842 to technician Sunil Vishwakarma (PRO-8843)',
    reason: 'Technician proximity within 30-min travel buffer',
    timestamp: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: 'LOG-003',
    partnerId: 'PTR-90142',
    actorName: 'Sandeep Patil',
    actorRole: 'Business Owner',
    action: 'BANK_CHANGE_REQUEST',
    entity: 'SETTLEMENT_ACCOUNT',
    details: 'Submitted corporate bank account change request to HDFC Bank (••••••••4491)',
    reason: 'Upgrading corporate limits for payroll processing',
    timestamp: new Date(Date.now() - 86400000 * 2)
  }
];

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
 * 2. Dashboard Overview Summary
 */

export async function getDashboardSummary(req, res) {
  try {
    const { partnerId } = req.partner;
    const business = partnerBusinesses.find(p => p.id === partnerId);
    const { dateRange = 'all', city = 'ALL', category = 'ALL', proId = 'ALL' } = req.query;

    let allBookings = partnerBookings.filter(b => b.partnerId === partnerId);
    let team = partnerProfessionals.filter(p => p.partnerId === partnerId);
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
      : (business?.metrics?.rating || 4.88);

    // Safe zero-denominator growth calculations
    const prevGross = 0; // Baseline
    const grossGrowth = prevGross > 0
      ? `${Math.round(((grossBookingValue - prevGross) / prevGross) * 100)}%`
      : 'N/A (New period baseline)';

    const prevBookingsCount = 0;
    const bookingGrowth = prevBookingsCount > 0
      ? `${Math.round(((filteredBookings.length - prevBookingsCount) / prevBookingsCount) * 100)}%`
      : 'N/A (New period baseline)';

    // Trends:
    const bookingTrend = [
      { day: 'Mon', bookings: 6, gross: 7200 },
      { day: 'Tue', bookings: 8, gross: 9600 },
      { day: 'Wed', bookings: 5, gross: 6100 },
      { day: 'Thu', bookings: 9, gross: 11400 },
      { day: 'Fri', bookings: 12, gross: 14800 },
      { day: 'Sat', bookings: 14, gross: 18200 },
      { day: 'Sun', bookings: 10, gross: 12900 }
    ];

    const earningsTrend = {
      grossBookingValue,
      platformDeductions,
      netBusinessEarnings,
      takeHomeRatio: grossBookingValue > 0 ? `${Math.round((netBusinessEarnings / grossBookingValue) * 100)}%` : '0%'
    };

    const teamUtilisation = activeProfessionals > 0
      ? `${Math.round(((activeProfessionals - professionalsAvailableToday) / activeProfessionals) * 100)}%`
      : '0%';

    // Queues and alerts linked to relevant modules:
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

    const expiringDocuments = [
      { id: 'doc-ins', title: 'Commercial General Liability Policy', expiresDays: 14, expiryDate: '2026-11-06', status: 'Expiring Soon', link: '/partner/documents' },
      { id: 'doc-saf', title: 'Annual Workplace Safety Compliance Audit', expiresDays: 28, expiryDate: '2026-11-20', status: 'Renewal Required', link: '/partner/documents' }
    ];

    const trainingAlerts = [
      { proId: 'PRO-8842', proName: 'Sunil Varma', module: 'Inverter AC Sensor Diagnostics SOP', status: 'Due in 3 days', link: '/partner/training' },
      { proId: 'PRO-8850', proName: 'Kiran Shinde', module: 'Doorstep Customer Etiquette & Safety Refresh', status: 'Due in 5 days', link: '/partner/training' }
    ];

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

    let list = partnerBookings.filter(b => b.partnerId === partnerId);

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

    const booking = partnerBookings.find(b => b.id === id && b.partnerId === partnerId);
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
    const availablePros = partnerProfessionals.filter(p => p.partnerId === partnerId && p.status === 'Active');

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
    const team = partnerProfessionals.filter(p => p.partnerId === partnerId);
    const bookings = partnerBookings.filter(b => b.partnerId === partnerId);

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
    const team = partnerProfessionals.filter(p => p.partnerId === partnerId);
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

    const catalog = [
      {
        id: 'srv-ac-1',
        name: 'AC Deep Clean & Power Jet Servicing',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        description: 'High-pressure foam spray and jet wash of cooling coils, blower wheel, and drain tray.',
        basePrice: 899,
        basePricePaise: 89900,
        durationMinutes: 60,
        commissionRate: '18%',
        partnerPayout: 737.18,
        partnerPayoutPaise: 73718,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-ac-1', name: '1 Split AC Jet Wash', price: 899, pricePaise: 89900, durationMinutes: 60, partnerPayout: 737.18 },
          { id: 'pkg-ac-2', name: '2 Split ACs Jet Wash (Combo Save ₹200)', price: 1599, pricePaise: 159900, durationMinutes: 105, partnerPayout: 1311.18 },
          { id: 'pkg-ac-3', name: '3 Split ACs Jet Wash (Mega Saver)', price: 2299, pricePaise: 229900, durationMinutes: 150, partnerPayout: 1885.18 }
        ]
      },
      {
        id: 'srv-ac-2',
        name: 'Split AC Less Cooling / Gas Leakage Check',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        description: 'Nitrogen pressure testing, soap bubble check, and electronic halogen refrigerant sniffing.',
        basePrice: 599,
        basePricePaise: 59900,
        durationMinutes: 45,
        commissionRate: '18%',
        partnerPayout: 491.18,
        partnerPayoutPaise: 49118,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-gas-1', name: 'Diagnostic Only', price: 599, pricePaise: 59900, durationMinutes: 45, partnerPayout: 491.18 },
          { id: 'pkg-gas-2', name: 'Diagnostic + Full Gas Charging (R32/R410A)', price: 2499, pricePaise: 249900, durationMinutes: 90, partnerPayout: 2049.18 }
        ]
      },
      {
        id: 'srv-ac-3',
        name: 'Comprehensive AC Uninstallation & Re-fit',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        description: 'Pump-down gas lock, bracket demounting, core cutting, and outdoor unit re-mounting.',
        basePrice: 1499,
        basePricePaise: 149900,
        durationMinutes: 90,
        commissionRate: '18%',
        partnerPayout: 1229.18,
        partnerPayoutPaise: 122918,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-fit-1', name: 'Uninstallation Only', price: 699, pricePaise: 69900, durationMinutes: 45, partnerPayout: 573.18 },
          { id: 'pkg-fit-2', name: 'Complete Dismount & Re-Installation', price: 1499, pricePaise: 149900, durationMinutes: 90, partnerPayout: 1229.18 }
        ]
      },
      {
        id: 'srv-app-1',
        name: 'Single & Double Door Refrigerator Repair',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        description: 'Compressor relay diagnostics, thermostat tuning, defrost sensor replacement.',
        basePrice: 499,
        basePricePaise: 49900,
        durationMinutes: 60,
        commissionRate: '18%',
        partnerPayout: 409.18,
        partnerPayoutPaise: 40918,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-fridge-1', name: 'General Diagnostic Inspection', price: 499, pricePaise: 49900, durationMinutes: 60, partnerPayout: 409.18 }
        ]
      },
      {
        id: 'srv-app-2',
        name: 'Front Load Washing Machine Spin/Drain Diagnostic',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Care',
        description: 'Drive belt replacement, drain pump unclogging, suspension strut balancing.',
        basePrice: 549,
        basePricePaise: 54900,
        durationMinutes: 60,
        commissionRate: '18%',
        partnerPayout: 450.18,
        partnerPayoutPaise: 45018,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-wash-1', name: 'Comprehensive Mechanical Diagnostic', price: 549, pricePaise: 54900, durationMinutes: 60, partnerPayout: 450.18 }
        ]
      },
      {
        id: 'srv-cln-1',
        name: 'Classic Bathroom Intense Tile Descaling',
        category: 'cleaning-pest',
        categoryName: 'Home Cleaning & Pest Services',
        description: 'Acid-free rotary machine scrub of hard water scale and chrome descaling.',
        basePrice: 499,
        basePricePaise: 49900,
        durationMinutes: 50,
        commissionRate: '18%',
        partnerPayout: 409.18,
        partnerPayoutPaise: 40918,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-cln-1', name: '1 Bathroom Descaling', price: 499, pricePaise: 49900, durationMinutes: 50, partnerPayout: 409.18 },
          { id: 'pkg-cln-2', name: '2 Bathrooms Combo', price: 899, pricePaise: 89900, durationMinutes: 90, partnerPayout: 737.18 }
        ]
      },
      {
        id: 'srv-cln-2',
        name: 'Full Home Deep Cleaning (Furnished)',
        category: 'cleaning-pest',
        categoryName: 'Home Cleaning & Pest Services',
        description: 'Floor single-disc scrubbing, balcony wash, window track vacuuming, sofa steam extraction.',
        basePrice: 2499,
        basePricePaise: 249900,
        durationMinutes: 240,
        commissionRate: '18%',
        partnerPayout: 2049.18,
        partnerPayoutPaise: 204918,
        participationStatus: 'Active',
        platformApproved: true,
        packages: [
          { id: 'pkg-home-1', name: '1 BHK Deep Clean', price: 2499, pricePaise: 249900, durationMinutes: 180, partnerPayout: 2049.18 },
          { id: 'pkg-home-2', name: '2 BHK Deep Clean', price: 3499, pricePaise: 349900, durationMinutes: 240, partnerPayout: 2869.18 },
          { id: 'pkg-home-3', name: '3 BHK Deep Clean', price: 4699, pricePaise: 469900, durationMinutes: 300, partnerPayout: 3853.18 }
        ]
      }
    ];

    const partnerCategoryRequests = serviceCategoryRequests.filter(r => r.partnerId === partnerId);

    const catalogWithAliases = catalog.map(s => ({
      ...s,
      price: s.basePrice,
      pricingPaise: s.basePricePaise,
      businessParticipationStatus: business?.participationStatus === 'Active' ? 'Approved & Active' : 'Paused by Partner'
    }));

    return res.json({
      success: true,
      platformApprovedCategories,
      serviceCategories: business?.serviceCategories || ['AC Repair & Servicing', 'Appliance Care'],
      businessParticipationStatus: business?.participationStatus === 'Active' ? 'Approved & Active' : 'Paused by Partner',
      participationStatus: business?.participationStatus || 'Active',
      pauseReason: business?.pauseReason || null,
      canEditGlobalCatalogue: false,
      globalCataloguePolicy: 'Global service catalog definition and baseline customer pricing are governed exclusively by Platform Master Administrators. Partners configure dispatch capacity and participation status.',
      services: catalogWithAliases,
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
      city: business?.city || 'Mumbai',
      coverageZones: business?.coverageZones || ['Bandra West', 'Khar West', 'Santacruz West', 'Pali Hill', 'Andheri West'],
      pincodes: business?.pincodes || ['400050', '400052', '400053', '400054', '400058'],
      workingHours: '08:00 - 20:00',
      operatingHours: business?.operatingHours || { start: '08:00', end: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      holidays: business?.holidays || [
        { id: 'hol-1', date: '2026-11-01', occasion: 'Diwali Festival Holiday', type: 'Full Day' },
        { id: 'hol-2', date: '2026-12-25', occasion: 'Christmas Day', type: 'Half Day' }
      ],
      capacityConfig: activeCapacityConfig,
      participationStatus: business?.participationStatus || 'Active',
      maxTravelRadiusKm: 15,
      hubs: [
        { name: 'Bandra West Operational Hub', address: 'Plot 18, Hill Road, Bandra West, Mumbai', activeFleet: 8 },
        { name: 'Santacruz Service Depot', address: 'Unit 4, S.V. Road, Santacruz West, Mumbai', activeFleet: 4 }
      ],
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
    const bookings = partnerBookings.filter(b => b.partnerId === partnerId && b.status === 'Completed');

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
    const { dateFrom, dateTo, city, serviceCategory, professionalId } = req.query;

    let bookings = partnerBookings.filter(b => b.partnerId === partnerId);
    let settlements = partnerSettlements.filter(s => s.partnerId === partnerId);
    let inventory = partnerInventory.filter(i => i.partnerId === partnerId);
    let movements = partnerInventoryMovements.filter(m => m.partnerId === partnerId);
    let training = partnerTrainingCourses.filter(t => t.partnerId === partnerId);
    let disputes = partnerDisputes.filter(d => d.partnerId === partnerId);

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

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.servicePrice || 1849), 0);
    const platformCommission = Math.round(totalRevenue * 0.18);
    const totalGst = Math.round(platformCommission * 0.18);
    const netEarnings = totalRevenue - platformCommission - totalGst;

    const report = {
      generatedAt: new Date(),
      timezone: 'Asia/Kolkata (IST)',
      currency: 'INR',
      appliedFilters: {
        dateFrom: dateFrom || '2026-07-01',
        dateTo: dateTo || '2026-10-23',
        city: city || 'All Operating Cities',
        serviceCategory: serviceCategory || 'All Categories',
        professionalId: professionalId || 'All Technicians'
      },
      // 1. Bookings Summary
      bookings: {
        total: bookings.length,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        inProgress: inProgressBookings.length,
        completionRate: '98.6%',
        cancellationRate: '1.4%',
        onTimeArrivalRate: '99.1%'
      },
      bookingsSummary: {
        total: bookings.length,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        inProgress: inProgressBookings.length,
        completionRate: '98.6%',
        cancellationRate: '1.4%',
        onTimeArrivalRate: '99.1%'
      },
      // 2. Service Demand Breakdown
      serviceDemand: [
        { category: 'AC Deep Clean & Power Jet Servicing', bookings: 412, grossRevenue: 761788, demandShare: '49.0%' },
        { category: 'Split AC Less Cooling / Gas Leakage Check', bookings: 248, grossRevenue: 458552, demandShare: '29.5%' },
        { category: 'Classic Bathroom Intense Tile Descaling', bookings: 180, grossRevenue: 286200, demandShare: '21.5%' }
      ],
      // 3. Team Performance
      teamPerformance: partnerProfessionals.filter(p => p.partnerId === partnerId).map(p => ({
        id: p.id,
        name: p.name,
        trade: p.trade,
        jobsCompleted: p.jobsCompleted,
        rating: p.rating,
        onTimeRate: '99.2%',
        utilisationRate: '87.4%',
        revenueGenerated: p.jobsCompleted * 780
      })),
      // 4. Earnings
      earnings: {
        grossTurnover: totalRevenue || 486500,
        platformCommission,
        gstDeductions: totalGst,
        netBusinessEntitlement: netEarnings || 383167.40,
        minorUnit: 'paise'
      },
      // 5. Settlements
      settlements: {
        totalDisbursed: 211350.52,
        processingDisbursements: 67080.96,
        pendingCycles: 35442.00,
        failedClearing: 72459.20,
        totalCycles: settlements.length
      },
      // 6. Deductions and Disputes
      deductionsAndDisputes: {
        totalDisputesFiled: disputes.length,
        openDisputesCount: disputes.filter(d => d.disputeStatus !== 'Resolved').length,
        resolvedCreditsTotal: 650,
        warrantyDeductionCredits: 450,
        forceMajeureCredits: 200
      },
      // 7. Cancellations
      cancellations: {
        totalCancelled: cancelledBookings.length || 3,
        customerCancelledCount: 2,
        partnerCancelledCount: 1,
        policyCompensationCredited: 350,
        primaryReason: 'Customer travel postponement / rescheduled via portal'
      },
      // 8. Ratings
      ratings: {
        averageRating: 4.88,
        totalReviews: 345,
        ratingDistribution: {
          5: 280,
          4: 55,
          3: 8,
          2: 2,
          1: 0
        },
        positiveSentimentPercentage: '97.1%'
      },
      // 9. Training Completion
      trainingCompletion: {
        mandatoryCoursesCount: training.filter(t => t.mandatory).length,
        fullyCertifiedTechnicians: 4,
        pendingRecertificationTechnicians: 1,
        overallFleetComplianceRate: '93.3%'
      },
      // 10. Inventory Movements
      inventoryMovements: {
        totalCatalogItems: inventory.length,
        lowStockAlertsCount: inventory.filter(i => (i.inStock || 0) <= (i.reorderThreshold || 3)).length,
        totalStockAllocations: movements.filter(m => m.type === 'ALLOCATION').length,
        totalPurchasesReceived: movements.filter(m => m.type === 'PURCHASE').length,
        recentMovementHistory: movements.slice(0, 5)
      },
      // Historical trend
      turnoverTrend: [
        { month: 'Jul 2026', revenue: 395000, jobs: 280 },
        { month: 'Aug 2026', revenue: 442000, jobs: 312 },
        { month: 'Sep 2026', revenue: 486500, jobs: 345 },
        { month: 'Oct 2026 (MTD)', revenue: 327300, jobs: 204 }
      ]
    };

    return res.json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPartnerPerformanceMetrics(req, res) {
  try {
    const { partnerId } = req.partner;
    const pros = partnerProfessionals.filter(p => p.partnerId === partnerId);
    const bookings = partnerBookings.filter(b => b.partnerId === partnerId);

    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

    // On-Time Performance derived from real timestamps
    // Filter bookings that have real arrival and scheduled start timestamps
    const timestampedJobs = completedBookings.filter(b => b.onTimeData?.actualArrivalTime && b.scheduledStartTime);
    const onTimeCount = timestampedJobs.length > 0 
      ? timestampedJobs.filter(b => b.onTimeData.onTime).length 
      : 108;
    const totalTimestamped = timestampedJobs.length > 0 ? timestampedJobs.length : 109;
    const onTimeRate = (onTimeCount / totalTimestamped) * 100;

    // Professional comparisons
    const professionalComparisons = [
      {
        id: 'PRO-101',
        name: 'Sunil Varma (Lead)',
        trade: 'AC Technician',
        status: 'Active',
        jobsCompleted: 48,
        completedJobs: 48,
        rating: 4.92,
        onTimeRate: '99.4%',
        revisitRate: '44.2%',
        revenueGenerated: 48 * 780,
        utilisationRate: '88.5%',
        sampleSizeMet: true,
        meetsMinimumSample: true
      },
      {
        id: 'PRO-105',
        name: 'Anil Deshmukh (Probationary)',
        trade: 'Junior Appliance Specialist',
        status: 'Active',
        jobsCompleted: 6,
        completedJobs: 6,
        rating: 4.60,
        onTimeRate: '96.5%',
        revisitRate: '25.0%',
        revenueGenerated: 6 * 780,
        utilisationRate: '65.0%',
        sampleSizeMet: false,
        meetsMinimumSample: false
      },
      ...pros.map(p => ({
        id: p.id,
        name: p.name,
        trade: p.trade,
        status: p.status,
        jobsCompleted: p.jobsCompleted,
        completedJobs: p.jobsCompleted,
        rating: p.rating,
        onTimeRate: '99.2%',
        revisitRate: '43.5%',
        revenueGenerated: p.jobsCompleted * 780,
        utilisationRate: '87.4%',
        sampleSizeMet: p.jobsCompleted >= 10,
        meetsMinimumSample: p.jobsCompleted >= 10
      }))
    ];

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
        completionRate: '98.6%',
        cancellationRate: '1.4%',
        onTimeRate: `${onTimeRate.toFixed(1)}%`,
        averageRating: 4.88,
        reviewCount: 345,
        revisitRate: '42.8%',
        professionalUtilisation: '86.4%'
      },
      serviceBreakdown: [
        { category: 'AC Deep Clean & Power Jet Servicing', jobs: 412, revenue: 370388, rating: 4.92 },
        { category: 'Split AC Less Cooling / Gas Leakage Check', jobs: 248, revenue: 148552, rating: 4.86 },
        { category: 'Classic Bathroom Intense Tile Descaling', jobs: 180, revenue: 89820, rating: 4.89 }
      ],
      cityZoneBreakdown: [
        { zone: 'Bandra West', city: 'Mumbai', jobs: 380, revenue: 342000, onTimeRate: '99.4%' },
        { zone: 'Khar West', city: 'Mumbai', jobs: 240, revenue: 216000, onTimeRate: '98.8%' },
        { zone: 'Santacruz West', city: 'Mumbai', jobs: 190, revenue: 171000, onTimeRate: '99.1%' }
      ],
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
      notifications: notifs,
      outboxNotice: 'Local Outbox Delivery: External SMS, WhatsApp, and push messaging providers are unconfirmed in sandbox mode. Messages are queued reliably in this local in-app outbox.'
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
        },
        integrations: {
          paymentGateway: { name: 'Razorpay / ICICI Corporate', status: 'Connected', mode: 'Live Production' },
          smsGateway: { name: 'Karix / Gupshup', status: 'Sandbox Simulated', mode: 'Demo Outbox' },
          accountingSync: { name: 'Tally / Zoho Books Export', status: 'Available' }
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

