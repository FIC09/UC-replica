import express from 'express';
import { PartnerApplication } from '../models/PartnerApplication.js';
import { validateIndianMobile, validateAndNormalizeEmail } from '../utils/validation.js';

const router = express.Router();

// GET all partner applications
router.get('/', async (req, res) => {
  try {
    const apps = await PartnerApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST submit partner application
router.post('/', async (req, res) => {
  try {
    const appData = req.body;
    if (!appData.businessName || !appData.ownerName || !appData.phone) {
      return res.status(400).json({ success: false, message: 'Business name, owner name and phone are required' });
    }

    const phoneCheck = validateIndianMobile(appData.phone);
    if (!phoneCheck.isValid) {
      return res.status(400).json({ success: false, message: phoneCheck.message });
    }
    appData.phone = phoneCheck.formatted;

    if (appData.email) {
      const emailCheck = validateAndNormalizeEmail(appData.email);
      if (!emailCheck.isValid) {
        return res.status(400).json({ success: false, message: emailCheck.message });
      }
      appData.email = emailCheck.email;
    }
    if (appData.password) {
      appData.password = appData.password.trim();
    }

    const application = await PartnerApplication.create(appData);
    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update status
router.put('/:id', async (req, res) => {
  try {
    const filter = req.params.id?.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const updated = await PartnerApplication.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Partner application not found' });
    }
    res.json({ success: true, application: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE application
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PartnerApplication.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Partner application not found' });
    }
    res.json({ success: true, message: `Application ${req.params.id} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
