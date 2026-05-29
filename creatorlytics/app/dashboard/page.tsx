'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/dashboard/KPICard';
import { InsightEngine } from '@/components/dashboard/InsightEngine';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TopContent } from '@/components/dashboard/TopContent';
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative';
import { usePostStore } from '@/lib/store/post-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { calcTotalER, fmt } from '@/lib/utils/analytics';
import { FileText, BarChart3, Activity, Users } from 'lucide-react';

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const posts = usePostStore(s => s.posts);
  const erMode = useSettingsStore(s => s.settings.er_mode);

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
