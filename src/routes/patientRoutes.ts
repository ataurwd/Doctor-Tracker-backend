import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { queryPatientSchema, updatePatientSchema } from '../validators/patientValidators.js';

const router = Router();

// All patient routes are protected for authenticated administrative users
router.use(protectAdmin);

router.get('/', validateRequest({ query: queryPatientSchema }), getPatients);
router.get('/:id', getPatientById);
router.put('/:id', validateRequest({ body: updatePatientSchema }), updatePatient);
router.delete('/:id', deletePatient);

export default router;
