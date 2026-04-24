import { Prisma } from '@prisma/client';
import { settingsRepo } from '../../db/repositories/settings.repo';
import { ApiError } from '../../common/errors/ApiError';

export const settingsService = {
  async getAll() {
    const rows = await settingsRepo.getAll();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },

  async get(key: string) {
    const row = await settingsRepo.get(key);
    if (!row) throw ApiError.notFound(`Setting not found: ${key}`);
    return { key: row.key, value: row.value };
  },

  async set(key: string, value: Prisma.InputJsonValue) {
    const row = await settingsRepo.upsert(key, value);
    return { key: row.key, value: row.value };
  },

  async delete(key: string) {
    await settingsRepo.delete(key);
  },
};
