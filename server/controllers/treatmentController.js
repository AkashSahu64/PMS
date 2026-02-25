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
    if (!treatment) return res.status(404).json({ message: 'Treatment day not found' });

    // Update fields
    treatment.medicines = req.body.medicines || treatment.medicines;
    treatment.exercises = req.body.exercises || treatment.exercises;
    treatment.equipment = req.body.equipment || treatment.equipment;
    treatment.notes = req.body.notes || treatment.notes;
    treatment.attended = req.body.attended !== undefined ? req.body.attended : treatment.attended;
    treatment.completedBy = req.user._id;
    await treatment.save();

    // Update package completedDays count if attended is true and day was not previously attended
    if (req.body.attended === true && !treatment.attended) {
      const pkg = await Package.findById(treatment.package);
      pkg.completedDays += 1;
      if (pkg.completedDays === pkg.totalDays) {
        pkg.status = 'completed';
        pkg.endDate = Date.now();
      }
      await pkg.save();
    } else if (req.body.attended === false && treatment.attended) {
      // If marking unattended, decrement
      const pkg = await Package.findById(treatment.package);
      pkg.completedDays -= 1;
      pkg.status = 'active';
      await pkg.save();
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_TREATMENT',
      entity: 'DayTreatment',
      entityId: treatment._id,
      details: req.body
    });

    res.json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};