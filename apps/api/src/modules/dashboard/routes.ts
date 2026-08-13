import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { badRequest, notFound } from '../../lib/errors';
import { generatePublicToken } from '../../lib/http';
import { requireAdmin } from '../auth/routes';

const createSubSchema = z.object({
  customerName: z.string().trim().min(2, 'Informe o nome do cliente'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  planId: z.string().min(1, 'Selecione um plano'),
});

const tokenParam = z.object({ id: z.string().min(1) });

function buildPublicUrl(token: string) {
  return `${env.PUBLIC_BASE_URL}/assinar/${token}`;
}

export async function dashboardRoutes(app: FastifyInstance) {
  // ---- Planos ----
  app.get('/api/plans', async () => {
    return { plans: await prisma.plan.findMany({ where: { active: true }, orderBy: { amount: 'asc' } }) };
  });

  // ---- Estatísticas do dashboard ----
  app.get('/api/dashboard/stats', async () => {
    const [total, active, pending, expired, cancelled, paid] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.count({ where: { status: 'PAID' } }),
    ]);

    return {
      totals: { total, active, pending, expired, cancelled, paidPayments: paid },
      distribution: [
        { label: 'Ativas', value: active },
        { label: 'Pendentes', value: pending },
        { label: 'Expiradas', value: expired },
        { label: 'Canceladas', value: cancelled },
        { label: 'Sem pagamento', value: 0 },
      ].filter((d) => d.label !== 'Sem pagamento'),
    };
  });

  // ---- Visão geral: conteúdo + atividade recente (dados reais) ----
  app.get('/api/dashboard/overview', async () => {
    const now = new Date();
    const [newsTotal, newsPublished, newsDraft, bannerTotal, bannerActive, recentNews, recentBanners] =
      await Promise.all([
        prisma.news.count(),
        prisma.news.count({ where: { status: 'PUBLISHED' } }),
        prisma.news.count({ where: { status: 'DRAFT' } }),
        prisma.banner.count(),
        prisma.banner.count({ where: { status: 'ACTIVE' } }),
        prisma.news.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 }),
        prisma.banner.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 }),
      ]);

    // Atividade recente consolidada (sem dados fictícios).
    const activity = [
      ...recentNews.map((n) => ({
        type: 'Notícia',
        label: n.title,
        detail: n.status,
        at: n.updatedAt,
      })),
      ...recentBanners.map((b) => ({
        type: 'Banner',
        label: b.title,
        detail: b.status,
        at: b.updatedAt,
      })),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 10);

    return {
      content: {
        newsTotal,
        newsPublished,
        newsDraft,
        bannerTotal,
        bannerActive,
        scheduled: await prisma.news.count({ where: { status: 'SCHEDULED', scheduleAt: { gt: now } } }),
      },
      activity,
    };
  });

  // ---- Assinaturas / Links ----
  app.get('/api/subscriptions', async () => {
    const rows = await prisma.subscription.findMany({
      include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      subscriptions: rows.map((s) => ({
        id: s.id,
        publicToken: s.publicToken,
        publicUrl: buildPublicUrl(s.publicToken),
        customerName: s.customerName,
        customerEmail: s.customerEmail,
        plan: { id: s.plan.id, name: s.plan.name },
        amount: Number(s.amount.toNumber()),
        status: s.status,
        createdAt: s.createdAt,
        paidAt: s.paidAt,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
        payment: s.payments[0]
          ? {
              id: s.payments[0].id,
              gatewayPaymentId: s.payments[0].gatewayPaymentId,
              status: s.payments[0].status,
              paidAt: s.payments[0].paidAt,
            }
          : null,
      })),
    };
  });

  app.post('/api/subscriptions', async (req) => {
    const body = createSubSchema.parse(req.body);
    const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan || !plan.active) throw badRequest('Plano inválido ou inativo');

    // Garante unicidade do token em caso de colisão improvável.
    let token = generatePublicToken();
    while (await prisma.subscription.findUnique({ where: { publicToken: token } })) {
      token = generatePublicToken();
    }

    const sub = await prisma.subscription.create({
      data: {
        publicToken: token,
        customerName: body.customerName,
        customerEmail: body.customerEmail?.toLowerCase() || null,
        planId: plan.id,
        amount: plan.amount,
        status: SubscriptionStatus.PENDING,
      },
    });

    return { subscription: { id: sub.id, publicUrl: buildPublicUrl(token) } };
  });

  app.post('/api/subscriptions/:id/cancel', async (req) => {
    const { id } = tokenParam.parse(req.params as { id: string });
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw notFound('Assinatura não encontrada');

    await prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED },
    });
    return { ok: true };
  });

  // ---- Pagamentos ----
  app.get('/api/payments', async () => {
    const rows = await prisma.payment.findMany({
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return {
      payments: rows.map((p) => ({
        id: p.id,
        gateway: p.gateway,
        gatewayPaymentId: p.gatewayPaymentId,
        customerName: p.subscription.customerName,
        plan: p.subscription.plan.name,
        amount: Number(p.amount.toNumber()),
        status: p.status,
        qrCode: p.qrCode,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      })),
    };
  });

  return app;
}