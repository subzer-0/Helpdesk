import { createHmac, timingSafeEqual } from 'node:crypto';
import { RequestHandler } from 'express';
import { ApiError } from '../errors/ApiError';

/**
 * Validates X-Webhook-Signature (hex HMAC-SHA256 of the raw request body)
 * against the provided shared secret. Requires app.ts to capture rawBody
 * via express.json({ verify }).
 */
export const verifyHmac = (secret: string, header = 'x-webhook-signature'): RequestHandler =>
  (req, _res, next) => {
    const signature = req.header(header);
    if (!signature) return next(ApiError.unauthorized('Missing webhook signature'));

    const raw: Buffer | undefined = (req as any).rawBody;
    if (!raw) return next(ApiError.badRequest('Raw body unavailable for signature verification'));

    const expected = createHmac('sha256', secret).update(raw).digest('hex');

    let sig: Buffer;
    try {
      sig = Buffer.from(signature, 'hex');
    } catch {
      return next(ApiError.unauthorized('Invalid signature encoding'));
    }
    const exp = Buffer.from(expected, 'hex');

    if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
      return next(ApiError.unauthorized('Invalid webhook signature'));
    }
    next();
  };
