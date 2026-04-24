import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.string().min(1).max(10_000),
  isInternal: z.boolean().default(false),
});

export const ticketIdParam = z.object({ ticketId: z.string().min(1) });
