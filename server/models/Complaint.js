import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  description: { type: String, required: true },
  notes: { type: String },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Complaint', complaintSchema);