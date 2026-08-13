import { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { api } from '../../lib/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { CopyButton } from '../../components/CopyButton';
import { ContentBadge } from '../../components/dashboard/ContentBadge';
import { NewSubscriptionModal } from '../../components/NewSubscriptionModal';
import { formatDate, formatCurrency } from '../../lib/format';

const COLORS = ['#16a34a', '#d97706', '#64748b', '#dc2626'];

interface Stats {
  totals: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    cancelled: number;
    paidPayments: number;
  };
  distribution: { label: string; value: number }[];
}

interface Overview {
  content: {
    newsTotal: number;
    newsPublished: number;
    newsDraft: number;
    bannerTotal: number;
    bannerActive: number;
    scheduled: number;
  };
  activity: { type: string; label: string; detail: string; at: string }[];
}

interface Row {
  id: string;
  publicUrl: string;
  customerName: string | null;
  plan: { name: string };
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  payment: { status: string } | null;
}

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    const [s, r, o] = await Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/subscriptions'),
      api.get('/api/dashboard/overview'),
    ]);
    setStats(s.data);
    setRows(r.data.subscriptions.slice(0, 6));
    setOverview(o.data);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
      </div>
    );
  }

  const content = overview?.content;

  return (
    <>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-subtitle">Painel de controle do sistema e do conteúdo do site</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>
          + Criar nova assinatura
        </button>
      </div>

      {/* Cards de assinaturas */}
      <div className="stats-grid">
        <StatCard label="Total de assinaturas" value={stats?.totals.total ?? 0} />
        <StatCard label="Ativas" value={stats?.totals.active ?? 0} />
        <StatCard label="Pendentes" value={stats?.totals.pending ?? 0} />
        <StatCard label="Expiradas" value={stats?.totals.expired ?? 0} />
        <StatCard label="Pagamentos confirmados" value={stats?.totals.paidPayments ?? 0} tone="paid" />
      </div>

      {/* Cards de conteúdo do site */}
      {content && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <StatCard label="Total de notícias" value={content.newsTotal} />
          <StatCard label="Publicadas" value={content.newsPublished} tone="paid" />
          <StatCard label="Rascunhos" value={content.newsDraft} />
          <StatCard label="Agendadas" value={content.scheduled} />
          <StatCard label="Total de banners" value={content.bannerTotal} />
          <StatCard label="Banners ativos" value={content.bannerActive} tone="paid" />
        </div>
      )}

      <div className="chart-grid">
        <div className="card card-body">
          <h3 style={{ margin: '0 0 8px' }}>Distribuição de assinaturas</h3>
          {stats && stats.distribution.every((d) => d.value === 0) ? (
            <div className="empty">Ainda não há assinaturas.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats?.distribution ?? []}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  activeIndex={undefined}
                  activeShape={renderActiveShape}
                  label={({ label, value }) => `${label}: ${value}`}
                >
                  {stats?.distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <strong>Assinaturas recentes</strong>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plano</th>
                  <th>Valor</th>
                  <th>Assinatura</th>
                  <th>Vencimento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">
                      Nenhuma assinatura. Crie um link para começar.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.customerName ?? '—'}</td>
                    <td>{r.plan.name}</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td>
                      <Badge status={r.status} kind="subscription" />
                    </td>
                    <td>{formatDate(r.expiresAt)}</td>
                    <td>
                      <CopyButton value={r.publicUrl} label="Link" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      {overview && overview.activity.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <strong>Atividade recente</strong>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {overview.activity.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.type}</td>
                    <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.label}
                    </td>
                    <td>
                      <ContentBadge status={a.detail as any} kind={a.type === 'Notícia' ? 'news' : 'banner'} />
                    </td>
                    <td>{formatDate(a.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNew && (
        <NewSubscriptionModal onClose={() => setShowNew(false)} onCreated={load} />
      )}
    </>
  );
}