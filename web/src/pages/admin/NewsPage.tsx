import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ContentBadge } from '../../components/dashboard/ContentBadge';
import { ImageInput } from '../../components/dashboard/ImageInput';
import { formatDate } from '../../lib/format';

interface News {
  id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  category: string | null;
  author: string | null;
  headline: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'DISABLED';
  imagePath: string | null;
  publishedAt: string | null;
  scheduleAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  headline: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'DISABLED';
  imageBase64: string | null;
  scheduleAt: string;
}

const emptyForm: FormData = {
  title: '',
  subtitle: '',
  content: '',
  category: '',
  author: '',
  headline: false,
  status: 'DRAFT',
  imageBase64: null,
  scheduleAt: '',
};

export function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: News }>({ open: false, mode: 'create' });
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('q', filters.search);
    const res = await api.get(`/api/news?${params.toString()}`);
    setNews(res.data.news);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create' });
  };

  const openEdit = (item: News) => {
    setForm({
      title: item.title,
      subtitle: item.subtitle ?? '',
      content: item.content ?? '',
      category: item.category ?? '',
      author: item.author ?? '',
      headline: item.headline,
      status: item.status,
      imageBase64: null,
      scheduleAt: item.scheduleAt ? item.scheduleAt.slice(0, 16) : '',
    });
    setModal({ open: true, mode: 'edit', item });
  };

  const closeModal = () => setModal({ open: false, mode: 'create' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = { ...form, scheduleAt: form.scheduleAt || null };
      if (modal.mode === 'create') {
        const res = await api.post('/api/news', payload);
        setNews([res.data.news, ...news]);
      } else {
        const res = await api.put(`/api/news/${modal.item!.id}`, payload);
        setNews(news.map((n) => (n.id === modal.item!.id ? res.data.news : n)));
      }
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) return;
    await api.delete(`/api/news/${id}`);
    setNews(news.filter((n) => n.id !== id));
  };

  const handleDuplicate = async (id: string) => {
    const res = await api.post(`/api/news/${id}/duplicate`);
    setNews([res.data.news, ...news]);
  };

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Notícias</h1>
          <p className="page-subtitle">Gerencie notícias, rascunhos e publicações</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>+ Nova notícia</button>
      </div>

      {/* Filtros */}
      <div className="card card-body" style={{ marginBottom: 16 }}>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <input
            type="search"
            className="text-input grow"
            placeholder="Buscar por título, autor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select className="select-input" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Todos os status</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="DRAFT">Rascunhos</option>
            <option value="SCHEDULED">Agendadas</option>
            <option value="DISABLED">Desativadas</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Destaque</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 && (
                <tr><td colSpan={7} className="empty">Nenhuma notícia encontrada.</td></tr>
              )}
              {news.map((n) => (
                <tr key={n.id}>
                  <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</td>
                  <td>{n.category ?? '—'}</td>
                  <td>{n.author ?? '—'}</td>
                  <td><ContentBadge status={n.status} kind="news" /></td>
                  <td>{n.headline ? 'Sim' : 'Não'}</td>
                  <td>{formatDate(n.updatedAt)}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(n)}>Editar</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDuplicate(n.id)}>Duplicar</button>
                      <button className="btn btn--danger-text btn--sm" onClick={() => handleDelete(n.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="spread" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{modal.mode === 'create' ? 'Nova notícia' : 'Editar notícia'}</h3>
              <button className="btn btn--ghost" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert--error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="grid gap-4">
                <div className="form-group">
                  <label>Título *</label>
                  <input className="text-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Subtítulo</label>
                  <input className="text-input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <input className="text-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex.: Política, Esportes..." />
                </div>
                <div className="form-group">
                  <label>Autor</label>
                  <input className="text-input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Conteúdo</label>
                  <textarea className="text-input" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Conteúdo da notícia (texto simples, sem HTML)" />
                </div>
                <div className="form-group">
                  <label>Imagem principal</label>
                  <ImageInput currentUrl={modal.item?.imagePath ? `http://localhost:3333${modal.item.imagePath}` : null} onChange={(v: string | null) => setForm({ ...form, imageBase64: v })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="select-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                    <option value="DRAFT">Rascunho</option>
                    <option value="PUBLISHED">Publicada</option>
                    <option value="SCHEDULED">Agendada</option>
                    <option value="DISABLED">Desativada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Agendar para (se status Agendada)</label>
                  <input type="datetime-local" className="text-input" value={form.scheduleAt} onChange={(e) => setForm({ ...form, scheduleAt: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.checked })} style={{ marginRight: 8 }} />
                    Destaque na página inicial
                  </label>
                </div>
              </div>
              <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}