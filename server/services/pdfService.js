import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReceiptPDF = async (receiptData) => {
  const doc = new PDFDocument();
  const filePath = path.join('uploads', `receipt_${receiptData.receiptNo}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text('Physio Clinic', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Receipt No: ${receiptData.receiptNo}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Patient: ${receiptData.patientName}`);
  doc.text(`Mobile: ${receiptData.mobile}`);
  doc.text(`Package: ${receiptData.packageName}`);
  doc.text(`Amount Paid: ₹${receiptData.amount}`);
  doc.text(`Balance: ₹${receiptData.balance}`);
  doc.text(`Date: ${new Date(receiptData.date).toLocaleDateString()}`);
  doc.text(`Mode: ${receiptData.mode}`);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};