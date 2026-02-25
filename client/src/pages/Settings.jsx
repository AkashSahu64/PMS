// pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import API from '../store/authStore';

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '' }
  });

  // Password form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  // Clinic form (admin only)
  const { register: registerClinic, handleSubmit: handleClinicSubmit, reset: resetClinic } = useForm();

  useEffect(() => {
    if (activeTab === 'clinic' && user?.role === 'admin') {
      fetchClinic();
    }
  }, [activeTab, user]);

  const fetchClinic = async () => {
    try {
      const { data } = await API.get('/users/clinic');
      setClinic(data);
      resetClinic(data);
    } catch (err) {
      toast.error('Failed to load clinic data');
    }
  };

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.put('/users/profile', data);
      useAuthStore.getState().setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const onClinicSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.put('/users/clinic', data);
      setClinic(res.data);
      toast.success('Clinic settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Settings
      </motion.h1>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'
            }`}
          >
            Change Password
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('clinic')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'clinic' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'
              }`}
            >
              Clinic Settings
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...registerProfile('name', { required: true })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...registerProfile('phone')}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  {...registerPassword('currentPassword', { required: true })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword', { required: true })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'clinic' && user?.role === 'admin' && (
            <form onSubmit={handleClinicSubmit(onClinicSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Clinic Name</label>
                <input
                  {...registerClinic('name', { required: true })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  {...registerClinic('address')}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...registerClinic('phone')}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  {...registerClinic('email')}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Number</label>
                <input
                  {...registerClinic('gst')}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Clinic Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;