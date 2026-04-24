import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export const hashPassword = (pw: string) => bcrypt.hash(pw, ROUNDS);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);
