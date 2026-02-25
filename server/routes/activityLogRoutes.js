// routes/activityLogRoutes.js
import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { getActivityLogs } from '../controllers/activityLogController.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getActivityLogs);

export default router;