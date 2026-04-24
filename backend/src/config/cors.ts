import cors from 'cors';
import { env } from './env';

const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Main CORS — allowlist-only. Used for staff UI and trusted clients.
 */
export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (origins.includes('*') || origins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
});

/**
 * Open CORS — used on public intake endpoints mounted on partner websites.
 * Allows any origin. Credentials disabled intentionally (no cookies).
 */
export const openCorsMiddleware = cors({
  origin: true,
  credentials: false,
  methods: ['POST', 'OPTIONS'],
});
