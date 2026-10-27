import express from 'express';
import { createPaymentOrder, verifyPaymentSignature, processPaymentWebhook } from '../services/paymentService.js';
import { query } from '../config/postgres.js';

const router = express.Router();

// POST Create payment order
router.post('/orders', async (req, res) => {
  try {
    const { bookingId, amount, currency = 'INR', customerPhone, customerEmail } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, message: 'bookingId and amount are required' });
    }

    const order = await createPaymentOrder({
      bookingId,
      amount: Number(amount),
      currency,
      customerPhone,
      customerEmail
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Verify payment signature
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: 'orderId and paymentId are required' });
    }

    const verificationResult = await verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      bookingId
    });

    res.json(verificationResult);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST Razorpay Webhook
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await processPaymentWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Payouts and Commissions ledger
router.get('/ledger', async (req, res) => {
  try {
    const commissions = await query('SELECT * FROM commissions ORDER BY created_at DESC LIMIT 50');
    const payouts = await query('SELECT * FROM payouts ORDER BY created_at DESC LIMIT 50');
    res.json({
      success: true,
      commissions: commissions.rows,
      payouts: payouts.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
