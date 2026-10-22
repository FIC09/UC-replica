import express from 'express';
import { Address } from '../models/Address.js';

const router = express.Router();

// GET all addresses for a user
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    let query = {};
    if (phone) {
      query.userPhone = phone;
    }
    const addresses = await Address.find(query).sort({ isDefault: -1, createdAt: -1 });
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

    // If marked default, unset other defaults
    if (addressData.isDefault) {
      await Address.updateMany(
        { userPhone: addressData.userPhone || '+91 98201 44521' },
        { isDefault: false }
      );
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
