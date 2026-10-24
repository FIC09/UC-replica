import express from 'express';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';

const router = express.Router();

// GET all bookings or by user phone
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    let query = {};
    if (phone) {
      query.userPhone = phone;
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
    if (!bookingData.items || !bookingData.totalAmount) {
      return res.status(400).json({ success: false, message: 'Cart items and total amount are required' });
    }

    if (!bookingData.id) {
      bookingData.id = 'UC-' + Math.floor(100000 + Math.random() * 900000);
    }
    if (!bookingData.bookingReference) {
      bookingData.bookingReference = bookingData.id;
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

    if (!bookingData.userName) bookingData.userName = 'Customer';
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
    if (!bookingData.city) {
      bookingData.city = bookingData.addressDetails?.city || 'Mumbai';
    }
    if (!bookingData.serviceZone) {
      bookingData.serviceZone = bookingData.addressDetails?.locality || 'Bandra West';
    }
    if (!bookingData.status) {
      bookingData.status = 'Confirmed';
    }
    if (!bookingData.paymentStatus) {
      bookingData.paymentStatus = 'Paid';
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

    // Upsert or create customer profile in User collection
    if (bookingData.userPhone) {
      try {
        const rawPhone = bookingData.userPhone.trim();
        const digitsOnly = rawPhone.replace(/\D/g, '').slice(-10);
        let user = await User.findOne({
          $or: [
            { phone: rawPhone },
            { phone: digitsOnly },
            { phone: `+91 ${digitsOnly}` }
          ]
        });

        const street = bookingData.address || bookingData.addressDetails?.fullAddress || '';
        const city = bookingData.city;
        const locality = bookingData.serviceZone;
        const pincode = bookingData.addressDetails?.pincode || '';

        if (!user) {
          user = await User.create({
            name: bookingData.userName || 'Customer',
            phone: rawPhone.startsWith('+91') ? rawPhone : `+91 ${digitsOnly || rawPhone}`,
            email: bookingData.userEmail || `${(bookingData.userName || 'customer').toLowerCase().replace(/\s+/g, '.')}@example.com`,
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
    res.status(201).json({ success: true, booking });
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
