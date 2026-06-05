'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { AnalyticsFilter } from '@/components/analytics/AnalyticsFilter';
import { TopContentTable } from '@/components/analytics/TopContentTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useUser } from '@/lib/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import {
  aggregateByMonth,
  aggregateByPillar,
  aggregateByPlatform,
  calcTotalER,
  fmt,
  fmtPercent,
} from '@/lib/utils/analytics';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AIInsightsTab } from '@/components/analytics/AIInsightsTab';

const TrendChart = dynamic(() => import('@/components/analytics/TrendChart').then(mod => mod.TrendChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});

const PillarChart = dynamic(() => import('@/components/analytics/PillarChart').then(mod => mod.PillarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

export default function AnalyticsPage() {
  const { posts, loading: postsLoading } = usePosts();
  const { platforms, loading: platformsLoading } = usePlatforms();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';
  const [platform, setPlatform] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const loading = postsLoading || platformsLoading;

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (platform !== 'all') {
      filtered = filtered.filter((p) => p.platform === platform);
    }
    if (dateRange.from) {
      filtered = filtered.filter((p) => p.date >= dateRange.from);
    }
    if (dateRange.to) {
      filtered = filtered.filter((p) => p.date <= dateRange.to);
    }
    return filtered;
  }, [posts, platform, dateRange]);

  const byMonth = useMemo(() => aggregateByMonth(filteredPosts, erMode), [filteredPosts, erMode]);
  const byPillar = useMemo(() => aggregateByPillar(filteredPosts, erMode), [filteredPosts, erMode]);
  const byPlatform = useMemo(() => aggregateByPlatform(filteredPosts, erMode), [filteredPosts, erMode]);

  const totalReach = useMemo(
    () => filteredPosts.reduce((s, p) => s + p.reach, 0),
    [filteredPosts]
  );

  const avgER = useMemo(
    () => calcTotalER(filteredPosts, erMode),
    [filteredPosts, erMode]
  );

  const bestPlatform = useMemo(() => {
    if (byPlatform.length === 0) return null;
    return byPlatform.reduce((best, curr) => (curr.avgER > best.avgER ? curr : best));
  }, [byPlatform]);

  const platformName = (id: string) => {
    const p = platforms.find((pl) => pl.platform_id === id);
    return p ? p.name : id;
  };

  if (loading) {
    return (
      <AppShell title="Analytics">
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-80 w-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-72 w-full" />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Analytics">
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performa Konten</TabsTrigger>
          <TabsTrigger value="ai">AI & Rekomendasi Pintar</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <AnalyticsFilter
            platform={platform}
            onPlatformChange={setPlatform}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {filteredPosts.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Total Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {fmt(totalReach)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Rata-rata ER
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {fmtPercent(avgER)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Platform Terbaik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {bestPlatform ? platformName(bestPlatform.platform) : '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          <TrendChart data={byMonth} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PillarChart data={byPillar} />
            <Card>
              <CardHeader>
                <CardTitle>Perbandingan Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {byPlatform.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    Belum ada data.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Posts</TableHead>
                        <TableHead className="text-right">Rata-rata ER</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byPlatform.map((p) => (
                        <TableRow key={p.platform}>
                          <TableCell>{platformName(p.platform)}</TableCell>
                          <TableCell className="text-right font-medium">{p.count}</TableCell>
                          <TableCell className="text-right font-medium">{fmtPercent(p.avgER)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <TopContentTable posts={filteredPosts} />
        </TabsContent>

        <TabsContent value="ai">
          <AIInsightsTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
