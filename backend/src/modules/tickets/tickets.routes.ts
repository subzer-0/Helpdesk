import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { validateRequest } from '../../common/middleware/validateRequest';
import { ticketsController } from './tickets.controller';
import {
  createTicketSchema,
  listTicketsQuery,
  ticketIdParam,
  updateTicketSchema,
} from './tickets.schema';
import messagesRouter from '../messages/messages.routes';

const router = Router();

router.use(authMiddleware);

router.get('/', validateRequest({ query: listTicketsQuery }), ticketsController.list);
router.post('/', validateRequest({ body: createTicketSchema }), ticketsController.create);
router.get('/:id', validateRequest({ params: ticketIdParam }), ticketsController.get);
router.patch(
  '/:id',
  validateRequest({ params: ticketIdParam, body: updateTicketSchema }),
  ticketsController.update,
);
router.delete('/:id', validateRequest({ params: ticketIdParam }), ticketsController.delete);

router.use('/:ticketId/messages', messagesRouter);

export default router;
