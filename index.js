// =========================
//   Super NOVA – Backend index.js
// =========================

const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// =========================
//   Initialize App
// =========================
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// =========================
//   Middleware
// =========================
app.use(bodyParser.json());

// =========================
//   MongoDB Connection
// =========================
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// =========================
//   API Routes
// =========================
const razorpayRoutes = require('./api/razorpay');
const renderRoutes = require('./api/render');

app.use('/api', razorpayRoutes);
app.use('/api', renderRoutes);

// Health Check Route (for testing)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Super NOVA backend is running 🚀' });
});

// =========================
//   Start Server
// =========================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Super NOVA backend running at http://0.0.0.0:${PORT}`);
});

