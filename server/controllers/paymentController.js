import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import Patient from '../models/Patient.js';
import Package from '../models/Package.js';
import { generateReceiptPDF } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';
import { sendWhatsApp } from '../services/whatsappService.js';
import ActivityLog from '../models/ActivityLog.js';

// Generate unique receipt number
const generateReceiptNo = async () => {
  const count = await Payment.countDocuments();
  return `RCP-${(count + 1).toString().padStart(6, '0')}`;
};

// @desc Create payment and receipt
// @route POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const { patientId, packageId, amount, mode } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const receiptNo = await generateReceiptNo();

    const payment = await Payment.create({
      patient: patientId,
      package: packageId,
      amount,
      mode,
      receiptNo,
      receivedBy: req.user._id
    });

    // Update package balance if payment is for the package
    pkg.balance -= amount;
    pkg.advance += amount;
    await pkg.save();

    // Generate receipt PDF
    const receiptData = {
      receiptNo,
      patientName: patient.name,
      mobile: patient.mobile,
      packageName: pkg.name,
      amount,
      balance: pkg.balance,
      date: payment.date,
      mode
    };

    const pdfPath = await generateReceiptPDF(receiptData);

    const receipt = await Receipt.create({
      payment: payment._id,
      receiptData,
      pdfUrl: pdfPath
    });

    // Send email if patient has email
    if (patient.email) {
      const emailSent = await sendEmail(patient.email, 'Payment Receipt', `<p>Your payment of ₹${amount} is successful. Receipt attached.</p>`, [{ filename: `receipt_${receiptNo}.pdf`, path: pdfPath }]);
      if (emailSent) {
        receipt.sentEmail = true;
        await receipt.save();
      }
    }

    // Send WhatsApp if phone available (placeholder)
    // if (patient.mobile) { ... }

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_PAYMENT',
      entity: 'Payment',
      entityId: payment._id,
      details: { patientId, packageId, amount, mode }
    });

    res.status(201).json({ payment, receipt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get payments for a patient
// @route GET /api/payments/patient/:patientId
export const getPatientPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patient: req.params.patientId })
      .populate('package', 'name')
      .populate('receivedBy', 'name')
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};