'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/cly';
import { InsightEngine } from '@/components/dashboard/InsightEngine';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TopContent } from '@/components/dashboard/TopContent';
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative';
import { PostModal } from '@/components/posts/PostModal';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { calcTotalER, fmt } from '@/lib/utils/analytics';
import { FileText, BarChart3, Activity, Users, Eye, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const { posts, loading } = usePosts();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  if (loading) {
    return (
      <AppShell title="Dashboard" onAddPost={() => setShowPostModal(true)}>
        <div className="flex flex-col gap-[18px]">
          {/* KPI Grid Loading */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-[18px]">
                  <Skeleton className="h-3 w-20 bg-cly-muted" />
                  <Skeleton className="size-[30px] rounded-lg bg-cly-muted" />
                </div>
                <div>
                  <Skeleton className="h-7 w-28 mb-2 bg-cly-muted" />
                  <Skeleton className="h-3 w-16 bg-cly-muted" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Loading */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
            <Skeleton className="h-5 w-40 mb-3.5 bg-cly-muted" />
            <Skeleton className="h-48 w-full bg-cly-muted" />
          </div>
        </div>
      </AppShell>
    );
  }

  const totalPosts = posts.length;
  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalFollowersGained = posts.reduce((s, p) => s + p.followers_gained, 0);
  const avgER = totalPosts > 0 ? calcTotalER(posts, erMode) : 0;

  // Calculate deltas (comparing with mock data for now - TODO: calculate from historical data)
  const postsGrowth = totalPosts > 0 ? 12 : 0;
  const reachGrowth = totalReach > 0 ? 18.3 : 0;
  const erGrowth = avgER > 0 ? 0.6 : 0;
  const followersGrowth = totalFollowersGained > 0 ? 15.2 : 0;

  return (
    <AppShell title="Dashboard" onAddPost={() => setShowPostModal(true)}>
      <div className="flex flex-col gap-[18px]">
        {/* KPI Grid - New Design System */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Posts"
            value={totalPosts.toLocaleString('id-ID')}
            delta={postsGrowth}
            deltaLabel=" posts"
            icon={FileText}
            tone="green"
            caption="This month"
          />
          <MetricCard
            label="Total Reach"
            value={fmt(totalReach)}
            delta={reachGrowth}
            deltaLabel="%"
            icon={Eye}
            tone="blue"
            caption="30 days"
          />
          <MetricCard
            label="Avg Engagement"
            value={`${avgER.toFixed(1)}%`}
            delta={erGrowth}
            deltaLabel="pp"
            icon={Activity}
            tone="amber"
            caption={`Based on ${erMode}`}
          />
          <MetricCard
            label="Followers"
            value={fmt(totalFollowersGained)}
            delta={followersGrowth}
            deltaLabel="%"
            icon={Users}
            tone="green"
            caption="Growth rate"
          />
        </div>

        {/* AI Insights Engine */}
        <InsightEngine />

        {/* Two Column Layout */}
        <div className="grid gap-[18px] lg:grid-cols-2">
          <TopContent />
          <GoalProgress />
        </div>

        {/* Weekly Narrative */}
        <WeeklyNarrative />
      </div>

      <PostModal open={showPostModal} onOpenChange={setShowPostModal} />
    </AppShell>
  );
}
