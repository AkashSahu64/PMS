import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateOTP, verifyOTP } from '../services/otpService.js';
import { sendEmail } from '../services/emailService.js';
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Forgot password
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP(email);
    await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Verify OTP
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store token in user record with expiry
    await User.findOneAndUpdate({ email }, { resetToken, resetTokenExpiry: Date.now() + 10 * 60 * 1000 });

    res.json({ message: 'OTP verified', resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update password
// @route POST /api/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Google OAuth callback
// @route GET /api/auth/google/callback
// This is handled by passport, we'll define strategy later
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    // Verify token with Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    const data = await response.json();
    if (data.error) return res.status(401).json({ message: 'Invalid token' });

    const { email, name } = data;
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user with random password
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        role: 'doctor', // default role
        googleId: data.sub
      });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: jwtToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};