import bcrypt from 'bcryptjs';
export async function hashPassword(pw){ return bcrypt.hash(pw, 10); }
export async function verifyPassword(pw, hash){ return bcrypt.compare(pw, hash); }