import { Prisma } from '@prisma/client';
import { prisma } from '../client';

export const emailRepo = {
  findByMessageId: (messageId: string) =>
    prisma.email.findUnique({ where: { messageId } }),

  create: (data: Prisma.EmailUncheckedCreateInput) =>
    prisma.email.create({ data }),

  linkToTicket: (emailId: string, ticketId: string) =>
    prisma.email.update({ where: { id: emailId }, data: { ticketId } }),

  listForTicket: (ticketId: string) =>
    prisma.email.findMany({
      where: { ticketId },
      orderBy: { receivedAt: 'asc' },
    }),
};
