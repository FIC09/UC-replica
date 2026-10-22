import express from 'express';
import { Booking } from '../models/Booking.js';

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
    const booking = await Booking.findOne({ id: req.params.id });
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
    const bookingData = req.body;
    if (!bookingData.items || !bookingData.totalAmount) {
      return res.status(400).json({ success: false, message: 'Cart items and total amount are required' });
    }

    if (!bookingData.id) {
      bookingData.id = 'UC-' + Math.floor(100000 + Math.random() * 900000);
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
