import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { unauthorized } from '../../lib/errors';
import { createSessionToken, verifySessionToken, SESSION_COOKIE } from './session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Hook que protege rotas administrativas (exige sessão válida). */
export function requireAdmin(req: { cookies: Record<string, string | undefined> }) {
  const token = req.cookies[SESSION_COOKIE];
  const session = token ? verifySessionToken(token) : null;
  if (!session) throw unauthorized('Sessão inválida ou expirada');
  return session;
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email: body.email.toLowerCase() } });

    // Mensagem genérica para não revelar se o email existe
    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      throw unauthorized('Credenciais inválidas');
    }

    const token = createSessionToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    reply.setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { admin: { id: admin.id, email: admin.email, name: admin.name } };
  });

  app.post('/api/auth/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  app.get('/api/auth/me', async (req) => {
    const session = requireAdmin(req);
    // Re-busca para dados frescos
    const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
    if (!admin) throw unauthorized('Administrador não encontrado');
    return { admin: { id: admin.id, email: admin.email, name: admin.name } };
  });
}