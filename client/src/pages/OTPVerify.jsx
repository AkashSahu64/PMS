// pages/OTPVerify.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import API from '../store/authStore';

const OTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', { email, otp });
      toast.success('OTP verified');
      navigate('/update-password', { state: { resetToken: data.resetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <Link to="/forgot-password" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
          <FiArrowLeft className="mr-2" /> Back
        </Link>
        <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
        <p className="text-center text-gray-600 mb-6">Enter the 6-digit code sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123456"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default OTPVerify;