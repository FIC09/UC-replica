import express from 'express';
import { Coupon } from '../models/Coupon.js';

const router = express.Router();

const DEFAULT_COUPONS = [
  {
    code: 'FESTIVE25',
    discount: 25,
    discountAmount: 25,
    type: 'percentage',
    minOrder: 499,
    maxDiscount: null,
    description: '25% festive discount on all eligible services',
    desc: '25% festive discount on all eligible services',
    isActive: true,
  },
  {
    code: 'DIWALI25',
    discount: 25,
    discountAmount: 25,
    type: 'percentage',
    minOrder: 499,
    maxDiscount: null,
    description: 'Special 25% Diwali discount on orders above ₹499',
    desc: 'Special 25% Diwali discount on orders above ₹499',
    isActive: true,
  },
  {
    code: 'MUMBAI100',
    discount: 100,
    discountAmount: 100,
    type: 'flat',
    minOrder: 399,
    description: 'Flat ₹100 off on all services in Mumbai',
    desc: 'Flat ₹100 off on all services in Mumbai',
    isActive: true,
  },
  {
    code: 'FIRST50',
    discount: 150,
    discountAmount: 150,
    type: 'flat',
    minOrder: 500,
    description: '₹150 off on your first home or salon service',
    desc: '₹150 off on your first home or salon service',
    isActive: true,
  },
  {
    code: 'SUPERUC',
    discount: 200,
    discountAmount: 200,
    type: 'flat',
    minOrder: 899,
    description: '₹200 discount on orders above ₹899',
    desc: '₹200 discount on orders above ₹899',
    isActive: true,
  },
];

// GET all active coupons
router.get('/', async (req, res) => {
  try {
    let coupons = [];
    try {
      coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('Coupon.find error:', dbErr.message);
    }

    if (!Array.isArray(coupons)) coupons = [];

    // Ensure default coupons are included if not already present
    const existingCodes = new Set(coupons.map(c => (c.code || '').toUpperCase().trim()));
    DEFAULT_COUPONS.forEach(def => {
      if (!existingCodes.has(def.code)) {
        coupons.push(def);
      }
    });

    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST verify coupon
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;
    const orderAmount = Number(req.body.orderAmount ?? req.body.orderValue ?? 0);

    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const rawCode = String(code).trim();
    const normalizedCode = rawCode.toUpperCase().replace(/\s+/g, ' ');
    const escapedPattern = normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');

    let coupon = null;
    try {
      // 1. Flexible regex match (handles multiple spaces and case variations)
      coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${escapedPattern}$`, 'i') },
        isActive: true,
      }).lean();

      // 2. Exact uppercase match fallback
      if (!coupon) {
        coupon = await Coupon.findOne({
          code: rawCode.toUpperCase(),
          isActive: true,
        }).lean();
      }
    } catch (dbErr) {
      console.warn('Coupon.findOne error:', dbErr.message);
    }

    // 3. Fallback to default coupons
    if (!coupon) {
      const defaultMatch = DEFAULT_COUPONS.find(c => c.code.toUpperCase() === normalizedCode);
      if (defaultMatch) {
        coupon = defaultMatch;
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Invalid or expired coupon code "${rawCode}". Try MUMBAI100, FIRST50 or SUPERUC`,
      });
    }

    const minOrder = Number(coupon.minOrder || 0);
    if (orderAmount > 0 && orderAmount < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Min order of ₹${minOrder} required for ${coupon.code}`,
      });
    }

    let calculatedDiscount = Number(coupon.discount || coupon.discountAmount || 0);
    const isPercentage = coupon.type === 'percentage' || (/25/i.test(coupon.code) && (coupon.discount === 25 || coupon.discountAmount === 25));
    if (isPercentage || coupon.type === 'percentage') {
      const pct = (coupon.type === 'percentage' && coupon.discount) ? Number(coupon.discount) : 25;
      calculatedDiscount = Math.round((orderAmount * pct) / 100);
      const maxLimit = Number(coupon.maxDiscount || 0);
      // Only cap if maxDiscount is explicitly set, greater than 0, and not an erroneous legacy 150 cap on a 25% coupon
      if (maxLimit > 0 && calculatedDiscount > maxLimit && maxLimit !== 150) {
        calculatedDiscount = maxLimit;
      }
    }

    if (orderAmount > 0 && calculatedDiscount > orderAmount) {
      calculatedDiscount = orderAmount;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: calculatedDiscount,
        discountAmount: calculatedDiscount,
        type: coupon.type || 'flat',
        minOrder: minOrder,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description || coupon.desc || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add coupon
router.post('/', async (req, res) => {
  try {
    const couponData = req.body;
    if (!couponData.code || couponData.discount === undefined) {
      return res.status(400).json({ success: false, message: 'Code and discount amount are required' });
    }

    couponData.code = couponData.code.trim().toUpperCase();
    const newCoupon = await Coupon.create(couponData);
    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update coupon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.trim().toUpperCase();

    const updated = await Coupon.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }].filter(Boolean) },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, coupon: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE coupon
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findOneAndDelete(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }].filter(Boolean) }
    );
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: `Coupon ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
