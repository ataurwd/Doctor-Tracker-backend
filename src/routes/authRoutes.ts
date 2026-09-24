import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), login);
router.get('/me', protectAdmin, getMe);

export default router;
