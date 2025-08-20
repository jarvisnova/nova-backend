import crypto from 'crypto';
import dotenv from 'dotenv';
import CoinTransaction from '../models/coinTransactionModel.js';

dotenv.config();

// ✅ Razorpay Webhook Handler
export const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body.event;

  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;

    // Coin logic (customize based on amount)
    const amount = payment.amount / 100; // Convert paise to INR
    const coins = amount * 10; // Example: ₹1 = 10 coins

    const transaction = new CoinTransaction({
      razorpayPaymentId: payment.id,
      amount,
      coins,
      email: payment.email || '',
      contact: payment.contact || '',
      status: 'success',
      createdAt: new Date(),
    });

    await transaction.save();
  }

  res.status(200).json({ success: true });
};

