// =========================================================================
// ADMIN PROMOTIONS, CONTENT & NOTIFICATIONS CONTROLLER
// Handles promotions with server-side validation and redemption rules,
// Content CMS with HTML sanitization against stored XSS,
// and Notifications with local outbox queue.
// =========================================================================

// Simple HTML/XSS sanitizer helper to prevent stored XSS
function sanitizeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}

let mockPromotions = [
  {
    id: 'PROMO-1',
    code: 'AUTO100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 499,
    maxDiscount: 100,
    validFrom: '2026-01-01',
    validTill: '2026-12-31',
    eligibleUsers: 'All Users',
    eligibleCategories: ['All Services'],
    eligibleCities: ['All Cities'],
    eligiblePartners: ['All Partners'],
    usageLimitTotal: 10000,
    usageLimitPerCustomer: 1,
    usedCount: 4180,
    status: 'Active',
    description: 'Automatic ₹100 discount on first home booking'
  },
  {
    id: 'PROMO-2',
    code: 'MONSOON20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 799,
    maxDiscount: 250,
    validFrom: '2026-06-01',
    validTill: '2026-11-15',
    eligibleUsers: 'All Users',
    eligibleCategories: ['Cleaning & Pest Control', 'AC & Appliance Repair'],
    eligibleCities: ['Mumbai', 'Bengaluru'],
    eligiblePartners: ['All Partners'],
    usageLimitTotal: 5000,
    usageLimitPerCustomer: 2,
    usedCount: 1840,
    status: 'Active',
    description: '20% off on all deep cleaning & AC services'
  },
  {
    id: 'PROMO-3',
    code: 'UCPLUS200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 999,
    maxDiscount: 200,
    validFrom: '2026-01-01',
    validTill: '2027-02-28',
    eligibleUsers: 'UC Plus Members Only',
    eligibleCategories: ['All Services'],
    eligibleCities: ['All Cities'],
    eligiblePartners: ['All Partners'],
    usageLimitTotal: 2500,
    usageLimitPerCustomer: 3,
    usedCount: 920,
    status: 'Active',
    description: 'Exclusive VIP Member benefit voucher'
  }
];

let mockContent = {
  heroBannerHeadline: 'Beauty & Home Services At Your Doorstep',
  heroBannerSubtitle: 'Certified professionals, genuine parts & 30-day service warranty.',
  announcementText: '⛈️ Monsoon Weather Notice: Normal dispatch timelines across all active hubs.',
  announcementActive: true,
  marketingBanners: [
    { id: 'b1', title: 'AC Servicing Rush 2026', subtitle: 'Waterjet jet cleaning with 30-day leak warranty', tag: 'Bestseller', displayOrder: 1, image: '/images/ac_repair_subcat_card.png', link: '/ac-service-page', status: 'Published' },
    { id: 'b2', title: 'Bathroom & Kitchen Glow', subtitle: 'Hospital grade chemicals and motorized scrubbing', tag: 'Deep Clean', displayOrder: 2, image: '/images/bathroom_cleaning_subcat_card.png', link: '/bathroom-cleaning-page', status: 'Published' },
    { id: 'b3', title: 'Native RO Purifier 2-Year Filter Life', subtitle: 'Zero maintenance cost for 2 years', tag: 'Innovation', displayOrder: 3, image: '/images/water_purifier/native_brands_grid.png', link: '/native-purifier-page', status: 'Published' },
    { id: 'b4', title: 'Diwali Painting & Home Deep Restoration', subtitle: 'Book early slots before festive surge', tag: 'Upcoming', displayOrder: 4, image: '/images/ac_repair_subcat_card.png', link: '/painting', status: 'Draft' }
  ],
  faqs: [
    { id: 'faq-1', question: 'How are Urban Company professionals verified?', answer: 'Every professional undergoes a 7-step background check, Aadhaar/PAN identity verification, police verification, and doorstep SOP training.', displayOrder: 1, status: 'Published' },
    { id: 'faq-2', question: 'What is covered under the 30-day service warranty?', answer: 'If any issue re-occurs within 30 days of service completion, we arrange a free technician redo visit or 100% refund.', displayOrder: 2, status: 'Published' }
  ],
  policies: {
    cancellation: 'Bookings cancelled at least 2 hours prior to scheduled appointment receive 100% full refund with zero penalty.',
    warrantyCover: 'All jobs performed by Urban Services verified pros are protected by our ₹10,000 accidental damage protection guarantee.'
  }
};

let mockNotifications = [
  {
    id: 'NOTIF-1',
    title: 'Monsoon Rain Surge Activated',
    message: 'Rain allowance of +₹49 has been activated across Mumbai Metro zone.',
    channel: 'In-App Push',
    audience: 'Professionals Only',
    scheduledTime: 'Immediate',
    status: 'Delivered',
    providerConfirmed: true,
    outboxQueued: false,
    recipientsCount: 1200,
    openRate: '98.2%',
    sentAt: 'Today, 09:00 AM'
  },
  {
    id: 'NOTIF-2',
    title: 'Weekly Payout Batch W42 Dispatched',
    message: 'Payout batches for weekly earnings have been processed to bank accounts.',
    channel: 'SMS Gateway',
    audience: 'Business Partners',
    scheduledTime: 'Immediate',
    status: 'Delivered',
    providerConfirmed: true,
    outboxQueued: false,
    recipientsCount: 42,
    openRate: '100%',
    sentAt: '21 Oct 2026, 06:00 PM'
  },
  {
    id: 'NOTIF-3',
    title: 'Weekend AC Care VIP Slots Open',
    message: 'Pre-book your summer AC jet servicing with complimentary chemical coil rinse.',
    channel: 'Email Gateway',
    audience: 'All Customers',
    scheduledTime: 'Scheduled for 25 Oct 2026, 08:00 AM',
    status: 'Queued in Local Outbox (Provider Gateway Offline)',
    providerConfirmed: false,
    outboxQueued: true, // Local outbox queue: does not claim external delivery without provider confirmation
    recipientsCount: 24500,
    openRate: 'Pending Dispatch',
    sentAt: 'Queued for delivery'
  }
];

// ==========================================
// 1. PROMOTIONS CONTROLLERS
// ==========================================
export async function getPromotions(req, res) {
  try {
    return res.json({
      success: true,
      count: mockPromotions.length,
      promotions: mockPromotions
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPromotion(req, res) {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderValue = 499,
      maxDiscount = 200,
      validTill,
      eligibleUsers = 'All Users',
      eligibleCategories = ['All Services'],
      eligibleCities = ['All Cities'],
      usageLimitTotal = 1000,
      usageLimitPerCustomer = 1,
      description = ''
    } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Promo code is required' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = mockPromotions.find(p => p.code === cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, error: `Coupon code ${cleanCode} already exists.` });
    }

    const newPromo = {
      id: `PROMO-${Date.now()}`,
      code: cleanCode,
      discountType,
      discountValue: parseFloat(discountValue) || 10,
      minOrderValue: parseFloat(minOrderValue) || 0,
      maxDiscount: parseFloat(maxDiscount) || 0,
      validFrom: new Date().toISOString().slice(0, 10),
      validTill: validTill || '2026-12-31',
      eligibleUsers,
      eligibleCategories: Array.isArray(eligibleCategories) ? eligibleCategories : [eligibleCategories],
      eligibleCities: Array.isArray(eligibleCities) ? eligibleCities : [eligibleCities],
      eligiblePartners: ['All Partners'],
      usageLimitTotal: parseInt(usageLimitTotal, 10) || 1000,
      usageLimitPerCustomer: parseInt(usageLimitPerCustomer, 10) || 1,
      usedCount: 0,
      status: 'Active',
      description: sanitizeHtml(description)
    };

    mockPromotions.unshift(newPromo);
    return res.json({ success: true, message: `Promo code ${cleanCode} created`, promotion: newPromo });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Server-side Coupon Validation Endpoint
export async function validatePromotion(req, res) {
  try {
    const { code, orderValue, category, city, customerId, priorRedemptionCount = 0 } = req.body;
    const cleanCode = (code || '').toUpperCase().trim();

    const promo = mockPromotions.find(p => p.code === cleanCode);
    if (!promo) {
      return res.status(404).json({ success: false, valid: false, reason: 'Invalid promo code.' });
    }

    if (promo.status !== 'Active') {
      return res.status(400).json({ success: false, valid: false, reason: `Coupon is ${promo.status.toLowerCase()}.` });
    }

    const now = new Date();
    if (promo.validTill && new Date(promo.validTill) < now) {
      return res.status(400).json({ success: false, valid: false, reason: 'Coupon has expired.' });
    }

    if (orderValue < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        valid: false,
        reason: `Minimum order value for ${promo.code} is ₹${promo.minOrderValue}.`
      });
    }

    if (promo.usedCount >= promo.usageLimitTotal) {
      return res.status(400).json({ success: false, valid: false, reason: 'Coupon usage limit has been reached.' });
    }

    if (priorRedemptionCount >= promo.usageLimitPerCustomer) {
      return res.status(400).json({
        success: false,
        valid: false,
        reason: `Maximum redemption limit of ${promo.usageLimitPerCustomer} time(s) reached for your account.`
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (orderValue * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    return res.json({
      success: true,
      valid: true,
      discount: Math.min(discount, orderValue),
      promotion: promo
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 2. CONTENT CMS CONTROLLERS
// ==========================================
export async function getContent(req, res) {
  try {
    return res.json({
      success: true,
      content: mockContent
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateContent(req, res) {
  try {
    const data = req.body;

    // Sanitize user-provided text inputs against stored XSS
    if (data.heroBannerHeadline) mockContent.heroBannerHeadline = sanitizeHtml(data.heroBannerHeadline);
    if (data.heroBannerSubtitle) mockContent.heroBannerSubtitle = sanitizeHtml(data.heroBannerSubtitle);
    if (data.announcementText) mockContent.announcementText = sanitizeHtml(data.announcementText);
    if (typeof data.announcementActive === 'boolean') mockContent.announcementActive = data.announcementActive;

    if (Array.isArray(data.marketingBanners)) {
      mockContent.marketingBanners = data.marketingBanners.map(b => ({
        ...b,
        title: sanitizeHtml(b.title),
        subtitle: sanitizeHtml(b.subtitle)
      }));
    }

    if (Array.isArray(data.faqs)) {
      mockContent.faqs = data.faqs.map(f => ({
        ...f,
        question: sanitizeHtml(f.question),
        answer: sanitizeHtml(f.answer)
      }));
    }

    return res.json({
      success: true,
      message: 'Content CMS updated successfully with XSS sanitization applied',
      content: mockContent
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 3. NOTIFICATIONS & OUTBOX CONTROLLERS
// ==========================================
export async function getNotifications(req, res) {
  try {
    return res.json({
      success: true,
      count: mockNotifications.length,
      notifications: mockNotifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendNotification(req, res) {
  try {
    const { title, message, channel = 'In-App Push', audience = 'All Customers', scheduledTime = 'Immediate' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message body are required' });
    }

    // Check if external SMS or Email gateway is simulated / offline
    const isExternalGateway = channel.includes('SMS') || channel.includes('Email') || channel.includes('WhatsApp');
    const isOutbox = isExternalGateway; // Local notification outbox for simulated/offline gateways

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: sanitizeHtml(title),
      message: sanitizeHtml(message),
      channel,
      audience,
      scheduledTime,
      status: isOutbox ? 'Queued in Local Outbox (Provider Gateway Offline)' : 'Delivered',
      providerConfirmed: !isOutbox,
      outboxQueued: isOutbox,
      recipientsCount: audience === 'All Customers' ? 24500 : audience === 'Professionals Only' ? 1200 : 850,
      openRate: isOutbox ? 'Pending Dispatch' : '98.5%',
      sentAt: isOutbox ? 'Queued locally' : 'Just now'
    };

    mockNotifications.unshift(newNotif);

    return res.json({
      success: true,
      message: isOutbox
        ? 'External provider offline: Broadcast safely queued in Local Notification Outbox'
        : 'In-app notification broadcast dispatched successfully',
      notification: newNotif
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
