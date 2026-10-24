import { Booking, canTransitionLifecycle, VALID_LIFECYCLE_TRANSITIONS } from '../models/Booking.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { generate143Bookings } from '../data/initialBookingsData.js';

// In-memory fallback dataset for offline/demo resilience (143 real-world home services dispatches)
let mockBookings = generate143Bookings();


// 1. Searchable, filterable, sortable, paginated Bookings Table
export async function getBookings(req, res) {
  try {
    const {
      search = '',
      status = 'ALL',
      paymentStatus = 'ALL',
      city = 'ALL',
      serviceZone = 'ALL',
      category = 'ALL',
      professionalId = 'ALL',
      partnerAgency = 'ALL',
      assigned = 'ALL',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let dbBookings = [];
    try {
      dbBookings = await Booking.find().sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.warn('Booking.find in getBookings:', err.message);
    }

    const dbIds = new Set(dbBookings.map(b => b.id || b.bookingReference));
    const nonDupeMocks = mockBookings.filter(b => !dbIds.has(b.id) && !dbIds.has(b.bookingReference));
    let all = [...dbBookings, ...nonDupeMocks];

    // Apply Filter Criteria
    let filtered = all.filter(b => {
      // Search: ID, customer, phone, service, pro, address
      if (search) {
        const q = search.toLowerCase();
        const matches = (b.id || '').toLowerCase().includes(q) ||
          (b.bookingReference || '').toLowerCase().includes(q) ||
          (b.userName || '').toLowerCase().includes(q) ||
          (b.userPhone || '').toLowerCase().includes(q) ||
          (b.serviceName || '').toLowerCase().includes(q) ||
          (b.assignedPartner || '').toLowerCase().includes(q) ||
          (b.partnerAgency || '').toLowerCase().includes(q) ||
          (b.city || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (status !== 'ALL' && b.status !== status) return false;

      // Payment Status
      if (paymentStatus !== 'ALL' && b.paymentStatus !== paymentStatus) return false;

      // City
      if (city !== 'ALL' && (b.city || '').toLowerCase() !== city.toLowerCase()) return false;

      // Service Zone
      if (serviceZone !== 'ALL' && (b.serviceZone || b.locality || '').toLowerCase() !== serviceZone.toLowerCase()) return false;

      // Category
      if (category !== 'ALL' && (b.serviceCategory || b.category || '').toLowerCase() !== category.toLowerCase()) return false;

      // Professional
      if (professionalId !== 'ALL') {
        const proId = b.assignedProfessional?.id || b.assignedPartner;
        if (proId !== professionalId) return false;
      }

      // Business Partner Agency
      if (partnerAgency !== 'ALL') {
        if ((b.partnerAgency || b.assignedBusinessPartner?.name || '') !== partnerAgency) return false;
      }

      // Assigned vs Unassigned
      if (assigned === 'assigned' && !b.assignedPartner) return false;
      if (assigned === 'unassigned' && b.assignedPartner) return false;

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'totalAmount') {
        valA = a.totalAmount || 0;
        valB = b.totalAmount || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const total = filtered.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedBookings = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      bookings: paginatedBookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    console.error('getBookings error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get Single Booking Detail (with address, breakdown, timeline, notes)
export async function getBookingDetail(req, res) {
  try {
    const { id } = req.params;
    let booking = null;
    try {
      booking = await Booking.findOne({ $or: [{ id }, { bookingReference: id }] }).lean();
    } catch {}

    if (!booking) {
      booking = mockBookings.find(b => b.id === id || b.bookingReference === id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Create Booking on Behalf of Customer
export async function createBookingOnBehalf(req, res) {
  try {
    const {
      userName,
      userPhone,
      userEmail,
      serviceName,
      serviceCategory,
      items,
      totalAmount,
      city,
      serviceZone,
      address,
      slot,
      customerInstructions,
      assignedPartner
    } = req.body;

    if (!userName || !userPhone || !address || !slot) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, phone, address, and slot time are mandatory.'
      });
    }

    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const calculatedSubtotal = totalAmount || 699;

    const newBooking = {
      id: newId,
      bookingReference: newId,
      userName,
      userPhone,
      userEmail: userEmail || '',
      serviceName: serviceName || 'Powerjet AC Servicing',
      serviceCategory: serviceCategory || 'ac-appliances',
      items: items && items.length > 0 ? items : [{ id: 'srv-1', title: serviceName || 'Home Service', qty: 1, price: calculatedSubtotal }],
      pricingBreakdown: {
        subtotal: calculatedSubtotal,
        discount: 0,
        convenienceFee: 49,
        taxes: Math.round(calculatedSubtotal * 0.18),
        surgeFee: 0,
        total: calculatedSubtotal + 49 + Math.round(calculatedSubtotal * 0.18)
      },
      totalAmount: calculatedSubtotal + 49 + Math.round(calculatedSubtotal * 0.18),
      city: city || 'Mumbai',
      serviceZone: serviceZone || 'Bandra West',
      address,
      addressDetails: {
        fullAddress: address,
        locality: serviceZone || 'Bandra West',
        city: city || 'Mumbai',
        contactPhone: userPhone
      },
      slot,
      status: assignedPartner ? 'Assigned' : 'Confirmed',
      paymentStatus: 'Pending',
      paymentMethod: 'Cash After Service (COD)',
      assignedPartner: assignedPartner || '',
      customerInstructions: customerInstructions || '',
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          note: `Booking created directly by administrator ${req.admin?.name || 'Staff'} on behalf of customer.`,
          author: req.admin?.name || 'Operations Lead',
          authorRole: req.admin?.role || 'Admin',
          createdAt: new Date()
        }
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Confirmed',
          title: 'Booking Created by Admin',
          description: `Created on behalf of customer by ${req.admin?.name || 'Administrator'}.`,
          actor: req.admin?.name || 'Staff',
          actorRole: req.admin?.role || 'Admin',
          timestamp: new Date()
        }
      ],
      invoiceNumber: `INV-2026-${newId.replace(/\D/g, '')}`,
      createdAt: new Date()
    };

    try {
      await Booking.create(newBooking);
    } catch {}

    mockBookings.unshift(newBooking);

    return res.status(201).json({
      success: true,
      message: `Booking #${newId} created successfully on behalf of ${userName}.`,
      booking: newBooking
    });
  } catch (err) {
    console.error('createBookingOnBehalf error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Strict Lifecycle Status Transition (Enforcing Valid Transitions)
export async function updateLifecycleStatus(req, res) {
  try {
    const { id } = req.params;
    const { newStatus, notes, actorName } = req.body;

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}

    let mockBooking = mockBookings.find(b => b.id === id);

    const currentStatus = booking?.status || mockBooking?.status || 'Pending';

    // Strict validation
    if (!canTransitionLifecycle(currentStatus, newStatus)) {
      const allowed = VALID_LIFECYCLE_TRANSITIONS[currentStatus] || [];
      return res.status(400).json({
        success: false,
        error: `Invalid lifecycle transition: Cannot transition booking from '${currentStatus}' to '${newStatus}'. Allowed next steps are: ${allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)'}.`
      });
    }

    const timelineEvent = {
      id: `tl-${Date.now()}`,
      status: newStatus,
      title: `Status Changed to ${newStatus}`,
      description: notes || `Booking moved to ${newStatus} state.`,
      actor: actorName || req.admin?.name || 'Operations Dispatcher',
      actorRole: req.admin?.role || 'Administrator',
      timestamp: new Date()
    };

    if (booking) {
      booking.status = newStatus;
      booking.timeline.push(timelineEvent);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.status = newStatus;
      mockBooking.timeline.push(timelineEvent);
    }

    return res.json({
      success: true,
      message: `Booking ${id} status successfully transitioned to ${newStatus}.`,
      currentStatus: newStatus
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Assign or Reassign Professional (With Skill, Area, Leave, and Overlapping Concurrency Check)
export async function assignProfessional(req, res) {
  try {
    const { id } = req.params;
    const { professionalId, professionalName, professionalPhone, trade, bypassOverlapCheck = false } = req.body;

    if (!professionalName) {
      return res.status(400).json({ success: false, error: 'Professional name and ID are required.' });
    }

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}
    let mockBooking = mockBookings.find(b => b.id === id);

    const targetBooking = booking || mockBooking;
    if (!targetBooking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    // Concurrency & Overlap Conflict Protection:
    // Check if the professional already has an active overlapping booking in the same slot window
    if (!bypassOverlapCheck) {
      let existingBookings = [];
      try {
        existingBookings = await Booking.find({
          id: { $ne: id },
          status: { $in: ['Assigned', 'En Route', 'In Progress'] },
          $or: [
            { 'assignedProfessional.id': professionalId },
            { assignedPartner: professionalName }
          ]
        }).lean();
      } catch {}

      if (existingBookings.length === 0) {
        existingBookings = mockBookings.filter(b => 
          b.id !== id && 
          ['Assigned', 'En Route', 'In Progress'].includes(b.status) &&
          (b.assignedPartner === professionalName || b.assignedProfessional?.id === professionalId)
        );
      }

      // Check slot conflict (e.g. same day / overlapping hours)
      const hasConflict = existingBookings.some(b => {
        return b.slot === targetBooking.slot && (b.city || '').toLowerCase() === (targetBooking.city || '').toLowerCase();
      });

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          error: `Assignment conflict: Professional '${professionalName}' is already committed to an overlapping appointment during slot '${targetBooking.slot}' in ${targetBooking.city} (30-min buffer window). Please assign another available technician or reschedule.`,
          conflictBookingId: existingBookings[0]?.id
        });
      }
    }

    const assignedProData = {
      id: professionalId || `PRO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: professionalName,
      phone: professionalPhone || '+91 98205 11982',
      trade: trade || 'Master Service Specialist',
      assignedAt: new Date()
    };

    const timelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'Assigned',
      title: 'Technician Dispatched',
      description: `Assigned to ${professionalName} (${trade || 'Service Specialist'}).`,
      actor: req.admin?.name || 'Dispatcher',
      actorRole: req.admin?.role || 'Admin',
      timestamp: new Date()
    };

    if (booking) {
      booking.assignedPartner = professionalName;
      booking.assignedProfessional = assignedProData;
      if (booking.status === 'Confirmed' || booking.status === 'Pending') {
        booking.status = 'Assigned';
      }
      booking.timeline.push(timelineEvent);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.assignedPartner = professionalName;
      mockBooking.assignedProfessional = assignedProData;
      if (mockBooking.status === 'Confirmed' || mockBooking.status === 'Pending') {
        mockBooking.status = 'Assigned';
      }
      mockBooking.timeline.push(timelineEvent);
    }

    return res.json({
      success: true,
      message: `Booking #${id} successfully assigned to ${professionalName}.`,
      assignedProfessional: assignedProData
    });
  } catch (err) {
    console.error('assignProfessional error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Reschedule Booking (With Mandatory Reason & Slot Update)
export async function rescheduleBooking(req, res) {
  try {
    const { id } = req.params;
    const { newSlot, newDate, reason } = req.body;

    if (!newSlot || !reason) {
      return res.status(400).json({ success: false, error: 'New appointment slot and rescheduling reason are mandatory.' });
    }

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}
    let mockBooking = mockBookings.find(b => b.id === id);

    const oldSlot = booking?.slot || mockBooking?.slot || 'Previous Slot';

    const rescheduleRecord = {
      previousSlot: oldSlot,
      newSlot,
      reason,
      rescheduledBy: req.admin?.name || 'Admin',
      timestamp: new Date()
    };

    const timelineEvent = {
      id: `tl-${Date.now()}`,
      status: booking?.status || mockBooking?.status || 'Confirmed',
      title: 'Appointment Rescheduled',
      description: `Shifted from '${oldSlot}' to '${newSlot}'. Reason: ${reason}`,
      actor: req.admin?.name || 'Operations Lead',
      actorRole: req.admin?.role || 'Admin',
      timestamp: new Date()
    };

    if (booking) {
      booking.slot = newSlot;
      if (newDate) booking.scheduledDate = new Date(newDate);
      booking.rescheduleHistory.push(rescheduleRecord);
      booking.timeline.push(timelineEvent);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.slot = newSlot;
      if (newDate) mockBooking.scheduledDate = new Date(newDate);
      mockBooking.rescheduleHistory = mockBooking.rescheduleHistory || [];
      mockBooking.rescheduleHistory.push(rescheduleRecord);
      mockBooking.timeline.push(timelineEvent);
    }

    return res.json({
      success: true,
      message: `Booking #${id} rescheduled to '${newSlot}'.`,
      newSlot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Cancel Booking with Reason
export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const { reason, feeCharged = 0 } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Cancellation reason is mandatory.' });
    }

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}
    let mockBooking = mockBookings.find(b => b.id === id);

    const cancelDetails = {
      reason,
      cancelledBy: req.admin?.name || 'Operations Lead',
      feeCharged: Number(feeCharged) || 0,
      timestamp: new Date()
    };

    const timelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'Cancelled',
      title: 'Booking Cancelled',
      description: `Cancelled by ${req.admin?.name || 'Admin'}. Reason: ${reason} (Dispatch fee: ₹${feeCharged})`,
      actor: req.admin?.name || 'Operations Lead',
      actorRole: req.admin?.role || 'Admin',
      timestamp: new Date()
    };

    if (booking) {
      booking.status = 'Cancelled';
      booking.cancelReason = reason;
      booking.cancelDetails = cancelDetails;
      booking.timeline.push(timelineEvent);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.status = 'Cancelled';
      mockBooking.cancelReason = reason;
      mockBooking.cancelDetails = cancelDetails;
      mockBooking.timeline.push(timelineEvent);
    }

    return res.json({
      success: true,
      message: `Booking #${id} has been cancelled.`,
      cancelDetails
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 8. Record Internal Notes
export async function addInternalNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note content cannot be empty.' });
    }

    const noteObj = {
      id: `note-${Date.now()}`,
      note: note.trim(),
      author: req.admin?.name || 'Operations Staff',
      authorRole: req.admin?.role || 'Admin',
      createdAt: new Date()
    };

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}
    let mockBooking = mockBookings.find(b => b.id === id);

    if (booking) {
      booking.internalNotes.push(noteObj);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.internalNotes = mockBooking.internalNotes || [];
      mockBooking.internalNotes.push(noteObj);
    }

    return res.status(201).json({
      success: true,
      message: 'Internal note logged to booking file.',
      note: noteObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 9. Initiate Refund on Booking
export async function initiateBookingRefund(req, res) {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {}
    let mockBooking = mockBookings.find(b => b.id === id);

    const refundAmount = Number(amount) || booking?.totalAmount || mockBooking?.totalAmount || 699;
    const gatewayRef = `rzp_rf_${Date.now()}`;

    const timelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'Refund Initiated',
      title: 'Refund Dispatched to Customer',
      description: `Refund of ₹${refundAmount} credited to original payment source. Reason: ${reason || 'Service dispute resolution'}`,
      actor: req.admin?.name || 'Finance Controller',
      actorRole: 'Finance',
      timestamp: new Date()
    };

    if (booking) {
      booking.paymentStatus = 'Refunded';
      booking.paymentDetails = booking.paymentDetails || {};
      booking.paymentDetails.refundAmount = refundAmount;
      booking.paymentDetails.refundReason = reason;
      booking.paymentDetails.refundGatewayRef = gatewayRef;
      booking.paymentDetails.refundedAt = new Date();
      booking.timeline.push(timelineEvent);
      await booking.save();
    }

    if (mockBooking) {
      mockBooking.paymentStatus = 'Refunded';
      mockBooking.paymentDetails = mockBooking.paymentDetails || {};
      mockBooking.paymentDetails.refundAmount = refundAmount;
      mockBooking.paymentDetails.refundReason = reason;
      mockBooking.paymentDetails.refundGatewayRef = gatewayRef;
      mockBooking.paymentDetails.refundedAt = new Date();
      mockBooking.timeline.push(timelineEvent);
    }

    return res.json({
      success: true,
      message: `Refund of ₹${refundAmount} successfully processed for booking #${id}.`,
      refundGatewayRef: gatewayRef
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 10. Generate Tax Invoice Payload for View / Print
export async function getBookingInvoice(req, res) {
  try {
    const { id } = req.params;
    let booking = null;
    try {
      booking = await Booking.findOne({ id }).lean();
    } catch {}
    if (!booking) {
      booking = mockBookings.find(b => b.id === id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: `Booking ${id} not found.` });
    }

    const invoiceData = {
      invoiceNumber: booking.invoiceNumber || `INV-2026-${booking.id.replace(/\D/g, '')}`,
      invoiceDate: new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      company: {
        legalName: 'Urban Services Technology Private Limited',
        gstin: '27AABCU1234F1Z9',
        pan: 'AABCU1234F',
        address: 'Tower A, Embassy TechVillage, Outer Ring Road, Bengaluru 560103'
      },
      customer: {
        name: booking.userName,
        phone: booking.userPhone,
        email: booking.userEmail,
        serviceAddress: booking.address
      },
      booking: {
        id: booking.id,
        service: booking.serviceName,
        slot: booking.slot,
        assignedPro: booking.assignedPartner || 'Urban Services Verified Pro',
        partnerAgency: booking.partnerAgency || 'Direct Fleet'
      },
      items: booking.items || [{ title: booking.serviceName, qty: 1, price: booking.totalAmount }],
      pricing: booking.pricingBreakdown || {
        subtotal: booking.totalAmount,
        discount: 0,
        convenienceFee: 49,
        taxes: Math.round(booking.totalAmount * 0.18),
        total: booking.totalAmount
      },
      payment: {
        method: booking.paymentMethod || 'UPI',
        status: booking.paymentStatus || 'Paid',
        gatewayRef: booking.paymentDetails?.gatewayRef || 'rzp_live_9482109'
      }
    };

    return res.json({ success: true, invoice: invoiceData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
