import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validateRequest';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { authLimiter } from '../../config/rateLimit';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
