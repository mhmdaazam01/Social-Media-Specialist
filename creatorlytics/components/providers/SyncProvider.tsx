'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/lib/hooks/useUser';
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

  const posts = usePostStore(s => s.posts);
  const goals = useGoalStore(s => s.goals);
  const ideas = useIdeaStore(s => s.ideas);
  const events = useEventStore(s => s.events);
  const competitors = useCompetitorStore(s => s.competitors);
  const accounts = useAccountStore(s => s.accounts);
  const platforms = usePlatformStore(s => s.platforms);
  const pillars = usePillarStore(s => s.pillars);

  useEffect(() => {
    if (loading || synced.current) return;

    if (!user) {
      synced.current = true;
      return;
    }

    const loadIfEmpty = async () => {
      if (!posts.length) await syncPosts();
      if (!goals.length) await syncGoals();
      if (!ideas.length) await syncIdeas();
      if (!events.length) await syncEvents();
      if (!competitors.length) await syncCompetitors();
      if (!accounts.length) await syncAccounts();
      if (!platforms.length) await syncPlatforms();
      if (!pillars.length) await syncPillars();
      synced.current = true;
    };

    loadIfEmpty();
  }, [user, loading]);

  return <>{children}</>;
}
