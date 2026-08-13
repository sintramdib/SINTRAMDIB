/**
 * Configuração de temas pré-definidos.
 * Cada tema redefine as variáveis CSS utilizadas pelo admin (global.css) e pelo site público
 * (Tailwind `brand-*` e `.pub-site`). Aplicação é global (via ThemeProvider em main.tsx)
 * e persistida no localStorage.
 */

export type ThemeName = 'default' | 'dark' | 'blue' | 'green' | 'purple';

export type Theme = Record<string, string>;

export const THEME_NAMES: ThemeName[] = ['default', 'dark', 'blue', 'green', 'purple'];

export const THEME_LABELS: Record<ThemeName, string> = {
  default: 'Tema Padrão',
  dark: 'Escuro',
  blue: 'Azul',
  green: 'Verde',
  purple: 'Roxo',
};

export const THEMES: Record<ThemeName, Theme> = {
  default: {
    // Admin (global.css)
    bg: '#f4f6fb',
    surface: '#ffffff',
    'surface-soft': '#f8fafc',
    border: '#e6e8ef',
    text: '#0f172a',
    'text-muted': '#64748b',
    primary: '#4f46e5',
    'primary-soft': '#eef2ff',
    success: '#16a34a',
    'success-soft': '#f0fdf4',
    warn: '#d97706',
    'warn-soft': '#fffbeb',
    danger: '#dc2626',
    'danger-soft': '#fef2f2',
    // Público (Header/Subscription)
    'brand-blue': '#1d4ed8',
    'brand-blueDark': '#1e3a8a',
    'brand-yellow': '#facc15',
    'brand-yellowDark': '#eab308',
    'pub-bg': '#ffffff',
    'pub-text': '#0f172a',
  },
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    'surface-soft': '#334155',
    border: '#475569',
    text: '#f1f5f9',
    'text-muted': '#94a3b8',
    primary: '#6366f1',
    'primary-soft': '#4338ca',
    success: '#4ade80',
    'success-soft': '#14532d',
    warn: '#fbbf24',
    'warn-soft': '#78350a',
    danger: '#f87171',
    'danger-soft': '#7f1d1d',
    'brand-blue': '#6366f1',
    'brand-blueDark': '#4f46e5',
    'brand-yellow': '#fbbf24',
    'brand-yellowDark': '#d97706',
    'pub-bg': '#0f172a',
    'pub-text': '#f1f5f9',
  },
  blue: {
    bg: '#eff6ff',
    surface: '#ffffff',
    'surface-soft': '#dbeafe',
    border: '#bfdbfe',
    text: '#0f172a',
    'text-muted': '#64748b',
    primary: '#2563eb',
    'primary-soft': '#dbeafe',
    success: '#16a34a',
    'success-soft': '#f0fdf4',
    warn: '#d97706',
    'warn-soft': '#fffbeb',
    danger: '#dc2626',
    'danger-soft': '#fef2f2',
    'brand-blue': '#2563eb',
    'brand-blueDark': '#1d4ed8',
    'brand-yellow': '#facc15',
    'brand-yellowDark': '#eab308',
    'pub-bg': '#eff6ff',
    'pub-text': '#0f172a',
  },
  green: {
    bg: '#f0fdf4',
    surface: '#ffffff',
    'surface-soft': '#dcfce8',
    border: '#bbf7d0',
    text: '#0f172a',
    'text-muted': '#64748b',
    primary: '#15803d',
    'primary-soft': '#dcfce7',
    success: '#16a34a',
    'success-soft': '#f0fdf4',
    warn: '#d97706',
    'warn-soft': '#fffbeb',
    danger: '#dc2626',
    'danger-soft': '#fef2f2',
    'brand-blue': '#15803d',
    'brand-blueDark': '#16a34a',
    'brand-yellow': '#d97706',
    'brand-yellowDark': '#b45300',
    'pub-bg': '#f0fdf4',
    'pub-text': '#0f172a',
  },
  purple: {
    bg: '#faf5ff',
    surface: '#ffffff',
    'surface-soft': '#ede9fe',
    border: '#ddd6fe',
    text: '#0f172a',
    'text-muted': '#64748b',
    primary: '#7c3aed',
    'primary-soft': '#ede9fe',
    success: '#16a34a',
    'success-soft': '#f0fdf4',
    warn: '#d97706',
    'warn-soft': '#fffbeb',
    danger: '#dc2626',
    'danger-soft': '#fef2f2',
    'brand-blue': '#7c3aed',
    'brand-blueDark': '#6d28d9',
    'brand-yellow': '#facc15',
    'brand-yellowDark': '#d97706',
    'pub-bg': '#faf5ff',
    'pub-text': '#0f172a',
  },
};

export function normalizeHex(hex: string): string {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return `#${h}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

export function tint(hex: string, ratio = 0.5): string {
  const [r, g, b] = hexToRgb(hex);
  const t = (c: number) => Math.round(c + (255 - c) * ratio);
  return `#${t(r).toString(16).padStart(2, '0')}${t(g).toString(16).padStart(2, '0')}${t(b).toString(16).padStart(2, '0')}`;
}

export function shade(hex: string, ratio = 0.5): string {
  const [r, g, b] = hexToRgb(hex);
  const t = (c: number) => Math.round(c * ratio);
  return `#${t(r).toString(16).padStart(2, '0')}${t(g).toString(16).padStart(2, '0')}${t(b).toString(16).padStart(2, '0')}`;
}
