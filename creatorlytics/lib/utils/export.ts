import type { Post, Goal, ContentIdea, CalendarEvent, Competitor } from '@/types';

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return String(val ?? '');
  }));
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch { reject(new Error('File JSON tidak valid')); }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

export function postsToCSV(posts: Post[]): void {
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
  exportToCSV(data as unknown as Record<string, unknown>[], 'creatorlytics-posts');
}
