import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge } from '../../components/Badge';
import { formatCurrency, formatDate } from '../../lib/format';

interface PayRow {
  id: string;
  gateway: string;
  gatewayPaymentId: string | null;
  customerName: string | null;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export function PaymentsPage() {
  const [rows, setRows] = useState<PayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payments').then((res) => {
      setRows(res.data.payments);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Pagamentos</h1>
      <p className="page-subtitle">Histórico de pagamentos processados</p>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Gateway</th>
                <th>ID do pagamento</th>
                <th>Criado em</th>
                <th>Pago em</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.customerName ?? '—'}</td>
                  <td>{p.plan}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>
                    <Badge status={p.status} kind="payment" />
                  </td>
                  <td>{p.gateway}</td>
                  <td className="mono">{p.gatewayPaymentId ?? '—'}</td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>{formatDate(p.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}