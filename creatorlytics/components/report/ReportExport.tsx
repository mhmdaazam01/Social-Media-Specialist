'use client';

import { Button } from '@/components/ui/button';
import { exportToCSV, exportToJSON } from '@/lib/utils/export';
import { Download } from 'lucide-react';
import type { Post } from '@/types';

interface ReportExportProps {
  posts: Post[];
}

export function ReportExport({ posts }: ReportExportProps) {
  function handleCSV() {
    const data = posts.map(p => ({
      tanggal: p.date,
      nama: p.name,
      platform: p.platform,
      akun: p.account,
      reach: p.reach,
      impression: p.impression,
      like: p.like,
      comment: p.comment,
      share: p.share,
      save: p.save,
      repost: p.repost,
      followers_gained: p.followers_gained,
      pillar: p.pillar,
      format: p.format,
    }));
    exportToCSV(data as Record<string, unknown>[], 'creatorlytics-report');
  }

  function handleJSON() {
    exportToJSON(posts, 'creatorlytics-report');
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handleCSV}>
        <Download className="size-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleJSON}>
        <Download className="size-4" />
        Export JSON
      </Button>
    </div>
  );
}
