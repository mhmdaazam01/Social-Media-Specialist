'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePostStore } from '@/lib/store/post-store';
import { UploadIcon, DownloadIcon } from 'lucide-react';

interface CSVImportProps {
  onImport: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      result.push(row);
    }
  }
  return result;
}

export function CSVImport({ onImport }: CSVImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { importPosts } = usePostStore();

  function handleTemplate() {
    const headers = ['tanggal', 'nama', 'platform', 'akun', 'reach', 'impression', 'like', 'comment', 'share', 'save', 'repost', 'followers_gained', 'pillar', 'format', 'caption_len', 'link'];
    const blob = new Blob([headers.join(',')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-postingan.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error('File CSV kosong atau format tidak valid');
          return;
        }

        const posts = rows.map(row => ({
          account: row.akun || '',
          platform: row.platform || '',
          date: row.tanggal || '',
          name: row.nama || '',
          reach: Number(row.reach) || 0,
          impression: Number(row.impression) || 0,
          like: Number(row.like) || 0,
          comment: Number(row.comment) || 0,
          share: Number(row.share) || 0,
          save: Number(row.save) || 0,
          repost: Number(row.repost) || 0,
          followers_gained: Number(row.followers_gained) || 0,
          profile_visit: 0,
          pillar: row.pillar || '',
          format: row.format || '',
          caption_len: Number(row.caption_len) || 0,
          link: row.link || '',
        }));

        const count = importPosts(posts);
        toast.success(`Berhasil mengimpor ${count} postingan`);
        onImport();
      } catch {
        toast.error('Gagal membaca file CSV');
      }
    };
    reader.onerror = () => toast.error('Gagal membaca file');
    reader.readAsText(file);

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <UploadIcon />
        Import CSV
      </Button>
      <Button variant="ghost" size="sm" onClick={handleTemplate}>
        <DownloadIcon />
        Template
      </Button>
    </div>
  );
}
