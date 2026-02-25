import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  name: { type: String, required: true }, // e.g., "6 Days", "10 Days"
  totalDays: { type: Number, required: true },
  completedDays: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  price: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Package', packageSchema);