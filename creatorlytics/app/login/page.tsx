'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useSettingsStore } from '@/lib/store/settings-store';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function LoginPage() {
  const { settings, updateSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };

  const handleLocalLogin = () => {
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>

      <div className="text-center space-y-8 max-w-sm w-full">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-lg shadow-primary/25">
            <svg viewBox="0 0 28 28" className="w-8 h-8" fill="none">
              <path d="M7 18V9l10 5-10 5Z" fill="currentColor" className="text-primary-foreground"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-muted-foreground text-sm mt-1.5">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 text-base gap-3"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-5 shrink-0">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Masuk dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          <Button
            onClick={handleLocalLogin}
            variant="outline"
            className="w-full h-12 text-base"
          >
            Mode Lokal (tanpa login)
          </Button>

          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Dengan Google, data kamu aman & sync di semua device.
            Mode lokal menyimpan data di browser saja.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Creatorlytics v2 &mdash; Analytics untuk kreator Indonesia
        </p>
      </div>
    </div>
  );
}
