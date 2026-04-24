import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const toPrismaSkipTake = ({ page, pageSize }: PaginationInput) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const paginated = <T>(items: T[], total: number, p: PaginationInput): Paginated<T> => ({
  items,
  page: p.page,
  pageSize: p.pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / p.pageSize)),
});
