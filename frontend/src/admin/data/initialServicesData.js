import { SERVICES } from '../../data/servicesData.js';

// Map the 51 customer-facing catalogue services into rich admin SKU specifications
export function generate51AdminServices() {
  return SERVICES.map((s, idx) => {
    let durationMins = 60;
    if (s.duration) {
      const match = s.duration.match(/\d+/);
      if (match) durationMins = parseInt(match[0], 10);
      if (s.duration.includes('hr')) durationMins = durationMins * 60;
    }

    const catNameMap = {
      'ac-appliances': 'AC & Appliance Care',
      'native-ro': 'Native RO & Water Purifiers',
      'womens-salon': 'Salon for Women',
      'salon-women': 'Salon for Women',
      'mens-salon': 'Men\'s Grooming & Spa',
      'mens-grooming': 'Men\'s Grooming & Spa',
      'cleaning-pest': 'Cleaning & Pest Control',
      'quick-repairs': 'Quick Home Repairs & Handyman',
      'painting-decor': 'Home Painting & Wall Decor'
    };

    return {
      id: s.id,
      title: s.title,
      category: s.category,
      categoryName: catNameMap[s.category] || 'Home Services',
      subcategory: s.subcategory || 'General',
      displayOrder: idx + 1,
      price: s.price || 499,
      originalPrice: s.originalPrice || Math.round((s.price || 499) * 1.25),
      durationMins: durationMins,
      duration: s.duration || `${durationMins} mins`,
      rating: s.rating || 4.85,
      reviewsCount: s.reviewsCount || '10K reviews',
      badge: s.badge || (idx < 5 ? 'Bestseller' : 'Verified'),
      image: s.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
      description: s.description || 'Verified doorstep service delivered by background-checked partner technicians.',
      includedWork: s.features && s.features.length > 0 ? s.features : [
        'Complete inspection & functional diagnostic',
        'Standard tools & equipment setup',
        'Clean work area post-completion'
      ],
      excludedWork: [
        'Major spare parts (charged transparently as per rate card)',
        'Concealed civil alterations'
      ],
      addOns: [
        { id: `addon-${s.id}-1`, title: 'Safety & Hygiene Kit Upgrade', price: 99, durationMins: 10 }
      ],
      faqs: [
        { question: 'What tools does the professional carry?', answer: 'The pro carries a complete certified toolbag, diagnostic gear, and safety shoe covers.' }
      ],
      prepInstructions: [
        'Ensure power/water access is available',
        'Keep fragile personal items secured'
      ],
      applicableCities: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri'],
      applicableZones: ['All Hubs'],
      taxRate: 18,
      commissionRate: 20,
      minPlatformTake: 80,
      warrantyDays: 30,
      cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
      status: 'Active',
      isArchived: false,
      createdAt: new Date(Date.now() - (idx * 86400000)).toISOString()
    };
  });
}

let _cachedServices = null;

export function getCachedAdminServices() {
  if (!_cachedServices) {
    try {
      const stored = localStorage.getItem('uc_admin_51_services');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 40) {
          _cachedServices = parsed;
          return _cachedServices;
        }
      }
    } catch {}

    _cachedServices = generate51AdminServices();
    try {
      localStorage.setItem('uc_admin_51_services', JSON.stringify(_cachedServices));
    } catch {}
  }
  return _cachedServices;
}

export function saveCachedAdminServices(list) {
  _cachedServices = list;
  try {
    localStorage.setItem('uc_admin_51_services', JSON.stringify(list));
  } catch {}
}
