import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: Role.ADMIN,
      passwordHash: await hash('admin123'),
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      name: 'Agent Smith',
      role: Role.AGENT,
      passwordHash: await hash('agent123'),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Customer',
      role: Role.CUSTOMER,
      passwordHash: await hash('customer123'),
    },
  });

  await prisma.ticket.create({
    data: {
      subject: 'Cannot log in',
      description: 'I forgot my password and reset link never arrives.',
      requesterId: customer.id,
      assigneeId: agent.id,
    },
  });

  await prisma.setting.upsert({
    where: { key: 'ai.enabled' },
    update: {},
    create: { key: 'ai.enabled', value: true },
  });

  console.log('Seeded:', { admin: admin.email, agent: agent.email, customer: customer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
