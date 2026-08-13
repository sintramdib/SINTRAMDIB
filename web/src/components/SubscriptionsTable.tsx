import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Badge } from './Badge';
import { CopyButton } from './CopyButton';
import { Modal } from './Modal';
import { formatCurrency, formatDate } from '../lib/format';

interface Row {
  id: string;
  publicUrl: string;
  publicToken: string;
  customerName: string | null;
  customerEmail: string | null;
  plan: { name: string };
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  payment: {
    id: string;
    gatewayPaymentId: string | null;
    status: string;
    paidAt: string | null;
  } | null;
}

interface Props {
  limit?: number;
  onCancel?: () => void;
}

export function SubscriptionsTable({ limit, onCancel }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Row | null>(null);

  const load = () => {
    api.get('/api/subscriptions').then((res) => {
      setRows(limit ? res.data.subscriptions.slice(0, limit) : res.data.subscriptions);
      setLoading(false);
    });
  };

  useEffect(load, [limit]);

  const cancel = async (row: Row) => {
    if (!window.confirm(`Cancelar a assinatura de "${row.customerName}"?`)) return;
    await api.post(`/api/subscriptions/${row.id}/cancel`);
    onCancel?.();
    load();
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Plano</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Assinatura</th>
              <th>Início</th>
              <th>Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  Nenhuma assinatura encontrada.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.customerName ?? '—'}
                  {r.customerEmail && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      {r.customerEmail}
                    </div>
                  )}
                </td>
                <td>{r.plan.name}</td>
                <td>{formatCurrency(r.amount)}</td>
                <td>{r.payment ? <Badge status={r.payment.status} kind="payment" /> : <Badge status="PENDING" kind="payment" />}</td>
                <td>
                  <Badge status={r.status} kind="subscription" />
                </td>
                <td>{formatDate(r.startedAt)}</td>
                <td>{formatDate(r.expiresAt)}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn--ghost" onClick={() => setView(r)}>
                      Ver
                    </button>
                    <CopyButton value={r.publicUrl} label="Link" />
                    {(r.status === 'PENDING' || r.status === 'ACTIVE') && (
                      <button className="btn btn--danger-text" onClick={() => cancel(r)}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <Modal title="Detalhes da assinatura" onClose={() => setView(null)}>
          <div className="form-group">
            <label>Nome</label>
            <div>{view.customerName ?? '—'}</div>
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <div>{view.customerEmail ?? '—'}</div>
          </div>
          <div className="form-group">
            <label>Plano / Valor</label>
            <div>
              {view.plan.name} — {formatCurrency(view.amount)}
            </div>
          </div>
          <div className="form-group">
            <label>Link</label>
            <code className="mono" style={{ wordBreak: 'break-all' }}>
              {view.publicUrl}
            </code>
          </div>
          <div className="form-group">
            <label>Pagamento</label>
            <div>{view.payment ? <Badge status={view.payment.status} kind="payment" /> : '—'}</div>
          </div>
          <div className="form-group">
            <label>Assinatura</label>
            <div>
              <Badge status={view.status} kind="subscription" />
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="muted">
              Início: {formatDate(view.startedAt)} · Vencimento: {formatDate(view.expiresAt)}
            </span>
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <CopyButton value={view.publicUrl} label="Copiar link" />
            <button className="btn btn--ghost" onClick={() => setView(null)}>
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}