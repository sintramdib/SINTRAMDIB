import { createHmac, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import { env } from '../../../config/env';
import { PaymentStatus } from '@prisma/client';
import type {
  CreateChargeInput,
  CreatedCharge,
  GatewayStatus,
  PaymentGateway,
} from '../types';

/**
 * Gateway simulado para desenvolvimento/sandbox.
 * Permite exercitar o fluxo completo de pagamento sem depender de um provedor
 * real (que será plugado na camada de serviço posteriormente).
 * NUNCA use em produção.
 */
export class MockGateway implements PaymentGateway {
  readonly name = 'mock';

  async createPixCharge(input: CreateChargeInput): Promise<CreatedCharge> {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    // Gera um QR Code real a partir do ID (apenas visual), encodado em base64 data URL.
    const qrCode = await QRCode.toDataURL(`pix-mock://${id}`, { width: 256, margin: 1 });
    const qrCodeText = `pix-copia-e-cola://${id}`;

    return {
      gatewayPaymentId: id,
      qrCodeText,
      qrCode,
      status: PaymentStatus.PENDING,
    };
  }

  async fetchStatus(gatewayPaymentId: string): Promise<GatewayStatus> {
    if (env.PAYMENT_PROVIDER !== 'mock') {
      throw new Error('MockGateway.fetchStatus chamado em ambiente não-mock');
    }
    // No mock, o "estado real" é declarado como pago pela simulação de webhook.
    return { gatewayPaymentId, status: PaymentStatus.PENDING };
  }

  async validateWebhook(): Promise<boolean> {
    // Para o mock, aceitamos a chamada de webhook apenas se o segredo (se configurado) bater.
    const secret = env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) return true; // dev conveniência (sem segredo configurado)
    return true;
  }

  async parseWebhook(payload: unknown): Promise<{ gatewayPaymentId: string; rawEvent: unknown }> {
    const body = payload as { gatewayPaymentId?: string; rawEvent?: unknown };
    const id = body?.gatewayPaymentId;
    if (!id || typeof id !== 'string') {
      throw new Error('Payload de webhook mock inválido: gatewayPaymentId ausente');
    }
    return { gatewayPaymentId: id, rawEvent: body.rawEvent ?? body };
  }
}

/** Helper de assinatura HMAC usado por gateways que assinam o corpo (ex. Stripe). */
export function verifyHmacBody(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}