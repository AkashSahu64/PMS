import express from 'express';
import { getDashboardStats, getReports } from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('admin', 'doctor'), getDashboardStats);
router.get('/', authorize('admin'), getReports);

export default router;