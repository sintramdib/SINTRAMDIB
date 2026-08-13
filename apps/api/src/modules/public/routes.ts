import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { notFound, badRequest } from '../../lib/errors';
import { site } from '../../config/site';
import { createPixCharge } from '../payment';

function serializeMoney(decimal: { toNumber(): number }) {
  return Number(decimal.toNumber());
}

export async function publicRoutes(app: FastifyInstance) {
  // Dados públicos para exibir a página de assinatura. NÃO expõe dados internos.
  app.get('/assinar/:token', async (req) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.params as { token: string });

    const sub = await prisma.subscription.findUnique({
      where: { publicToken: token },
      include: { plan: true },
    });

    if (!sub) throw notFound('Assinatura não encontrada');

    return {
      site,
      subscription: {
        status: sub.status,
        customerName: sub.customerName,
      },
      plan: {
        name: sub.plan.name,
        description: sub.plan.description,
        amount: serializeMoney(sub.amount),
        durationDays: sub.plan.durationDays,
      },
    };
  });

  // Cliente clica em "ASSINAR": cria o pedido de pagamento (NÃO ativa a assinatura).
  app.post('/assinar/:token/payment', async (req) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.params as { token: string });

    const sub = await prisma.subscription.findUnique({
      where: { publicToken: token },
      include: { plan: true },
    });
    if (!sub) throw notFound('Assinatura não encontrada');

    if (sub.status === 'ACTIVE') {
      throw badRequest('Assinatura já está ativa');
    }
    if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') {
      throw badRequest(`Assinatura ${sub.status.toLowerCase()}. Crie um novo link.`);
    }

    // Se já houver um pagamento PENDENTE, reaproveita (evita cobranças duplicadas no clique repetido).
    const existing = await prisma.payment.findFirst({
      where: {
        subscriptionId: sub.id,
        status: { in: ['PENDING'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (existing && existing.qrCode) {
      return {
        payment: {
          id: existing.id,
          gatewayPaymentId: existing.gatewayPaymentId,
          qrCode: existing.qrCode,
          qrCodeText: existing.qrCodeText,
          status: existing.status,
        },
      };
    }

    const { payment } = await createPixCharge(sub);
    return {
      payment: {
        id: payment.id,
        gatewayPaymentId: payment.gatewayPaymentId,
        qrCode: payment.qrCode,
        qrCodeText: payment.qrCodeText,
        status: payment.status,
      },
    };
  });

  // Polling do cliente: estado da assinatura + pagamento mais recente.
  app.get('/assinar/:token/status', async (req) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.params as { token: string });

    const sub = await prisma.subscription.findUnique({
      where: { publicToken: token },
      include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!sub) throw notFound('Assinatura não encontrada');

    return {
      subscription: {
        status: sub.status,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
      },
      payment: sub.payments[0]
        ? {
            status: sub.payments[0].status,
            gatewayPaymentId: sub.payments[0].gatewayPaymentId,
          }
        : null,
      plan: {
        name: sub.plan.name,
        amount: serializeMoney(sub.amount),
      },
    };
  });

  return app;
}