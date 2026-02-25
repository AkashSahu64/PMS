import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import API from '../store/authStore';
import PatientDetails from '../features/patient/PatientDetails';
import ComplaintsList from '../features/patient/ComplaintsList';
import PackagesList from '../features/patient/PackagesList';
import PaymentsList from '../features/patient/PaymentsList';
import AddComplaintModal from '../features/patient/AddComplaintModal';
import AddPackageModal from '../features/patient/AddPackageModal';
import AddPaymentModal from '../features/patient/AddPaymentModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const fetchPatient = async (id) => {
  const { data } = await API.get(`/patients/${id}`);
  return data;
};

const PatientProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const { data: patient, isLoading, error, refetch } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <div>Error loading patient</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-800">Patient Profile</h1>
        <div className="space-x-3">
          <AddComplaintModal patientId={id} onSuccess={refetch} />
          <AddPackageModal patientId={id} onSuccess={refetch} />
          <AddPaymentModal patientId={id} onSuccess={refetch} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['details', 'complaints', 'packages', 'payments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <PatientDetails patient={patient} />}
        {activeTab === 'complaints' && <ComplaintsList patientId={id} />}
        {activeTab === 'packages' && <PackagesList patientId={id} />}
        {activeTab === 'payments' && <PaymentsList patientId={id} />}
      </div>
    </div>
  );
};

export default PatientProfile;