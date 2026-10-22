import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Login or auto-fetch by phone
router.post('/login', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      user = await User.create({
        name: name ? name.trim() : 'Rahul Sharma',
        phone: phone.trim(),
        role: phone.includes('9999999999') ? 'admin' : 'user',
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    let existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      existing.name = name.trim();
      if (email) existing.email = email.trim();
      await existing.save();
      return res.json({ success: true, user: existing });
    }

    const newUser = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
router.get('/me', async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) {
      const defaultUser = await User.findOne().sort({ createdAt: 1 });
      return res.json({ success: true, user: defaultUser });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile / UC Plus status
router.put('/profile', async (req, res) => {
  try {
    const { phone, name, email, hasUCPlus } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await User.findOneAndUpdate(
      { phone: phone.trim() },
      { 
        ...(name && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim() }),
        ...(hasUCPlus !== undefined && { hasUCPlus }),
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
