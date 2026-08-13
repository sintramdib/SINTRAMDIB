import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteData } from './SiteProvider';
import { navLinks } from '../../config/sitePublic';
import { ThemeTogglePublic } from '../../components/ThemeTogglePublic';

export function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSiteData();

  const shortName = settings?.site_short ?? 'STICOMBE';
  const legalName = settings?.site_legal_name ?? 'Sindicato dos Trabalhadores nas Indústrias da Construção e do Mobiliário de Brasília';

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-sm">
      {/* Barra superior de contato */}
      <div className="bg-brand-blueDark text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Atendimento online</span>
            <span className="text-blue-100">Seg-Sex, 8h às 18h</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeTogglePublic />
            <a href={settings?.site_facebook ?? 'http://www.facebook.com/sticombebrasilia'} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-brand-yellow">
              Facebook
            </a>
            <a href={settings?.site_instagram ?? 'http://www.facebook.com/sticombebrasilia'} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-brand-yellow">
              Instagram
            </a>
            <a href={settings?.site_youtube ?? 'https://www.youtube.com/@sticombebrasilia'} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-brand-yellow">
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Logo + menu */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-brand-blue text-sm font-black text-white">
            {shortName.slice(0, 3)}
          </div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold text-brand-blue">{shortName}</div>
            <div className="hidden text-[11px] text-slate-500 sm:block">
              {legalName}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l: { label: string; href: string }) =>
            l.label === 'Fale Conosco' ? (
              <button
                key={l.href}
                onClick={() => (window.location.href = l.href)}
                className="rounded bg-brand-yellow px-4 py-2 font-semibold text-brand-blueDark hover:bg-brand-yellowDark"
              >
                {l.label}
              </button>
            ) : (
              <NavLink
                key={l.href}
                to={l.href}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium ${isActive ? 'text-brand-blue' : 'text-slate-700 hover:text-brand-blue'}`
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
          <Link
            to="/seja-socio"
            className="ml-2 rounded bg-brand-blue px-4 py-2 font-bold text-white hover:bg-brand-blueDark"
          >
            Seja Sócio
          </Link>
        </nav>

        <button
          className="grid h-10 w-10 place-items-center rounded border border-slate-200 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-3 lg:hidden">
          {navLinks.map((l: { label: string; href: string }) => (
            <Link
              key={l.href}
              to={l.href}
              className="block border-b border-slate-100 py-3 font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/seja-socio"
            className="mt-3 block rounded bg-brand-blue py-2.5 text-center font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Seja Sócio
          </Link>
        </nav>
      )}
    </header>
  );
}