'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTitle, InsightCard, PlatformBadge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useUser } from '@/lib/hooks/useUser';
import {
  aggregateByMonth, aggregateByPlatform, aggregateByPillar, isPostInMonth,
  fmt, fmtPercent,
} from '@/lib/utils/analytics';
import { TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const { posts, loading } = usePosts();
  const { platforms } = usePlatforms();
  const { accounts } = useAccounts();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  
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
    if (dateFrom) {
      filtered = filtered.filter(p => p.date && p.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(p => p.date && p.date <= dateTo);
    }
    
    return filtered;
  }, [posts, selectedPlatform, selectedAccount, dateFrom, dateTo]);

  const byPlatform = useMemo(() => aggregateByPlatform(posts, erMode), [posts, erMode]);
  const { pillars } = usePillars();

  const chartData = useMemo(() => {
    if (chartView === 'monthly') {
      // Monthly aggregation
      const monthMap: Record<string, { reach: number; impression: number; engagement: number; count: number }> = {};
      
      filteredPosts.forEach(p => {
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
        return {
          label: month.slice(5), // "YYYY-MM" → "MM"
          reach: d.reach,
          impression: d.impression,
          er: parseFloat(er.toFixed(2)),
        };
      });
    } else {
      // Daily view
      const dailyMap: Record<string, { reach: number; impression: number; engagement: number }> = {};
      
      filteredPosts.forEach(p => {
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
    
    const COLORS = ['#2F6F45', '#2563A7', '#A15C07', '#B93B32', '#7C4D9D', '#13747C'];
    
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
      <div className="flex flex-col gap-[18px]">
        {/* Filter Buttons */}
        <div className="flex justify-end gap-2 flex-wrap">
          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors outline-none"
            placeholder="Dari"
          />
          
          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors outline-none"
            placeholder="Sampai"
          />
          
          {/* Account Filter */}
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors outline-none cursor-pointer"
          >
            <option value="all">Semua Akun</option>
            {accounts.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
          
          {/* Platform Filter */}
          <select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors outline-none cursor-pointer"
          >
            <option value="all">All platforms</option>
            {platforms.map(p => (
              <option key={p.id} value={p.platform_id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Two Column: Trend Chart + Pillar Score */}
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.2fr)_390px]">
          {/* Trend Chart Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <SectionTitle
                title="Tren Performa"
                note={chartView === 'monthly' ? 'Impression, Reach & ER per bulan' : 'Impression, Reach & ER per hari'}
              />
              
              {/* Chart controls */}
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex border border-cly-border rounded overflow-hidden">
                  <button
                    onClick={() => setChartView('daily')}
                    className={`h-[30px] px-3 text-cly-xs font-semibold transition-colors ${
                      chartView === 'daily' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-cly-surface text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`h-[30px] px-3 text-cly-xs font-semibold border-l border-cly-border transition-colors ${
                      chartView === 'monthly' 
                        ? 'bg-cly-brand text-white' 
                        : 'bg-cly-surface text-cly-text-2 hover:bg-cly-muted'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="w-full h-80 bg-cly-border/20 rounded animate-pulse" />
            ) : chartData.length === 0 ? (
              <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
                <p className="text-cly-sm text-cly-text-3">Belum ada data — tambahkan post untuk melihat tren.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cly-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => fmt(v)} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => {
                      if (name === 'er') return [`${v}%`, 'ER'];
                      return [fmt(Number(v)), name === 'impression' ? 'Impression' : 'Reach'];
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="impression" stroke="var(--color-cly-green)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-cly-green)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="left" type="monotone" dataKey="reach" stroke="var(--color-cly-brand)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-cly-brand)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="er" stroke="var(--color-cly-amber)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-cly-amber)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pillar Score Card */}
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
            <SectionTitle
              title="Performa Pilar"
              note="Impression, Reach & ER per pilar"
            />
            {loading ? (
              <div className="w-full h-56 bg-cly-border/20 rounded animate-pulse" />
            ) : pillarData.length === 0 ? (
              <div className="h-[280px] bg-cly-muted rounded-lg flex items-center justify-center">
                <p className="text-cly-sm text-cly-text-3">Belum ada data pilar.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart 
                  data={pillarData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cly-border)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: 'var(--color-cly-text-3)' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'var(--color-cly-text-2)' }} 
                    axisLine={false} 
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-cly-surface)', border: '1px solid var(--color-cly-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => {
                      if (name === 'er') return [`${v}%`, 'ER'];
                      return [fmt(Number(v)), name === 'impression' ? 'Impression' : 'Reach'];
                    }}
                  />
                  <Bar dataKey="impression" fill="var(--color-cly-green)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="reach" fill="var(--color-cly-brand)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="er" fill="var(--color-cly-amber)" radius={[0, 4, 4, 0]} />
                </BarChart>
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
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px]">
          <div className="pt-2.5">
            <SectionTitle
              title="Rincian per platform"
              note="Data komprehensif performa platform"
            />
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-cly-border">
                  <th className="py-2.5 px-3 text-cly-xs font-bold text-cly-text-3 uppercase tracking-wider bg-cly-rail/50">Platform</th>
                  <th className="py-2.5 px-3 text-cly-xs font-bold text-cly-text-3 uppercase tracking-wider bg-cly-rail/50 text-right">Reach</th>
                  <th className="py-2.5 px-3 text-cly-xs font-bold text-cly-text-3 uppercase tracking-wider bg-cly-rail/50 text-right">Impression</th>
                  <th className="py-2.5 px-3 text-cly-xs font-bold text-cly-text-3 uppercase tracking-wider bg-cly-rail/50 text-right">Engagement</th>
                  <th className="py-2.5 px-3 text-cly-xs font-bold text-cly-text-3 uppercase tracking-wider bg-cly-rail/50 text-right">ER</th>
                </tr>
              </thead>
              <tbody className="text-cly-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cly-text-muted animate-pulse">
                      Memuat data platform...
                    </td>
                  </tr>
                ) : byPlatform.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cly-text-muted">
                      Belum ada data analitik.
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
                      .filter(po => po.platform === p.platform && isPostInMonth(po, thisY, thisM))
                      .reduce((s, po) => s + po.reach, 0);

                    const prevReach = posts
                      .filter(po => po.platform === p.platform && isPostInMonth(po, prevY, prevM))
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
