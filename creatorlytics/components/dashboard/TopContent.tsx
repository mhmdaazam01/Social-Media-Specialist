'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { calcER, fmt } from '@/lib/utils/analytics';
import { formatDate } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';
import { Crown, BarChart3 } from 'lucide-react';

export function TopContent() {
  const { posts } = usePosts();
  const { profile } = useUser();
  const { platforms } = usePlatforms();
  const erMode = profile?.er_mode || 'impression';

  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => calcER(b, erMode) - calcER(a, erMode))
      .slice(0, 5);
  }, [posts, erMode]);

  if (topPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown size={18} className="text-muted-foreground" />
            Konten Terbaik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 size={32} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada data postingan
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tambahkan postingan untuk melihat konten terbaik
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
          <Crown size={18} className="text-muted-foreground" />
          Konten Terbaik
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-center">Platform</TableHead>
              <TableHead className="text-center">Tanggal</TableHead>
              <TableHead className="text-right">ER</TableHead>
              <TableHead className="text-right">Interaksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {topPosts.map((post, i) => {
              const er = calcER(post, erMode);
              const platform = platforms.find(p => p.platform_id === post.platform);

              return (
                <TableRow key={post.id}>
                  <TableCell className="text-center text-muted-foreground text-xs">
                    {i + 1}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate font-medium">
                    {post.name || 'Untitled'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px]">{platform?.name || post.platform}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDate(post.date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {er.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {fmt(post.like + post.comment + post.save + post.share)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
