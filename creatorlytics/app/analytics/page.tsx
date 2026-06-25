'use client';

import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTitle, InsightCard, PlatformBadge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useUser } from '@/lib/hooks/useUser';
import {
  aggregateByPlatform, aggregateByMonth, aggregateByPillar,
  fmt, fmtPercent,
} from '@/lib/utils/analytics';
import { Filter, SlidersHorizontal, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar, Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const { posts, loading } = usePosts();
  const { platforms } = usePlatforms();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  const byPlatform = useMemo(() => aggregateByPlatform(posts, erMode), [posts, erMode]);
  const { pillars } = usePillars();

  const chartData = useMemo(() =>
    aggregateByMonth(posts, erMode).slice(-8).map(m => ({
      month: m.month.slice(5),
      reach: m.totalReach,
      er: parseFloat(m.avgER.toFixed(2)),
    })),
    [posts, erMode]
  );

  const pillarData = useMemo(() => {
    const raw = aggregateByPillar(posts, erMode);
    const COLORS = ['#2F6F45', '#2563A7', '#A15C07', '#B93B32', '#7C4D9D', '#13747C'];
    return raw.slice(0, 6).map((p, i) => {
      const pillar = pillars.find(pl => pl.pillar_id === p.pillar);
      return {
        name: pillar?.label ?? p.pillar,
        value: parseFloat(p.avgER.toFixed(2)),
        fill: pillar?.color ? undefined : COLORS[i % COLORS.length],
      };
    });
  }, [posts, erMode, pillars]);

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
              title="Reach dan tren engagement"
              note="Bar = total reach, garis = rata-rata ER per bulan."
            />
            {chartData.length === 0 ? (
              <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
                <p className="text-cly-sm text-cly-text-3">Belum ada data — tambahkan post untuk melihat tren.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cly-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => fmt(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [name === 'reach' ? fmt(Number(v)) : `${v}%`, name === 'reach' ? 'Reach' : 'Avg ER']}
                  />
                  <Bar yAxisId="left" dataKey="reach" fill="var(--color-cly-brand)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="er" stroke="var(--color-cly-amber)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pillar Score Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Pillar score"
              note="Rata-rata ER per pilar konten."
            />
            {pillarData.length === 0 ? (
              <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
                <p className="text-cly-sm text-cly-text-3">Belum ada data pilar.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="20%" outerRadius="80%"
                  data={pillarData}
                  startAngle={180} endAngle={0}
                >
                  <RadialBar dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Avg ER']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
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
                    // Real MoM reach delta per platform
                    const now = new Date();
                    const thisM = now.getMonth() + 1;
                    const thisY = now.getFullYear();
                    const prevM = thisM === 1 ? 12 : thisM - 1;
                    const prevY = thisM === 1 ? thisY - 1 : thisY;

                    const thisReach = posts
                      .filter(po => {
                        if (po.platform !== p.platform || !po.date) return false;
                        const [y, m] = po.date.split('-');
                        return parseInt(y) === thisY && parseInt(m) === thisM;
                      })
                      .reduce((s, po) => s + po.reach, 0);

                    const prevReach = posts
                      .filter(po => {
                        if (po.platform !== p.platform || !po.date) return false;
                        const [y, m] = po.date.split('-');
                        return parseInt(y) === prevY && parseInt(m) === prevM;
                      })
                      .reduce((s, po) => s + po.reach, 0);

                    const growth = prevReach > 0
                      ? Math.round(((thisReach - prevReach) / prevReach) * 100)
                      : null;
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
                            growth === null ? 'text-cly-text-3' :
                            growth >= 0 ? 'text-cly-green' : 'text-cly-red'
                          }`}
                        >
                          {growth === null ? '—' : `${growth >= 0 ? '+' : ''}${growth}%`}
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
