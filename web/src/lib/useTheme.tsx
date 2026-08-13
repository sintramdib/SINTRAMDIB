import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { THEMES, type ThemeName, type Theme, tint, normalizeHex } from './themes';

const STORAGE_KEY = 'dashboardTheme';
const CUSTOM_PRIMARY_KEY = 'dashboardCustomPrimary';

export interface ThemeContextValue {
  theme: ThemeName;
  customPrimary: string;
  changeTheme: (next: ThemeName) => void;
  changeCustomPrimary: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function applyTheme(themeName: ThemeName, customPrimary?: string): void {
  const base = THEMES[themeName] ?? THEMES.default;
  for (const [key, value] of Object.entries(base)) {
    document.documentElement.style.setProperty('--' + key, value);
  }
  if (customPrimary) {
    const primary = normalizeHex(customPrimary);
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-soft', tint(primary, 0.85));
  }
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('default');
  const [customPrimary, setCustomPrimary] = useState<string>('');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeName | null) ?? 'default';
    const safeName = THEMES[saved] ? saved : 'default';
    const savedCustom = localStorage.getItem(CUSTOM_PRIMARY_KEY) ?? '';
    if (safeName !== saved) localStorage.setItem(STORAGE_KEY, 'default');
    setTheme(safeName);
    setCustomPrimary(savedCustom);
    applyTheme(safeName, savedCustom || undefined);
  }, []);

  const changeTheme = (next: ThemeName) => {
    localStorage.setItem(STORAGE_KEY, next);
    localStorage.removeItem(CUSTOM_PRIMARY_KEY);
    setCustomPrimary('');
    applyTheme(next);
    setTheme(next);
  };

  const changeCustomPrimary = (hex: string) => {
    const val = hex.trim();
    if (val) {
      localStorage.setItem(CUSTOM_PRIMARY_KEY, normalizeHex(val));
    } else {
      localStorage.removeItem(CUSTOM_PRIMARY_KEY);
    }
    setCustomPrimary(val);
    applyTheme(theme, val || undefined);
  };

  return (
    <ThemeContext.Provider value={{ theme, customPrimary, changeTheme, changeCustomPrimary }}>
      {children}
    </ThemeContext.Provider>
  );
}

export type { Theme, ThemeName };
