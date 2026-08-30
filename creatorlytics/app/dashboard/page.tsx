'use client';

import { useMemo } from 'react';
import { usePersistedState } from '@/lib/hooks/usePersistedState';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard, InsightCard, SectionTitle } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { useUser } from '@/lib/hooks/useUser';
import { useTheme } from '@/lib/context/ThemeContext';
import { calcTotalER, fmt, isPostInMonth } from '@/lib/utils/analytics';
import { getValidHref } from '@/lib/utils/link';
import { PostThumbnail } from '@/components/cly/PostThumbnail';
import {
  Eye, TrendingUp, BookOpen, Target,
  ArrowUpRight, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { posts, loading: postsLoading } = usePosts();
  const { resolvedTheme } = useTheme();
  const { goals, loading: goalsLoading } = useGoals();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';
  const loading = postsLoading || goalsLoading;
  
  // Chart filters
  const [chartView, setChartView] = usePersistedState<'daily' | 'monthly'>('dashboard_chartView', 'daily');
  const [dateFrom, setDateFrom] = usePersistedState('dashboard_dateFrom', '');
  const [dateTo, setDateTo] = usePersistedState('dashboard_dateTo', '');
  
  // Goal carousel
  const [currentGoalIndex, setCurrentGoalIndex] = usePersistedState('dashboard_goalIndex', 0);

  const now = useMemo(() => new Date(), []);
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const metrics = useMemo(() => {
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + (p.reach || 0), 0);
    const totalImpression = posts.reduce((s, p) => s + (p.impression || 0), 0);
    const totalEngagement = posts.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.share || 0) + (p.save || 0), 0);
    const avgER = posts.length > 0 ? calcTotalER(posts, erMode) : 0;

    // Posts this month
    const activePosts = posts.filter(p => isPostInMonth(p, thisYear, thisMonth)).length;

    // Previous month reach for delta
    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear;
    const prevReach = posts
      .filter(p => isPostInMonth(p, prevYear, prevMonth))
      .reduce((s, p) => s + p.reach, 0);

    const thisMonthReach = posts
      .filter(p => isPostInMonth(p, thisYear, thisMonth))
      .reduce((s, p) => s + p.reach, 0);

    const reachDelta = prevReach > 0
      ? Math.round(((thisMonthReach - prevReach) / prevReach) * 100)
      : 0;

    // Goal confidence — % of active goals on track
    const activeGoals = goals.filter(g => g.month === thisMonth && g.year === thisYear);
    const onTrackGoals = activeGoals.filter(g => {
      const relevant = posts.filter(p => {
        const monthMatch = isPostInMonth(p, g.year, g.month);
        // Case-insensitive platform matching
        const platformMatch = g.platform === 'all' || 
          (p.platform && g.platform && p.platform.toLowerCase() === g.platform.toLowerCase());
        // Account filtering
        const accountMatch = !g.account || g.account === 'all' || p.account === g.account;
        return monthMatch && platformMatch && accountMatch;
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

    return { totalPosts, totalReach, totalImpression, totalEngagement, avgER, activePosts, reachDelta, goalConfidence };
  }, [posts, goals, erMode, thisMonth, thisYear, now]);

  // Chart data — last 6 months or filtered by date range
  const chartData = useMemo(() => {
    let filteredPosts = posts;
    let effectiveDateFrom = dateFrom;
    let effectiveDateTo = dateTo;

    // Apply default 7 days only for daily view if no date range is selected
    if (!dateFrom && !dateTo && chartView === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      let referenceDateStr = todayStr;

      // Find the most recent post date
      const mostRecentDateStr = filteredPosts.reduce((latest, p) => 
        (!latest || (p.date && p.date > latest)) ? (p.date as string) : latest
      , '');

      if (mostRecentDateStr) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        // If the most recent post is older than 7 days ago, use its date as the reference
        if (mostRecentDateStr < sevenDaysAgoStr) {
          referenceDateStr = mostRecentDateStr;
        }
      }

      const to = new Date(referenceDateStr);
      const from = new Date(to);
      from.setDate(to.getDate() - 6);
      
      effectiveDateFrom = from.toISOString().split('T')[0];
      effectiveDateTo = to.toISOString().split('T')[0];
    }
    
    // Apply date filters
    if (effectiveDateFrom) {
      filteredPosts = filteredPosts.filter(p => p.date && p.date >= effectiveDateFrom);
    }
    if (effectiveDateTo) {
      filteredPosts = filteredPosts.filter(p => p.date && p.date <= effectiveDateTo);
    }
    
    if (chartView === 'monthly') {
      // Monthly aggregation
      const monthMap: Record<string, { reach: number; impression: number }> = {};
      
      filteredPosts.forEach(p => {
        if (!p.date) return;
        const month = p.date.slice(0, 7); // "YYYY-MM"
        if (!monthMap[month]) {
          monthMap[month] = { reach: 0, impression: 0 };
        }
        monthMap[month].reach += p.reach || 0;
        monthMap[month].impression += p.impression || 0;
      });
      
      const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
      const data = dateFrom || dateTo ? sorted : sorted.slice(-6);
      
      return data.map(([month, data]) => {
        // Convert "YYYY-MM" to month name (e.g., "2026-08" → "Agustus")
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('id-ID', { month: 'short' });
        
        return {
          label: monthName,
          reach: data.reach,
          impression: data.impression,
        };
      });
    } else {
      // Daily view
      const dailyMap: Record<string, { reach: number; impression: number }> = {};
      
      filteredPosts.forEach(p => {
        if (!p.date) return;
        if (!dailyMap[p.date]) {
          dailyMap[p.date] = { reach: 0, impression: 0 };
        }
        dailyMap[p.date].reach += p.reach || 0;
        dailyMap[p.date].impression += p.impression || 0;
      });
      
      return Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          reach: data.reach,
          impression: data.impression,
        }));
    }
  }, [posts, chartView, dateFrom, dateTo]);

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


  const { totalPosts, totalReach, totalImpression, totalEngagement, avgER, reachDelta, goalConfidence } = metrics;

  return (
    <AppShell title="Dashboard">
      <style jsx global>{`
        /* ═══════════════════════════════════════════════════════════════
           Dashboard Typography System - Space Grotesk + DM Sans
           ═══════════════════════════════════════════════════════════════ */
        
        /* ─────────────────────────────────────────────────────────────
           PRIMARY FONT: Space Grotesk
           Used for: Headlines, KPI numbers, labels, navigation
           ───────────────────────────────────────────────────────────── */
        
        /* Page Title "Dashboard" at top */
        .dashboard-typography h1 {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Section headings (Performance Snapshot, Top 3 Content, Goal Progress) */
        .dashboard-typography h2,
        .dashboard-typography h3,
        .dashboard-typography div[class*="text-base"][class*="font-bold"][class*="tracking-tight"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Section subtitles in SectionTitle component */
        .dashboard-typography div[class*="text-sm"][class*="text-cly-text-3"][class*="leading-relaxed"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* KPI Card: Uppercase labels (TOTAL POSTS, TOTAL IMPRESSION, etc.) */
        .dashboard-typography [class*="uppercase"][class*="tracking"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        
        /* KPI Card: Large numbers (main metric values) */
        .dashboard-typography [class*="text-2xl"],
        .dashboard-typography [class*="text-3xl"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Top Content: Post titles (font-bold text-cly-text) */
        .dashboard-typography a[class*="font-bold"][class*="text-cly-text"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        
        /* Top Content: Post position numbers (1, 2, 3) */
        .dashboard-typography [class*="font-black"][class*="text-cly-text-3"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Top Content: Impression numbers (font-black text-cly-brand) */
        .dashboard-typography [class*="font-black"][class*="text-cly-brand"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Goal Progress: Percentage numbers in circle */
        .dashboard-typography [class*="text-xl"][class*="font-black"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        
        /* Goal Progress: Goal metric text (e.g., "1.2K / 5K Posts") */
        .dashboard-typography [class*="font-semibold"]:not([class*="text-xs"]):not([class*="text-sm"]) {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        
        /* Chart controls: Button text (Harian, Bulanan) */
        .dashboard-typography button[class*="font-semibold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        
        /* ─────────────────────────────────────────────────────────────
           SECONDARY FONT: DM Sans
           Used for: Body text, descriptions, subtitles, small labels
           ───────────────────────────────────────────────────────────── */
        
        /* KPI Card: Caption text (e.g., "On track", "No goals") */
        .dashboard-typography div[class*="text-xs"][class*="opacity-75"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* Insight cards: Titles (font-bold) */
        .dashboard-typography div[class*="font-bold"][class*="text-xs"],
        .dashboard-typography div[class*="font-bold"][class*="text-sm"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        
        /* Insight cards: Body text descriptions */
        .dashboard-typography div[class*="leading-relaxed"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        .dashboard-typography p:not([class*="font-bold"]):not([class*="font-black"]):not([class*="font-semibold"]) {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* Top Content: Platform/account text (instagram | @username) */
        .dashboard-typography p[class*="capitalize"][class*="text-cly-text-3"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* Goal Progress: Month badge text (e.g., "Agustus 2026") */
        .dashboard-typography span[class*="text-xs"][class*="uppercase"][class*="tracking-wider"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 500 !important;
        }
        
        /* Goal Progress: Platform/metric subtitle */
        .dashboard-typography p[class*="text-sm"][class*="text-cly-text-2"] {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* Chart: Axis labels and tooltips - handled by Recharts */
        .dashboard-typography .recharts-text {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
        
        /* Empty state messages */
        .dashboard-typography div[class*="text-center"] p {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[18px] dashboard-typography">

        {/* Spacer */}
        <div className="h-4 sm:h-6 lg:h-8" />

        {/* KPI Grid */}
        <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="Total Posts"
            value={fmt(totalPosts)}
            icon={BookOpen}
            tone="purple"
            loading={loading}
          />
          <MetricCard
            label="Total Impression"
            value={fmt(totalImpression)}
            icon={Eye}
            tone="amber"
            loading={loading}
          />
          <MetricCard
            label="Total Reach"
            value={fmt(totalReach)}
            delta={reachDelta || undefined}
            deltaLabel="%"
            icon={Eye}
            tone="green"
            loading={loading}
          />
          <MetricCard
            label="Total Engagement"
            value={fmt(totalEngagement)}
            icon={TrendingUp}
            tone="blue"
            loading={loading}
          />
          <MetricCard
            label="Average ER"
            value={`${avgER.toFixed(1)}%`}
            icon={TrendingUp}
            tone="coral"
            loading={loading}
          />
          <MetricCard
            label="Goal Progress"
            value={goalConfidence !== null ? `${goalConfidence}%` : 'N/A'}
            icon={Target}
            tone="green"
            caption={goalConfidence !== null ? "On track" : "No goals"}
            loading={loading}
          />
        </div>

        {/* Main Grid */}
        {/* Main Grid */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.35fr)_360px]">

          {/* Reach trend chart */}
          <div className="bg-white dark:bg-cly-surface rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
              <SectionTitle
                title="Performance Snapshot"
                note={chartView === 'monthly' ? 'Impression & Reach per bulan' : 'Impression & Reach per hari'}
              />
              
              {/* Chart controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Date filters - Hidden on mobile, shown on tablet+ */}
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="hidden sm:block h-8 px-3 border border-cly-border rounded-lg bg-white dark:bg-cly-surface text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
                  placeholder="Dari"
                />
                <span className="hidden sm:inline text-xs text-cly-text-3">-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="hidden sm:block h-8 px-3 border border-cly-border rounded-lg bg-white dark:bg-cly-surface text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
                  placeholder="Sampai"
                />
                
                {/* View toggle */}
                <div className="flex border border-cly-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setChartView('daily')}
                    className={`h-8 px-3 sm:px-4 text-xs font-semibold transition-all ${
                      chartView === 'daily' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-white dark:bg-cly-surface text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`h-8 px-3 sm:px-4 text-xs font-semibold border-l border-cly-border transition-all ${
                      chartView === 'monthly' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-white dark:bg-cly-surface text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-[200px] sm:h-[250px] bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface rounded-xl flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm font-semibold text-cly-text-2 mb-1">No performance data yet.</p>
                <p className="text-sm text-cly-text-3">Publish or sync content to start seeing insights.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 280}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpression" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF'} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolvedTheme === 'dark' ? '#71717A' : '#6ECDB0'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={resolvedTheme === 'dark' ? '#71717A' : '#6ECDB0'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={resolvedTheme === 'dark' ? '#3F3F46' : '#E8ECEF'} 
                    strokeOpacity={0.5} 
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#A0AEC0', fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    domain={(() => {
                      const allVals = chartData.flatMap(d => [d.impression, d.reach]).filter(v => v > 0);
                      if (allVals.length === 0) return [0, 1];
                      const min = Math.min(...allVals);
                      const max = Math.max(...allVals);
                      return [Math.max(0, Math.floor(min * 0.85)), Math.ceil(max * 1.05)];
                    })()}
                    tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#A0AEC0', fontWeight: 500 }} 
                    tickFormatter={v => fmt(v)} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: resolvedTheme === 'dark' ? '#18181B' : '#FFFFFF', 
                      border: `1px solid ${resolvedTheme === 'dark' ? '#3F3F46' : '#E8ECEF'}`, 
                      borderRadius: 12, 
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '8px 12px',
                      boxShadow: resolvedTheme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                      color: resolvedTheme === 'dark' ? '#FAFAFA' : '#1A1D23'
                    }}
                    formatter={(v, name) => [fmt(Number(v)), name === 'reach' ? 'Reach' : 'Impression']}
                    labelStyle={{ fontWeight: 600, marginBottom: 4, color: resolvedTheme === 'dark' ? '#FAFAFA' : '#4A5568' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="impression" 
                    stroke={resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF', strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#18181B' : '#fff' }} 
                    activeDot={{ r: 7, strokeWidth: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reach" 
                    stroke={resolvedTheme === 'dark' ? '#71717A' : '#6ECDB0'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: resolvedTheme === 'dark' ? '#71717A' : '#6ECDB0', strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#18181B' : '#fff' }} 
                    activeDot={{ r: 7, strokeWidth: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Insight cards */}
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3 mt-3 sm:mt-4">
              {loading ? (
                <div className="bg-white rounded-xl p-4 h-[90px] animate-pulse shadow-sm" />
              ) : topPlatformData ? (
                <InsightCard
                  icon={TrendingUp}
                  title="Best Performer"
                  text={`${topPlatformData.platform} generated the highest average ER at ${topPlatformData.avgER.toFixed(1)}%.`}
                  tone="green"
                />
              ) : (
                <InsightCard
                  icon={AlertTriangle}
                  title="Best Performer"
                  text="Not enough performance data to identify a best performer yet."
                  tone="amber"
                />
              )}

              {loading ? (
                <div className="bg-white rounded-xl p-4 h-[90px] animate-pulse shadow-sm" />
              ) : posts.length > 0 ? (
                <InsightCard
                  icon={AlertTriangle}
                  title="Biggest Opportunity"
                  text="Identify patterns in lower performing posts to improve future content."
                  tone="amber"
                />
              ) : (
                <InsightCard
                  icon={BookOpen}
                  title="Biggest Opportunity"
                  text="Not enough data yet."
                  tone="amber"
                />
              )}

              {loading ? (
                <div className="bg-white rounded-xl p-4 h-[90px] animate-pulse shadow-sm" />
              ) : bestPost ? (
                <InsightCard
                  icon={ArrowUpRight}
                  title="Recommended Action"
                  text={`Increase content similar to "${bestPost.name ? bestPost.name.substring(0, 20) + '...' : 'your best post'}" next month.`}
                  tone="blue"
                />
              ) : (
                <InsightCard
                  icon={ArrowUpRight}
                  title="Recommended Action"
                  text="Not enough data to generate recommendations yet."
                  tone="blue"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">

            {/* Top posts */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <SectionTitle title="Top 3 Content" note="3 post dengan impression tertinggi." />
              <div className="space-y-0">
                {loading ? (
                  <div className="space-y-3 py-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-2.5 items-center">
                        <div className="w-4 h-4 rounded bg-cly-border/50 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 bg-cly-border/50 rounded animate-pulse" />
                          <div className="h-2 w-1/2 bg-cly-border/50 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-cly-sm text-cly-text-3 py-4 text-center">Belum ada post.</p>
                ) : (
                  [...posts]
                    .sort((a, b) => b.impression - a.impression)
                    .slice(0, 3)
                    .map((post, idx) => (
                      <div key={post.id} className="flex gap-2.5 py-[10px] px-1 border-b border-cly-border last:border-0 items-center">
                        <span className="text-cly-micro font-black text-cly-text-3 w-4 shrink-0">{idx + 1}</span>
                        <PostThumbnail
                          name={post.name}
                          thumbnail={post.thumbnail}
                          platform={post.platform}
                          link={post.link}
                          size={36}
                        />
                        <div className="flex-1 min-w-0">
                          <a href={getValidHref(post.link)} target="_blank" rel="noopener noreferrer" className="block text-cly-base font-bold text-cly-text truncate hover:underline">
                            {post.name || 'Untitled'}
                          </a>
                          <p className="text-cly-sm text-cly-text-3 capitalize">
                            {post.platform}
                            {post.account && (
                              <>
                                <span className="mx-1">|</span>
                                <span>{post.account}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <span className="text-cly-sm font-black text-cly-brand shrink-0">{fmt(post.impression)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Active goals */}
            <div className="bg-white dark:bg-cly-surface rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <SectionTitle title="Goal Progress" note="Progress goal per bulan" />
              {loading ? (
                <div className="py-2">
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="size-20 sm:w-24 sm:h-24 rounded-full bg-cly-border/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-cly-border/50 rounded animate-pulse" />
                      <div className="h-6 sm:h-8 w-24 sm:w-28 bg-cly-border/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : goals.length === 0 ? (
                <div className="py-6 sm:py-8 text-center">
                  <p className="text-sm text-cly-text-3 mb-1">Belum ada goal.</p>
                  <p className="text-xs text-cly-text-3">Buat goal untuk mulai tracking progress.</p>
                </div>
              ) : (
                <>
                  {/* Current Goal Display */}
                  {(() => {
                    const goal = goals[currentGoalIndex];
                    if (!goal) return null;
                    
                    const monthName = new Date(goal.year, goal.month - 1).toLocaleDateString('id-ID', { 
                      month: 'long', 
                      year: 'numeric' 
                    });
                    
                    const relevant = posts.filter(p => {
                      const monthMatch = isPostInMonth(p, goal.year, goal.month);
                      const platformMatch = goal.platform === 'all' || 
                        (p.platform && goal.platform && p.platform.toLowerCase() === goal.platform.toLowerCase());
                      const accountMatch = !goal.account || goal.account === 'all' || p.account === goal.account;
                      return monthMatch && platformMatch && accountMatch;
                    });
                    
                    let actual = 0;
                    if (goal.metric === 'reach') {
                      actual = relevant.reduce((s, p) => s + (p.reach || 0), 0);
                    } else if (goal.metric === 'followers') {
                      actual = relevant.reduce((s, p) => s + (p.followers_gained || 0), 0);
                    } else if (goal.metric === 'posts') {
                      actual = relevant.length;
                    } else if (goal.metric === 'impression') {
                      actual = relevant.reduce((s, p) => s + (p.impression || 0), 0);
                    } else {
                      actual = relevant.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0);
                    }
                    
                    const pct = Math.min(goal.target > 0 ? Math.round((actual / goal.target) * 100) : 0, 100);
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (pct / 100) * circumference;
                    
                    return (
                      <div>
                        {/* Month Badge */}
                        <div className="flex items-center justify-center mb-4">
                          <span className="text-xs font-semibold text-cly-text-3 uppercase tracking-wider px-3 py-1 rounded-full bg-cly-muted">
                            {monthName}
                          </span>
                        </div>
                        
                        {/* Goal Display */}
                        <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-4">
                          {/* Circular Progress */}
                          <div className="relative size-20 sm:w-24 sm:h-24 shrink-0">
                            <svg className="size-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 88 88">
                              <circle
                                cx="44"
                                cy="44"
                                r={radius}
                                stroke={resolvedTheme === 'dark' ? '#3F3F46' : '#E8ECEF'}
                                strokeWidth="7"
                                fill="none"
                              />
                              <circle
                                cx="44"
                                cy="44"
                                r={radius}
                                stroke={
                                  resolvedTheme === 'dark' 
                                    ? (pct >= 80 ? "#4ADE80" : pct >= 50 ? "#60A5FA" : "#F87171")
                                    : (pct >= 80 ? "#6ECDB0" : pct >= 50 ? "#8EC5FC" : "#FFB5A0")
                                }
                                strokeWidth="7"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg sm:text-xl font-black text-cly-text">{pct}%</span>
                            </div>
                          </div>
                          
                          {/* Goal Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-cly-text mb-1.5 sm:mb-2 capitalize">{goal.metric}</p>
                            <p className="text-[10px] sm:text-xs text-cly-text-3 mb-1 sm:mb-1.5">Target: {fmt(goal.target)}</p>
                            <p className="text-lg sm:text-xl font-black text-cly-text tracking-tight">{fmt(actual)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-cly-border">
                    <button
                      onClick={() => setCurrentGoalIndex(prev => prev === 0 ? goals.length - 1 : prev - 1)}
                      disabled={goals.length <= 1}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-cly-text-2 hover:bg-cly-muted active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} className="sm:size-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    
                    <span className="text-xs text-cly-text-3 font-bold">
                      {currentGoalIndex + 1} / {goals.length}
                    </span>
                    
                    <button
                      onClick={() => setCurrentGoalIndex(prev => prev === goals.length - 1 ? 0 : prev + 1)}
                      disabled={goals.length <= 1}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-cly-text-2 hover:bg-cly-muted active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={14} className="sm:size-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
