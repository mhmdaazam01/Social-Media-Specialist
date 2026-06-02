'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AnalyticsFilter } from '@/components/analytics/AnalyticsFilter';
import { TrendChart } from '@/components/analytics/TrendChart';
import { TopContentTable } from '@/components/analytics/TopContentTable';
import { PillarChart } from '@/components/analytics/PillarChart';
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
import {
  aggregateByMonth,
  aggregateByPillar,
  aggregateByPlatform,
  calcTotalER,
  fmt,
  fmtPercent,
} from '@/lib/utils/analytics';

export default function AnalyticsPage() {
  const { posts } = usePosts();
  const { platforms } = usePlatforms();
  const [platform, setPlatform] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

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

  const byMonth = useMemo(() => aggregateByMonth(filteredPosts), [filteredPosts]);
  const byPillar = useMemo(() => aggregateByPillar(filteredPosts), [filteredPosts]);
  const byPlatform = useMemo(() => aggregateByPlatform(filteredPosts), [filteredPosts]);

  const totalReach = useMemo(
    () => filteredPosts.reduce((s, p) => s + p.reach, 0),
    [filteredPosts]
  );

  const avgER = useMemo(
    () => calcTotalER(filteredPosts, 'impression'),
    [filteredPosts]
  );

  const bestPlatform = useMemo(() => {
    if (byPlatform.length === 0) return null;
    return byPlatform.reduce((best, curr) => (curr.avgER > best.avgER ? curr : best));
  }, [byPlatform]);

  const platformName = (id: string) => {
    const p = platforms.find((pl) => pl.platform_id === id);
    return p ? p.name : id;
  };

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
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
      </div>
    </AppShell>
  );
}
