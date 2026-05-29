'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePostStore } from '@/lib/store/post-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { calcTotalER, fmt } from '@/lib/utils/analytics';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { CalendarDays } from 'lucide-react';

export function WeeklyNarrative() {
  const posts = usePostStore(s => s.posts);
  const erMode = useSettingsStore(s => s.settings.er_mode);

  const { weekPosts, totalPosts, avgER, totalReach, bestDay } = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekPosts = posts.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });

    const totalPosts = weekPosts.length;
    const avgER = weekPosts.length > 0
      ? calcTotalER(weekPosts, erMode)
      : 0;
    const totalReach = weekPosts.reduce((s, p) => s + p.reach, 0);

    const dayGroups: Record<string, { count: number; interactions: number }> = {};
    for (const p of weekPosts) {
      const day = p.date;
      if (!dayGroups[day]) dayGroups[day] = { count: 0, interactions: 0 };
      dayGroups[day].count++;
      dayGroups[day].interactions += p.like + p.comment + p.save + p.share;
    }

    const bestDayEntry = Object.entries(dayGroups).sort(
      (a, b) => b[1].interactions - a[1].interactions
    )[0];

    const bestDay = bestDayEntry
      ? new Date(bestDayEntry[0] + 'T00:00:00').toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        })
      : null;

    return { weekPosts, totalPosts, avgER, totalReach, bestDay };
  }, [posts, erMode]);

  if (totalPosts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays size={18} className="text-muted-foreground" />
            Ringkasan Minggu Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays size={32} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada postingan minggu ini
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Data akan muncul setelah kamu menambahkan postingan
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays size={18} className="text-muted-foreground" />
          Ringkasan Minggu Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Post</span>
            <span className="text-xl font-semibold">{totalPosts}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Rata-rata ER</span>
            <span className="text-xl font-semibold">{avgER.toFixed(2)}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Reach</span>
            <span className="text-xl font-semibold">{fmt(totalReach)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Hari Terbaik</span>
            <span className="text-xl font-semibold">{bestDay || '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
