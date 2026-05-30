'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { usePostStore } from '@/lib/store/post-store';
import { useGoalStore } from '@/lib/store/goal-store';
import { useIdeaStore } from '@/lib/store/idea-store';
import { useEventStore } from '@/lib/store/event-store';
import { useCompetitorStore } from '@/lib/store/competitor-store';
import { useAccountStore } from '@/lib/store/account-store';
import { usePlatformStore } from '@/lib/store/platform-store';
import { usePillarStore } from '@/lib/store/pillar-store';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const synced = useRef(false);

  const syncPosts = usePostStore(s => s.syncFromSupabase);
  const syncGoals = useGoalStore(s => s.syncFromSupabase);
  const syncIdeas = useIdeaStore(s => s.syncFromSupabase);
  const syncEvents = useEventStore(s => s.syncFromSupabase);
  const syncCompetitors = useCompetitorStore(s => s.syncFromSupabase);
  const syncAccounts = useAccountStore(s => s.syncFromSupabase);
  const syncPlatforms = usePlatformStore(s => s.syncFromSupabase);
  const syncPillars = usePillarStore(s => s.syncFromSupabase);

  useEffect(() => {
    if (loading || synced.current) return;
    if (!user) { synced.current = true; return; }

    const fullSync = async () => {
      const supabase = createClient();
      if (!supabase) { synced.current = true; return; }
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { synced.current = true; return; }
      const uid = u.id;

      const push = async (table: string, rows: unknown[]) => {
        if (!rows.length) return;
        const { error } = await supabase.from(table).upsert(
          (rows as Record<string, unknown>[]).map(r => ({ ...r, user_id: uid })),
          { onConflict: 'id' }
        );
        if (error) console.error(`auto-sync push ${table}:`, error);
      };

      await Promise.all([
        push('posts', usePostStore.getState().posts),
        push('goals', useGoalStore.getState().goals),
        push('content_ideas', useIdeaStore.getState().ideas),
        push('calendar_events', useEventStore.getState().events),
        push('competitors', useCompetitorStore.getState().competitors),
        push('accounts', useAccountStore.getState().accounts),
        push('platforms', usePlatformStore.getState().platforms),
        push('pillars', usePillarStore.getState().pillars),
      ]);

      await Promise.all([
        syncPosts(),
        syncGoals(),
        syncIdeas(),
        syncEvents(),
        syncCompetitors(),
        syncAccounts(),
        syncPlatforms(),
        syncPillars(),
      ]);

      synced.current = true;
    };

    fullSync();
  }, [user, loading]);

  return <>{children}</>;
}
