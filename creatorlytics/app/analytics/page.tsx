'use client';

import { useMemo } from 'react';
import { usePersistedState } from '@/lib/hooks/usePersistedState';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTitle, InsightCard, PlatformBadge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useUser } from '@/lib/hooks/useUser';
import { useTheme } from '@/lib/context/ThemeContext';
import { useGoals } from '@/lib/hooks/useGoals';
import {
  aggregateByPlatform, isPostInMonth,
  fmt, fmtPercent,
} from '@/lib/utils/analytics';
import { TrendingUp, BookOpen, AlertTriangle, Target } from 'lucide-react';
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from 'recharts';

export default function AnalyticsPage() {
  const { posts, loading } = usePosts();
  const { platforms } = usePlatforms();
  const { accounts } = useAccounts();
  const { profile } = useUser();
  const { resolvedTheme } = useTheme();
  const { goals, loading: goalsLoading } = useGoals();
  const erMode = profile?.er_mode || 'impression';

  const [selectedPlatform, setSelectedPlatform] = usePersistedState<string>('analytics_platform', 'all');
  const [selectedAccount, setSelectedAccount] = usePersistedState<string>('analytics_account', 'all');
  const [dateFrom, setDateFrom] = usePersistedState('analytics_dateFrom', '');
  const [dateTo, setDateTo] = usePersistedState('analytics_dateTo', '');
  const [chartView, setChartView] = usePersistedState<'daily' | 'monthly'>('analytics_chartView', 'daily');
  
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === selectedPlatform);
    }
    
    // Account filter
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(p => p.account === selectedAccount);
    }
    
    // Date range filter
    const effectiveDateFrom = dateFrom;
    const effectiveDateTo = dateTo;

    if (effectiveDateFrom) {
      filtered = filtered.filter(p => p.date && p.date >= effectiveDateFrom);
    }
    if (effectiveDateTo) {
      filtered = filtered.filter(p => p.date && p.date <= effectiveDateTo);
    }
    
    return filtered;
  }, [posts, selectedPlatform, selectedAccount, dateFrom, dateTo]);

  const byPlatform = useMemo(() => aggregateByPlatform(posts, erMode), [posts, erMode]);
  const { pillars } = usePillars();

  const chartData = useMemo(() => {
    // Determine effective dates for the chart specifically
    let chartDateFrom = dateFrom;
    let chartDateTo = dateTo;

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
      
      chartDateFrom = from.toISOString().split('T')[0];
      chartDateTo = to.toISOString().split('T')[0];
    }

    // Filter posts for the chart based on the effective dates
    let chartPosts = filteredPosts;
    if (chartDateFrom) {
      chartPosts = chartPosts.filter(p => p.date && p.date >= chartDateFrom);
    }
    if (chartDateTo) {
      chartPosts = chartPosts.filter(p => p.date && p.date <= chartDateTo);
    }

    if (chartView === 'monthly') {
      // Monthly aggregation
      const monthMap: Record<string, { reach: number; impression: number; engagement: number; count: number }> = {};
      
      chartPosts.forEach(p => {
        if (!p.date) return;
        const month = p.date.slice(0, 7); // "YYYY-MM"
        if (!monthMap[month]) {
          monthMap[month] = { reach: 0, impression: 0, engagement: 0, count: 0 };
        }
        monthMap[month].reach += p.reach || 0;
        monthMap[month].impression += p.impression || 0;
        monthMap[month].engagement += (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0);
        monthMap[month].count += 1;
      });
      
      const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
      const data = dateFrom || dateTo ? sorted : sorted.slice(-8);
      
      return data.map(([month, d]) => {
        const er = d.impression > 0 ? (d.engagement / d.impression) * 100 : 0;
        // Convert "YYYY-MM" to month name (e.g., "2026-08" → "Agu")
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('id-ID', { month: 'short' });
        
        return {
          label: monthName,
          reach: d.reach,
          impression: d.impression,
          er: parseFloat(er.toFixed(2)),
        };
      });
    } else {
      // Daily view
      const dailyMap: Record<string, { reach: number; impression: number; engagement: number }> = {};
      
      chartPosts.forEach(p => {
        if (!p.date) return;
        if (!dailyMap[p.date]) {
          dailyMap[p.date] = { reach: 0, impression: 0, engagement: 0 };
        }
        dailyMap[p.date].reach += p.reach || 0;
        dailyMap[p.date].impression += p.impression || 0;
        dailyMap[p.date].engagement += (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0);
      });
      
      return Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => {
          const er = d.impression > 0 ? (d.engagement / d.impression) * 100 : 0;
          return {
            label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            reach: d.reach,
            impression: d.impression,
            er: parseFloat(er.toFixed(2)),
          };
        });
    }
  }, [filteredPosts, chartView, dateFrom, dateTo]);

  const pillarData = useMemo(() => {
    const pillarMap: Record<string, { reach: number; impression: number; engagement: number }> = {};
    
    filteredPosts.forEach(p => {
      if (!p.pillar) return;
      if (!pillarMap[p.pillar]) {
        pillarMap[p.pillar] = { reach: 0, impression: 0, engagement: 0 };
      }
      pillarMap[p.pillar].reach += p.reach || 0;
      pillarMap[p.pillar].impression += p.impression || 0;
      pillarMap[p.pillar].engagement += (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0);
    });
    
    const COLORS = ['#A8E6CF', '#8EC5FC', '#FFB5A0', '#C5B9E8', '#FFE5B4', '#6ECDB0'];
    
    return Object.entries(pillarMap)
      .slice(0, 6)
      .map(([pillarName, data], i) => {
        const pillar = pillars.find(pl => pl.label === pillarName);
        const er = data.impression > 0 ? (data.engagement / data.impression) * 100 : 0;
        return {
          name: pillar?.label ?? pillarName,
          reach: data.reach,
          impression: data.impression,
          er: parseFloat(er.toFixed(2)),
          fill: pillar?.color || COLORS[i % COLORS.length],
        };
      })
      .sort((a, b) => b.er - a.er); // Sort by ER descending
  }, [filteredPosts, pillars]);



  const platformName = (id: string) => {
    const p = platforms.find((pl) => pl.platform_id === id);
    return p ? p.name : id;
  };



  // Calculate insights
  const topPlatform = byPlatform.length > 0
    ? byPlatform.reduce((best, curr) => (curr.avgER > best.avgER ? curr : best))
    : null;

  const warningInsight = useMemo(() => {
    if (loading) return "Mencari peringatan...";
    if (byPlatform.length === 0) return "Belum ada cukup data.";
    
    const now = new Date();
    const thisM = now.getMonth() + 1;
    const thisY = now.getFullYear();
    const prevM = thisM === 1 ? 12 : thisM - 1;
    const prevY = thisM === 1 ? thisY - 1 : thisY;

    for (const p of byPlatform) {
      const thisReach = posts.filter(po => po.platform === p.platform && isPostInMonth(po, thisY, thisM)).reduce((s, po) => s + po.reach, 0);
      const prevReach = posts.filter(po => po.platform === p.platform && isPostInMonth(po, prevY, prevM)).reduce((s, po) => s + po.reach, 0);
      if (prevReach > 0 && thisReach < prevReach) {
        const pObj = platforms.find((pl) => pl.platform_id === p.platform);
        const name = pObj ? pObj.name : p.platform;
        return `Performa reach di ${name} menurun bulan ini. Evaluasi ulang jam tayang atau format.`;
      }
    }
    return "Pertumbuhan reach positif di semua platform bulan ini. Pertahankan konsistensi!";
  }, [byPlatform, posts, loading, platforms]);
  


  return (
    <AppShell title="Analytics">
      <style jsx global>{`
        .analytics-typography h1,
        .analytics-typography h2,
        .analytics-typography h3,
        .analytics-typography div[class*="text-base"][class*="font-bold"][class*="tracking-tight"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .analytics-typography [class*="uppercase"][class*="tracking"],
        .analytics-typography th[class*="uppercase"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .analytics-typography button[class*="font-semibold"],
        .analytics-typography [class*="font-bold"]:not([class*="text-xs"]):not([class*="text-sm"]) {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .analytics-typography div[class*="font-bold"][class*="text-xs"],
        .analytics-typography div[class*="font-bold"][class*="text-sm"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .analytics-typography td[class*="font-bold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .analytics-typography p:not([class*="font-bold"]):not([class*="font-black"]):not([class*="font-semibold"]),
        .analytics-typography div[class*="leading-relaxed"],
        .analytics-typography span:not([class*="font-bold"]):not([class*="font-semibold"]),
        .analytics-typography .recharts-text {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-[18px] analytics-typography">
        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 sm:gap-2">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 px-3 flex-1 sm:flex-none border border-cly-border rounded-lg bg-white text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
              placeholder="Dari"
            />
            <span className="text-xs text-cly-text-3">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 px-3 flex-1 sm:flex-none border border-cly-border rounded-lg bg-white text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
              placeholder="Sampai"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="h-8 px-3 flex-1 sm:flex-none border border-cly-border rounded-lg bg-white text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all cursor-pointer"
            >
              <option value="all">Semua Akun</option>
              {accounts.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-8 px-3 flex-1 sm:flex-none border border-cly-border rounded-lg bg-white text-cly-text-2 text-xs font-medium outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all cursor-pointer"
            >
              <option value="all">All platforms</option>
              {platforms.map(p => (
                <option key={p.id} value={p.platform_id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Two Column: Trend Chart + Pillar Score */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_390px]">
          {/* Trend Chart Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <SectionTitle
                title="Tren Performa"
                note={chartView === 'monthly' ? 'Impression, Reach & ER per bulan' : 'Impression, Reach & ER per hari'}
              />
              
              {/* Chart controls */}
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex border border-cly-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setChartView('daily')}
                    className={`h-8 px-4 text-xs font-semibold transition-all ${
                      chartView === 'daily' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-white text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`h-8 px-4 text-xs font-semibold border-l border-cly-border transition-all ${
                      chartView === 'monthly' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-white text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="w-full h-80 bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface rounded-xl animate-pulse" />
            ) : chartData.length === 0 ? (
              <div className="h-[280px] bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface rounded-xl flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm font-semibold text-cly-text-2 mb-1">Belum ada data</p>
                <p className="text-sm text-cly-text-3">Tambahkan post untuk melihat tren.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: -24, bottom: 0 }}>
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
                    yAxisId="left" 
                    tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#A0AEC0', fontWeight: 500 }} 
                    tickFormatter={v => fmt(v)} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#A0AEC0', fontWeight: 500 }} 
                    tickFormatter={v => `${v}%`} 
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
                    formatter={(v, name) => {
                      if (name === 'er') return [`${v}%`, 'ER'];
                      return [fmt(Number(v)), name === 'impression' ? 'Impression' : 'Reach'];
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4, color: resolvedTheme === 'dark' ? '#FAFAFA' : '#4A5568' }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="impression" 
                    stroke={resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF', strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#18181B' : '#fff' }} 
                    activeDot={{ r: 7, strokeWidth: 3 }} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="reach" 
                    stroke={resolvedTheme === 'dark' ? '#A1A1AA' : '#8EC5FC'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#8EC5FC', strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#18181B' : '#fff' }} 
                    activeDot={{ r: 7, strokeWidth: 3 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="er" 
                    stroke={resolvedTheme === 'dark' ? '#71717A' : '#FFB5A0'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: resolvedTheme === 'dark' ? '#71717A' : '#FFB5A0', strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#18181B' : '#fff' }} 
                    activeDot={{ r: 7, strokeWidth: 3 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pillar Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <SectionTitle
              title="Performa Pilar"
              note="Impression & Reach per pilar"
            />
            {loading ? (
              <div className="w-full h-56 bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface rounded-xl animate-pulse" />
            ) : pillarData.length === 0 ? (
              <div className="h-[280px] bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface rounded-xl flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm font-semibold text-cly-text-2 mb-1">Belum ada data pilar</p>
                <p className="text-sm text-cly-text-3">Tambahkan pilar ke post Anda.</p>
              </div>
            ) : (
              <>
                {/* Impression & Reach Chart */}
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart 
                    data={pillarData} 
                    layout="vertical" 
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={resolvedTheme === 'dark' ? '#3F3F46' : '#E8ECEF'} 
                      horizontal={false} 
                    />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#A1A1AA' : '#A0AEC0', fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => fmt(v)}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#FAFAFA' : '#4A5568', fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false}
                      width={100}
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
                      formatter={(v, name) => [fmt(Number(v)), name === 'impression' ? 'Impression' : 'Reach']}
                    />
                    <Bar dataKey="impression" fill={resolvedTheme === 'dark' ? '#FAFAFA' : '#A8E6CF'} radius={[0, 8, 8, 0]} />
                    <Bar dataKey="reach" fill={resolvedTheme === 'dark' ? '#A1A1AA' : '#8EC5FC'} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* ER Chart */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-cly-text-2 mb-2">Engagement Rate (%)</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart 
                      data={pillarData} 
                      layout="vertical" 
                      margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={resolvedTheme === 'dark' ? '#2A3A2C' : '#E8ECEF'} 
                        horizontal={false} 
                      />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#96A899' : '#A0AEC0', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: resolvedTheme === 'dark' ? '#E3EDE4' : '#4A5568', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{ 
                          background: resolvedTheme === 'dark' ? '#161D17' : '#FFFFFF', 
                          border: `1px solid ${resolvedTheme === 'dark' ? '#2A3A2C' : '#E8ECEF'}`, 
                          borderRadius: 12, 
                          fontSize: 13,
                          fontWeight: 500,
                          padding: '8px 12px',
                          boxShadow: resolvedTheme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                          color: resolvedTheme === 'dark' ? '#E3EDE4' : '#1A1D23'
                        }}
                        formatter={(v) => [`${v}%`, 'ER']}
                      />
                      <Bar dataKey="er" fill={resolvedTheme === 'dark' ? '#71717A' : '#FFB5A0'} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        {/* What This Means - Three Insight Cards */}
        <div>
          <SectionTitle
            title="What this means"
            note="Three takeaways from the trend above, before you dig into the platform table."
          />
          
          <div className="grid gap-3 sm:grid-cols-3">
            <InsightCard
              icon={TrendingUp}
              title="Saran AI"
              text={
                loading
                  ? "Memproses insight..."
                  : topPlatform 
                    ? `Tingkatkan post di ${topPlatform.platform}, ER-nya tertinggi (${fmtPercent(topPlatform.avgER)}).`
                    : "Tambahkan data untuk insight performa platform."
              }
              tone="green"
              loading={loading}
            />
            <InsightCard
              icon={BookOpen}
              title="Pilar Populer"
              text={
                loading
                  ? "Menganalisis pilar..."
                  : pillarData.length > 0
                    ? `Konten "${pillarData[0].name}" paling interaktif. Kembangkan sub-topiknya.`
                    : "Tambahkan pilar konten di post."
              }
              tone="blue"
              loading={loading}
            />
            <InsightCard
              icon={AlertTriangle}
              title="Perlu Perhatian"
              text={warningInsight}
              tone="amber"
              loading={loading}
            />
          </div>
        </div>

        {/* Platform Breakdown Table */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <SectionTitle
            title="Rincian per platform"
            note="Data komprehensif performa platform"
          />
          
          <div className="overflow-x-auto overflow-y-hidden -mx-2 px-2">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-cly-border">
                  <th className="py-3 px-3 text-xs font-semibold text-cly-text-3 uppercase tracking-wider">Platform</th>
                  <th className="py-3 px-3 text-xs font-semibold text-cly-text-3 uppercase tracking-wider text-center">Reach</th>
                  <th className="py-3 px-3 text-xs font-semibold text-cly-text-3 uppercase tracking-wider text-center">Impression</th>
                  <th className="py-3 px-3 text-xs font-semibold text-cly-text-3 uppercase tracking-wider text-center">Engagement</th>
                  <th className="py-3 px-3 text-xs font-semibold text-cly-text-3 uppercase tracking-wider text-center">ER</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cly-text-3 animate-pulse">
                      Memuat data platform...
                    </td>
                  </tr>
                ) : byPlatform.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cly-text-3">
                      Belum ada data analitik.
                    </td>
                  </tr>
                ) : (
                  byPlatform.map((p, idx) => {
                    // Calculate engagement and ER for this platform
                    const platformPosts = filteredPosts.filter(post => post.platform === p.platform);
                    
                    // Total impression for this platform
                    const totalImpression = platformPosts.reduce((s, post) => s + (post.impression || 0), 0);
                    
                    // Total engagement (like + comment + share + save)
                    const totalEngagement = platformPosts.reduce((s, post) => 
                      s + (post.like || 0) + (post.comment || 0) + (post.share || 0) + (post.save || 0), 0
                    );
                    
                    // ER calculation based on erMode (impression or reach)
                    let er = 0;
                    if (erMode === 'impression' && totalImpression > 0) {
                      er = (totalEngagement / totalImpression) * 100;
                    } else if (erMode === 'reach' && p.totalReach > 0) {
                      er = (totalEngagement / p.totalReach) * 100;
                    }
                    
                    return (
                      <tr
                        key={p.platform}
                        className={idx < byPlatform.length - 1 ? 'border-b border-cly-border' : ''}
                      >
                        <td className="py-3">
                          <PlatformBadge platform={platformName(p.platform)} />
                        </td>
                        <td className="py-3 text-center text-cly-text-2 font-medium">{fmt(p.totalReach)}</td>
                        <td className="py-3 text-center text-cly-text-2 font-medium">{fmt(totalImpression)}</td>
                        <td className="py-3 text-center text-cly-text-2 font-medium">{fmt(totalEngagement)}</td>
                        <td className="py-3 text-center text-cly-text font-bold">
                          {fmtPercent(er)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <SectionTitle 
            title="Goals Progress" 
            note={selectedAccount === 'all' ? 'Semua Akun' : accounts.find(a => a.name === selectedAccount)?.name || selectedAccount}
          />
          {goalsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gradient-to-br from-cly-muted to-white rounded-xl p-4 h-[120px] animate-pulse" />
              ))}
            </div>
          ) : goals.filter(g => selectedAccount === 'all' || !g.account || g.account === 'all' || g.account === selectedAccount).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cly-muted to-white text-cly-text-3 flex items-center justify-center mb-3">
                <Target size={24} />
              </div>
              <p className="text-sm text-cly-text-3">Belum ada goal untuk filter ini.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {goals
                .filter(g => {
                  // Filter by account - more permissive
                  if (selectedAccount === 'all') {
                    // Show all goals when 'all' is selected
                    return true;
                  } else {
                    // Show goals for selected account OR goals for 'all' accounts
                    return !g.account || g.account === 'all' || g.account === selectedAccount;
                  }
                })
                .map(goal => {
                  // Calculate progress
                  const relevant = filteredPosts.filter(p => {
                    const matchMonth = isPostInMonth(p, goal.year, goal.month);
                    // Case-insensitive platform matching
                    const matchPlatform = goal.platform === 'all' || 
                      (p.platform && goal.platform && p.platform.toLowerCase() === goal.platform.toLowerCase());
                    const matchAccount = !goal.account || goal.account === 'all' || p.account === goal.account;
                    return matchMonth && matchPlatform && matchAccount;
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
                  } else if (goal.metric === 'engagement' || goal.metric === 'likes' || goal.metric === 'comments') {
                    // engagement = like + comment + share + save
                    actual = relevant.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0);
                  }
                  
                  const progress = goal.target > 0 ? Math.min((actual / goal.target) * 100, 100) : 0;
                  
                  // Format month name
                  const monthName = new Date(goal.year, goal.month - 1).toLocaleDateString('id-ID', { 
                    month: 'long',
                    year: 'numeric'
                  });
                  
                  return (
                    <div key={goal.id} className="bg-white border border-cly-border rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all">
                      {/* Header: Metric + Platform */}
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-base font-bold text-cly-text capitalize">{goal.metric}</span>
                        <span className="text-xs text-cly-text-3 uppercase font-semibold">
                          {goal.platform === 'all' ? 'ALL' : platformName(goal.platform)}
                        </span>
                      </div>
                      
                      {/* Target */}
                      <div className="mb-1">
                        <span className="text-xl font-bold text-cly-text">{fmt(goal.target)}</span>
                      </div>
                      
                      {/* Month */}
                      <div className="mb-3">
                        <span className="text-xs text-cly-text-3 font-medium">{monthName}</span>
                      </div>
                      
                      {/* Account (if applicable) */}
                      {goal.account && goal.account !== 'all' && (
                        <div className="text-xs text-cly-text-3 mb-2 font-medium">
                          Akun: {goal.account}
                        </div>
                      )}
                      
                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-cly-text-3 font-medium">Progress</span>
                          <span className="text-sm font-bold text-cly-text">{fmt(actual)} / {fmt(goal.target)}</span>
                        </div>
                        <div className="h-2 bg-cly-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cly-brand transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-right text-xs font-bold text-cly-brand">{fmtPercent(progress)}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
