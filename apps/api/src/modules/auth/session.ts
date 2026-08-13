import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';

export interface Session {
  adminId: string;
  email: string;
  name: string | null;
  issuedAt: number;
  expiresAt: number;
}

const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function sign(data: string): string {
  return createHmac('sha256', env.SESSION_SECRET).update(data).digest('base64url');
}

export function createSessionToken(payload: Omit<Session, 'issuedAt' | 'expiresAt'>): string {
  const now = Date.now();
  const session: Session = {
    ...payload,
    issuedAt: now,
    expiresAt: now + TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): Session | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signature);
  if (expectedBuf.length !== givenBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, givenBuf)) return null;

  try {
    const session: Session = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'dash_session';