import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import API from '../../store/authStore';

const fetchPackages = async (patientId) => {
  const { data } = await API.get(`/packages/patient/${patientId}`);
  return data.filter(pkg => pkg.balance > 0); // only packages with pending balance
};

const AddPaymentModal = ({ patientId, onClose, onSuccess }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const selectedPackageId = watch('packageId');
  const { data: packages } = useQuery({
    queryKey: ['packages', patientId],
    queryFn: () => fetchPackages(patientId),
  });

  const selectedPackage = packages?.find(p => p._id === selectedPackageId);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await API.post('/payments', { ...data, patientId });
      toast.success('Payment recorded');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Record Payment</h2>
            <button onClick={onClose}><FiX /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Package *</label>
              <select
                {...register('packageId', { required: 'Package is required' })}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="">Choose package</option>
                {packages?.map(pkg => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.name} - Balance: ₹{pkg.balance}
                  </option>
                ))}
              </select>
              {errors.packageId && <p className="text-red-500 text-sm">{errors.packageId.message}</p>}
            </div>

            {selectedPackage && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">Package: {selectedPackage.name}</p>
                <p className="text-sm">Total: ₹{selectedPackage.price}</p>
                <p className="text-sm">Paid: ₹{selectedPackage.advance}</p>
                <p className="text-sm font-semibold">Balance: ₹{selectedPackage.balance}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input
                type="number"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 1, message: 'Amount must be positive' },
                  max: selectedPackage ? { value: selectedPackage.balance, message: `Amount cannot exceed balance ₹${selectedPackage.balance}` } : undefined
                })}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Mode *</label>
              <select
                {...register('mode', { required: 'Mode is required' })}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="">Select mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank">Bank Transfer</option>
              </select>
              {errors.mode && <p className="text-red-500 text-sm">{errors.mode.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddPaymentModal;