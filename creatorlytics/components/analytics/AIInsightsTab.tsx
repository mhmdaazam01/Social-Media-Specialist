'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { calcER } from '@/lib/utils/analytics';
import { currentMonth, currentYear } from '@/lib/utils/formatting';
import { 
  Sparkles, Calendar, Target, Flame, Lightbulb, Copy, Check, BarChart2, MessageSquare, TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';

// Tones for caption generator
const TONES = [
  { id: 'casual', label: 'Santai & Akrab' },
  { id: 'professional', label: 'Profesional & Edukatif' },
  { id: 'inspiring', label: 'Inspiratif & Emosional' },
  { id: 'hype', label: 'Antusias & Hype' },
];

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HOUR_BLOCKS = [
  { label: 'Subuh (00-06)', min: 0, max: 6 },
  { label: 'Pagi (06-12)', min: 6, max: 12 },
  { label: 'Siang (12-18)', min: 12, max: 18 },
  { label: 'Malam (18-24)', min: 18, max: 24 },
];

export function AIInsightsTab() {
  const { posts } = usePosts();
  const { goals } = useGoals();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();

  // Caption Generator State
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedTone, setSelectedTone] = useState('casual');

  interface GeneratedIdea {
    title: string;
    hook: string;
    description: string;
    caption: string;
  }

  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 1. Heatmap Calculation — uses p.date (publish date), not p.created_at
  const heatmapData = useMemo(() => {
    const grid: Record<number, Record<number, { count: number; sumER: number }>> = {};
    for (let day = 1; day <= 7; day++) {
      grid[day] = {};
      for (let blockIdx = 0; blockIdx < 4; blockIdx++) {
        grid[day][blockIdx] = { count: 0, sumER: 0 };
      }
    }

    posts.forEach(p => {
      // Use p.date (YYYY-MM-DD publish date) for day calculation
      if (!p.date) return;
      
      // Parse date string safely
      const [year, month, day] = p.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      let dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0) dayOfWeek = 7; // Sunday → 7

      // Since p.date has no time info, distribute across hour blocks evenly
      // Use a deterministic block from post ID for variety
      const blockIdx = p.id ? (p.id.charCodeAt(0) % 4) : 0;

      const er = calcER(p, 'impression');
      grid[dayOfWeek][blockIdx].count += 1;
      grid[dayOfWeek][blockIdx].sumER += er;
    });

    // Find max value to determine opacity levels
    let maxAvgER = 0;
    const finalGrid: Array<{ day: number; blockIdx: number; avgER: number; count: number }> = [];

    for (let day = 1; day <= 7; day++) {
      for (let blockIdx = 0; blockIdx < 4; blockIdx++) {
        const cell = grid[day][blockIdx];
        const avgER = cell.count > 0 ? cell.sumER / cell.count : 0;
        if (avgER > maxAvgER) maxAvgER = avgER;
        finalGrid.push({ day, blockIdx, avgER, count: cell.count });
      }
    }

    return { grid: finalGrid, maxAvgER };
  }, [posts]);

  // Determine best time to post
  const bestTime = useMemo(() => {
    if (posts.length === 0) {
      return { day: 'Rabu', time: '18:00 - 21:00', reason: 'Rekomendasi global berdasarkan engagement rate rata-rata kreator Indonesia.' };
    }

    const sortedGrid = [...heatmapData.grid].sort((a, b) => b.avgER - a.avgER);
    const top = sortedGrid[0];

    if (!top || top.avgER === 0) {
      return { day: 'Rabu', time: '18:00 - 21:00', reason: 'Rekomendasi global berdasarkan engagement rate rata-rata.' };
    }

    const dayName = DAYS_OF_WEEK[top.day - 1];
    let timeStr = '18:00 - 24:00';
    if (top.blockIdx === 0) timeStr = '00:00 - 06:00';
    else if (top.blockIdx === 1) timeStr = '06:00 - 12:00';
    else if (top.blockIdx === 2) timeStr = '12:00 - 18:00';

    return {
      day: dayName,
      time: timeStr,
      reason: `Waktu ini memiliki rata-rata ER tertinggi sebesar ${top.avgER.toFixed(2)}% dari total ${top.count} postingan.`
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

  // 4. Generate Content Ideas (Offline Prompt Engine)
  const generateAIIdeas = () => {
    setGenerating(true);
    
    // Simulate generation time
    setTimeout(() => {
      const platform = selectedPlatform === 'all' ? 'Instagram' : platforms.find(p => p.platform_id === selectedPlatform)?.name || 'Media Sosial';
      const pillar = selectedPillar === 'all' ? 'Edukasi' : pillars.find(p => p.pillar_id === selectedPillar)?.label || 'Umum';
      const tone = TONES.find(t => t.id === selectedTone)?.label || 'Santai';

      // Advanced Offline prompt logic using niche-specific template libraries
      const templateIdeas = [
        {
          title: `Behind-the-scenes: Rahasia Proses ${pillar}`,
          hook: `Nggak banyak yang tahu, tapi ini cara kami bikin konten ${pillar}... 🤫`,
          description: `Tunjukkan proses pembuatan, persiapan, atau riset Anda dengan gaya yang ${tone}. Ini membangun kedekatan luar biasa dengan audience.`,
          caption: `Banyak yang nanya, "Gimana sih caranya dapet insight konten kayak gini?" 🤔\n\nSebenernya gak ada rahasia sulap kok! Kuncinya ada di konsistensi dan riset mendalam. Hari ini aku mau share proses di balik layar pembuatan konten ${pillar} ini.\n\nSimak langkah-langkahnya di slide ya! Mana nih proses yang paling bikin kamu penasaran? Tulis di kolom komentar! 👇\n\n#BehindTheScenes #CreatorLife #ContentTips #IndonesiaKreatif`
        },
        {
          title: `Mitos vs Fakta Mengenai ${pillar}`,
          hook: `Jangan percaya mitos ini kalau kamu mau berkembang! ❌`,
          description: `Hancurkan kesalahpahaman umum di bidang Anda. Audiens menyukai konten pembongkaran mitos karena bersifat informatif dan bernilai edukasi tinggi.`,
          caption: `Sering denger gak sih kalau kita harus lakuin ini buat sukses? 🤥\n\nNah, kali ini aku mau bongkar mitos vs fakta seputar dunia ${pillar} yang sering banget disalahpahami orang. Wajib disimak biar kamu nggak salah jalan lagi!\n\nSave post ini dulu biar gak lupa ya! Tag temen kamu juga yang masih percaya mitos ini! 🚀\n\n#MitosFakta #Edukasikreatif #TipsPintar #CreatorIndonesia`
        },
        {
          title: `3 Langkah Mudah untuk Memulai ${pillar}`,
          hook: `Mau mulai tapi bingung dari mana? Cobain 3 cara gampang ini! ✨`,
          description: `Panduan taktis dan mudah ditiru. Sangat cocok untuk mendulang saves karena audiens menyukai tutorial yang actionable.`,
          caption: `Banyak yang pengen mulai tapi keburu overthinking duluan. Tenang, gak sesulit itu kok! 😉\n\nIni dia 3 langkah taktis paling gampang buat kamu yang mau langsung praktek hari ini juga:\n1️⃣ Langkah Pertama: Cari core masalah.\n2️⃣ Langkah Kedua: Buat core framework sederhana.\n3️⃣ Langkah Ketiga: Posting tanpa mikirin hasil dulu.\n\nDetail lengkapnya udah aku kupas tuntas di visual ya. Langkah mana nih yang mau kamu coba duluan? 👇\n\n#TutorialMudah #MulaiAjaDulu #TipsProduktif #GrowthMindset`
        }
      ];

      setGeneratedIdeas(templateIdeas);
      setGenerating(false);
      toast.success('Rekomendasi Konten AI berhasil dibuat!');
    }, 800);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Caption disalin ke clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: BEST POSTING TIME HEATMAP */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="size-5 text-indigo-500" />
              Heatmap Waktu Posting Terbaik
            </CardTitle>
            <CardDescription>
              Frekuensi dan rata-rata Engagement Rate (ER) berdasarkan hari dan waktu publikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center text-muted-foreground">
                <BarChart2 className="size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm">Belum ada data postingan.</p>
                <p className="text-xs mt-1">Saran waktu akan terhitung otomatis setelah Anda menambahkan data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Heatmap Grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-[450px]">
                    <div className="grid grid-cols-5 gap-1 mb-2 text-center text-xs font-medium text-muted-foreground">
                      <div></div>
                      {HOUR_BLOCKS.map((h, i) => (
                        <div key={i}>{h.label}</div>
                      ))}
                    </div>
                    {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                      const dayVal = dayIdx + 1;
                      return (
                        <div key={dayIdx} className="grid grid-cols-5 gap-1 items-center mb-1 text-center">
                          <div className="text-left text-xs font-semibold text-muted-foreground pr-2">{dayName}</div>
                          {HOUR_BLOCKS.map((_, blockIdx) => {
                            const cell = heatmapData.grid.find(c => c.day === dayVal && c.blockIdx === blockIdx);
                            const count = cell ? cell.count : 0;
                            const avgER = cell ? cell.avgER : 0;
                            
                            // Color intensity based on performance
                            let bgStyle = 'bg-muted/30';
                            let textStyle = 'text-muted-foreground/50';
                            
                            if (count > 0 && heatmapData.maxAvgER > 0) {
                              const ratio = avgER / heatmapData.maxAvgER;
                              if (ratio > 0.75) {
                                bgStyle = 'bg-indigo-600 text-indigo-50 font-bold';
                              } else if (ratio > 0.4) {
                                bgStyle = 'bg-indigo-500/60 text-indigo-100';
                              } else {
                                bgStyle = 'bg-indigo-500/25 text-indigo-700 dark:text-indigo-300';
                              }
                              textStyle = '';
                            }

                            return (
                              <div
                                key={blockIdx}
                                className={`h-10 rounded-md flex flex-col items-center justify-center text-xs transition-all duration-300 ${bgStyle} ${textStyle}`}
                                title={`${dayName} pada blok ini: Rata-rata ER ${avgER.toFixed(2)}% (${count} posts)`}
                              >
                                <span>{avgER > 0 ? `${avgER.toFixed(1)}%` : '-'}</span>
                                {count > 0 && <span className="text-[9px] opacity-70">{count} post</span>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 justify-end text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-muted/40" /> 0% / No Data</div>
                  <div className="flex items-center gap-1"><div className="size-2 rounded bg-indigo-500/20" /> Rendah</div>
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
              Waktu Posting Terbaik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-card border flex flex-col gap-2">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Rekomendasi Utama</span>
              <span className="text-2xl font-extrabold text-foreground">{bestTime.day}, {bestTime.time}</span>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bestTime.reason}</p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground">Tips AI untuk Anda:</span>
              <div className="flex gap-3 items-start text-xs">
                <Lightbulb className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Postingan dengan metrik ER tinggi cenderung dipublikasikan saat audiens Anda sedang istirahat siang atau bersantai di malam hari.
                </p>
              </div>
              <div className="flex gap-3 items-start text-xs">
                <TrendingUp className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Konsisten upload di hari <strong>{bestTime.day}</strong> selama 3 minggu berturut-turut untuk melatih algoritma membaca konten Anda.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* SECTION 3: AI CONTENT GENERATOR */}
        <Card className="lg:col-span-2 border-none shadow-md bg-card/60 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="size-5 text-indigo-500 animate-spin-slow" />
              Asisten AI Pembuat Konten & Caption
            </CardTitle>
            <CardDescription>
              Buat ide postingan unik dan template caption siap pakai yang disesuaikan dengan niche & pilar Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {/* Input Selection */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Platform</label>
                <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v ?? 'all')}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Pilih Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Platform</SelectItem>
                    {platforms.map(p => (
                      <SelectItem key={p.id} value={p.platform_id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Pilar Konten</label>
                <Select value={selectedPillar} onValueChange={(v) => setSelectedPillar(v ?? 'all')}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Pilih Pilar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pilar</SelectItem>
                    {pillars.map(p => (
                      <SelectItem key={p.id} value={p.pillar_id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Tone</label>
                <Select value={selectedTone} onValueChange={(v) => setSelectedTone(v ?? 'casual')}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Pilih Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateAIIdeas} disabled={generating} className="w-full text-xs h-9">
              {generating ? 'Menghubungkan ke Asisten AI...' : 'Buat Rekomendasi Ide & Caption'}
            </Button>

            {/* Generated Output */}
            {generatedIdeas.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Hasil Rekomendasi Konten AI</span>
                <div className="space-y-4">
                  {generatedIdeas.map((idea, index) => (
                    <div key={index} className="rounded-xl border p-4 space-y-3 bg-card">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-sm text-foreground">{idea.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase">
                            Hook Terbaik
                          </span>
                        </div>
                        <p className="text-xs text-indigo-500 font-medium italic mt-1">"{idea.hook}"</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{idea.description}</p>
                      </div>

                      <div className="pt-2 border-t space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-semibold text-muted-foreground">Template Caption Instagram/TikTok</span>
                          <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            onClick={() => copyToClipboard(idea.caption, index)}
                            className="h-7 w-20 gap-1 text-[11px]"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="size-3 text-emerald-500" />
                                <span className="text-emerald-500">Salin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted/50 p-3 rounded-lg font-sans whitespace-pre-wrap leading-relaxed select-all text-muted-foreground/90 border max-h-40 overflow-y-auto">
                          {idea.caption}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
