import { createHash, randomBytes } from 'node:crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../db/client';
import { userRepo } from '../../db/repositories/user.repo';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../common/utils/jwt';
import { addMs, parseDurationMs } from '../../common/utils/dates';
import { ApiError } from '../../common/errors/ApiError';
import { env } from '../../config/env';
import { LoginInput, RegisterInput } from './auth.schema';

const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

const issueTokens = async (user: { id: string; email: string; role: Role }) => {
  const tokenId = randomBytes(16).toString('hex');
  const refresh = signRefreshToken({ sub: user.id, tokenId });
  const access = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId: user.id,
      tokenHash: hashToken(refresh),
      expiresAt: addMs(new Date(), parseDurationMs(env.JWT_REFRESH_TTL)),
    },
  });

  return { accessToken: access, refreshToken: refresh };
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw ApiError.conflict('Email already in use');
    const user = await userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
      role: Role.CUSTOMER,
    });
    const tokens = await issueTokens(user);
    return { user: sanitize(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    const tokens = await issueTokens(user);
    return { user: sanitize(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const record = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });
    if (!record || record.revokedAt || record.tokenHash !== hashToken(refreshToken)) {
      throw ApiError.unauthorized('Refresh token revoked');
    }
    if (record.expiresAt < new Date()) throw ApiError.unauthorized('Refresh token expired');

    const user = await userRepo.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('User inactive');

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await issueTokens(user);
    return { user: sanitize(user), ...tokens };
  },

  async logout(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.tokenId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // no-op
    }
  },
};

export const sanitize = <T extends { passwordHash?: string }>(u: T) => {
  const { passwordHash: _pw, ...rest } = u;
  return rest;
};
