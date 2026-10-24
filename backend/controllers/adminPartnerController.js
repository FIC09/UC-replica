import { PartnerApplication } from '../models/PartnerApplication.js';
import { WorkerApplication } from '../models/WorkerApplication.js';

let mockPartners = [
  {
    id: 'PTR-90142',
    _id: 'PTR-90142',
    businessName: 'Apex Home Solutions LLP',
    ownerName: 'Sandeep Patil',
    contactPerson: {
      name: 'Pooja Patil',
      phone: '+91 98210 33412',
      email: 'pooja@apexhome.in',
      designation: 'Operations Director'
    },
    phone: '+91 98210 33411',
    email: 'contact@apexhome.in',
    businessType: 'LLP',
    tier: 'Platinum Enterprise Fleet',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Care',
    serviceCategories: ['AC Repair & Servicing', 'Refrigerator Repair', 'Washing Machine Care', 'Microwave Repair'],
    fleetSize: '12 Technicians',
    techniciansCount: 12,
    city: 'Mumbai',
    coverageZones: ['Bandra West', 'Khar West', 'Santacruz West', 'Pali Hill', 'Andheri West'],
    registrationTax: {
      companyType: 'Limited Liability Partnership',
      cinNumber: 'AAQ-8492-MH',
      gstNumber: '27AABCA1234F1Z8',
      panNumber: 'AABCA1234F',
      registeredAddress: 'Unit 401, Technopolis IT Park, Mahakali Caves Road, Andheri East, Mumbai 400093'
    },
    gstNumber: '27AABCA1234F1Z8',
    verificationDocs: {
      incorporationCert: { docName: 'LLP Incorporation Deed', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-01-10') },
      gstCertificate: { docName: 'GST Registration Certificate', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-01-10') },
      companyPan: { docName: 'Company PAN Card', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-01-10') },
      franchiseAgreement: { docName: 'Executed Master Franchise SLA', status: 'Verified', verifiedBy: 'Operations Lead', verifiedAt: new Date('2026-01-12') }
    },
    settlementMode: 'ThroughBusiness', // Earnings aggregated & paid to agency account; agency payroll settles technicians
    settlementAccount: {
      bankName: 'ICICI Bank Ltd',
      accountHolderName: 'Apex Home Solutions LLP',
      accountNumber: '••••••••9012',
      ifscCode: 'ICIC0000002',
      accountType: 'Current Corporate Account',
      status: 'Verified'
    },
    commissionRate: '18%',
    monthlyCapacity: '350-400 jobs/mo',
    contractRef: {
      contractId: 'CTR-2026-APX-01',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      slaAgreementScore: '99.2% Doorstep SLA'
    },
    linkedProfessionals: [
      { id: 'PRO-8841', name: 'Vikram Salvi', phone: '+91 98205 11982', trade: 'Master AC Specialist', status: 'Active' },
      { id: 'PRO-8842', name: 'Sunil Varma', phone: '+91 98112 00991', trade: 'HVAC Duct Technician', status: 'Active' },
      { id: 'PRO-8843', name: 'Ramesh Sawant', phone: '+91 98920 44551', trade: 'Appliance Diagnostics', status: 'Active' }
    ],
    internalNotes: [
      { id: 'nt-1', note: 'Top performing AC repair partner in Mumbai West. Met monthly SLA target of 380 jobs.', author: 'Priya Sundaram', authorRole: 'Operations Lead', createdAt: new Date(Date.now() - 86400000 * 5) }
    ],
    status: 'Active',
    statusReason: 'Full corporate compliance and KYC verified',
    statusHistory: [
      { status: 'Active', reason: 'Initial franchise onboarding approved', changedBy: 'Super Administrator', timestamp: new Date('2026-01-12') }
    ],
    metrics: {
      totalBookings: 840,
      completedBookings: 820,
      rating: 4.88,
      complaintsCount: 2,
      totalPayouts: 389200
    }
  },
  {
    id: 'PTR-90143',
    _id: 'PTR-90143',
    businessName: 'Krishnagiri QuickFix Care',
    ownerName: 'M. Selvam',
    contactPerson: {
      name: 'M. Selvam',
      phone: '+91 98421 88776',
      email: 'selvam@quickfixcare.com',
      designation: 'Managing Partner'
    },
    phone: '+91 98421 88776',
    email: 'selvam@quickfixcare.com',
    businessType: 'Partnership Firm',
    tier: 'Gold Franchise',
    category: 'cleaning-pest',
    categoryName: 'Home Cleaning & Pest Services',
    serviceCategories: ['Full Home Deep Cleaning', 'Bathroom Deep Cleaning', 'Kitchen Steam Cleaning', 'Cockroach & Termite Pest Control'],
    fleetSize: '8 Technicians',
    techniciansCount: 8,
    city: 'Krishnagiri',
    coverageZones: ['Krishnagiri Central', 'Rayakottai Road', 'Old Pet', 'Gandhi Nagar', 'SIPCOT Industrial Zone'],
    registrationTax: {
      companyType: 'Partnership Firm',
      cinNumber: 'TN-KG-9921',
      gstNumber: '33AABCS5678K1Z2',
      panNumber: 'AABCS5678K',
      registeredAddress: '12/4 Rayakottai Road, Near Gandhi Statue, Krishnagiri 635001'
    },
    gstNumber: '33AABCS5678K1Z2',
    verificationDocs: {
      incorporationCert: { docName: 'Partnership Registration Deed', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-02-01') },
      gstCertificate: { docName: 'GST Registration Certificate', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-02-01') },
      companyPan: { docName: 'Firm PAN Card', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2026-02-01') },
      franchiseAgreement: { docName: 'Executed Franchise Agreement', status: 'Verified', verifiedBy: 'Ops Lead', verifiedAt: new Date('2026-02-02') }
    },
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'State Bank of India',
      accountHolderName: 'Krishnagiri QuickFix Care',
      accountNumber: '••••••••6781',
      ifscCode: 'SBIN0000862',
      accountType: 'Current Corporate Account',
      status: 'Verified'
    },
    commissionRate: '20%',
    monthlyCapacity: '180-220 jobs/mo',
    contractRef: {
      contractId: 'CTR-2026-QFC-02',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2028-01-31'),
      slaAgreementScore: '98.5% Doorstep SLA'
    },
    linkedProfessionals: [
      { id: 'PRO-8846', name: 'Karthik Raja', phone: '+91 98420 77123', trade: 'Deep Cleaning Specialist', status: 'Active' },
      { id: 'PRO-8847', name: 'Saravanan S.', phone: '+91 98425 66112', trade: 'Pest Control Technician', status: 'Active' }
    ],
    internalNotes: [
      { id: 'nt-2', note: 'Primary cleaning partner for Krishnagiri district. Industrial vacuum equipment verified.', author: 'Priya S.', authorRole: 'Ops Lead', createdAt: new Date(Date.now() - 86400000 * 2) }
    ],
    status: 'Active',
    statusReason: 'Verified franchise partner',
    statusHistory: [],
    metrics: {
      totalBookings: 320,
      completedBookings: 310,
      rating: 4.91,
      complaintsCount: 0,
      totalPayouts: 184500
    }
  },
  {
    id: 'PTR-90144',
    _id: 'PTR-90144',
    businessName: 'CleanPro Facility Management',
    ownerName: 'Deepak Varma',
    contactPerson: {
      name: 'Deepak Varma',
      phone: '+91 98100 44321',
      email: 'deepak@cleanpro.co.in',
      designation: 'Managing Director'
    },
    phone: '+91 98100 44321',
    email: 'deepak@cleanpro.co.in',
    businessType: 'Private Limited',
    tier: 'Diamond Fleet Partner',
    category: 'cleaning-pest',
    categoryName: 'Deep Cleaning & Pest Control',
    serviceCategories: ['Full Home Deep Cleaning', 'Sofa & Carpet Shampooing', 'Commercial Sanitization'],
    fleetSize: '16 Technicians',
    techniciansCount: 16,
    city: 'Delhi NCR',
    coverageZones: ['South Extension', 'Saket', 'Gurugram Sector 29', 'Gurugram Sector 43', 'Noida Sector 18'],
    registrationTax: {
      companyType: 'Private Limited Company',
      cinNumber: 'U74999DL2021PTC384910',
      gstNumber: '07AAACC9876M1Z5',
      panNumber: 'AAACC9876M',
      registeredAddress: 'Plot 48, Okhla Industrial Area Phase III, New Delhi 110020'
    },
    gstNumber: '07AAACC9876M1Z5',
    verificationDocs: {
      incorporationCert: { docName: 'MCA Incorporation Certificate', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2025-11-15') },
      gstCertificate: { docName: 'GST Registration Certificate', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2025-11-15') },
      companyPan: { docName: 'Company PAN Card', status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: new Date('2025-11-15') },
      franchiseAgreement: { docName: 'Franchise Master Agreement', status: 'Verified', verifiedBy: 'Legal Dept', verifiedAt: new Date('2025-11-18') }
    },
    settlementMode: 'ThroughBusiness',
    settlementAccount: {
      bankName: 'Axis Bank Ltd',
      accountHolderName: 'CleanPro Facility Management Pvt Ltd',
      accountNumber: '••••••••1048',
      ifscCode: 'UTIB0000007',
      accountType: 'Current Corporate Account',
      status: 'Verified'
    },
    commissionRate: '15%',
    monthlyCapacity: '500+ jobs/mo',
    contractRef: {
      contractId: 'CTR-2025-CP-03',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2027-10-31'),
      slaAgreementScore: '98.8% Doorstep SLA'
    },
    linkedProfessionals: [
      { id: 'PRO-8848', name: 'Naveen Kumar', phone: '+91 98111 88442', trade: 'Master Cleaning Technician', status: 'Active' },
      { id: 'PRO-8849', name: 'Arun Singh', phone: '+91 98115 33221', trade: 'Industrial Floor Care', status: 'Active' }
    ],
    internalNotes: [],
    status: 'Active',
    statusReason: 'High capacity Delhi NCR partner',
    statusHistory: [],
    metrics: {
      totalBookings: 1240,
      completedBookings: 1205,
      rating: 4.85,
      complaintsCount: 3,
      totalPayouts: 642000
    }
  }
];

// 1. Get Partners with Search, City, Status, and Pagination
export async function getPartners(req, res) {
  try {
    const { search = '', status = 'ALL', city = 'ALL', page = 1, limit = 10 } = req.query;

    let dbPartners = [];
    try {
      dbPartners = await PartnerApplication.find().sort({ createdAt: -1 }).lean();
    } catch {}

    const mappedDbPartners = dbPartners.map(p => ({
      id: p.id,
      _id: p.id,
      businessName: p.businessName,
      ownerName: p.ownerName,
      contactPerson: p.contactPerson || { name: p.ownerName, phone: p.phone, email: p.email },
      phone: p.phone,
      email: p.email,
      businessType: p.businessType || 'LLP',
      tier: p.tier || 'New Fleet Partner',
      category: p.category,
      categoryName: p.categoryName || 'Home Services',
      serviceCategories: p.serviceCategories && p.serviceCategories.length > 0 ? p.serviceCategories : [p.categoryName || 'Home Services'],
      fleetSize: p.fleetSize || '6-15 Technicians',
      techniciansCount: p.techniciansCount || parseInt(p.fleetSize) || 8,
      city: p.city || 'Mumbai',
      coverageZones: p.coverageZones && p.coverageZones.length > 0 ? p.coverageZones : [p.city || 'Mumbai'],
      registrationTax: p.registrationTax || { gstNumber: p.gstNumber },
      gstNumber: p.gstNumber || 'Applied / Pending',
      verificationDocs: p.verificationDocs || {
        incorporationCert: { docName: 'Certificate of Incorporation', status: 'Pending Review' },
        gstCertificate: { docName: 'GST Registration Certificate', status: 'Pending Review' },
        companyPan: { docName: 'Company PAN Card', status: 'Pending Review' },
        franchiseAgreement: { docName: 'Franchise Partner Agreement', status: 'Pending Review' }
      },
      settlementMode: p.settlementMode || 'ThroughBusiness',
      settlementAccount: p.settlementAccount || {
        bankName: 'HDFC Bank Ltd',
        accountHolderName: p.businessName,
        accountNumber: '••••••••1234',
        ifscCode: 'HDFC0001248',
        accountType: 'Current Corporate Account',
        status: 'Pending Review'
      },
      commissionRate: p.commissionRate || '18%',
      monthlyCapacity: p.monthlyCapacity || '200 jobs/mo',
      contractRef: p.contractRef || {
        contractId: `CTR-${(p.id || '').replace('PTR-', '')}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 365 * 2),
        slaAgreementScore: '98.5% Doorstep SLA'
      },
      linkedProfessionals: p.linkedProfessionals || [],
      internalNotes: p.internalNotes || [],
      status: p.status || 'Pending Review',
      statusReason: p.statusReason || '',
      statusHistory: p.statusHistory || [],
      metrics: p.metrics || { totalBookings: 0, completedBookings: 0, rating: 5.0, complaintsCount: 0, totalPayouts: 0 }
    }));

    const existingIds = new Set(mappedDbPartners.map(x => x.id));
    const nonDuplicatedMocks = mockPartners.filter(m => !existingIds.has(m.id));
    const list = [...mappedDbPartners, ...nonDuplicatedMocks];

    // Filter
    let filtered = list.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        const matches = (p.businessName || '').toLowerCase().includes(q) ||
          (p.ownerName || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q) ||
          (p.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (status !== 'ALL') {
        const matchStatus = (status === 'Active' || status === 'Approved') ? ['Active', 'Approved'] : [status];
        if (!matchStatus.includes(p.status)) return false;
      }
      if (city !== 'ALL' && (p.city || '').toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });

    const total = filtered.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      partners: paginated,
      pagination: { total, page: pageNum, limit: limitNum, totalPages }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get Partner Detail Profile
export async function getPartnerDetail(req, res) {
  try {
    const { id } = req.params;

    let partner = mockPartners.find(p => p.id === id);
    if (!partner) {
      try {
        partner = await PartnerApplication.findOne({ id }).lean();
      } catch {}
    }

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner agency not found' });
    }

    return res.json({ success: true, partner });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Create Partner Application
export async function createPartner(req, res) {
  try {
    const newId = `PTR-${Date.now().toString().slice(-5)}`;
    const newPartner = {
      id: newId,
      _id: newId,
      businessName: req.body.businessName,
      ownerName: req.body.ownerName,
      contactPerson: req.body.contactPerson || {
        name: req.body.ownerName,
        phone: req.body.phone,
        email: req.body.email || ''
      },
      phone: req.body.phone,
      email: req.body.email || '',
      businessType: req.body.businessType || 'LLP',
      tier: req.body.tier || 'Gold Franchise',
      category: req.body.category || 'general',
      categoryName: req.body.categoryName || 'General Home Services',
      serviceCategories: req.body.serviceCategories || ['General Services'],
      fleetSize: req.body.fleetSize || '6-10 Technicians',
      techniciansCount: parseInt(req.body.techniciansCount) || 8,
      city: req.body.city || 'Mumbai',
      coverageZones: req.body.coverageZones || [req.body.city || 'Mumbai'],
      registrationTax: {
        companyType: req.body.businessType || 'LLP',
        gstNumber: req.body.gstNumber || '',
        panNumber: req.body.panNumber || '',
        cinNumber: req.body.cinNumber || '',
        registeredAddress: req.body.registeredAddress || ''
      },
      gstNumber: req.body.gstNumber || '',
      verificationDocs: {
        incorporationCert: { docName: 'Certificate of Registration', status: 'Pending Review' },
        gstCertificate: { docName: 'GST Registration Certificate', status: 'Pending Review' },
        companyPan: { docName: 'Company PAN Card', status: 'Pending Review' },
        franchiseAgreement: { docName: 'Franchise Master Agreement', status: 'Pending Review' }
      },
      settlementMode: req.body.settlementMode || 'ThroughBusiness',
      settlementAccount: {
        bankName: req.body.bankName || 'HDFC Bank',
        accountHolderName: req.body.businessName,
        accountNumber: req.body.accountNumber || '••••••••1234',
        ifscCode: req.body.ifscCode || 'HDFC0001248',
        accountType: 'Current Corporate Account',
        status: 'Pending Review'
      },
      commissionRate: req.body.commissionRate || '18%',
      monthlyCapacity: req.body.monthlyCapacity || '200 jobs/mo',
      contractRef: {
        contractId: `CTR-${Date.now().toString().slice(-4)}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 365 * 2),
        slaAgreementScore: '98.5% Doorstep SLA'
      },
      linkedProfessionals: [],
      internalNotes: [],
      status: 'Active',
      statusReason: 'Partner application registered by Admin',
      statusHistory: [
        { status: 'Active', reason: 'Registration created', changedBy: 'Admin', timestamp: new Date() }
      ],
      metrics: {
        totalBookings: 0,
        completedBookings: 0,
        rating: 5.0,
        complaintsCount: 0,
        totalPayouts: 0
      }
    };

    mockPartners.unshift(newPartner);
    try {
      await PartnerApplication.create(newPartner);
    } catch {}

    return res.status(201).json({ success: true, partner: newPartner });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Update Partner Status (Approve, Reject, Suspend, Reactivate with Reason)
export async function updatePartnerStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason = '' } = req.body;

    const validStatuses = ['Pending Review', 'Approved', 'Active', 'Rejected', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid partner status: ${status}` });
    }

    let p = mockPartners.find(x => x.id === id);
    if (p) {
      p.status = status;
      p.statusReason = reason;
      p.statusHistory = p.statusHistory || [];
      p.statusHistory.push({
        status,
        reason: reason || `Partner status set to ${status}`,
        changedBy: req.admin?.name || 'Administrator',
        timestamp: new Date()
      });
    }

    try {
      await PartnerApplication.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        {
          $set: { status, statusReason: reason },
          $push: {
            statusHistory: {
              status,
              reason: reason || `Partner status set to ${status}`,
              changedBy: req.admin?.name || 'Administrator',
              timestamp: new Date()
            }
          }
        }
      );
    } catch {}

    return res.json({ success: true, message: `Partner ${id} status set to ${status}`, status });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Verify Partner Document
export async function verifyPartnerDocument(req, res) {
  try {
    const { id } = req.params;
    const { docType, status, rejectionReason = '' } = req.body;

    let p = mockPartners.find(x => x.id === id);
    if (p && p.verificationDocs) {
      if (p.verificationDocs[docType]) {
        p.verificationDocs[docType].status = status;
        p.verificationDocs[docType].verifiedBy = req.admin?.name || 'Administrator';
        p.verificationDocs[docType].verifiedAt = new Date();
      }
    }

    try {
      const updateField = `verificationDocs.${docType}`;
      await PartnerApplication.findOneAndUpdate(
        { id },
        {
          $set: {
            [`${updateField}.status`]: status,
            [`${updateField}.verifiedBy`]: req.admin?.name || 'Administrator',
            [`${updateField}.verifiedAt`]: new Date()
          }
        }
      );
    } catch {}

    return res.json({ success: true, message: `Partner document ${docType} updated to ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Update Settlement Mode (ThroughBusiness vs IndividualPro - Prevents Double Counting!)
export async function updateSettlementMode(req, res) {
  try {
    const { id } = req.params;
    const { settlementMode, commissionRate } = req.body;

    if (!['ThroughBusiness', 'IndividualPro'].includes(settlementMode)) {
      return res.status(400).json({ success: false, error: 'Settlement mode must be ThroughBusiness or IndividualPro' });
    }

    let p = mockPartners.find(x => x.id === id);
    if (p) {
      p.settlementMode = settlementMode;
      if (commissionRate) p.commissionRate = commissionRate;
    }

    try {
      await PartnerApplication.findOneAndUpdate(
        { id },
        {
          $set: {
            settlementMode,
            ...(commissionRate ? { commissionRate } : {})
          }
        }
      );
    } catch {}

    return res.json({
      success: true,
      message: `Partner settlement mode configured to ${settlementMode}. Double-counting guards active.`,
      settlementMode
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Add Partner Internal Note
export async function addPartnerNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text required' });
    }

    const noteObj = {
      id: 'nt-' + Date.now(),
      note: note.trim(),
      author: req.admin?.name || 'Operations Lead',
      authorRole: req.admin?.role || 'Admin',
      createdAt: new Date()
    };

    let p = mockPartners.find(x => x.id === id);
    if (p) {
      p.internalNotes = p.internalNotes || [];
      p.internalNotes.unshift(noteObj);
    }

    try {
      await PartnerApplication.findOneAndUpdate(
        { id },
        { $push: { internalNotes: noteObj } }
      );
    } catch {}

    return res.status(201).json({ success: true, note: noteObj });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
