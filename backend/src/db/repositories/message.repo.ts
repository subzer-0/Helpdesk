import { Prisma } from '@prisma/client';
import { prisma } from '../client';

export const messageRepo = {
  listForTicket: (ticketId: string, includeInternal: boolean) =>
    prisma.message.findMany({
      where: { ticketId, ...(includeInternal ? {} : { isInternal: false }) },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, email: true, role: true } } },
    }),

  create: (data: Prisma.MessageUncheckedCreateInput) =>
    prisma.message.create({
      data,
      include: { author: { select: { id: true, name: true, email: true, role: true } } },
    }),
};
