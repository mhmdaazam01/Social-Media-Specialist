'use client';

import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { DataProvider } from '@/lib/context/DataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const theme = profile?.theme || 'dark';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <DataProvider>
      {children}
      <Toaster position="top-right" richColors />
    </DataProvider>
  );
}
