import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { requirePermission } from '../../common/middleware/requireRole';
import { PERMISSIONS } from '../../common/constants/permissions';
import { aiController } from './ai.controller';

const router = Router();
router.use(authMiddleware, requirePermission(PERMISSIONS.AI_USE));

router.post('/classify', aiController.classify);
router.post('/polish', aiController.polish);
router.post('/summarize', aiController.summarize);

export default router;
