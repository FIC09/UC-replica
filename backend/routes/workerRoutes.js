import express from 'express';
import { WorkerApplication } from '../models/WorkerApplication.js';

const router = express.Router();

// GET all worker applications
router.get('/', async (req, res) => {
  try {
    const apps = await WorkerApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST submit worker application
router.post('/', async (req, res) => {
  try {
    const appData = req.body;
    if (!appData.applicantName || !appData.phone || !appData.trade) {
      return res.status(400).json({ success: false, message: 'Applicant name, phone and trade are required' });
    }

    if (!appData.id) {
      appData.id = 'WRK-' + Math.floor(10000 + Math.random() * 90000);
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

    const application = await WorkerApplication.create(appData);
    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update status
router.put('/:id', async (req, res) => {
  try {
    const updated = await WorkerApplication.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Worker application not found' });
    }
    res.json({ success: true, application: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE application
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await WorkerApplication.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Worker application not found' });
    }
    res.json({ success: true, message: `Application ${req.params.id} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
