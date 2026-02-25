// controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc Get appointments for calendar (date range)
// @route GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};
    if (start && end) {
      query.start = { $gte: new Date(start), $lte: new Date(end) };
    }
    // If doctor, show only their appointments; if admin, all
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    const appointments = await Appointment.find(query)
      .populate('patient', 'name mobile')
      .populate('doctor', 'name');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create appointment
// @route POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const { patientId, title, start, end, notes } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: req.user._id,
      title,
      start,
      end,
      notes
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_APPOINTMENT',
      entity: 'Appointment',
      entityId: appointment._id,
      details: { patientId, title, start, end }
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update appointment
// @route PUT /api/appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    // Only the creating doctor or admin can update
    if (req.user.role !== 'admin' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(appointment, req.body);
    appointment.updatedAt = Date.now();
    await appointment.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_APPOINTMENT',
      entity: 'Appointment',
      entityId: appointment._id,
      details: req.body
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete appointment
// @route DELETE /api/appointments/:id
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (req.user.role !== 'admin' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await appointment.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_APPOINTMENT',
      entity: 'Appointment',
      entityId: appointment._id
    });

    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};