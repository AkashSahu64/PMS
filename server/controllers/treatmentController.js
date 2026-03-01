import DayTreatment from '../models/DayTreatment.js';
import Package from '../models/Package.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc Get day treatments for a package
// @route GET /api/treatments/package/:packageId
export const getTreatmentsByPackage = async (req, res) => {
  try {
    const treatments = await DayTreatment.find({ package: req.params.packageId }).sort({ dayNumber: 1 });
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update a specific day treatment
// @route PUT /api/treatments/:id
export const updateTreatment = async (req, res) => {
  try {
    const treatment = await DayTreatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment day not found' });
    }

    // 👇 OLD attended value store karo
    const previousAttended = treatment.attended;

    // Update fields safely
    if (req.body.medicines !== undefined)
      treatment.medicines = req.body.medicines;

    if (req.body.exercises !== undefined)
      treatment.exercises = req.body.exercises;

    if (req.body.equipment !== undefined)
      treatment.equipment = req.body.equipment;

    if (req.body.notes !== undefined)
      treatment.notes = req.body.notes;

    if (req.body.date !== undefined)
      treatment.date = req.body.date;

    if (req.body.attended !== undefined)
      treatment.attended = req.body.attended;

    treatment.completedBy = req.user._id;

    await treatment.save();

    // 👇 PACKAGE UPDATE LOGIC
    const pkg = await Package.findById(treatment.package);

    const completedCount = await DayTreatment.countDocuments({
      package: pkg._id,
      attended: true
    });

    const today = new Date();
    today.setHours(0,0,0,0);

    const missedCount = await DayTreatment.countDocuments({
      package: pkg._id,
      attended: false,
      date: { $lt: today }
    });

    pkg.completedDays = completedCount;

    if (completedCount === pkg.totalDays) {
      pkg.status = "completed";
      pkg.endDate = Date.now();
    } else {
      pkg.status = "active";
      pkg.endDate = null;
    }

    await pkg.save();

    res.json(treatment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};