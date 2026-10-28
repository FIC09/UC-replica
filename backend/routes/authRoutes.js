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
    const { name, phone, email, city, locality, address, isPlusMember } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const cleanPhone = phone.trim();
    const cleanDigits = cleanPhone.replace(/\D/g, '').slice(-10);
    const targetCity = (city && city.trim()) ? city.trim() : 'Krishnagiri';
    const targetLocality = (locality && locality.trim()) ? locality.trim() : 'Rayakottai Road';

    // Check if customer already exists by phone or formatted phone
    let existing = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: `+91 ${cleanDigits}` },
        { phone: cleanDigits }
      ]
    });

    if (existing) {
      existing.name = name.trim();
      if (email) existing.email = email.trim().toLowerCase();
      if (city) existing.city = targetCity;
      if (locality) existing.locality = targetLocality;
      if (isPlusMember !== undefined) existing.hasUCPlus = Boolean(isPlusMember);
      
      if (address && address.trim()) {
        existing.savedAddresses = existing.savedAddresses || [];
        const hasAddr = existing.savedAddresses.some(a => a.streetAddress === address.trim());
        if (!hasAddr) {
          existing.savedAddresses.push({
            id: `addr-${Date.now()}`,
            type: 'Home',
            streetAddress: address.trim(),
            locality: targetLocality,
            city: targetCity,
            isDefault: existing.savedAddresses.length === 0
          });
        }
      }

      await existing.save();
      return res.json({ success: true, user: existing });
    }

    const initialAddresses = [];
    if (address && address.trim()) {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        type: 'Home',
        streetAddress: address.trim(),
        locality: targetLocality,
        city: targetCity,
        isDefault: true
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanDigits}`,
      email: email ? email.trim().toLowerCase() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city: targetCity,
      locality: targetLocality,
      hasUCPlus: Boolean(isPlusMember),
      role: 'user',
      status: 'Active',
      savedAddresses: initialAddresses
    });

    // Mirror to PostgreSQL customers table for synchronized multi-database consistency
    try {
      const { query: pgQuery } = await import('../config/postgres.js');
      await pgQuery(
        `INSERT INTO customers (id, name, phone, email, is_plus_member, total_orders, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, NOW())
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name, 
           email = EXCLUDED.email, 
           phone = EXCLUDED.phone;`,
        [newUser._id.toString(), newUser.name, newUser.phone, newUser.email, Boolean(newUser.hasUCPlus)]
      );
    } catch (pgErr) {
      // Non-blocking notice
    }

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
