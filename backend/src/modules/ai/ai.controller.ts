import { RequestHandler } from 'express';
import { z } from 'zod';
import { aiService } from './ai.service';

const textSchema = z.object({ text: z.string().min(1).max(20_000) });
const draftSchema = z.object({ draft: z.string().min(1).max(20_000) });
const convoSchema = z.object({ conversation: z.string().min(1).max(40_000) });

export const aiController = {
  classify: (async (req, res, next) => {
    try {
      const { text } = textSchema.parse(req.body);
      res.json(await aiService.classify(text));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  polish: (async (req, res, next) => {
    try {
      const { draft } = draftSchema.parse(req.body);
      res.json(await aiService.polish(draft));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  summarize: (async (req, res, next) => {
    try {
      const { conversation } = convoSchema.parse(req.body);
      res.json(await aiService.summarize(conversation));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
