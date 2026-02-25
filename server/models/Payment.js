import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank'], required: true },
  transactionId: { type: String },
  receiptNo: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Payment', paymentSchema);