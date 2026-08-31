'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTitle, PlatformBadge } from '@/components/cly';
import { ReportExport } from '@/components/report/ReportExport';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePillars } from '@/lib/hooks/usePillars';
import { useGoals } from '@/lib/hooks/useGoals';
import { calcTotalER, calcER, fmt, fmtPercent, aggregateByPlatform } from '@/lib/utils/analytics';
import { calcGoalProgress } from '@/lib/utils/insights';
import { getValidHref } from '@/lib/utils/link';
import { PostThumbnail } from '@/components/cly/PostThumbnail';
import { formatMonth, formatDate } from '@/lib/utils/formatting';
import { FileText, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportPage() {
  const { posts, loading } = usePosts();
  const { profile } = useUser();
  const { accounts } = useAccounts();
  const { pillars } = usePillars();
  const { goals } = useGoals();
  const erMode = profile?.er_mode || 'impression';
  const [activeTab, setActiveTab] = useState<'overview' | 'appendix'>('overview');

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const p of posts) {
      if (p.date) months.add(p.date.substring(0, 7));
    }
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchMonth = selectedMonth === 'all' || (p.date && p.date.substring(0, 7) === selectedMonth);
      const matchAccount = selectedAccount === 'all' || p.account === selectedAccount;
      return matchMonth && matchAccount;
    });
  }, [posts, selectedMonth, selectedAccount]);

  const totalPosts = filteredPosts.length;
  const totalReach = filteredPosts.reduce((s, p) => s + (p.reach || 0), 0);
  const totalFollowersGained = filteredPosts.reduce((s, p) => s + (p.followers_gained || 0), 0);
  const avgER = totalPosts > 0 ? calcTotalER(filteredPosts, erMode) : 0;

  // Evidence for AI & Growth
  const evidence = useMemo(() => {
    let prevPosts = 0;
    let prevReach = 0;
    let prevFollowers = 0;
    let hasValidBaseline = false;
    
    if (selectedMonth !== 'all') {
      const [y, m] = selectedMonth.split('-');
      let py = parseInt(y);
      let pm = parseInt(m) - 1;
      if (pm === 0) {
        pm = 12;
        py -= 1;
      }
      const prevMonthStr = `${py}-${String(pm).padStart(2, '0')}`;
      
      const prevPostsArr = posts.filter(p => p.date && p.date.startsWith(prevMonthStr) && (selectedAccount === 'all' || p.account === selectedAccount));
      prevPosts = prevPostsArr.length;
      if (prevPosts > 0) {
        hasValidBaseline = true;
        prevReach = prevPostsArr.reduce((s, po) => s + (po.reach || 0), 0);
        prevFollowers = prevPostsArr.reduce((s, po) => s + (po.followers_gained || 0), 0);
      }
    }
    
    const reachGrowth = hasValidBaseline && prevReach > 0 ? ((totalReach - prevReach) / prevReach) * 100 : null;
    const postsGrowth = hasValidBaseline && prevPosts > 0 ? ((totalPosts - prevPosts) / prevPosts) * 100 : null;
    const followersGrowth = hasValidBaseline && prevFollowers > 0 ? ((totalFollowersGained - prevFollowers) / prevFollowers) * 100 : null;
    
    return { hasValidBaseline, reachGrowth, postsGrowth, followersGrowth };
  }, [posts, selectedMonth, selectedAccount, totalReach, totalPosts, totalFollowersGained]);

  const dailyData = useMemo(() => {
    const dailyMap: Record<string, { reach: number; impression: number; engagement: number }> = {};
    filteredPosts.forEach(p => {
      if (!p.date) return;
      if (!dailyMap[p.date]) dailyMap[p.date] = { reach: 0, impression: 0, engagement: 0 };
      dailyMap[p.date].reach += p.reach || 0;
      dailyMap[p.date].impression += p.impression || 0;
      dailyMap[p.date].engagement += (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0);
    });
    return Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({
      label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      ...d
    }));
  }, [filteredPosts]);

  const platformData = useMemo(() => {
    const data = aggregateByPlatform(filteredPosts, erMode);
    
    let py = 0, pm = 0, hasBaseline = false;
    if (selectedMonth !== 'all') {
      const [y, m] = selectedMonth.split('-');
      py = parseInt(y);
      pm = parseInt(m) - 1;
      if (pm === 0) { pm = 12; py -= 1; }
      hasBaseline = true;
    }
    
    const augmented = data.map(pd => {
      let growth = null;
      if (hasBaseline) {
        const prevMonthStr = `${py}-${String(pm).padStart(2, '0')}`;
        const prevPosts = posts.filter(p => p.platform === pd.platform && p.date && p.date.startsWith(prevMonthStr) && (selectedAccount === 'all' || p.account === selectedAccount));
        const prevReach = prevPosts.reduce((s, p) => s + (p.reach || 0), 0);
        if (prevReach > 0) {
          growth = ((pd.totalReach - prevReach) / prevReach) * 100;
        }
      }
      return { ...pd, growth };
    });

    let bestPlatformId = '';
    let highestGrowthId = '';
    let lowestPerformerId = '';

    if (augmented.length > 0) {
      // Best Platform (by ER)
      const validEr = augmented.filter(p => p.count > 0);
      if (validEr.length > 0) {
        bestPlatformId = validEr.reduce((max, p) => p.avgER > max.avgER ? p : max).platform;
      }
      // Highest Growth
      const validGrowth = augmented.filter(p => p.growth !== null);
      if (validGrowth.length > 0) {
        highestGrowthId = validGrowth.reduce((max, p) => (p.growth as number) > (max.growth as number) ? p : max).platform;
      }
      // Lowest Performer (by Reach, requiring at least 2 platforms)
      if (augmented.length > 1) {
        lowestPerformerId = augmented.reduce((min, p) => p.totalReach < min.totalReach ? p : min).platform;
      }
    }

    return { platforms: augmented, bestPlatformId, highestGrowthId, lowestPerformerId };
  }, [filteredPosts, posts, selectedMonth, selectedAccount, erMode]);
  const topPosts = useMemo(() => {
    // Calculate overall score for each post (normalized metrics)
    return [...filteredPosts]
      .map(p => {
        const engagement = (p.like || 0) + (p.comment || 0) + (p.share || 0) + (p.save || 0);
        const er = calcER(p, erMode);
        // Overall score: weighted combination of normalized values
        // Higher weight for ER and engagement quality, not just views
        const score = 
          (p.impression || 0) * 0.2 + 
          (p.reach || 0) * 0.2 + 
          engagement * 2 + 
          er * 100;
        return { post: p, engagement, er, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [filteredPosts, erMode]);

  const pillarData = useMemo(() => {
    const grouped: Record<string, { count: number; impression: number; reach: number; engagement: number }> = {};
    for (const p of filteredPosts) {
      if (!p.pillar) continue;
      if (!grouped[p.pillar]) grouped[p.pillar] = { count: 0, impression: 0, reach: 0, engagement: 0 };
      grouped[p.pillar].count++;
      grouped[p.pillar].impression += (p.impression || 0);
      grouped[p.pillar].reach += (p.reach || 0);
      grouped[p.pillar].engagement += (p.like || 0) + (p.comment || 0) + (p.share || 0) + (p.save || 0);
    }
    return Object.entries(grouped).sort(([, a], [, b]) => b.reach - a.reach);
  }, [filteredPosts]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { posts: number; impression: number; reach: number; engagement: number; followers: number }> = {};
    for (const p of filteredPosts) {
      if (!p.date) continue;
      const month = p.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = { posts: 0, impression: 0, reach: 0, engagement: 0, followers: 0 };
      grouped[month].posts++;
      grouped[month].impression += (p.impression || 0);
      grouped[month].reach += (p.reach || 0);
      grouped[month].engagement += (p.like || 0) + (p.comment || 0) + (p.share || 0) + (p.save || 0);
      grouped[month].followers += (p.followers_gained || 0);
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPosts]);

  if (loading) {
    return (
      <AppShell title="Report">
        <div className="flex flex-col gap-[18px]">
          <div className="bg-gradient-to-br from-cly-muted to-white rounded-2xl p-6 h-96 animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.06)]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Report">
      <style jsx global>{`
        .report-typography h1,
        .report-typography h2,
        .report-typography h3,
        .report-typography h4,
        .report-typography div[class*="font-bold"][class*="text-"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .report-typography th[class*="uppercase"],
        .report-typography [class*="uppercase"][class*="tracking"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .report-typography button[class*="font-semibold"],
        .report-typography button[class*="font-bold"],
        .report-typography td[class*="font-black"],
        .report-typography span[class*="font-black"],
        .report-typography span[class*="font-bold"][class*="text-"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .report-typography p,
        .report-typography span:not([class*="font-bold"]):not([class*="font-black"]):not([class*="font-semibold"]),
        .report-typography td:not([class*="font-bold"]):not([class*="font-black"]),
        .report-typography li,
        .report-typography .recharts-text {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-[18px] report-typography">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap print:hidden">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 px-3 rounded-lg border border-cly-border bg-white text-cly-text-2 text-xs font-medium outline-none cursor-pointer focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
          >
            <option value="all">Semua Bulan</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-8 px-3 rounded-lg border border-cly-border bg-white text-cly-text-2 text-xs font-medium outline-none cursor-pointer focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
          >
            <option value="all">Semua Akun</option>
            {accounts.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Tabs + Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Tabs */}
          <div className="flex gap-1 bg-gradient-to-br from-cly-muted to-white p-1 border border-cly-border rounded-xl w-fit shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`h-8 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-cly-text shadow-sm'
                  : 'bg-transparent text-cly-text-2 hover:text-cly-text'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appendix')}
              className={`h-8 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'appendix'
                  ? 'bg-white text-cly-text shadow-sm'
                  : 'bg-transparent text-cly-text-2 hover:text-cly-text'
              }`}
            >
              Appendix
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="h-8 px-3 rounded-lg border border-cly-border bg-white text-cly-text-2 text-xs font-medium hover:bg-cly-muted transition-all inline-flex items-center gap-2 print:hidden shadow-sm"
            >
              <Printer size={14} />
              Print PDF
            </button>
            <div className="w-px h-8 bg-cly-border hidden sm:block" />
            <ReportExport posts={filteredPosts} />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-20 flex flex-col items-center justify-center text-center">
            <FileText className="size-12 text-cly-text-3 mb-4" />
            <p className="text-base font-bold text-cly-text-2 mb-1">No performance data yet.</p>
            <p className="text-sm text-cly-text-3">Publish or sync content to start seeing insights.</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-[18px]">
                {/* Summary Cards */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Executive Summary" note="Key metrics & comparison vs previous period" />
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-cly-text-3 uppercase font-semibold tracking-wide">Total Posts</span>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-cly-text">{totalPosts.toLocaleString('id-ID')}</span>
                        {evidence.postsGrowth !== null ? (
                          <span className={`text-sm font-semibold mb-1 ${evidence.postsGrowth >= 0 ? 'text-[#6ECDB0]' : 'text-[#FFB5A0]'}`}>
                            {evidence.postsGrowth > 0 ? '+' : ''}{evidence.postsGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-cly-text-3 mb-1">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-cly-text-3 uppercase font-semibold tracking-wide">Total Reach</span>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-cly-text">{fmt(totalReach)}</span>
                        {evidence.reachGrowth !== null ? (
                          <span className={`text-sm font-semibold mb-1 ${evidence.reachGrowth >= 0 ? 'text-[#6ECDB0]' : 'text-[#FFB5A0]'}`}>
                            {evidence.reachGrowth > 0 ? '+' : ''}{evidence.reachGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-cly-text-3 mb-1">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-cly-text-3 uppercase font-semibold tracking-wide">Avg ER</span>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-cly-text">{fmtPercent(avgER)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-cly-text-3 uppercase font-semibold tracking-wide">Followers</span>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-cly-text">{fmt(totalFollowersGained)}</span>
                        {evidence.followersGrowth !== null ? (
                          <span className={`text-sm font-semibold mb-1 ${evidence.followersGrowth >= 0 ? 'text-[#6ECDB0]' : 'text-[#FFB5A0]'}`}>
                            {evidence.followersGrowth > 0 ? '+' : ''}{evidence.followersGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-cly-text-3 mb-1">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Executive Insights */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Executive Insights" note="Auto-generated narrative based on data" />
                  <div className="space-y-3 mt-4 text-sm text-cly-text-2 bg-gradient-to-br from-cly-muted to-white p-4 rounded-xl border border-cly-border/50">
                    {totalPosts === 0 ? (
                      <p>Not enough data to generate reliable insights yet.</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2">
                        {evidence.hasValidBaseline && evidence.reachGrowth !== null ? (
                          <li><strong className="text-cly-text">Reach {evidence.reachGrowth >= 0 ? 'increased' : 'decreased'} {Math.abs(evidence.reachGrowth).toFixed(1)}%</strong> compared with the previous period.</li>
                        ) : (
                          <li><strong className="text-cly-text">Total Reach: {fmt(totalReach)}</strong> for this period. (No previous baseline to compare).</li>
                        )}
                        
                        {platformData.platforms.length > 0 && (
                          <li>Growth was primarily driven by <strong>{platformData.platforms[0].platform} content</strong> (generated {fmt(platformData.platforms[0].totalReach)} reach).</li>
                        )}
                        
                        {pillarData.length > 0 && (
                          <li><strong>{pillarData[0][0]} content</strong> generated the highest engagement.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Performance Overview (Charts) */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Performance Overview" note="Trend chart untuk metrik utama" />
                  
                  {dailyData.length === 0 ? (
                    <div className="h-[250px] mt-4 bg-gradient-to-br from-cly-muted to-white rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <p className="text-sm font-semibold text-cly-text-2 mb-1">No performance data yet.</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cly-border)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => fmt(v)} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                            formatter={(v, name) => [fmt(Number(v)), name === 'reach' ? 'Reach' : name === 'impression' ? 'Impression' : 'Engagement']}
                          />
                          <Line type="monotone" dataKey="impression" stroke="var(--color-cly-green)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-cly-green)", strokeWidth: 0 }} />
                          <Line type="monotone" dataKey="reach" stroke="var(--color-cly-brand)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-cly-brand)", strokeWidth: 0 }} />
                          <Line type="monotone" dataKey="engagement" stroke="var(--color-cly-amber)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-cly-amber)", strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Platform Performance */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Platform Performance" note="Breakdown per platform" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Engagement</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Avg ER</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformData.platforms.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data platform.</td>
                          </tr>
                        ) : (
                          platformData.platforms.map((pd, idx) => (
                            <tr key={pd.platform} className={idx < platformData.platforms.length - 1 ? 'border-b border-cly-border' : ''}>
                              <td className="py-3">
                                <div className="flex flex-col items-start gap-1">
                                  <PlatformBadge platform={pd.platform} />
                                  <div className="flex gap-1 flex-wrap">
                                    {platformData.bestPlatformId === pd.platform && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cly-green/20 text-cly-green">Best Platform</span>
                                    )}
                                    {platformData.highestGrowthId === pd.platform && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cly-brand/20 text-cly-brand">Highest Growth</span>
                                    )}
                                    {platformData.lowestPerformerId === pd.platform && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cly-amber/20 text-cly-amber">Lowest Performer</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{pd.count}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(pd.totalImpression)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(pd.totalReach)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(pd.totalEngagement)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text font-black">{fmtPercent(pd.avgER)}</td>
                              <td className="py-3 text-center text-cly-sm font-black">
                                {pd.growth !== null ? (
                                  <span className={pd.growth >= 0 ? 'text-cly-green' : 'text-cly-amber'}>
                                    {pd.growth > 0 ? '+' : ''}{pd.growth.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-cly-text-3">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Content */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Top Performing Content" note="Best performing posts by overall score" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Title</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Engagement</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPosts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada konten.</td>
                          </tr>
                        ) : (
                          topPosts.map(({ post: p, engagement, er }, idx) => (
                            <tr key={p.id} className={idx < topPosts.length - 1 ? 'border-b border-cly-border' : ''}>
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <PostThumbnail
                                    name={p.name}
                                    thumbnail={p.thumbnail}
                                    platform={p.platform}
                                    link={p.link}
                                    size={36}
                                  />
                                  <a href={getValidHref(p.link)} target="_blank" rel="noopener noreferrer" className="text-cly-sm text-cly-text font-semibold max-w-xs truncate hover:underline">
                                    {p.name || 'Untitled'}
                                  </a>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <PlatformBadge platform={p.platform} />
                                  {selectedAccount === 'all' && p.account && (
                                    <>
                                      <span className="text-cly-xs text-cly-text-3">|</span>
                                      <span className="text-cly-xs text-cly-text-3">{p.account}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.impression)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.reach)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(engagement)}</td>
                              <td className="py-3 text-center text-cly-sm text-cly-text font-black">{fmtPercent(er)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Content Pillar Breakdown */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Content Pillar Summary" note="Distribution konten berdasarkan pilar" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Pillar</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Engagement</th>
                          <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pillarData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data pillar.</td>
                          </tr>
                        ) : (
                          pillarData.map(([pillarId, data], idx) => {
                            const pillar = pillars.find(p => p.pillar_id === pillarId);
                            // Calculate ER for this pillar
                            const er = erMode === 'impression' && data.impression > 0
                              ? (data.engagement / data.impression) * 100
                              : erMode === 'reach' && data.reach > 0
                              ? (data.engagement / data.reach) * 100
                              : 0;
                            
                            return (
                              <tr key={pillarId} className={idx < pillarData.length - 1 ? 'border-b border-cly-border' : ''}>
                                <td className="py-3">
                                  <span className="inline-flex items-center gap-1.5 text-cly-sm font-semibold">
                                    {pillar?.emoji && <span>{pillar.emoji}</span>}
                                    <span>{pillar?.label || pillarId}</span>
                                  </span>
                                </td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{data.count}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.impression)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.reach)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.engagement)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text font-black">{fmtPercent(er)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Goals Summary */}
                {goals.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                    <SectionTitle title="Goal / KPI Summary" note="Status pencapaian goals" />
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {goals.map(goal => {
                        const current = calcGoalProgress(goal, posts);
                        const progress = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
                        
                        // Calculate status
                        let status = "On Track";
                        if (progress >= 100) {
                          status = "Achieved";
                        } else {
                          // Simple pace logic based on current day of month
                          const now = new Date();
                          if (selectedMonth === 'all' || (goal.year === now.getFullYear() && goal.month === now.getMonth() + 1)) {
                            const daysPassed = now.getDate();
                            const daysInMonth = new Date(goal.year, goal.month, 0).getDate();
                            const expectedPct = (daysPassed / daysInMonth) * 100;
                            if (progress < expectedPct * 0.8) {
                              status = "At Risk";
                            }
                          } else if (goal.year < now.getFullYear() || (goal.year === now.getFullYear() && goal.month < now.getMonth() + 1)) {
                            // Past month and not achieved
                            status = "At Risk";
                          }
                        }
                        
                        return (
                          <div key={goal.id} className="border border-cly-border rounded-lg p-2.5 bg-white shadow-sm hover:shadow-md transition-all">
                            {/* Header: Metric Name + Progress Badge */}
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex-1">
                                <h4 className="text-xs font-bold text-cly-text capitalize">{goal.metric}</h4>
                                <p className="text-[10px] text-cly-text-3 font-medium mt-0.5 capitalize">{goal.platform === 'all' ? 'Semua Platform' : goal.platform}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${
                                progress >= 80 ? 'bg-gradient-to-br from-[#A8E6CF] to-[#6ECDB0]' :
                                progress >= 50 ? 'bg-gradient-to-br from-[#8EC5FC] to-[#6BA3E8]' :
                                'bg-gradient-to-br from-[#FFB5A0] to-[#FF9680]'
                              }`}>
                                {fmtPercent(progress)}
                              </span>
                            </div>

                            {/* Account (if applicable) */}
                            {goal.account && goal.account !== 'all' && (
                              <div className="text-[10px] text-cly-text-3 mb-1.5 font-medium">
                                Akun: {goal.account}
                              </div>
                            )}
                            
                            {/* Current & Target */}
                            <div className="space-y-0.5 mb-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-cly-text-3 font-medium">Current</span>
                                <span className="text-sm font-bold text-cly-text">{fmt(current)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-cly-text-3 font-medium">Target</span>
                                <span className="text-sm font-semibold text-cly-text-2">{fmt(goal.target)}</span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-1 bg-cly-muted rounded-full overflow-hidden mb-1.5">
                              <div 
                                className={`h-full transition-all ${
                                  progress >= 80 ? 'bg-gradient-to-r from-[#A8E6CF] to-[#6ECDB0]' :
                                  progress >= 50 ? 'bg-gradient-to-r from-[#8EC5FC] to-[#6BA3E8]' :
                                  'bg-gradient-to-r from-[#FFB5A0] to-[#FF9680]'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            
                            {/* Footer: Due Date + Status */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-cly-border">
                              <span className="text-[10px] text-cly-text-3 font-medium">
                                Due: {new Date(goal.year, goal.month - 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                status === 'Achieved' ? 'bg-[#A8E6CF]/20 text-[#197B3A]' :
                                status === 'On Track' ? 'bg-[#8EC5FC]/20 text-[#2563A7]' :
                                'bg-[#FFB5A0]/20 text-[#B93B32]'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appendix Tab */}
            {activeTab === 'appendix' && (
              <div className="flex flex-col gap-[18px]">
                {/* Monthly Trend */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="Monthly Trend" note="Historical data per bulan" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Month</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Engagement</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">ER</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Followers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data bulanan.</td>
                          </tr>
                        ) : (
                          monthlyData.map(([month, data], idx) => {
                            // Calculate ER for the month
                            const er = erMode === 'impression' && data.impression > 0
                              ? (data.engagement / data.impression) * 100
                              : erMode === 'reach' && data.reach > 0
                              ? (data.engagement / data.reach) * 100
                              : 0;
                            
                            return (
                              <tr key={month} className={idx < monthlyData.length - 1 ? 'border-b border-cly-border' : ''}>
                                <td className="py-3 text-cly-sm text-cly-text font-semibold">{formatMonth(month)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{data.posts}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.impression)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.reach)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.engagement)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text font-bold">{fmtPercent(er)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(data.followers)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Complete Posts List */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <SectionTitle title="All Posts Detail" note="Semua konten dengan metrics lengkap" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Title</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          {selectedAccount === 'all' && (
                            <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Account</th>
                          )}
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Date</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Like</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Comment</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">Share</th>
                          <th className="text-center text-cly-micro font-semibold text-cly-text-3 uppercase tracking-wider py-3">ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPosts.length === 0 ? (
                          <tr>
                            <td colSpan={selectedAccount === 'all' ? 10 : 9} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data konten.</td>
                          </tr>
                        ) : (
                          filteredPosts.map((p, idx) => {
                            const er = calcER(p, erMode);
                            return (
                              <tr key={p.id} className={idx < filteredPosts.length - 1 ? 'border-b border-cly-border' : ''}>
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                   {/* Thumbnail Link */}
                                   <PostThumbnail
                                     name={p.name}
                                     thumbnail={p.thumbnail}
                                     platform={p.platform}
                                     link={p.link}
                                     size={36}
                                   />
                                    <a href={getValidHref(p.link)} target="_blank" rel="noopener noreferrer" className="text-cly-sm text-cly-text font-semibold max-w-xs truncate hover:underline">
                                      {p.name || 'Untitled'}
                                    </a>
                                  </div>
                                </td>
                                <td className="py-3 text-center"><PlatformBadge platform={p.platform} /></td>
                                {selectedAccount === 'all' && (
                                  <td className="py-3 text-center text-cly-sm text-cly-text-2">{p.account || '-'}</td>
                                )}
                                <td className="py-3 text-center text-cly-xs text-cly-text-2">
                                  {p.date ? formatDate(p.date) : '-'}
                                </td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.impression)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.reach)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.like)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.comment)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text-2">{fmt(p.share)}</td>
                                <td className="py-3 text-center text-cly-sm text-cly-text font-bold">{fmtPercent(er)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
