import React, { createContext, useContext, useEffect, useState } from 'react';

export type SiteTheme = 'midnight' | 'light' | 'slate';

interface ThemeContextValue {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  cycleTheme: () => void;
}

const STORAGE_KEY = 'securechat_portfolio_theme';
const THEME_ORDER: SiteTheme[] = ['midnight', 'light', 'slate'];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<SiteTheme>(() => {
    if (typeof window === 'undefined') return 'midnight';
    const saved = window.localStorage.getItem(STORAGE_KEY) as SiteTheme | null;
    return saved && THEME_ORDER.includes(saved) ? saved : 'midnight';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const setTheme = (next: SiteTheme) => setThemeState(next);

  const cycleTheme = () => {
    setThemeState((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
