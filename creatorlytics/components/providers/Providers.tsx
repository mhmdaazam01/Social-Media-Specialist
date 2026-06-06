'use client';

import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { UserProvider, useUser } from '@/lib/context/UserContext';
import { DataProvider } from '@/lib/context/DataContext';

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const theme = profile?.theme || 'dark';

  useEffect(() => {
    // Sync class to DOM
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    // Keep cookie in sync so inline script reads correct value on next page load
    document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
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
