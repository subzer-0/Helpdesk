import { RequestHandler } from 'express';
import { ApiError } from '../../common/errors/ApiError';
import { messagesService } from './messages.service';

export const messagesController = {
  list: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      res.json(await messagesService.list(req.user, req.params.ticketId));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const msg = await messagesService.create(req.user, req.params.ticketId, req.body);
      res.status(201).json(msg);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
