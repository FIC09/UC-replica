// =========================================================================
// ADMIN SUPPORT, QUALITY & REVIEWS CONTROLLER
// Handles tickets, conversation history, internal notes, review moderation,
// revisit warranty disputes, and SLA tracking.
// =========================================================================

let mockSupportTickets = [
  {
    id: 'TKT-1081',
    referenceNumber: 'TKT-1081',
    callerName: 'Aarav Mehta',
    callerPhone: '+91 98201 12345',
    callerEmail: 'aarav.mehta@gmail.com',
    callerRole: 'Customer', // Customer | Professional | Business Partner
    bookingId: 'ORD-9841',
    serviceTitle: 'Powerjet AC Servicing (Split AC)',
    category: 'Technician In-Transit Delay',
    priority: 'High', // Urgent | High | Medium | Low
    assignedOwner: 'Rakesh Sharma (Ops Lead)',
    status: 'Open', // Open | In Progress | Escalated | Resolved | Closed
    slaTargetTime: new Date(Date.now() + 1800000), // 30 mins remaining
    slaStatus: 'On Track', // On Track | Breach Warning | Breached
    conversation: [
      {
        id: 'msg-1',
        sender: 'Aarav Mehta (Customer)',
        senderRole: 'Customer',
        text: 'The technician was scheduled for 10:00 AM but has not arrived yet. Western Express Highway is jammed.',
        isInternal: false,
        timestamp: new Date(Date.now() - 3600000),
        attachments: []
      },
      {
        id: 'msg-2',
        sender: 'Rakesh Sharma (Admin)',
        senderRole: 'Support Agent',
        text: 'Internal Note: Called Pro Vikram Salvi. Motorcycle tire punctured near Bandra flyover. He is fixing it; ETA 10:35 AM.',
        isInternal: true, // Internal note hidden from customer
        timestamp: new Date(Date.now() - 2400000),
        attachments: []
      },
      {
        id: 'msg-3',
        sender: 'Rakesh Sharma (Support Agent)',
        senderRole: 'Support Agent',
        text: 'Dear Mr. Mehta, we sincerely apologize for the delay. Technician Vikram suffered a minor tire puncture and is 15 minutes away. We are monitoring his live GPS dispatch.',
        isInternal: false,
        timestamp: new Date(Date.now() - 1800000),
        attachments: []
      }
    ],
    closureReason: null,
    escalationReason: null,
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'TKT-1082',
    referenceNumber: 'TKT-1082',
    callerName: 'Vikram Salvi',
    callerPhone: '+91 98450 67890',
    callerEmail: 'vikram.salvi@urbanpro.com',
    callerRole: 'Professional',
    bookingId: 'ORD-9841',
    serviceTitle: 'Powerjet AC Servicing (Split AC)',
    category: 'Parts Missing at Customer Address',
    priority: 'Medium',
    assignedOwner: 'Sneha Patil (Quality Support)',
    status: 'In Progress',
    slaTargetTime: new Date(Date.now() + 3600000 * 2),
    slaStatus: 'On Track',
    conversation: [
      {
        id: 'msg-10',
        sender: 'Vikram Salvi (Technician)',
        senderRole: 'Professional',
        text: 'The customer requested replacement of outdoor unit vibration damping rubber pads. Need approval to add standard inventory item ACC-VIB-01.',
        isInternal: false,
        timestamp: new Date(Date.now() - 7200000),
        attachments: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500']
      },
      {
        id: 'msg-11',
        sender: 'Sneha Patil (Admin)',
        senderRole: 'Support Agent',
        text: 'Internal Note: Confirmed part cost ₹249 on central catalogue. Customer approved OTP charge.',
        isInternal: true,
        timestamp: new Date(Date.now() - 5400000),
        attachments: []
      }
    ],
    closureReason: null,
    escalationReason: null,
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'TKT-1083',
    referenceNumber: 'TKT-1083',
    callerName: 'Pooja Iyer',
    callerPhone: '+91 98111 22334',
    callerEmail: 'pooja.iyer@tatacapital.com',
    callerRole: 'Customer',
    bookingId: 'ORD-9844',
    serviceTitle: 'Full Home Deep Cleaning (3 BHK)',
    category: 'Billing & Corporate Invoice Query',
    priority: 'Urgent',
    assignedOwner: 'Finance Desk',
    status: 'Open',
    slaTargetTime: new Date(Date.now() - 1800000), // Breached
    slaStatus: 'Breached',
    conversation: [
      {
        id: 'msg-20',
        sender: 'Pooja Iyer (Customer)',
        senderRole: 'Customer',
        text: 'I need a GST invoice showing our company legal name and GSTIN 27AAACT2948K1ZB for expense reimbursement.',
        isInternal: false,
        timestamp: new Date(Date.now() - 86400000),
        attachments: []
      }
    ],
    closureReason: null,
    escalationReason: 'SLA target exceeded for B2B billing documentation',
    createdAt: new Date(Date.now() - 86400000)
  }
];

// Customer Reviews & Feedback (Strict Rule: Do not silently edit or fabricate ratings!)
let mockReviews = [
  {
    id: 'REV-901',
    bookingId: 'ORD-9844',
    serviceName: 'Full Home Deep Cleaning',
    customerName: 'Pooja Iyer',
    professionalName: 'Sunil Vishwakarma',
    rating: 5,
    comment: 'Punctual, polite, spotless tiles! Brought professional cleaning chemicals and safety boots. Highly impressed.',
    isPublished: true,
    flagged: false,
    flaggedReason: null,
    reportedAbuseCount: 0,
    moderationHistory: [],
    date: 'Yesterday'
  },
  {
    id: 'REV-902',
    bookingId: 'ORD-9841',
    serviceName: 'Powerjet AC Servicing',
    customerName: 'Aarav Mehta',
    professionalName: 'Vikram Salvi',
    rating: 5,
    comment: 'Incredible waterjet pressure wash. Power consumption dropped immediately. Professional cleaned up all splashes afterwards.',
    isPublished: true,
    flagged: false,
    flaggedReason: null,
    reportedAbuseCount: 0,
    moderationHistory: [],
    date: '21 Oct 2026'
  },
  {
    id: 'REV-903',
    bookingId: 'ORD-9842',
    serviceName: 'Salon at Home Facial',
    customerName: 'Amit Patel',
    professionalName: 'Anita Deshmukh',
    rating: 5,
    comment: 'Hospital grade hygiene and sanitized tools. Outstanding service quality.',
    isPublished: true,
    flagged: false,
    flaggedReason: null,
    reportedAbuseCount: 0,
    moderationHistory: [],
    date: '19 Oct 2026'
  },
  {
    id: 'REV-904',
    bookingId: 'ORD-9845',
    serviceName: 'Microwave Diagnostic',
    customerName: 'Rohan Mehra',
    professionalName: 'Unassigned',
    rating: 2,
    comment: 'Technician was 40 mins late and did not have the exact magnetron capacitor.',
    isPublished: true,
    flagged: true,
    flaggedReason: 'Service in dispute / refund granted',
    reportedAbuseCount: 0,
    moderationHistory: [
      {
        moderatedBy: 'Support Lead',
        action: 'Flagged for Quality Follow-up',
        reason: 'Customer initiated refund claim REF-701; review verified authentic (not hidden).',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ],
    date: '18 Oct 2026'
  },
  {
    id: 'REV-905',
    bookingId: 'ORD-9830',
    serviceName: 'Bathroom Deep Cleaning',
    customerName: 'Anonymous Troll',
    professionalName: 'Sunil Vishwakarma',
    rating: 1,
    comment: 'Scam company bad words ***** fake technician do not call them.',
    isPublished: false,
    flagged: true,
    flaggedReason: 'Profanity & Unsubstantiated Abuse',
    reportedAbuseCount: 3,
    moderationHistory: [
      {
        moderatedBy: 'Quality Operations Manager',
        action: 'Hidden from Catalogue',
        reason: 'Violated content guidelines: excessive profanity and harassment without factual job reference.',
        timestamp: new Date(Date.now() - 86400000 * 3)
      }
    ],
    date: '15 Oct 2026'
  }
];

// Revisits & Warranty Disputes
let mockRevisits = [
  {
    id: 'REV-DISP-01',
    originalBookingId: 'ORD-9820',
    serviceTitle: 'Powerjet AC Servicing',
    customerName: 'Sunita Rao',
    professionalName: 'Vikram Salvi',
    issueCategory: 'Water Droplet Leakage After Coil Cleaning',
    evidenceSummary: 'Customer submitted 10-second video showing condensation drain pipe dripping onto bedroom wall 3 days after servicing.',
    evidenceAttachments: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500'],
    responsibilityReview: 'Technician Workmanship Fault (Drain tray improperly re-seated)',
    resolutionAction: 'Free Redo Visit Scheduled',
    costsIncurred: {
      redoServiceCost: 450,
      customerRedoFee: 0, // 100% Free under 30-Day UC Promise Warranty
      costCoveredBy: 'Company Warranty Guarantee Pool',
      proDeduction: 0 // Waived for first-time dispute on good-standing pro
    },
    status: 'Completed & Verified',
    revisitBookingId: 'ORD-REVISIT-9820',
    assignedRevisitPro: 'Vikram Salvi (Lead HVAC Specialist)',
    resolvedAt: new Date(Date.now() - 86400000 * 4),
    historyLog: [
      { actor: 'Customer', note: 'Logged warranty claim via UC app', timestamp: new Date(Date.now() - 86400000 * 5) },
      { actor: 'Quality Ops', note: 'Approved 30-day warranty rework; zero cost to customer', timestamp: new Date(Date.now() - 86400000 * 4.5) },
      { actor: 'Technician', note: 'Re-leveled indoor tray; customer signed off satisfied', timestamp: new Date(Date.now() - 86400000 * 4) }
    ]
  },
  {
    id: 'REV-DISP-02',
    originalBookingId: 'ORD-9833',
    serviceTitle: 'Bathroom Tap & Drain Pipe Fitting',
    customerName: 'Karan Singhania',
    professionalName: 'Ramesh Plumber',
    issueCategory: 'Slow Drain Drainage',
    evidenceSummary: 'Drain trap pipe has minor hair clog recurring.',
    evidenceAttachments: [],
    responsibilityReview: 'Building Main Line Blockage (Outside service scope)',
    resolutionAction: 'Customer Goodwill Guidance Provided',
    costsIncurred: {
      redoServiceCost: 0,
      customerRedoFee: 0,
      costCoveredBy: 'N/A',
      proDeduction: 0
    },
    status: 'Resolved Without Redo',
    revisitBookingId: null,
    assignedRevisitPro: null,
    resolvedAt: new Date(Date.now() - 86400000 * 2),
    historyLog: [
      { actor: 'Customer', note: 'Dispute submitted for slow water run', timestamp: new Date(Date.now() - 86400000 * 3) },
      { actor: 'Operations Lead', note: 'Inspection found society vertical shaft choked. Explained to customer with plumbing diagram.', timestamp: new Date(Date.now() - 86400000 * 2) }
    ]
  }
];

// ==========================================
// 1. TICKETS ENDPOINTS
// ==========================================
export async function getSupportTickets(req, res) {
  try {
    const { status = 'ALL', priority = 'ALL', role = 'ALL', search = '' } = req.query;

    let list = mockSupportTickets.filter(t => {
      if (status !== 'ALL' && t.status !== status) return false;
      if (priority !== 'ALL' && t.priority !== priority) return false;
      if (role !== 'ALL' && t.callerRole !== role) return false;
      if (search) {
        const q = search.toLowerCase();
        const m = (t.id || '').toLowerCase().includes(q) ||
          (t.callerName || '').toLowerCase().includes(q) ||
          (t.bookingId || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });

    return res.json({
      success: true,
      count: list.length,
      tickets: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addTicketMessage(req, res) {
  try {
    const { id } = req.params;
    const { text, isInternal = false, attachments = [] } = req.body;

    const tkt = mockSupportTickets.find(t => t.id === id);
    if (!tkt) return res.status(404).json({ success: false, error: 'Ticket not found' });

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: `${req.admin?.name || 'Support Agent'} (${isInternal ? 'Internal Staff' : 'Support Desk'})`,
      senderRole: req.admin?.role || 'Support Agent',
      text,
      isInternal: Boolean(isInternal),
      timestamp: new Date(),
      attachments: attachments || []
    };

    tkt.conversation.push(newMsg);
    if (!isInternal && tkt.status === 'Open') {
      tkt.status = 'In Progress';
    }

    return res.json({ success: true, message: 'Message added', ticket: tkt });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, closureReason, escalationReason, assignedOwner } = req.body;

    const tkt = mockSupportTickets.find(t => t.id === id);
    if (!tkt) return res.status(404).json({ success: false, error: 'Ticket not found' });

    if (status) tkt.status = status;
    if (closureReason) tkt.closureReason = closureReason;
    if (escalationReason) tkt.escalationReason = escalationReason;
    if (assignedOwner) tkt.assignedOwner = assignedOwner;

    return res.json({ success: true, message: `Ticket #${id} updated to ${tkt.status}`, ticket: tkt });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 2. REVIEWS & MODERATION ENDPOINTS
// ==========================================
export async function getReviews(req, res) {
  try {
    return res.json({
      success: true,
      count: mockReviews.length,
      reviews: mockReviews,
      authenticityPolicy: 'Ratings and feedback are preserved verbatim from verified customers. Silently rewriting words or fabricating ratings is strictly forbidden.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function moderateReview(req, res) {
  try {
    const { id } = req.params;
    const { isPublished, moderationReason } = req.body;

    const rev = mockReviews.find(r => r.id === id);
    if (!rev) return res.status(404).json({ success: false, error: 'Review not found' });

    rev.isPublished = Boolean(isPublished);
    rev.moderationHistory.push({
      moderatedBy: req.admin?.name || 'Quality Lead',
      action: isPublished ? 'Published to Catalogue' : 'Hidden from Catalogue',
      reason: moderationReason || 'Operational quality review',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Review #${id} visibility set to ${isPublished ? 'Public' : 'Hidden'}`,
      review: rev
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 3. REVISITS & DISPUTES ENDPOINTS
// ==========================================
export async function getRevisits(req, res) {
  try {
    return res.json({
      success: true,
      count: mockRevisits.length,
      revisits: mockRevisits
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createRevisit(req, res) {
  try {
    const newRevisit = {
      id: `REV-DISP-${Date.now()}`,
      ...req.body,
      status: 'Open Review',
      historyLog: [
        { actor: req.admin?.name || 'Support Agent', note: 'Warranty dispute logged', timestamp: new Date() }
      ]
    };
    mockRevisits.unshift(newRevisit);
    return res.json({ success: true, revisit: newRevisit });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
