'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/dashboard/KPICard';
import { InsightEngine } from '@/components/dashboard/InsightEngine';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TopContent } from '@/components/dashboard/TopContent';
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { calcTotalER, fmt } from '@/lib/utils/analytics';
import { FileText, BarChart3, Activity, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const { posts, loading } = usePosts();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  if (loading) {
    return (
      <AppShell title="Dashboard" onAddPost={() => setShowPostModal(true)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-7 w-28 animate-pulse bg-muted" />
                </div>
                <Skeleton className="size-9 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4.5 w-40" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4.5 w-32" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <GoalProgress />
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4.5 w-36" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalPosts = posts.length;
  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalFollowersGained = posts.reduce((s, p) => s + p.followers_gained, 0);
  const avgER = totalPosts > 0 ? calcTotalER(posts, erMode) : 0;

  return (
    <AppShell title="Dashboard" onAddPost={() => setShowPostModal(true)}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Posts"
            value={totalPosts.toLocaleString('id-ID')}
            icon={<FileText size={20} />}
          />
          <KPICard
            title="Total Reach"
            value={fmt(totalReach)}
            icon={<BarChart3 size={20} />}
          />
          <KPICard
            title="Rata-rata ER"
            value={`${avgER.toFixed(2)}%`}
            icon={<Activity size={20} />}
          />
          <KPICard
            title="Followers Gained"
            value={fmt(totalFollowersGained)}
            icon={<Users size={20} />}
          />
        </div>

        <InsightEngine />

        <div className="grid gap-6 lg:grid-cols-2">
          <TopContent />
          <GoalProgress />
        </div>

        <WeeklyNarrative />
      </div>
    </AppShell>
  );
}
