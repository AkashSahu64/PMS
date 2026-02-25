import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true, required: true }, // auto-generated
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  email: { type: String },
  referredBy: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Patient', patientSchema);