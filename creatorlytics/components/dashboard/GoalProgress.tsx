'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoals } from '@/lib/hooks/useGoals';
import { usePosts } from '@/lib/hooks/usePosts';
import { currentMonth, currentYear } from '@/lib/utils/formatting';
import { Target } from 'lucide-react';
import type { Post } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function calcProgress(posts: Post[], metric: string): number {
  switch (metric) {
    case 'reach':
      return posts.reduce((s, p) => s + p.reach, 0);
    case 'impression':
      return posts.reduce((s, p) => s + p.impression, 0);
    case 'followers':
    case 'followers_gained':
      return posts.reduce((s, p) => s + p.followers_gained, 0);
    case 'engagement':
    case 'interactions':
      return posts.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
    case 'posts':
    case 'post':
      return posts.length;
    default:
      return 0;
  }
}

const metricLabels: Record<string, string> = {
  reach: 'Reach',
  impression: 'Impressions',
  followers: 'Followers',
  followers_gained: 'Followers',
  engagement: 'Engagement',
  interactions: 'Interactions',
  posts: 'Posts',
  post: 'Posts',
};

export function GoalProgress() {
  const { goals, loading: goalsLoading } = useGoals();
  const { posts, loading: postsLoading } = usePosts();

  const currentGoals = useMemo(
    () => {
      const month = currentMonth();
      const year = currentYear();
      console.log('🔍 [GoalProgress] Filtering goals for:', { month, year });
      console.log('🔍 [GoalProgress] Total goals:', goals.length);
      const filtered = goals.filter(g => {
        console.log('🔍 [GoalProgress] Goal:', g.label, '- Month:', g.month, 'Year:', g.year);
        return g.month === month && g.year === year;
      });
      console.log('✅ [GoalProgress] Filtered goals:', filtered.length);
      return filtered;
    },
    [goals]
  );

  if (goalsLoading || postsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} className="text-muted-foreground" />
            Progress Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} className="text-muted-foreground" />
            Progress Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target size={32} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada goals untuk bulan ini
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tambahkan goals di halaman Goals
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target size={18} className="text-muted-foreground" />
          Progress Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {currentGoals.map(goal => {
            const current = calcProgress(posts, goal.metric);
            const pct = Math.min(Math.round((current / goal.target) * 100), 100);
            const metricLabel = metricLabels[goal.metric] || goal.metric;

            return (
              <div key={goal.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{goal.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {pct}%
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {current.toLocaleString('id-ID')} / {goal.target.toLocaleString('id-ID')} {metricLabel}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
