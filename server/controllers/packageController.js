import Package from '../models/Package.js';
import DayTreatment from '../models/DayTreatment.js';
import Patient from '../models/Patient.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc Create new package and auto-generate days
// @route POST /api/packages
export const createPackage = async (req, res) => {
  try {
    const { patientId, name, totalDays, price, advance, doctor } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const balance = price - advance;

    const pkg = await Package.create({
      patient: patientId,
      name,
      totalDays,
      price,
      advance,
      balance,
      doctor: doctor || req.user._id
    });

    // Auto-create day entries
    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        package: pkg._id,
        dayNumber: i,
        date: new Date(Date.now() + (i - 1) * 24 * 60 * 60 * 1000) // consecutive days
      });
    }
    await DayTreatment.insertMany(days);

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_PACKAGE',
      entity: 'Package',
      entityId: pkg._id,
      details: { patientId, name, totalDays }
    });

    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get packages for a patient
// @route GET /api/packages/patient/:patientId
export const getPatientPackages = async (req, res) => {
  try {
    const packages = await Package.find({ patient: req.params.patientId })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update package (e.g., mark completed)
// @route PUT /api/packages/:id
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_PACKAGE',
      entity: 'Package',
      entityId: pkg._id,
      details: req.body
    });

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};