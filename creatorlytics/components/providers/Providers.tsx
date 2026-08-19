'use client';

import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/lib/context/UserContext';
import { DataProvider } from '@/lib/context/DataContext';
import { CollaborationProvider } from '@/lib/context/CollaborationContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <CollaborationProvider>
          <DataProvider>
            {children}
            <Toaster position="top-right" richColors />
          </DataProvider>
        </CollaborationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
