const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// MongoDB model import (update if needed)
const User = require('../models/User'); // Make sure this model exists or create it

router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
    const secret = '4h8wPWeHsWuIG9jrV...'; // Replace with your Razorpay webhook secret

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.log('❌ Signature mismatch');
        return res.status(400).send('Invalid signature');
    }

    const paymentData = req.body.payload.payment.entity;
    const email = paymentData.email;

    try {
        const user = await User.findOne({ email });
        if (user) {
            user.wallet = (user.wallet || 0) + 100; // Add 100 coins for ₹50
            await user.save();
            console.log(`✅ 100 coins added to ${email}`);
        } else {
            console.log(`⚠️ User not found for email: ${email}`);
        }

        res.json({ status: 'ok' });
    } catch (err) {
        console.error('❌ Error updating wallet:', err);
        res.status(500).send('Error updating wallet');
    }
});

module.exports = router;

