import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc Get user notifications
// @route GET /api/notifications
export const getUserNotifications = async (req, res) => {
  try {
    // Base query: user specific OR global (user: null)
    const query = {
      $or: [{ user: req.user._id }, { user: null }]
    };

    // ✅ If unreadOnly=true → add read:false filter
    if (req.query.unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.user && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create a notification (admin only)
// @route POST /api/notifications
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;
    const notification = await Notification.create({
      user: userId || null,
      title,
      message,
      type
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};