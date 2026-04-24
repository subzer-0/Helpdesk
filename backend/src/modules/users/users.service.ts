import { Role } from '@prisma/client';
import { userRepo } from '../../db/repositories/user.repo';
import { hashPassword } from '../../common/utils/password';
import { sanitize } from '../auth/auth.service';
import { ApiError } from '../../common/errors/ApiError';
import { paginated } from '../../common/utils/pagination';

export const usersService = {
  async list(opts: { page: number; pageSize: number; role?: Role; q?: string }) {
    const skip = (opts.page - 1) * opts.pageSize;
    const [items, total] = await userRepo.list({
      skip,
      take: opts.pageSize,
      role: opts.role,
      q: opts.q,
    });
    return paginated(items.map(sanitize), total, { page: opts.page, pageSize: opts.pageSize });
  },

  async get(id: string) {
    const user = await userRepo.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return sanitize(user);
  },

  async create(input: { email: string; name: string; password: string; role: Role }) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw ApiError.conflict('Email already in use');
    const user = await userRepo.create({
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    });
    return sanitize(user);
  },

  async update(
    id: string,
    input: { name?: string; role?: Role; isActive?: boolean; password?: string },
  ) {
    const user = await userRepo.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    const data: Parameters<typeof userRepo.update>[1] = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    };
    const updated = await userRepo.update(id, data);
    return sanitize(updated);
  },

  async delete(id: string) {
    await userRepo.delete(id);
  },
};
