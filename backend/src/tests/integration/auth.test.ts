import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../db/client';

const app = createApp();

describe('POST /api/auth/register + login', () => {
  const email = `test-${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('registers, logs in, refreshes, and returns /me', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123', name: 'Test User' });
    expect(reg.status).toBe(201);
    expect(reg.body.accessToken).toBeDefined();
    expect(reg.body.refreshToken).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeDefined();
  });

  it('rejects bad credentials', async () => {
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong' });
    expect(bad.status).toBe(401);
  });
});
