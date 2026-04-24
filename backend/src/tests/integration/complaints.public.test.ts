import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../db/client';

const app = createApp();

const mk = (tag: string) =>
  `public-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@ex.com`;

const emailsCreated: string[] = [];
const remember = (e: string) => (emailsCreated.push(e), e);

describe('POST /api/complaints/public', () => {
  afterAll(async () => {
    if (emailsCreated.length) {
      const users = await prisma.user.findMany({
        where: { email: { in: emailsCreated } },
        select: { id: true },
      });
      const ids = users.map((u) => u.id);
      if (ids.length) {
        await prisma.ticket.deleteMany({ where: { requesterId: { in: ids } } });
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
      }
    }
    await prisma.$disconnect();
  });

  it('creates a ticket and returns the ticket id', async () => {
    const email = remember(mk('happy'));
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.1')
      .send({
        name: 'Happy Path',
        email,
        contact: '+1-555-0100',
        body: 'My order never arrived and I would like a refund, please.',
      });

    expect(res.status).toBe(201);
    expect(typeof res.body.ticketId).toBe('string');
    expect(typeof res.body.requesterId).toBe('string');
    expect(res.body.source).toBe('public-form');
  });

  it('auto-derives the subject from the first line of the body', async () => {
    const email = remember(mk('subject'));
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.2')
      .send({
        name: 'Subject Test',
        email,
        contact: '+1-555-0101',
        body: 'Wrong item received\n\nYou sent me a blue mug instead of the red one.',
      });
    expect(res.status).toBe(201);

    const ticket = await prisma.ticket.findUnique({ where: { id: res.body.ticketId } });
    expect(ticket?.subject).toBe('Wrong item received');
  });

  it('appends the contact info to the ticket description', async () => {
    const email = remember(mk('contact'));
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.3')
      .send({
        name: 'Contact Test',
        email,
        contact: '+1-555-9876',
        body: 'Checkout button is broken on mobile Safari.',
      });
    expect(res.status).toBe(201);

    const ticket = await prisma.ticket.findUnique({ where: { id: res.body.ticketId } });
    expect(ticket?.description).toContain('Contact: +1-555-9876');
  });

  it('rejects honeypot submissions (website field non-empty)', async () => {
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.4')
      .send({
        name: 'Bot',
        email: mk('bot'),
        contact: '+1-555-0199',
        body: 'Spammy bot body goes here to pass min length.',
        website: 'http://spam.example',
      });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.5')
      .send({
        name: 'Bad Email',
        email: 'not-an-email',
        contact: '+1-555-0100',
        body: 'Body text that is long enough.',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.6')
      .send({ email: 'someone@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('rejects body shorter than 10 characters', async () => {
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', '10.77.0.7')
      .send({
        name: 'Short',
        email: mk('short'),
        contact: '+1-555-0100',
        body: 'short',
      });
    expect(res.status).toBe(400);
  });

  it('enforces the 5/min rate limit per IP', async () => {
    const ip = '10.88.88.88';
    const body = {
      name: 'Rate Test',
      contact: '+1-555-0100',
      body: 'Rate limit test body — long enough to pass validation.',
    };

    for (let i = 0; i < 5; i++) {
      const email = remember(mk(`rl-${i}`));
      const res = await request(app)
        .post('/api/complaints/public')
        .set('X-Forwarded-For', ip)
        .send({ ...body, email });
      expect(res.status).toBe(201);
    }

    const email = remember(mk('rl-over'));
    const res = await request(app)
      .post('/api/complaints/public')
      .set('X-Forwarded-For', ip)
      .send({ ...body, email });
    expect(res.status).toBe(429);
  });
});
