import express from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { autoAssignWorkerToBooking, triggerAutoAssignment } from '../services/assignmentEngine.js';
import { validateKrishnagiriServiceArea } from '../services/geofenceService.js';
import { syncBookingToPostgres } from '../services/postgresService.js';
import { emitEvent } from '../services/websocketService.js';

const router = express.Router();

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
    let existingBooking = await Booking.findOne({ id: candidateId }).lean();
    while (existingBooking) {
      candidateId = 'UC-' + Math.floor(100000 + Math.random() * 900000);
      existingBooking = await Booking.findOne({ id: candidateId }).lean();
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

    const booking = await Booking.create(bookingData);

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
    const updated = await Booking.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Booking.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: `Booking ${req.params.id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
