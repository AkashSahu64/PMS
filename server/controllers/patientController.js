import Patient from '../models/Patient.js';
import ActivityLog from '../models/ActivityLog.js';

// Generate unique patient ID
const generatePatientId = async () => {
  const count = await Patient.countDocuments();
  return `P-${(count + 1).toString().padStart(5, '0')}`;
};

// @desc Create new patient
// @route POST /api/patients
export const createPatient = async (req, res) => {
  try {
    const { name, mobile, age, address, email, referredBy } = req.body;

    // Check if mobile exists
    const existing = await Patient.findOne({ mobile });
    if (existing) return res.status(400).json({ message: 'Patient with this mobile already exists' });

    const patientId = await generatePatientId();
    const patient = await Patient.create({
      patientId,
      name,
      mobile,
      age,
      address,
      email,
      referredBy,
      createdBy: req.user._id
    });

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_PATIENT',
      entity: 'Patient',
      entityId: patient._id,
      details: { patientId, name, mobile }
    });

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all patients (with pagination, search)
// @route GET /api/patients
export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get patient by ID
// @route GET /api/patients/:id
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).where({ isDeleted: false });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update patient
// @route PUT /api/patients/:id
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).where({ isDeleted: false });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_PATIENT',
      entity: 'Patient',
      entityId: patient._id,
      details: req.body
    });

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Soft delete patient
// @route DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_PATIENT',
      entity: 'Patient',
      entityId: patient._id
    });

    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};