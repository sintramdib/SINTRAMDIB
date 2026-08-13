import { Prisma, PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { notFound, badRequest } from '../../lib/errors';
import type { PaymentGateway } from './types';
import { MockGateway } from './gateways/mock';

// --- Fábrica de gateways: troque/inclua provedores reais aqui -----------------
const gatewayRegistry: Record<string, () => PaymentGateway> = {
  mock: () => new MockGateway(),
};

export function getGateway(name?: string): PaymentGateway {
  const key = name ?? env.PAYMENT_PROVIDER;
  const factory = gatewayRegistry[key];
  if (!factory) {
    throw badRequest(`Provedor de pagamento não suportado: ${key}`);
  }
  return factory();
}

interface ChargeWithSubscription {
  id: string;
  publicToken: string;
  customerName: string | null;
  customerEmail: string | null;
  amount: Prisma.Decimal;
  plan: { name: string; description: string | null; durationDays: number };
}

/**
 * Cria a cobrança PIX a partir de uma assinatura: registra o Payment no banco
 * e solicita o QR Code ao gateway. NÃO altera o status da assinatura.
 */
export async function createPixCharge(subscription: ChargeWithSubscription) {
  if (subscription.plan.durationDays <= 0) {
    throw badRequest('Plano sem duração definida');
  }

  const gateway = getGateway();
  const amountCents = Math.round(subscription.amount.toNumber() * 100);

  const charge = await gateway.createPixCharge({
    subscriptionId: subscription.id,
    publicToken: subscription.publicToken,
    customerName: subscription.customerName,
    customerEmail: subscription.customerEmail,
    amountCents,
    description: `Assinatura ${subscription.plan.name}`,
  });

  const payment = await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      gateway: gateway.name,
      gatewayPaymentId: charge.gatewayPaymentId,
      amount: subscription.amount,
      status: charge.status,
      qrCode: charge.qrCode,
      qrCodeText: charge.qrCodeText,
    },
  });

  return { payment, charge };
}

interface ConfirmOptions {
  gatewayName: string;
  gatewayPaymentId: string;
  /** Estado declarado pela notificação do gateway/webhook. */
  declaredStatus: PaymentStatus;
}

/**
 * Pipeline único e IDEMPOTENTE de confirmação.
 * Único lugar onde uma assinatura pode se tornar ACTIVE.
 */
export async function confirmPaymentAndActivate({
  gatewayName,
  gatewayPaymentId,
  declaredStatus,
}: ConfirmOptions) {
  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId },
    include: { subscription: { include: { plan: true } } },
  });

  if (!payment) {
    throw notFound('Pagamento não encontrado no banco');
  }
  if (payment.gateway !== gatewayName) {
    throw badRequest('Gateway informado não corresponde ao pagamento');
  }

  // Idempotência: se já processado com sucesso, não reprocessa.
  if (payment.status === PaymentStatus.PAID) {
    return { payment, subscription: payment.subscription, alreadyProcessed: true };
  }

  // Confirmação adicional junto ao gateway quando aplicável (gateways reais).
  let effectiveStatus = declaredStatus;
  if (env.PAYMENT_PROVIDER !== 'mock' && declaredStatus === PaymentStatus.PAID) {
    const gateway = getGateway(payment.gateway);
    if (payment.gatewayPaymentId) {
      const real = await gateway.fetchStatus(payment.gatewayPaymentId);
      if (real.status === PaymentStatus.PAID) {
        effectiveStatus = PaymentStatus.PAID;
        declaredStatus = real.status;
      } else {
        effectiveStatus = real.status;
      }
    }
  }

  if (effectiveStatus === PaymentStatus.PAID) {
    // Ativação atômica: só aplica se ainda não estiver ACTIVE (idempotente).
    const startedAt = new Date();
    const expiresAt = addDays(startedAt, payment.subscription.plan.durationDays);

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { id: payment.id, status: { not: PaymentStatus.PAID } },
        data: { status: PaymentStatus.PAID, paidAt: startedAt },
      }),
      prisma.subscription.updateMany({
        where: { id: payment.subscriptionId, status: { not: 'ACTIVE' } },
        data: {
          status: 'ACTIVE',
          paidAt: startedAt,
          startedAt,
          expiresAt,
        },
      }),
    ]);
  } else if (effectiveStatus === PaymentStatus.FAILED) {
    await prisma.payment.updateMany({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  return { payment, subscription: payment.subscription, alreadyProcessed: false };
}

/** Adiciona N dias corridos a uma data. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}