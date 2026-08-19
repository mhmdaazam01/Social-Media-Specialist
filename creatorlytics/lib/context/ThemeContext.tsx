'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

type Theme = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const supabase = createClient();
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Load theme from profile
  useEffect(() => {
    if (profile) {
      const p = profile as unknown as Record<string, unknown>;
      const savedTheme = p.theme as Theme | undefined;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, [profile]);

  // Resolve theme (auto -> light/dark based on system)
  useEffect(() => {
    function getResolvedTheme(t: Theme): ResolvedTheme {
      if (t === 'auto') {
        // Check system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      }
      return t;
    }

    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);

    // Apply theme to HTML element
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.setAttribute('data-theme', resolved);
    }

    // Listen for system theme changes if theme is auto
    if (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        
        // Apply to HTML
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newResolved);
        root.setAttribute('data-theme', newResolved);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to database
    if (profile) {
      await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', profile.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
