import express from 'express';
import { register, login, forgotPassword, verifyOtp, updatePassword, googleAuth } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/update-password', authLimiter, updatePassword);
router.post('/google', googleAuth);

export default router;