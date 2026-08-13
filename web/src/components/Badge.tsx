import { statusTone, SUBSCRIPTION_STATUS, PAYMENT_STATUS } from '../lib/format';

export function Badge({
  status,
  kind,
}: {
  status: string;
  kind: 'subscription' | 'payment';
}) {
  const labels = kind === 'subscription' ? SUBSCRIPTION_STATUS : PAYMENT_STATUS;
  return <span className={`badge ${statusTone(status)}`}>{labels[status] ?? status}</span>;
}