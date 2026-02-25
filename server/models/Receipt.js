import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  receiptData: { type: Object }, // store JSON of receipt
  pdfUrl: { type: String },
  sentEmail: { type: Boolean, default: false },
  sentWhatsapp: { type: Boolean, default: false }
});

export default mongoose.model('Receipt', receiptSchema);