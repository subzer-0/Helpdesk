import { TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  requesterId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10_000).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assigneeId: z.string().nullable().optional(),
});

export const listTicketsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assigneeId: z.string().optional(),
  requesterId: z.string().optional(),
  q: z.string().optional(),
});

export const ticketIdParam = z.object({ id: z.string().min(1) });
