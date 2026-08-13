import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Prisma, NewsStatus, BannerStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { notFound, badRequest } from '../../lib/errors';
import { storage } from '../storage';
import { getAllSettings, updateSettings } from '../site/settings';

// ---------- Imagens ----------
function resolveImagePath(imageBase64?: string | null, imagePath?: string | null): string | null {
  if (imageBase64) {
    const { ext, buffer } = storage.decodeDataUrl(imageBase64, ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
    if (buffer.length > 5 * 1024 * 1024) throw badRequest('Imagem muito grande (máx. 5 MB)');
    // Será salvo pelo chamador específico (news/banner) com o kind adequado.
    return `__DECODED__${ext}__${buffer.toString('base64')}`;
  }
  if (imagePath) return imagePath;
  return null;
}

async function persistImage(marker: string, kind: 'news' | 'banner'): Promise<string> {
  if (marker.startsWith('/files/')) return marker; // já existente
  const [ext, b64] = marker.replace('__DECODED__', '').split('__');
  return storage.write(kind, ext, Buffer.from(b64, 'base64'));
}

// ---------- Validação ----------
const newsSchema = z.object({
  title: z.string().trim().min(2, 'Título é obrigatório').max(200),
  subtitle: z.string().trim().max(300).optional().nullable().transform((v) => v || null),
  content: z.string().optional().nullable().transform((v) => v || null),
  category: z.string().trim().max(80).optional().nullable().transform((v) => v || null),
  author: z.string().trim().max(80).optional().nullable().transform((v) => v || null),
  headline: z.boolean().optional(),
  status: z.nativeEnum(NewsStatus).optional().default(NewsStatus.DRAFT),
  imageBase64: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  scheduleAt: z.string().optional().nullable(),
});

const bannerSchema = z.object({
  title: z.string().trim().min(2, 'Título é obrigatório').max(200),
  description: z.string().trim().max(500).optional().nullable().transform((v) => v || null),
  buttonText: z.string().trim().max(60).optional().nullable().transform((v) => v || null),
  buttonLink: z.string().trim().max(400).optional().nullable().transform((v) => v || null),
  position: z.string().trim().max(60).optional().default('principal'),
  imageBase64: z.string().optional().nullable(),
  main: z.boolean().optional(),
  status: z.nativeEnum(BannerStatus).optional().default(BannerStatus.ACTIVE),
});

const idParam = z.object({ id: z.string().min(1) });

export async function cmsRoutes(app: FastifyInstance) {
  // ============ CONFIGURAÇÕES (protegidas) ============
  app.get('/api/settings', async () => ({ settings: await getAllSettings() }));
  app.put('/api/settings', async (req) => {
    const body = req.body as Record<string, unknown>;
    const settings = await updateSettings(body ?? {});
    return { settings };
  });

  // ============ NOTÍCIAS (protegidas) ============
  app.get('/api/news', async (req) => {
    const q = (req.query as Record<string, string>) ?? {};
    const where: Prisma.NewsWhereInput = {};
    if (q.status) where.status = q.status as NewsStatus;
    if (q.category) where.category = q.category;
    if (q.q) {
      const like = { contains: q.q, mode: Prisma.QueryMode.insensitive };
      where.OR = [{ title: like }, { subtitle: like }, { author: like }];
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({ where, orderBy: [{ updatedAt: 'desc' }] }),
      prisma.news.count({ where }),
    ]);
    return { news: items, total };
  });

  app.get('/api/news/:id', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    const item = await prisma.news.findUnique({ where: { id } });
    if (!item) throw notFound('Notícia não encontrada');
    return { news: item };
  });

  app.post('/api/news', async (req) => {
    const body = newsSchema.parse(req.body ?? {});
    const imagePath = body.imageBase64 ? await persistImage(resolveImagePath(body.imageBase64)!, 'news') : null;
    const news = await prisma.news.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        category: body.category,
        author: body.author,
        headline: body.headline ?? false,
        status: body.status,
        imagePath,
        publishedAt: body.status === NewsStatus.PUBLISHED ? new Date() : body.publishedAt ? new Date(body.publishedAt) : null,
        scheduleAt: body.scheduleAt ? new Date(body.scheduleAt) : null,
      },
    });
    return { news };
  });

  app.put('/api/news/:id', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    const body = newsSchema.partial().parse(req.body ?? {});
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw notFound('Notícia não encontrada');

    const data: Prisma.NewsUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.subtitle !== undefined) data.subtitle = body.subtitle;
    if (body.content !== undefined) data.content = body.content;
    if (body.category !== undefined) data.category = body.category;
    if (body.author !== undefined) data.author = body.author;
    if (body.headline !== undefined) data.headline = body.headline;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === NewsStatus.PUBLISHED && !existing.publishedAt) data.publishedAt = new Date();
    }
    if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    if (body.scheduleAt !== undefined) data.scheduleAt = body.scheduleAt ? new Date(body.scheduleAt) : null;
    if (body.imageBase64 !== undefined) {
      const marker = resolveImagePath(body.imageBase64, existing.imagePath);
      if (marker && marker.startsWith('__DECODED__')) data.imagePath = await persistImage(marker, 'news');
    }

    const news = await prisma.news.update({ where: { id }, data });
    return { news };
  });

  app.delete('/api/news/:id', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    await prisma.news.delete({ where: { id } });
    return { ok: true };
  });

  app.post('/api/news/:id/duplicate', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    const src = await prisma.news.findUnique({ where: { id } });
    if (!src) throw notFound('Notícia não encontrada');
    const copy = await prisma.news.create({
      data: {
        title: `${src.title} (cópia)`,
        subtitle: src.subtitle,
        content: src.content,
        category: src.category,
        author: src.author,
        headline: false,
        status: NewsStatus.DRAFT,
        imagePath: src.imagePath,
      },
    });
    return { news: copy };
  });

  // ============ BANNERS (protegidas) ============
  app.get('/api/banners', async () => {
    const banners = await prisma.banner.findMany({ orderBy: [{ main: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }] });
    return { banners };
  });

  app.post('/api/banners', async (req) => {
    const body = bannerSchema.parse(req.body ?? {});
    const imagePath = body.imageBase64 ? await persistImage(resolveImagePath(body.imageBase64)!, 'banner') : null;
    const order = await prisma.banner.count();
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        description: body.description,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink,
        position: body.position,
        imagePath,
        order,
        main: body.main ?? false,
        status: body.status,
      },
    });
    return { banner };
  });

  app.put('/api/banners/:id', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    const body = bannerSchema.partial().parse(req.body ?? {});
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw notFound('Banner não encontrado');

    const data: Prisma.BannerUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.buttonText !== undefined) data.buttonText = body.buttonText;
    if (body.buttonLink !== undefined) data.buttonLink = body.buttonLink;
    if (body.position !== undefined) data.position = body.position;
    if (body.main !== undefined) data.main = body.main;
    if (body.status !== undefined) data.status = body.status;
    if (body.imageBase64 !== undefined) {
      const marker = resolveImagePath(body.imageBase64, existing.imagePath);
      if (marker && marker.startsWith('__DECODED__')) data.imagePath = await persistImage(marker, 'banner');
    }

    const banner = await prisma.banner.update({ where: { id }, data });
    return { banner };
  });

  app.delete('/api/banners/:id', async (req) => {
    const { id } = idParam.parse(req.params as { id: string });
    await prisma.banner.delete({ where: { id } });
    return { ok: true };
  });

  app.post('/api/banners/reorder', async (req) => {
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(req.body ?? {});
    await Promise.all(
      ids.map((id, index) =>
        prisma.banner.update({ where: { id }, data: { order: index } }).catch(() => null),
      ),
    );
    return { ok: true };
  });

  return app;
}