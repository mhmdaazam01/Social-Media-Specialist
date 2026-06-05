'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { calcER } from '@/lib/utils/analytics';
import { currentMonth, currentYear } from '@/lib/utils/formatting';
import { 
  Calendar, Target, Flame, Lightbulb, BarChart2, MessageSquare, TrendingUp 
} from 'lucide-react';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function AIInsightsTab() {
  const { posts } = usePosts();
  const { goals } = useGoals();
  const { platforms } = usePlatforms();

  // 1. Heatmap per Hari dalam Seminggu
  const heatmapData = useMemo(() => {
    // day 1 = Senin ... day 7 = Minggu
    const grid: Record<number, { count: number; sumER: number }> = {};
    for (let day = 1; day <= 7; day++) {
      grid[day] = { count: 0, sumER: 0 };
    }

    posts.forEach(p => {
      // Gunakan p.date (format 'YYYY-MM-DD') karena tidak ada kolom jam
      const dateStr = p.date || p.created_at;
      if (!dateStr) return;
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return;

      // getDay(): 0 = Minggu, 1 = Senin ... 6 = Sabtu → map ke 1–7 (Senin=1, Minggu=7)
      let day = dateObj.getDay();
      if (day === 0) day = 7;

      const er = calcER(p, 'impression');
      grid[day].count += 1;
      grid[day].sumER += er;
    });

    let maxAvgER = 0;
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1;
      const cell = grid[day];
      const avgER = cell.count > 0 ? cell.sumER / cell.count : 0;
      if (avgER > maxAvgER) maxAvgER = avgER;
      return { day, avgER, count: cell.count };
    });

    // second pass to set maxAvgER correctly
    const max = Math.max(...days.map(d => d.avgER));
    return { days, maxAvgER: max };
  }, [posts]);

  // Hari posting terbaik berdasarkan avg ER
  const bestDay = useMemo(() => {
    if (posts.length === 0) {
      return { day: 'Rabu', reason: 'Rekomendasi global berdasarkan engagement rate rata-rata kreator Indonesia.' };
    }

    const top = [...heatmapData.days].sort((a, b) => b.avgER - a.avgER)[0];

    if (!top || top.avgER === 0) {
      return { day: 'Rabu', reason: 'Belum cukup data untuk menentukan hari terbaik.' };
    }

    return {
      day: DAYS_OF_WEEK[top.day - 1],
      reason: `Hari ini memiliki rata-rata ER tertinggi sebesar ${top.avgER.toFixed(2)}% dari total ${top.count} postingan.`
    };
  }, [heatmapData, posts]);

  // 2. Goal Forecasting & Velocity check
  const goalForecasts = useMemo(() => {
    const month = currentMonth();
    const year = currentYear();
    const currentMonthGoals = goals.filter(g => g.month === month && g.year === year);
    
    // Get number of days in the month and days passed
    const now = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    return currentMonthGoals.map(goal => {
      // Calculate current progress
      const filteredPosts = posts.filter(p => {
        if (!p.date) return false;
        const [py, pm] = p.date.split('-');
        if (parseInt(py) !== goal.year || parseInt(pm) !== goal.month) return false;
        if (goal.platform !== 'all' && p.platform !== goal.platform) return false;
        return true;
      });

      let actual = 0;
      switch (goal.metric) {
        case 'followers':
          actual = filteredPosts.reduce((s, p) => s + p.followers_gained, 0);
          break;
        case 'reach':
          actual = filteredPosts.reduce((s, p) => s + p.reach, 0);
          break;
        case 'impression':
          actual = filteredPosts.reduce((s, p) => s + p.impression, 0);
          break;
        case 'engagement':
          actual = filteredPosts.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
          break;
        case 'posts':
          actual = filteredPosts.length;
          break;
        case 'likes':
          actual = filteredPosts.reduce((s, p) => s + p.like, 0);
          break;
        case 'comments':
          actual = filteredPosts.reduce((s, p) => s + p.comment, 0);
          break;
      }

      const currentRate = daysPassed > 0 ? actual / daysPassed : 0;
      const predictedFinal = actual + (currentRate * daysRemaining);
      const percentReached = goal.target > 0 ? (actual / goal.target) * 100 : 0;
      const isOnTrack = predictedFinal >= goal.target;

      let status: 'ahead' | 'on-track' | 'behind' | 'critical' = 'on-track';
      if (percentReached >= 100) status = 'ahead';
      else if (isOnTrack) status = 'on-track';
      else if (predictedFinal >= goal.target * 0.7) status = 'behind';
      else status = 'critical';

      return {
        goal,
        actual,
        percentReached: Math.round(percentReached),
        predictedFinal: Math.round(predictedFinal),
        status,
        daysRemaining
      };
    });
  }, [goals, posts]);

  // 3. Format & Platform Efficiency Matrix
  const formatMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, { count: number; sumER: number }>> = {};

    posts.forEach(p => {
      const platform = p.platform || 'unknown';
      const format = p.format || 'unknown';

      if (!matrix[platform]) matrix[platform] = {};
      if (!matrix[platform][format]) matrix[platform][format] = { count: 0, sumER: 0 };

      matrix[platform][format].count += 1;
      matrix[platform][format].sumER += calcER(p, 'impression');
    });

    const list: Array<{ platform: string; format: string; avgER: number; count: number }> = [];
    Object.entries(matrix).forEach(([plat, formats]) => {
      Object.entries(formats).forEach(([form, cell]) => {
        list.push({
          platform: plat,
          format: form,
          avgER: cell.count > 0 ? cell.sumER / cell.count : 0,
          count: cell.count
        });
      });
    });

    return list.sort((a, b) => b.avgER - a.avgER).slice(0, 5);
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* SECTION 1: BEST POSTING TIME HEATMAP */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="size-5 text-indigo-500" />
              Heatmap Hari Posting Terbaik
            </CardTitle>
            <CardDescription>
              Rata-rata Engagement Rate (ER) berdasarkan hari dalam seminggu saat postingan dipublikasikan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center text-muted-foreground">
                <BarChart2 className="size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm">Belum ada data postingan.</p>
                <p className="text-xs mt-1">Hari terbaik akan terhitung otomatis setelah Anda menambahkan data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Heatmap Bar per Hari */}
                <div className="space-y-2">
                  {heatmapData.days.map(({ day, avgER, count }) => {
                    const dayName = DAYS_OF_WEEK[day - 1];
                    const ratio = heatmapData.maxAvgER > 0 ? avgER / heatmapData.maxAvgER : 0;
                    const isBest = ratio === 1 && avgER > 0;

                    let barColor = 'bg-muted/40';
                    if (count > 0) {
                      if (ratio > 0.75) barColor = 'bg-indigo-600';
                      else if (ratio > 0.4) barColor = 'bg-indigo-500/60';
                      else barColor = 'bg-indigo-500/25';
                    }

                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className={`w-14 text-xs font-semibold shrink-0 ${isBest ? 'text-indigo-500' : 'text-muted-foreground'}`}>
                          {dayName}
                        </span>
                        <div className="flex-1 h-8 rounded-md bg-muted/20 overflow-hidden relative">
                          <div
                            className={`h-full rounded-md transition-all duration-500 ${barColor}`}
                            style={{ width: count > 0 ? `${Math.max(ratio * 100, 4)}%` : '0%' }}
                          />
                          {count > 0 && (
                            <span className="absolute inset-0 flex items-center px-3 text-[11px] font-medium text-foreground/80">
                              {avgER.toFixed(2)}% ER · {count} post
                            </span>
                          )}
                        </div>
                        {isBest && (
                          <span className="text-[10px] font-bold text-indigo-500 shrink-0">★ Terbaik</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-end text-[10px] text-muted-foreground pt-1">
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-muted/40" /> No Data</div>
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-indigo-500/25" /> Rendah</div>
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-indigo-500/60" /> Sedang</div>
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-indigo-600" /> Terbaik</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SUMMARY CARD: SUGGESTION */}
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Flame className="size-5 text-amber-500 animate-pulse" />
              Hari Posting Terbaik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-card border flex flex-col gap-2">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Rekomendasi Utama</span>
              <span className="text-2xl font-extrabold text-foreground">{bestDay.day}</span>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bestDay.reason}</p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground">Tips untuk Anda:</span>
              <div className="flex gap-3 items-start text-xs">
                <Lightbulb className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Audiens cenderung lebih aktif di hari-hari tertentu. Postingan yang ditayangkan saat engagement tinggi mendapat distribusi algoritma yang lebih baik.
                </p>
              </div>
              <div className="flex gap-3 items-start text-xs">
                <TrendingUp className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Konsisten posting di hari <strong>{bestDay.day}</strong> selama 3 minggu berturut-turut untuk melatih algoritma mengenali pola konten Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: GOAL FORECASTING & ACCELERATION */}
      <Card className="border-none shadow-md bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
            <Target className="size-5 text-emerald-500" />
            Goal Forecast & Estimasi Pencapaian
          </CardTitle>
          <CardDescription>
            Estimasi pencapaian target bulan ini berdasarkan rata-rata performa harian Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {goalForecasts.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center text-center text-muted-foreground">
              <Target className="size-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm">Belum ada goals aktif bulan ini.</p>
              <p className="text-xs mt-1">Buat goal di menu Goals untuk memantau forecast otomatis.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goalForecasts.map(({ goal, actual, percentReached, predictedFinal, status, daysRemaining }) => {
                let statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                let statusText = 'Perlu Akselerasi';
                
                if (status === 'ahead') {
                  statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                  statusText = 'Target Tercapai! 🎉';
                } else if (status === 'on-track') {
                  statusColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                  statusText = 'On Track';
                } else if (status === 'critical') {
                  statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';
                  statusText = 'Sangat Lambat';
                }

                return (
                  <div key={goal.id} className="rounded-xl border p-4 flex flex-col gap-3 justify-between bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{goal.label}</p>
                        <p className="text-[11px] text-muted-foreground uppercase mt-0.5">
                          {goal.platform === 'all' ? 'Semua Platform' : goal.platform} &middot; {goal.metric}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Progress saat ini</span>
                        <span>{percentReached}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${status === 'critical' ? 'bg-red-500' : status === 'behind' ? 'bg-amber-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(percentReached, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                        <span>{actual.toLocaleString('id-ID')} / {goal.target.toLocaleString('id-ID')}</span>
                        <span>{daysRemaining} hari tersisa</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Proyeksi akhir bulan:</span>
                        <span className="font-bold text-foreground">{predictedFinal.toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        {status === 'ahead' || status === 'on-track' 
                          ? 'Performa Anda stabil. Pertahankan ritme konten seperti sekarang.'
                          : `Perlu rata-rata ${( (goal.target - actual) / Math.max(daysRemaining, 1) ).toFixed(1)} ${goal.metric} per hari untuk sukses.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4: FORMAT EFFICIENCY MATRIX */}
        <Card className="border-none shadow-md bg-card/60 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <BarChart2 className="size-5 text-indigo-500" />
              Kombinasi Format Terpopuler
            </CardTitle>
            <CardDescription>
              Format konten dengan Engagement Rate terbaik di seluruh platform Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {formatMatrix.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                <MessageSquare className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs">Belum ada postingan terdaftar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formatMatrix.map((item, index) => {
                  const platName = platforms.find(p => p.platform_id === item.platform)?.name || item.platform;
                  return (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-semibold text-xs text-foreground capitalize">{item.format}</p>
                        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{platName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs text-indigo-500">{item.avgER.toFixed(2)}% ER</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{item.count} postingan</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="p-3.5 rounded-xl border bg-indigo-500/5 text-xs leading-relaxed space-y-2 mt-4">
              <p className="font-semibold text-indigo-500 flex items-center gap-1">
                <Lightbulb className="size-3.5" />
                Rekomendasi Format:
              </p>
              <p className="text-muted-foreground text-[11px]">
                {formatMatrix.length > 0 
                  ? `Format ${formatMatrix[0].format} di platform ${platforms.find(p => p.platform_id === formatMatrix[0].platform)?.name || formatMatrix[0].platform} terbukti mendatangkan ER tertinggi. Prioritaskan format ini dalam kalender planner konten Anda.`
                  : 'Gunakan perpaduan format Reels & Carousel di Instagram atau Short Video di TikTok untuk memaksimalkan reach dan interaksi.'}
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
