'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  onAddPost?: () => void;
}

export function AppShell({ children, title = 'Dashboard', onAddPost }: AppShellProps) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cly-bg">
        <div className="animate-pulse text-cly-text-3 text-sm">Memuat...</div>
      </div>
    );
  }

  if (!user) return null;

  const showOnboarding = profile !== null && profile.is_onboarded === false;

  return (
    <div className="flex h-screen overflow-hidden bg-cly-bg print:h-auto print:block print:bg-white">
      <div className="print:hidden"><Sidebar /></div>
      <div className="flex-1 flex flex-col lg:ml-[280px] pb-16 lg:pb-0 bg-cly-bg print:ml-0 print:pb-0 print:bg-white print:block">
        <div className="print:hidden"><Topbar title={title} onAddPost={onAddPost} /></div>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-cly-bg print:overflow-visible print:p-0 print:bg-white print:block">
          {children}
        </main>
      </div>
      <div className="print:hidden"><MobileNav /></div>
      {showOnboarding && <div className="print:hidden"><OnboardingWizard /></div>}
    </div>
  );
}
