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
import type { Post, Goal, ContentIdea, CalendarEvent, Competitor, Account, Platform, Pillar } from '@/types';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (loading || synced.current) return;
    if (!user) { synced.current = true; return; }

    const fullSync = async () => {
      const supabase = createClient();
      if (!supabase) { synced.current = true; return; }
      const uid = user.id;

      // Push local → Supabase
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

      // Pull Supabase → local (pake supabase client langsung biar cepet)
      const load = async <T,>(table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) { console.error(`auto-sync pull ${table}:`, error); return []; }
        return (data ?? []) as T[];
      };

      const [posts, goals, ideas, events, competitors, accounts, platforms, pillars] = await Promise.all([
        load<Post>('posts'),
        load<Goal>('goals'),
        load<ContentIdea>('content_ideas'),
        load<CalendarEvent>('calendar_events'),
        load<Competitor>('competitors'),
        load<Account>('accounts'),
        load<Platform>('platforms'),
        load<Pillar>('pillars'),
      ]);

      if (posts.length) usePostStore.setState({ posts });
      if (goals.length) useGoalStore.setState({ goals });
      if (ideas.length) useIdeaStore.setState({ ideas });
      if (events.length) useEventStore.setState({ events });
      if (competitors.length) useCompetitorStore.setState({ competitors });
      if (accounts.length) useAccountStore.setState({ accounts });
      if (platforms.length) usePlatformStore.setState({ platforms });
      if (pillars.length) usePillarStore.setState({ pillars });

      synced.current = true;
    };

    fullSync();
  }, [user, loading]);

  return <>{children}</>;
}
