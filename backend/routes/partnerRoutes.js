import express from 'express';
import { PartnerApplication } from '../models/PartnerApplication.js';

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

    if (!appData.id) {
      appData.id = 'PTR-' + Math.floor(10000 + Math.random() * 90000);
    }
    if (!appData.appliedAt) {
      const now = new Date();
      appData.appliedAt = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
    const updated = await PartnerApplication.findOneAndUpdate(
      { id: req.params.id },
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
