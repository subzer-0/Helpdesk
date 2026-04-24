import { Router } from 'express';
import { env } from '../../config/env';
import { verifyHmac } from '../../common/middleware/verifyHmac';
import { validateRequest } from '../../common/middleware/validateRequest';
import { publicIntakeLimiter } from '../../config/rateLimit';
import { openCorsMiddleware } from '../../config/cors';
import { complaintsController } from './complaints.controller';
import { intakeSchema, publicSchema } from './complaints.schema';

const router = Router();

// Machine-to-machine intake — signed with FORM_WEBHOOK_SECRET.
router.post(
  '/intake',
  verifyHmac(env.FORM_WEBHOOK_SECRET),
  validateRequest({ body: intakeSchema }),
  complaintsController.intake,
);

// Public browser form — embedded on partner websites. Any origin, rate-limited,
// honeypot-checked. Handles the CORS preflight.
router.options('/public', openCorsMiddleware);
router.post(
  '/public',
  openCorsMiddleware,
  publicIntakeLimiter,
  validateRequest({ body: publicSchema }),
  complaintsController.publicIntake,
);

export default router;
