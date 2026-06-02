'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import type { Post } from '@/types';
import { formatDate } from '@/lib/utils/formatting';
import { calcER, fmt, fmtPercent } from '@/lib/utils/analytics';

interface TopContentTableProps {
  posts: Post[];
}

type SortKey = 'er' | 'reach' | 'likes' | 'date';
type SortDir = 'asc' | 'desc';

export function TopContentTable({ posts }: TopContentTableProps) {
  const { platforms } = usePlatforms();
  const [sortKey, setSortKey] = useState<SortKey>('er');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const items = posts.map((p) => ({ ...p, er: calcER(p, 'impression') }));
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'er':
          cmp = a.er - b.er;
          break;
        case 'reach':
          cmp = a.reach - b.reach;
          break;
        case 'likes':
          cmp = a.like - b.like;
          break;
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return items.slice(0, 20);
  }, [posts, sortKey, sortDir]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'desc' ? ' ↓' : ' ↑';
  };

  const platformName = (id: string) => {
    const p = platforms.find((pl) => pl.platform_id === id);
    return p ? p.name : id;
  };

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Konten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Belum ada data.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Konten</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('date')}
              >
                Tanggal{sortIndicator('date')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort('reach')}
              >
                Reach{sortIndicator('reach')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort('likes')}
              >
                Likes{sortIndicator('likes')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort('er')}
              >
                ER{sortIndicator('er')}
              </TableHead>
              <TableHead>Pillar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((post, i) => (
              <TableRow key={post.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="max-w-48 truncate">{post.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{platformName(post.platform)}</Badge>
                </TableCell>
                <TableCell>{formatDate(post.date)}</TableCell>
                <TableCell className="text-right font-medium">{fmt(post.reach)}</TableCell>
                <TableCell className="text-right font-medium">{fmt(post.like)}</TableCell>
                <TableCell className="text-right font-medium">{fmtPercent(calcER(post, 'impression'))}</TableCell>
                <TableCell>
                  <Badge variant="outline">{post.pillar}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
