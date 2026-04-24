import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { requirePermission } from '../../common/middleware/requireRole';
import { validateRequest } from '../../common/middleware/validateRequest';
import { PERMISSIONS } from '../../common/constants/permissions';
import { usersController } from './users.controller';
import {
  createUserSchema,
  listUsersQuery,
  updateUserSchema,
  userIdParam,
} from './users.schema';

const router = Router();

router.use(authMiddleware, requirePermission(PERMISSIONS.USER_MANAGE));

router.get('/', validateRequest({ query: listUsersQuery }), usersController.list);
router.post('/', validateRequest({ body: createUserSchema }), usersController.create);
router.get('/:id', validateRequest({ params: userIdParam }), usersController.get);
router.patch(
  '/:id',
  validateRequest({ params: userIdParam, body: updateUserSchema }),
  usersController.update,
);
router.delete('/:id', validateRequest({ params: userIdParam }), usersController.delete);

export default router;
