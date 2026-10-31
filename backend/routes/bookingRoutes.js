import express from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { TrackingSession } from '../models/TrackingSession.js';
import { autoAssignWorkerToBooking, triggerAutoAssignment } from '../services/assignmentEngine.js';
import { validateKrishnagiriServiceArea } from '../services/geofenceService.js';
import { syncBookingToPostgres } from '../services/postgresService.js';
import { emitEvent } from '../services/websocketService.js';

const router = express.Router();

// Resilient in-memory store for real-time live events and offline tolerance
export const inMemoryBookings = new Map();

// POST validate service area coverage within Krishnagiri Town
router.post('/validate-coverage', async (req, res) => {
  try {
    const { address = '', locality = '', city = 'Krishnagiri', lat, lng } = req.body;
    const coverage = validateKrishnagiriServiceArea({ address, locality, city, lat, lng });
    res.json({ success: true, coverage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all bookings or by user phone / customerId / email / name
router.get('/', async (req, res) => {
  try {
    const { phone, customerId, userEmail, userName } = req.query;
    let query = {};
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, '').slice(-10);
      if (cleanDigits) {
        query.$or = [
          { userPhone: phone },
          { userPhone: { $regex: cleanDigits + '$', $options: 'i' } }
        ];
      } else {
        query.userPhone = phone;
      }
    } else if (customerId) {
      query.$or = [
        { customerId: customerId },
        { customerId: String(customerId) }
      ];
    } else if (userEmail) {
      query.userEmail = { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') };
    } else if (userName) {
      query.$or = [
        { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } },
        { customerName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } }
      ];
    }
    query.deletedByCustomer = { $ne: true };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ id: req.params.id }, { bookingReference: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create booking
router.post('/', async (req, res) => {
  try {
    const bookingData = { ...req.body };
    // Flexible items and totalAmount validation
    if (!bookingData.items || !Array.isArray(bookingData.items) || bookingData.items.length === 0) {
      if (bookingData.serviceName) {
        bookingData.items = [{
          id: 'srv-' + Date.now(),
          title: bookingData.serviceName,
          name: bookingData.serviceName,
          price: bookingData.totalAmount || bookingData.amount || 299,
          qty: 1
        }];
      } else {
        return res.status(400).json({ success: false, message: 'Cart items are required' });
      }
    }
    if (bookingData.totalAmount == null) {
      bookingData.totalAmount = bookingData.amount != null ? bookingData.amount : (bookingData.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0));
    }
    if (typeof bookingData.totalAmount === 'string') {
      bookingData.totalAmount = Number(bookingData.totalAmount.replace(/[^\d.]/g, '')) || 0;
    }

    if (Array.isArray(bookingData.items)) {
      bookingData.items = bookingData.items.map(i => ({
        ...i,
        price: typeof i.price === 'string' ? (Number(i.price.replace(/[^\d.]/g, '')) || 0) : (Number(i.price) || 0),
        qty: Number(i.qty) || 1
      }));
    }

    // City & Service Area Verification
    const targetAddress = (bookingData.address || bookingData.addressDetails?.fullAddress || '').trim();
    const targetLocality = bookingData.serviceZone || bookingData.addressDetails?.locality || 'Rayakottai Road';
    const targetCity = bookingData.city || bookingData.addressDetails?.city || 'Krishnagiri';
    const targetLat = bookingData.addressDetails?.lat;
    const targetLng = bookingData.addressDetails?.lng;

    const isKrishnagiri = targetCity.toLowerCase().includes('krishnagiri') ||
      targetAddress.toLowerCase().includes('krishnagiri') ||
      targetLocality.toLowerCase().includes('rayakottai') ||
      targetLocality.toLowerCase().includes('kattiganapalli');

    let coverageCheck = { allowed: true, serviceZone: targetLocality, city: targetCity };
    if (isKrishnagiri) {
      coverageCheck = validateKrishnagiriServiceArea({
        address: targetAddress,
        locality: targetLocality,
        city: targetCity,
        lat: targetLat,
        lng: targetLng
      });

      if (!coverageCheck.allowed) {
        coverageCheck = { allowed: true, serviceZone: targetLocality || 'Rayakottai Road', city: targetCity || 'Krishnagiri' };
      }
    }

    // Ensure strictly unique Booking ID (prevent E11000 duplicate key failure)
    let candidateId = bookingData.id || ('UC-' + Math.floor(100000 + Math.random() * 900000));
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        let existingBooking = await Booking.findOne({ id: candidateId }).lean();
        while (existingBooking) {
          candidateId = 'UC-' + Math.floor(100000 + Math.random() * 900000);
          existingBooking = await Booking.findOne({ id: candidateId }).lean();
        }
      } catch (e) { }
    }
    bookingData.id = candidateId;
    bookingData.bookingReference = candidateId;

    if (!bookingData.safetyPin) {
      bookingData.safetyPin = String(Math.floor(1000 + Math.random() * 9000));
    }

    if (bookingData.notes && !bookingData.customerInstructions) {
      bookingData.customerInstructions = bookingData.notes;
    }

    // Parse contact string if userName/userPhone missing
    if (!bookingData.userName && bookingData.contact) {
      const match = bookingData.contact.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        bookingData.userName = match[1].trim();
        bookingData.userPhone = match[2].trim();
      } else {
        bookingData.userName = bookingData.contact;
      }
    }

    if (!bookingData.userName) bookingData.userName = bookingData.customerName || 'Customer';
    if (!bookingData.customerName) bookingData.customerName = bookingData.userName || 'Customer';
    if (!bookingData.userPhone && bookingData.addressDetails?.contactPhone) {
      bookingData.userPhone = bookingData.addressDetails.contactPhone;
    }

    const firstItem = bookingData.items[0] || {};
    if (!bookingData.serviceName) {
      bookingData.serviceName = firstItem.title || firstItem.name || 'Home Service';
    }
    if (!bookingData.serviceCategory) {
      bookingData.serviceCategory = firstItem.category || 'Home Services';
    }
    bookingData.address = targetAddress || `${targetLocality}, ${targetCity}`;
    bookingData.city = targetCity || 'Krishnagiri';
    bookingData.serviceZone = bookingData.serviceZone || coverageCheck.serviceZone || targetLocality || 'Rayakottai Road';
    bookingData.assignmentMode = bookingData.assignmentMode || 'AUTO';
    bookingData.assignmentStatus = 'UNASSIGNED';

    const coordsLng = targetLng || coverageCheck.center?.lng || (isKrishnagiri ? 78.2090 : 72.8295);
    const coordsLat = targetLat || coverageCheck.center?.lat || (isKrishnagiri ? 12.5200 : 19.0596);
    bookingData.location = {
      type: 'Point',
      coordinates: [coordsLng, coordsLat]
    };

    if (!bookingData.status) {
      bookingData.status = 'Confirmed';
    }
    if (!bookingData.paymentStatus) {
      bookingData.paymentStatus = 'Paid';
    }
    if (!bookingData.slot) {
      bookingData.slot = bookingData.time ? `${bookingData.date || 'Today'}, ${bookingData.time}` : '10:00 AM - 11:30 AM';
    }

    if (!bookingData.createdAtFormatted) {
      const now = new Date();
      bookingData.createdAtFormatted = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (bookingData.paymentDetails && typeof bookingData.paymentDetails === 'object') {
      if (bookingData.paymentDetails.paidAt) {
        const parsed = new Date(bookingData.paymentDetails.paidAt);
        bookingData.paymentDetails.paidAt = isNaN(parsed.getTime()) ? new Date() : parsed;
      }
      if (bookingData.paymentDetails.refundedAt) {
        const parsed = new Date(bookingData.paymentDetails.refundedAt);
        bookingData.paymentDetails.refundedAt = isNaN(parsed.getTime()) ? undefined : parsed;
      }
    }

    if (bookingData.scheduledDate) {
      const parsedDate = new Date(bookingData.scheduledDate);
      if (isNaN(parsedDate.getTime())) {
        delete bookingData.scheduledDate;
      } else {
        bookingData.scheduledDate = parsedDate;
      }
    }

    if (!bookingData.pricingBreakdown || !bookingData.pricingBreakdown.total) {
      bookingData.pricingBreakdown = {
        subtotal: bookingData.totalAmount || 0,
        discount: 0,
        couponCode: '',
        convenienceFee: 49,
        taxes: Math.round((bookingData.totalAmount || 0) * 0.18),
        surgeFee: 0,
        total: bookingData.totalAmount || 0
      };
    }

    if (!bookingData.timeline || bookingData.timeline.length === 0) {
      bookingData.timeline = [{
        id: `tl-${Date.now()}`,
        status: bookingData.status,
        title: 'Booking Confirmed',
        description: `Service confirmed for customer ${bookingData.userName}.`,
        actor: bookingData.userName,
        actorRole: 'customer',
        timestamp: new Date()
      }];
    }

    // Upsert or link customer profile in User collection safely
    if (bookingData.userPhone || bookingData.userEmail || bookingData.customerId) {
      try {
        const rawPhone = (bookingData.userPhone || '').trim();
        const digitsOnly = rawPhone.replace(/\D/g, '').slice(-10);
        const searchConditions = [];
        if (bookingData.customerId && mongoose.Types.ObjectId.isValid(bookingData.customerId)) {
          searchConditions.push({ _id: bookingData.customerId });
        }
        if (rawPhone) searchConditions.push({ phone: rawPhone });
        if (digitsOnly) {
          searchConditions.push({ phone: digitsOnly });
          searchConditions.push({ phone: `+91 ${digitsOnly}` });
        }
        if (bookingData.userEmail) {
          searchConditions.push({ email: bookingData.userEmail.toLowerCase().trim() });
        }

        let user = searchConditions.length > 0 ? await User.findOne({ $or: searchConditions }) : null;
        if (user) {
          bookingData.customerId = user._id.toString();
          if (user.name && user.name !== 'Customer' && (!bookingData.userName || bookingData.userName === 'Customer')) {
            bookingData.userName = user.name;
            bookingData.customerName = user.name;
          }
        }

        const street = bookingData.address || bookingData.addressDetails?.fullAddress || '';
        const city = bookingData.city;
        const locality = bookingData.serviceZone;
        const pincode = bookingData.addressDetails?.pincode || '';

        if (!user) {
          try {
            user = await User.create({
              name: bookingData.userName || 'Customer',
              phone: rawPhone ? (rawPhone.startsWith('+91') ? rawPhone : `+91 ${digitsOnly || rawPhone}`) : `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
              email: bookingData.userEmail || `${(bookingData.userName || 'customer').toLowerCase().replace(/\s+/g, '.')}-${Date.now()}@example.com`,
              role: 'user',
              status: 'Active',
              city,
              locality,
              hasUCPlus: !!bookingData.hasUCPlus,
              savedAddresses: street ? [{
                id: `addr-${Date.now()}`,
                type: 'Home',
                streetAddress: street,
                locality,
                city,
                pincode,
                isDefault: true
              }] : []
            });
          } catch (createErr) {
            user = await User.findOne({
              $or: [
                ...(rawPhone ? [{ phone: rawPhone }, { phone: digitsOnly }, { phone: `+91 ${digitsOnly}` }] : []),
                ...(bookingData.userEmail ? [{ email: bookingData.userEmail.toLowerCase().trim() }] : [])
              ]
            });
          }
        } else {
          // Update profile details if newly provided
          let updated = false;
          if (bookingData.userName && (!user.name || user.name === 'Customer')) {
            user.name = bookingData.userName;
            updated = true;
          }
          if (bookingData.userEmail && (!user.email || user.email.includes('@example.com'))) {
            user.email = bookingData.userEmail;
            updated = true;
          }
          if (street) {
            const hasStreet = (user.savedAddresses || []).some(a => a.streetAddress === street);
            if (!hasStreet) {
              user.savedAddresses = user.savedAddresses || [];
              user.savedAddresses.push({
                id: `addr-${Date.now()}`,
                type: 'Home',
                streetAddress: street,
                locality,
                city,
                pincode,
                isDefault: user.savedAddresses.length === 0
              });
              updated = true;
            }
          }
          if (updated) {
            await user.save();
          }
        }

        if (user && !bookingData.customerId) {
          bookingData.customerId = user._id.toString();
        }
      } catch (userErr) {
        console.warn('Customer upsert error during booking:', userErr.message);
      }
    }

    let booking;
    inMemoryBookings.set(bookingData.id, bookingData);
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        booking = await Booking.create(bookingData);
        inMemoryBookings.set(booking.id, booking.toObject ? booking.toObject() : booking);
      } catch (dbErr) {
        booking = bookingData;
      }
    } else {
      booking = bookingData;
    }

    // Persist booking in PostgreSQL
    try {
      await syncBookingToPostgres(booking);
    } catch (pgErr) {
      console.warn('[PostgreSQL Sync Warning]:', pgErr.message);
    }

    // Emit real-time WebSocket event
    emitEvent('BOOKING_CREATED', {
      entityId: booking.id,
      room: 'admin:operations',
      payload: booking
    });
    emitEvent('BOOKING_CREATED', {
      entityId: booking.id,
      room: `user:${booking.userId || booking.userPhone}`,
      payload: booking
    });

    // Trigger Intelligent Auto-Assignment Engine if AUTO mode
    if (booking.assignmentMode === 'AUTO') {
      try {
        const assignmentResult = await triggerAutoAssignment(booking);
        if (assignmentResult.success) {
          console.log(`[Booking] Auto-assignment offer dispatched for Booking ${booking.id}`);
        }
      } catch (assignErr) {
        console.warn('[Booking] Auto-assignment notice:', assignErr.message);
      }
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST trigger or retry auto-assignment for an existing booking
router.post('/:id/auto-assign', async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ id: req.params.id }, { bookingReference: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.assignmentMode = 'AUTO';
    await booking.save();
    const result = await triggerAutoAssignment(booking);
    res.json({ success: result.success, message: result.message || 'Auto-assignment evaluated', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update booking (slot, address, status, notes, assignedPartner, cancelReason)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');
    const query = [
      { id: cleanId },
      { id: `#${cleanId}` },
      { bookingReference: cleanId },
      { bookingReference: `#${cleanId}` }
    ];
    if (mongoose.isValidObjectId(id)) {
      query.push({ _id: id });
    }
    const updated = await Booking.findOneAndUpdate(
      { $or: query },
      req.body,
      { new: true }
    );
    if (!updated) {
      if (inMemoryBookings && (inMemoryBookings.has(cleanId) || inMemoryBookings.has(`#${cleanId}`))) {
        const memB = inMemoryBookings.get(cleanId) || inMemoryBookings.get(`#${cleanId}`);
        Object.assign(memB, req.body);
        inMemoryBookings.set(cleanId, memB);
        inMemoryBookings.set(`#${cleanId}`, memB);
        return res.json({ success: true, booking: memB });
      }
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (inMemoryBookings) {
      const plain = updated.toObject ? updated.toObject() : updated;
      inMemoryBookings.set(cleanId, plain);
      inMemoryBookings.set(`#${cleanId}`, plain);
    }

    emitEvent('BOOKING_UPDATED', { bookingId: cleanId, status: updated.status });
    res.json({ success: true, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE booking (Permanent removal across MongoDB Atlas and memory)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');
    const query = [
      { id: cleanId },
      { id: `#${cleanId}` },
      { bookingReference: cleanId },
      { bookingReference: `#${cleanId}` }
    ];
    if (mongoose.isValidObjectId(id)) {
      query.push({ _id: id });
    }

    const existing = await Booking.findOne({ $or: query });

    if (existing) {
      if (existing.status === 'Completed' || existing.assignedProfessional?.id || existing.assignedWorker?.id) {
        // Retain completed/assigned order for technician records & wallet payout audit, hide from customer view
        existing.deletedByCustomer = true;
        await existing.save();
        if (inMemoryBookings) {
          inMemoryBookings.delete(cleanId);
          inMemoryBookings.delete(`#${cleanId}`);
          inMemoryBookings.delete(id);
        }
        emitEvent('BOOKING_DELETED', { bookingId: cleanId });
        return res.json({ success: true, message: `Booking ${cleanId} removed from customer history`, deletedId: cleanId });
      }

      await Booking.deleteOne({ _id: existing._id });
    }

    // Purge from in-memory cache as well
    if (inMemoryBookings) {
      inMemoryBookings.delete(cleanId);
      inMemoryBookings.delete(`#${cleanId}`);
      inMemoryBookings.delete(id);
    }

    try {
      await TrackingSession.deleteMany({
        $or: [
          { bookingId: cleanId },
          { bookingId: `#${cleanId}` },
          { bookingReference: cleanId },
          { bookingReference: `#${cleanId}` }
        ]
      });
    } catch (e) { }

    emitEvent('BOOKING_DELETED', { bookingId: cleanId });
    res.json({ success: true, message: `Booking ${cleanId} deleted permanently`, deletedId: cleanId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET booking review details
router.get('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ id }, { bookingReference: id }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const workerId = booking.assignedProfessional?.id;
    let workerProfile = null;
    if (workerId) {
      workerProfile = await WorkerApplication.findOne({
        $or: [{ id: workerId }, { applicationNumber: workerId }]
      }).lean();
    }

    const effectiveWorkerName = workerProfile?.applicantName || booking.assignedProfessional?.name || 'Professional Specialist';
    const effectiveWorkerTrade = workerProfile?.tradeName || workerProfile?.trade || booking.assignedProfessional?.trade || booking.serviceName || 'Home Services';
    const effectiveWorkerAvatar = workerProfile?.avatar || booking.assignedProfessional?.avatar || '';

    res.json({
      success: true,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference || booking.id,
        serviceName: booking.serviceName || (booking.items?.[0]?.name) || 'Door Repair, Trimming & Hinge Alignment',
        status: booking.status,
        totalAmount: booking.totalAmount,
        slot: booking.slot,
        address: booking.address,
        customerName: booking.userName || 'Customer',
        worker: {
          id: workerId || 'WRK-79932',
          name: effectiveWorkerName,
          trade: effectiveWorkerTrade,
          avatar: effectiveWorkerAvatar,
          phone: workerProfile?.phone || booking.assignedProfessional?.phone || '',
          rating: workerProfile?.rating || booking.assignedProfessional?.rating || 5.0
        },
        existingReview: booking.rating ? {
          rating: booking.rating,
          review: booking.review || '',
          tags: booking.reviewTags || [],
          reviewedAt: booking.reviewedAt || booking.updatedAt
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET published and approved customer reviews for the public landing page
router.get('/reviews/published', async (req, res) => {
  try {
    let reviewsList = [];
    if (mongoose.connection && mongoose.connection.readyState === 1 && Booking) {
      try {
        reviewsList = await Booking.find({
          rating: { $exists: true, $ne: null },
          $or: [
            { reviewIsPublished: true },
            { reviewStatus: 'Approved' }
          ]
        })
          .sort({ reviewedAt: -1, updatedAt: -1 })
          .limit(25)
          .lean();
      } catch (err) { }
    }

    // Merge in-memory approved reviews
    if (inMemoryBookings) {
      for (const [key, b] of inMemoryBookings.entries()) {
        const bRef = String(b.id || b.bookingReference || '').replace(/^#/, '');
        const isApproved = b.reviewIsPublished === true || b.reviewStatus === 'Approved';
        if (b.rating && isApproved && !reviewsList.some(x => String(x.id || x.bookingReference || '').replace(/^#/, '') === bRef)) {
          reviewsList.unshift(b);
        }
      }
    }

    const publicReviews = reviewsList.map(b => {
      const cleanRef = String(b.id || b.bookingReference || 'UC-000000').replace(/^#/, '');
      return {
        id: `pub-rev-${cleanRef}`,
        bookingId: `#${cleanRef}`,
        rawBookingId: cleanRef,
        name: (() => {
          const raw = [b.userName, b.customerName, b.customer?.name, b.addressDetails?.contactName];
          for (const c of raw) {
            if (c && typeof c === 'string') {
              const trimmed = c.trim();
              if (trimmed && trimmed.toLowerCase() !== 'customer' && trimmed.toLowerCase() !== 'verified customer') {
                return trimmed;
              }
            }
          }
          return b.userName || b.customerName || 'Verified Customer';
        })(),
        locality: (b.city ? `${b.city}, Tamil Nadu` : 'Krishnagiri, Tamil Nadu'),
        service: b.serviceName || 'Home Service',
        rating: Number(b.rating) || 5,
        date: (b.reviewedAt || b.updatedAt)
          ? new Date(b.reviewedAt || b.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Recently',
        avatar: (b.userAvatar && !b.userAvatar.includes('unsplash.com')) ? b.userAvatar : null,
        comment: b.review || 'Service completed thoroughly.',
        verified: true,
        isApproved: true,
        isLiveApproved: true
      };
    });

    return res.json({
      success: true,
      count: publicReviews.length,
      reviews: publicReviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST submit review and star ratings for booking and worker (Enters Moderation Queue)
router.post('/:id/review', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanId = String(rawId || '').replace(/^#/, '').trim();
    const { rating, review = '', tags = [], customerName, professionalName, serviceName, city } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars.'
      });
    }

    let booking = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        booking = await Booking.findOne({
          $or: [
            { id: cleanId },
            { id: `#${cleanId}` },
            { bookingReference: cleanId },
            { bookingReference: `#${cleanId}` }
          ]
        });
      } catch (dbErr) { }
    }

    if (!booking) {
      booking = inMemoryBookings.get(cleanId) ||
        inMemoryBookings.get(`#${cleanId}`) ||
        inMemoryBookings.get(String(cleanId).toUpperCase()) ||
        inMemoryBookings.get(`#${String(cleanId).toUpperCase()}`);
    }

    if (!booking) {
      // Build a minimal booking record so customer feedback is never lost
      booking = {
        id: cleanId,
        bookingReference: `#${cleanId}`,
        userName: customerName || 'Customer',
        customerName: customerName || 'Customer',
        assignedPartner: professionalName || 'violet',
        assignedProfessional: { name: professionalName || 'violet' },
        serviceName: serviceName || 'AC & Appliance Repair',
        city: city || 'Krishnagiri',
        status: 'Completed',
        timeline: []
      };
    }

    const commentText = (review || '').trim();
    booking.rating = numRating;
    booking.review = commentText;
    booking.reviewedAt = new Date();
    // Reviews require admin approval before being published to public landing page
    booking.reviewIsPublished = false;
    booking.reviewStatus = 'Pending';

    if (customerName) {
      booking.userName = customerName;
      booking.customerName = customerName;
    }
    if (professionalName) {
      booking.assignedPartner = professionalName;
      if (!booking.assignedProfessional) booking.assignedProfessional = {};
      booking.assignedProfessional.name = professionalName;
    }
    if (serviceName) booking.serviceName = serviceName;
    if (city) booking.city = city;

    if (booking.markModified && booking.save) {
      booking.markModified('review');
      booking.markModified('rating');
      booking.markModified('reviewedAt');
      booking.markModified('reviewIsPublished');
      booking.markModified('reviewStatus');
      if (Array.isArray(booking.timeline)) {
        booking.timeline.push({
          id: `tl-${Date.now()}`,
          status: 'Reviewed',
          title: 'Customer Review Submitted (Pending Admin Approval)',
          description: `Customer rated ${numRating}★: "${commentText.slice(0, 100)}${commentText.length > 100 ? '...' : ''}"`,
          actor: customerName || booking.customerName || booking.userName || 'Customer',
          actorRole: 'Customer',
          timestamp: new Date()
        });
      }
      try { await booking.save(); } catch (saveErr) { }
    }

    // Always update in-memory store under cleanId and #cleanId so it appears instantly across all admin views
    const plainBooking = booking.toObject ? booking.toObject() : { ...booking };
    plainBooking.id = cleanId;
    plainBooking.bookingReference = `#${cleanId}`;
    plainBooking.rating = numRating;
    plainBooking.review = commentText;
    plainBooking.reviewedAt = booking.reviewedAt;
    plainBooking.reviewIsPublished = false;
    plainBooking.reviewStatus = 'Pending';
    if (customerName) {
      plainBooking.userName = customerName;
      plainBooking.customerName = customerName;
    }
    if (professionalName) {
      plainBooking.assignedPartner = professionalName;
      plainBooking.assignedProfessional = { ...(plainBooking.assignedProfessional || {}), name: professionalName };
    }
    if (serviceName) plainBooking.serviceName = serviceName;
    if (city) plainBooking.city = city;

    inMemoryBookings.set(cleanId, plainBooking);
    inMemoryBookings.set(`#${cleanId}`, plainBooking);

    // Synchronize to TrackingSession
    try {
      await TrackingSession.findOneAndUpdate(
        { $or: [{ bookingId: cleanId }, { bookingReference: cleanId }, { bookingId: `#${cleanId}` }, { bookingReference: `#${cleanId}` }] },
        { rating: numRating, review: commentText }
      );
    } catch (trkErr) { }

    // Update Worker Rating & Review History in WorkerApplication
    const workerId = booking.assignedProfessional?.id;
    let workerRating = numRating;
    if (workerId) {
      const worker = await WorkerApplication.findOne({
        $or: [{ id: workerId }, { applicationNumber: workerId }]
      });
      if (worker) {
        const currentRating = worker.rating || 0;
        const currentJobs = worker.jobsCompleted || 1;
        // Cumulative moving average
        const newRating = currentRating === 0
          ? numRating
          : Number(((currentRating * Math.max(1, currentJobs - 1) + numRating) / Math.max(1, currentJobs)).toFixed(2));

        worker.rating = newRating;
        workerRating = newRating;

        if (!Array.isArray(worker.customerReviews)) {
          worker.customerReviews = [];
        }
        worker.customerReviews.push({
          id: `rev-${Date.now()}`,
          bookingId: booking.id,
          customerName: customerName || booking.userName || 'Customer',
          rating: numRating,
          comment: commentText,
          tags,
          createdAt: new Date()
        });
        await worker.save();
      }
    }

    return res.json({
      success: true,
      message: `Thank you! Your ${numRating}-star review for ${booking.assignedProfessional?.name || 'your technician'} has been recorded.`,
      booking: {
        id: booking.id,
        rating: booking.rating,
        review: booking.review,
        reviewedAt: booking.reviewedAt
      },
      workerRating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
