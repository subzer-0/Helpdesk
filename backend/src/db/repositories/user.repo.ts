import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../client';

export const userRepo = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  /**
   * Finds an existing user by email, or creates a CUSTOMER record with an
   * unusable random password. Used by inbound channels (email, form intake)
   * where the complainant should never log in.
   */
  async findOrCreateRequester(email: string, name?: string): Promise<User> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;
    return prisma.user.create({
      data: {
        email,
        name: name ?? email.split('@')[0],
        role: Role.CUSTOMER,
        passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
      },
    });
  },

  create: (data: Prisma.UserUncheckedCreateInput) =>
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),

  list: (opts: { skip: number; take: number; role?: Role; q?: string }) => {
    const where: Prisma.UserWhereInput = {
      ...(opts.role ? { role: opts.role } : {}),
      ...(opts.q
        ? {
            OR: [
              { email: { contains: opts.q, mode: 'insensitive' } },
              { name: { contains: opts.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
  },

  delete: (id: string) => prisma.user.delete({ where: { id } }),
};

export type { User };
