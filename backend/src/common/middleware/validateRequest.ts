import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

interface Sources {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest =
  (sources: Sources): RequestHandler =>
  (req, _res, next) => {
    try {
      if (sources.body) req.body = sources.body.parse(req.body);
      if (sources.query) (req as any).query = sources.query.parse(req.query);
      if (sources.params) (req as any).params = sources.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
