import { RequestHandler } from 'express';
import { ApiError } from '../../common/errors/ApiError';
import { complaintsService } from './complaints.service';

export const complaintsController = {
  intake: (async (req, res, next) => {
    try {
      const result = await complaintsService.intake(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  publicIntake: (async (req, res, next) => {
    try {
      // Honeypot: bots tend to fill every field; legitimate users leave 'website' empty.
      if (req.body.website) throw ApiError.badRequest('Invalid submission');
      const result = await complaintsService.publicIntake(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
