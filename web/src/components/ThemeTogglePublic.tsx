import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../lib/useTheme';
import { THEMES, THEME_NAMES, THEME_LABELS } from '../lib/themes';

export function ThemeTogglePublic() {
  const { theme, changeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', onDown);
    }
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="hover:text-brand-yellow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
        }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Alternar tema"
      >
        <span role="img" aria-label="tema" style={{ fontSize: 14 }}>
          🎨
        </span>
        <span>Tema</span>
      </button>

      {open && (
        <div
          className="absolute z-[60] top-full right-0 mt-2 w-44"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 20px 40px rgba(15,23,42,0.2)',
            padding: '8px',
          }}
          role="menu"
        >
          <div className="flex flex-col gap-1">
            {THEME_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                role="menuitem"
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${
                  theme === name
                    ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                    : 'hover:bg-[var(--surface-soft)] text-[var(--text)]'
                }`}
                onClick={() => {
                  changeTheme(name);
                  setOpen(false);
                }}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{
                    background: THEMES[name].primary,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  }}
                />
                <span className="flex-1">{THEME_LABELS[name]}</span>
                {theme === name && <span style={{ fontSize: 11 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
