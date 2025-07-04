const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || 'your_razorpay_secret_here';
const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_uri_here';

app.use(bodyParser.json());

// MongoDB Setup
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// MongoDB Schema
const UserSchema = new mongoose.Schema({
  email: String,
  coins: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

// Default route for testing
app.get('/', (req, res) => {
  res.send('✅ NOVA backend is running');
});

// Webhook Route
app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (signature === expectedSignature) {
    const payload = req.body;
    const email = payload?.payload?.payment?.entity?.email || "unknown";
    const amount = payload?.payload?.payment?.entity?.amount || 0;

    console.log(`✅ Payment from: ${email}, Amount: ₹${amount / 100}`);

    try {
      if (amount === 5000) {
        const user = await User.findOneAndUpdate(
          { email },
          { $inc: { coins: 100 } },
          { upsert: true, new: true }
        );
        console.log(`✅ Coins updated for ${email}, new coin balance: ${user.coins}`);
      }
    } catch (error) {
      console.error('❌ MongoDB Update Error:', error);
    }

    res.status(200).json({ status: "ok" });
  } else {
    console.log("❌ Razorpay Signature Verification Failed");
    res.status(403).json({ error: "Invalid signature" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

