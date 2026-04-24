process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-0000000000';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-000000000';
process.env.EMAIL_WEBHOOK_SECRET ||= 'test-email-secret';
process.env.FORM_WEBHOOK_SECRET ||= 'test-form-secret';
process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/helpdesk_test?schema=public';
process.env.REDIS_URL ||= 'redis://localhost:6379';

jest.setTimeout(20_000);
