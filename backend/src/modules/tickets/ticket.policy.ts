import { Role, Ticket } from '@prisma/client';
import { AuthUser } from '../../common/middleware/authMiddleware';

export const ticketPolicy = {
  canView(user: AuthUser, ticket: Pick<Ticket, 'requesterId'>) {
    if (user.role === Role.ADMIN || user.role === Role.AGENT) return true;
    return ticket.requesterId === user.id;
  },

  canUpdate(user: AuthUser, ticket: Pick<Ticket, 'requesterId' | 'status'>) {
    if (user.role === Role.ADMIN || user.role === Role.AGENT) return true;
    // Customers may re-open or add clarifications only while not closed.
    return ticket.requesterId === user.id && ticket.status !== 'CLOSED';
  },

  canAssign(user: AuthUser) {
    return user.role === Role.ADMIN || user.role === Role.AGENT;
  },

  canDelete(user: AuthUser) {
    return user.role === Role.ADMIN;
  },

  canPostInternal(user: AuthUser) {
    return user.role === Role.ADMIN || user.role === Role.AGENT;
  },

  canReadInternal(user: AuthUser) {
    return user.role === Role.ADMIN || user.role === Role.AGENT;
  },

  scopedListFilter(user: AuthUser) {
    if (user.role === Role.ADMIN || user.role === Role.AGENT) return {};
    return { requesterId: user.id };
  },
};
