import { ticketRepo } from '../../db/repositories/ticket.repo';
import { userRepo } from '../../db/repositories/user.repo';
import { logger } from '../../config/logger';
import { IntakeInput, PublicInput } from './complaints.schema';

const autoSubject = (body: string) => {
  const firstLine = body.split('\n')[0].trim();
  if (!firstLine) return '(no subject)';
  return firstLine.length <= 80 ? firstLine : `${firstLine.slice(0, 77)}...`;
};

const formatDescription = (body: string, contact?: string, metadata?: Record<string, unknown>) => {
  const parts = [body.trim()];
  const extras: string[] = [];
  if (contact) extras.push(`Contact: ${contact}`);
  if (metadata && Object.keys(metadata).length > 0) {
    extras.push(`Metadata:\n${JSON.stringify(metadata, null, 2)}`);
  }
  if (extras.length > 0) parts.push('---', ...extras);
  return parts.join('\n\n');
};

const createFromNormalized = async (input: {
  email: string;
  name?: string;
  contact?: string;
  subject: string;
  description: string;
  priority: IntakeInput['priority'];
  source: string;
}) => {
  const requester = await userRepo.findOrCreateRequester(input.email, input.name);
  const ticket = await ticketRepo.create({
    subject: input.subject,
    description: input.description,
    priority: input.priority,
    requesterId: requester.id,
  });

  logger.info(
    { ticketId: ticket.id, requesterId: requester.id, source: input.source },
    'Complaint intake created ticket',
  );

  return { ticketId: ticket.id, requesterId: requester.id, source: input.source };
};

export const complaintsService = {
  intake(input: IntakeInput) {
    return createFromNormalized({
      email: input.email,
      name: input.name,
      contact: input.contact,
      subject: input.subject ?? autoSubject(input.description),
      description: formatDescription(input.description, input.contact, input.metadata),
      priority: input.priority,
      source: input.source ?? 'intake',
    });
  },

  publicIntake(input: PublicInput) {
    return createFromNormalized({
      email: input.email,
      name: input.name,
      contact: input.contact,
      subject: autoSubject(input.body),
      description: formatDescription(input.body, input.contact),
      priority: 'MEDIUM',
      source: 'public-form',
    });
  },
};
