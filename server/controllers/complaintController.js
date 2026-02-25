import Complaint from '../models/Complaint.js';
import Patient from '../models/Patient.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc Add complaint for a patient
// @route POST /api/complaints
export const addComplaint = async (req, res) => {
  try {
    const { patientId, description, notes } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const complaint = await Complaint.create({
      patient: patientId,
      description,
      notes,
      doctor: req.user._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADD_COMPLAINT',
      entity: 'Complaint',
      entityId: complaint._id,
      details: { patientId, description }
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get complaints for a patient
// @route GET /api/complaints/patient/:patientId
export const getPatientComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ patient: req.params.patientId })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};