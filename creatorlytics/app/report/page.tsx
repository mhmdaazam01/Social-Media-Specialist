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
import { calcTotalER, fmt, fmtPercent, aggregateByPlatform } from '@/lib/utils/analytics';
import { formatMonth } from '@/lib/utils/formatting';
import { FileText, Printer } from 'lucide-react';

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
  const totalReach = filteredPosts.reduce((s, p) => s + p.reach, 0);
  const totalFollowersGained = filteredPosts.reduce((s, p) => s + p.followers_gained, 0);
  const avgER = totalPosts > 0 ? calcTotalER(filteredPosts, erMode) : 0;

  const platformData = useMemo(() => aggregateByPlatform(filteredPosts, erMode), [filteredPosts, erMode]);
  const topPosts = useMemo(() => [...filteredPosts].sort((a, b) => b.reach - a.reach).slice(0, 5), [filteredPosts]);

  const pillarData = useMemo(() => {
    const grouped: Record<string, { count: number; reach: number; engagement: number }> = {};
    for (const p of filteredPosts) {
      if (!p.pillar) continue;
      if (!grouped[p.pillar]) grouped[p.pillar] = { count: 0, reach: 0, engagement: 0 };
      grouped[p.pillar].count++;
      grouped[p.pillar].reach += p.reach;
      grouped[p.pillar].engagement += p.like + p.comment + p.share;
    }
    return Object.entries(grouped).sort(([, a], [, b]) => b.reach - a.reach);
  }, [filteredPosts]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { posts: number; reach: number; followers: number }> = {};
    for (const p of filteredPosts) {
      if (!p.date) continue;
      const month = p.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = { posts: 0, reach: 0, followers: 0 };
      grouped[month].posts++;
      grouped[month].reach += p.reach;
      grouped[month].followers += p.followers_gained;
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPosts]);

  if (loading) {
    return (
      <AppShell title="Report">
        <div className="flex flex-col gap-[18px]">
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px] h-96 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Report">
      <div className="flex flex-col gap-[18px]">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap print:hidden">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none cursor-pointer"
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
          <div className="flex gap-1.5 bg-cly-muted p-1 border border-cly-border rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`h-[30px] px-3.5 rounded text-cly-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-cly-surface text-cly-text shadow-sm'
                  : 'bg-transparent text-cly-text-2 hover:text-cly-text'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appendix')}
              className={`h-[30px] px-3.5 rounded text-cly-sm font-semibold transition-all ${
                activeTab === 'appendix'
                  ? 'bg-cly-surface text-cly-text shadow-sm'
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
              className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors inline-flex items-center gap-2 print:hidden"
            >
              <Printer size={14} />
              Print PDF
            </button>
            <ReportExport posts={filteredPosts} />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-20 flex flex-col items-center justify-center text-center">
            <FileText className="size-12 text-cly-text-3 mb-4" />
            <p className="text-cly-md text-cly-text-2 mb-1">Belum ada data konten</p>
            <p className="text-cly-sm text-cly-text-3">Tambahkan post untuk melihat laporan.</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-[18px]">
                {/* Summary Cards */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
                  <SectionTitle title="Executive Summary" note="Key metrics untuk periode ini" />
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Posts</span>
                      <span className="text-cly-display font-black text-cly-text">{totalPosts.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Reach</span>
                      <span className="text-cly-display font-black text-cly-text">{fmt(totalReach)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Avg ER</span>
                      <span className="text-cly-display font-black text-cly-text">{fmtPercent(avgER)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Followers</span>
                      <span className="text-cly-display font-black text-cly-text">{fmt(totalFollowersGained)}</span>
                    </div>
                  </div>
                </div>

                {/* Complete Metrics Overview */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
                  <SectionTitle title="All Metrics" note="Semua metrics lengkap" />
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Impression</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.impression, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Reach</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(totalReach)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Like</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.like, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Comment</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.comment, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Share</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.share, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Save</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.save, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Total Repost</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.repost, 0))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-cly-xs text-cly-text-3 uppercase font-black tracking-wide">Profile Visit</span>
                      <span className="text-cly-lg font-black text-cly-text">{fmt(filteredPosts.reduce((s, p) => s + p.profile_visit, 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Performance */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
                  <div className="pt-2.5">
                    <SectionTitle title="Platform Performance" note="Breakdown per platform" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Avg ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data platform.</td>
                          </tr>
                        ) : (
                          platformData.map((pd, idx) => (
                            <tr key={pd.platform} className={idx < platformData.length - 1 ? 'border-b border-cly-border' : ''}>
                              <td className="py-3"><PlatformBadge platform={pd.platform} /></td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{pd.count}</td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(pd.totalReach)}</td>
                              <td className="py-3 text-right text-cly-sm text-cly-text font-black">{fmtPercent(pd.avgER)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Content */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
                  <div className="pt-2.5">
                    <SectionTitle title="Top 5 Content" note="Best performing posts by reach" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Title</th>
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPosts.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada konten.</td>
                          </tr>
                        ) : (
                          topPosts.map((p, idx) => (
                            <tr key={p.id} className={idx < topPosts.length - 1 ? 'border-b border-cly-border' : ''}>
                              <td className="py-3 text-cly-sm text-cly-text font-semibold max-w-xs truncate">{p.name || 'Untitled'}</td>
                              <td className="py-3"><PlatformBadge platform={p.platform} /></td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.reach)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Content Pillar Breakdown */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
                  <div className="pt-2.5">
                    <SectionTitle title="Content Pillars" note="Distribution konten berdasarkan pilar" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Pillar</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pillarData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data pillar.</td>
                          </tr>
                        ) : (
                          pillarData.map(([pillarId, data], idx) => {
                            const pillar = pillars.find(p => p.pillar_id === pillarId);
                            return (
                              <tr key={pillarId} className={idx < pillarData.length - 1 ? 'border-b border-cly-border' : ''}>
                                <td className="py-3">
                                  <span className="inline-flex items-center gap-1.5 text-cly-sm font-semibold">
                                    {pillar?.emoji && <span>{pillar.emoji}</span>}
                                    <span>{pillar?.label || pillarId}</span>
                                  </span>
                                </td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{data.count}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(data.reach)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(data.engagement)}</td>
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
                  <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
                    <SectionTitle title="Goals Summary" note="Status pencapaian goals" />
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {goals.map(goal => {
                        const relevantPosts = filteredPosts.filter(p => {
                          const matchPlatform = !goal.platform || p.platform === goal.platform;
                          const matchDate = p.date && p.date.startsWith(`${goal.year}-${String(goal.month).padStart(2, '0')}`);
                          return matchPlatform && matchDate;
                        });
                        
                        const current = goal.metric === 'reach' 
                          ? relevantPosts.reduce((s, p) => s + p.reach, 0)
                          : goal.metric === 'followers'
                          ? relevantPosts.reduce((s, p) => s + p.followers_gained, 0)
                          : relevantPosts.reduce((s, p) => s + p.impression, 0);
                        
                        const progress = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
                        
                        return (
                          <div key={goal.id} className="border border-cly-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{goal.emoji}</span>
                                <span className="text-cly-sm font-semibold text-cly-text">{goal.label}</span>
                              </div>
                              <span className="text-cly-xs text-cly-text-3 uppercase font-black">{goal.platform || 'All'}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-cly-xs">
                                <span className="text-cly-text-3">Progress</span>
                                <span className="font-black text-cly-text">{fmt(current)} / {fmt(goal.target)}</span>
                              </div>
                              <div className="h-2 bg-cly-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cly-brand transition-all" 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-right text-cly-xs font-black text-cly-brand">{fmtPercent(progress)}</div>
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
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
                  <div className="pt-2.5">
                    <SectionTitle title="Monthly Trend" note="Historical data per bulan" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Month</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Posts</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Followers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data bulanan.</td>
                          </tr>
                        ) : (
                          monthlyData.map(([month, data], idx) => (
                            <tr key={month} className={idx < monthlyData.length - 1 ? 'border-b border-cly-border' : ''}>
                              <td className="py-3 text-cly-sm text-cly-text font-semibold">{formatMonth(month)}</td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{data.posts}</td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(data.reach)}</td>
                              <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(data.followers)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Complete Posts List */}
                <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
                  <div className="pt-2.5">
                    <SectionTitle title="All Posts Detail" note="Semua konten dengan metrics lengkap" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-cly-border">
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Title</th>
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Platform</th>
                          <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Date</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Impression</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Reach</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Like</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Comment</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">Share</th>
                          <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPosts.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-cly-sm text-cly-text-3">Tidak ada data konten.</td>
                          </tr>
                        ) : (
                          filteredPosts.map((p, idx) => {
                            const totalEngagement = (p.like || 0) + (p.comment || 0) + (p.share || 0);
                            const er = p.impression > 0 ? (totalEngagement / p.impression) * 100 : 0;
                            return (
                              <tr key={p.id} className={idx < filteredPosts.length - 1 ? 'border-b border-cly-border' : ''}>
                                <td className="py-3 text-cly-sm text-cly-text font-semibold max-w-xs truncate">{p.name || 'Untitled'}</td>
                                <td className="py-3"><PlatformBadge platform={p.platform} /></td>
                                <td className="py-3 text-cly-xs text-cly-text-2">
                                  {p.date ? new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                </td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.impression)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.reach)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.like)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.comment)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text-2">{fmt(p.share)}</td>
                                <td className="py-3 text-right text-cly-sm text-cly-text font-black">{fmtPercent(er)}</td>
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
