import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import API from '../../store/authStore';

const EditPatientModal = ({ patient, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      address: patient.address,
      email: patient.email || '',
      referredBy: patient.referredBy || ''
    }
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await API.put(`/patients/${patient._id}`, data);
      toast.success('Patient updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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
            <h2 className="text-xl font-semibold">Edit Patient</h2>
            <button onClick={onClose}><FiX /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile *</label>
              <input
                {...register('mobile', { 
                  required: 'Mobile is required',
                  pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile' }
                })}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age *</label>
              <input
                type="number"
                {...register('age', { required: 'Age is required', min: 0 })}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                {...register('address', { required: 'Address is required' })}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Referred By</label>
              <input
                {...register('referredBy')}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPatientModal;