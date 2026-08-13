import { useState } from 'react';
import { NewSubscriptionModal } from '../../components/NewSubscriptionModal';
import { SubscriptionsTable } from '../../components/SubscriptionsTable';

export function LinksPage() {
  const [showNew, setShowNew] = useState(false);
  const [refresh, setRefresh] = useState(0);

  return (
    <>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Links</h1>
          <p className="page-subtitle">Crie links exclusivos de assinatura para seus clientes</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>
          + Criar nova assinatura
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <strong>Links de assinatura</strong>
        </div>
        <SubscriptionsTable key={refresh} onCancel={() => setRefresh((v) => v + 1)} />
      </div>

      {showNew && <NewSubscriptionModal onClose={() => setShowNew(false)} onCreated={() => setRefresh((v) => v + 1)} />}
    </>
  );
}