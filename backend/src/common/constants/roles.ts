import { Role } from '@prisma/client';

export const ROLES = Role;
export type RoleName = keyof typeof Role;

export const ROLE_RANK: Record<Role, number> = {
  [Role.CUSTOMER]: 0,
  [Role.AGENT]: 1,
  [Role.ADMIN]: 2,
};

export const atLeast = (actual: Role, required: Role) =>
  ROLE_RANK[actual] >= ROLE_RANK[required];
