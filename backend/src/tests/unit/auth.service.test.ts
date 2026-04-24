import { verifyAccessToken, signAccessToken } from '../../common/utils/jwt';
import { Role } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/password';

describe('jwt util', () => {
  it('round-trips an access token', () => {
    const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: Role.AGENT });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('u1');
    expect(payload.email).toBe('a@b.com');
    expect(payload.role).toBe(Role.AGENT);
  });
});

describe('password util', () => {
  it('verifies correct password', async () => {
    const hash = await hashPassword('s3cret!!');
    expect(await verifyPassword('s3cret!!', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
