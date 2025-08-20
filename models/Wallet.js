import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  coins: {
    type: Number,
    default: 0,
  },
  history: [
    {
      type: {
        type: String, // "credit" or "debit"
        required: true,
      },
      amount: Number,
      reason: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model('Wallet', walletSchema);

