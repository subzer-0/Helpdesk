import { randomUUID } from 'node:crypto';
import { RequestHandler } from 'express';

export const requestId: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  (req as any).id = id;
  res.setHeader('x-request-id', id);
  next();
};
