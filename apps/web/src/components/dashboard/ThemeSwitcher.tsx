import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../lib/useTheme';
import { THEMES, THEME_NAMES, THEME_LABELS, tint } from '../../lib/themes';

export function ThemeSwitcher() {
  const { theme, customPrimary, changeTheme, changeCustomPrimary } = useTheme();
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

  const selectedPrimary = customPrimary || THEMES[theme].primary;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn--ghost"
        style={{ padding: '4px 10px', height: 32 }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span role="img" aria-label="tema" style={{ fontSize: 16 }}>
          🎨
        </span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Tema</span>
      </button>

      {open && (
        <div
          className="absolute z-20 top-full right-0 mt-2 w-64 max-w-xs"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 20px 40px rgba(15,23,42,0.2)',
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Temas pré-definidos
            </div>
            <div className="flex flex-col gap-1">
              {THEME_NAMES.map((name) => {
                const active = theme === name && !customPrimary;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`flex items-center gap-2 text-left px-2 py-1.5 rounded text-sm font-medium ${
                      active ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'hover:bg-[var(--surface-soft)] text-[var(--text)]'
                    }`}
                    onClick={() => {
                      changeTheme(name);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="h-4 w-4 rounded-sm"
                      style={{
                        background: THEMES[name].primary,
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <span className="flex-1">{THEME_LABELS[name]}</span>
                    {active && <span style={{ fontSize: 12 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '12px 14px' }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Cor de destaque
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customPrimary || selectedPrimary}
                onChange={(e) => changeCustomPrimary(e.target.value)}
                className="h-7 w-7 p-0 border border-[var(--border)] rounded cursor-pointer"
                aria-label="Cor de destaque"
              />
              <input
                type="text"
                value={customPrimary || ''}
                onChange={(e) => changeCustomPrimary(e.target.value)}
                placeholder={tint(selectedPrimary, 0.85)}
                className="text-input text-xs flex-1 font-mono"
                style={{ width: 120 }}
              />
              {customPrimary && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ padding: '2px 8px', fontSize: 11, height: 26 }}
                  onClick={() => changeCustomPrimary('')}
                  title="Remover cor personalizada"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="muted" style={{ fontSize: 10, marginTop: 6 }}>
              Define apenas a cor de destaque (primária) da Dashboard. Persistido entre sessões.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
