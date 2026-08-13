import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ContentBadge } from '../../components/dashboard/ContentBadge';
import { ImageInput } from '../../components/dashboard/ImageInput';
import { formatDate } from '../../lib/format';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  position: string;
  imagePath: string | null;
  order: number;
  main: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  position: string;
  imageBase64: string | null;
  main: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const emptyForm: FormData = {
  title: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  position: 'principal',
  imageBase64: null,
  main: false,
  status: 'ACTIVE',
};

const POSITIONS = [
  { value: 'principal', label: 'Principal (carrossel topo)' },
  { value: 'secundario', label: 'Secundário (cards/sections)' },
  { value: 'noticias', label: 'Notícias (entre artigos)' },
  { value: 'interno', label: 'Interno (páginas internas)' },
];

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: Banner }>({ open: false, mode: 'create' });
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api.get('/api/banners');
    setBanners(res.data.banners);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create' });
  };

  const openEdit = (item: Banner) => {
    setForm({
      title: item.title,
      description: item.description ?? '',
      buttonText: item.buttonText ?? '',
      buttonLink: item.buttonLink ?? '',
      position: item.position,
      imageBase64: null,
      main: item.main,
      status: item.status,
    });
    setModal({ open: true, mode: 'edit', item });
  };

  const closeModal = () => setModal({ open: false, mode: 'create' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (modal.mode === 'create') {
        const res = await api.post('/api/banners', payload);
        setBanners([res.data.banner, ...banners]);
      } else {
        const res = await api.put(`/api/banners/${modal.item!.id}`, payload);
        setBanners(banners.map((b) => (b.id === modal.item!.id ? res.data.banner : b)));
      }
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;
    await api.delete(`/api/banners/${id}`);
    setBanners(banners.filter((b) => b.id !== id));
  };

  const handleToggleStatus = async (item: Banner) => {
    const res = await api.put(`/api/banners/${item.id}`, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    setBanners(banners.map((b) => (b.id === item.id ? res.data.banner : b)));
  };

  const handleReorder = async (sourceIndex: number, targetIndex: number) => {
    const ids = banners.map((b) => b.id);
    const [removed] = ids.splice(sourceIndex, 1);
    ids.splice(targetIndex, 0, removed);
    await api.post('/api/banners/reorder', { ids });
    load();
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const sourceIndex = banners.findIndex((b) => b.id === draggingId);
    const targetIndex = banners.findIndex((b) => b.id === targetId);
    handleReorder(sourceIndex, targetIndex);
    setDraggingId(null);
  };

  const handleDragEnd = () => setDraggingId(null);

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Gerencie banners do site (carrossel, cards, internas)</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>+ Novo banner</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Imagem</th>
                <th>Título</th>
                <th>Posição</th>
                <th>Principal</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 && (
                <tr><td colSpan={8} className="empty">Nenhum banner cadastrado.</td></tr>
              )}
              {banners.map((b, idx) => (
                <tr key={b.id} draggable onDragStart={(e) => handleDragStart(e, b.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, b.id)} onDragEnd={handleDragEnd} style={{ cursor: 'grab' }}>
                  <td className="muted mono">{idx + 1}</td>
                  <td>
                    {b.imagePath ? (
                      <img src={`http://localhost:3333${b.imagePath}`} alt={b.title} style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <span className="muted">Sem imagem</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</td>
                  <td>{POSITIONS.find((p) => p.value === b.position)?.label ?? b.position}</td>
                  <td>{b.main ? '🟢 Sim' : '⚪ Não'}</td>
                  <td><ContentBadge status={b.status} kind="banner" /></td>
                  <td>{formatDate(b.updatedAt)}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(b)}>Editar</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleToggleStatus(b)}>
                        {b.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                      </button>
                      <button className="btn btn--danger-text btn--sm" onClick={() => handleDelete(b.id)}>Excluir</button>
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
        <div className="modal-backdrop" onClick={() => setModal({ open: false, mode: 'create' })}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="spread" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{modal.mode === 'create' ? 'Novo banner' : 'Editar banner'}</h3>
              <button className="btn btn--ghost" onClick={() => setModal({ open: false, mode: 'create' })}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert--error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="grid gap-4">
                <div className="form-group">
                  <label>Título *</label>
                  <input className="text-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea className="text-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Texto do botão</label>
                  <input className="text-input" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Ex.: Saiba mais" />
                </div>
                <div className="form-group">
                  <label>Link do botão</label>
                  <input className="text-input" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} placeholder="https://exemplo.com" />
                </div>
                <div className="form-group">
                  <label>Posição</label>
                  <select className="select-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Imagem</label>
                  <ImageInput currentUrl={modal.item?.imagePath ? `http://localhost:3333${modal.item.imagePath}` : null} onChange={(v: string | null) => setForm({ ...form, imageBase64: v })} />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.main} onChange={(e) => setForm({ ...form, main: e.target.checked })} style={{ marginRight: 8 }} />
                    Banner principal (aparece no topo)
                  </label>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="select-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setModal({ open: false, mode: 'create' })}>Cancelar</button>
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