import mongoose from 'mongoose';

const renderHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String },
  downloadUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RenderHistory = mongoose.model('RenderHistory', renderHistorySchema);
export default RenderHistory;

