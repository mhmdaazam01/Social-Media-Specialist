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
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error('File CSV kosong atau format tidak valid');
          return;
        }

        const safeNum = (val: string | undefined) => {
          const num = Number(val);
          return isNaN(num) || num < 0 ? 0 : num;
        };

        const posts = rows.map(row => ({
          account: row.akun || '',
          platform: row.platform || '',
          date: row.tanggal || '',
          name: row.nama || '',
          reach: safeNum(row.reach),
          impression: safeNum(row.impression),
          like: safeNum(row.like),
          comment: safeNum(row.comment),
          share: safeNum(row.share),
          save: safeNum(row.save),
          repost: safeNum(row.repost),
          followers_gained: safeNum(row.followers_gained),
          profile_visit: 0,
          pillar: row.pillar || '',
          format: row.format || '',
          caption_len: safeNum(row.caption_len),
          link: row.link || '',
        }));

        const count = await importPosts(posts);
        if (count > 0) {
          toast.success(`Berhasil mengimpor ${count} postingan`);
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
