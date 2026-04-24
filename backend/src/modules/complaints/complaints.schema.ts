import { TicketPriority } from '@prisma/client';
import { z } from 'zod';

// Trusted machine-to-machine intake — signed with FORM_WEBHOOK_SECRET.
export const intakeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  contact: z.string().max(60).optional(),
  subject: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10_000),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  source: z.string().max(60).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Public browser form — unauthenticated. Includes honeypot.
export const publicSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  contact: z.string().min(1).max(60),
  body: z.string().min(10).max(10_000),
  // Honeypot — legitimate users leave this empty. Bots tend to fill every field.
  website: z.string().max(0).optional(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type PublicInput = z.infer<typeof publicSchema>;
