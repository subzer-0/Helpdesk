import { RequestHandler } from 'express';
import { ApiError } from '../../common/errors/ApiError';
import { ticketsService } from './tickets.service';

export const ticketsController = {
  list: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const { page, pageSize, ...filters } = req.query as any;
      const result = await ticketsService.list(req.user, {
        page: Number(page),
        pageSize: Number(pageSize),
        filters,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      res.json(await ticketsService.get(req.user, req.params.id));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      res.status(201).json(await ticketsService.create(req.user, req.body));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      res.json(await ticketsService.update(req.user, req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      await ticketsService.delete(req.user, req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
