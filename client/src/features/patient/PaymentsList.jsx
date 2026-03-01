import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiDownload, FiPlus } from 'react-icons/fi';
import API from '../../store/authStore';
import AddPaymentModal from './AddPaymentModal';

const fetchPayments = async (patientId) => {
  const { data } = await API.get(`/payments/patient/${patientId}`);
  return data;
};

const PaymentsList = ({ patientId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', patientId],
    queryFn: () => fetchPayments(patientId),
  });

  const handleDownloadReceipt = async (receiptNo) => {
  try {
    const response = await API.get(
      `/payments/receipt/${receiptNo}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${receiptNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    console.error(err);
  }
};

  if (isLoading) return <div className="text-center py-8">Loading payment history...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading payments</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment History</h2>
        <button
          id="add-payment-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          <FiPlus /> Record Payment
        </button>
      </div>

      {payments?.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl text-center">
          <p className="text-gray-600">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments?.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">₹{payment.amount}</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(payment.date), 'dd MMM yyyy')} • {payment.mode}
                </p>
                <p className="text-xs text-gray-500">Receipt: {payment.receiptNo}</p>
                <p className="text-xs text-gray-500">Package: {payment.package?.name}</p>
              </div>
              <button
                onClick={() => handleDownloadReceipt(payment.receiptNo)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Download Receipt"
              >
                <FiDownload className="w-5 h-5 text-primary-600" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddPaymentModal
          patientId={patientId}
          onClose={() => setModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default PaymentsList;