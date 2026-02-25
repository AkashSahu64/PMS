// routes/userRoutes.js
import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { getProfile, updateProfile, changePassword, getClinic, updateClinic } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/clinic', authorize('admin'), getClinic);
router.put('/clinic', authorize('admin'), updateClinic);

export default router;