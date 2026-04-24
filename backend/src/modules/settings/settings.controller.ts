import { RequestHandler } from 'express';
import { z } from 'zod';
import { settingsService } from './settings.service';

const setSchema = z.object({ value: z.any() });

export const settingsController = {
  getAll: (async (_req, res, next) => {
    try {
      res.json(await settingsService.getAll());
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      res.json(await settingsService.get(req.params.key));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  set: (async (req, res, next) => {
    try {
      const { value } = setSchema.parse(req.body);
      res.json(await settingsService.set(req.params.key, value));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      await settingsService.delete(req.params.key);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
