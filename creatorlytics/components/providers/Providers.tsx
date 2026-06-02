'use client';

import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/settings-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore(s => s.settings.theme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
