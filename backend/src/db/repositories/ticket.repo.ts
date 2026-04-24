import { Prisma, TicketPriority, TicketStatus } from '@prisma/client';
import { prisma } from '../client';

export interface TicketListFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  requesterId?: string;
  q?: string;
}

export const ticketRepo = {
  findById: (id: string) =>
    prisma.ticket.findUnique({
      where: { id },
      include: { requester: true, assignee: true },
    }),

  create: (data: Prisma.TicketUncheckedCreateInput) =>
    prisma.ticket.create({ data, include: { requester: true, assignee: true } }),

  update: (id: string, data: Prisma.TicketUpdateInput) =>
    prisma.ticket.update({
      where: { id },
      data,
      include: { requester: true, assignee: true },
    }),

  list: (opts: { skip: number; take: number; filters: TicketListFilters }) => {
    const { filters } = opts;
    const where: Prisma.TicketWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters.requesterId ? { requesterId: filters.requesterId } : {}),
      ...(filters.q
        ? {
            OR: [
              { subject: { contains: filters.q, mode: 'insensitive' } },
              { description: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return prisma.$transaction([
      prisma.ticket.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: 'desc' },
        include: { requester: true, assignee: true },
      }),
      prisma.ticket.count({ where }),
    ]);
  },

  delete: (id: string) => prisma.ticket.delete({ where: { id } }),
};
