import Patient from '../models/Patient.js';
import Package from '../models/Package.js';
import Payment from '../models/Payment.js';
import DayTreatment from '../models/DayTreatment.js';

// @desc Get dashboard stats
// @route GET /api/reports/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isDeleted: false });
    const activePackages = await Package.countDocuments({ status: 'active' });
    const pendingBalances = await Package.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    // Revenue graph (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Payment.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Treatment statistics (completed vs total days)
    const packageStats = await Package.aggregate([
      { $group: {
          _id: null,
          totalDays: { $sum: '$totalDays' },
          completedDays: { $sum: '$completedDays' }
        }
      }
    ]);

    // Upcoming appointments (treatments for today and tomorrow)
    const today = new Date();
today.setHours(0, 0, 0, 0);

const endOfTomorrow = new Date(today);
endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
endOfTomorrow.setHours(23, 59, 59, 999);

    // We need to join with patient data
    const upcomingTreatments = await DayTreatment.find({
      date: { $gte: today, $lte: endOfTomorrow },
      attended: false
    }).populate({
      path: 'package',
      populate: { path: 'patient', select: 'name mobile' }
    }).limit(10);

    const appointments = upcomingTreatments.map(t => ({
      patientName: t.package.patient.name,
      mobile: t.package.patient.mobile,
      day: t.dayNumber,
      date: t.date
    }));

    res.json({
      totalPatients,
      activePackages,
      pendingBalances: pendingBalances[0]?.total || 0,
      dailyRevenue,
      packageStats: packageStats[0] || { totalDays: 0, completedDays: 0 },
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get detailed reports with filters
// @route GET /api/reports
export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const filter = {};
    if (startDate && endDate) {
  filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
}

    if (type === 'patients') {
      const patients = await Patient.find(filter).count();
      res.json({ count: patients });
    } else if (type === 'payments') {
      const payments = await Payment.aggregate([
        { $match: filter },
        { $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);
      res.json(payments[0] || { total: 0, count: 0 });
    } else if (type === 'packages') {
      const packages = await Package.find(filter).count();
      const completed = await Package.find({ ...filter, status: 'completed' }).count();
      res.json({ total: packages, completed });
    } else {
      res.status(400).json({ message: 'Invalid report type' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};