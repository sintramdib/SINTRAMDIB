import { SubscriptionsTable } from '../../components/SubscriptionsTable';

export function SubscriptionsPage() {
  return (
    <>
      <h1 className="page-title">Assinaturas</h1>
      <p className="page-subtitle">Gerencie todas as assinaturas do sistema</p>
      <div className="card">
        <SubscriptionsTable />
      </div>
    </>
  );
}