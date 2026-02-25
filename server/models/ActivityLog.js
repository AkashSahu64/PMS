import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String }, // Patient, Package, etc.
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', activityLogSchema);