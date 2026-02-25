import express from 'express';
import { createPackage, getPatientPackages, updatePackage } from '../controllers/packageController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'doctor'), createPackage);
router.get('/patient/:patientId', authorize('admin', 'doctor'), getPatientPackages);
router.put('/:id', authorize('admin', 'doctor'), updatePackage);

export default router;