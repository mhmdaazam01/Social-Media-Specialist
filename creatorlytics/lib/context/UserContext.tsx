'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  niche: string;
  er_mode: 'impression' | 'reach' | 'followers';
  theme: 'dark' | 'light';
  is_onboarded: boolean;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const setTheme = useCallback(async (theme: 'dark' | 'light') => {
    if (!user) return;
    // Optimistic: update local state + DOM immediately so UI feels instant
    setProfile(prev => prev ? { ...prev, theme } : prev);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
    // Persist to DB in background (no await needed for UX)
    supabase.from('profiles').update({ theme }).eq('id', user.id);
  }, [user, supabase]);

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut, refreshProfile, setTheme }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
