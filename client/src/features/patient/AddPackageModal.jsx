import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import API from '../../store/authStore';
import { toast } from 'react-hot-toast';

const AddPackageModal = ({ patientId, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await API.post('/packages', { ...data, patientId });
      toast.success('Package added successfully');
      reset();
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add package');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition"
      >
        Add Package
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Package</h2>
                <button onClick={() => setIsOpen(false)}><FiX /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Package Name</label>
                  <input
                    {...register('name', { required: true })}
                    className="w-full px-4 py-2 border rounded-xl"
                    placeholder="e.g., 6 Days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Days</label>
                  <input
                    type="number"
                    {...register('totalDays', { required: true, min: 1 })}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    {...register('price', { required: true, min: 0 })}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Advance (₹)</label>
                  <input
                    type="number"
                    {...register('advance', { required: true, min: 0 })}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl">Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddPackageModal;