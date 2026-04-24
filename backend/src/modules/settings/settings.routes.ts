import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { requirePermission } from '../../common/middleware/requireRole';
import { PERMISSIONS } from '../../common/constants/permissions';
import { settingsController } from './settings.controller';

const router = Router();
router.use(authMiddleware);

// Anyone authenticated can read settings.
router.get('/', settingsController.getAll);
router.get('/:key', settingsController.get);

// Only admins can write.
router.put('/:key', requirePermission(PERMISSIONS.SETTINGS_WRITE), settingsController.set);
router.delete('/:key', requirePermission(PERMISSIONS.SETTINGS_WRITE), settingsController.delete);

export default router;
