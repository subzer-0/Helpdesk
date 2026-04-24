import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../../app';
import { prisma } from '../../db/client';
import { hashPassword } from '../../common/utils/password';

const app = createApp();

const mkUser = async (role: Role) => {
  const email = `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@ex.com`;
  const user = await prisma.user.create({
    data: {
      email,
      name: role,
      role,
      passwordHash: await hashPassword('password123'),
    },
  });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  return { user, token: login.body.accessToken as string };
};

describe('Tickets RBAC', () => {
  let customerA: Awaited<ReturnType<typeof mkUser>>;
  let customerB: Awaited<ReturnType<typeof mkUser>>;
  let agent: Awaited<ReturnType<typeof mkUser>>;
  let ticketId: string;

  beforeAll(async () => {
    customerA = await mkUser(Role.CUSTOMER);
    customerB = await mkUser(Role.CUSTOMER);
    agent = await mkUser(Role.AGENT);
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { requesterId: { in: [customerA.user.id, customerB.user.id] } } });
    await prisma.user.deleteMany({
      where: { id: { in: [customerA.user.id, customerB.user.id, agent.user.id] } },
    });
    await prisma.$disconnect();
  });

  it('customer A creates a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerA.token}`)
      .send({ subject: 'Help', description: 'I need assistance' });
    expect(res.status).toBe(201);
    ticketId = res.body.id;
  });

  it('customer B cannot view customer A ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${customerB.token}`);
    expect(res.status).toBe(403);
  });

  it('agent can view any ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${agent.token}`);
    expect(res.status).toBe(200);
  });

  it('customer cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${customerA.token}`);
    expect(res.status).toBe(403);
  });

  it('customer B cannot post internal note on ticket they do not own', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/messages`)
      .set('Authorization', `Bearer ${customerB.token}`)
      .send({ body: 'hi', isInternal: true });
    expect(res.status).toBe(403);
  });
});
