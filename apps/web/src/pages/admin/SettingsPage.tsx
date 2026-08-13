import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Settings {
  [key: string]: string;
}

const SECTIONS: Record<string, { label: string; keys: string[]; description: string }> = {
  geral: {
    label: 'Geral',
    keys: ['site_name', 'site_short', 'site_legal_name', 'site_addr'],
    description: 'Identificação e endereço do sindicato',
  },
  contato: {
    label: 'Contato',
    keys: ['site_email', 'site_whatsapp', 'site_whatsapp_display', 'site_phone1', 'site_phone2'],
    description: 'Canais de atendimento',
  },
  redes: {
    label: 'Redes Sociais',
    keys: ['site_facebook', 'site_instagram', 'site_youtube'],
    description: 'Links das redes sociais',
  },
  hero: {
    label: 'Destaque Principal (Hero)',
    keys: ['hero_headline', 'hero_subtitle'],
    description: 'Textos do carrossel principal da home',
  },
  rodape: {
    label: 'Rodapé',
    keys: ['site_footer_about'],
    description: 'Texto institucional do rodapé',
  },
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      setSettings(res.data.settings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Configurações do Site</h1>
          <p className="page-subtitle">Edite textos, contatos, redes sociais e textos da página inicial</p>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}
      {saved && <div className="alert alert--success" style={{ marginBottom: 16 }}>Alterações salvas com sucesso!</div>}

      <div className="card card-body">
        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
          {Object.entries(SECTIONS).map(([group, { label, keys, description }]) => (
            <div key={group} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <h3 className="page-title" style={{ fontSize: 18, marginBottom: 4 }}>{label}</h3>
              <p className="muted" style={{ marginBottom: 16 }}>{description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {keys.map((key) => (
                  <div key={key} className="form-group" style={{ width: '100%' }}>
                    <label>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                    <input
                      className="text-input"
                      value={settings[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={key}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn--ghost" onClick={load} disabled={loading}>Recarregar</button>
            <button type="submit" className="btn btn--primary" disabled={saving || loading}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}