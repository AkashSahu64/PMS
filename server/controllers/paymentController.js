import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import Patient from '../models/Patient.js';
import Package from '../models/Package.js';
import { generateReceiptPDF } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';
import { sendWhatsApp } from '../services/whatsappService.js';
import ActivityLog from '../models/ActivityLog.js';
import path from 'path';

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
    const pkg = await Package.findById(packageId);

    const receiptNo = await generateReceiptNo();

    const payment = await Payment.create({
      patient: patientId,
      package: packageId,
      amount,
      mode,
      receiptNo,
      receivedBy: req.user._id
    });

    pkg.balance -= amount;
    pkg.advance += amount;
    await pkg.save();

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

    console.log("Generating PDF...");
    const pdfPath = await generateReceiptPDF(receiptData);
    console.log("PDF Generated:", pdfPath);

    console.log("Creating receipt doc...");
    const receipt = await Receipt.create({
      payment: payment._id,
      receiptNo,
      receiptData,
      pdfUrl: pdfPath
    });
    console.log("Receipt created:", receipt);

    res.status(201).json({ payment, receipt });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
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

// @desc Get receipt PDF
// @route GET /api/payments/receipt/:receiptNo
export const getReceiptPDF = async (req, res) => {
  try {
    const { receiptNo } = req.params;

    const receipt = await Receipt.findOne({ receiptNo });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const absolutePath = path.resolve(receipt.pdfUrl);

    res.download(absolutePath, `receipt_${receiptNo}.pdf`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};