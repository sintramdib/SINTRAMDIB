import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import './Subscription.css';

interface PageData {
  site: { projectName: string; logo: string; headline: string; consentQuestion: string; paymentIntro: string };
  subscription: { status: string; customerName: string | null };
  plan: { name: string; description: string | null; amount: number; durationDays: number };
}

interface PaymentInfo {
  id: string;
  gatewayPaymentId: string | null;
  qrCode: string | null;
  qrCodeText: string | null;
  status: string;
}

type Stage = 'loading' | 'offer' | 'paying' | 'paid' | 'error';

export function SubscriptionPage() {
  const { token } = useParams<{ token: string }>();
  const [stage, setStage] = useState<Stage>('loading');
  const [data, setData] = useState<PageData | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<{ startedAt?: string; expiresAt?: string } | null>(null);

  // Polling: confirme oficialmente o status no backend (a ativação real vem do webhook).
  const pollStatus = useCallback(async () => {
    try {
      const res = await api.get(`/assinar/${token}/status`);
      const sub = res.data.subscription;
      if (sub.status === 'ACTIVE') {
        setStage('paid');
        setActive({ startedAt: sub.startedAt, expiresAt: sub.expiresAt });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    api
      .get(`/assinar/${token}`)
      .then(async (res) => {
        setData(res.data);
        if (res.data.subscription.status === 'ACTIVE') {
          const statusRes = await api.get(`/assinar/${token}/status`);
          setActive({
            startedAt: statusRes.data.subscription.startedAt,
            expiresAt: statusRes.data.subscription.expiresAt,
          });
          setStage('paid');
        } else {
          setStage('offer');
        }
      })
      .catch((err) => {
        setMessage(err.message);
        setStage('error');
      });
  }, [token]);

  useEffect(() => {
    if (stage !== 'paying') return;
    const id = setInterval(async () => {
      const done = await pollStatus();
      if (done) clearInterval(id);
    }, 4000);
    return () => clearInterval(id);
  }, [stage, pollStatus]);

  const startPayment = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await api.post(`/assinar/${token}/payment`);
      setPayment(res.data.payment);
      setStage('paying');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copyPix = async () => {
    if (payment?.qrCodeText) {
      await navigator.clipboard.writeText(payment.qrCodeText);
      setMessage('Código PIX copiado!');
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (stage === 'loading') {
    return (
      <div className="pub pub--center">
        <span className="spinner" />
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="pub">
        <div className="pub-card">
          <div className="pub-logo">AD</div>
          <h1 className="pub-title">Link inválido</h1>
          <p className="pub-text">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pub">
      <div className="pub-inner">
        <div className="pub-logo-row">
          <div className="pub-logo">{data?.site.logo ?? 'AD'}</div>
          <span className="pub-brand">{data?.site.projectName ?? 'Assinatura Digital'}</span>
        </div>

        {stage === 'offer' && (
          <div className="pub-card">
            <span className="pub-badge">Oferta exclusiva</span>
            <h1 className="pub-title">{data?.site.headline}</h1>
            <p className="pub-text">{data?.site.consentQuestion}</p>

            <div className="pub-plan">
              <div>
                <div className="pub-plan-name">{data?.plan.name}</div>
                {data?.plan.description && <div className="muted">{data.plan.description}</div>}
              </div>
              <div className="pub-price">{formatCurrency(data?.plan.amount ?? 0)}</div>
            </div>

            {data?.subscription.customerName && (
              <p className="pub-text">
                Olá, <strong>{data.subscription.customerName}</strong>!
              </p>
            )}

            {message && <div className="alert alert--error">{message}</div>}
            <button className="btn btn--primary btn--block pub-btn" onClick={startPayment} disabled={busy}>
              {busy ? 'Gerando pagamento…' : 'ASSINAR'}
            </button>
            <p className="pub-note">
              Ao assinar você terá acesso por {data?.plan.durationDays} dias. O pagamento é
              processado com segurança via PIX.
            </p>
          </div>
        )}

        {stage === 'paying' && payment && (
          <div className="pub-card">
            <h1 className="pub-title">Quase lá!</h1>
            <p className="pub-text">{data?.site.paymentIntro}</p>

            {payment.qrCode ? (
              <img src={payment.qrCode} alt="QR Code PIX" className="pub-qr" />
            ) : (
              <div className="empty">QR Code indisponível</div>
            )}

            <button className="btn btn--ghost btn--block" onClick={copyPix}>
              {payment.qrCodeText ? 'Copiar código PIX' : 'PIX indisponível'}
            </button>

            {message && <div className="alert alert--success">{message}</div>}

            <div className="pub-status-hint">
              <span className="spinner" style={{ width: 16, height: 16 }} />
              <span>Aguardando confirmação do pagamento…</span>
            </div>
            <p className="pub-note">
              Seu acesso é ativado automaticamente assim que o pagamento for confirmado. Esta página
              se atualiza sozinha.
            </p>
          </div>
        )}

        {stage === 'paid' && (
          <div className="pub-card pub-paid">
            <div className="pub-check">✓</div>
            <h1 className="pub-title">Pagamento confirmado!</h1>
            <p className="pub-text">Sua assinatura foi ativada. Bem-vindo(a)!</p>

            <div className="pub-detail">
              <div>
                <span className="muted">Status</span>
                <strong>Ativa</strong>
              </div>
              <div>
                <span className="muted">Início</span>
                <strong>{formatDate(active?.startedAt)}</strong>
              </div>
              <div>
                <span className="muted">Vencimento</span>
                <strong>{formatDate(active?.expiresAt)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}