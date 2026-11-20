'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Theme } from '@carbon/react';
import { useSession } from '@/lib/auth-client';

export type CarbonThemeMode = 'g100' | 'white';

interface ThemeContextValue {
  theme: CarbonThemeMode;
  setTheme: (nextTheme: CarbonThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'cobblerp-carbon-theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'g100',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<CarbonThemeMode>('g100');
  const { data: session } = useSession();

  const applyTheme = useCallback((nextTheme: CarbonThemeMode) => {
    setThemeState(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-carbon-theme', nextTheme);
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage errors in restricted contexts
      }
    }
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'g100' || stored === 'white') {
        applyTheme(stored);
      }
    } catch {
      // Ignore storage access errors
    }
  }, [applyTheme]);

  useEffect(() => {
    const userPref = session?.user?.preferredTheme;
    if (userPref === 'g100' || userPref === 'white') {
      applyTheme(userPref);
    }
  }, [session?.user?.preferredTheme, applyTheme]);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'g100' ? 'white' : 'g100');
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, toggleTheme }}>
      <Theme theme={theme}>
        <div className="cobbl-app-shell">{children}</div>
      </Theme>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

