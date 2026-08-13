export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export const SUBSCRIPTION_STATUS: Record<string, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativa',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
};

export const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export function statusTone(status: string): string {
  const active = ['ACTIVE', 'PAID'];
  const warn = ['PENDING'];
  const danger = ['FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'];
  if (active.includes(status)) return 'badge--active';
  if (warn.includes(status)) return 'badge--warn';
  if (danger.includes(status)) return 'badge--danger';
  return 'badge--neutral';
}