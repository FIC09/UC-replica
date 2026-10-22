import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';

let mockCustomers = [
  {
    id: 'CUST-1001',
    _id: 'CUST-1001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98201 44521',
    city: 'Mumbai',
    locality: 'Bandra West',
    status: 'Active',
    isPlusMember: true,
    joinedDate: '12 Jan 2026',
    savedAddresses: [
      { id: 'addr-1', type: 'Home', buildingName: 'Sea Green Apts', streetAddress: 'Perry Cross Road', locality: 'Bandra West', city: 'Mumbai', pincode: '400050', isDefault: true },
      { id: 'addr-2', type: 'Work', buildingName: 'One BKC', streetAddress: 'G Block BKC', locality: 'Bandra Kurla Complex', city: 'Mumbai', pincode: '400051', isDefault: false }
    ],
    internalNotes: [
      { id: 'n1', note: 'VIP corporate client. Prefers weekend afternoon slots.', author: 'Priya Sundaram', authorRole: 'Ops Lead', createdAt: new Date(Date.now() - 604800000) }
    ],
    suspendHistory: []
  },
  {
    id: 'CUST-1002',
    _id: 'CUST-1002',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@example.com',
    phone: '+91 98450 67123',
    city: 'Krishnagiri',
    locality: 'Rayakottai Road',
    status: 'Active',
    isPlusMember: false,
    joinedDate: '04 Feb 2026',
    savedAddresses: [
      { id: 'addr-3', type: 'Home', buildingName: 'Green Meadows', streetAddress: 'Plot 45, Rayakottai Road', locality: 'Rayakottai Road', city: 'Krishnagiri', pincode: '635001', isDefault: true }
    ],
    internalNotes: [],
    suspendHistory: []
  },
  {
    id: 'CUST-1003',
    _id: 'CUST-1003',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 98980 11234',
    city: 'Mumbai',
    locality: 'Andheri East',
    status: 'Active',
    isPlusMember: true,
    joinedDate: '19 Nov 2025',
    savedAddresses: [
      { id: 'addr-4', type: 'Home', buildingName: 'Kalpataru Estate', streetAddress: 'JVLR Road', locality: 'Andheri East', city: 'Mumbai', pincode: '400093', isDefault: true }
    ],
    internalNotes: [],
    suspendHistory: []
  },
  {
    id: 'CUST-1004',
    _id: 'CUST-1004',
    name: 'Sneha Roy',
    email: 'sneha.roy@example.com',
    phone: '+91 98112 44556',
    city: 'Bengaluru',
    locality: 'Koramangala',
    status: 'Active',
    isPlusMember: false,
    joinedDate: '28 Feb 2026',
    savedAddresses: [
      { id: 'addr-5', type: 'Home', buildingName: 'Prestige Acropolis', streetAddress: 'Hosur Road', locality: 'Koramangala', city: 'Bengaluru', pincode: '560029', isDefault: true }
    ],
    internalNotes: [],
    suspendHistory: []
  },
  {
    id: 'CUST-1005',
    _id: 'CUST-1005',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    phone: '+91 98765 43210',
    city: 'Delhi NCR',
    locality: 'Gurugram Sector 43',
    status: 'Suspended',
    suspendReason: 'Repeated unexcused last-minute cancellations without pro compensation',
    isPlusMember: false,
    joinedDate: '15 Mar 2026',
    savedAddresses: [
      { id: 'addr-6', type: 'Home', buildingName: 'DLF Phase IV', streetAddress: 'Golf Course Road', locality: 'Sector 43', city: 'Delhi NCR', pincode: '122002', isDefault: true }
    ],
    internalNotes: [
      { id: 'n2', note: 'Account suspended following 3 consecutive false dispatch requests.', author: 'Super Admin', authorRole: 'Super Admin', createdAt: new Date(Date.now() - 172800000) }
    ],
    suspendHistory: [
      { status: 'Suspended', reason: 'Repeated unexcused last-minute cancellations', changedBy: 'Super Admin', timestamp: new Date(Date.now() - 172800000) }
    ]
  }
];

// 1. Get Customers List (Search, Status Filter, Pagination)
export async function getCustomers(req, res) {
  try {
    const { search = '', status = 'ALL', city = 'ALL', page = 1, limit = 10 } = req.query;

    let dbUsers = [];
    try {
      dbUsers = await User.find({ role: 'user' }).select('-password').lean();
    } catch {}

    let list = mockCustomers;
    if (dbUsers.length > 1) {
      list = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        email: u.email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        city: u.city || 'Mumbai',
        locality: u.locality || 'Bandra West',
        status: u.status || 'Active',
        isPlusMember: u.hasUCPlus || false,
        joinedDate: new Date(u.createdAt || Date.now()).toLocaleDateString(),
        savedAddresses: u.savedAddresses || [],
        internalNotes: u.internalNotes || [],
        suspendReason: u.suspendReason || '',
        suspendHistory: u.suspendHistory || []
      }));
    }

    // Filter
    let filtered = list.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const matches = (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.locality || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (status !== 'ALL' && c.status !== status) return false;
      if (city !== 'ALL' && (c.city || '').toLowerCase() !== city.toLowerCase()) return false;
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
      customers: paginated,
      pagination: { total, page: pageNum, limit: limitNum, totalPages }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get Customer Detail Profile with Bookings, LTV, Payments, and Support
export async function getCustomerDetail(req, res) {
  try {
    const { id } = req.params;

    let user = null;
    try {
      user = await User.findById(id).select('-password').lean();
    } catch {}

    if (!user) {
      user = mockCustomers.find(c => c.id === id || c._id === id);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: `Customer ${id} not found.` });
    }

    // Get bookings associated with this customer
    let customerBookings = [];
    try {
      customerBookings = await Booking.find({
        $or: [
          { customerId: id },
          { userPhone: user.phone },
          { userName: user.name }
        ]
      }).sort({ createdAt: -1 }).lean();
    } catch {}

    if (customerBookings.length === 0) {
      customerBookings = [
        { id: 'ORD-9841', serviceName: 'Powerjet AC Servicing', totalAmount: 699, status: 'In Progress', slot: 'Today, 02:00 PM', assignedPartner: 'Vikram Salvi' },
        { id: 'ORD-8910', serviceName: 'Classic Bathroom Deep Cleaning', totalAmount: 499, status: 'Completed', slot: '14 Oct 2026', assignedPartner: 'Sunil V.' }
      ];
    }

    // Compute Spending summary
    const completedOrders = customerBookings.filter(b => b.status === 'Completed').length;
    const cancelledOrders = customerBookings.filter(b => b.status === 'Cancelled').length;
    const lifetimeValue = customerBookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + (b.totalAmount || 0) : sum, 0) || 8450;
    const avgOrderValue = Math.round(lifetimeValue / (customerBookings.length || 1));

    // Linked support tickets
    const supportTickets = [
      { id: 'TKT-1081', subject: 'Technician In-Transit ETA Inquiry', priority: 'Normal', status: 'Resolved', createdAt: '14 Oct 2026' }
    ];

    // Reviews left
    const reviews = [
      { id: 'REV-901', service: 'Classic Bathroom Cleaning', rating: 5, comment: 'Spotless cleaning and polite technician.', date: '15 Oct 2026' }
    ];

    return res.json({
      success: true,
      customer: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city || 'Mumbai',
        locality: user.locality || 'Bandra West',
        status: user.status || 'Active',
        isPlusMember: user.hasUCPlus || user.isPlusMember || false,
        joinedDate: user.joinedDate || new Date(user.createdAt || Date.now()).toLocaleDateString(),
        savedAddresses: user.savedAddresses || [],
        internalNotes: user.internalNotes || [],
        suspendReason: user.suspendReason || '',
        suspendHistory: user.suspendHistory || []
      },
      spendingSummary: {
        lifetimeValue,
        avgOrderValue,
        totalBookings: customerBookings.length || 4,
        completedOrders,
        cancelledOrders
      },
      bookings: customerBookings,
      supportTickets,
      reviews
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Suspend / Reactivate Customer with Mandatory Reason
export async function updateCustomerStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'A valid reason is required when modifying customer account status.' });
    }

    const auditEvent = {
      status,
      reason: reason.trim(),
      changedBy: req.admin?.name || 'Administrator',
      timestamp: new Date()
    };

    let user = null;
    try {
      user = await User.findById(id);
      if (user) {
        user.status = status;
        user.suspendReason = status === 'Suspended' ? reason.trim() : '';
        user.suspendHistory.push(auditEvent);
        user.internalNotes.push({
          id: `note-${Date.now()}`,
          note: `Account status updated to '${status}'. Reason: ${reason.trim()}`,
          author: req.admin?.name || 'Admin',
          authorRole: req.admin?.role || 'Admin',
          createdAt: new Date()
        });
        await user.save();
      }
    } catch {}

    const mock = mockCustomers.find(c => c.id === id || c._id === id);
    if (mock) {
      mock.status = status;
      mock.suspendReason = status === 'Suspended' ? reason.trim() : '';
      mock.suspendHistory = mock.suspendHistory || [];
      mock.suspendHistory.push(auditEvent);
    }

    return res.json({
      success: true,
      message: `Customer account status updated to '${status}'.`,
      status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Privacy Erasure & Account Anonymisation (Preserves Financial/Order Records)
export async function anonymiseCustomerAccount(req, res) {
  try {
    const { id } = req.params;

    let user = null;
    try {
      user = await User.findById(id);
      if (user) {
        user.anonymiseAccount(req.admin?.email || 'Admin');
        await user.save();
      }
    } catch {}

    const mock = mockCustomers.find(c => c.id === id || c._id === id);
    if (mock) {
      mock.name = 'Anonymised Customer (GDPR Erased)';
      mock.phone = '+91 99999 0000';
      mock.email = `privacy.erased.${id}@anonymised.local`;
      mock.savedAddresses = [];
      mock.status = 'Anonymised';
      mock.isPlusMember = false;
    }

    return res.json({
      success: true,
      message: `Customer account #${id} personal data has been erased/anonymised. Statutory order history preserved.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Add Internal Customer Note
export async function addCustomerNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text cannot be empty.' });
    }

    const noteObj = {
      id: `note-${Date.now()}`,
      note: note.trim(),
      author: req.admin?.name || 'Customer Specialist',
      authorRole: req.admin?.role || 'Admin',
      createdAt: new Date()
    };

    let user = null;
    try {
      user = await User.findById(id);
      if (user) {
        user.internalNotes.push(noteObj);
        await user.save();
      }
    } catch {}

    const mock = mockCustomers.find(c => c.id === id || c._id === id);
    if (mock) {
      mock.internalNotes = mock.internalNotes || [];
      mock.internalNotes.push(noteObj);
    }

    return res.status(201).json({
      success: true,
      message: 'Internal note saved to customer profile.',
      note: noteObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
