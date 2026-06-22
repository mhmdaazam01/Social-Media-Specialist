'use client';

import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard, InsightCard, SectionTitle, Badge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { calcTotalER, fmt } from '@/lib/utils/analytics';
import { Eye, TrendingUp, BookOpen, Target, ArrowUpRight, AlertTriangle, CheckCircle2, Clock, Download } from 'lucide-react';

export default function DashboardPage() {
  const { posts, loading } = usePosts();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  const metrics = useMemo(() => {
    if (!posts.length) return { totalPosts: 0, totalReach: 0, avgER: 0, activePosts: 0 };
    
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const avgER = calcTotalER(posts, erMode);
    const activePosts = posts.filter(p => p.created_at).length; // Mock: posts from this month
    
    return { totalPosts, totalReach, avgER, activePosts };
  }, [posts, erMode]);

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex flex-col gap-[18px]">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 min-h-[120px] animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const { totalReach, avgER, activePosts } = metrics;
  const reachProgress = totalReach > 0 ? Math.round((totalReach / 30000) * 100) : 0;
  const bestPost = posts.sort((a, b) => b.reach - a.reach)[0];

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-[18px]">
        {/* Demo Strip */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-cly-sm text-cly-text-2">
            <span className="w-[7px] h-[7px] rounded-full bg-cly-green" />
            Live data · {new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="neutral">{new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</Badge>
            <Badge tone="blue">All platforms</Badge>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Reach"
            value={fmt(totalReach)}
            delta={32}
            deltaLabel="%"
            icon={Eye}
            tone="green"
            caption={`${reachProgress}% of monthly target`}
          />
          <MetricCard
            label="Average ER"
            value={`${avgER.toFixed(1)}%`}
            delta={1.1}
            deltaLabel="pp"
            icon={TrendingUp}
            tone="blue"
            caption={`Weighted by ${erMode}`}
          />
          <MetricCard
            label="Active posts"
            value={activePosts.toString()}
            delta={5}
            deltaLabel=""
            icon={BookOpen}
            tone="amber"
            caption="Published this month"
          />
          <MetricCard
            label="Goal confidence"
            value="84%"
            delta={8}
            deltaLabel="%"
            icon={Target}
            tone="green"
            caption="Likely to hit reach goal"
          />
        </div>

        {/* Main Grid: Executive Snapshot + Sidebar */}
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.35fr)_360px]">
          {/* Executive Snapshot Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Executive snapshot"
              note="Reach is tracking above the last 3-month average; data refreshes daily."
            />
            
            {/* Chart Placeholder - TODO: Add real chart */}
            <div className="h-[250px] bg-cly-muted rounded-lg mb-2.5 flex items-center justify-center">
              <div className="text-center text-cly-text-3">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-cly-sm">Trend chart coming soon</p>
                <p className="text-cly-xs">Connect Recharts for visualization</p>
              </div>
            </div>

            {/* Three Insight Cards */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              <InsightCard
                icon={ArrowUpRight}
                title="Winning move"
                text={bestPost ? `Turn top performing post into 2 platform variants this week.` : 'Add more posts to see insights'}
                tone="green"
              />
              <InsightCard
                icon={AlertTriangle}
                title="Watchout"
                text="Review posting schedule to avoid conflicts on high-traffic days."
                tone="amber"
              />
              <InsightCard
                icon={CheckCircle2}
                title="Next action"
                text="Schedule pending drafts to maintain publishing consistency."
                tone="blue"
              />
            </div>
          </div>

          {/* Sidebar: Action Queue + Today */}
          <div className="flex flex-col gap-3.5">
            {/* Action Queue */}
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
              <SectionTitle
                title="Action queue"
                note="What needs attention before the next publish window."
              />
              
              <div className="space-y-0">
                {[
                  {
                    title: 'Review top content',
                    desc: 'Analyze best performing posts for patterns',
                    priority: 'High' as const,
                    icon: AlertTriangle,
                  },
                  {
                    title: 'Plan next week',
                    desc: 'Schedule content calendar for upcoming posts',
                    priority: 'Medium' as const,
                    icon: Clock,
                  },
                  {
                    title: 'Export metrics',
                    desc: 'Monthly report ready after final data sync',
                    priority: 'Low' as const,
                    icon: Download,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2.5 py-[11px] px-1 border-b border-cly-border last:border-0"
                  >
                    <div
                      className={`w-[30px] h-[30px] rounded-lg grid place-items-center shrink-0 ${
                        item.priority === 'High'
                          ? 'bg-cly-red-tint text-cly-red'
                          : item.priority === 'Medium'
                          ? 'bg-cly-amber-tint text-cly-amber'
                          : 'bg-cly-muted text-cly-text-2'
                      }`}
                    >
                      <item.icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-[3px]">
                        <span className="text-cly-base font-bold text-cly-text">
                          {item.title}
                        </span>
                        <span
                          className={`text-cly-micro font-black px-[7px] py-[2px] rounded border ${
                            item.priority === 'High'
                              ? 'border-cly-red/20 text-cly-red bg-cly-red-tint'
                              : item.priority === 'Medium'
                              ? 'border-cly-amber/20 text-cly-amber bg-cly-amber-tint'
                              : 'border-cly-border text-cly-text-2 bg-cly-muted'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="text-cly-sm text-cly-text-3 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today */}
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
              <SectionTitle title="Today" note="Operational pulse" />
              
              <div className="grid gap-2">
                {[
                  { time: '16:00', title: 'Analytics review', status: 'Review' },
                  { time: '18:30', title: 'Content draft', status: 'Scheduled' },
                  { time: '20:00', title: 'Post publish', status: 'Scheduled' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-2.5 text-cly-sm"
                  >
                    <span className="text-cly-text-3 font-bold font-mono">
                      {item.time}
                    </span>
                    <span className="text-cly-text font-semibold truncate">
                      {item.title}
                    </span>
                    <Badge
                      tone={
                        item.status === 'Review'
                          ? 'amber'
                          : item.status === 'Scheduled'
                          ? 'blue'
                          : 'green'
                      }
                      dot
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
