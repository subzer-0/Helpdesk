import { EmailDirection } from '@prisma/client';
import { emailRepo } from '../../db/repositories/email.repo';
import { ticketRepo } from '../../db/repositories/ticket.repo';
import { userRepo } from '../../db/repositories/user.repo';
import { logger } from '../../config/logger';

interface InboundEmail {
  messageId?: string;
  from: string;
  to: string;
  subject: string;
  body: string;
}

const parseTicketIdFromSubject = (subject: string): string | null => {
  const match = /\[#([A-Za-z0-9_-]+)\]/.exec(subject);
  return match ? match[1] : null;
};

export const emailService = {
  async handleInbound(input: InboundEmail) {
    if (input.messageId) {
      const dup = await emailRepo.findByMessageId(input.messageId);
      if (dup) {
        logger.info({ messageId: input.messageId }, 'Duplicate inbound email ignored');
        return { ticketId: dup.ticketId, emailId: dup.id, duplicate: true };
      }
    }

    const ticketRef = parseTicketIdFromSubject(input.subject);
    const requester = await userRepo.findOrCreateRequester(input.from);

    let ticketId: string | null = null;
    let isNewTicket = false;

    if (ticketRef) {
      const existing = await ticketRepo.findById(ticketRef);
      if (existing) ticketId = existing.id;
    }

    if (!ticketId) {
      const created = await ticketRepo.create({
        subject: input.subject || '(no subject)',
        description: input.body,
        requesterId: requester.id,
      });
      ticketId = created.id;
      isNewTicket = true;
    }

    const email = await emailRepo.create({
      direction: EmailDirection.INBOUND,
      messageId: input.messageId,
      fromAddress: input.from,
      toAddress: input.to,
      subject: input.subject,
      body: input.body,
      ticketId,
    });

    if (isNewTicket) {
      const { aiQueue } = await import('../jobs/jobs.queue');
      await aiQueue.add('classify-ticket', { ticketId });
    }

    return { ticketId, emailId: email.id, duplicate: false };
  },

  async listForTicket(ticketId: string) {
    return emailRepo.listForTicket(ticketId);
  },
};
