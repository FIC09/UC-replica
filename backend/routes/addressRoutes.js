import express from 'express';
import { Address } from '../models/Address.js';

const router = express.Router();

// GET all addresses for a user (Strict Customer Privacy & Isolation)
router.get('/', async (req, res) => {
  try {
    const { phone, userId, email } = req.query;
    if (!phone && !userId && !email) {
      // Enforce strict customer privacy: never leak all addresses if user context is missing
      return res.json({ success: true, count: 0, addresses: [] });
    }

    const conditions = [];
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      conditions.push({ userPhone: new RegExp(cleanPhone || phone, 'i') });
    }
    if (userId) {
      conditions.push({ userId });
    }
    if (email) {
      conditions.push({ userEmail: new RegExp(`^${email.trim()}$`, 'i') });
    }

    const addresses = await Address.find({ $or: conditions }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create address
router.post('/', async (req, res) => {
  try {
    const addressData = req.body;
    if (!addressData.flat || !addressData.locality || !addressData.city) {
      return res.status(400).json({ success: false, message: 'Flat, locality and city are required' });
    }

    if (!addressData.id) {
      addressData.id = 'ADDR-' + Date.now();
    }
    if (!addressData.formatted) {
      addressData.formatted = `${addressData.flat}, ${addressData.locality}, ${addressData.city} - ${addressData.pincode || ''}`;
      if (addressData.landmark) {
        addressData.formatted += ` (${addressData.landmark})`;
      }
    }

    // If marked default, unset other defaults for this user
    if (addressData.isDefault) {
      const cond = [];
      if (addressData.userId) cond.push({ userId: addressData.userId });
      if (addressData.userPhone) {
        const cleanPhone = addressData.userPhone.replace(/\D/g, '').slice(-10);
        cond.push({ userPhone: new RegExp(cleanPhone || addressData.userPhone, 'i') });
      }
      if (addressData.userEmail) cond.push({ userEmail: addressData.userEmail });
      if (cond.length > 0) {
        await Address.updateMany({ $or: cond }, { isDefault: false });
      }
    }

    const newAddress = await Address.create(addressData);
    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update address
router.put('/:id', async (req, res) => {
  try {
    const updated = await Address.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, address: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT set default address
router.put('/:id/default', async (req, res) => {
  try {
    const target = await Address.findOne({ id: req.params.id });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.updateMany(
      { userPhone: target.userPhone },
      { isDefault: false }
    );

    target.isDefault = true;
    await target.save();

    const addresses = await Address.find({ userPhone: target.userPhone }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, address: target, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE address
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Address.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, message: `Address ${req.params.id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
