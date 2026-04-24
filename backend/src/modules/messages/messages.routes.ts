import { Router } from 'express';
import { validateRequest } from '../../common/middleware/validateRequest';
import { messagesController } from './messages.controller';
import { createMessageSchema, ticketIdParam } from './messages.schema';

const router = Router({ mergeParams: true });

router.get('/', validateRequest({ params: ticketIdParam }), messagesController.list);
router.post(
  '/',
  validateRequest({ params: ticketIdParam, body: createMessageSchema }),
  messagesController.create,
);

export default router;
