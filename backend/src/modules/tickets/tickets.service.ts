import { TicketStatus } from '@prisma/client';
import { ticketRepo, TicketListFilters } from '../../db/repositories/ticket.repo';
import { AuthUser } from '../../common/middleware/authMiddleware';
import { ApiError } from '../../common/errors/ApiError';
import { paginated } from '../../common/utils/pagination';
import { ticketPolicy } from './ticket.policy';

export const ticketsService = {
  async list(
    user: AuthUser,
    opts: { page: number; pageSize: number; filters: TicketListFilters },
  ) {
    const scoped = { ...opts.filters, ...ticketPolicy.scopedListFilter(user) };
    const [items, total] = await ticketRepo.list({
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      filters: scoped,
    });
    return paginated(items, total, { page: opts.page, pageSize: opts.pageSize });
  },

  async get(user: AuthUser, id: string) {
    const ticket = await ticketRepo.findById(id);
    if (!ticket) throw ApiError.notFound('Ticket not found');
    if (!ticketPolicy.canView(user, ticket)) throw ApiError.forbidden();
    return ticket;
  },

  async create(
    user: AuthUser,
    input: {
      subject: string;
      description: string;
      priority: NonNullable<Parameters<typeof ticketRepo.create>[0]['priority']>;
      requesterId?: string;
    },
  ) {
    const requesterId =
      input.requesterId && ticketPolicy.canAssign(user) ? input.requesterId : user.id;
    return ticketRepo.create({
      subject: input.subject,
      description: input.description,
      priority: input.priority,
      requesterId,
    });
  },

  async update(
    user: AuthUser,
    id: string,
    input: {
      subject?: string;
      description?: string;
      status?: TicketStatus;
      priority?: Parameters<typeof ticketRepo.update>[1]['priority'];
      assigneeId?: string | null;
    },
  ) {
    const ticket = await ticketRepo.findById(id);
    if (!ticket) throw ApiError.notFound('Ticket not found');
    if (!ticketPolicy.canUpdate(user, ticket)) throw ApiError.forbidden();
    if (input.assigneeId !== undefined && !ticketPolicy.canAssign(user)) {
      throw ApiError.forbidden('Not allowed to assign tickets');
    }

    const closing = input.status && input.status === TicketStatus.CLOSED && ticket.status !== TicketStatus.CLOSED;

    return ticketRepo.update(id, {
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined
        ? input.assigneeId === null
          ? { assignee: { disconnect: true } }
          : { assignee: { connect: { id: input.assigneeId } } }
        : {}),
      ...(closing ? { closedAt: new Date() } : {}),
    });
  },

  async delete(user: AuthUser, id: string) {
    if (!ticketPolicy.canDelete(user)) throw ApiError.forbidden();
    await ticketRepo.delete(id);
  },
};
