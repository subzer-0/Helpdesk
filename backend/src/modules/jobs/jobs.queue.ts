import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../../config/env';

export const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const QUEUE_NAMES = {
  EMAIL: 'email',
  AI: 'ai',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });
export const aiQueue = new Queue(QUEUE_NAMES.AI, { connection });

export const emailEvents = new QueueEvents(QUEUE_NAMES.EMAIL, { connection });
export const aiEvents = new QueueEvents(QUEUE_NAMES.AI, { connection });
