import { RequestHandler } from 'express';
import { authService, sanitize } from './auth.service';
import { userRepo } from '../../db/repositories/user.repo';
import { ApiError } from '../../common/errors/ApiError';

export const authController = {
  register: (async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  login: (async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  refresh: (async (req, res, next) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  logout: (async (req, res, next) => {
    try {
      await authService.logout(req.body.refreshToken ?? '');
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  me: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const user = await userRepo.findById(req.user.id);
      if (!user) throw ApiError.notFound('User not found');
      res.json(sanitize(user));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
