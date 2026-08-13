import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Modal } from './Modal';
import { CopyButton } from './CopyButton';

interface Plan {
  id: string;
  name: string;
  amount: number;
  durationDays: number;
}

export function NewSubscriptionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/plans').then((res) => {
      setPlans(res.data.plans);
      if (res.data.plans.length > 0) setPlanId(res.data.plans[0].id);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/subscriptions', {
        customerName,
        customerEmail,
        planId,
      });
      setCreatedUrl(res.data.subscription.publicUrl);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Criar nova assinatura" onClose={onClose}>
      {createdUrl ? (
        <div>
          <div className="alert alert--success" style={{ marginBottom: 16 }}>
            Link criado com sucesso!
          </div>
          <div className="form-group">
            <label>Link do cliente</label>
            <code className="mono" style={{ wordBreak: 'break-all' }}>
              {createdUrl}
            </code>
          </div>
          <div className="row">
            <CopyButton value={createdUrl} />
            <button className="btn btn--ghost" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="alert alert--error" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="form-group">
            <label>Nome do cliente</label>
            <input
              className="text-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex.: Maria Silva"
              required
            />
          </div>
          <div className="form-group">
            <label>E-mail (opcional)</label>
            <input
              className="text-input"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="form-group">
            <label>Plano</label>
            <select className="select-input" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — R$ {p.amount.toFixed(2)} ({p.durationDays} dias)
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary btn--block" disabled={loading || plans.length === 0}>
            {loading ? 'Criando…' : 'Criar link'}
          </button>
        </form>
      )}
    </Modal>
  );
}