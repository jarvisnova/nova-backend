// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load ENV
dotenv.config();

// Connect MongoDB
connectDB();

// Initialize Express App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Health Check Route
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: '✅ Test route is working fine!' });
});

// ✅ Injected Super Nova Routes
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/story', require('./routes/storyRoutes'));
app.use('/api/supernova', require('./routes/supernovaRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// ✅ Default Home Route
app.get('/', (req, res) => {
  res.send('🚀 JarvishAI Backend is Running — All Systems Go!');
});

// ✅ Start Server on ENV or fallback 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

