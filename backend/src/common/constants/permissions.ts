import { Role } from '@prisma/client';

export const PERMISSIONS = {
  TICKET_CREATE: 'ticket:create',
  TICKET_READ_ANY: 'ticket:read:any',
  TICKET_READ_OWN: 'ticket:read:own',
  TICKET_UPDATE_ANY: 'ticket:update:any',
  TICKET_ASSIGN: 'ticket:assign',
  TICKET_DELETE: 'ticket:delete',
  USER_MANAGE: 'user:manage',
  SETTINGS_WRITE: 'settings:write',
  AI_USE: 'ai:use',
  INTERNAL_NOTE: 'message:internal',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.CUSTOMER]: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ_OWN,
  ],
  [Role.AGENT]: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ_ANY,
    PERMISSIONS.TICKET_UPDATE_ANY,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.AI_USE,
    PERMISSIONS.INTERNAL_NOTE,
  ],
  [Role.ADMIN]: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ_ANY,
    PERMISSIONS.TICKET_UPDATE_ANY,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.TICKET_DELETE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.AI_USE,
    PERMISSIONS.INTERNAL_NOTE,
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role].includes(permission);
