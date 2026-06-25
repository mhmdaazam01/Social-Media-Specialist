'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard, InsightCard, SectionTitle, Badge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { useUser } from '@/lib/hooks/useUser';
import { calcTotalER, fmt, aggregateByMonth } from '@/lib/utils/analytics';
import { currentMonth, currentYear } from '@/lib/utils/formatting';
import {
  Eye, TrendingUp, BookOpen, Target,
  ArrowUpRight, AlertTriangle, CheckCircle2, Clock, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { posts, loading: postsLoading } = usePosts();
  const { goals, loading: goalsLoading } = useGoals();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';
  const loading = postsLoading || goalsLoading;

  const now = new Date();
  const thisMonth = currentMonth();
  const thisYear = currentYear();

  const metrics = useMemo(() => {
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const avgER = posts.length > 0 ? calcTotalER(posts, erMode) : 0;

    // Posts this month — use p.date instead of created_at
    const activePosts = posts.filter(p => {
      if (!p.date) return false;
      const [y, m] = p.date.split('-');
      return parseInt(y) === thisYear && parseInt(m) === thisMonth;
    }).length;

    // Previous month reach for delta
    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear;
    const prevReach = posts
      .filter(p => {
        if (!p.date) return false;
        const [y, m] = p.date.split('-');
        return parseInt(y) === prevYear && parseInt(m) === prevMonth;
      })
      .reduce((s, p) => s + p.reach, 0);

    const thisMonthReach = posts
      .filter(p => {
        if (!p.date) return false;
        const [y, m] = p.date.split('-');
        return parseInt(y) === thisYear && parseInt(m) === thisMonth;
      })
      .reduce((s, p) => s + p.reach, 0);

    const reachDelta = prevReach > 0
      ? Math.round(((thisMonthReach - prevReach) / prevReach) * 100)
      : 0;

    // Goal confidence — % of active goals on track
    const activeGoals = goals.filter(g => g.month === thisMonth && g.year === thisYear);
    const onTrackGoals = activeGoals.filter(g => {
      const relevant = posts.filter(p => {
        if (!p.date) return false;
        const [py, pm] = p.date.split('-');
        return parseInt(py) === g.year && parseInt(pm) === g.month
          && (g.platform === 'all' || p.platform === g.platform);
      });
      let actual = 0;
      if (g.metric === 'reach') actual = relevant.reduce((s, p) => s + p.reach, 0);
      else if (g.metric === 'followers') actual = relevant.reduce((s, p) => s + p.followers_gained, 0);
      else if (g.metric === 'posts') actual = relevant.length;
      else if (g.metric === 'impression') actual = relevant.reduce((s, p) => s + p.impression, 0);
      else actual = relevant.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
      const pct = g.target > 0 ? (actual / g.target) * 100 : 0;
      const daysPassed = now.getDate();
      const daysInMonth = new Date(g.year, g.month, 0).getDate();
      const expectedPct = (daysPassed / daysInMonth) * 100;
      return pct >= expectedPct * 0.8; // within 80% of expected pace
    });
    const goalConfidence = activeGoals.length > 0
      ? Math.round((onTrackGoals.length / activeGoals.length) * 100)
      : null;

    return { totalPosts, totalReach, avgER, activePosts, reachDelta, goalConfidence };
  }, [posts, goals, erMode, thisMonth, thisYear, now]);

  // Chart data — last 6 months
  const chartData = useMemo(() => {
    const byMonth = aggregateByMonth(posts, erMode);
    return byMonth.slice(-6).map(m => ({
      month: m.month.slice(5), // "YYYY-MM" → "MM"
      reach: m.totalReach,
      er: parseFloat(m.avgER.toFixed(2)),
    }));
  }, [posts, erMode]);

  // Best post (no mutation)
  const bestPost = useMemo(
    () => posts.length > 0 ? [...posts].sort((a, b) => b.reach - a.reach)[0] : null,
    [posts]
  );

  // Top platform by ER
  const topPlatformData = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    posts.forEach(p => {
      if (!map[p.platform]) map[p.platform] = { sum: 0, count: 0 };
      const er = p.impression > 0 ? ((p.like + p.comment + p.save + p.share) / p.impression) * 100 : 0;
      map[p.platform].sum += er;
      map[p.platform].count += 1;
    });
    return Object.entries(map)
      .map(([platform, d]) => ({ platform, avgER: d.count > 0 ? d.sum / d.count : 0 }))
      .sort((a, b) => b.avgER - a.avgER)[0] ?? null;
  }, [posts]);

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex flex-col gap-[18px]">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 min-h-[120px] animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const { totalReach, avgER, activePosts, reachDelta, goalConfidence } = metrics;

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-[18px]">

        {/* Status strip */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-cly-sm text-cly-text-2">
            <span className="w-[7px] h-[7px] rounded-full bg-cly-green" />
            Live data · {now.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="neutral">{now.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</Badge>
            <Badge tone="blue">All platforms</Badge>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Reach"
            value={fmt(totalReach)}
            delta={reachDelta || undefined}
            deltaLabel="%"
            icon={Eye}
            tone="green"
            caption="Dari semua postingan"
          />
          <MetricCard
            label="Rata-rata ER"
            value={`${avgER.toFixed(1)}%`}
            icon={TrendingUp}
            tone="blue"
            caption={`Mode: ${erMode}`}
          />
          <MetricCard
            label="Post bulan ini"
            value={activePosts.toString()}
            icon={BookOpen}
            tone="amber"
            caption={now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          />
          <MetricCard
            label="Goal confidence"
            value={goalConfidence !== null ? `${goalConfidence}%` : '—'}
            icon={Target}
            tone={goalConfidence !== null && goalConfidence >= 70 ? 'green' : 'amber'}
            caption={goalConfidence !== null ? 'Goal bulan ini on-track' : 'Belum ada goal aktif'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.35fr)_360px]">

          {/* Reach trend chart */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Tren Reach"
              note="Reach per bulan dari 6 bulan terakhir."
            />
            {chartData.length === 0 ? (
              <div className="h-[250px] bg-cly-muted rounded-lg flex items-center justify-center">
                <p className="text-cly-sm text-cly-text-3">Belum ada data — tambahkan post untuk melihat tren.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cly-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => fmt(v)} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [fmt(Number(v)), 'Reach']}
                  />
                  <Bar dataKey="reach" fill="var(--color-cly-brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Insight cards */}
            <div className="grid gap-2.5 sm:grid-cols-3 mt-3">
              <InsightCard
                icon={ArrowUpRight}
                title="Post terbaik"
                text={bestPost
                  ? `"${bestPost.name || 'Untitled'}" — ${fmt(bestPost.reach)} reach. Repurpose ke platform lain.`
                  : 'Tambahkan post untuk melihat insight.'}
                tone="green"
              />
              <InsightCard
                icon={AlertTriangle}
                title="Perhatian"
                text={avgER < 2
                  ? 'ER di bawah 2% — coba variasikan format konten untuk meningkatkan interaksi.'
                  : 'ER dalam kondisi baik. Pertahankan konsistensi posting.'}
                tone="amber"
              />
              <InsightCard
                icon={CheckCircle2}
                title="Next step"
                text={topPlatformData
                  ? `${topPlatformData.platform} punya ER tertinggi (${topPlatformData.avgER.toFixed(1)}%). Perbanyak konten di platform ini.`
                  : 'Tambahkan lebih banyak post untuk melihat rekomendasi platform.'}
                tone="blue"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3.5">

            {/* Top posts */}
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
              <SectionTitle title="Top konten" note="5 post dengan reach tertinggi." />
              <div className="space-y-0">
                {posts.length === 0 ? (
                  <p className="text-cly-sm text-cly-text-3 py-4 text-center">Belum ada post.</p>
                ) : (
                  [...posts]
                    .sort((a, b) => b.reach - a.reach)
                    .slice(0, 5)
                    .map((post, idx) => (
                      <div key={post.id} className="flex gap-2.5 py-[10px] px-1 border-b border-cly-border last:border-0">
                        <span className="text-cly-micro font-black text-cly-text-3 w-4 shrink-0 pt-0.5">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cly-base font-bold text-cly-text truncate">{post.name || 'Untitled'}</p>
                          <p className="text-cly-sm text-cly-text-3 capitalize">{post.platform}</p>
                        </div>
                        <span className="text-cly-sm font-black text-cly-brand shrink-0">{fmt(post.reach)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Active goals */}
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
              <SectionTitle title="Goals aktif" note={`Bulan ${now.toLocaleDateString('id-ID', { month: 'long' })}`} />
              {goals.filter(g => g.month === thisMonth && g.year === thisYear).length === 0 ? (
                <p className="text-cly-sm text-cly-text-3 py-4 text-center">Belum ada goal bulan ini.</p>
              ) : (
                <div className="space-y-3">
                  {goals
                    .filter(g => g.month === thisMonth && g.year === thisYear)
                    .slice(0, 3)
                    .map(goal => {
                      const relevant = posts.filter(p => {
                        if (!p.date) return false;
                        const [py, pm] = p.date.split('-');
                        return parseInt(py) === goal.year && parseInt(pm) === goal.month
                          && (goal.platform === 'all' || p.platform === goal.platform);
                      });
                      let actual = 0;
                      if (goal.metric === 'reach') actual = relevant.reduce((s, p) => s + p.reach, 0);
                      else if (goal.metric === 'followers') actual = relevant.reduce((s, p) => s + p.followers_gained, 0);
                      else if (goal.metric === 'posts') actual = relevant.length;
                      else actual = relevant.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
                      const pct = Math.min(goal.target > 0 ? Math.round((actual / goal.target) * 100) : 0, 100);
                      return (
                        <div key={goal.id}>
                          <div className="flex justify-between text-cly-sm mb-1">
                            <span className="font-semibold text-cly-text truncate">{goal.label}</span>
                            <span className="font-black text-cly-text-2 shrink-0 ml-2">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-cly-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cly-brand transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
