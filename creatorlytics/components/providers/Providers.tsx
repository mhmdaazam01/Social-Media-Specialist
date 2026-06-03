'use client';

import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { UserProvider, useUser } from '@/lib/context/UserContext';
import { DataProvider } from '@/lib/context/DataContext';

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const theme = profile?.theme || 'dark';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeSync>
        <DataProvider>
          {children}
          <Toaster position="top-right" richColors />
        </DataProvider>
      </ThemeSync>
    </UserProvider>
  );
}
