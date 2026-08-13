import type { FastifyInstance } from 'fastify';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { badRequest, unauthorized } from '../../lib/errors';
import { getGateway, confirmPaymentAndActivate } from '../payment';

/**
 * POST /api/webhooks/payment
 * Recebe notificações do gateway: valida, registra, confirma e ativa (idempotente).
 */
export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/payment', async (req, reply) => {
    const payload = req.body;
    const headers = req.headers as Record<string, string>;

    const gateway = getGateway();

    // 1+2. Valida autenticidade conforme o gateway.
    const valid = await gateway.validateWebhook(payload, headers);
    if (!valid) throw unauthorized('Webhook não autenticado');

    // 3. Identifica o pagamento.
    let parsed: { gatewayPaymentId: string; rawEvent: unknown };
    try {
      parsed = await gateway.parseWebhook(payload, headers);
    } catch (e) {
      throw badRequest((e as Error).message);
    }

    // 4. Registra o evento (idempotente por provider+eventId).
    const eventId = `${gateway.name}:${parsed.gatewayPaymentId}`;
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: gateway.name,
          eventId,
          paymentId: parsed.gatewayPaymentId,
          eventType: 'payment.confirmed',
          payload: parsed.rawEvent as object,
        },
      });
    } catch (e: any) {
      // Unique conflict => evento já registrado. Segue para reprocessar de forma idempotente.
    }

    // 5-10. Confirma no gateway quando aplicável, atualiza e ativa (idempotente).
    // Para o mock, a notificação declara "pago". Gateways reais podem declarar outros estados.
    const result = await confirmPaymentAndActivate({
      gatewayName: gateway.name,
      gatewayPaymentId: parsed.gatewayPaymentId,
      declaredStatus: PaymentStatus.PAID,
    });

    return reply.code(200).send({ ok: true, alreadyProcessed: result.alreadyProcessed });
  });

  // ---- Utilitário de desenvolvimento (somente provider mock) -----------------
  // Simula a chegada do webhook do gateway, permitindo testar a ativação no fluxo completo.
  app.post('/api/dev/payments/:id/simulate-confirm', async (req) => {
    if (env.PAYMENT_PROVIDER !== 'mock') {
      throw unauthorized('Endpoint de simulação disponível apenas com PAYMENT_PROVIDER=mock');
    }
    const { id } = req.params as { id: string };
    const result = await confirmPaymentAndActivate({
      gatewayName: 'mock',
      gatewayPaymentId: id,
      declaredStatus: PaymentStatus.PAID,
    });
    return { ok: true, alreadyProcessed: result.alreadyProcessed };
  });

  return app;
}