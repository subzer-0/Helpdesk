import { verifyHmac } from '../../common/middleware/verifyHmac';
import { env } from '../../config/env';

export const verifyEmailWebhook = verifyHmac(env.EMAIL_WEBHOOK_SECRET);
