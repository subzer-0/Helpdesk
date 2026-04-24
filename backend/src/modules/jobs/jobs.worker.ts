import { Worker } from 'bullmq';
import { connection, QUEUE_NAMES, emailQueue } from './jobs.queue';
import { logger } from '../../config/logger';
import { aiService } from '../ai/ai.service';
import { ticketRepo } from '../../db/repositories/ticket.repo';
import { messageRepo } from '../../db/repositories/message.repo';
import { prisma } from '../../db/client';
import { TicketPriority, Role, TicketStatus } from '@prisma/client';

const aiWorker = new Worker(
  QUEUE_NAMES.AI,
  async (job) => {
    if (job.name === 'classify-ticket') {
      const { ticketId } = job.data as { ticketId: string };
      const ticket = await ticketRepo.findById(ticketId);
      if (!ticket) return { skipped: true };
      
      const { result } = await aiService.classify(`${ticket.subject}\n\n${ticket.description}`);
      
      const priority = (result as any)?.priority as TicketPriority | undefined;
      const isComplex = (result as any)?.isComplex as boolean | undefined;
      const autoResponse = (result as any)?.autoResponse as string | undefined;

      const updateData: any = {};
      if (priority && Object.values(TicketPriority).includes(priority)) {
        updateData.priority = priority;
      }

      if (isComplex === true) {
        // Escalate -> find an active Agent/Admin to assign
        const availableAgent = await prisma.user.findFirst({
          where: { role: { in: [Role.AGENT, Role.ADMIN] }, isActive: true },
          orderBy: { ticketsAssigned: { _count: 'asc' } },
        });

        if (availableAgent) {
          updateData.assigneeId = availableAgent.id;
          
          await messageRepo.create({
            ticketId,
            authorId: availableAgent.id,
            body: `[SYSTEM] AI designated this issue as complex (Priority: ${priority}). Escalated to agent.`,
            isInternal: true,
          });
        }
      } else if (isComplex === false && autoResponse && ticket.requester) {
        // Simple issue -> auto-respond and resolve
        const systemBot = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
        
        if (systemBot) {
          updateData.status = TicketStatus.RESOLVED;

          await messageRepo.create({
            ticketId,
            authorId: systemBot.id,
            body: autoResponse,
            isInternal: false,
          });

          await emailQueue.add('send-email', {
            to: ticket.requester.email,
            subject: `Re: ${ticket.subject}`,
            body: autoResponse,
          });
        }
      }

      if (Object.keys(updateData).length > 0) {
        await ticketRepo.update(ticketId, updateData);
      }

      return { ticketId, priority, isComplex };
    }
    return { unknown: true };
  },
  { connection },
);

const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    if (job.name === 'send-email') {
      // Integrate with an SMTP / SES / Postmark client here.
      logger.info({ job: job.id, data: job.data }, 'Sending email (stub)');
      return { sent: true };
    }
    return { unknown: true };
  },
  { connection },
);

aiWorker.on('failed', (job, err) => logger.error({ job: job?.id, err }, 'AI job failed'));
emailWorker.on('failed', (job, err) => logger.error({ job: job?.id, err }, 'Email job failed'));

logger.info('Workers started');

const shutdown = async () => {
  await Promise.all([aiWorker.close(), emailWorker.close()]);
  await connection.quit();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
