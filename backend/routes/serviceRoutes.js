import express from 'express';
import { Service } from '../models/Service.js';

const router = express.Router();

// GET all services with optional search & category filter
router.get('/', async (req, res) => {
  try {
    const { category, categoryTab, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (categoryTab && categoryTab !== 'all') {
      query.categoryTab = categoryTab;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET service by custom id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create service
router.post('/', async (req, res) => {
  try {
    const serviceData = req.body;
    if (!serviceData.title || !serviceData.price) {
      return res.status(400).json({ success: false, message: 'Title and Price are required' });
    }

    if (!serviceData.id) {
      serviceData.id = 'svc-' + Date.now();
    }

    const newService = await Service.create(serviceData);
    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  try {
    const updated = await Service.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Service.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: `Service ${req.params.id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
