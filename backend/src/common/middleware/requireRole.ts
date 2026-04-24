import { RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import { hasPermission, Permission } from '../constants/permissions';
import { atLeast } from '../constants/roles';

export const requireRole =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

export const requireMinRole =
  (min: Role): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!atLeast(req.user.role, min)) return next(ApiError.forbidden());
    next();
  };

export const requirePermission =
  (permission: Permission): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!hasPermission(req.user.role, permission)) return next(ApiError.forbidden());
    next();
  };
