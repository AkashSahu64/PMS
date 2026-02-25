// pages/Calendar.jsx
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../store/authStore';
import AppointmentModal from '../features/appointments/AppointmentModal';

const localizer = momentLocalizer(moment);

const fetchAppointments = async ({ queryKey }) => {
  const [, { start, end }] = queryKey;
  const params = new URLSearchParams();
  if (start) params.append('start', start.toISOString());
  if (end) params.append('end', end.toISOString());
  const { data } = await API.get(`/appointments?${params}`);
  return data.map(appt => ({
    ...appt,
    start: new Date(appt.start),
    end: new Date(appt.end),
    title: appt.title,
    resource: appt
  }));
};

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const queryClient = useQueryClient();

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments', { start: moment(date).startOf('month').toDate(), end: moment(date).endOf('month').toDate() }],
    queryFn: fetchAppointments,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
  });

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedAppointment(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setSelectedSlot(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
    setSelectedSlot(null);
  };

  const handleSave = async (appointmentData) => {
    try {
      if (selectedAppointment) {
        await API.put(`/appointments/${selectedAppointment._id}`, appointmentData);
        toast.success('Appointment updated');
      } else {
        await API.post('/appointments', appointmentData);
        toast.success('Appointment created');
      }
      queryClient.invalidateQueries(['appointments']);
      handleModalClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (selectedAppointment && window.confirm('Delete this appointment?')) {
      deleteMutation.mutate(selectedAppointment._id);
      handleModalClose();
    }
  };

  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800"
      >
        Appointment Calendar
      </motion.h1>

      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 h-[700px]">
        {isLoading ? (
          <div>Loading calendar...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            date={date}
            onNavigate={setDate}
            view={view}
            onView={setView}
          />
        )}
      </div>

      {modalOpen && (
        <AppointmentModal
          open={modalOpen}
          onClose={handleModalClose}
          appointment={selectedAppointment}
          slot={selectedSlot}
          onSave={handleSave}
          onDelete={selectedAppointment ? handleDelete : null}
        />
      )}
    </div>
  );
};

export default CalendarPage;