import express from 'express';
import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { getPlatformSettings } from '../controllers/adminSettingsController.js';

const router = express.Router();

let servicesCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL with instant invalidation on admin edits

export function invalidateServicesCache() {
  servicesCache = null;
  lastCacheTime = 0;
}

// Helper to resolve query by id or _id
function buildServiceQuery(paramId) {
  if (!paramId) return { id: '' };
  if (mongoose.Types.ObjectId.isValid(paramId)) {
    return { $or: [{ id: paramId }, { _id: paramId }] };
  }
  return { id: paramId };
}

// GET authoritative public platform settings (real-time sync for Customer, Pro, and Partner portals)
router.get('/platform-settings', getPlatformSettings);

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

    if (req.query.includeArchived !== 'true') {
      query.isArchived = { $ne: true };
      query.status = { $ne: 'Archived' };
    }

    const hasFilter = Boolean(category || categoryTab || search || req.query.includeArchived);
    if (!hasFilter && servicesCache && (Date.now() - lastCacheTime < CACHE_TTL_MS)) {
      return res.json({ success: true, count: servicesCache.length, services: servicesCache, cached: true });
    }

    const services = await Service.find(query).sort({ createdAt: -1 }).lean();
    if (!hasFilter) {
      servicesCache = services;
      lastCacheTime = Date.now();
    }
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET service by custom id or mongo _id
router.get('/:id', async (req, res) => {
  try {
    const query = buildServiceQuery(req.params.id);
    const service = await Service.findOne(query).lean();
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST sync all catalog services into MongoDB Atlas
router.post('/sync-all', async (req, res) => {
  try {
    const list = Array.isArray(req.body.services) ? req.body.services : [];
    let synced = 0;
    for (const item of list) {
      if (!item.id || !item.title) continue;
      const cleanItem = { ...item };
      delete cleanItem._id;
      await Service.findOneAndUpdate(
        { id: cleanItem.id },
        { $set: cleanItem },
        { upsert: true, new: true }
      );
      synced++;
    }
    invalidateServicesCache();
    res.json({ success: true, count: synced, message: `Successfully synced ${synced} services into database.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create service
router.post('/', async (req, res) => {
  try {
    const serviceData = { ...req.body };
    if (!serviceData.title || !serviceData.price) {
      return res.status(400).json({ success: false, message: 'Title and Price are required' });
    }

    if (!serviceData.id) {
      serviceData.id = 'svc-' + Date.now();
    }

    // Upsert or create
    const existing = await Service.findOne({ id: serviceData.id });
    if (existing) {
      delete serviceData._id;
      const updated = await Service.findOneAndUpdate({ id: serviceData.id }, { $set: serviceData }, { new: true });
      return res.status(200).json({ success: true, service: updated });
    }

    const newService = await Service.create(serviceData);
    invalidateServicesCache();
    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update service (with automatic upsert if not existing in DB)
router.put('/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const query = buildServiceQuery(paramId);
    const updateData = { ...req.body };
    delete updateData._id;

    let updated = await Service.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      // Upsert: Create with target ID
      if (!updateData.id) updateData.id = paramId;
      if (!updateData.title) updateData.title = 'Updated Service';
      if (!updateData.price) updateData.price = 299;
      updated = await Service.create(updateData);
    }

    invalidateServicesCache();
    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT archive service
router.put('/:id/archive', async (req, res) => {
  try {
    const paramId = req.params.id;
    const query = buildServiceQuery(paramId);
    const updated = await Service.findOneAndUpdate(
      query,
      { $set: { status: 'Archived', isArchived: true, archivedAt: new Date() } },
      { new: true }
    );
    invalidateServicesCache();
    res.json({ success: true, service: updated, message: `Service ${paramId} soft-archived` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT restore service
router.put('/:id/restore', async (req, res) => {
  try {
    const paramId = req.params.id;
    const query = buildServiceQuery(paramId);
    const updated = await Service.findOneAndUpdate(
      query,
      { $set: { status: 'Active', isArchived: false } },
      { new: true }
    );
    invalidateServicesCache();
    res.json({ success: true, service: updated, message: `Service ${paramId} restored to Active` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const query = buildServiceQuery(paramId);
    const deleted = await Service.findOneAndDelete(query);
    invalidateServicesCache();
    res.json({ success: true, message: `Service ${paramId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
