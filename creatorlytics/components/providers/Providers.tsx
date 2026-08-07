'use client';

import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/lib/context/UserContext';
import { DataProvider } from '@/lib/context/DataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DataProvider>
        {children}
        <Toaster position="top-right" richColors />
      </DataProvider>
    </UserProvider>
  );
}
