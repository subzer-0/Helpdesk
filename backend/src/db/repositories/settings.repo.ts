import { Prisma } from '@prisma/client';
import { prisma } from '../client';

export const settingsRepo = {
  get: (key: string) => prisma.setting.findUnique({ where: { key } }),

  getAll: () => prisma.setting.findMany({ orderBy: { key: 'asc' } }),

  upsert: (key: string, value: Prisma.InputJsonValue) =>
    prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    }),

  delete: (key: string) => prisma.setting.delete({ where: { key } }),
};
