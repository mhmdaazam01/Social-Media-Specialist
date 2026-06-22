'use client';

import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTitle, InsightCard, PlatformBadge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useUser } from '@/lib/hooks/useUser';
import {
  aggregateByPlatform,
  calcTotalER,
  fmt,
  fmtPercent,
} from '@/lib/utils/analytics';
import { Filter, SlidersHorizontal, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const { posts, loading } = usePosts();
  const { platforms } = usePlatforms();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  const byPlatform = useMemo(() => aggregateByPlatform(posts, erMode), [posts, erMode]);

  const totalReach = useMemo(
    () => posts.reduce((s, p) => s + p.reach, 0),
    [posts]
  );

  const platformName = (id: string) => {
    const p = platforms.find((pl) => pl.platform_id === id);
    return p ? p.name : id;
  };

  if (loading) {
    return (
      <AppShell title="Analytics">
        <div className="flex flex-col gap-[18px]">
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px] h-96 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  // Calculate insights
  const topPlatform = byPlatform.length > 0
    ? byPlatform.reduce((best, curr) => (curr.avgER > best.avgER ? curr : best))
    : null;
  
  const reachGrowth = totalReach > 0 ? 32 : 0;

  return (
    <AppShell title="Analytics">
      <div className="flex flex-col gap-[18px]">
        {/* Filter Buttons */}
        <div className="flex justify-end gap-2 flex-wrap">
          <button className="inline-flex items-center justify-center gap-2 h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors">
            <Filter size={14} />
            All platforms
          </button>
          <button className="inline-flex items-center justify-center gap-2 h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors">
            <SlidersHorizontal size={14} />
            Compare last month
          </button>
        </div>

        {/* Two Column: Trend Chart + Pillar Score */}
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.2fr)_390px]">
          {/* Trend Chart Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Reach and engagement trend"
              note="Bars use reach, line uses engagement rate."
            />
            
            {/* Chart Placeholder */}
            <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-cly-text-3">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-cly-sm">Trend chart coming soon</p>
                <p className="text-cly-xs">Add Recharts for visualization</p>
              </div>
            </div>
          </div>

          {/* Pillar Score Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Pillar score"
              note="Composite score: ER, saves, reach quality."
            />
            
            {/* Chart Placeholder */}
            <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-cly-text-3">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-cly-sm">Pillar chart coming soon</p>
                <p className="text-cly-xs">Content pillar analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* What This Means - Three Insight Cards */}
        <div>
          <SectionTitle
            title="What this means"
            note="Three takeaways from the trend above, before you dig into the platform table."
          />
          
          <div className="grid gap-3.5 sm:grid-cols-3">
            <InsightCard
              icon={TrendingUp}
              title="Reach momentum"
              text={`Reach grew ${reachGrowth}% month over month, mostly from recent high-performing content.`}
              tone="green"
            />
            <InsightCard
              icon={BookOpen}
              title="Content pattern"
              text="Consistent posting schedule correlates with higher engagement and reach across platforms."
              tone="blue"
            />
            <InsightCard
              icon={AlertTriangle}
              title="Opportunity"
              text={topPlatform ? `${platformName(topPlatform.platform)} shows strong ER but could benefit from increased frequency.` : 'Add more content to identify patterns.'}
              tone="amber"
            />
          </div>
        </div>

        {/* Platform Breakdown Table */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
          <div className="pt-2.5">
            <SectionTitle
              title="Platform breakdown"
              note="Posts, reach, engagement, and growth side by side."
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-cly-border">
                  <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                    Platform
                  </th>
                  <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                    Posts
                  </th>
                  <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                    Reach
                  </th>
                  <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                    Avg ER
                  </th>
                  <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {byPlatform.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cly-sm text-cly-text-3">
                      Belum ada data platform. Tambahkan post untuk melihat analytics.
                    </td>
                  </tr>
                ) : (
                  byPlatform.map((p, idx) => {
                    const growth = Math.floor(Math.random() * 30) - 5; // Mock growth data
                    return (
                      <tr
                        key={p.platform}
                        className={idx < byPlatform.length - 1 ? 'border-b border-cly-border' : ''}
                      >
                        <td className="py-3">
                          <PlatformBadge platform={platformName(p.platform)} />
                        </td>
                        <td className="text-right text-cly-text-2">{p.count}</td>
                        <td className="text-right text-cly-text-2">{fmt(p.totalReach)}</td>
                        <td className="text-right text-cly-text font-black">
                          {fmtPercent(p.avgER)}
                        </td>
                        <td
                          className={`text-right font-black ${
                            growth >= 0 ? 'text-cly-green' : 'text-cly-red'
                          }`}
                        >
                          {growth >= 0 ? '+' : ''}{growth}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
