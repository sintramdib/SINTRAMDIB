import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { env } from './config/env';
import { ApiError } from './lib/errors';
import { authRoutes } from './modules/auth/routes';
import { publicRoutes } from './modules/public/routes';
import { webhookRoutes } from './modules/webhook/routes';
import { dashboardRoutes } from './modules/dashboard/routes';
import { associateRoutes } from './modules/associates/routes';
import { cmsRoutes } from './modules/cms/routes';
import { sitePublicRoutes } from './modules/site/routes';
import { ensureDefaultSettings } from './modules/site/settings';
import { Storage } from './modules/storage';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Garante configurações padrão do site (não apaga o que já existe).
  await ensureDefaultSettings();
  // Garante os diretórios de upload antes de servir arquivos estáticos.
  await Storage.init();

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(cookie);

  // Serve arquivos de foto/assinatura gravados em disco (ex.: /files/photo/xxx.png).
  await app.register(fastifyStatic, {
    root: Storage.root(),
    prefix: '/files/',
  });

  // Handler central de erros.
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod.
      return reply.code(400).send({ error: 'Dados inválidos', issues: (error as any).issues });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'Erro interno' });
  });

  // Rotas públicas.
  await app.register(publicRoutes);
  // Cadastro público de associados (Seja Sócio).
  await app.register(associateRoutes);
  // Conteúdo público do site (settings, notícias, banners).
  await app.register(sitePublicRoutes);
  // Webhook do gateway (público — o gateway precisa acessar).
  await app.register(webhookRoutes);

  // Autenticação.
  await app.register(authRoutes);

  // Rotas administrativas — protegidas por sessão.
  await app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', async (req) => {
      const { requireAdmin } = await import('./modules/auth/routes');
      requireAdmin(req);
    });
    await protectedApp.register(dashboardRoutes);
    await protectedApp.register(cmsRoutes);
  });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}