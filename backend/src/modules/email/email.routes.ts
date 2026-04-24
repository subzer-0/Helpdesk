import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware';
import { emailController } from './email.controller';
import { verifyEmailWebhook } from './email.webhook';

const router = Router();

// Inbound webhook — authenticated via HMAC signature, not JWT.
router.post('/inbound', verifyEmailWebhook, emailController.inbound);

// Authenticated listing of emails on a ticket.
router.get('/tickets/:ticketId', authMiddleware, emailController.listForTicket);

export default router;
