import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coins: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  source: {
    type: String,
    enum: ['recharge', 'purchase', 'admin'],
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  note: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('CoinTransaction', coinTransactionSchema);

