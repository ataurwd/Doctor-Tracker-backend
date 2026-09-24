import { Router } from 'express';
import {
  getSummary,
  getTrends,
  getPatientsPerDoctor,
} from '../controllers/analyticsController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// All analytics routes are protected for authenticated administrative users
router.use(protectAdmin);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/patients-per-doctor', getPatientsPerDoctor);

export default router;
