import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NewsStatus, BannerStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { getAllSettings } from './settings';

/** Endpoints públicos que alimentam o site (sem autenticação). */
export async function sitePublicRoutes(app: FastifyInstance) {
  app.get('/api/public/settings', async () => {
    return { settings: await getAllSettings() };
  });

  app.get('/api/public/news', async (req) => {
    const q = (req.query as Record<string, string>) ?? {};
    const limit = z.coerce.number().int().min(1).max(50).default(6).parse(q.limit ?? '6');
    // Somente publicadas e com data de publicação <= agora.
    const news = await prisma.news.findMany({
      where: {
        status: NewsStatus.PUBLISHED,
        OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
      },
      orderBy: [{ headline: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    });
    return { news };
  });

  app.get('/api/public/banners', async () => {
    const banners = await prisma.banner.findMany({
      where: { status: BannerStatus.ACTIVE },
      orderBy: [{ main: 'desc' }, { order: 'asc' }],
    });
    return { banners };
  });

  return app;
}