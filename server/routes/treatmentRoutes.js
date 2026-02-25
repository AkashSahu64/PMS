import express from 'express';
import { getTreatmentsByPackage, updateTreatment } from '../controllers/treatmentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/package/:packageId', authorize('admin', 'doctor'), getTreatmentsByPackage);
router.put('/:id', authorize('admin', 'doctor'), updateTreatment);

export default router;