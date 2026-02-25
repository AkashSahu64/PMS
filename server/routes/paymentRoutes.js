import express from 'express';
import { createPayment, getPatientPayments } from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'doctor'), createPayment);
router.get('/patient/:patientId', authorize('admin', 'doctor'), getPatientPayments);

export default router;