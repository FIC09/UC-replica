import express from 'express';
import { Coupon } from '../models/Coupon.js';

const router = express.Router();

// GET all active coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST verify coupon
router.post('/verify', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (orderAmount !== undefined && orderAmount < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Coupon requires a minimum order of ₹${coupon.minOrder}`,
      });
    }

    let calculatedDiscount = coupon.discount;
    if (coupon.type === 'percentage') {
      calculatedDiscount = Math.round((orderAmount * coupon.discount) / 100);
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: calculatedDiscount,
        type: coupon.type,
        description: coupon.description,
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
