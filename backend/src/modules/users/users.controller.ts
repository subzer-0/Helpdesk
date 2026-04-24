import { RequestHandler } from 'express';
import { usersService } from './users.service';

export const usersController = {
  list: (async (req, res, next) => {
    try {
      const result = await usersService.list(req.query as any);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      res.json(await usersService.get(req.params.id));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      res.status(201).json(await usersService.create(req.body));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      res.json(await usersService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      await usersService.delete(req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
