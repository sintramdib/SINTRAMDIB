import type { PaymentStatus } from '@prisma/client';

export interface CreateChargeInput {
  subscriptionId: string;
  publicToken: string;
  customerName?: string | null;
  customerEmail?: string | null;
  /** Valor em centavos. */
  amountCents: number;
  description: string;
}

export interface CreatedCharge {
  gatewayPaymentId: string;
  /** Código PIX "copia e cola". */
  qrCodeText: string;
  /** Data URL ou string do QR Code exibível. */
  qrCode: string;
  status: PaymentStatus;
}

export interface GatewayStatus {
  gatewayPaymentId: string;
  status: PaymentStatus;
  paidAt?: Date | null;
}

/** Contrato de um provedor de pagamento. */
export interface PaymentGateway {
  readonly name: string;
  createPixCharge(input: CreateChargeInput): Promise<CreatedCharge>;
  /**
   * Consulta o gateway pelo estado real do pagamento.
   * Usado pelo webhook para confirmação adicional, quando aplicável.
   */
  fetchStatus(gatewayPaymentId: string): Promise<GatewayStatus>;
  /** Implementação específica de parse/validação da notificação de webhook. */
  parseWebhook(payload: unknown, headers: Record<string, string>): Promise<{
    gatewayPaymentId: string;
    rawEvent: unknown;
  }>;
  /** Deve retornar true se a requisição é autêntica conforme o gateway. */
  validateWebhook(payload: unknown, headers: Record<string, string>): Promise<boolean>;
}