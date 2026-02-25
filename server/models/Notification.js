import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // recipient, null for broadcast
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp', 'in-app', 'alert'], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);