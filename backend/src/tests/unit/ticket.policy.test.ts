import { Role, TicketStatus } from '@prisma/client';
import { ticketPolicy } from '../../modules/tickets/ticket.policy';

const mk = (role: Role, id = 'u1') => ({ id, email: `${id}@x.com`, role });

describe('ticketPolicy', () => {
  const ticket = { requesterId: 'u1', status: TicketStatus.OPEN };

  it('admin can view any ticket', () => {
    expect(ticketPolicy.canView(mk(Role.ADMIN, 'other'), ticket)).toBe(true);
  });

  it('agent can view any ticket', () => {
    expect(ticketPolicy.canView(mk(Role.AGENT, 'other'), ticket)).toBe(true);
  });

  it('customer can only view their own ticket', () => {
    expect(ticketPolicy.canView(mk(Role.CUSTOMER, 'u1'), ticket)).toBe(true);
    expect(ticketPolicy.canView(mk(Role.CUSTOMER, 'u2'), ticket)).toBe(false);
  });

  it('only admin can delete', () => {
    expect(ticketPolicy.canDelete(mk(Role.ADMIN))).toBe(true);
    expect(ticketPolicy.canDelete(mk(Role.AGENT))).toBe(false);
    expect(ticketPolicy.canDelete(mk(Role.CUSTOMER))).toBe(false);
  });

  it('customer cannot update closed ticket', () => {
    expect(
      ticketPolicy.canUpdate(mk(Role.CUSTOMER, 'u1'), { requesterId: 'u1', status: TicketStatus.CLOSED }),
    ).toBe(false);
  });

  it('customer list filter is scoped to own tickets', () => {
    expect(ticketPolicy.scopedListFilter(mk(Role.CUSTOMER, 'u1'))).toEqual({ requesterId: 'u1' });
    expect(ticketPolicy.scopedListFilter(mk(Role.AGENT))).toEqual({});
  });
});
