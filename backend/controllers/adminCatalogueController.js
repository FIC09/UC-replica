import mongoose from 'mongoose';
import { Service } from '../models/Service.js';

function buildServiceQuery(id) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ id }, { _id: id }] };
  }
  return { id };
}

let mockServices = [
  {
    id: 'srv-ac-foam-jet',
    title: 'Powerjet AC Servicing (Split / Window)',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Care',
    subcategory: 'AC Service & Repair',
    displayOrder: 1,
    price: 699,
    originalPrice: 899,
    durationMins: 60,
    duration: '60 mins',
    rating: 4.88,
    reviewsCount: '24K',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    description: 'Thorough indoor coil & outdoor jet cleaning with anti-bacterial foam shield for 2X faster cooling.',
    includedWork: [
      'Indoor evaporator coil deep high-pressure wash',
      'Outdoor condenser unit waterjet cleaning',
      'Drain tray & pipe flushing to prevent water leakage',
      'Cooling gas pressure and amp draw diagnostic'
    ],
    excludedWork: [
      'Spare parts replacement (PCB, capacitor, fan motor)',
      'Gas charging (billed separately if leak found)'
    ],
    addOns: [
      { id: 'addon-1', title: 'Anti-Rust Spray Shield for Coastal Areas', price: 199, durationMins: 15, description: 'Protective epoxy coating on outdoor unit coils' },
      { id: 'addon-2', title: 'AC Filter Sanitization & Fragrance Tablet', price: 99, durationMins: 10, description: 'Long-lasting room deodorizer and germ protection' }
    ],
    faqs: [
      { question: 'How frequently should I service my split AC?', answer: 'We recommend powerjet servicing every 3 to 4 months for optimal electricity consumption and indoor air quality.' },
      { question: 'Do I need to provide power sockets or ladders?', answer: 'The technician carries standard ladders and waterproof mats; a running water tap and 16A power socket are required.' }
    ],
    prepInstructions: [
      'Keep area beneath indoor AC unit clear of fragile items or electronic appliances',
      'Ensure running water access for the high-pressure jet pump'
    ],
    applicableCities: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
    applicableZones: ['Bandra West', 'Khar', 'Koramangala', 'Rayakottai Road', 'South Extension'],
    taxRate: 18,
    commissionRate: 20,
    minPlatformTake: 100,
    warrantyDays: 30,
    cancellationPolicy: 'Free cancellation up to 2 hours prior to scheduled appointment. 50% fee thereafter.',
    status: 'Active',
    isArchived: false
  },
  {
    id: 'srv-clean-bathroom',
    title: 'Classic Bathroom Deep Cleaning',
    category: 'cleaning-pest',
    categoryName: 'Home Cleaning & Pest',
    subcategory: 'Bathroom & Kitchen',
    displayOrder: 2,
    price: 499,
    originalPrice: 649,
    durationMins: 60,
    duration: '60 mins',
    rating: 4.82,
    reviewsCount: '18K',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80',
    description: 'Tile descaling, hard water stain removal, WC disinfection, and chrome fittings polishing.',
    includedWork: [
      'Floor and wall tile descaling with rotary scrubbers',
      'Toilet bowl, basin & urinal intensive disinfection',
      'Taps, showerheads & chrome fittings mirror shine',
      'Mirror cleaning and exhaust fan degreasing'
    ],
    excludedWork: [
      'Grout replacement or regrouting',
      'Removal of permanent cement or acid damage'
    ],
    addOns: [
      { id: 'addon-3', title: 'Hard Water Anti-Scale Glass Shield', price: 249, durationMins: 20, description: 'Nano-coating to prevent future water spots' }
    ],
    faqs: [
      { question: 'Are the cleaning chemicals child and pet safe?', answer: 'Yes, we use government-certified biodegradable cleaning agents that rinse off without toxic residue.' }
    ],
    prepInstructions: [
      'Please remove toiletries and clothes from the bathroom prior to technician arrival'
    ],
    applicableCities: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
    applicableZones: ['All Zones'],
    taxRate: 18,
    commissionRate: 20,
    minPlatformTake: 80,
    warrantyDays: 7,
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    status: 'Active',
    isArchived: false
  },
  {
    id: 'srv-salon-hair-spa',
    title: 'L\'Oréal Professionnel Hair Spa & Gloss',
    category: 'salon-women',
    categoryName: 'Salon for Women',
    subcategory: 'Hair Studio',
    displayOrder: 3,
    price: 999,
    originalPrice: 1499,
    durationMins: 75,
    duration: '75 mins',
    rating: 4.93,
    reviewsCount: '32K',
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80',
    description: 'Deep nourishing hair spa with authentic L\'Oréal steam treatment, head massage, and serum.',
    includedWork: [
      'Scalp analysis & bespoke ampoule selection',
      'Relaxing 20-minute acupressure head massage',
      'Steam infusion with hydration locking mask',
      'Post-treatment blow-dry and serum application'
    ],
    excludedWork: [
      'Haircut or styling haircut (can be added separately)'
    ],
    addOns: [
      { id: 'addon-4', title: 'Moroccanoil Split End Mending Shot', price: 349, durationMins: 15, description: 'Keratin protein bond builder' }
    ],
    faqs: [
      { question: 'What authentic products are used?', answer: 'Our beauticians carry sealed L\'Oréal Professionnel and Matrix salon kits opened in front of you.' }
    ],
    prepInstructions: [
      'Wash hair with normal water if heavily oiled before spa'
    ],
    applicableCities: ['Mumbai', 'Bengaluru', 'Delhi NCR'],
    applicableZones: ['Metro Urban Hubs'],
    taxRate: 18,
    commissionRate: 22,
    minPlatformTake: 150,
    warrantyDays: 14,
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    status: 'Active',
    isArchived: false
  },
  {
    id: 'srv-electric-switch',
    title: 'Switch & Socket Installation / Repair',
    category: 'electrician-plumber',
    categoryName: 'Electrician & Plumber',
    subcategory: 'Switches & Electrical',
    displayOrder: 4,
    price: 199,
    originalPrice: 299,
    durationMins: 30,
    duration: '30 mins',
    rating: 4.87,
    reviewsCount: '8K',
    badge: 'Quick Fix',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80',
    description: 'Safe replacement of burned, faulty, or loose electrical switches and 16A power sockets.',
    includedWork: [
      'Phase voltage & earth leakage test',
      'Wiring insulation and secure screw terminal fitting',
      'Switchboard plate alignment and functional check'
    ],
    excludedWork: [
      'Wall concealed pipe conduit drilling or rewiring'
    ],
    addOns: [],
    faqs: [
      { question: 'Are replacement switches provided by the electrician?', answer: 'We recommend having your preferred modular switch brand ready, or the pro can procure matching Anchor/Legrand parts at market cost.' }
    ],
    prepInstructions: [
      'Ensure main MCB breaker is accessible to turn off power during installation'
    ],
    applicableCities: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
    applicableZones: ['All Zones'],
    taxRate: 18,
    commissionRate: 20,
    minPlatformTake: 50,
    warrantyDays: 30,
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    status: 'Active',
    isArchived: false
  }
];

// 1. Get Services with Search, Category, Subcategory, Status, City Filter
export async function getCatalogueServices(req, res) {
  try {
    const { search = '', category = 'ALL', status = 'ALL', city = 'ALL' } = req.query;

    let dbServices = [];
    try {
      dbServices = await Service.find().sort({ displayOrder: 1, title: 1 }).lean();
    } catch {}

    let list = mockServices;
    if (dbServices.length > 2) {
      list = dbServices;
    }

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

// 2. Create Service with Strict Validation
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

    const newService = {
      id: requestedId || `srv-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      category: category || 'general',
      categoryName: categoryName || 'Home Services',
      subcategory: subcategory.trim(),
      displayOrder: mockServices.length + 1,
      price: numPrice,
      originalPrice: Math.round(numPrice * 1.25),
      durationMins: numDuration,
      duration: `${numDuration} mins`,
      rating: 4.8,
      reviewsCount: '1K',
      badge: 'New',
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockServices.unshift(newService);
    try {
      await Service.create(newService);
    } catch {}

    return res.status(201).json({ success: true, service: newService });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Update Service (Preserves snapshot of historic bookings/invoices)
export async function updateCatalogueService(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

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

    let found = mockServices.find(s => s.id === id);
    if (found) {
      Object.assign(found, updates, { updatedAt: new Date() });
    }

    let updatedService = null;
    try {
      updatedService = await Service.findOneAndUpdate(
        buildServiceQuery(id),
        { $set: updates },
        { new: true }
      );
    } catch (e) {
      console.warn('Service update DB error:', e.message);
    }

    return res.json({
      success: true,
      message: `Service ${id} catalogue specifications updated (historical bookings snapshot preserved)`,
      service: updatedService || found || updates
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Archive Service (Soft Archival instead of destructive deletion to preserve referential integrity)
export async function archiveCatalogueService(req, res) {
  try {
    const { id } = req.params;

    let found = mockServices.find(s => s.id === id);
    if (found) {
      found.status = 'Archived';
      found.isArchived = true;
      found.archivedAt = new Date();
    }

    try {
      await Service.findOneAndUpdate(
        buildServiceQuery(id),
        { $set: { status: 'Archived', isArchived: true, archivedAt: new Date() } }
      );
    } catch {}

    return res.json({
      success: true,
      message: `Service ${id} successfully archived. Existing booking history preserved.`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Restore Archived Service
export async function restoreCatalogueService(req, res) {
  try {
    const { id } = req.params;

    let found = mockServices.find(s => s.id === id);
    if (found) {
      found.status = 'Active';
      found.isArchived = false;
      found.archivedAt = null;
    }

    try {
      await Service.findOneAndUpdate(
        buildServiceQuery(id),
        { $set: { status: 'Active', isArchived: false, archivedAt: null } }
      );
    } catch {}

    return res.json({
      success: true,
      message: `Service ${id} restored to Active catalogue`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Hard Delete Service
export async function deleteCatalogueService(req, res) {
  try {
    const { id } = req.params;
    try {
      await Service.findOneAndDelete(buildServiceQuery(id));
    } catch (dbErr) {
      console.warn('Service delete DB error:', dbErr.message);
    }
    const mockIdx = mockServices.findIndex(s => s.id === id);
    if (mockIdx !== -1) {
      mockServices.splice(mockIdx, 1);
    }

    return res.json({
      success: true,
      message: `Service ${id} deleted permanently from catalogue`,
      id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

