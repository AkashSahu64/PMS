// features/patient/PackagesList.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiSave } from 'react-icons/fi';
import API from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import AddPackageModal from './AddPackageModal';

const fetchPackages = async (patientId) => {
  const { data } = await API.get(`/packages/patient/${patientId}`);
  return data;
};

const fetchTreatments = async (packageId) => {
  const { data } = await API.get(`/treatments/package/${packageId}`);
  return data;
};

const PackagesList = ({ patientId }) => {
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [treatmentsData, setTreatmentsData] = useState({});
  const [editingTreatments, setEditingTreatments] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages', patientId],
    queryFn: () => fetchPackages(patientId),
  });

  const loadTreatments = async (pkgId) => {
    if (treatmentsData[pkgId]) return;
    const data = await fetchTreatments(pkgId);
    setTreatmentsData(prev => ({ ...prev, [pkgId]: data }));
    // Initialize editing state with empty object
    setEditingTreatments(prev => ({ ...prev, [pkgId]: {} }));
  };

  const handleExpand = (pkgId) => {
    if (expandedPackage === pkgId) {
      setExpandedPackage(null);
    } else {
      setExpandedPackage(pkgId);
      loadTreatments(pkgId);
    }
  };

  const updateTreatmentMutation = useMutation({
    mutationFn: ({ treatmentId, data }) => API.put(`/treatments/${treatmentId}`, data),
    onSuccess: (_, variables) => {
      // Update local treatments data
      const { treatmentId, data } = variables;
      setTreatmentsData(prev => {
        const updated = { ...prev };
        for (const pkgId in updated) {
          updated[pkgId] = updated[pkgId].map(t =>
            t._id === treatmentId ? { ...t, ...data } : t
          );
        }
        return updated;
      });
      // Clear editing for this treatment
      setEditingTreatments(prev => {
        const updated = { ...prev };
        for (const pkgId in updated) {
          if (updated[pkgId][treatmentId]) {
            delete updated[pkgId][treatmentId];
          }
        }
        return updated;
      });
      queryClient.invalidateQueries(['packages']); // to update completed count
      toast.success('Treatment updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const handleTreatmentChange = (pkgId, treatmentId, field, value) => {
    setEditingTreatments(prev => ({
      ...prev,
      [pkgId]: {
        ...prev[pkgId],
        [treatmentId]: {
          ...prev[pkgId]?.[treatmentId],
          [field]: value
        }
      }
    }));
  };

  const handleSaveTreatment = (pkgId, treatment) => {
    const changes = editingTreatments[pkgId]?.[treatment._id];
    if (!changes) return;
    updateTreatmentMutation.mutate({ treatmentId: treatment._id, data: changes });
  };

  if (isLoading) return <div>Loading packages...</div>;

  return (
    <>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Package History</h2>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        + Add Package
      </button>
    </div>
    <div className="space-y-4">
      {packages?.map((pkg) => (
        <div key={pkg._id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleExpand(pkg._id)}
          >
            <div>
              <h3 className="font-semibold text-lg">{pkg.name}</h3>
              <p className="text-sm text-gray-600">
                Status: <span className={`capitalize ${pkg.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{pkg.status}</span>
                {' | '}Days: {pkg.completedDays}/{pkg.totalDays}
              </p>
            </div>
            <div>
              {expandedPackage === pkg._id ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>

          <AnimatePresence>
            {expandedPackage === pkg._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200"
              >
                <div className="p-4 space-y-3">
                  {treatmentsData[pkg._id]?.map((treatment) => {
                    const isEditing = !!editingTreatments[pkg._id]?.[treatment._id];
                    const editedValues = editingTreatments[pkg._id]?.[treatment._id] || {};

                    return (
                      <div key={treatment._id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Day {treatment.dayNumber} - {format(new Date(treatment.date), 'dd/MM/yyyy')}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${treatment.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {treatment.attended ? 'Attended' : 'Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">Medicines</label>
                            <input
                              type="text"
                              defaultValue={treatment.medicines}
                              onChange={(e) => handleTreatmentChange(pkg._id, treatment._id, 'medicines', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Exercises</label>
                            <input
                              type="text"
                              defaultValue={treatment.exercises}
                              onChange={(e) => handleTreatmentChange(pkg._id, treatment._id, 'exercises', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Equipment</label>
                            <input
                              type="text"
                              defaultValue={treatment.equipment}
                              onChange={(e) => handleTreatmentChange(pkg._id, treatment._id, 'equipment', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Notes</label>
                            <input
                              type="text"
                              defaultValue={treatment.notes}
                              onChange={(e) => handleTreatmentChange(pkg._id, treatment._id, 'notes', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="text-xs text-gray-500 mr-2">Attended</label>
                            <input
                              type="checkbox"
                              defaultChecked={treatment.attended}
                              onChange={(e) => handleTreatmentChange(pkg._id, treatment._id, 'attended', e.target.checked)}
                              className="rounded"
                            />
                          </div>
                        </div>
                        {isEditing && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleSaveTreatment(pkg._id, treatment)}
                              className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                            >
                              <FiSave /> Save
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
    {isAddModalOpen && (
        <AddPackageModal
          patientId={patientId}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['packages', patientId]);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default PackagesList;