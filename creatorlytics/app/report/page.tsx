'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ReportSlide } from '@/components/report/ReportSlide';
import { ReportExport } from '@/components/report/ReportExport';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { usePostStore } from '@/lib/store/post-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { calcTotalER, fmt, aggregateByPlatform } from '@/lib/utils/analytics';
import { formatMonth } from '@/lib/utils/formatting';
import { FileText, BarChart3, Activity, Users, Printer } from 'lucide-react';
import { useMemo } from 'react';

export default function ReportPage() {
  const posts = usePostStore(s => s.posts);
  const erMode = useSettingsStore(s => s.settings.er_mode);

  const totalPosts = posts.length;
  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalFollowersGained = posts.reduce((s, p) => s + p.followers_gained, 0);
  const avgER = totalPosts > 0 ? calcTotalER(posts, erMode) : 0;

  const platformData = useMemo(() => aggregateByPlatform(posts), [posts]);

  const topPosts = useMemo(() => [...posts].sort((a, b) => b.reach - a.reach).slice(0, 5), [posts]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { posts: number; reach: number; followers: number }> = {};
    for (const p of posts) {
      if (!p.date) continue;
      const month = p.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = { posts: 0, reach: 0, followers: 0 };
      grouped[month].posts++;
      grouped[month].reach += p.reach;
      grouped[month].followers += p.followers_gained;
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [posts]);

  return (
    <AppShell title="Report">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Laporan Kinerja</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
              <Printer className="size-4" />
              Cetak PDF
            </Button>
            <ReportExport posts={posts} />
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada data konten. Tambahkan post untuk melihat laporan.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ReportSlide title="Ringkasan">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="size-3" /> Total Posts
                  </span>
                  <span className="text-2xl font-bold">{totalPosts.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="size-3" /> Total Reach
                  </span>
                  <span className="text-2xl font-bold">{fmt(totalReach)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="size-3" /> Rata-rata ER
                  </span>
                  <span className="text-2xl font-bold">{avgER.toFixed(2)}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="size-3" /> Followers Gained
                  </span>
                  <span className="text-2xl font-bold">{fmt(totalFollowersGained)}</span>
                </div>
              </div>
            </ReportSlide>

            <ReportSlide title="Performa Platform">
              {platformData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada data platform.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Rata-rata ER</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platformData.map(pd => (
                      <TableRow key={pd.platform}>
                        <TableCell className="capitalize">{pd.platform}</TableCell>
                        <TableCell>{pd.count}</TableCell>
                        <TableCell>{fmt(pd.totalReach)}</TableCell>
                        <TableCell>{fmt(pd.totalImpression)}</TableCell>
                        <TableCell>{fmt(pd.totalInteractions)}</TableCell>
                        <TableCell>{pd.avgER.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ReportSlide>

            <ReportSlide title="Konten Terbaik">
              {topPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada konten.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPosts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="max-w-[200px] truncate">{p.name || 'Untitled'}</TableCell>
                        <TableCell className="capitalize">{p.platform}</TableCell>
                        <TableCell>{fmt(p.reach)}</TableCell>
                        <TableCell>{fmt(p.like + p.comment + p.share + p.save)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ReportSlide>

            <ReportSlide title="Tren Bulanan">
              {monthlyData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada data bulanan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead>Followers Gained</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell>{formatMonth(month)}</TableCell>
                        <TableCell>{data.posts}</TableCell>
                        <TableCell>{fmt(data.reach)}</TableCell>
                        <TableCell>{fmt(data.followers)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ReportSlide>
          </div>
        )}
      </div>
    </AppShell>
  );
}
