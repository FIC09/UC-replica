import { WorkerApplication } from '../models/WorkerApplication.js';
import { Booking } from '../models/Booking.js';

let mockProfessionals = [
  {
    id: 'PRO-8841',
    _id: 'PRO-8841',
    applicantName: 'Vikram Salvi',
    phone: '+91 98205 11982',
    email: 'vikram.salvi@urbanpro.com',
    avatar: 'VS',
    trade: 'Master AC Specialist & Electrician',
    tradeName: 'AC & Electrical Repairs',
    categories: ['AC Repair', 'Electrical', 'Appliances'],
    skills: ['Inverter Split AC', 'Powerjet Coil Cleaning', 'Gas Leak Detection', 'PCB Circuit Diagnosis'],
    experience: '8+ years',
    city: 'Mumbai',
    locality: 'Bandra West',
    operationalHub: 'Bandra West Central Hub',
    serviceAreas: ['Bandra West', 'Khar', 'Santacruz West', 'Pali Hill'],
    status: 'Approved',
    tier: 'Diamond Pro Partner (Level 5)',
    employmentType: 'Direct Freelance',
    partnerAgencyName: '',
    rating: 4.94,
    jobsCompleted: 1520,
    cancellationRate: 0.6,
    revisitRate: 0.4,
    onTimeArrivalRate: 99.2,
    walletBalance: 15450,
    lifetimeEarnings: 428000,
    documents: {
      aadhaar: { docNumber: 'XXXX-XXXX-8921', docType: 'Aadhaar Card', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: '12 Jan 2026' },
      pan: { docNumber: 'ABCPS8921K', docType: 'PAN Card', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: '12 Jan 2026' },
      policeClearance: { docType: 'Police Verification Clearance', status: 'Verified', verifiedBy: 'Priya S.', verifiedAt: '15 Jan 2026' },
      tradeCertificate: { docType: 'Govt ITI HVAC Technician Diploma', certificateName: 'National Trade Certificate', status: 'Verified', verifiedBy: 'Ops Lead', verifiedAt: '15 Jan 2026' }
    },
    bankDetails: {
      accountHolderName: 'Vikram Salvi',
      accountNumber: '••••••••4821',
      ifscCode: 'HDFC0001248',
      bankName: 'HDFC Bank',
      upiId: 'vikramsalvi@okaxis',
      status: 'Verified',
      verifiedBy: 'Finance Manager',
      verifiedAt: '16 Jan 2026'
    },
    workingHours: { start: '08:00', end: '20:00' },
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    leaves: [
      { id: 'lv-1', date: '28 Oct 2026', reason: 'Family function', status: 'Approved' }
    ],
    trainings: [
      { id: 'TRN-101', title: '6-Step Safety Protocol SOP', completedAt: '16 Jan 2026', score: '98%', badgeAwarded: 'Zero-Contamination Pro' },
      { id: 'TRN-102', title: 'Powerjet AC Cleaning Certification', completedAt: '18 Jan 2026', score: '95%', badgeAwarded: 'Master HVAC Pro' }
    ],
    settlements: [
      { id: 'PO-301', amount: 15450, period: '15 Oct - 21 Oct 2026', status: 'Ready for Release', batchId: 'BATCH-W42' }
    ],
    internalNotes: [
      { id: 'n1', note: 'Top performing technician with 99.2% on-time SLA compliance.', author: 'Priya S.', authorRole: 'Ops Lead', createdAt: new Date() }
    ]
  },
  {
    id: 'PRO-8842',
    _id: 'PRO-8842',
    applicantName: 'Rajesh Kumar',
    phone: '+91 98201 44521',
    email: 'rajesh.kumar@urbanpro.com',
    avatar: 'RK',
    trade: 'Appliance Repair Lead',
    tradeName: 'Refrigerator & Washing Machine',
    categories: ['Refrigerator', 'Washing Machine', 'Microwave'],
    skills: ['Compressor Replacement', 'Inverter PCB Soldering', 'Drain Pump Clearing'],
    experience: '6 years',
    city: 'Mumbai',
    locality: 'Andheri East',
    operationalHub: 'Andheri Central Logistics Depot',
    serviceAreas: ['Andheri East', 'Andheri West', 'Juhu', 'Vile Parle'],
    status: 'Approved',
    tier: 'Platinum Pro (Level 4)',
    employmentType: 'Direct Freelance',
    rating: 4.88,
    jobsCompleted: 980,
    cancellationRate: 1.1,
    revisitRate: 0.9,
    onTimeArrivalRate: 98.1,
    walletBalance: 8200,
    lifetimeEarnings: 298000,
    documents: {
      aadhaar: { docNumber: 'XXXX-XXXX-4412', docType: 'Aadhaar Card', status: 'Verified', verifiedBy: 'Ops Lead' },
      pan: { docNumber: 'BJKPK4412M', docType: 'PAN Card', status: 'Verified', verifiedBy: 'Ops Lead' },
      policeClearance: { docType: 'Police Verification Clearance', status: 'Verified', verifiedBy: 'Priya S.' },
      tradeCertificate: { docType: 'Appliance Repair Certification', status: 'Verified', verifiedBy: 'Ops Lead' }
    },
    bankDetails: {
      accountHolderName: 'Rajesh Kumar',
      accountNumber: '••••••••1120',
      ifscCode: 'ICIC0000104',
      bankName: 'ICICI Bank',
      upiId: 'rajesh.kumar@okaxis',
      status: 'Verified'
    },
    workingHours: { start: '08:30', end: '19:30' },
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    leaves: [],
    trainings: [
      { id: 'TRN-101', title: '6-Step Safety Protocol SOP', completedAt: '04 Feb 2026', score: '92%', badgeAwarded: 'Verified Safety Pro' }
    ],
    settlements: [],
    internalNotes: []
  },
  {
    id: 'PRO-8843',
    _id: 'PRO-8843',
    applicantName: 'Sunil Vishwakarma',
    phone: '+91 98332 10984',
    email: 'sunil.v@urbanpro.com',
    avatar: 'SV',
    trade: 'Cleaning & Housekeeping Specialist',
    tradeName: 'Deep Cleaning Services',
    categories: ['Deep Cleaning', 'Bathroom Cleaning', 'Sofa & Carpet'],
    skills: ['Industrial Single-Disc Scrubbing', 'Foam Shampooing', 'Acid-Free Tile Descaling'],
    experience: '5 years',
    city: 'Mumbai',
    locality: 'Pali Hill',
    operationalHub: 'Bandra West Central Hub',
    serviceAreas: ['Bandra', 'Khar', 'Santacruz'],
    status: 'Approved',
    tier: 'Gold Pro (Level 3)',
    employmentType: 'Agency Employed',
    partnerAgencyId: 'PTR-90142',
    partnerAgencyName: 'Apex Home Solutions LLP',
    rating: 4.91,
    jobsCompleted: 640,
    cancellationRate: 0.8,
    revisitRate: 0.5,
    onTimeArrivalRate: 98.7,
    walletBalance: 6100,
    lifetimeEarnings: 184000,
    documents: {
      aadhaar: { docNumber: 'XXXX-XXXX-9901', docType: 'Aadhaar Card', status: 'Verified' },
      pan: { docNumber: 'CLKPV9901L', docType: 'PAN Card', status: 'Verified' },
      policeClearance: { docType: 'Police Verification Clearance', status: 'Verified' },
      tradeCertificate: { docType: 'Professional Cleaning Diploma', status: 'Verified' }
    },
    bankDetails: {
      accountHolderName: 'Apex Home Solutions LLP (Corporate Payroll)',
      accountNumber: '••••••••9012',
      ifscCode: 'ICIC0000002',
      bankName: 'ICICI Bank',
      status: 'Verified'
    },
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    leaves: [],
    trainings: [],
    settlements: [],
    internalNotes: []
  },
  {
    id: 'PRO-8844',
    _id: 'PRO-8844',
    applicantName: 'Anita Deshmukh',
    phone: '+91 98190 55432',
    email: 'anita.d@urbanpro.com',
    avatar: 'AD',
    trade: 'Master Beautician & Hair Stylist',
    tradeName: 'Salon & Spa Services',
    categories: ['Salon for Women', 'Hair Studio', 'Waxing & Facials'],
    skills: ['L\'Oréal Inoa Hair Coloring', 'O3+ Diamond Facial', 'Rica Brazilian Waxing'],
    experience: '9 years',
    city: 'Mumbai',
    locality: 'Powai',
    operationalHub: 'Powai Technology Zone Depot',
    serviceAreas: ['Powai', 'Chandivali', 'Vikhroli'],
    status: 'Approved',
    tier: 'Diamond Pro Partner (Level 5)',
    employmentType: 'Direct Freelance',
    rating: 4.96,
    jobsCompleted: 2150,
    cancellationRate: 0.4,
    revisitRate: 0.2,
    onTimeArrivalRate: 99.4,
    walletBalance: 22800,
    lifetimeEarnings: 590000,
    documents: {
      aadhaar: { docNumber: 'XXXX-XXXX-1102', docType: 'Aadhaar Card', status: 'Verified' },
      pan: { docNumber: 'DFGPD1102P', docType: 'PAN Card', status: 'Verified' },
      policeClearance: { docType: 'Police Verification Clearance', status: 'Verified' },
      tradeCertificate: { docType: 'CIDESCO International Cosmetology License', status: 'Verified' }
    },
    bankDetails: {
      accountHolderName: 'Anita Deshmukh',
      accountNumber: '••••••••1194',
      ifscCode: 'SBIN0000301',
      bankName: 'State Bank of India',
      status: 'Verified'
    },
    workingHours: { start: '08:00', end: '20:00' },
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    leaves: [],
    trainings: [],
    settlements: [],
    internalNotes: []
  },
  {
    id: 'PRO-8845',
    _id: 'PRO-8845',
    applicantName: 'Karthik Raja',
    phone: '+91 98401 22334',
    email: 'karthik.r@urbanpro.com',
    avatar: 'KR',
    trade: 'Plumber & Water Purifier RO Technician',
    tradeName: 'Plumbing & RO Services',
    categories: ['Plumbing', 'Water Purifier', 'Drainage'],
    skills: ['Concealed Pipe Welding', 'Native RO Membrane Replacement', 'Pressure Pump Fix'],
    experience: '2 years',
    city: 'Krishnagiri',
    locality: 'Gandhi Nagar',
    operationalHub: 'Krishnagiri Central Depot',
    serviceAreas: ['Gandhi Nagar', 'Rayakottai Road', 'Old Pet'],
    status: 'Under Verification',
    tier: 'Silver Pro (Level 2)',
    employmentType: 'Direct Freelance',
    rating: 4.75,
    jobsCompleted: 310,
    cancellationRate: 2.1,
    revisitRate: 1.4,
    onTimeArrivalRate: 96.5,
    walletBalance: 3200,
    lifetimeEarnings: 84000,
    documents: {
      aadhaar: { docNumber: 'XXXX-XXXX-7721', docType: 'Aadhaar Card', status: 'Verified', verifiedBy: 'Priya S.' },
      pan: { docNumber: 'GHKPR7721N', docType: 'PAN Card', status: 'Verified', verifiedBy: 'Priya S.' },
      policeClearance: { docType: 'Police Verification Clearance', status: 'Pending', rejectionReason: 'Awaiting local superintendent seal' },
      tradeCertificate: { docType: 'Plumber NCVT Certificate', status: 'Pending' }
    },
    bankDetails: {
      accountHolderName: 'Karthik Raja',
      accountNumber: '••••••••3319',
      ifscCode: 'IOBA0001004',
      bankName: 'Indian Overseas Bank',
      status: 'Pending Review'
    },
    workingHours: { start: '09:00', end: '19:00' },
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    leaves: [],
    trainings: [],
    settlements: [],
    internalNotes: [
      { id: 'n3', note: 'Police clearance certificate upload requires stamp re-verification.', author: 'Priya S.', authorRole: 'Ops Lead', createdAt: new Date() }
    ]
  }
];

// 1. Get Professionals with Search, Trade, Status, City, and Partner Filters
export async function getProfessionals(req, res) {
  try {
    const { search = '', trade = 'ALL', status = 'ALL', city = 'ALL', partner = 'ALL', page = 1, limit = 10 } = req.query;

    let dbWorkers = [];
    try {
      dbWorkers = await WorkerApplication.find().sort({ createdAt: -1 }).lean();
    } catch {}

    const mappedDbWorkers = dbWorkers.map(w => ({
      id: w.id || w._id.toString(),
      _id: w.id || w._id.toString(),
      applicantName: w.applicantName,
      phone: w.phone,
      email: w.email || `${(w.applicantName || 'worker').toLowerCase().replace(/\s+/g, '.')}@urbanpro.com`,
      avatar: w.avatar || (w.applicantName ? w.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'WR'),
      trade: w.tradeName || w.trade,
      tradeName: w.tradeName || w.trade,
      categories: w.categories && w.categories.length > 0 ? w.categories : [w.tradeName || w.trade],
      skills: w.skills && w.skills.length > 0 ? w.skills : ['Verified Service Specialist'],
      experience: w.experience || '2 years',
      city: w.city || 'Mumbai',
      locality: w.locality || 'Mumbai Metro',
      operationalHub: w.operationalHub || 'Central Logistics Hub',
      serviceAreas: w.serviceAreas && w.serviceAreas.length > 0 ? w.serviceAreas : [w.locality || 'Mumbai'],
      status: w.status || 'Pending Review',
      tier: w.tier || 'New Professional',
      employmentType: w.employmentType || 'Direct Freelance',
      partnerAgencyName: w.partnerAgencyName || '',
      rating: w.rating || 5.0,
      jobsCompleted: w.jobsCompleted || 0,
      cancellationRate: w.cancellationRate || 0,
      revisitRate: w.revisitRate || 0,
      onTimeArrivalRate: w.onTimeArrivalRate || 100,
      walletBalance: w.walletBalance || 0,
      lifetimeEarnings: w.lifetimeEarnings || 0,
      documents: w.documents || {
        aadhaar: { docNumber: w.aadhaarNumber || 'Pending Upload', docType: 'Aadhaar Card', status: 'Pending Review' },
        pan: { docNumber: 'Pending Upload', docType: 'PAN Card', status: 'Pending Review' },
        policeClearance: { docType: 'Police Verification Clearance', status: 'Pending Review' },
        tradeCertificate: { docType: 'Skill Certification', status: 'Pending Review' }
      },
      bankDetails: w.bankDetails || {
        accountHolderName: w.applicantName,
        accountNumber: '••••••••1234',
        ifscCode: 'HDFC0001248',
        bankName: 'HDFC Bank',
        status: 'Pending Review'
      },
      workingHours: w.workingHours || { start: '08:00', end: '20:00' },
      workingDays: w.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      leaves: w.leaves || [],
      trainings: w.trainings || [],
      settlements: w.settlements || [],
      internalNotes: w.internalNotes || []
    }));

    const existingIds = new Set(mappedDbWorkers.map(x => x.id));
    const nonDuplicatedMocks = mockProfessionals.filter(m => !existingIds.has(m.id));
    const list = [...mappedDbWorkers, ...nonDuplicatedMocks];

    // Filter
    let filtered = list.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        const matches = (p.applicantName || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q) ||
          (p.trade || '').toLowerCase().includes(q) ||
          (p.locality || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (trade !== 'ALL' && !p.trade.toLowerCase().includes(trade.toLowerCase())) return false;
      if (status !== 'ALL') {
        const matchStatus = (status === 'Active' || status === 'Approved') ? ['Active', 'Approved'] : [status];
        if (!matchStatus.includes(p.status)) return false;
      }
      if (city !== 'ALL' && (p.city || '').toLowerCase() !== city.toLowerCase()) return false;
      if (partner !== 'ALL') {
        if (partner === 'direct' && p.employmentType !== 'Direct Freelance') return false;
        if (partner === 'agency' && p.employmentType !== 'Agency Employed') return false;
      }
      return true;
    });

    // Pagination
    const total = filtered.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      professionals: paginated,
      pagination: { total, page: pageNum, limit: limitNum, totalPages }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get Professional Profile Detail
export async function getProfessionalDetail(req, res) {
  try {
    const { id } = req.params;

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id }).lean();
    } catch {}

    if (!worker) {
      worker = mockProfessionals.find(p => p.id === id || p._id === id);
    }

    if (!worker) {
      return res.status(404).json({ success: false, error: `Professional ${id} not found.` });
    }

    // Linked bookings
    let proBookings = [];
    try {
      proBookings = await Booking.find({
        $or: [
          { 'assignedProfessional.id': id },
          { assignedPartner: worker.applicantName }
        ]
      }).sort({ createdAt: -1 }).limit(10).lean();
    } catch {}

    return res.json({
      success: true,
      professional: worker,
      bookingHistory: proBookings
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Approve, Reject, or Suspend Application / Profile with Mandatory Reason
export async function updateProfessionalStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    if ((status === 'Rejected' || status === 'Suspended') && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'An explicit reason is mandatory when rejecting or suspending a professional.' });
    }

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker) {
        worker.status = status;
        if (status === 'Rejected') worker.rejectionReason = reason.trim();
        if (status === 'Suspended') worker.suspendReason = reason.trim();
        worker.internalNotes.push({
          id: `note-${Date.now()}`,
          note: `Professional status transitioned to '${status}'. Reason: ${reason || 'Application approved by operations lead.'}`,
          author: req.admin?.name || 'Operations Lead',
          authorRole: req.admin?.role || 'Admin',
          createdAt: new Date()
        });
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock) {
      mock.status = status;
      if (status === 'Rejected') mock.rejectionReason = reason?.trim() || '';
      if (status === 'Suspended') mock.suspendReason = reason?.trim() || '';
    }

    return res.json({
      success: true,
      message: `Professional #${id} status updated to '${status}'.`,
      status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Verify or Reject Document (Manual Document Review - Upload does not auto-verify!)
export async function verifyDocument(req, res) {
  try {
    const { id } = req.params;
    const { docType, status, rejectionReason } = req.body; // docType: 'aadhaar', 'pan', 'policeClearance', 'tradeCertificate'

    if (!docType || !status) {
      return res.status(400).json({ success: false, error: 'Document type and verification status are required.' });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required when declining a verification document.' });
    }

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker && worker.documents && worker.documents[docType]) {
        worker.documents[docType].status = status;
        worker.documents[docType].verifiedBy = req.admin?.name || 'Verification Specialist';
        worker.documents[docType].verifiedAt = new Date();
        if (status === 'Rejected') {
          worker.documents[docType].rejectionReason = rejectionReason;
        }
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock && mock.documents && mock.documents[docType]) {
      mock.documents[docType].status = status;
      mock.documents[docType].verifiedBy = req.admin?.name || 'Verification Specialist';
      mock.documents[docType].verifiedAt = new Date().toLocaleDateString();
      if (status === 'Rejected') {
        mock.documents[docType].rejectionReason = rejectionReason;
      }
    }

    return res.json({
      success: true,
      message: `Document '${docType}' marked as ${status}.`,
      docType,
      status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Review & Verify Bank Details
export async function verifyBankDetails(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Verification status is required.' });
    }

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker && worker.bankDetails) {
        worker.bankDetails.status = status;
        worker.bankDetails.verifiedBy = req.admin?.name || 'Finance Lead';
        worker.bankDetails.verifiedAt = new Date();
        if (status === 'Rejected') {
          worker.bankDetails.rejectionReason = rejectionReason || 'Bank account details do not match pan/aadhaar name.';
        }
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock && mock.bankDetails) {
      mock.bankDetails.status = status;
      mock.bankDetails.verifiedBy = req.admin?.name || 'Finance Lead';
      mock.bankDetails.verifiedAt = new Date().toLocaleDateString();
      if (status === 'Rejected') {
        mock.bankDetails.rejectionReason = rejectionReason || 'Bank account details do not match pan/aadhaar name.';
      }
    }

    return res.json({
      success: true,
      message: `Bank details for professional #${id} marked as ${status}.`,
      status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Assign Categories, Skills, and Service Areas
export async function assignSkillsAndCoverage(req, res) {
  try {
    const { id } = req.params;
    const { categories, skills, serviceAreas, operationalHub, tier } = req.body;

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker) {
        if (categories) worker.categories = categories;
        if (skills) worker.skills = skills;
        if (serviceAreas) worker.serviceAreas = serviceAreas;
        if (operationalHub) worker.operationalHub = operationalHub;
        if (tier) worker.tier = tier;
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock) {
      if (categories) mock.categories = categories;
      if (skills) mock.skills = skills;
      if (serviceAreas) mock.serviceAreas = serviceAreas;
      if (operationalHub) mock.operationalHub = operationalHub;
      if (tier) mock.tier = tier;
    }

    return res.json({
      success: true,
      message: `Skills, trade categories, and coverage hubs updated for professional #${id}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Schedule Training Module
export async function scheduleTraining(req, res) {
  try {
    const { id } = req.params;
    const { title, category, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Training title is required.' });
    }

    const trainingObj = {
      id: `TRN-${Date.now().toString().slice(-4)}`,
      title,
      category: category || 'SOP & Safety',
      status: 'Scheduled',
      completedAt: null,
      score: 'Pending'
    };

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker) {
        worker.trainings.push(trainingObj);
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock) {
      mock.trainings = mock.trainings || [];
      mock.trainings.push(trainingObj);
    }

    return res.status(201).json({
      success: true,
      message: `Training module '${title}' assigned to professional #${id}.`,
      training: trainingObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 8. Request Corrected Information (Correction Request Notice)
export async function requestInformationCorrection(req, res) {
  try {
    const { id } = req.params;
    const { correctionNotes } = req.body;

    if (!correctionNotes) {
      return res.status(400).json({ success: false, error: 'Correction requirements are mandatory.' });
    }

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker) {
        worker.status = 'Under Verification';
        worker.correctionRequestReason = correctionNotes;
        worker.internalNotes.push({
          id: `note-${Date.now()}`,
          note: `Correction notice dispatched to professional: ${correctionNotes}`,
          author: req.admin?.name || 'Onboarding Lead',
          authorRole: 'Admin',
          createdAt: new Date()
        });
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock) {
      mock.status = 'Under Verification';
      mock.correctionRequestReason = correctionNotes;
    }

    return res.json({
      success: true,
      message: `Information correction notice dispatched to professional #${id}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 9. Add Internal Note
export async function addProfessionalNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note cannot be empty.' });
    }

    const noteObj = {
      id: `note-${Date.now()}`,
      note: note.trim(),
      author: req.admin?.name || 'Operations Lead',
      authorRole: req.admin?.role || 'Admin',
      createdAt: new Date()
    };

    let worker = null;
    try {
      worker = await WorkerApplication.findOne({ id });
      if (worker) {
        worker.internalNotes.push(noteObj);
        await worker.save();
      }
    } catch {}

    const mock = mockProfessionals.find(p => p.id === id || p._id === id);
    if (mock) {
      mock.internalNotes = mock.internalNotes || [];
      mock.internalNotes.push(noteObj);
    }

    return res.status(201).json({
      success: true,
      message: 'Internal note logged to professional profile.',
      note: noteObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
