import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ThemeSwitcher } from './ThemeSwitcher';

interface Admin {
  id: string;
  email: string;
  name?: string | null;
}

const NAV = [
  { to: '/dashboard', label: 'Visão geral', icon: '◧' },
  { to: '/cms/news', label: 'Notícias', icon: '📰' },
  { to: '/cms/banners', label: 'Banners', icon: '🖼️' },
  { to: '/subscriptions', label: 'Assinaturas', icon: '🗂' },
  { to: '/links', label: 'Links', icon: '🔗' },
  { to: '/payments', label: 'Pagamentos', icon: '💳' },
  { to: '/settings', label: 'Configurações', icon: '⚙' },
];

export function AdminLayout() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/api/auth/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = async () => {
    await api.post('/api/auth/logout');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
      </div>
    );
  }

  const initial = (admin?.name ?? admin?.email ?? 'A')[0]?.toUpperCase() ?? 'A';

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">AD</div>
          <div className="sidebar-name">Assinatura Digital</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{initial}</div>
          <button className="btn btn--danger-text" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            ☰
          </button>
          <span className="topbar-title">Painel Administrativo</span>
          <div className="topbar-user">
            <ThemeSwitcher />
            <span className="muted">{admin?.email}</span>
            <div className="avatar">{initial}</div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}