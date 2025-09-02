import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;
export function signJwt(payload, opts={ expiresIn: '7d' }){ return jwt.sign(payload, SECRET, opts); }
export function verifyJwt(token){ return jwt.verify(token, SECRET); }