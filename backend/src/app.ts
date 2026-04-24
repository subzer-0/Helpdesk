import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsMiddleware } from './config/cors';
import { apiLimiter } from './config/rateLimit';
import { logger } from './config/logger';
import { requestId } from './common/middleware/requestId';
import { errorHandler } from './common/errors/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import ticketsRoutes from './modules/tickets/tickets.routes';
import emailRoutes from './modules/email/email.routes';
import aiRoutes from './modules/ai/ai.routes';
import settingsRoutes from './modules/settings/settings.routes';
import complaintsRoutes from './modules/complaints/complaints.routes';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as any).id }),
    }),
  );
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  app.use(apiLimiter);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/complaints', complaintsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
};
