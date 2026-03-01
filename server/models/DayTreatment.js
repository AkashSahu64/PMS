import mongoose from 'mongoose';

const dayTreatmentSchema = new mongoose.Schema({
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  medicines: { type: String },
  exercises: { type: String },
  equipment: { type: String },
  notes: { type: String },
  attended: { type: Boolean, default: false },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DayTreatment', dayTreatmentSchema);