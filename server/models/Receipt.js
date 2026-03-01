import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  receiptNo: { type: String, required: true, unique: true }, // ✅ MOVE HERE
  receiptData: { type: Object },
  pdfUrl: { type: String },
  sentEmail: { type: Boolean, default: false },
  sentWhatsapp: { type: Boolean, default: false }
});

export default mongoose.model('Receipt', receiptSchema);