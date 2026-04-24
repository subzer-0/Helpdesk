import { RequestHandler } from 'express';
import { z } from 'zod';
import { emailService } from './email.service';

const inboundSchema = z.object({
  messageId: z.string().optional(),
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().default(''),
  body: z.string().default(''),
});

export const emailController = {
  inbound: (async (req, res, next) => {
    try {
      const parsed = inboundSchema.parse(req.body);
      const result = await emailService.handleInbound(parsed);
      res.status(result.duplicate ? 200 : 201).json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  listForTicket: (async (req, res, next) => {
    try {
      res.json(await emailService.listForTicket(req.params.ticketId));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
