import express from 'express';
import { addComplaint, getPatientComplaints } from '../controllers/complaintController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'doctor'), addComplaint);
router.get('/patient/:patientId', authorize('admin', 'doctor'), getPatientComplaints);

export default router;