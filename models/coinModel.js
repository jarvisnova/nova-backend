import mongoose from 'mongoose';

const coinSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  coins: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Coin = mongoose.model('Coin', coinSchema);
export default Coin;

