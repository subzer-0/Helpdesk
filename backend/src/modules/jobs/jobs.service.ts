import { aiQueue, emailQueue } from './jobs.queue';

export const jobsService = {
  enqueueClassifyTicket: (ticketId: string) =>
    aiQueue.add('classify-ticket', { ticketId }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }),

  enqueueSendEmail: (payload: { to: string; subject: string; body: string; ticketId?: string }) =>
    emailQueue.add('send-email', payload, { attempts: 5, backoff: { type: 'exponential', delay: 5000 } }),
};
