import express from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .post(authorize('admin', 'doctor'), createPatient)
  .get(getPatients);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('admin', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);

export default router;