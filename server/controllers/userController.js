// controllers/userController.js (new)
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import bcrypt from 'bcryptjs';

// @desc Get current user profile
// @route GET /api/users/profile
export const getProfile = async (req, res) => {
  res.json(req.user);
};

// @desc Update user profile
// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Change password
// @route PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get clinic settings (admin only)
// @route GET /api/clinic
export const getClinic = async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = await Clinic.create({ name: 'Your Clinic Name' });
    }
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update clinic settings (admin only)
// @route PUT /api/clinic
export const updateClinic = async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = new Clinic(req.body);
    } else {
      Object.assign(clinic, req.body);
    }
    clinic.updatedAt = Date.now();
    await clinic.save();
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};