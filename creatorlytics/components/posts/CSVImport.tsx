'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/lib/hooks/usePosts';
import { UploadIcon, DownloadIcon } from 'lucide-react';

interface CSVImportProps {
  onImport: () => void;
}

/**
 * RFC 4180 compliant CSV parser.
 * Handles quoted fields with commas, newlines, and escaped double quotes.
 */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ""
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        current.push(field.trim());
        field = '';
        i++;
      } else if (ch === '\r' || ch === '\n') {
        current.push(field.trim());
        field = '';
        if (current.some(c => c !== '')) {
          rows.push(current);
        }
        current = [];
        // Handle \r\n
        if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          i += 2;
        } else {
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Push last field/row
  current.push(field.trim());
  if (current.some(c => c !== '')) {
    rows.push(current);
  }

  if (rows.length < 2) return [];

  const headers = rows[0];
  const result: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const values = rows[r];
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });
    result.push(row);
  }

  return result;
}

export function CSVImport({ onImport }: CSVImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { importPosts } = usePosts();

  function handleTemplate() {
    const headers = [
      'tanggal',
      'nama',
      'platform',
      'akun',
      'pillar',
      'format',
      'link',
      'impression',
      'reach',
      'like',
      'comment',
      'share',
      'save',
      'repost',
      'followers_gained',
      'caption_len'
    ];
    const sampleRow = [
      '2026-08-24',
      'Tips Membuat Konten Menarik',
      'Instagram',
      'Akun Utama',
      'Edukasi',
      'Reels',
      'https://www.instagram.com/reel/sample',
      '15000',
      '12000',
      '850',
      '120',
      '45',
      '210',
      '15',
      '50',
      '120'
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-konten.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size limit: 5MB (P2-7)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5 MB');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        let text = reader.result as string;
        // Strip UTF-8 BOM if present (P2-7)
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }

        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error('File CSV kosong atau format tidak valid');
          return;
        }

        // Row limit: 2000 rows (P2-7)
        if (rows.length > 2000) {
          toast.error('Maksimal 2.000 baris per file CSV');
          return;
        }

        const safeNum = (val: string | undefined) => {
          if (!val) return 0;
          const cleaned = String(val).replace(/\./g, '').replace(/,/g, '');
          const num = Number(cleaned);
          return isNaN(num) || num < 0 ? 0 : num;
        };

        const posts = rows.map(row => {
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined && row[k] !== '') return row[k];
              const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
            }
            return '';
          };

          return {
            account: getVal('akun', 'account', 'nama_akun'),
            platform: getVal('platform'),
            date: getVal('tanggal', 'date', 'tgl'),
            name: getVal('nama', 'name', 'judul', 'judul_konten', 'title'),
            reach: safeNum(getVal('reach', 'jangkauan')),
            impression: safeNum(getVal('impression', 'impressions', 'impresi')),
            like: safeNum(getVal('like', 'likes', 'suka')),
            comment: safeNum(getVal('comment', 'comments', 'komentar', 'komen')),
            share: safeNum(getVal('share', 'shares', 'bagikan')),
            save: safeNum(getVal('save', 'saves', 'simpan')),
            repost: safeNum(getVal('repost', 'reposts')),
            followers_gained: safeNum(getVal('followers_gained', 'followers', 'follower_baru')),
            profile_visit: safeNum(getVal('profile_visit', 'profile_visits', 'kunjungan_profil')),
            pillar: getVal('pillar', 'pilar', 'content_pillar'),
            format: getVal('format', 'tipe_konten'),
            caption_len: safeNum(getVal('caption_len', 'caption_length', 'panjang_caption')),
            link: getVal('link', 'link_konten', 'url', 'post_link'),
          };
        });

        // Chunked batch imports (100 rows per batch) (P2-7)
        const BATCH_SIZE = 100;
        let totalCount = 0;
        for (let i = 0; i < posts.length; i += BATCH_SIZE) {
          const chunk = posts.slice(i, i + BATCH_SIZE);
          const count = await importPosts(chunk);
          totalCount += count;
        }

        if (totalCount > 0) {
          toast.success(`Berhasil mengimpor ${totalCount} postingan`);
          onImport();
        } else {
          toast.error('Gagal mengimpor data. Cek koneksi dan coba lagi.');
        }
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
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => inputRef.current?.click()}
        className="h-8 rounded-lg border border-cly-border bg-white dark:bg-cly-surface text-cly-text-2 text-xs font-medium hover:bg-cly-muted transition-all flex items-center justify-center gap-1.5 shadow-sm px-3"
      >
        <UploadIcon size={14} className="shrink-0" />
        <span>Import CSV</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleTemplate}
        className="h-8 rounded-lg border border-cly-border bg-white dark:bg-cly-surface text-cly-text-2 text-xs font-medium hover:bg-cly-muted transition-all flex items-center justify-center gap-1.5 shadow-sm px-3"
      >
        <DownloadIcon size={14} className="shrink-0" />
        <span>Template</span>
      </Button>
    </div>
  );
}
