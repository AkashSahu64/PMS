import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiUser, FiPhone, FiMapPin, FiMail, FiCalendar, FiUserPlus } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import EditPatientModal from './EditPatientModal';

const PatientDetails = ({ patient, onRefresh }) => {
  const { user } = useAuthStore();
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!patient) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
      >
        {/* Header with avatar and quick actions */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white">
                <span className="text-3xl font-bold">{patient.name?.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <p className="text-white/80">ID: {patient.patientId}</p>
                <span className="inline-flex mt-2 px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-sm">
                  Active Patient
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition"
                title="Edit Patient"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Patient details grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <FiPhone className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{patient.mobile}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <FiCalendar className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <FiMapPin className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{patient.address}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {patient.email && (
              <div className="flex items-center space-x-3 text-gray-700">
                <FiMail className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3 text-gray-700">
              <FiUserPlus className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Referred By</p>
                <p className="font-medium">{patient.referredBy || 'Self'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <FiUser className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Registered On</p>
                <p className="font-medium">{new Date(patient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <button
            onClick={() => document.getElementById('add-complaint-btn')?.click()}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition"
          >
            Add Complaint
          </button>
          <button
            onClick={() => document.getElementById('add-package-btn')?.click()}
            className="px-4 py-2 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition"
          >
            Add Package
          </button>
          <button
            onClick={() => document.getElementById('add-payment-btn')?.click()}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            Record Payment
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {editModalOpen && (
        <EditPatientModal
          patient={patient}
          onClose={() => setEditModalOpen(false)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
};

export default PatientDetails;