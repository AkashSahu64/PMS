import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiPlus } from 'react-icons/fi';
import API from '../../store/authStore';
import AddComplaintModal from './AddComplaintModal';

const fetchComplaints = async (patientId) => {
  const { data } = await API.get(`/complaints/patient/${patientId}`);
  return data;
};

const ComplaintsList = ({ patientId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: complaints, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints', patientId],
    queryFn: () => fetchComplaints(patientId),
  });

  if (isLoading) return <div className="text-center py-8">Loading complaints...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading complaints</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Complaint History</h2>
        <button
          id="add-complaint-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
        >
          <FiPlus /> Add Complaint
        </button>
      </div>

      {complaints?.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl text-center">
          <p className="text-gray-600">No complaints recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints?.map((complaint) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {format(new Date(complaint.createdAt), 'dd MMM yyyy, h:mm a')}
                </span>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  Dr. {complaint.doctor?.name}
                </span>
              </div>
              <p className="text-gray-800">{complaint.description}</p>
              {complaint.notes && (
                <p className="text-sm text-gray-600 mt-2 border-t pt-2">
                  <span className="font-medium">Notes:</span> {complaint.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddComplaintModal
          patientId={patientId}
          onClose={() => setModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default ComplaintsList;