// =========================
// 🌟 Super NOVA – Backend index.js
// =========================

const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// =========================
// 🔧 Initialize App
// =========================
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// =========================
// 🔄 Middleware
// =========================
app.use(bodyParser.json());

// =========================
// 🌐 MongoDB Connection
// =========================
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// =========================
// 🚀 API Routes
// =========================
const razorpayRoutes = require('./api/razorpay');
const renderRoutes = require('./api/render');

app.use('/api', razorpayRoutes);
app.use('/api', renderRoutes);

// =========================
// 🟢 Start Server
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Super NOVA backend running at http://localhost:${PORT}`);
});
