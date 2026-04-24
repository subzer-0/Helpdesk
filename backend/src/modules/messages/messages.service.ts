import { messageRepo } from '../../db/repositories/message.repo';
import { ticketRepo } from '../../db/repositories/ticket.repo';
import { AuthUser } from '../../common/middleware/authMiddleware';
import { ApiError } from '../../common/errors/ApiError';
import { ticketPolicy } from '../tickets/ticket.policy';
import { Role, EmailDirection } from '@prisma/client';
import { emailQueue } from '../jobs/jobs.queue';
import { emailRepo } from '../../db/repositories/email.repo';

export const messagesService = {
  async list(user: AuthUser, ticketId: string) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Ticket not found');
    if (!ticketPolicy.canView(user, ticket)) throw ApiError.forbidden();
    return messageRepo.listForTicket(ticketId, ticketPolicy.canReadInternal(user));
  },

  async create(user: AuthUser, ticketId: string, input: { body: string; isInternal: boolean }) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Ticket not found');
    if (!ticketPolicy.canView(user, ticket)) throw ApiError.forbidden();
    if (input.isInternal && !ticketPolicy.canPostInternal(user)) {
      throw ApiError.forbidden('Only agents may post internal notes');
    }
    const created = await messageRepo.create({
      ticketId,
      authorId: user.id,
      body: input.body,
      isInternal: input.isInternal,
    });

    const isStaff = user.role === Role.ADMIN || user.role === Role.AGENT;
    if (isStaff && !input.isInternal) {
      await emailRepo.create({
        direction: EmailDirection.OUTBOUND,
        fromAddress: 'support@helpdesk.io',
        toAddress: ticket.requester.email,
        subject: `Re: ${ticket.subject}`,
        body: input.body,
        ticketId,
      });
      await emailQueue.add('send-email', {
        to: ticket.requester.email,
        subject: `Re: ${ticket.subject}`,
        body: input.body,
        ticketId,
      });
    }

    return created;
  },
};
