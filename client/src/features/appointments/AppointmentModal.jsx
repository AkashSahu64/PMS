// features/appointments/AppointmentModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import API from '../../store/authStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentModal = ({ open, onClose, appointment, slot, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    start: slot?.start || new Date(),
    end: slot?.end || new Date(new Date().setHours(new Date().getHours() + 1)),
    notes: ''
  });
  const [searchPatient, setSearchPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patient._id,
        title: appointment.title,
        start: new Date(appointment.start),
        end: new Date(appointment.end),
        notes: appointment.notes || ''
      });
      setSearchPatient(appointment.patient.name);
    } else if (slot) {
      setFormData({
        patientId: '',
        title: '',
        start: slot.start,
        end: slot.end,
        notes: ''
      });
    }
  }, [appointment, slot]);

  const searchPatients = async (query) => {
    if (!query) return;
    setLoadingPatients(true);
    try {
      const { data } = await API.get('/patients', { params: { search: query, limit: 10 } });
      setPatients(data.patients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert('Please select a patient');
      return;
    }
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {open && (
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
              <h2 className="text-xl font-semibold">
                {appointment ? 'Edit Appointment' : 'New Appointment'}
              </h2>
              <button onClick={onClose}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient search */}
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <input
                  type="text"
                  placeholder="Search patient by name or mobile"
                  value={searchPatient}
                  onChange={(e) => {
                    setSearchPatient(e.target.value);
                    searchPatients(e.target.value);
                  }}
                  className="w-full px-4 py-2 border rounded-xl"
                />
                {patients.length > 0 && (
                  <ul className="mt-2 border rounded-xl max-h-40 overflow-y-auto">
                    {patients.map(p => (
                      <li
                        key={p._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFormData({ ...formData, patientId: p._id });
                          setSearchPatient(p.name);
                          setPatients([]);
                        }}
                      >
                        {p.name} - {p.mobile}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start</label>
                  <DatePicker
                    selected={formData.start}
                    onChange={(date) => setFormData({ ...formData, start: date })}
                    showTimeSelect
                    dateFormat="Pp"
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <DatePicker
                    selected={formData.end}
                    onChange={(date) => setFormData({ ...formData, end: date })}
                    showTimeSelect
                    dateFormat="Pp"
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  {appointment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;