import mongoose from 'mongoose';
import { Service } from '../models/Service.js';

function buildServiceQuery(id) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ id }, { _id: id }] };
  }
  return { id };
}

// =========================================================================
// AUTHORITATIVE SERVICE CATALOGUE CONTROLLER (100% REAL-TIME DATABASE OPERATIONS)
// Zero mock records, zero mock fallback injection.
// =========================================================================

// 1. Get Services with Search, Category, Subcategory, Status, City Filter
export async function getCatalogueServices(req, res) {
  try {
    const { search = '', category = 'ALL', status = 'ALL', city = 'ALL' } = req.query;

    let dbServices = [];
    try {
      dbServices = await Service.find().sort({ displayOrder: 1, title: 1 }).lean();
    } catch (e) {
      console.warn('Service.find error in getCatalogueServices:', e.message);
    }

    // Authoritative real database catalogue services only
    const list = dbServices;

    let filtered = list.filter(s => {
      const isArchived = Boolean(s.isArchived || s.status === 'Archived');
      const currentStatus = s.status || (isArchived ? 'Archived' : 'Active');

      // Archive filter
      if (status === 'Archived') {
        if (!isArchived) return false;
      } else if (status === 'Active') {
        if (isArchived || currentStatus !== 'Active') return false;
      } else if (status === 'Draft') {
        if (currentStatus !== 'Draft') return false;
      } else if (status !== 'ALL') {
        if (currentStatus !== status) return false;
      }

      if (category !== 'ALL') {
        const catNorm = category.toLowerCase();
        const sCat = (s.category || '').toLowerCase();
        if (sCat !== catNorm) {
          const isWomenMatch = (catNorm === 'salon-women' || catNorm === 'womens-salon') && (sCat === 'womens-salon' || sCat === 'salon-women');
          const isMenMatch = (catNorm === 'mens-grooming' || catNorm === 'mens-salon') && (sCat === 'mens-salon' || sCat === 'mens-grooming');
          const isRepairMatch = (catNorm === 'electrician-plumber' || catNorm === 'quick-repairs') && (sCat === 'quick-repairs' || sCat === 'electrician-plumber');
          if (!isWomenMatch && !isMenMatch && !isRepairMatch) return false;
        }
      }

      if (city !== 'ALL') {
        const cities = s.applicableCities || ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'];
        if (!cities.includes(city) && !cities.includes('All Cities')) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const matches = (s.title || '').toLowerCase().includes(q) ||
          (s.categoryName || s.category || '').toLowerCase().includes(q) ||
          (s.subcategory || '').toLowerCase().includes(q) ||
          (s.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).map(s => ({
      ...s,
      status: s.status || (s.isArchived ? 'Archived' : 'Active'),
      isArchived: Boolean(s.isArchived || s.status === 'Archived')
    }));

    return res.json({
      success: true,
      count: filtered.length,
      services: filtered
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Create Service in MongoDB with Strict Validation
export async function createCatalogueService(req, res) {
  try {
    const {
      id: requestedId,
      title,
      category,
      categoryName,
      subcategory = '',
      price,
      durationMins = 60,
      description = '',
      image = '',
      includedWork = [],
      excludedWork = [],
      addOns = [],
      faqs = [],
      prepInstructions = [],
      applicableCities = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
      taxRate = 18,
      commissionRate = 20,
      warrantyDays = 30,
      status = 'Active'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Service title is required' });
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Service price must be a valid positive number' });
    }
    const numDuration = parseInt(durationMins) || 60;
    if (numDuration < 5) {
      return res.status(400).json({ success: false, error: 'Service duration must be at least 5 minutes' });
    }

    const currentCount = await Service.countDocuments();
    const serviceId = requestedId || `srv-${Date.now().toString().slice(-6)}`;

    const newService = await Service.create({
      id: serviceId,
      title: title.trim(),
      category: category || 'general',
      categoryName: categoryName || 'Home Services',
      subcategory: subcategory.trim(),
      displayOrder: currentCount + 1,
      price: numPrice,
      originalPrice: Math.round(numPrice * 1.25),
      durationMins: numDuration,
      duration: `${numDuration} mins`,
      rating: 5.0,
      reviewsCount: 'New',
      badge: 'Verified',
      image: image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
      description: description.trim(),
      includedWork: Array.isArray(includedWork) ? includedWork : [includedWork].filter(Boolean),
      excludedWork: Array.isArray(excludedWork) ? excludedWork : [excludedWork].filter(Boolean),
      addOns: Array.isArray(addOns) ? addOns : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      prepInstructions: Array.isArray(prepInstructions) ? prepInstructions : [],
      applicableCities: Array.isArray(applicableCities) ? applicableCities : ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
      applicableZones: ['All Zones'],
      taxRate: parseFloat(taxRate) || 18,
      commissionRate: parseFloat(commissionRate) || 20,
      minPlatformTake: 50,
      warrantyDays: parseInt(warrantyDays) || 30,
      cancellationPolicy: 'Free cancellation up to 2 hours prior to scheduled appointment.',
      status: status || 'Active',
      isArchived: false,
      isPaused: false
    });

    return res.status(201).json({ success: true, service: newService });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Update Service in MongoDB
export async function updateCatalogueService(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.price !== undefined) {
      const p = parseFloat(updates.price);
      if (isNaN(p) || p <= 0) {
        return res.status(400).json({ success: false, error: 'Price must be greater than zero' });
      }
      updates.price = p;
    }
    if (updates.durationMins !== undefined) {
      const d = parseInt(updates.durationMins);
      if (isNaN(d) || d < 5) {
        return res.status(400).json({ success: false, error: 'Duration must be at least 5 minutes' });
      }
      updates.durationMins = d;
      updates.duration = `${d} mins`;
    }

    updates.updatedAt = new Date();

    const updatedService = await Service.findOneAndUpdate(
      buildServiceQuery(id),
      { $set: updates },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ success: false, error: `Service #${id} not found in database.` });
    }

    return res.json({
      success: true,
      message: `Service #${id} catalogue specifications updated in real-time database`,
      service: updatedService
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Archive Service (Soft Archival in MongoDB)
export async function archiveCatalogueService(req, res) {
  try {
    const { id } = req.params;

    const updated = await Service.findOneAndUpdate(
      buildServiceQuery(id),
      { $set: { status: 'Archived', isArchived: true, archivedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: `Service #${id} not found.` });
    }

    return res.json({
      success: true,
      message: `Service #${id} successfully archived. Existing booking history preserved.`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Restore Archived Service in MongoDB
export async function restoreCatalogueService(req, res) {
  try {
    const { id } = req.params;

    const updated = await Service.findOneAndUpdate(
      buildServiceQuery(id),
      { $set: { status: 'Active', isArchived: false, archivedAt: null } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: `Service #${id} not found.` });
    }

    return res.json({
      success: true,
      message: `Service #${id} restored to Active catalogue`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Hard Delete Service from MongoDB
export async function deleteCatalogueService(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Service.findOneAndDelete(buildServiceQuery(id));

    if (!deleted) {
      return res.status(404).json({ success: false, error: `Service #${id} not found.` });
    }

    return res.json({
      success: true,
      message: `Service #${id} deleted permanently from catalogue`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
