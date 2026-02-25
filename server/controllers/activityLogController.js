// controllers/activityLogController.js
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// @desc Get activity logs (admin only)
// @route GET /api/activitylogs
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user, action, entity, startDate, endDate } = req.query;
    const query = {};

    if (user) query.user = user;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (entity) query.entity = { $regex: entity, $options: 'i' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};