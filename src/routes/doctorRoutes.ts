import { Router } from 'express';
import {
  getDoctors,
  createDoctor,
  getDoctorById,
  getDoctorPatients,
  addPatientToDoctor,
  removePatientFromDoctor,
} from '../controllers/doctorController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createDoctorSchema, queryDoctorSchema } from '../validators/doctorValidators.js';
import { createPatientSchema } from '../validators/patientValidators.js';

const router = Router();

// All doctor routes are protected for authenticated administrative users
router.use(protectAdmin);

router.get('/', validateRequest({ query: queryDoctorSchema }), getDoctors);
router.post('/', validateRequest({ body: createDoctorSchema }), createDoctor);
router.get('/:id', getDoctorById);
router.get('/:id/patients', getDoctorPatients);
router.post('/:id/patients', validateRequest({ body: createPatientSchema }), addPatientToDoctor);
router.delete('/:id/patients/:patientId', removePatientFromDoctor);

export default router;
