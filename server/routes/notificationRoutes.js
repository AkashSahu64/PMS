import express from 'express';
import { getUserNotifications, markAsRead, createNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.post('/', authorize('admin'), createNotification);

export default router;