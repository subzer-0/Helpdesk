import { Role } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(128).optional(),
});

export const listUsersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  role: z.nativeEnum(Role).optional(),
  q: z.string().optional(),
});

export const userIdParam = z.object({ id: z.string().min(1) });
