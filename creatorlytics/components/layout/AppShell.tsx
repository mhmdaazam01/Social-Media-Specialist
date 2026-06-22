'use client';

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
  const { profile } = useUser();
  // TODO: AUTH TEMPORARILY DISABLED FOR DEVELOPMENT
  // const { user, profile, loading } = useUser();
  // const router = useRouter();

  // TODO: AUTH TEMPORARILY DISABLED FOR DEVELOPMENT
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace('/login');
  //   }
  // }, [user, loading, router]);

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-background">
  //       <div className="animate-pulse text-muted-foreground">Memuat...</div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  const showOnboarding = profile !== null && profile.is_onboarded === false;

  return (
    <div className="flex h-screen overflow-hidden bg-cly-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 pb-14 lg:pb-0 bg-cly-bg">
        <Topbar title={title} onAddPost={onAddPost} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-cly-bg">
          {children}
        </main>
      </div>
      <MobileNav />
      {showOnboarding && <OnboardingWizard />}
    </div>
  );
}
